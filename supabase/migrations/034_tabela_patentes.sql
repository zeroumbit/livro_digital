-- Criação da tabela de Patentes (Cargos) customizáveis por instituição
CREATE TABLE IF NOT EXISTS public.patentes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instituicao_id UUID REFERENCES public.instituicoes(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(instituicao_id, nome)
);

-- Habilitar RLS
ALTER TABLE public.patentes ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Instituições podem ver suas patentes"
ON public.patentes FOR SELECT
USING (instituicao_id IN (
    SELECT instituicao_id FROM public.usuarios WHERE id = auth.uid()
));

CREATE POLICY "Apenas gestores podem gerenciar patentes"
ON public.patentes FOR ALL
USING (
    instituicao_id IN (SELECT instituicao_id FROM public.usuarios WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND perfil_acesso = 'gestor')
);

-- Função para popular patentes padrão ao criar nova instituição
CREATE OR REPLACE FUNCTION popular_patentes_padrao()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.patentes (instituicao_id, nome, ordem)
    VALUES
        (NEW.id, 'Comandante', 1),
        (NEW.id, 'Inspetor especial', 2),
        (NEW.id, 'Inspetor de primeira', 3),
        (NEW.id, 'Inspetor de segunda', 4),
        (NEW.id, 'Sub inspetor', 5),
        (NEW.id, 'Guarda de primeira', 6),
        (NEW.id, 'Guarda de segunda', 7)
    ON CONFLICT DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para popular patentes na criação da instituição
DROP TRIGGER IF EXISTS trigger_popular_patentes_padrao ON public.instituicoes;
CREATE TRIGGER trigger_popular_patentes_padrao
AFTER INSERT ON public.instituicoes
FOR EACH ROW
EXECUTE FUNCTION popular_patentes_padrao();

-- Script para popular as patentes para as instituições JÁ EXISTENTES
DO $$
DECLARE
    inst RECORD;
    patentes TEXT[] := ARRAY['Comandante', 'Inspetor especial', 'Inspetor de primeira', 'Inspetor de segunda', 'Sub inspetor', 'Guarda de primeira', 'Guarda de segunda'];
    i INTEGER;
BEGIN
    FOR inst IN SELECT id FROM public.instituicoes LOOP
        FOR i IN 1..array_length(patentes, 1) LOOP
            INSERT INTO public.patentes (instituicao_id, nome, ordem)
            VALUES (inst.id, patentes[i], i)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END;
$$;
