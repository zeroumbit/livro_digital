-- ============================================================================
-- SCRIPT 008: AJUSTE DE COLUNAS DE OCORRÊNCIAS
-- Garante que as colunas necessárias para o fluxo multi-step existam.
-- ============================================================================

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ocorrencias' AND column_name='tipo_origem') THEN
        ALTER TABLE public.ocorrencias ADD COLUMN tipo_origem TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ocorrencias' AND column_name='titulo') THEN
        ALTER TABLE public.ocorrencias ADD COLUMN titulo TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ocorrencias' AND column_name='cidade') THEN
        ALTER TABLE public.ocorrencias ADD COLUMN cidade TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ocorrencias' AND column_name='estado') THEN
        ALTER TABLE public.ocorrencias ADD COLUMN estado TEXT;
    END IF;
END $$;
