-- ============================================
-- CORREÇÃO: Usuário sem conta no Supabase Auth
-- ID: c15b4f15-290c-4417-b2a4-2627a9aaa678
-- ============================================

-- 1. Criar o usuário na tabela auth.users (necessário para login)
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
  role
)
SELECT 
  u.id,
  '00000000-0000-0000-0000-000000000000'::uuid as instance_id,
  u.email,
  crypt('Temp@2024!', gen_salt('bf')) as encrypted_password,
  now() as email_confirmed_at,
  now() as created_at,
  now() as updated_at,
  '{"provider": "email", "providers": ["email"]}'::jsonb as raw_app_meta_data,
  jsonb_build_object(
    'primeiro_nome', u.primeiro_nome,
    'sobrenome', u.sobrenome,
    'perfil_acesso', u.perfil_acesso,
    'instituicao_id', u.instituicao_id
  ) as raw_user_meta_data,
  false as is_super_admin,
  'authenticated' as role
FROM usuarios u
WHERE u.id = 'c15b4f15-290c-4417-b2a4-2627a9aaa678'
  AND NOT EXISTS (
    SELECT 1 FROM auth.users au WHERE au.id = u.id
  );

-- 2. Criar identidade na auth.identities (necessário para o Supabase Auth)
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid() as id,
  u.id as user_id,
  jsonb_build_object(
    'sub', u.id,
    'email', u.email,
    'email_verified', true
  ) as identity_data,
  'email' as provider,
  now() as created_at,
  now() as updated_at
FROM usuarios u
WHERE u.id = 'c15b4f15-290c-4417-b2a4-2627a9aaa678'
  AND NOT EXISTS (
    SELECT 1 FROM auth.identities ai WHERE ai.user_id = u.id
  );

-- 3. Verificar se foi criado com sucesso
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  au.raw_user_meta_data->>'perfil_acesso' as perfil_acesso,
  au.created_at
FROM auth.users au
WHERE au.id = 'c15b4f15-290c-4417-b2a4-2627a9aaa678';

-- ============================================
-- SENHA TEMPORÁRIA: Temp@2024!
-- O usuário deve alterar após primeiro acesso
-- ============================================
