import { useAuthStore } from '@/store/useAuthStore';
import { useMemo } from 'react';

export function usePlan() {
  const { institution } = useAuthStore();

  const modulosAtivos = useMemo(() => {
    return (institution?.planos as any)?.modulos_ativos || [];
  }, [institution]);

  const hasModule = (moduleKey: string) => {
    return modulosAtivos.includes(moduleKey);
  };

  const hasFeature = (featureKey: string) => {
    return modulosAtivos.includes(featureKey);
  };

  const check = (key: string) => {
    return modulosAtivos.includes(key);
  };

  return {
    modulosAtivos,
    hasModule,
    hasFeature,
    check,
    planName: (institution?.planos as any)?.nome || 'Nenhum'
  };
}
