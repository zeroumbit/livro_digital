-- ============================================================================
-- MIGRATION: Garante colunas do gestor e atualiza trigger
-- ============================================================================

-- 1. Adicionar colunas (caso não existam)
ALTER TABLE public.instituicoes 
  ADD COLUMN IF NOT EXISTS gestor_nome_completo TEXT,
  ADD COLUMN IF NOT EXISTS gestor_como_chamado TEXT,
  ADD COLUMN IF NOT EXISTS gestor_telefone TEXT,
  ADD COLUMN IF NOT EXISTS gestor_email TEXT;

-- 2. Comentários
COMMENT ON COLUMN public.instituicoes.gestor_nome_completo IS 'Nome completo do secretário responsável';
COMMENT ON COLUMN public.instituicoes.gestor_como_chamado IS 'Como o secretário prefere ser chamado';
COMMENT ON COLUMN public.instituicoes.gestor_telefone IS 'Telefone/WhatsApp do secretário';
COMMENT ON COLUMN public.instituicoes.gestor_email IS 'E-mail institucional do secretário';

-- 3. Recriar o trigger com as novas colunas
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
    v_instituicao_id UUID;
    v_razao_social TEXT;
    v_cnpj TEXT;
    v_slug TEXT;
    v_plano_id UUID;
BEGIN
    -- 1. Extração segura de metadados
    v_razao_social := NEW.raw_user_meta_data->>'razaoSocial';
    v_cnpj := NEW.raw_user_meta_data->>'cnpj';
 
    -- 2. Fluxo de Criação de Instituição (Apenas se houver dados)
    IF v_razao_social IS NOT NULL AND v_cnpj IS NOT NULL THEN
        -- Gerar slug único
        v_slug := lower(regexp_replace(v_razao_social, '[^a-zA-Z0-9]+', '-', 'g'));
        v_slug := v_slug || '-' || substr(md5(random()::text), 1, 6);
 
        -- Tentar encontrar plano padrão 'Básico'
        SELECT id INTO v_plano_id FROM public.planos WHERE nome ILIKE 'Básico' LIMIT 1;
 
        -- Inserção robusta de Instituição (com dados do gestor)
        INSERT INTO public.instituicoes (
            razao_social, 
            cnpj, 
            slug, 
            telefone,
            cep, logradouro, numero, complemento, bairro, cidade, estado,
            gestor_user_id,
            gestor_nome_completo,
            gestor_como_chamado,
            gestor_telefone,
            gestor_email,
            plano_id,
            status_assinatura
        )
        VALUES (
            v_razao_social,
            v_cnpj,
            v_slug,
            NEW.raw_user_meta_data->>'telefone',
            NEW.raw_user_meta_data->'endereco'->>'cep',
            NEW.raw_user_meta_data->'endereco'->>'logradouro',
            NEW.raw_user_meta_data->'endereco'->>'numero',
            NEW.raw_user_meta_data->'endereco'->>'complemento',
            NEW.raw_user_meta_data->'endereco'->>'bairro',
            NEW.raw_user_meta_data->'endereco'->>'cidade',
            COALESCE(SUBSTRING(NEW.raw_user_meta_data->'endereco'->>'estado' FROM 1 FOR 2), 'CE'),
            NEW.id,
            NEW.raw_user_meta_data->>'gestor_nome_completo',
            NEW.raw_user_meta_data->>'gestor_como_chamado',
            NEW.raw_user_meta_data->>'gestor_telefone',
            NEW.raw_user_meta_data->>'gestor_email',
            v_plano_id,
            'pendente'
        )
        RETURNING id INTO v_instituicao_id;
    END IF;
 
    -- 3. Criação do Perfil de Usuário
    INSERT INTO public.usuarios (
        id,
        instituicao_id,
        primeiro_nome,
        sobrenome,
        email,
        telefone,
        perfil_acesso,
        funcao_operacional,
        status
    )
    VALUES (
        NEW.id,
        v_instituicao_id,
        COALESCE(NEW.raw_user_meta_data->>'primeiro_nome', 'Novo'),
        COALESCE(NEW.raw_user_meta_data->>'sobrenome', 'Gestor'),
        NEW.email,
        NEW.raw_user_meta_data->>'telefone',
        COALESCE(NEW.raw_user_meta_data->>'perfil_acesso', 'gestor'),
        CASE
          WHEN COALESCE(NEW.raw_user_meta_data->>'perfil_acesso', 'gestor') = 'gestor'
          THEN COALESCE(NEW.raw_user_meta_data->>'funcao_operacional', 'SECRETÁRIO')
          ELSE NEW.raw_user_meta_data->>'funcao_operacional'
        END,
        'ativo'
    );
 
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;
