-- ============================================
-- CORREÇÃO: Criar usuário no Auth (V2)
-- ID: c15b4f15-290c-4417-b2a4-2627a9aaa678
-- ============================================

-- Opção 1: Via supabase_auth_admin (se disponível)
-- Execute este bloco no SQL Editor do Supabase:

DO $$
DECLARE
  v_user_id uuid := 'c15b4f15-290c-4417-b2a4-2627a9aaa678';
  v_email text;
  v_primeiro_nome text;
  v_sobrenome text;
  v_perfil text;
  v_instituicao_id uuid;
BEGIN
  -- Buscar dados da tabela usuarios
  SELECT email, primeiro_nome, sobrenome, perfil_acesso, instituicao_id
  INTO v_email, v_primeiro_nome, v_sobrenome, v_perfil, v_instituicao_id
  FROM usuarios
  WHERE id = v_user_id;

  IF v_email IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado na tabela usuarios';
  END IF;

  -- Verificar se já existe no auth
  IF EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id) THEN
    RAISE NOTICE 'Usuário já existe no auth.users';
    RETURN;
  END IF;

  -- Inserir diretamente no auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000'::uuid,
    v_email,
    crypt('Temp@2024!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    jsonb_build_object(
      'primeiro_nome', v_primeiro_nome,
      'sobrenome', v_sobrenome,
      'perfil_acesso', v_perfil,
      'instituicao_id', v_instituicao_id
    ),
    false,
    'authenticated',
    'authenticated'
  );

  -- Criar identidade
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_user_id,
    jsonb_build_object(
      'sub', v_user_id::text,
      'email', v_email,
      'email_verified', true
    ),
    'email',
    now(),
    now(),
    now()
  );

  RAISE NOTICE 'Usuário criado com sucesso! Senha: Temp@2024!';
END $$;

-- Verificar resultado
SELECT 
  'auth.users' as tabela,
  id, 
  email, 
  email_confirmed_at IS NOT NULL as email_confirmado,
  raw_user_meta_data->>'perfil_acesso' as perfil
FROM auth.users 
WHERE id = 'c15b4f15-290c-4417-b2a4-2627a9aaa678'
UNION ALL
SELECT 
  'usuarios' as tabela,
  id::text, 
  email, 
  null as email_confirmado,
  perfil_acesso as perfil
FROM usuarios 
WHERE id = 'c15b4f15-290c-4417-b2a4-2627a9aaa678';
