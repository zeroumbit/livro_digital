-- ============================================================================
-- MIGRAÇÃO 040: REFINAMENTO DE RLS POR CARGO (PRIVACIDADE DE DADOS)
-- Garante que usuários comuns (GCM) vejam apenas suas próprias informações.
-- ============================================================================

-- 1. Políticas para Ocorrências
DROP POLICY IF EXISTS "Tenant_Isolation_ocorrencias" ON public.ocorrencias;
DROP POLICY IF EXISTS "005_tenant_isolation_ocorrencias" ON public.ocorrencias;
CREATE POLICY "ocorrencias_role_based_access" ON public.ocorrencias
    FOR SELECT USING (
        (instituicao_id = public.get_my_institution()) AND (
            public.get_my_perfil() IN ('secretario', 'gestor', 'comandante_geral', 'administrativo', 'chefe_equipe', 'operador_radio') OR 
            criador_id = auth.uid()
        )
    );

CREATE POLICY "ocorrencias_role_based_insert" ON public.ocorrencias
    FOR INSERT WITH CHECK (
        (instituicao_id = public.get_my_institution()) AND (
            public.get_my_perfil() NOT IN ('administrativo', 'gestor_financeiro') -- Secretários, Gestores e GCMs podem criar
        )
    );

-- 2. Políticas para Usuários (Ver apenas a si mesmo ou equipe se não for gestor)
DROP POLICY IF EXISTS "Usuarios_Isolation" ON public.usuarios;
DROP POLICY IF EXISTS "005_self_view_usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "005_gestor_instituicao_usuarios" ON public.usuarios;
CREATE POLICY "usuarios_role_based_access" ON public.usuarios
    FOR SELECT USING (
        (instituicao_id = public.get_my_institution()) AND (
            public.get_my_perfil() IN ('secretario', 'gestor', 'comandante_geral', 'administrativo', 'gestor_financeiro', 'chefe_equipe') OR 
            id = auth.uid()
        )
    );

-- 3. Políticas para Escalas (GCM vê apenas sua própria escala)
DROP POLICY IF EXISTS "Tenant_Isolation_escalas" ON public.escalas;
CREATE POLICY "escalas_role_based_access" ON public.escalas
    FOR SELECT USING (
        (instituicao_id = public.get_my_institution()) AND (
            public.get_my_perfil() IN ('secretario', 'gestor', 'comandante_geral', 'administrativo', 'chefe_equipe', 'gestor_financeiro') OR
            EXISTS (
                SELECT 1 FROM public.escala_agentes 
                WHERE escala_id = public.escalas.id AND usuario_id = auth.uid()
            )
        )
    );

-- 4. Políticas para Chamados
DROP POLICY IF EXISTS "Tenant_Isolation_chamados" ON public.chamados;
CREATE POLICY "chamados_role_based_access" ON public.chamados
    FOR SELECT USING (
        (instituicao_id = public.get_my_institution()) AND (
            public.get_my_perfil() IN ('secretario', 'gestor', 'comandante_geral', 'operador_radio', 'chefe_equipe', 'administrativo') OR 
            criador_id = auth.uid()
        )
    );

-- 5. Políticas para Abastecimentos
DROP POLICY IF EXISTS "Tenant_Isolation_abastecimentos" ON public.abastecimentos;
CREATE POLICY "abastecimentos_role_based_access" ON public.abastecimentos
    FOR SELECT USING (
        (instituicao_id = public.get_my_institution()) AND (
            public.get_my_perfil() IN ('secretario', 'gestor', 'comandante_geral', 'gestor_financeiro', 'administrativo') OR 
            usuario_id = auth.uid()
        )
    );
