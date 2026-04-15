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

export const useOccurrences = () => {
  return useQuery({
    queryKey: ['occurrences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('occurrences')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Occurrence[];
    },
  });
};
