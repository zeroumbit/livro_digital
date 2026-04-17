-- ============================================================================
-- SCRIPT 014: PERMISSÃO DE CONFIGURAÇÃO PARA GESTORES
-- Permite que o Gestor da instituição atualize os dados da sua própria conta.
-- ============================================================================

-- Permite ao Gestor atualizar sua própria instituição (ex: Setup Wizard)
DROP POLICY IF EXISTS "Gestor_Update_Propria_Instituicao" ON public.instituicoes;

CREATE POLICY "Gestor_Update_Propria_Instituicao" 
ON public.instituicoes 
FOR UPDATE 
USING (gestor_user_id = auth.uid())
WITH CHECK (gestor_user_id = auth.uid());

-- Comentário: O erro 406 ocorria porque o .select().single() falhava ao não encontrar 
-- linhas permitidas para atualização via RLS.
