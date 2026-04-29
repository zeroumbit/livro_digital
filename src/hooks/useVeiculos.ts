import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

export interface Veiculo {
  id: string;
  instituicao_id: string;
  placa: string;
  ano: number;
  marca: string;
  modelo: string;
  tipo_veiculo: string;
  tipo_combustivel: string;
  status: string;
  equipe_id?: string | null;
  created_at: string;
}

export const useVeiculos = () => {
  const { institution } = useAuthStore();
  
  return useQuery({
    queryKey: ['veiculos', institution?.id],
    queryFn: async () => {
      if (!institution?.id) return [];
      
      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .eq('instituicao_id', institution.id)
        .order('placa', { ascending: true });

      if (error) throw error;
      return data as Veiculo[];
    },
    enabled: !!institution?.id,
  });
};

export const useUpdateVeiculo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Veiculo> }) => {
      const { error } = await supabase
        .from('veiculos')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veiculos'] });
    },
  });
};
