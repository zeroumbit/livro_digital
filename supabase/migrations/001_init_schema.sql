-- ============================================================================
-- 1. CRIAÇÃO DAS TABELAS FUNDAMENTAIS (CORE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.planos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT,
    valor_mensal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    limite_usuarios INTEGER NOT NULL DEFAULT 50,
    modulos_ativos JSONB DEFAULT '[]', 
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.instituicoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    razao_social TEXT NOT NULL,
    cnpj TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    telefone TEXT,
    cep TEXT, logradouro TEXT, numero TEXT, complemento TEXT, bairro TEXT, cidade TEXT, estado CHAR(2),
    status_assinatura TEXT NOT NULL DEFAULT 'pendente' CHECK (status_assinatura IN ('pendente', 'ativa', 'suspensa', 'cancelada')),
    gestor_user_id UUID, 
    plano_id UUID REFERENCES public.planos(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    instituicao_id UUID REFERENCES public.instituicoes(id) ON DELETE CASCADE,
    primeiro_nome TEXT NOT NULL,
    sobrenome TEXT NOT NULL,
    matricula TEXT,
    patente TEXT,
    perfil_acesso TEXT NOT NULL DEFAULT 'gcm',
    funcao_operacional TEXT,
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 2. TABELAS OPERACIONAIS (GUARDA MUNICIPAL)
-- ============================================================================

-- Bairros e Distritos (Customizados por Tenant)
CREATE TABLE IF NOT EXISTS public.bairros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instituicao_id UUID REFERENCES public.instituicoes(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Veículos / Frota
CREATE TABLE IF NOT EXISTS public.veiculos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instituicao_id UUID REFERENCES public.instituicoes(id) ON DELETE CASCADE,
    placa TEXT NOT NULL,
    ano INTEGER NOT NULL,
    marca TEXT NOT NULL,
    modelo TEXT NOT NULL,
    tipo_veiculo TEXT NOT NULL,
    tipo_combustivel TEXT,
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'em_manutencao')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Registro de KM Diário
CREATE TABLE IF NOT EXISTS public.km_diario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instituicao_id UUID REFERENCES public.instituicoes(id) ON DELETE CASCADE,
    veiculo_id UUID REFERENCES public.veiculos(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.usuarios(id),
    quilometragem INTEGER NOT NULL,
    turno TEXT NOT NULL CHECK (turno IN ('Manhã', 'Tarde', 'Noite', '12 horas', '24 horas')),
    data_registro DATE NOT NULL DEFAULT CURRENT_DATE,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    -- Regra de Negócio: Impede KM duplicado para o mesmo veículo, no mesmo dia e turno
    UNIQUE(veiculo_id, data_registro, turno)
);

-- Equipes
CREATE TABLE IF NOT EXISTS public.equipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instituicao_id UUID REFERENCES public.instituicoes(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    chefe_id UUID REFERENCES public.usuarios(id),
    status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa')),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.equipe_membros (
    equipe_id UUID REFERENCES public.equipes(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    PRIMARY KEY (equipe_id, usuario_id)
);

-- Ocorrências (O Coração do Sistema)
CREATE TABLE IF NOT EXISTS public.ocorrencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instituicao_id UUID REFERENCES public.instituicoes(id) ON DELETE CASCADE,
    criador_id UUID REFERENCES public.usuarios(id),
    numero_oficial SERIAL,
    status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'aberta', 'em_atendimento', 'finalizada', 'arquivada')),
    prioridade TEXT NOT NULL DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
    origem TEXT NOT NULL,
    origem_tipo TEXT NOT NULL,
    natureza TEXT[] NOT NULL,
    descricao TEXT NOT NULL,
    rua TEXT NOT NULL,
    numero TEXT,
    bairro TEXT NOT NULL,
    referencia TEXT,
    coordenadas TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Anotações de Ocorrência (Complementos)
CREATE TABLE IF NOT EXISTS public.ocorrencia_anotacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ocorrencia_id UUID REFERENCES public.ocorrencias(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.usuarios(id),
    texto TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Chamados (Acionamento de Parceiros)
CREATE TABLE IF NOT EXISTS public.chamados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instituicao_id UUID REFERENCES public.instituicoes(id) ON DELETE CASCADE,
    criador_id UUID REFERENCES public.usuarios(id),
    status TEXT NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_andamento', 'resolvido', 'fechado')),
    prioridade TEXT NOT NULL,
    natureza TEXT[] NOT NULL,
    qtde_envolvidos TEXT NOT NULL,
    rua TEXT NOT NULL,
    bairro TEXT NOT NULL,
    coordenadas TEXT,
    detalhes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Respostas dos Parceiros aos Chamados
CREATE TABLE IF NOT EXISTS public.chamados_parceiros (
    chamado_id UUID REFERENCES public.chamados(id) ON DELETE CASCADE,
    parceiro_tipo TEXT NOT NULL, -- Ex: 'policia_militar', 'samu'
    status_resposta TEXT NOT NULL DEFAULT 'pendente' CHECK (status_resposta IN ('pendente', 'aceito', 'recusado', 'no_local')),
    hora_resposta TIMESTAMPTZ,
    notas TEXT,
    PRIMARY KEY (chamado_id, parceiro_tipo)
);

-- ============================================================================
-- 3. SEGURANÇA (ROW LEVEL SECURITY - RLS E TENANT ISOLATION)
-- ============================================================================

ALTER TABLE public.instituicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bairros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.km_diario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocorrencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chamados ENABLE ROW LEVEL SECURITY;

-- Limpeza de políticas existentes para permitir re-execução (Idempotência)
DROP POLICY IF EXISTS "Super Admin - Acesso Total Instituicoes" ON public.instituicoes;
DROP POLICY IF EXISTS "Super Admin - Acesso Total Usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Isolamento de Tenant - Instituicoes" ON public.instituicoes;
DROP POLICY IF EXISTS "Isolamento de Tenant - Usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Isolamento de Tenant - Bairros" ON public.bairros;
DROP POLICY IF EXISTS "Isolamento de Tenant - Veiculos" ON public.veiculos;
DROP POLICY IF EXISTS "Isolamento de Tenant - KM" ON public.km_diario;
DROP POLICY IF EXISTS "Isolamento de Tenant - Ocorrencias" ON public.ocorrencias;
DROP POLICY IF EXISTS "Isolamento de Tenant - Chamados" ON public.chamados;

-- Política de Super Admin: Acesso total a tudo
CREATE POLICY "Super Admin - Acesso Total Instituicoes" ON public.instituicoes FOR ALL USING ((SELECT perfil_acesso FROM public.usuarios WHERE id = auth.uid()) = 'super_admin');
CREATE POLICY "Super Admin - Acesso Total Usuarios" ON public.usuarios FOR ALL USING ((SELECT perfil_acesso FROM public.usuarios WHERE id = auth.uid()) = 'super_admin');

-- Política de Tenant: Um usuário só pode ler e escrever dados onde o instituicao_id for igual ao seu
CREATE POLICY "Isolamento de Tenant - Instituicoes" ON public.instituicoes FOR SELECT USING (id = (SELECT instituicao_id FROM public.usuarios WHERE id = auth.uid()));
CREATE POLICY "Isolamento de Tenant - Usuarios" ON public.usuarios FOR ALL USING (instituicao_id = (SELECT instituicao_id FROM public.usuarios WHERE id = auth.uid()));
CREATE POLICY "Isolamento de Tenant - Bairros" ON public.bairros FOR ALL USING (instituicao_id = (SELECT instituicao_id FROM public.usuarios WHERE id = auth.uid()));
CREATE POLICY "Isolamento de Tenant - Veiculos" ON public.veiculos FOR ALL USING (instituicao_id = (SELECT instituicao_id FROM public.usuarios WHERE id = auth.uid()));
CREATE POLICY "Isolamento de Tenant - KM" ON public.km_diario FOR ALL USING (instituicao_id = (SELECT instituicao_id FROM public.usuarios WHERE id = auth.uid()));
CREATE POLICY "Isolamento de Tenant - Ocorrencias" ON public.ocorrencias FOR ALL USING (instituicao_id = (SELECT instituicao_id FROM public.usuarios WHERE id = auth.uid()));
CREATE POLICY "Isolamento de Tenant - Chamados" ON public.chamados FOR ALL USING (instituicao_id = (SELECT instituicao_id FROM public.usuarios WHERE id = auth.uid()));

-- ============================================================================
-- 4. REGRAS DE NEGÓCIO - TRIGGERS (A Mágica do Backend)
-- ============================================================================

-- REGRA A: Imutabilidade das Ocorrências
-- "Apenas ocorrências com status rascunho podem ser editadas."
CREATE OR REPLACE FUNCTION check_ocorrencia_imutabilidade() RETURNS TRIGGER AS $$
BEGIN
    -- Se o status não for rascunho nem aberta, e não estivermos mudando o status (apenas atualizando texto)
    IF OLD.status NOT IN ('rascunho', 'aberta') AND NEW.status = OLD.status THEN
        RAISE EXCEPTION 'Ocorrências finalizadas ou em atendimento são imutáveis. Utilize as Anotações para complementos.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_ocorrencia_imutabilidade ON public.ocorrencias;
CREATE TRIGGER enforce_ocorrencia_imutabilidade 
    BEFORE UPDATE ON public.ocorrencias 
    FOR EACH ROW EXECUTE FUNCTION check_ocorrencia_imutabilidade();

-- REGRA B: Anotações com Janela de 5 Minutos
-- "Permitida edição/exclusão apenas nos primeiros 5 minutos após criação."
CREATE OR REPLACE FUNCTION check_anotacao_timeout() RETURNS TRIGGER AS $$
BEGIN
    IF (NOW() - OLD.created_at) > INTERVAL '5 minutes' THEN
        RAISE EXCEPTION 'As anotações apenas podem ser editadas ou removidas nos primeiros 5 minutos após a criação (Auditoria rigorosa).';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_anotacao_timeout_update ON public.ocorrencia_anotacoes;
CREATE TRIGGER enforce_anotacao_timeout_update 
    BEFORE UPDATE ON public.ocorrencia_anotacoes 
    FOR EACH ROW EXECUTE FUNCTION check_anotacao_timeout();

DROP TRIGGER IF EXISTS enforce_anotacao_timeout_delete ON public.ocorrencia_anotacoes;
CREATE TRIGGER enforce_anotacao_timeout_delete 
    BEFORE DELETE ON public.ocorrencia_anotacoes 
    FOR EACH ROW EXECUTE FUNCTION check_anotacao_timeout();

-- ============================================================================
-- 5. TRIGGER DE CRIAÇÃO AUTOMÁTICA DE USUÁRIO E INSTITUIÇÃO (Auth -> Public)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
DECLARE
    v_instituicao_id UUID;
    v_razao_social TEXT;
    v_cnpj TEXT;
    v_slug TEXT;
    v_plano_id UUID;
BEGIN
    -- 1. Tentar extrair dados de instituição do metadata
    v_razao_social := new.raw_user_meta_data->>'razaoSocial';
    v_cnpj := new.raw_user_meta_data->>'cnpj';

    -- 2. Se houver dados de instituição, criar a instituição primeiro
    IF v_razao_social IS NOT NULL AND v_cnpj IS NOT NULL THEN
        -- Gerar slug básico
        v_slug := lower(regexp_replace(v_razao_social, '[^a-zA-Z0-9]+', '-', 'g'));
        
        -- Pegar o plano 'Básico' por padrão se não especificado
        SELECT id INTO v_plano_id FROM public.planos WHERE nome = 'Básico' LIMIT 1;

        INSERT INTO public.instituicoes (
            razao_social, 
            cnpj, 
            slug, 
            telefone,
            cep, logradouro, numero, complemento, bairro, cidade, estado,
            gestor_user_id,
            plano_id
        )
        VALUES (
            v_razao_social,
            v_cnpj,
            v_slug || '-' || substr(md5(random()::text), 1, 4), 
            new.raw_user_meta_data->>'telefone',
            new.raw_user_meta_data->'endereco'->>'cep',
            new.raw_user_meta_data->'endereco'->>'logradouro',
            new.raw_user_meta_data->'endereco'->>'numero',
            new.raw_user_meta_data->'endereco'->>'complemento',
            new.raw_user_meta_data->'endereco'->>'bairro',
            new.raw_user_meta_data->'endereco'->>'cidade',
            new.raw_user_meta_data->'endereco'->>'estado',
            new.id,
            v_plano_id
        )
        RETURNING id INTO v_instituicao_id;
    END IF;

    -- 3. Criar o registro na tabela de usuários
    INSERT INTO public.usuarios (
        id, 
        instituicao_id,
        primeiro_nome, 
        sobrenome, 
        perfil_acesso
    )
    VALUES (
        new.id, 
        v_instituicao_id,
        COALESCE(new.raw_user_meta_data->>'primeiro_nome', 'Novo'), 
        COALESCE(new.raw_user_meta_data->>'sobrenome', 'Usuário'),
        COALESCE(new.raw_user_meta_data->>'perfil_acesso', 'gcm')
    );

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 6. DADOS INICIAIS (SEED)
-- ============================================================================
INSERT INTO public.planos (nome, valor_mensal, limite_usuarios) 
VALUES ('Básico', 0, 10), ('Profissional', 499.00, 50), ('Enterprise', 1200.00, 1000)
ON CONFLICT (nome) DO NOTHING;
