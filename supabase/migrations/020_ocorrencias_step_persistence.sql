-- Migration: Adicionar controle de passo e melhorar rascunhos
ALTER TABLE public.ocorrencias 
ADD COLUMN IF NOT EXISTS ultimo_passo INTEGER DEFAULT 1;

-- Garantir que o autosave seja eficiente
CREATE INDEX IF NOT EXISTS idx_ocorrencias_status_id ON public.ocorrencias(id, status);
