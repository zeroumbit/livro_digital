-- ============================================
-- POLÍTICAS RLS PARA ISOLAMENTO TOTAL
-- Garantir que cada tabela só acesse seus próprios dados
-- Execute no SQL Editor do Supabase
-- ============================================

-- 1. Tabela: ocorrencias (Padrão)
ALTER TABLE ocorrencias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem apenas ocorrências da sua instituição" ON ocorrencias;
CREATE POLICY "Usuários veem apenas ocorrências da sua instituição" 
ON ocorrencias FOR ALL 
TO authenticated 
USING (
  instituicao_id = (
    SELECT instituicao_id 
    FROM usuarios 
    WHERE id = auth.uid() 
    LIMIT 1
  )
);

DROP POLICY IF EXISTS "Usuários inserem apenas na sua instituição" ON ocorrencias;
CREATE POLICY "Usuários inserem apenas na sua instituição" 
ON ocorrencias FOR INSERT 
TO authenticated 
WITH CHECK (
  instituicao_id = (
    SELECT instituicao_id 
    FROM usuarios 
    WHERE id = auth.uid() 
    LIMIT 1
  )
);

-- 2. Tabela: embriaguez
ALTER TABLE embriaguez ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem apenas embriaguez da sua instituição" ON embriaguez;
CREATE POLICY "Usuários veem apenas embriaguez da sua instituição" 
ON embriaguez FOR ALL 
TO authenticated 
USING (
  instituicao_id = (
    SELECT instituicao_id 
    FROM usuarios 
    WHERE id = auth.uid() 
    LIMIT 1
  )
);

DROP POLICY IF EXISTS "Usuários inserem apenas embriaguez na sua instituição" ON embriaguez;
CREATE POLICY "Usuários inserem apenas embriaguez na sua instituição" 
ON embriaguez FOR INSERT 
TO authenticated 
WITH CHECK (
  instituicao_id = (
    SELECT instituicao_id 
    FROM usuarios 
    WHERE id = auth.uid() 
    LIMIT 1
  )
);

-- 3. Tabela: maria_da_penha
ALTER TABLE maria_da_penha ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem apenas maria_da_penha da sua instituição" ON maria_da_penha;
CREATE POLICY "Usuários veem apenas maria_da_penha da sua instituição" 
ON maria_da_penha FOR ALL 
TO authenticated 
USING (
  instituicao_id = (
    SELECT instituicao_id 
    FROM usuarios 
    WHERE id = auth.uid() 
    LIMIT 1
  )
);

DROP POLICY IF EXISTS "Usuários inserem apenas maria_da_penha na sua instituição" ON maria_da_penha;
CREATE POLICY "Usuários inserem apenas maria_da_penha na sua instituição" 
ON maria_da_penha FOR INSERT 
TO authenticated 
WITH CHECK (
  instituicao_id = (
    SELECT instituicao_id 
    FROM usuarios 
    WHERE id = auth.uid() 
    LIMIT 1
  )
);

-- 4. Tabela: chamados_ocorrencias
ALTER TABLE chamados_ocorrencias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários veem apenas chamados_ocorrencias da sua instituição" ON chamados_ocorrencias;
CREATE POLICY "Usuários veem apenas chamados_ocorrencias da sua instituição" 
ON chamados_ocorrencias FOR ALL 
TO authenticated 
USING (
  instituicao_id = (
    SELECT instituicao_id 
    FROM usuarios 
    WHERE id = auth.uid() 
    LIMIT 1
  )
);

DROP POLICY IF EXISTS "Usuários inserem apenas chamados_ocorrencias na sua instituição" ON chamados_ocorrencias;
CREATE POLICY "Usuários inserem apenas chamados_ocorrencias na sua instituição" 
ON chamados_ocorrencias FOR INSERT 
TO authenticated 
WITH CHECK (
  instituicao_id = (
    SELECT instituicao_id 
    FROM usuarios 
    WHERE id = auth.uid() 
    LIMIT 1
  )
);

-- 5. Garantir que as tabelas de envolvidos também estão protegidas
ALTER TABLE ocorrencia_envolvidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE embriaguez_envolvidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Envolvidos isolados por instituição" ON ocorrencia_envolvidos;
CREATE POLICY "Envolvidos isolados por instituição" 
ON ocorrencia_envolvidos FOR ALL 
TO authenticated 
USING (
  ocorrencia_id IN (
    SELECT id FROM ocorrencias 
    WHERE instituicao_id = (SELECT instituicao_id FROM usuarios WHERE id = auth.uid() LIMIT 1)
  )
);

DROP POLICY IF EXISTS "Envolvidos embriaguez isolados por instituição" ON embriaguez_envolvidos;
CREATE POLICY "Envolvidos embriaguez isolados por instituição" 
ON embriaguez_envolvidos FOR ALL 
TO authenticated 
USING (
  embriaguez_id IN (
    SELECT id FROM embriaguez 
    WHERE instituicao_id = (SELECT instituicao_id FROM usuarios WHERE id = auth.uid() LIMIT 1)
  )
);

-- 6. Verificação final: Testar isolamento
-- Execute como usuário logado:
/*
SELECT 'ocorrencias' as tabela, count(*) as total 
FROM ocorrencias

UNION ALL

SELECT 'embriaguez' as tabela, count(*) as total 
FROM embriaguez

UNION ALL

SELECT 'maria_da_penha' as tabela, count(*) as total 
FROM maria_da_penha

UNION ALL

SELECT 'chamados_ocorrencias' as tabela, count(*) as total 
FROM chamados_ocorrencias;
*/
