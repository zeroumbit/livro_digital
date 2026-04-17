-- ============================================================================
-- SCRIPT: AJUSTE DO SCHEMA DE INSTITUIÇÕES (DASHBOARD & SETUP)
-- Resolve o erro 400 ao atualizar status_assinatura e configuracoes_locais.
-- ============================================================================

-- 1. Expandir o CHECK constraint de status_assinatura para incluir 'trial' e 'expirada'
ALTER TABLE public.instituicoes 
DROP CONSTRAINT IF EXISTS instituicoes_status_assinatura_check;

ALTER TABLE public.instituicoes 
ADD CONSTRAINT instituicoes_status_assinatura_check 
CHECK (status_assinatura IN ('pendente', 'trial', 'ativa', 'suspensa', 'cancelada', 'expirada'));

-- 2. Adicionar coluna configuracoes_locais se não existir
ALTER TABLE public.instituicoes 
ADD COLUMN IF NOT EXISTS configuracoes_locais JSONB DEFAULT '{}';

-- 3. Atualizar instituições existentes para terem um objeto JSON vazio em vez de NULL
UPDATE public.instituicoes 
SET configuracoes_locais = '{}' 
WHERE configuracoes_locais IS NULL;
