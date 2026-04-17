-- ============================================================================
-- SCRIPT: FLEXIBILIZAÇÃO DO VALOR DOS PLANOS
-- Permite que o valor mensal aceite qualquer precisão decimal conforme solicitado.
-- ============================================================================

ALTER TABLE public.planos 
ALTER COLUMN valor_mensal TYPE NUMERIC;

-- Comentário: NUMERIC sem escala definida permite precisão arbitrária no PostgreSQL.
