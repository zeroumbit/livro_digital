import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

export interface Escala {
  id: string;
  instituicao_id: string;
  tipo_escala: string;
  dias_semana: string[];
  data_inicio: string;
  data_fim: string;
  validade_meses: number;
  status: 'ativa' | 'inativa';
  created_at: string;
}

export interface EscalaAgente {
  escala_id: string;
  usuario_id: string;
  equipe_id: string | null;
  agente_nome?: string;
  agente_matricula?: string;
}

export const fetchEscalas = async (instituicaoId: string) => {
  if (!instituicaoId) return [];
  
  const { data, error } = await supabase
    .from('escalas')
    .select('*')
    .eq('instituicao_id', instituicaoId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Escala[];
};

export const fetchEscalaAgentes = async (escalaId: string) => {
  const { data, error } = await supabase
    .from('escala_agentes')
    .select(`
      *,
      agente:usuario_id(primeiro_nome, sobrenome, matricula)
    `)
    .eq('escala_id', escalaId);

  if (error) throw error;
  return data;
};

export const fetchEquipes = async (instituicaoId: string) => {
  if (!instituicaoId) return [];
  
  const { data, error } = await supabase
    .from('equipes')
    .select('id, nome')
    .eq('instituicao_id', instituicaoId);

  if (error) throw error;
  return data;
};

export const fetchAgentesSemEscala = async (instituicaoId: string) => {
  if (!instituicaoId) return [];
  
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, primeiro_nome, sobrenome, matricula, funcao_operacional')
    .eq('instituicao_id', instituicaoId)
    .eq('status', 'ativo')
    .order('primeiro_nome', { ascending: true });

  if (error) throw error;
  return data;
};

export const useEscalas = () => {
  const profile = useAuthStore(state => state.profile);
  
  return useQuery({
    queryKey: ['escalas', profile?.instituicao_id],
    queryFn: () => fetchEscalas(profile?.instituicao_id || ''),
    enabled: !!profile?.instituicao_id,
  });
};

export const useEquipes = () => {
  const profile = useAuthStore(state => state.profile);
  
  return useQuery({
    queryKey: ['equipes', profile?.instituicao_id],
    queryFn: () => fetchEquipes(profile?.instituicao_id || ''),
    enabled: !!profile?.instituicao_id,
  });
};

export const useAgentes = () => {
  const profile = useAuthStore(state => state.profile);
  
  return useQuery({
    queryKey: ['agentes', profile?.instituicao_id],
    queryFn: () => fetchAgentesSemEscala(profile?.instituicao_id || ''),
    enabled: !!profile?.instituicao_id,
  });
};

export const useCreateEscala = () => {
  const queryClient = useQueryClient();
  const profile = useAuthStore(state => state.profile);
  
  return useMutation({
    mutationFn: async (data: Omit<Escala, 'id' | 'created_at' | 'instituicao_id'>) => {
      const { data: escala, error } = await supabase
        .from('escalas')
        .insert([{ ...data, instituicao_id: profile?.instituicao_id }])
        .select()
        .single();
      
      if (error) throw error;
      return escala;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalas'] });
    },
  });
};

export const useUpdateEscala = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Escala> }) => {
      const { error } = await supabase
        .from('escalas')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalas'] });
    },
  });
};

export const useDeleteEscala = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('escalas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalas'] });
    },
  });
};

export const useAddAgentesEscala = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (agentes: EscalaAgente[]) => {
      const { error } = await supabase
        .from('escala_agentes')
        .insert(agentes);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalas'] });
    },
  });
};

export const useMyEscala = () => {
  const profile = useAuthStore(state => state.profile);
  
  return useQuery({
    queryKey: ['my-escala', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;
      
      const { data, error } = await supabase
        .from('escala_agentes')
        .select(`
          *,
          escala:escala_id(*),
          equipe:equipe_id(nome)
        `)
        .eq('usuario_id', profile.id)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });
};