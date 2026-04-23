-- Migration: Adicionar suporte ao Módulo de Embriaguez
ALTER TABLE public.ocorrencias 
ADD COLUMN IF NOT EXISTS natureza_alteracao TEXT 
CHECK (natureza_alteracao IN ('Álcool', 'Drogas Ilícitas', 'Crise Psiquiátrica (sem álcool ou drogas)', 'Abstinência', 'Causa Médica (diabetes, AVC, epilepsia)'));

-- Comentário para documentação técnica
COMMENT ON COLUMN public.ocorrencias.natureza_alteracao IS 'Campo especializado para o módulo de constatação de embriaguez.';
