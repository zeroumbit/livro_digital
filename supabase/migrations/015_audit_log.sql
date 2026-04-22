-- ============================================================================
-- 15: TABELA DE AUDITORIA E LOGS DE SEGURANÇA
-- ============================================================================

-- 1. Tabela de Auditoria
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id),
    tabela_afetada TEXT NOT NULL,
    registro_id UUID,
    acao TEXT NOT NULL CHECK (acao IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT')),
    valores_anteriores JSONB,
    valores_novos JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Apenas super_admin pode ver logs de auditoria
DROP POLICY IF EXISTS "audit_log_super_admin_only" ON public.audit_log;
CREATE POLICY "audit_log_super_admin_only" ON public.audit_log
    FOR ALL USING (public.get_my_perfil() = 'super_admin');

-- 2. Função para Registrar Auditoria
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario_id UUID;
    v_acao TEXT;
    v_valores_antigos JSONB;
    v_valores_novos JSONB;
BEGIN
    v_usuario_id := auth.uid();
    
    IF TG_OP = 'INSERT' THEN
        v_acao := 'INSERT';
        v_valores_novos := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        v_acao := 'UPDATE';
        v_valores_antigos := to_jsonb(OLD);
        v_valores_novos := to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        v_acao := 'DELETE';
        v_valores_antigos := to_jsonb(OLD);
    END IF;

    PERFORM pg_catalog.set_config('app.http_request_header', 
        COALESCE(current_setting('app.http_request_header', true), ''), true);

    INSERT INTO public.audit_log (
        usuario_id,
        tabela_afetada,
        registro_id,
        acao,
        valores_anteriores,
        valores_novos
    ) VALUES (
        v_usuario_id,
        TG_TABLE_NAME,
        NEW.id,
        v_acao,
        v_valores_antigos,
        v_valores_novos
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Triggers de Auditoria nas Tabelas Sensíveis
DROP TRIGGER IF EXISTS audit_usuarios_trigger ON public.usuarios;
CREATE TRIGGER audit_usuarios_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.usuarios
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

DROP TRIGGER IF EXISTS audit_instituicoes_trigger ON public.instituicoes;
CREATE TRIGGER audit_instituicoes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.instituicoes
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

DROP TRIGGER IF EXISTS audit_ocorrencias_trigger ON public.ocorrencias;
CREATE TRIGGER audit_ocorrencias_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.ocorrencias
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

DROP TRIGGER IF EXISTS audit_chamados_trigger ON public.chamados;
CREATE TRIGGER audit_chamados_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.chamados
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();