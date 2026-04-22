-- ============================================================================
-- SCRIPT 018: OTIMIZAÇÃO DE PERFORMANCE (ÍNDICES)
-- Adicionando índices para acelerar consultas e RLS (Tenant Isolation)
-- ============================================================================

-- Garantir que colunas de relacionamento existam (evita erros se migrações anteriores falharam ou pularam)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ocorrencias' AND column_name='chamado_id') THEN
        ALTER TABLE public.ocorrencias ADD COLUMN chamado_id UUID REFERENCES public.chamados(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Índices para RLS (instituicao_id é usado em quase todas as políticas)
CREATE INDEX IF NOT EXISTS idx_ocorrencias_instituicao ON public.ocorrencias(instituicao_id);
CREATE INDEX IF NOT EXISTS idx_chamados_instituicao ON public.chamados(instituicao_id);
CREATE INDEX IF NOT EXISTS idx_veiculos_instituicao ON public.veiculos(instituicao_id);
CREATE INDEX IF NOT EXISTS idx_equipes_instituicao ON public.equipes(instituicao_id);
CREATE INDEX IF NOT EXISTS idx_escalas_instituicao ON public.escalas(instituicao_id);
CREATE INDEX IF NOT EXISTS idx_km_diario_instituicao ON public.km_diario(instituicao_id);
CREATE INDEX IF NOT EXISTS idx_abastecimentos_instituicao ON public.abastecimentos(instituicao_id);
CREATE INDEX IF NOT EXISTS idx_vistorias_instituicao ON public.vistorias(instituicao_id);

-- Índices para Ordenação (created_at é usado para listar os mais recentes)
CREATE INDEX IF NOT EXISTS idx_ocorrencias_created_at ON public.ocorrencias(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chamados_created_at ON public.chamados(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tenant_auditoria_created_at ON public.tenant_auditoria(created_at DESC);

-- Índices para Relacionamentos Frequentes
CREATE INDEX IF NOT EXISTS idx_ocorrencias_chamado_id ON public.ocorrencias(chamado_id);

CREATE INDEX IF NOT EXISTS idx_ocorrencia_envolvidos_ocorrencia_id ON public.ocorrencia_envolvidos(ocorrencia_id);
CREATE INDEX IF NOT EXISTS idx_ocorrencia_anexos_ocorrencia_id ON public.ocorrencia_anexos(ocorrencia_id);
CREATE INDEX IF NOT EXISTS idx_ocorrencia_anotacoes_ocorrencia_id ON public.ocorrencia_anotacoes(ocorrencia_id);

-- Índice para busca de usuários por instituição
CREATE INDEX IF NOT EXISTS idx_usuarios_instituicao ON public.usuarios(instituicao_id);
