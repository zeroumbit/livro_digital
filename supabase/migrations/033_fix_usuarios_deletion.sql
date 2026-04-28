-- Migration 033: Ajustar restrições de chave estrangeira para permitir exclusão de usuários
-- Altera as referências de 'usuarios' para 'ON DELETE SET NULL' ou 'CASCADE'
-- para evitar erros 409 Conflict ao deletar membros com histórico.

DO $$ 
BEGIN
    -- 1. Equipes (Chefe de Equipe)
    ALTER TABLE IF EXISTS public.equipes 
    DROP CONSTRAINT IF EXISTS equipes_chefe_id_fkey,
    ADD CONSTRAINT equipes_chefe_id_fkey 
    FOREIGN KEY (chefe_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;

    -- 2. KM Diário
    ALTER TABLE IF EXISTS public.km_diario 
    DROP CONSTRAINT IF EXISTS km_diario_usuario_id_fkey,
    ADD CONSTRAINT km_diario_usuario_id_fkey 
    FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;

    -- 3. Vistorias
    ALTER TABLE IF EXISTS public.vistorias 
    DROP CONSTRAINT IF EXISTS vistorias_usuario_id_fkey,
    ADD CONSTRAINT vistorias_usuario_id_fkey 
    FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;

    -- 4. Abastecimentos
    ALTER TABLE IF EXISTS public.abastecimentos 
    DROP CONSTRAINT IF EXISTS abastecimentos_usuario_id_fkey,
    ADD CONSTRAINT abastecimentos_usuario_id_fkey 
    FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;

    -- 5. Chamados
    ALTER TABLE IF EXISTS public.chamados 
    DROP CONSTRAINT IF EXISTS chamados_criador_id_fkey,
    ADD CONSTRAINT chamados_criador_id_fkey 
    FOREIGN KEY (criador_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;

    -- 6. Ocorrências
    ALTER TABLE IF EXISTS public.ocorrencias 
    DROP CONSTRAINT IF EXISTS ocorrencias_criador_id_fkey,
    ADD CONSTRAINT ocorrencias_criador_id_fkey 
    FOREIGN KEY (criador_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;

    -- 7. Anotações de Ocorrência
    ALTER TABLE IF EXISTS public.ocorrencia_anotacoes 
    DROP CONSTRAINT IF EXISTS ocorrencia_anotacoes_usuario_id_fkey,
    ADD CONSTRAINT ocorrencia_anotacoes_usuario_id_fkey 
    FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;

    -- 8. Auditoria
    ALTER TABLE IF EXISTS public.tenant_auditoria 
    DROP CONSTRAINT IF EXISTS tenant_auditoria_usuario_id_fkey,
    ADD CONSTRAINT tenant_auditoria_usuario_id_fkey 
    FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;

END $$;
