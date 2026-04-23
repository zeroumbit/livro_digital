-- Migration: Adicionar categoria às ocorrências para diferenciação técnica
-- Tipos: 'padrao', 'maria_da_penha', 'embriaguez'

ALTER TABLE public.ocorrencias 
ADD COLUMN IF NOT EXISTS categoria TEXT NOT NULL DEFAULT 'padrao' 
CHECK (categoria IN ('padrao', 'maria_da_penha', 'embriaguez', 'chamados'));


-- Criar índice para performance em filtros por categoria
CREATE INDEX IF NOT EXISTS idx_ocorrencias_categoria ON public.ocorrencias(categoria);
