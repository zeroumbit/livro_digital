-- ============================================
-- ISOLAMENTO DE TABELAS POR TIPO DE OCORRÊNCIA
-- Garantir que cada tabela só acesse seus próprios dados
-- ============================================

-- 1. Políticas RLS para tabela 'ocorrencias' (Padrão)
ALTER TABLE ocorrencias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem apenas ocorrências da sua instituição" ON ocorrencias;
CREATE POLICY "Usuários veem apenas ocorrências da sua instituição" 
ON ocorrencias FOR ALL 
TO authenticated 
USING (instituicao_id = (SELECT instituicao_id FROM usuarios WHERE id = auth.uid() LIMIT 1));

-- 2. Políticas RLS para tabela 'embriaguez'
ALTER TABLE embriaguez ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem apenas embriaguez da sua instituição" ON embriaguez;
CREATE POLICY "Usuários veem apenas embriaguez da sua instituição" 
ON embriaguez FOR ALL 
TO authenticated 
USING (instituicao_id = (SELECT instituicao_id FROM usuarios WHERE id = auth.uid() LIMIT 1));

-- 3. Políticas RLS para tabela 'maria_da_penha'
ALTER TABLE maria_da_penha ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem apenas maria_da_penha da sua instituição" ON maria_da_penha;
CREATE POLICY "Usuários veem apenas maria_da_penha da sua instituição" 
ON maria_da_penha FOR ALL 
TO authenticated 
USING (instituicao_id = (SELECT instituicao_id FROM usuarios WHERE id = auth.uid() LIMIT 1));

-- 4. Políticas RLS para tabela 'chamados_ocorrencias'
ALTER TABLE chamados_ocorrencias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem apenas chamados_ocorrencias da sua instituição" ON chamados_ocorrencias;
CREATE POLICY "Usuários veem apenas chamados_ocorrencias da sua instituição" 
ON chamados_ocorrencias FOR ALL 
TO authenticated 
USING (instituicao_id = (SELECT instituicao_id FROM usuarios WHERE id = auth.uid() LIMIT 1));

-- 5. Verificar se as tabelas estão isoladas (não há referências cruzadas)
-- Se houver alguma ocorrência na tabela errada, corrigir aqui:
/*
UPDATE ocorrencias 
SET categoria = 'padrao' 
WHERE categoria != 'padrao' OR categoria IS NULL;

-- Remover registros de outros tipos das tabelas erradas (se houver)
DELETE FROM ocorrencias 
WHERE id IN (
  SELECT id FROM embriaguez 
  UNION 
  SELECT id FROM maria_da_penha 
  UNION 
  SELECT id FROM chamados_ocorrencias
);
*/

-- 6. Criar índices para melhorar performance das consultas por instituicao_id
CREATE INDEX IF NOT EXISTS idx_ocorrencias_instituicao_id ON ocorrencias(instituicao_id);
CREATE INDEX IF NOT EXISTS idx_embriaguez_instituicao_id ON embriaguez(instituicao_id);
CREATE INDEX IF NOT EXISTS idx_maria_da_penha_instituicao_id ON maria_da_penha(instituicao_id);
CREATE INDEX IF NOT EXISTS idx_chamados_ocorrencias_instituicao_id ON chamados_ocorrencias(instituicao_id);

-- ============================================
-- TESTE DE ISOLAMENTO (Execute para verificar)
-- ============================================
/*
-- Como usuário logado, testar se só vê dados da sua tabela:
SELECT 'ocorrencias' as tabela, count(*) as total 
FROM ocorrencias 
WHERE instituicao_id = (SELECT instituicao_id FROM usuarios WHERE id = auth.uid() LIMIT 1)

UNION ALL

SELECT 'embriaguez' as tabela, count(*) as total 
FROM embriaguez 
WHERE instituicao_id = (SELECT instituicao_id FROM usuarios WHERE id = auth.uid() LIMIT 1)

UNION ALL

SELECT 'maria_da_penha' as tabela, count(*) as total 
FROM maria_da_penha 
WHERE instituicao_id = (SELECT instituicao_id FROM usuarios WHERE id = auth.uid() LIMIT 1)

UNION ALL

SELECT 'chamados_ocorrencias' as tabela, count(*) as total 
FROM chamados_ocorrencias 
WHERE instituicao_id = (SELECT instituicao_id FROM usuarios WHERE id = auth.uid() LIMIT 1);
*/
