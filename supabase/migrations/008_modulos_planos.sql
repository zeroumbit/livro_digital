-- ============================================================================
-- SCRIPT: SISTEMA DE MÓDULOS E FUNCIONALIDADES POR PLANO
-- Este script cria a estrutura relacional para gerir permissões do SaaS.
-- ============================================================================

-- 1. Tabela de Módulos (Agrupadores de funcionalidades)
CREATE TABLE IF NOT EXISTS public.sistema_modulos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    chave TEXT NOT NULL UNIQUE, -- ex: 'ocorrencias'
    icone TEXT, -- Nome do ícone Lucide
    descricao TEXT,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Funcionalidades (Ações específicas dentro dos módulos)
CREATE TABLE IF NOT EXISTS public.sistema_funcionalidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modulo_id UUID REFERENCES public.sistema_modulos(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    chave TEXT NOT NULL UNIQUE, -- ex: 'ocorrencias_criar'
    descricao TEXT,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.sistema_modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sistema_funcionalidades ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso (Super Admin gere, todos leem se autenticados)
CREATE POLICY "Leitura_Publica_Modulos" ON public.sistema_modulos FOR SELECT USING (true);
CREATE POLICY "Leitura_Publica_Funcionalidades" ON public.sistema_funcionalidades FOR SELECT USING (true);

-- Super Admin tem acesso total
CREATE POLICY "SuperAdmin_Total_Modulos" ON public.sistema_modulos FOR ALL USING (
    COALESCE((current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'perfil_acesso'), '') = 'super_admin'
);
CREATE POLICY "SuperAdmin_Total_Funcionalidades" ON public.sistema_funcionalidades FOR ALL USING (
    COALESCE((current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'perfil_acesso'), '') = 'super_admin'
);

-- 3. SEED: Módulos Iniciais
INSERT INTO public.sistema_modulos (nome, chave, icone, ordem) VALUES
('Dashboard', 'dashboard', 'LayoutDashboard', 1),
('Ocorrências', 'ocorrencias', 'FileText', 2),
('Viaturas', 'veiculos', 'Truck', 3),
('Equipes', 'equipes', 'Users', 4),
('Escalas', 'escalas', 'Calendar', 5),
('Combustível', 'combustivel', 'Fuel', 6),
('Câmeras/LPR', 'cameras', 'Camera', 7),
('Inteligência', 'inteligencia', 'Database', 8),
('Administrativo', 'administrativo', 'Settings', 9)
ON CONFLICT (chave) DO NOTHING;

-- 4. SEED: Funcionalidades Iniciais
-- Dashboard
INSERT INTO public.sistema_funcionalidades (modulo_id, nome, chave, ordem)
SELECT id, 'Ver Dashboard Geral', 'dashboard_visualizar', 1 FROM public.sistema_modulos WHERE chave = 'dashboard'
ON CONFLICT (chave) DO NOTHING;

-- Ocorrências
INSERT INTO public.sistema_funcionalidades (modulo_id, nome, chave, ordem) 
SELECT id, 'Ver Lista de Ocorrências', 'ocorrencias_ver', 1 FROM public.sistema_modulos WHERE chave = 'ocorrencias'
ON CONFLICT (chave) DO NOTHING;
INSERT INTO public.sistema_funcionalidades (modulo_id, nome, chave, ordem) 
SELECT id, 'Registrar Nova Ocorrência', 'ocorrencias_criar', 2 FROM public.sistema_modulos WHERE chave = 'ocorrencias'
ON CONFLICT (chave) DO NOTHING;
INSERT INTO public.sistema_funcionalidades (modulo_id, nome, chave, ordem) 
SELECT id, 'Relatórios e Estatísticas', 'ocorrencias_relatorios', 3 FROM public.sistema_modulos WHERE chave = 'ocorrencias'
ON CONFLICT (chave) DO NOTHING;

-- Viaturas
INSERT INTO public.sistema_funcionalidades (modulo_id, nome, chave, ordem) 
SELECT id, 'Gestão de Frota', 'veiculos_gestao', 1 FROM public.sistema_modulos WHERE chave = 'veiculos'
ON CONFLICT (chave) DO NOTHING;
INSERT INTO public.sistema_funcionalidades (modulo_id, nome, chave, ordem) 
SELECT id, 'Vistorias (Checklist)', 'veiculos_vistoria', 2 FROM public.sistema_modulos WHERE chave = 'veiculos'
ON CONFLICT (chave) DO NOTHING;

-- Equipes
INSERT INTO public.sistema_funcionalidades (modulo_id, nome, chave, ordem) 
SELECT id, 'Gerir Efetivo', 'equipes_gestao', 1 FROM public.sistema_modulos WHERE chave = 'equipes'
ON CONFLICT (chave) DO NOTHING;

-- Administrativo
INSERT INTO public.sistema_funcionalidades (modulo_id, nome, chave, ordem) 
SELECT id, 'Configurações do Sistema', 'admin_config', 1 FROM public.sistema_modulos WHERE chave = 'administrativo'
ON CONFLICT (chave) DO NOTHING;
INSERT INTO public.sistema_funcionalidades (modulo_id, nome, chave, ordem) 
SELECT id, 'Auditoria de Logs', 'admin_auditoria', 2 FROM public.sistema_modulos WHERE chave = 'administrativo'
ON CONFLICT (chave) DO NOTHING;
