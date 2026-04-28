-- ============================================================================
-- MIGRATION: Adiciona campos detalhados do gestor (secretário) na tabela instituicoes
-- ============================================================================

-- 1. Adicionar novas colunas para dados do gestor
ALTER TABLE public.instituicoes 
  ADD COLUMN IF NOT EXISTS gestor_nome_completo TEXT,
  ADD COLUMN IF NOT EXISTS gestor_como_chamado TEXT,
  ADD COLUMN IF NOT EXISTS gestor_telefone TEXT,
  ADD COLUMN IF NOT EXISTS gestor_email TEXT;

-- 2. Comentários para documentação
COMMENT ON COLUMN public.instituicoes.gestor_nome_completo IS 'Nome completo do secretário responsável';
COMMENT ON COLUMN public.instituicoes.gestor_como_chamado IS 'Como o secretário prefere ser chamado';
COMMENT ON COLUMN public.instituicoes.gestor_telefone IS 'Telefone/WhatsApp do secretário';
COMMENT ON COLUMN public.instituicoes.gestor_email IS 'E-mail institucional do secretário';
