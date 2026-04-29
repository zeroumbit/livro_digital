-- Adiciona a coluna equipe_id na tabela de veículos para permitir a vinculação
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS equipe_id UUID REFERENCES public.equipes(id) ON DELETE SET NULL;

-- Atualiza a política de RLS se necessário (geralmente a política de isolation do tenant já cobre novas colunas)
