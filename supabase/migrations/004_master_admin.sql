-- ============================================================================
-- SCRIPT: CONFIGURAÇÃO DE SUPER ADMIN MESTRE
-- Define credenciais e privilégios para o administrador global do SaaS.
-- ============================================================================

-- 1. Garantir que a tabela usuários tenha o campo email para facilitar consultas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='usuarios' AND column_name='email') THEN
        ALTER TABLE public.usuarios ADD COLUMN email TEXT;
    END IF;
END $$;

-- 2. Atualizar a trigger de criação de perfil para reconhecer o admin mestre
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_perfil TEXT;
    v_instituicao_id UUID;
BEGIN
    -- Se o email for o mestre, define como super_admin sem instituição vinculada
    IF (NEW.email = 'zeroumbit@gmail.com') THEN
        INSERT INTO public.usuarios (id, email, perfil_acesso, primeiro_nome, sobrenome)
        VALUES (NEW.id, NEW.email, 'super_admin', 'Admin', 'Mestre');
        RETURN NEW;
    END IF;

    -- Lógica normal para outros usuários (Gestores que criam instituições no cadastro)
    v_perfil := COALESCE(NEW.raw_user_meta_data->>'perfil_acesso', 'operador');

    IF v_perfil = 'gestor' THEN
        -- Criar a Instituição associada ao Gestor durante o SignUp
        INSERT INTO public.instituicoes (
            razao_social, 
            cnpj, 
            slug,
            status_assinatura,
            configuracoes_locais
        )
        VALUES (
            COALESCE(NEW.raw_user_meta_data->>'razaoSocial', 'Nova Instituição'),
            COALESCE(NEW.raw_user_meta_data->>'cnpj', '00000000000000'),
            'slug-' || substr(md5(random()::text), 1, 8),
            'pendente',
            '{"setup_completed": false}'::jsonb
        )
        RETURNING id INTO v_instituicao_id;
    ELSE
        -- Usuário comum convidado já deve vir com instituicao_id no metadata
        v_instituicao_id := (NEW.raw_user_meta_data->>'instituicao_id')::UUID;
    END IF;

    INSERT INTO public.usuarios (id, email, instituicao_id, perfil_acesso, primeiro_nome, sobrenome)
    VALUES (
        NEW.id, 
        NEW.email,
        v_instituicao_id, 
        v_perfil,
        COALESCE(NEW.raw_user_meta_data->>'primeiro_nome', 'Usuário'),
        COALESCE(NEW.raw_user_meta_data->>'sobrenome', 'Novo')
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Caso o usuário já tenha sido criado, forçamos a promoção para super_admin
UPDATE public.usuarios 
SET perfil_acesso = 'super_admin',
    instituicao_id = NULL
WHERE id IN (SELECT id FROM auth.users WHERE email = 'zeroumbit@gmail.com');

-- 4. Sincronizar com a tabela de Auth para garantir redirecionamento correto no Login
UPDATE auth.users
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"perfil_acesso": "super_admin"}'::jsonb
WHERE email = 'zeroumbit@gmail.com';
