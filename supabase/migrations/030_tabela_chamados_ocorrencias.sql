-- ============================================================================
-- MIGRAÇÃO 030: TABELA ISOLADA PARA OCORRÊNCIAS VIA CHAMADOS
-- Quando um chamado rápido é convertido em ocorrência completa, salva aqui.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.chamados_ocorrencias (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    instituicao_id uuid REFERENCES public.instituicoes(id) ON DELETE CASCADE,
    criador_id uuid REFERENCES auth.users(id),
    
    -- Link para o chamado original (se veio de um chamado)
    chamado_id uuid REFERENCES public.chamados(id) ON DELETE SET NULL,
    
    -- Dados Básicos
    numero_oficial serial,
    status text DEFAULT 'rascunho',
    titulo text,
    prioridade text DEFAULT 'media',
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
    
    -- Sub-origem (canal do chamado)
    canal_origem text,
    tipo_origem text,
    
    -- Metadados
    fotos text[] DEFAULT '{}',
    ultimo_passo int DEFAULT 1,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.chamados_ocorrencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instituições podem ver suas ocorrências via chamados"
ON public.chamados_ocorrencias FOR SELECT
USING (instituicao_id IN (
    SELECT instituicao_id FROM public.usuarios WHERE id = auth.uid()
));

CREATE POLICY "Usuários podem inserir ocorrências via chamados"
ON public.chamados_ocorrencias FOR INSERT
WITH CHECK (instituicao_id IN (
    SELECT instituicao_id FROM public.usuarios WHERE id = auth.uid()
));

CREATE POLICY "Usuários podem atualizar ocorrências via chamados"
ON public.chamados_ocorrencias FOR UPDATE
USING (instituicao_id IN (
    SELECT instituicao_id FROM public.usuarios WHERE id = auth.uid()
));

CREATE POLICY "Usuários podem excluir rascunhos via chamados"
ON public.chamados_ocorrencias FOR DELETE
USING (
    status = 'rascunho' AND
    instituicao_id IN (
        SELECT instituicao_id FROM public.usuarios WHERE id = auth.uid()
    )
);

-- Índices para performance
CREATE INDEX idx_chamados_oc_instituicao ON public.chamados_ocorrencias(instituicao_id);
CREATE INDEX idx_chamados_oc_status ON public.chamados_ocorrencias(status);
CREATE INDEX idx_chamados_oc_created_at ON public.chamados_ocorrencias(created_at DESC);
CREATE INDEX idx_chamados_oc_chamado_id ON public.chamados_ocorrencias(chamado_id);

-- Trigger para Updated At
CREATE TRIGGER update_chamados_ocorrencias_updated_at
    BEFORE UPDATE ON public.chamados_ocorrencias
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();