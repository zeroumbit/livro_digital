import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

export interface Member {
  id: string;
  instituicao_id: string;
  primeiro_nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  matricula: string;
  perfil_acesso: string;
  funcao_operacional: string;
  status: 'ativo' | 'inativo';
  patente?: string;
  created_at?: string;
}

export interface Patente {
  id: string;
  instituicao_id: string;
  nome: string;
  ordem: number;
  ativo: boolean;
}

export const usePatentes = () => {
  const profile = useAuthStore(state => state.profile);
  
  return useQuery({
    queryKey: ['patentes', profile?.instituicao_id],
    queryFn: async () => {
      if (!profile?.instituicao_id) return [];
      
      const { data, error } = await supabase
        .from('patentes')
        .select('*')
        .eq('instituicao_id', profile.instituicao_id)
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (error) throw error;
      return data as Patente[];
    },
    enabled: !!profile?.instituicao_id,
  });
};

export const useMembers = () => {
  const profile = useAuthStore(state => state.profile);
  
  return useQuery({
    queryKey: ['members', profile?.instituicao_id],
    queryFn: async () => {
      if (!profile?.instituicao_id) return [];
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('instituicao_id', profile.instituicao_id)
        .order('primeiro_nome', { ascending: true });

      if (error) throw error;
      return data as Member[];
    },
    enabled: !!profile?.instituicao_id,
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Member> }) => {
      const { error } = await supabase
        .from('usuarios')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};

export const useInviteMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      email: string;
      primeiro_nome: string;
      sobrenome: string;
      telefone: string;
      perfil_acesso: string;
      patente: string;
    }) => {
      const profile = useAuthStore.getState().profile;
      
      if (!profile?.instituicao_id) throw new Error('Instituição não encontrada');
      
      const { error } = await supabase
        .from('usuarios')
        .insert([{
          instituicao_id: profile.instituicao_id,
          email: data.email,
          primeiro_nome: data.primeiro_nome,
          sobrenome: data.sobrenome,
          telefone: data.telefone,
          perfil_acesso: data.perfil_acesso,
          patente: data.patente,
          status: 'ativo',
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};

export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};

export const useToggleMemberStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: 'ativo' | 'inativo' }) => {
      const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo';
      const { error } = await supabase
        .from('usuarios')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      return newStatus;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};
