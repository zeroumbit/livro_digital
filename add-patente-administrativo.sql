-- Script para adicionar a patente "Administrativo"
-- Execute este script no Supabase Dashboard > SQL Editor

-- Opção 1: Inserir para uma instituição específica (substitua o UUID abaixo)
/*
INSERT INTO patentes (instituicao_id, nome, ordem, ativo)
VALUES 
  ('SUBSTITUA_PELO_ID_DA_INSTITUICAO', 'Administrativo', 100, true)
ON CONFLICT DO NOTHING;
*/

-- Opção 2: Inserir para todas as instituições existentes
INSERT INTO patentes (instituicao_id, nome, ordem, ativo)
SELECT 
  i.id as instituicao_id,
  'Administrativo' as nome,
  100 as ordem,
  true as ativo
FROM instituicoes i
WHERE NOT EXISTS (
  SELECT 1 FROM patentes p 
  WHERE p.instituicao_id = i.id 
  AND p.nome = 'Administrativo'
);

-- Verificar se foi inserido
SELECT * FROM patentes WHERE nome = 'Administrativo';
