-- ============================================================================
-- SCRIPT SUPABASE: ESTRUTURA DO SUPER ADMIN (GESTÃO DO SAAS)
-- Este script cria a base de dados para alimentar os painéis de controlo do SaaS.
-- ============================================================================

-- ============================================================================
-- 1. ECRÃ: PLANOS (Criar, Editar, Excluir, Ativar, Inativar)
-- ============================================================================
-- Como a tabela 'planos' já foi criada na init_schema, adicionamos a coluna 'status'
ALTER TABLE public.planos 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo'));

-- ============================================================================
-- 2. ECRÃ: INSTITUIÇÕES (Aprovar, Suspender, Ativar)
-- ============================================================================
-- Como a tabela 'instituicoes' já foi criada, adicionamos as colunas de suspensão e ativação
ALTER TABLE public.instituicoes
ADD COLUMN IF NOT EXISTS motivo_suspensao TEXT,
ADD COLUMN IF NOT EXISTS data_ativacao TIMESTAMPTZ;

-- ============================================================================
-- 3. ECRÃ: ASSINATURAS (Gestão de Faturamento e Contratos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.assinaturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instituicao_id UUID REFERENCES public.instituicoes(id) ON DELETE CASCADE,
    plano_id UUID REFERENCES public.planos(id),
    status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'atrasada', 'cancelada', 'trial')),
    data_inicio TIMESTAMPTZ NOT NULL DEFAULT now(),
    data_vencimento TIMESTAMPTZ,
    valor_pago DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 4. ECRÃ: SUPORTE (Tickets abertos pelas instituições)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.saas_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instituicao_id UUID REFERENCES public.instituicoes(id) ON DELETE CASCADE,
    aberto_por UUID, -- Referência ao auth.users ou public.usuarios
    assunto TEXT NOT NULL,
    descricao TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_analise', 'respondido', 'fechado')),
    prioridade TEXT NOT NULL DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.saas_ticket_mensagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.saas_tickets(id) ON DELETE CASCADE,
    remetente_id UUID, -- Pode ser o Gestor ou o Super Admin
    mensagem TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT false, -- True se foi o Super Admin que respondeu
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 5. ECRÃ: CONFIGURAÇÕES (Variáveis globais do SaaS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.saas_configuracoes (
    chave TEXT PRIMARY KEY, -- Ex: 'manutencao_global', 'dias_trial'
    valor JSONB NOT NULL,
    descricao TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 6. ECRÃ: AUDITORIA (Logs transacionais do Super Admin)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.saas_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL, -- ID do Super Admin que executou a ação
    acao TEXT NOT NULL, -- Ex: 'SUSPENDER_INSTITUICAO', 'CRIAR_PLANO'
    tabela_afetada TEXT NOT NULL,
    registro_id UUID,
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 7. POLÍTICAS DE SEGURANÇA (RLS) RIGOROSAS
-- ============================================================================
-- Habilitar RLS
ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_ticket_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_auditoria ENABLE ROW LEVEL SECURITY;

-- Limpeza de políticas existentes (Idempotência)
DROP POLICY IF EXISTS "SuperAdmin_Acesso_Total_Planos" ON public.planos;
DROP POLICY IF EXISTS "SuperAdmin_Acesso_Total_Instituicoes" ON public.instituicoes;
DROP POLICY IF EXISTS "SuperAdmin_Acesso_Total_Assinaturas" ON public.assinaturas;
DROP POLICY IF EXISTS "SuperAdmin_Acesso_Total_Tickets" ON public.saas_tickets;
DROP POLICY IF EXISTS "SuperAdmin_Acesso_Total_Mensagens" ON public.saas_ticket_mensagens;
DROP POLICY IF EXISTS "SuperAdmin_Acesso_Total_Config" ON public.saas_configuracoes;
DROP POLICY IF EXISTS "SuperAdmin_Acesso_Total_Auditoria" ON public.saas_auditoria;
DROP POLICY IF EXISTS "Leitura_Publica_Planos" ON public.planos;
DROP POLICY IF EXISTS "Gestor_Visualiza_Sua_Instituicao" ON public.instituicoes;
DROP POLICY IF EXISTS "Gestor_Visualiza_Suas_Assinaturas" ON public.assinaturas;
DROP POLICY IF EXISTS "Gestor_Gere_Seus_Tickets" ON public.saas_tickets;

-- 7.1 Políticas do Super Admin
-- Utiliza extração super rápida do JWT para verificar se é super_admin
CREATE OR REPLACE FUNCTION is_super_admin() RETURNS BOOLEAN AS $$
  SELECT COALESCE((current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'perfil_acesso'), '') = 'super_admin';
$$ LANGUAGE sql STABLE;

-- O Super Admin tem acesso TOTAL (ALL) a todas as tabelas do SaaS
CREATE POLICY "SuperAdmin_Acesso_Total_Planos" ON public.planos FOR ALL USING (is_super_admin());
CREATE POLICY "SuperAdmin_Acesso_Total_Instituicoes" ON public.instituicoes FOR ALL USING (is_super_admin());
CREATE POLICY "SuperAdmin_Acesso_Total_Assinaturas" ON public.assinaturas FOR ALL USING (is_super_admin());
CREATE POLICY "SuperAdmin_Acesso_Total_Tickets" ON public.saas_tickets FOR ALL USING (is_super_admin());
CREATE POLICY "SuperAdmin_Acesso_Total_Mensagens" ON public.saas_ticket_mensagens FOR ALL USING (is_super_admin());
CREATE POLICY "SuperAdmin_Acesso_Total_Config" ON public.saas_configuracoes FOR ALL USING (is_super_admin());
CREATE POLICY "SuperAdmin_Acesso_Total_Auditoria" ON public.saas_auditoria FOR ALL USING (is_super_admin());

-- 7.2 Políticas de Leitura Pública/Tenant
-- Os utilizadores normais podem VER os planos ativos (para a página de registo, por exemplo)
CREATE POLICY "Leitura_Publica_Planos" ON public.planos FOR SELECT USING (status = 'ativo');

-- Um gestor pode VER e EDITAR (parcialmente) apenas a sua própria instituição
CREATE POLICY "Gestor_Visualiza_Sua_Instituicao" ON public.instituicoes FOR SELECT 
    USING (gestor_user_id = auth.uid());

-- Um gestor pode VER as suas assinaturas e os seus tickets de suporte
CREATE POLICY "Gestor_Visualiza_Suas_Assinaturas" ON public.assinaturas FOR SELECT 
    USING (instituicao_id IN (SELECT id FROM public.instituicoes WHERE gestor_user_id = auth.uid()));

CREATE POLICY "Gestor_Gere_Seus_Tickets" ON public.saas_tickets FOR ALL 
    USING (instituicao_id IN (SELECT id FROM public.instituicoes WHERE gestor_user_id = auth.uid()));

-- ============================================================================
-- 8. TRIGGERS E FUNÇÕES (Automatizações do SaaS)
-- ============================================================================

-- Trigger para registar automaticamente na Auditoria sempre que uma Instituição mudar de Status (Ex: Suspensa)
CREATE OR REPLACE FUNCTION log_instituicao_status_change() RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status_assinatura IS DISTINCT FROM NEW.status_assinatura THEN
        INSERT INTO public.saas_auditoria (admin_id, acao, tabela_afetada, registro_id, dados_anteriores, dados_novos)
        VALUES (
            auth.uid(), 
            'ALTERAR_STATUS_INSTITUICAO', 
            'instituicoes', 
            NEW.id, 
            jsonb_build_object('status', OLD.status_assinatura), 
            jsonb_build_object('status', NEW.status_assinatura, 'motivo', NEW.motivo_suspensao)
        );
        
        -- Se foi ativada, regista a data de ativação
        IF NEW.status_assinatura = 'ativa' AND OLD.status_assinatura = 'pendente' THEN
            NEW.data_ativacao = now();
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_audit_instituicao_status ON public.instituicoes;
CREATE TRIGGER tr_audit_instituicao_status
    BEFORE UPDATE ON public.instituicoes
    FOR EACH ROW EXECUTE FUNCTION log_instituicao_status_change();

-- ============================================================================
-- 9. DADOS INICIAIS (SEED)
-- ============================================================================

INSERT INTO public.saas_configuracoes (chave, valor, descricao) VALUES 
('manutencao_global', 'false', 'Se true, bloqueia o acesso a todos os tenants e exibe ecrã de manutenção'),
('dias_trial', '14', 'Quantidade de dias de teste gratuito para novas instituições')
ON CONFLICT (chave) DO NOTHING;

-- Como os planos já foram inseridos, garantimos as atualizações pros campos modulos_ativos
UPDATE public.planos SET modulos_ativos = '["ocorrencias", "chamados"]' WHERE nome = 'Básico';
UPDATE public.planos SET modulos_ativos = '["ocorrencias", "chamados", "veiculos", "escalas", "auditoria"]' WHERE nome = 'Profissional';
UPDATE public.planos SET modulos_ativos = '["ocorrencias", "chamados", "veiculos", "escalas", "combustivel", "auditoria", "api"]' WHERE nome = 'Enterprise';
