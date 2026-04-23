-- Migration: Adicionar Cidade e Estado às ocorrências
ALTER TABLE public.ocorrencias 
ADD COLUMN IF NOT EXISTS cidade TEXT,
ADD COLUMN IF NOT EXISTS estado TEXT;

-- Comentário para documentação técnica
COMMENT ON COLUMN public.ocorrencias.cidade IS 'Cidade do local do fato.';
COMMENT ON COLUMN public.ocorrencias.estado IS 'Estado do local do fato.';
