-- ============================================================================
-- SCRIPT 007: OPERAÇÃO E GESTÃO DO TENANT (GUARDA MUNICIPAL)
-- Baseado nos documentos de regras, ocorrências, chamados, viaturas e efetivo.
-- ============================================================================

-- ============================================================================
-- 1. CONFIGURAÇÕES LOCAIS E ESTRUTURA BASE (Bairros e Nomenclaturas)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.bairros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instituicao_id UUID REFERENCES public.instituicoes(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Permite ao Gestor renomear "Chefe de Equipe", "Comandante", etc.
CREATE TABLE IF NOT EXISTS public.tenant_configuracoes (
    instituicao_id UUID PRIMARY KEY REFERENCES public.instituicoes(id) ON DELETE CASCADE,
    nomenclaturas JSONB DEFAULT '{"comandante_geral": "Comandante Geral", "chefe_equipe": "Chefe de Equipe", "operador_radio": "Operador de Rádio"}',
    modulos_visiveis JSONB DEFAULT '[]',
    alertas_automaticos_on BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 2. GESTÃO DE EFETIVO (Equipes e Escalas)
-- ============================================================================

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

CREATE TABLE IF NOT EXISTS public.escalas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instituicao_id UUID REFERENCES public.instituicoes(id) ON DELETE CASCADE,
    tipo_escala TEXT NOT NULL CHECK (tipo_escala IN ('12x72', '12x36', '24x48', '24x72', '6x1', '5x2', '12x60', '8x40', 'mista_8_12', '4x2', '24x24', '48x96', 'dias_semana')),
    dias_semana TEXT[], -- Para quando o tipo for 'dias_semana'
    data_inicio DATE NOT NULL,
    validade_meses INTEGER NOT NULL CHECK (validade_meses BETWEEN 1 AND 12),
    data_fim DATE NOT NULL, -- Calculada no frontend/trigger
    status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa')),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.escala_agentes (
    escala_id UUID REFERENCES public.escalas(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    equipe_id UUID REFERENCES public.equipes(id) ON DELETE SET NULL,
    PRIMARY KEY (escala_id, usuario_id)
);

-- ============================================================================
-- 3. LOGÍSTICA: FROTA, VISTORIAS, KM E COMBUSTÍVEL
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.veiculos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instituicao_id UUID REFERENCES public.instituicoes(id) ON DELETE CASCADE,
    placa TEXT NOT NULL,
    ano INTEGER NOT NULL,
    marca TEXT NOT NULL,
    modelo TEXT NOT NULL,
    tipo_veiculo TEXT NOT NULL CHECK (tipo_veiculo IN ('Moto', 'Carro', 'Caminhão', 'Outro')),
    tipo_combustivel TEXT CHECK (tipo_combustivel IN ('Gasolina comum', 'Gasolina aditivada', 'Gasolina premium', 'Etanol hidratado', 'Etanol anidro', 'Diesel S-500', 'Diesel S-10', 'GNV', 'Biodiesel', 'Flex')),
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'em_manutencao')),
    created_at TIMESTAMPTZ DEFAULT now()
);

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
    -- REGRA CRÍTICA: Bloqueia quilometragem duplicada na mesma viatura e turno
    UNIQUE(veiculo_id, data_registro, turno)
);

CREATE TABLE IF NOT EXISTS public.vistorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instituicao_id UUID REFERENCES public.instituicoes(id) ON DELETE CASCADE,
    veiculo_id UUID REFERENCES public.veiculos(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.usuarios(id),
    tipo_vistoria TEXT NOT NULL CHECK (tipo_vistoria IN ('Saída', 'Entrada', 'Preventiva', 'Corretiva')),
    observacoes_gerais TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Armazena os itens individuais da vistoria (Luzes, Freios, Pneus, etc)
CREATE TABLE IF NOT EXISTS public.vistoria_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vistoria_id UUID REFERENCES public.vistorias(id) ON DELETE CASCADE,
    item_nome TEXT NOT NULL,
    status_item TEXT NOT NULL CHECK (status_item IN ('OK', 'Necessita', 'Crítico')),
    observacao TEXT
);

