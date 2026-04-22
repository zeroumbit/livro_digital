-- ============================================================================
-- Migration: Fix audit_log RLS - Separação estrita por Tenant (Instituição)
-- Aplica via Supabase Dashboard > SQL Editor
-- ============================================================================

-- Remove política anterior se existir
DROP POLICY IF EXISTS "audit_log_super_admin_only" ON public.audit_log;
DROP POLICY IF EXISTS "audit_log_insert_authenticated" ON public.audit_log;
DROP POLICY IF EXISTS "audit_log_select_institution" ON public.audit_log;
DROP POLICY IF EXISTS "audit_log_select_tenant" ON public.audit_log;

-- ============================================================================
-- INSERT: Qualquer usuário autenticado pode criar logs (via trigger)
-- ============================================================================
CREATE POLICY "audit_log_insert_authenticated"
ON public.audit_log
FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================================================
-- SELECT: Apenas usuarios da mesma instituicao (tenant)
-- Faz join entre audit_log.usuario_id -> usuarios.id -> usuarios.instituicao_id
-- ============================================================================
CREATE POLICY "audit_log_select_tenant"
ON public.audit_log
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.usuarios
        WHERE usuarios.id = audit_log.usuario_id
        AND usuarios.instituicao_id = (
            SELECT instituicao_id FROM public.usuarios
            WHERE usuarios.id = auth.uid()
        )
    )
);

-- ============================================================================
-- UPDATE/DELETE: Nenhum usuário comum (apenas super_admin via função)
-- ============================================================================
CREATE POLICY "audit_log_update_super_admin_only"
ON public.audit_log
FOR UPDATE
TO authenticated
USING (public.get_my_perfil() = 'super_admin');

CREATE POLICY "audit_log_delete_super_admin_only"
ON public.audit_log
FOR DELETE
TO authenticated
USING (public.get_my_perfil() = 'super_admin');