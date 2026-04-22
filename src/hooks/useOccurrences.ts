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
  
  const { data, error } = await supabase
    .from('ocorrencias')
    .select('id, numero_oficial, status, prioridade, natureza, bairro, created_at')
    .eq('instituicao_id', instituicaoId)
    .order('created_at', { ascending: false })
    .limit(50); // Limita a 50 para carregamento ultra-rápido

  if (error) throw error;
  return data;
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

