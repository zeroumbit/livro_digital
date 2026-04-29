import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

// ============================================================================
// KM DIÁRIO
// ============================================================================

export interface KmDiario {
  id: string;
  veiculo_id: string;
  usuario_id: string;
  quilometragem: number;
  turno: string;
  data_registro: string;
  observacoes?: string;
  created_at: string;
  veiculo?: {
    placa: string;
    marca: string;
    modelo: string;
  };
  usuario?: {
    primeiro_nome: string;
    sobrenome: string;
  };
}

export const useKmDiario = () => {
  const { institution } = useAuthStore();
  
  return useQuery({
    queryKey: ['km-diario', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return [];
      
      const { data, error } = await supabase
        .from('km_diario')
        .select(`
          *,
          veiculo:veiculo_id(placa, marca, modelo),
          usuario:usuario_id(primeiro_nome, sobrenome)
        `)
        .eq('instituicao_id', institution.id)
        .order('data_registro', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as KmDiario[];
    },
    enabled: !!institution?.id,
  });
};

export const useCreateKmDiario = () => {
  const queryClient = useQueryClient();
  const { institution, user } = useAuthStore();
  
  return useMutation({
    mutationFn: async (data: Omit<KmDiario, 'id' | 'created_at' | 'usuario_id'>) => {
      const { data: res, error } = await supabase
        .from('km_diario')
        .insert([{ 
          ...data, 
          instituicao_id: institution?.id, 
          usuario_id: user?.id 
        }])
        .select()
        .single();
      
      if (error) throw error;
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['km-diario'] });
    },
  });
};

// ============================================================================
// VISTORIAS
// ============================================================================

export interface Vistoria {
  id: string;
  veiculo_id: string;
  usuario_id: string;
  tipo_vistoria: string;
  observacoes_gerais?: string;
  created_at: string;
  veiculo?: {
    placa: string;
  };
}

export const useVistorias = () => {
  const { institution } = useAuthStore();
  
  return useQuery({
    queryKey: ['vistorias', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return [];
      
      const { data, error } = await supabase
        .from('vistorias')
        .select(`
          *,
          veiculo:veiculo_id(placa)
        `)
        .eq('instituicao_id', institution.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Vistoria[];
    },
    enabled: !!institution?.id,
  });
};

// ============================================================================
// ABASTECIMENTOS
// ============================================================================

export interface Abastecimento {
  id: string;
  veiculo_id: string;
  usuario_id: string;
  km_inicial: number;
  km_final: number;
  litros: number;
  custo_total: number;
  posto?: string;
  consumo_real?: number;
  eficiencia?: number;
  alerta_gerado?: string;
  created_at: string;
  veiculo?: {
    placa: string;
  };
}

export const useAbastecimentos = () => {
  const { institution } = useAuthStore();
  
  return useQuery({
    queryKey: ['abastecimentos', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return [];
      
      const { data, error } = await supabase
        .from('abastecimentos')
        .select(`
          *,
          veiculo:veiculo_id(placa)
        `)
        .eq('instituicao_id', institution.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Abastecimento[];
    },
    enabled: !!institution?.id,
  });
};
