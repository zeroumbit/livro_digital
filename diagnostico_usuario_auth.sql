-- ============================================
-- DIAGNÓSTICO COMPLETO: Usuário Auth
-- ID: c15b4f15-290c-4417-b2a4-2627a9aaa678
-- ============================================

-- 1. Verificar se existe na tabela usuarios
SELECT 
  'usuarios' as tabela,
  id::text,
  email,
  perfil_acesso,
  status,
  instituicao_id::text
FROM usuarios 
WHERE id = 'c15b4f15-290c-4417-b2a4-2627a9aaa678'

UNION ALL

-- 2. Verificar se existe no auth.users
SELECT 
  'auth.users' as tabela,
  id::text,
  email,
  raw_user_meta_data->>'perfil_acesso' as perfil_acesso,
  email_confirmed_at::text,
  created_at::text
FROM auth.users 
WHERE id = 'c15b4f15-290c-4417-b2a4-2627a9aaa678'

UNION ALL

-- 3. Verificar se existe identidade
SELECT 
  'auth.identities' as tabela,
  user_id::text,
  provider,
  id::text,
  created_at::text
FROM auth.identities 
WHERE user_id = 'c15b4f15-290c-4417-b2a4-2627a9aaa678';

-- ============================================
-- Se não aparecer nada em auth.users e auth.identities,
-- execute o SQL abaixo para criar:
-- ============================================

/*
DO $$
DECLARE
  v_user record;
BEGIN
  -- Buscar dados do usuário
  SELECT * INTO v_user 
  FROM usuarios 
  WHERE id = 'c15b4f15-290c-4417-b2a4-2627a9aaa678';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuário não encontrado na tabela usuarios';
  END IF;
  
  -- Inserir no auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, 
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud
  ) VALUES (
    v_user.id,
    '00000000-0000-0000-0000-000000000000'::uuid,
    v_user.email,
    crypt('Temp@2024!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object(
      'primeiro_nome', v_user.primeiro_nome,
      'sobrenome', v_user.sobrenome,
      'perfil_acesso', v_user.perfil_acesso,
      'instituicao_id', v_user.instituicao_id
    ),
    false, 'authenticated', 'authenticated'
  );
  
  -- Inserir identidade
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(),
    v_user.id,
    jsonb_build_object('sub', v_user.id::text, 'email', v_user.email, 'email_verified', true),
    'email', now(), now(), now()
  );
  
  RAISE NOTICE 'Usuário criado! Senha: Temp@2024!';
END $$;
*/
