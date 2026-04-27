-- Criação da tabela específica para Ocorrências de Embriaguez
-- Isso isola fisicamente os dados técnicos e operacionais de embriaguez das ocorrências padrão.

CREATE TABLE IF NOT EXISTS public.embriaguez (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    instituicao_id uuid REFERENCES public.instituicoes(id) ON DELETE CASCADE,
    criador_id uuid REFERENCES auth.users(id),
    
    -- Dados Básicos
    numero_oficial serial,
    status text DEFAULT 'rascunho',
    origem text,
    origem_tipo text, -- 'RADIO', 'AGENTE', 'PARCEIRO'
    natureza text[],
    descricao text,
    
    -- Localização
    rua text,
    numero text,
    bairro text,
    cidade text,
    estado text,
    cep text,
    referencia text,
    coordenadas text,
    
    -- Módulo Técnico (Etilômetro)
    etilometro_realizado boolean DEFAULT false,
    etilometro_marca text,
    etilometro_serie text,
    etilometro_resultado text,
    etilometro_validade date,
    etilometro_justificativa text, -- Obrigatório quando etilometro_realizado = false
    
    -- Sinais Clínicos
    sinais_aparencia text[],
    sinais_atitude text[],
    
    -- Testes de Coordenação
    teste_linha_reta text,
    teste_um_pe text,
    teste_dedo_nariz text,
    
    -- Relato e Conclusão
    admitiu_ingestao text,
    ingestao_quantidade text,
    ingestao_tempo text,
    conclusao_tecnica text,
    
    -- Metadados
    fotos text[] DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.embriaguez ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso (Seguindo o padrão do sistema)
CREATE POLICY "Instituições podem ver suas próprias embriaguez"
ON public.embriaguez FOR SELECT
USING (instituicao_id IN (
    SELECT instituicao_id FROM public.usuarios WHERE id = auth.uid()
));

CREATE POLICY "Usuários podem inserir embriaguez na sua instituição"
ON public.embriaguez FOR INSERT
WITH CHECK (instituicao_id IN (
    SELECT instituicao_id FROM public.usuarios WHERE id = auth.uid()
));

CREATE POLICY "Usuários podem atualizar embriaguez da sua instituição"
ON public.embriaguez FOR UPDATE
USING (instituicao_id IN (
    SELECT instituicao_id FROM public.usuarios WHERE id = auth.uid()
));

-- Tabela de Envolvidos para Embriaguez (ou usar a existente se for compatível)
-- Vamos criar uma específica para garantir isolamento total conforme solicitado
CREATE TABLE IF NOT EXISTS public.embriaguez_envolvidos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    embriaguez_id uuid REFERENCES public.embriaguez(id) ON DELETE CASCADE,
    nome_completo text NOT NULL,
    tipo text, -- 'Suspeito', 'Testemunha', etc
    genero text,
    cpf text,
    rg text,
    telefone text,
    descricao_fisica text,
    declaracao text,
    observacoes text,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.embriaguez_envolvidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso total aos envolvidos da instituição"
ON public.embriaguez_envolvidos FOR ALL
USING (embriaguez_id IN (
    SELECT id FROM public.embriaguez
));

-- Tabela de Anotações para Embriaguez
CREATE TABLE IF NOT EXISTS public.embriaguez_anotacoes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    embriaguez_id uuid REFERENCES public.embriaguez(id) ON DELETE CASCADE,
    usuario_id uuid REFERENCES auth.users(id),
    texto text NOT NULL,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.embriaguez_anotacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso total às anotações da instituição"
ON public.embriaguez_anotacoes FOR ALL
USING (embriaguez_id IN (
    SELECT id FROM public.embriaguez
));

-- Trigger para Updated At
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_embriaguez_updated_at
    BEFORE UPDATE ON public.embriaguez
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
