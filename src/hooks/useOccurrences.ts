import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Occurrence {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  tenant_id: string;
}

export const fetchOccurrences = async (instituicaoId: string, categoria: string = 'padrao') => {
  if (!instituicaoId) return [];
  
  let tableName = 'ocorrencias';
  let involvedTableName = 'ocorrencia_envolvidos';
  let foreignKeyName = 'ocorrencia_id';

  if (categoria === 'embriaguez') {
    tableName = 'embriaguez';
    involvedTableName = 'embriaguez_envolvidos';
    foreignKeyName = 'embriaguez_id';
  } else if (categoria === 'maria_da_penha') {
    tableName = 'maria_da_penha';
  }

  const { data: ocorrencias, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('instituicao_id', instituicaoId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  if (!ocorrencias || ocorrencias.length === 0) return [];

  // Se for Maria da Penha, o gênero da vítima já está na própria tabela
  if (categoria === 'maria_da_penha') {
    return ocorrencias.map(o => ({
      ...o,
      genero: o.vitima_genero || null
    }));
  }

  const ocorrenciaIds = ocorrencias.map(o => o.id);
  
  const { data: envolvidos } = await supabase
    .from(involvedTableName)
    .select(`${foreignKeyName}, genero`)
    .in(foreignKeyName, ocorrenciaIds);

  const generosMap: Record<string, string[]> = {};
  (envolvidos || []).forEach((env: any) => {
    const ocId = env[foreignKeyName];
    if (env.genero) {
      if (!generosMap[ocId]) {
        generosMap[ocId] = [];
      }
      generosMap[ocId].push(env.genero);
    }
  });

  return ocorrencias.map(o => ({
    ...o,
    genero: generosMap[o.id]?.[0] || null
  }));
};



import { useAuthStore } from '@/store/useAuthStore';

export const useOccurrences = (categoria: string = 'padrao') => {
  const profile = useAuthStore(state => state.profile);
  
  return useQuery({
    queryKey: ['occurrences', profile?.instituicao_id, categoria],
    queryFn: () => fetchOccurrences(profile?.instituicao_id || '', categoria),
    enabled: !!profile?.instituicao_id,
    staleTime: 1000 * 60 * 10, // 10 minutos sem marcar como "velho"
    gcTime: 1000 * 60 * 30,    // 30 minutos em memória mesmo sem uso
  });
};

