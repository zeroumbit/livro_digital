-- Migration: Correção de paridade e colunas faltantes nas ocorrências
-- Garante que todas as colunas utilizadas no formulário multi-step existam no banco.

DO $$ 
BEGIN 
    -- 1. Colunas de Origem e Canal
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ocorrencias' AND column_name='tipo_origem') THEN
        ALTER TABLE public.ocorrencias ADD COLUMN tipo_origem TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ocorrencias' AND column_name='canal_origem') THEN
        ALTER TABLE public.ocorrencias ADD COLUMN canal_origem TEXT;
    END IF;

    -- 2. Metadados e Controle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ocorrencias' AND column_name='titulo') THEN
        ALTER TABLE public.ocorrencias ADD COLUMN titulo TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ocorrencias' AND column_name='categoria') THEN
        ALTER TABLE public.ocorrencias ADD COLUMN categoria TEXT DEFAULT 'padrao';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ocorrencias' AND column_name='ultimo_passo') THEN
        ALTER TABLE public.ocorrencias ADD COLUMN ultimo_passo INTEGER DEFAULT 1;
    END IF;

    -- 3. Localização Avançada
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ocorrencias' AND column_name='cep') THEN
        ALTER TABLE public.ocorrencias ADD COLUMN cep TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ocorrencias' AND column_name='cidade') THEN
        ALTER TABLE public.ocorrencias ADD COLUMN cidade TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ocorrencias' AND column_name='estado') THEN
        ALTER TABLE public.ocorrencias ADD COLUMN estado TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ocorrencias' AND column_name='natureza_alteracao') THEN
        ALTER TABLE public.ocorrencias ADD COLUMN natureza_alteracao TEXT;
    END IF;

    -- 4. Fotos (se ainda não existir)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ocorrencias' AND column_name='fotos') THEN
        ALTER TABLE public.ocorrencias ADD COLUMN fotos TEXT[] DEFAULT '{}';
    END IF;

END $$;

-- Comentários técnicos
COMMENT ON COLUMN public.ocorrencias.tipo_origem IS 'Descrição do canal de entrada (ex: Telefone, Rádio).';
COMMENT ON COLUMN public.ocorrencias.canal_origem IS 'Alias para tipo_origem para compatibilidade legada.';
