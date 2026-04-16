-- ============================================================================
-- SCRIPT 006: GESTÃO DE PLANOS E PROPOSTAS DE ASSINATURA
-- Cria a estrutura para o fluxo de troca de planos Super Admin <-> Gestor.
-- ============================================================================

-- 1. Garantir campos extras na tabela planos
ALTER TABLE public.planos 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
ADD COLUMN IF NOT EXISTS modulos_ativos JSONB DEFAULT '[]';

-- 2. Tabela de Propostas de Assinatura (Vínculo de Planos)
CREATE TABLE IF NOT EXISTS public.assinaturas_propostas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instituicao_id UUID REFERENCES public.instituicoes(id) ON DELETE CASCADE,
    plano_novo_id UUID REFERENCES public.planos(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES public.usuarios(id),
    status TEXT NOT NULL DEFAULT 'aguardando_gestor' CHECK (status IN ('aguardando_gestor', 'aprovado', 'recusado')),
    observacao TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    responded_at TIMESTAMPTZ
);

-- 3. Tabela de Auditoria do SaaS (Conforme especificado)
CREATE TABLE IF NOT EXISTS public.saas_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES public.usuarios(id),
    acao TEXT NOT NULL,
    detalhes JSONB,
    entidade_tipo TEXT, -- Ex: 'plano', 'instituicao', 'proposta'
    entidade_id UUID,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Segurança (RLS)
ALTER TABLE public.assinaturas_propostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_auditoria ENABLE ROW LEVEL SECURITY;

-- Super Admin: Acesso total a propostas e auditoria
CREATE POLICY "006_super_admin_all_propostas" ON public.assinaturas_propostas FOR ALL USING (public.is_super_admin());
CREATE POLICY "006_super_admin_all_auditoria" ON public.saas_auditoria FOR ALL USING (public.is_super_admin());

-- Gestor: Vê propostas da sua própria instituição e pode atualizar status para 'aprovado' ou 'recusado'
CREATE POLICY "006_gestor_view_propostas" ON public.assinaturas_propostas FOR SELECT USING (instituicao_id = public.get_my_institution());
CREATE POLICY "006_gestor_update_propostas" ON public.assinaturas_propostas 
FOR UPDATE USING (
    instituicao_id = public.get_my_institution() 
    AND status = 'aguardando_gestor'
)
WITH CHECK (
    status IN ('aprovado', 'recusado')
);

-- 5. Trigger para Atualização Automática de Plano ao Aprovar
CREATE OR REPLACE FUNCTION public.processar_aprovacao_assinatura()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'aprovado' AND OLD.status = 'aguardando_gestor' THEN
        -- 1. Atualiza o plano na tabela de instituições
        UPDATE public.instituicoes 
        SET plano_id = NEW.plano_novo_id 
        WHERE id = NEW.instituicao_id;
        
        -- 2. Define a data de resposta
        NEW.responded_at := now();
    END IF;
    
    IF NEW.status = 'recusado' AND OLD.status = 'aguardando_gestor' THEN
        NEW.responded_at := now();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_aprovacao_assinatura ON public.assinaturas_propostas;
CREATE TRIGGER trigger_aprovacao_assinatura 
    BEFORE UPDATE ON public.assinaturas_propostas
    FOR EACH ROW EXECUTE FUNCTION public.processar_aprovacao_assinatura();
