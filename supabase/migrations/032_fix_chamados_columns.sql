-- Migration 032: Garantir colunas de origem na tabela de chamados
-- O erro PGRST204 indica que a coluna 'origem' não foi encontrada.

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chamados' AND column_name='origem') THEN
        ALTER TABLE public.chamados ADD COLUMN origem TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chamados' AND column_name='tipo_origem') THEN
        ALTER TABLE public.chamados ADD COLUMN tipo_origem TEXT;
    END IF;
END $$;
