-- ============================================================================
-- 17: RATE LIMITING DE SEGURANÇA
-- ============================================================================

-- Tabela para controle de tentativas de login (previne brute force)
CREATE TABLE IF NOT EXISTS public.login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address INET NOT NULL,
    email TEXT,
    tentativa_at TIMESTAMPTZ DEFAULT now(),
    sucesso BOOLEAN DEFAULT false
);

-- Trigger para limpar tentativas antigas (mais de 24h)
CREATE OR REPLACE FUNCTION cleanup_old_attempts()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.login_attempts 
    WHERE tentativa_at < NOW() - INTERVAL '24 hours';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cleanup_attempts_trigger ON public.login_attempts;
CREATE TRIGGER cleanup_attempts_trigger
    AFTER INSERT ON public.login_attempts
    FOR EACH ROW EXECUTE FUNCTION cleanup_old_attempts();

-- Função que bloqueia IP após muitas falhas (5 falhas em 15 min)
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_email TEXT, p_ip INET)
RETURNS BOOLEAN AS $$
DECLARE
    v_falhas INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_falhas
    FROM public.login_attempts
    WHERE email = p_email
    AND ip_address = p_ip
    AND tentativa_at > NOW() - INTERVAL '15 minutes'
    AND sucesso = false;

    IF v_falhas >= 5 THEN
        RETURN false;
    END IF;
    RETURN true;
END;
$$ LANGUAGE plpgsql STABLE;