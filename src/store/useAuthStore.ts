import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  instituicao_id: string | null;
  primeiro_nome: string;
  sobrenome: string;
  email: string | null;
  telefone: string | null;
  matricula: string | null;
  patente: string | null;
  funcao_operacional: string | null;
  perfil_acesso: 'gcm' | 'gestor' | 'super_admin' | 'comando' | 'administrativo';
  status: string;
  created_at: string | null;
}

interface Institution {
  id: string;
  razao_social: string | null;
  cnpj: string | null;
  slug: string | null;
  telefone: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  status_assinatura: string | null;
  gestor_user_id: string | null;
  // Dados do gestor (secretário)
  gestor_nome_completo: string | null;
  gestor_como_chamado: string | null;
  gestor_telefone: string | null;
  gestor_email: string | null;
  plano_id: string | null;
  configuracoes_locais: any;
  created_at: string | null;
  updated_at: string | null;
  planos: any | null;
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
    // Evita múltiplas chamadas simultâneas se já estivermos carregando
    // mas permitimos a PRIMEIRA chamada que já nasce com isLoading: true
    if (get().user && !get().isLoading) return;
    
    // Se já temos uma sessão sendo buscada (exceto na inicialização), ignoramos
    // Para identificar se é a inicialização, checamos se o user é null e isLoading é true
    // mas permitimos seguir se for a primeira execução do App.tsx

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user ?? null;
    
    const fetchFullProfile = async (uid: string) => {
      const { data: profile } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', uid)
        .single();
      
      if (profile) {
        set({ profile });

        if (profile.instituicao_id) {
          const { data: institution } = await supabase
            .from('instituicoes')
            .select('*, planos(*)')
            .eq('id', profile.instituicao_id)
            .single();
          
          set({ institution });
        }
      }
    };

    set({ user });

    if (user) {
      await fetchFullProfile(user.id);
    }
    
    set({ isLoading: false });

    // Auth listener para mudanças de sessão
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        set({ user: session.user });
        fetchFullProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
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
