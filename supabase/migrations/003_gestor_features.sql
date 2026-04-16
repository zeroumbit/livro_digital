-- ============================================================================
-- ATUALIZAÇÃO: CONFIGURAÇÕES LOCAIS DO GESTOR
-- ============================================================================

-- Adiciona campo de configurações na tabela de instituições
-- Aqui guardaremos nomenclaturas personalizadas, ativação de módulos, etc.
ALTER TABLE public.instituicoes
ADD COLUMN IF NOT EXISTS configuracoes_locais JSONB DEFAULT '{
    "nomenclaturas": {
        "gcm": "GCM",
        "comando": "Comando",
        "operacional": "Operacional",
        "administrativo": "Administrativo"
    },
    "modulos": {
        "financeiro": true,
        "vistorias": true,
        "escalas": true
    },
    "identidade": {
        "logo_url": null,
        "cor_primaria": "#4f46e5"
    }
}'::jsonb;

-- Criação da tabela de Auditoria Local (Específica da Instituição)
-- Diferente da saas_auditoria, esta é focada nas ações operacionais internas.
CREATE TABLE IF NOT EXISTS public.auditoria_local (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instituicao_id UUID REFERENCES public.instituicoes(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.usuarios(id),
    acao TEXT NOT NULL,
    descricao TEXT,
    metadados JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS na auditoria local
ALTER TABLE public.auditoria_local ENABLE ROW LEVEL SECURITY;

-- Política de Tenant para Auditoria Local
DROP POLICY IF EXISTS "Isolamento de Tenant - Auditoria Local" ON public.auditoria_local;
CREATE POLICY "Isolamento de Tenant - Auditoria Local" ON public.auditoria_local FOR SELECT 
    USING (instituicao_id = (SELECT instituicao_id FROM public.usuarios WHERE id = auth.uid()));

-- Apenas Gestores e Super Admins podem ver a auditoria local (GCM básico não)
-- Nota: A política acima já garante o isolamento. Vamos restringir por perfil via app ou política adicional.
DROP POLICY IF EXISTS "Gestor_Visualiza_Auditoria_Local" ON public.auditoria_local;
CREATE POLICY "Gestor_Visualiza_Auditoria_Local" ON public.auditoria_local FOR SELECT 
    USING (
        instituicao_id = (SELECT instituicao_id FROM public.usuarios WHERE id = auth.uid()) AND
        ((SELECT perfil_acesso FROM public.usuarios WHERE id = auth.uid()) IN ('gestor', 'super_admin'))
    );
