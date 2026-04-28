import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import type { Member } from './useMembers';

export interface TeamInfo {
  id: string;
  nome: string;
  descricao?: string;
  instituicao_id: string;
  created_at: string;
}

export interface MyTeamData {
  team: TeamInfo | null;
  members: Member[];
  isLeader: boolean;
}

export const useMyTeam = () => {
  const profile = useAuthStore(state => state.profile);
  
  return useQuery({
    queryKey: ['my-team', profile?.id],
    queryFn: async (): Promise<MyTeamData> => {
      if (!profile?.id || !profile?.instituicao_id) {
        return { team: null, members: [], isLeader: false };
      }

      // Buscar a equipe do usuário através da tabela escala_agentes
      const { data: escalaAgentes, error: escalaError } = await supabase
        .from('escala_agentes')
        .select(`
          equipe_id,
          equipes!inner(
            id,
            nome,
            descricao,
            instituicao_id,
            created_at
          )
        `)
        .eq('usuario_id', profile.id)
        .not('equipe_id', 'is', null)
        .limit(1);

      if (escalaError) throw escalaError;

      // Determinar a equipe do usuário
      let userTeam: TeamInfo | null = null;
      let isLeader = false;

      if (escalaAgentes && escalaAgentes.length > 0 && escalaAgentes[0].equipe) {
        userTeam = escalaAgentes[0].equipe as unknown as TeamInfo;
        
        // Verificar se o usuário é líder baseado no perfil_acesso
        // Perfis que podem ser líderes: comando, chefe_equipe
        const leaderProfiles = ['comando', 'chefe_equipe', 'gestor'];
        isLeader = leaderProfiles.includes(profile.perfil_acesso);
      }

      // Buscar membros da equipe
      let members: Member[] = [];
      if (userTeam) {
        // Buscar membros através da tabela escala_agentes
        const { data: teamMembers, error: membersError } = await supabase
          .from('escala_agentes')
          .select(`
            usuarios!inner(*)
          `)
          .eq('equipe_id', userTeam.id);

        if (membersError) throw membersError;

        if (teamMembers && teamMembers.length > 0) {
          members = teamMembers
            .map((item: any) => item.usuario)
            .filter(Boolean) as Member[];
        }
      }

      return { team: userTeam, members, isLeader };
    },
    enabled: !!profile?.id && !!profile?.instituicao_id,
  });
};
