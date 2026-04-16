import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  instituicao_id: string | null;
  primeiro_nome: string;
  sobrenome: string;
  perfil_acesso: 'gcm' | 'gestor' | 'super_admin' | 'comando' | 'administrativo';
  status: string;
}

interface Institution {
  id: string;
  razao_social: string;
  status_assinatura: string;
  configuracoes_locais: any;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  institution: Institution | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setInstitution: (institution: Institution | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  institution: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setInstitution: (institution) => set({ institution }),
  isLoading: true,
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user ?? null;
    
    set({ user, isLoading: !!user }); // Se tem user, fica em loading enquanto busca perfil

    if (user) {
      // Buscar perfil estendido
      const { data: profile, error: profileError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('ERRO CRÍTICO AO BUSCAR PERFIL:', profileError);
      }
      
      set({ profile });

      if (profile?.instituicao_id) {
        // Buscar dados da instituição
        const { data: institution } = await supabase
          .from('instituicoes')
          .select('*')
          .eq('id', profile.instituicao_id)
          .single();
        
        set({ institution });
      }
    }
    
    set({ isLoading: false });

    // Listen for changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      const newUser = session?.user ?? null;
      if (newUser?.id !== get().user?.id) {
        set({ user: newUser, isLoading: !!newUser });
        if (newUser) {
          const { data: profile } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', newUser.id)
            .single();
          set({ profile });

          if (profile?.instituicao_id) {
            const { data: institution } = await supabase
              .from('instituicoes')
              .select('*')
              .eq('id', profile.instituicao_id)
              .single();
            set({ institution });
          }
        } else {
          set({ profile: null, institution: null });
        }
        set({ isLoading: false });
      }
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, institution: null });
  }
}));