CREATE TABLE IF NOT EXISTS public.abastecimentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instituicao_id UUID REFERENCES public.instituicoes(id) ON DELETE CASCADE,
    veiculo_id UUID REFERENCES public.veiculos(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.usuarios(id),
    km_inicial INTEGER NOT NULL,
    km_final INTEGER NOT NULL,
    litros DECIMAL(10,2) NOT NULL,
    custo_total DECIMAL(10,2) NOT NULL,
    posto TEXT,
    consumo_real DECIMAL(10,2), -- Calculado (km_percorridos / litros)
    eficiencia DECIMAL(10,2),   -- Calculado em % baseado na meta
    alerta_gerado TEXT CHECK (alerta_gerado IN ('CRITICO', 'ATENCAO', 'ELOGIO', 'NORMAL')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 4. OCORRÊNCIAS E CHAMADOS (O Coração da Operação)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.chamados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instituicao_id UUID REFERENCES public.instituicoes(id) ON DELETE CASCADE,
    criador_id UUID REFERENCES public.usuarios(id),
    status TEXT NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_andamento', 'resolvido', 'fechado')),
    prioridade TEXT NOT NULL CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
    natureza TEXT[] NOT NULL,
    qtde_envolvidos TEXT NOT NULL,
    rua TEXT NOT NULL,
    bairro TEXT NOT NULL,
    coordenadas TEXT,
    detalhes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chamados_parceiros (
    chamado_id UUID REFERENCES public.chamados(id) ON DELETE CASCADE,
    parceiro_tipo TEXT NOT NULL, 
    status_resposta TEXT NOT NULL DEFAULT 'pendente' CHECK (status_resposta IN ('pendente', 'aceito', 'recusado', 'no_local')),
    hora_resposta TIMESTAMPTZ,
    notas TEXT,
    PRIMARY KEY (chamado_id, parceiro_tipo)
);

CREATE TABLE IF NOT EXISTS public.ocorrencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instituicao_id UUID REFERENCES public.instituicoes(id) ON DELETE CASCADE,
    criador_id UUID REFERENCES public.usuarios(id),
    chamado_id UUID REFERENCES public.chamados(id) ON DELETE SET NULL, -- Se veio de um chamado
    numero_oficial SERIAL, -- O Postgres cuida de incrementar automaticamente
    status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'aberta', 'em_atendimento', 'finalizada', 'arquivada')),
    prioridade TEXT NOT NULL DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica', 'urgente')),
    
    origem TEXT NOT NULL, 
    origem_tipo TEXT NOT NULL CHECK (origem_tipo IN ('RADIO', 'AGENTE', 'PARCEIRO')),
    canal_origem TEXT,
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

CREATE TABLE IF NOT EXISTS public.ocorrencia_envolvidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ocorrencia_id UUID REFERENCES public.ocorrencias(id) ON DELETE CASCADE,
    nome_completo TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('Vítima', 'Suspeito', 'Testemunha', 'Informante', 'Outro')),
    genero TEXT,
    cpf TEXT, -- Validação de 11 dígitos tratada no frontend (Zod)
    rg TEXT,
    telefone TEXT,
    descricao_fisica TEXT,
    declaracao TEXT,
    observacoes TEXT
);

