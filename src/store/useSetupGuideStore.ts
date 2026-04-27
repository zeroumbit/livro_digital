import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './useAuthStore';

export interface SetupStep {
  id: string;
  label: string;
  description: string;
  path: string;
  completed: boolean;
  completedAt?: string;
}

interface SetupGuideState {
  isDismissed: boolean;
  dismissedAt?: string;
  steps: SetupStep[];
  setDismissed: (dismissed: boolean) => void;
  markStepCompleted: (stepId: string) => void;
  refreshSteps: () => Promise<void>;
  isAllCompleted: () => boolean;
}

const STEPS_CONFIG: SetupStep[] = [
  {
    id: 'efetivo',
    label: 'Efetivo',
    description: 'Cadastre os agentes da sua equipe',
    path: '/usuarios',
    completed: false,
  },
  {
    id: 'territorios',
    label: 'Territórios',
    description: 'Defina bairros e zonas de atuação',
    path: '/configuracoes',
    completed: false,
  },
  {
    id: 'parceiros',
    label: 'Parceiros',
    description: 'Configure PM, SAMU e Defesa Civil',
    path: '/configuracoes',
    completed: false,
  },
  {
    id: 'equipes',
    label: 'Equipes',
    description: 'Agrupamento dos agentes',
    path: '/equipes',
    completed: false,
  },
  {
    id: 'frota',
    label: 'Frota',
    description: 'Cadastre as viaturas',
    path: '/veiculos',
    completed: false,
  },
  {
    id: 'escalas',
    label: 'Escalas',
    description: 'Defina turnos e regimes',
    path: '/escalas',
    completed: false,
  },
];

export const useSetupGuideStore = create<SetupGuideState>()(
  persist(
    (set, get) => ({
      isDismissed: false,
      steps: STEPS_CONFIG,

      setDismissed: (dismissed) => {
        set({
          isDismissed: dismissed,
          dismissedAt: dismissed ? new Date().toISOString() : undefined,
        });
      },

      markStepCompleted: (stepId) => {
        set((state) => ({
          steps: state.steps.map((s) =>
            s.id === stepId ? { ...s, completed: true, completedAt: new Date().toISOString() } : s
          ),
        }));
      },

      refreshSteps: async () => {
        const { profile } = useAuthStore.getState();
        if (!profile?.instituicao_id) return;

        const tenantId = profile.instituicao_id;

        const [
          usuariosResult,
          bairrosResult,
          veiculosResult,
          equipesResult,
        ] = await Promise.allSettled([
          supabase.from('usuarios').select('id', { count: 'exact', head: true }).eq('instituicao_id', tenantId),
          supabase.from('bairros').select('id', { count: 'exact', head: true }).eq('instituicao_id', tenantId),
          supabase.from('veiculos').select('id', { count: 'exact', head: true }).eq('instituicao_id', tenantId),
          supabase.from('equipes').select('id', { count: 'exact', head: true }).eq('instituicao_id', tenantId),
        ]);

        const hasUsuarios = usuariosResult.status === 'fulfilled' && (usuariosResult.value as any)?.count > 0;
        const hasBairros = bairrosResult.status === 'fulfilled' && (bairrosResult.value as any)?.count > 0;
        const hasVeiculos = veiculosResult.status === 'fulfilled' && (veiculosResult.value as any)?.count > 0;
        const hasEquipes = equipesResult.status === 'fulfilled' && (equipesResult.value as any)?.count > 0;

        set((state) => ({
          steps: [
            { ...state.steps[0], completed: hasUsuarios },
            { ...state.steps[1], completed: hasBairros },
            { ...state.steps[2], completed: hasBairros },
            { ...state.steps[3], completed: hasEquipes },
            { ...state.steps[4], completed: hasVeiculos },
            { ...state.steps[5], completed: false },
          ],
        }));
      },

      isAllCompleted: () => {
        return get().steps.every((s) => s.completed);
      },
    }),
    {
      name: 'setup-guide-storage',
      partialize: (state) => ({
        isDismissed: state.isDismissed,
        dismissedAt: state.dismissedAt,
        steps: state.steps,
      }),
    }
  )
);