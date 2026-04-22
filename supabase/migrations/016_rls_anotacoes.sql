-- ============================================================================
-- 16: RLS PARA ocorrencia_anotacoes (SEGURANÇA)
-- ============================================================================

ALTER TABLE public.ocorrencia_anotacoes ENABLE ROW LEVEL SECURITY;

---policy para super_admin: vê tudo
DROP POLICY IF EXISTS "anotacoes_super_admin" ON public.ocorrencia_anotacoes;
CREATE POLICY "anotacoes_super_admin" ON public.ocorrencia_anotacoes
    FOR ALL USING (public.get_my_perfil() = 'super_admin');

-- Policy: Membros da instituição vejo as anotações das ocorrências da instituição
DROP POLICY IF EXISTS "anotacoes_tenant_isolation" ON public.ocorrencia_anotacoes;
CREATE POLICY "anotacoes_tenant_isolation" ON public.ocorrencia_anotacoes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.ocorrencias o
            WHERE o.id = ocorrencia_id
            AND o.instituicao_id = public.get_my_institution()
        )
    );