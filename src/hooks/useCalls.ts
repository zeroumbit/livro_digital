import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';

export const fetchCalls = async () => {
  const { data, error } = await supabase
    .from('chamados')
    .select('*, chamados_parceiros(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const useCalls = () => {
  const profile = useAuthStore(state => state.profile);
  
  return useQuery({
    queryKey: ['calls', profile?.id],
    queryFn: fetchCalls,
    enabled: !!profile?.id,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
};

