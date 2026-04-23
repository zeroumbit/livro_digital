-- Migration: Adicionar origem aos chamados
ALTER TABLE public.chamados 
ADD COLUMN IF NOT EXISTS origem TEXT;

ALTER TABLE public.chamados 
ADD COLUMN IF NOT EXISTS tipo_origem TEXT;