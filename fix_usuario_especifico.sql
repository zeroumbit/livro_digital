-- ============================================
-- CORREÇÃO DEFINITIVA: Usuário Órfão
-- ID: c15b4f15-290c-4417-b2a4-2627a9aaa678
-- Execute este SQL no SQL Editor do Supabase
-- ============================================

DO $$
DECLARE
  v_user_record RECORD;
  v_auth_exists BOOLEAN;
BEGIN
  -- Buscar dados da tabela usuarios
  SELECT * INTO v_user_record 
  FROM usuarios 
  WHERE id = 'c15b4f15-290c-4417-b2a4-2627a9aaa678';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuário não encontrado na tabela usuarios';
  END IF;

  -- Verificar se já existe no auth.users
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = v_user_record.id) INTO v_auth_exists;
  
  IF v_auth_exists THEN
    RAISE NOTICE 'Usuário já existe no auth.users!';
    RETURN;
  END IF;

  -- Inserir no auth.users (usando a função correta)
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
    v_user_record.id,
    '00000000-0000-0000-0000-000000000000'::uuid,
    v_user_record.email,
    crypt('Temp@2024!', gen_salt('bf')), -- Senha temporária
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    jsonb_build_object(
      'primeiro_nome', v_user_record.primeiro_nome,
      'sobrenome', v_user_record.sobrenome,
      'perfil_acesso', v_user_record.perfil_acesso,
      'instituicao_id', v_user_record.instituicao_id
    ),
    false,
    'authenticated',
    'authenticated'
  );

  -- Criar identidade
  INSERT INTO auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_user_record.email,
    v_user_record.id,
    jsonb_build_object(
      'sub', v_user_record.id::text,
      'email', v_user_record.email,
      'email_verified', true
    ),
    'email',
    now(),
    now(),
    now()
  );

  RAISE NOTICE 'SUCESSO! Usuário criado no Auth. Senha: Temp@2024!';
END $$;

-- Verificar se funcionou
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.raw_user_meta_data->>'perfil_acesso' as perfil,
  u.created_at
FROM auth.users u
WHERE u.id = 'c15b4f15-290c-4417-b2a4-2627a9aaa678';
