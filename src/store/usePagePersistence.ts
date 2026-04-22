import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PageState {
  ocorrencias: {
    searchTerm: string;
    filterStatus: string;
    filtersOpen: boolean;
    // Adicione outros estados que deseja persistir
  };
  chamados: {
    searchTerm: string;
  };
  setOcorrenciasState: (state: Partial<PageState['ocorrencias']>) => void;
  setChamadosState: (state: Partial<PageState['chamados']>) => void;
}

export const usePagePersistence = create<PageState>()(
  persist(
    (set) => ({
      ocorrencias: {
        searchTerm: '',
        filterStatus: '',
        filtersOpen: false,
      },
      chamados: {
        searchTerm: '',
      },
      setOcorrenciasState: (state) => 
        set((s) => ({ ocorrencias: { ...s.ocorrencias, ...state } })),
      setChamadosState: (state) => 
        set((s) => ({ chamados: { ...s.chamados, ...state } })),
    }),
    {
      name: 'page-persistence-storage',
    }
  )
);
