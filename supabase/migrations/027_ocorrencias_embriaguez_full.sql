-- Migração: Expandir Módulo de Embriaguez com campos técnicos detalhados e ajuste de envolvidos
-- 1. Adicionar colunas técnicas à tabela de ocorrências
ALTER TABLE public.ocorrencias 
ADD COLUMN IF NOT EXISTS etilometro_marca TEXT,
ADD COLUMN IF NOT EXISTS etilometro_serie TEXT,
ADD COLUMN IF NOT EXISTS etilometro_resultado NUMERIC,
ADD COLUMN IF NOT EXISTS etilometro_validade DATE,
ADD COLUMN IF NOT EXISTS etilometro_realizado BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sinais_aparencia TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS sinais_atitude TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS teste_linha_reta TEXT,
ADD COLUMN IF NOT EXISTS teste_um_pe TEXT,
ADD COLUMN IF NOT EXISTS teste_dedo_nariz TEXT,
ADD COLUMN IF NOT EXISTS admitiu_ingestao TEXT,
ADD COLUMN IF NOT EXISTS ingestao_quantidade TEXT,
ADD COLUMN IF NOT EXISTS ingestao_tempo TEXT,
ADD COLUMN IF NOT EXISTS conclusao_tecnica TEXT;

-- 2. Atualizar a constraint de tipos de envolvidos para incluir 'Condutor'
ALTER TABLE public.ocorrencia_envolvidos 
DROP CONSTRAINT IF EXISTS ocorrencia_envolvidos_tipo_check;

ALTER TABLE public.ocorrencia_envolvidos 
ADD CONSTRAINT ocorrencia_envolvidos_tipo_check 
CHECK (tipo IN ('Vítima', 'Suspeito', 'Testemunha', 'Informante', 'Condutor', 'Outro'));

-- 3. Adicionar comentários para documentação
COMMENT ON COLUMN public.ocorrencias.etilometro_resultado IS 'Resultado do teste em mg/L';
COMMENT ON COLUMN public.ocorrencias.sinais_aparencia IS 'Lista de sinais de aparência observados';
COMMENT ON COLUMN public.ocorrencias.sinais_atitude IS 'Lista de sinais de atitude observados';
COMMENT ON COLUMN public.ocorrencias.conclusao_tecnica IS 'Conclusão final do agente sobre o estado do envolvido';
