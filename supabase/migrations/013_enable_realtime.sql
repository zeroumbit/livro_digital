-- ============================================================================
-- SCRIPT: ATIVAÇÃO DE REALTIME PARA TABELAS CRÍTICAS
-- Permite que o Dashboard reaja instantaneamente a mudanças em propostas e status.
-- ============================================================================

-- Garante que a publicação exista
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- Adiciona tabelas à publicação de Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.assinaturas_propostas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.instituicoes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ocorrencias;
