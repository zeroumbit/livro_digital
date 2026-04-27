-- ============================================================================
-- MIGRAÇÃO 029: TABELA ISOLADA PARA OCORRÊNCIAS DE MARIA DA PENHA
-- Base Legal: Lei 11.340/2006, Lei 14.149/2021, Lei 13.827/2019, Lei 13.641/2018
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.maria_da_penha (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    instituicao_id uuid REFERENCES public.instituicoes(id) ON DELETE CASCADE,
    criador_id uuid REFERENCES auth.users(id),

    -- Dados Básicos
    numero_oficial serial,
    status text DEFAULT 'rascunho',
    titulo text,
    origem text,
    origem_tipo text,         -- 'RADIO', 'AGENTE', 'PARCEIRO'
    natureza text[],
    descricao text,

    -- Localização (Dados sensíveis)
    rua text,
    numero text,
    bairro text,
    cidade text,
    estado text,
    cep text,
    referencia text,
    coordenadas text,

    -- Etapa 4 — Vítima
    vitima_nome text NOT NULL DEFAULT '',
    vitima_genero text DEFAULT 'Feminino',
    vitima_data_nascimento date,
    vitima_cpf text,
    vitima_rg text,
    vitima_telefone text,           -- DADO SENSÍVEL — acesso restrito
    vitima_tem_filhos boolean,
    vitima_num_filhos int,
    vitima_idades_filhos text,
    vitima_filhos_no_local boolean,
    vitima_vinculo_agressor text,   -- Cônjuge, ex, namorado, etc.
    vitima_tempo_relacionamento text,
    vitima_medida_protetiva_anterior boolean,
    vitima_agressor_descumpriu boolean,
    vitima_necessita_acolhimento boolean,
    vitima_observacoes text,

    -- Etapa 5 — Agressor
    agressor_nome text NOT NULL DEFAULT '',
    agressor_genero text DEFAULT 'Masculino',
    agressor_data_nascimento date,
    agressor_cpf text,
    agressor_rg text,
    agressor_telefone text,
    agressor_endereco text,
    agressor_vinculo_vitima text,
    agressor_possui_arma text,       -- 'Sim', 'Não', 'Não sabe'
    agressor_tipo_arma text,
    agressor_usa_alcool text,        -- 'Sim', 'Não', 'Às vezes'
    agressor_usa_drogas text,
    agressor_antecedentes text,      -- 'Sim', 'Não', 'Não sabe'
    agressor_preso_vd text,
    agressor_descricao_fisica text,
    agressor_observacoes text,

    -- Etapa 6 — Fato da Violência
    tipos_violencia text[],          -- Física, Psicológica, Sexual, Patrimonial, Moral
    primeira_agressao boolean,
    tempo_violencia text,            -- ex: "6 meses", "2 anos"
    frequencia_aumentou text,        -- 'Sim', 'Não', 'Está igual'
    data_ultima_agressao date,
    hora_agressao text,              -- Manhã, Tarde, Noite, Madrugada
    local_agressao text,
    uso_arma_fogo boolean,
    uso_arma_branca boolean,
    uso_objeto_contundente boolean,
    vitima_buscou_atendimento text,  -- 'Sim', 'Não', 'Não precisou'
    lesoes_visiveis boolean,
    lesoes_descricao text,
    ha_testemunhas boolean,
    testemunhas_nomes text,

    -- Etapa 7 — FONAR (Avaliação de Risco)
    -- Parte I: Histórico (8 perguntas)
    fonar_p1_q1 boolean, -- Agressor já praticou outras violências antes?
    fonar_p1_q2 boolean, -- Violência aumentou frequência/gravidade nos últimos 12 meses?
    fonar_p1_q3 boolean, -- Agressor já descumpriu medida protetiva?
    fonar_p1_q4 boolean, -- Agressor já ameaçou matar a vítima?
    fonar_p1_q5 boolean, -- Já tentou estrangulamento?
    fonar_p1_q6 boolean, -- Já usou arma de fogo em ameaça?
    fonar_p1_q7 boolean, -- Já espancou durante gravidez?
    fonar_p1_q8 boolean, -- Já ameaçou de morte envolvendo filhos?
    -- Parte II: Comportamento (5 perguntas)
    fonar_p2_q1 boolean, -- Faz uso abusivo de álcool?
    fonar_p2_q2 boolean, -- Faz uso de drogas ilícitas?
    fonar_p2_q3 boolean, -- Possui ciúme excessivo/comportamento controlador?
    fonar_p2_q4 boolean, -- Já ameaçou/tentou suicídio?
    fonar_p2_q5 boolean, -- Monitora passos/mensagens/redes sociais?
    -- Parte III: Situação atual (5 perguntas)
    fonar_p3_q1 boolean, -- Tem onde morar com segurança?
    fonar_p3_q2 boolean, -- Tem autonomia financeira?
    fonar_p3_q3 boolean, -- Há filhos menores na residência?
    fonar_p3_q4 boolean, -- Está grávida?
    fonar_p3_q5 boolean, -- Tem familiar/amigo que possa acolhê-la?
    -- Classificação calculada
    nivel_risco text,                -- 'Baixo', 'Médio', 'Elevado'

    -- Etapa 8 — Medidas Protetivas
    deseja_medidas_protetivas boolean,
    medidas_solicitadas text[],
    risco_iminente_morte boolean,
    necessita_acolhimento_emergencial boolean,

    -- Etapa 9 — Encaminhamentos
    encaminhamentos_realizados text[],

    -- Metadados
    fotos text[] DEFAULT '{}',
    ultimo_passo int DEFAULT 1,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.maria_da_penha ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instituições podem ver suas ocorrências MDP"
ON public.maria_da_penha FOR SELECT
USING (instituicao_id IN (
    SELECT instituicao_id FROM public.usuarios WHERE id = auth.uid()
));

CREATE POLICY "Usuários podem inserir ocorrências MDP"
ON public.maria_da_penha FOR INSERT
WITH CHECK (instituicao_id IN (
    SELECT instituicao_id FROM public.usuarios WHERE id = auth.uid()
));

CREATE POLICY "Usuários podem atualizar ocorrências MDP"
ON public.maria_da_penha FOR UPDATE
USING (instituicao_id IN (
    SELECT instituicao_id FROM public.usuarios WHERE id = auth.uid()
));

CREATE POLICY "Usuários podem excluir rascunhos MDP"
ON public.maria_da_penha FOR DELETE
USING (
    status = 'rascunho' AND
    instituicao_id IN (
        SELECT instituicao_id FROM public.usuarios WHERE id = auth.uid()
    )
);

-- Tabela de Envolvidos (Vítima e Agressor como registros na tabela padrão)
-- Usando a tabela padrão ocorrencia_envolvidos não é necessário criar nova

-- Tabela de Anotações para MDP
CREATE TABLE IF NOT EXISTS public.maria_da_penha_anotacoes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    mdp_id uuid REFERENCES public.maria_da_penha(id) ON DELETE CASCADE,
    usuario_id uuid REFERENCES auth.users(id),
    texto text NOT NULL,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.maria_da_penha_anotacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso às anotações MDP da instituição"
ON public.maria_da_penha_anotacoes FOR ALL
USING (mdp_id IN (SELECT id FROM public.maria_da_penha));

-- Trigger para Updated At
CREATE TRIGGER update_maria_da_penha_updated_at
    BEFORE UPDATE ON public.maria_da_penha
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_mdp_instituicao ON public.maria_da_penha(instituicao_id);
CREATE INDEX idx_mdp_status ON public.maria_da_penha(status);
CREATE INDEX idx_mdp_nivel_risco ON public.maria_da_penha(nivel_risco);
CREATE INDEX idx_mdp_created_at ON public.maria_da_penha(created_at DESC);