CREATE TABLE IF NOT EXISTS public.ocorrencia_anexos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ocorrencia_id UUID REFERENCES public.ocorrencias(id) ON DELETE CASCADE,
    url_arquivo TEXT NOT NULL,
    tipo TEXT NOT NULL,
    tamanho_bytes INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ocorrencia_anotacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ocorrencia_id UUID REFERENCES public.ocorrencias(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.usuarios(id),
    texto TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 5. AUDITORIA LOCAL (Apenas Gestor)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tenant_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instituicao_id UUID REFERENCES public.instituicoes(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.usuarios(id),
    acao TEXT NOT NULL,
    modulo TEXT NOT NULL,
    detalhe TEXT NOT NULL,
    risco TEXT NOT NULL DEFAULT 'baixo' CHECK (risco IN ('baixo', 'medio', 'alto', 'critico')),
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 6. SEGURANÇA: TENANT ISOLATION E RLS
-- ============================================================================

ALTER TABLE public.bairros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.km_diario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vistorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abastecimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocorrencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chamados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_auditoria ENABLE ROW LEVEL SECURITY;

-- Função utilitária para pegar o instituicao_id do usuário logado de forma ultra-rápida
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS UUID AS $$
  SELECT instituicao_id FROM public.usuarios WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Aplica a regra: Só pode ver e editar dados se pertencerem à instituição do usuário logado
DROP POLICY IF EXISTS "Tenant_Isolation_bairros" ON public.bairros;
CREATE POLICY "Tenant_Isolation_bairros" ON public.bairros FOR ALL USING (instituicao_id = current_tenant_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "Tenant_Isolation_tenant_configuracoes" ON public.tenant_configuracoes;
CREATE POLICY "Tenant_Isolation_tenant_configuracoes" ON public.tenant_configuracoes FOR ALL USING (instituicao_id = current_tenant_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "Tenant_Isolation_equipes" ON public.equipes;
CREATE POLICY "Tenant_Isolation_equipes" ON public.equipes FOR ALL USING (instituicao_id = current_tenant_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "Tenant_Isolation_escalas" ON public.escalas;
CREATE POLICY "Tenant_Isolation_escalas" ON public.escalas FOR ALL USING (instituicao_id = current_tenant_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "Tenant_Isolation_veiculos" ON public.veiculos;
CREATE POLICY "Tenant_Isolation_veiculos" ON public.veiculos FOR ALL USING (instituicao_id = current_tenant_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "Tenant_Isolation_km_diario" ON public.km_diario;
CREATE POLICY "Tenant_Isolation_km_diario" ON public.km_diario FOR ALL USING (instituicao_id = current_tenant_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "Tenant_Isolation_vistorias" ON public.vistorias;
CREATE POLICY "Tenant_Isolation_vistorias" ON public.vistorias FOR ALL USING (instituicao_id = current_tenant_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "Tenant_Isolation_abastecimentos" ON public.abastecimentos;
CREATE POLICY "Tenant_Isolation_abastecimentos" ON public.abastecimentos FOR ALL USING (instituicao_id = current_tenant_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "Tenant_Isolation_ocorrencias" ON public.ocorrencias;
CREATE POLICY "Tenant_Isolation_ocorrencias" ON public.ocorrencias FOR ALL USING (instituicao_id = current_tenant_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "Tenant_Isolation_chamados" ON public.chamados;
CREATE POLICY "Tenant_Isolation_chamados" ON public.chamados FOR ALL USING (instituicao_id = current_tenant_id() OR public.is_super_admin());

DROP POLICY IF EXISTS "Tenant_Isolation_tenant_auditoria" ON public.tenant_auditoria;
CREATE POLICY "Tenant_Isolation_tenant_auditoria" ON public.tenant_auditoria FOR ALL USING (instituicao_id = current_tenant_id() OR public.is_super_admin());


-- ============================================================================
-- 7. TRIGGERS DE SEGURANÇA E REGRAS DE NEGÓCIO DA OPERAÇÃO
-- ============================================================================

-- REGRA 1: Imutabilidade das Ocorrências
-- Documento 0 REGRAS: "Apenas ocorrências com status rascunho podem ser editadas."
CREATE OR REPLACE FUNCTION tg_block_ocorrencia_edit() RETURNS TRIGGER AS $$
BEGIN
    -- Se já estava finalizada, arquivada ou em atendimento, bloqueia QUALQUER alteração, 
    -- inclusive tentar voltar para rascunho.
    IF OLD.status IN ('finalizada', 'arquivada', 'em_atendimento') THEN
        -- A única exceção seria o Super Admin, mas a regra aqui é geral para o sistema.
        RAISE EXCEPTION 'Imutabilidade: Esta ocorrência já foi processada e não admite mais alterações de dados ou status.';
    END IF;

    -- Se está em rascunho, permite tudo (incluindo finalizar)
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS tr_ocorrencia_imutavel ON public.ocorrencias;
CREATE TRIGGER tr_ocorrencia_imutavel
    BEFORE UPDATE ON public.ocorrencias
    FOR EACH ROW EXECUTE FUNCTION tg_block_ocorrencia_edit();

-- REGRA 2: Anotações com Janela de 5 Minutos
CREATE OR REPLACE FUNCTION tg_block_anotacao_timeout() RETURNS TRIGGER AS $$
BEGIN
    IF (NOW() - OLD.criado_em) > INTERVAL '5 minutes' THEN
        RAISE EXCEPTION 'Auditoria: Anotações não podem ser editadas ou removidas após 5 minutos.';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_anotacao_timeout_update ON public.ocorrencia_anotacoes;
CREATE TRIGGER tr_anotacao_timeout_update BEFORE UPDATE ON public.ocorrencia_anotacoes FOR EACH ROW EXECUTE FUNCTION tg_block_anotacao_timeout();

DROP TRIGGER IF EXISTS tr_anotacao_timeout_delete ON public.ocorrencia_anotacoes;
CREATE TRIGGER tr_anotacao_timeout_delete BEFORE DELETE ON public.ocorrencia_anotacoes FOR EACH ROW EXECUTE FUNCTION tg_block_anotacao_timeout();

-- REGRA 3: Cálculo automático de Combustível
CREATE OR REPLACE FUNCTION tg_calcula_combustivel() RETURNS TRIGGER AS $$
BEGIN
    -- Calcula KM percorridos e Consumo
    NEW.consumo_real := (NEW.km_final - NEW.km_inicial) / NULLIF(NEW.litros, 0);
    
    -- Lógica simplificada de Eficiência: Assumindo Gasolina = 10km/L como base se não acharmos a viatura na hora
    NEW.eficiencia := (NEW.consumo_real / 10.0) * 100;
    
    -- Definir Alertas Baseado no Documento 0 REGRAS
    IF (NEW.km_final < NEW.km_inicial) OR ((NEW.km_final - NEW.km_inicial) > 800) THEN
        NEW.alerta_gerado := 'CRITICO';
    ELSIF NEW.eficiencia < 70 THEN
        NEW.alerta_gerado := 'ATENCAO';
    ELSIF NEW.eficiencia > 115 THEN
        NEW.alerta_gerado := 'ELOGIO';
    ELSE
        NEW.alerta_gerado := 'NORMAL';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_calcula_abastecimento ON public.abastecimentos;
CREATE TRIGGER tr_calcula_abastecimento
    BEFORE INSERT OR UPDATE ON public.abastecimentos
    FOR EACH ROW EXECUTE FUNCTION tg_calcula_combustivel();
