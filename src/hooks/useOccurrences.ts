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

export const fetchOccurrences = async (instituicaoId: string) => {
  if (!instituicaoId) return [];
  
  const { data: ocorrencias, error } = await supabase
    .from('ocorrencias')
    .select('id, numero_oficial, status, prioridade, natureza, rua, numero, bairro, cep, cidade, estado, referencia, created_at, categoria, ultimo_passo, natureza_alteracao, origem, origem_tipo, descricao, fotos')




    .eq('instituicao_id', instituicaoId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  if (!ocorrencias || ocorrencias.length === 0) return [];

  const ocorrenciaIds = ocorrencias.map(o => o.id);
  
  const { data: envolvidos } = await supabase
    .from('ocorrencia_envolvidos')
    .select('ocorrencia_id, genero')
    .in('ocorrencia_id', ocorrenciaIds);

  const generosMap: Record<string, string[]> = {};
  (envolvidos || []).forEach((env: any) => {
    if (env.genero) {
      if (!generosMap[env.ocorrencia_id]) {
        generosMap[env.ocorrencia_id] = [];
      }
      generosMap[env.ocorrencia_id].push(env.genero);
    }
  });

  return ocorrencias.map(o => ({
    ...o,
    genero: generosMap[o.id]?.[0] || null
  }));
};



import { useAuthStore } from '@/store/useAuthStore';

export const useOccurrences = () => {
  const profile = useAuthStore(state => state.profile);
  
  return useQuery({
    queryKey: ['occurrences', profile?.instituicao_id],
    queryFn: () => fetchOccurrences(profile?.instituicao_id || ''),
    enabled: !!profile?.instituicao_id,
    staleTime: 1000 * 60 * 10, // 10 minutos sem marcar como "velho"
    gcTime: 1000 * 60 * 30,    // 30 minutos em memória mesmo sem uso
  });
};

