-- ============================================================================
-- MIGRATION 038: CORRIGE TRIGGER PARA SUPORTAR CONVITE DE MEMBROS
-- O trigger agora lê `instituicao_id` dos metadados para convidados,
-- e garante que `patente` é persistida no registro do usuário.
-- ============================================================================

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
    v_cnpj         := NEW.raw_user_meta_data->>'cnpj';

    -- 2. Fluxo de Criação de Instituição (somente para cadastro de gestor com CNPJ)
    IF v_razao_social IS NOT NULL AND v_cnpj IS NOT NULL THEN
        v_slug := lower(regexp_replace(v_razao_social, '[^a-zA-Z0-9]+', '-', 'g'));
        v_slug := v_slug || '-' || substr(md5(random()::text), 1, 6);

        SELECT id INTO v_plano_id FROM public.planos WHERE nome ILIKE 'Básico' LIMIT 1;

        INSERT INTO public.instituicoes (
            razao_social,
            cnpj,
            slug,
            telefone,
            cep, logradouro, numero, complemento, bairro, cidade, estado,
            gestor_user_id,
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
            v_plano_id,
            'pendente'
        )
        RETURNING id INTO v_instituicao_id;
    ELSE
        -- Fluxo de convite: usa o instituicao_id passado nos metadados
        IF NEW.raw_user_meta_data->>'instituicao_id' IS NOT NULL THEN
            v_instituicao_id := (NEW.raw_user_meta_data->>'instituicao_id')::UUID;
        END IF;
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
        patente,
        status
    )
    VALUES (
        NEW.id,
        v_instituicao_id,
        COALESCE(NEW.raw_user_meta_data->>'primeiro_nome', 'Novo'),
        COALESCE(NEW.raw_user_meta_data->>'sobrenome', 'Usuário'),
        NEW.email,
        NEW.raw_user_meta_data->>'telefone',
        COALESCE(NEW.raw_user_meta_data->>'perfil_acesso', 'gcm'),
        CASE
          WHEN COALESCE(NEW.raw_user_meta_data->>'perfil_acesso', 'gcm') = 'gestor'
          THEN COALESCE(NEW.raw_user_meta_data->>'funcao_operacional', 'SECRETÁRIO')
          ELSE NEW.raw_user_meta_data->>'funcao_operacional'
        END,
        NEW.raw_user_meta_data->>'patente',
        'ativo'
    )
    ON CONFLICT (id) DO UPDATE SET
        instituicao_id   = EXCLUDED.instituicao_id,
        primeiro_nome    = EXCLUDED.primeiro_nome,
        sobrenome        = EXCLUDED.sobrenome,
        email            = EXCLUDED.email,
        perfil_acesso    = EXCLUDED.perfil_acesso,
        patente          = EXCLUDED.patente,
        status           = EXCLUDED.status;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;
