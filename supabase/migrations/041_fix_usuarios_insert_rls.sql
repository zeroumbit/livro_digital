-- ============================================================================
-- MIGRAÇÃO 041: POLÍTICAS DE ESCRITA NA TABELA USUARIOS
-- Permite que o Gestor insira, atualize e remova membros da sua instituição.
-- ============================================================================

-- CORREÇÃO: A política FOR ALL sem WITH CHECK bloqueava INSERT.
-- Reconvertê-la para SELECT apenas (isolamento de leitura por tenant).
DROP POLICY IF EXISTS "Isolamento de Tenant - Usuarios" ON public.usuarios;
CREATE POLICY "Isolamento de Tenant - Usuarios" ON public.usuarios
    FOR SELECT USING (
        instituicao_id = (
            SELECT u.instituicao_id FROM public.usuarios u WHERE u.id = auth.uid()
        )
    );

-- INSERT: Apenas gestor/secretário pode adicionar membros
DROP POLICY IF EXISTS "usuarios_gestor_insert" ON public.usuarios;
CREATE POLICY "usuarios_gestor_insert" ON public.usuarios
    FOR INSERT WITH CHECK (
        (instituicao_id = public.get_my_institution()) AND
        (public.get_my_perfil() IN ('gestor', 'secretario'))
    );

-- UPDATE: Gestor/secretário pode atualizar membros da sua instituição;
--         membros podem atualizar a si mesmos
DROP POLICY IF EXISTS "usuarios_gestor_update" ON public.usuarios;
CREATE POLICY "usuarios_gestor_update" ON public.usuarios
    FOR UPDATE USING (
        (instituicao_id = public.get_my_institution()) AND (
            public.get_my_perfil() IN ('gestor', 'secretario') OR
            id = auth.uid()
        )
    );

-- DELETE: Apenas gestor/secretário pode remover membros
DROP POLICY IF EXISTS "usuarios_gestor_delete" ON public.usuarios;
CREATE POLICY "usuarios_gestor_delete" ON public.usuarios
    FOR DELETE USING (
        (instituicao_id = public.get_my_institution()) AND
        (public.get_my_perfil() IN ('gestor', 'secretario')) AND
        id != auth.uid() -- Gestor não pode deletar a si mesmo
    );
