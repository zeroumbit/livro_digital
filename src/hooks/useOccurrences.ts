import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

export interface Occurrence {
  id: string;
  instituicao_id: string;
  created_at: string;
  status?: string;
  [key: string]: any;
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
  } else if (categoria === 'chamados') {
    tableName = 'chamados_ocorrencias';
  }

  const { data: ocorrencias, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('instituicao_id', instituicaoId)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  if (!ocorrencias || ocorrencias.length === 0) return [];

  if (categoria === 'maria_da_penha' || categoria === 'chamados') {
    return ocorrencias.map((o: any) => ({
      ...o,
      genero: o.vitima_genero || o.genero || null,
      _table: tableName
    }));
  }

  const ocorrenciaIds = ocorrencias.map((o: any) => o.id);
  
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

  return ocorrencias.map((o: any) => ({
    ...o,
    genero: generosMap[o.id]?.[0] || null,
    _table: tableName
  }));
};

export const useOccurrences = (categoria: string = 'padrao') => {
  const profile = useAuthStore(state => state.profile);
  
  return useQuery({
    queryKey: ['occurrences', profile?.instituicao_id, categoria],
    queryFn: () => fetchOccurrences(profile?.instituicao_id || '', categoria),
    enabled: !!profile?.instituicao_id,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
};

export const useCreateOccurrence = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      data, 
      categoria = 'padrao' 
    }: { 
      data: Record<string, any>;
      categoria?: string;
    }) => {
      const profile = useAuthStore.getState().profile;
      if (!profile?.instituicao_id) throw new Error('Instituição não encontrada');

      let tableName = 'ocorrencias';
      if (categoria === 'embriaguez') tableName = 'embriaguez';
      else if (categoria === 'maria_da_penha') tableName = 'maria_da_penha';
      else if (categoria === 'chamados') tableName = 'chamados_ocorrencias';

      const { error } = await supabase
        .from(tableName)
        .insert([{ ...data, instituicao_id: profile.instituicao_id }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occurrences'] });
    },
  });
};

export const useUpdateOccurrence = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      data, 
      categoria = 'padrao' 
    }: { 
      id: string;
      data: Record<string, any>;
      categoria?: string;
    }) => {
      let tableName = 'ocorrencias';
      if (categoria === 'embriaguez') tableName = 'embriaguez';
      else if (categoria === 'maria_da_penha') tableName = 'maria_da_penha';
      else if (categoria === 'chamados') tableName = 'chamados_ocorrencias';

      const { error } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occurrences'] });
    },
  });
};

export const useDeleteOccurrence = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      categoria = 'padrao' 
    }: { 
      id: string;
      categoria?: string;
    }) => {
      let tableName = 'ocorrencias';
      if (categoria === 'embriaguez') tableName = 'embriaguez';
      else if (categoria === 'maria_da_penha') tableName = 'maria_da_penha';
      else if (categoria === 'chamados') tableName = 'chamados_ocorrencias';

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occurrences'] });
    },
  });
};

