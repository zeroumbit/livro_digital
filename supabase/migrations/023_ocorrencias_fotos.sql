-- Migration: Suporte a fotos nas ocorrências
ALTER TABLE public.ocorrencias 
ADD COLUMN IF NOT EXISTS fotos TEXT[] DEFAULT '{}';

-- Comentário para documentação técnica
COMMENT ON COLUMN public.ocorrencias.fotos IS 'URLs das evidências fotográficas armazenadas no Supabase Storage.';
