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
    // Evitar múltiplas inicializações se já estiver carregando ou logado
    if (get().user && !get().isLoading) return;

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user ?? null;
    
    const fetchFullProfile = async (uid: string) => {
      const { data: profile } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', uid)
        .single();
      
      set({ profile });

      if (profile?.instituicao_id) {
        const { data: institution } = await supabase
          .from('instituicoes')
          .select('*, planos(*)')
          .eq('id', profile.instituicao_id)
          .single();
        
        set({ institution });
        return { profile, institution };
      }
      return { profile, institution: null };
    };

    set({ user, isLoading: !!user });

    if (user) {
      await fetchFullProfile(user.id);
      
      // REALTIME: Escutar mudanças no perfil do usuário (Singleton por sessão)
      const profileChannel = `profile-${user.id}`;
      if (!supabase.getChannels().find(c => c.topic === `realtime:${profileChannel}`)) {
          supabase
            .channel(profileChannel)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'usuarios', filter: `id=eq.${user.id}` }, 
              () => fetchFullProfile(user.id)
            ).subscribe();
      }

      // REALTIME: Escutar mudanças na instituição
      const userProfile = get().profile;
      if (userProfile?.instituicao_id) {
        const instChannel = `inst-${userProfile.instituicao_id}`;
        if (!supabase.getChannels().find(c => c.topic === `realtime:${instChannel}`)) {
            supabase
              .channel(instChannel)
              .on('postgres_changes', { event: '*', schema: 'public', table: 'instituicoes', filter: `id=eq.${userProfile.instituicao_id}` }, 
                () => fetchFullProfile(user.id)
              ).subscribe();
        }
      }
    }
    
    set({ isLoading: false });

    // Listen for Auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      const newUser = session?.user ?? null;
      if (event === 'SIGNED_IN' && newUser) {
        set({ user: newUser, isLoading: true });
        await fetchFullProfile(newUser.id);
        set({ isLoading: false });
      } else if (event === 'SIGNED_OUT') {
          // Limpar todos os canais ao sair
          supabase.removeAllChannels();
          set({ user: null, profile: null, institution: null, isLoading: false });
      }
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, institution: null });
  }
}));
