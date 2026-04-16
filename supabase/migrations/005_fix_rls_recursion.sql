-- ============================================================================
-- SCRIPT 005: CORREÇÃO DEFINITIVA DE RLS (SEM RECURSÃO) E ISOLAMENTO
-- Resolve o erro 500 e garante que cada perfil veja apenas o que deve.
-- ============================================================================

-- 1. Funções de Apoio (SECURITY DEFINER para bypassar RLS e evitar loops)
CREATE OR REPLACE FUNCTION public.get_my_perfil()
RETURNS TEXT AS $$
    SELECT perfil_acesso FROM public.usuarios WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_my_institution()
RETURNS UUID AS $$
    SELECT instituicao_id FROM public.usuarios WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Limpeza de Políticas Antigas
DROP POLICY IF EXISTS "Super Admin - Acesso Total Usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Super Admin - Acesso Total Instituicoes" ON public.instituicoes;
DROP POLICY IF EXISTS "Isolamento de Tenant - Usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Isolamento de Tenant - Instituicoes" ON public.instituicoes;
DROP POLICY IF EXISTS "Super Admin - Acesso Total Ocorrencias" ON public.ocorrencias;
DROP POLICY IF EXISTS "Isolamento de Tenant - Ocorrencias" ON public.ocorrencias;

-- 3. Políticas para USUÁRIOS (public.usuarios)
-- Super Admin vê tudo
CREATE POLICY "005_super_admin_all_usuarios" ON public.usuarios 
FOR ALL USING (public.get_my_perfil() = 'super_admin');

-- Gestor vê apenas membros da sua instituição
CREATE POLICY "005_gestor_instituicao_usuarios" ON public.usuarios 
FOR ALL USING (
    instituicao_id = public.get_my_institution() 
    AND public.get_my_perfil() = 'gestor'
);

-- Operador (GCM) vê apenas a si mesmo
CREATE POLICY "005_self_view_usuarios" ON public.usuarios 
FOR SELECT USING (id = auth.uid());


-- 4. Políticas para INSTITUIÇÕES (public.instituicoes)
-- Super Admin vê e gere tudo
CREATE POLICY "005_super_admin_all_instituicoes" ON public.instituicoes 
FOR ALL USING (public.get_my_perfil() = 'super_admin');

-- Gestor vê apenas a sua própria instituição
CREATE POLICY "005_gestor_own_instituicao" ON public.instituicoes 
FOR SELECT USING (id = public.get_my_institution());


-- 5. Políticas para OCORRÊNCIAS (public.ocorrencias)
-- Super Admin tem visão global (Audit)
CREATE POLICY "005_super_admin_view_ocorrencias" ON public.ocorrencias 
FOR SELECT USING (public.get_my_perfil() = 'super_admin');

-- Membros da instituição vêem suas ocorrências
CREATE POLICY "005_tenant_isolation_ocorrencias" ON public.ocorrencias 
FOR ALL USING (instituicao_id = public.get_my_institution());

-- 6. Garantir que a tabela de Planos seja legível por todos (para o cadastro/wizard)
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Planos são visíveis para todos" ON public.planos;
CREATE POLICY "005_planos_public_view" ON public.planos FOR SELECT USING (true);

-- 7. Forçar o Master Admin (Sincronização Final)
UPDATE public.usuarios 
SET perfil_acesso = 'super_admin', instituicao_id = NULL 
WHERE email = 'zeroumbit@gmail.com';
