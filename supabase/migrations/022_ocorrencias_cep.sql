-- Migration: Adicionar CEP à tabela de ocorrências
ALTER TABLE public.ocorrencias 
ADD COLUMN IF NOT EXISTS cep TEXT;

-- Comentário para documentação técnica
COMMENT ON COLUMN public.ocorrencias.cep IS 'Código de Endereçamento Postal do local do fato.';
