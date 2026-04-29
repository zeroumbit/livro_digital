import React, { useState } from 'react';
import { 
  Truck, 
  Users, 
  Link as LinkIcon, 
  Plus, 
  Search, 
  Loader2,
  X,
  CheckCircle2
} from 'lucide-react';
import { useVeiculos, useUpdateVeiculo } from '@/hooks/useVeiculos';
import { useEquipes } from '@/hooks/useEscalas';
import { toast } from 'sonner';

export function VincularViaturaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selections, setSelections] = useState<Record<string, string>>({});
  const { data: veiculos, isLoading: loadingVeiculos } = useVeiculos();
  const { data: equipes, isLoading: loadingEquipes } = useEquipes();
  const updateVeiculo = useUpdateVeiculo();

  const handleVincular = async (veiculoId: string) => {
    const equipeId = selections[veiculoId] !== undefined ? selections[veiculoId] : null;
    
    try {
      await updateVeiculo.mutateAsync({ 
        id: veiculoId, 
        data: { equipe_id: equipeId || null } 
      });
      toast.success(equipeId ? 'Viatura vinculada com sucesso!' : 'Vínculo removido!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao vincular viatura');
    }
  };

  const handleSelectChange = (veiculoId: string, equipeId: string) => {
    setSelections(prev => ({ ...prev, [veiculoId]: equipeId }));
  };

  const filteredVeiculos = veiculos?.filter(v => 
    v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.modelo.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 lg:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Vincular Viaturas</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">
            Atribua veículos às equipes operacionais em serviço.
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Pesquisar por placa ou modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all shadow-sm"
          />
        </div>
      </div>

      {loadingVeiculos || loadingEquipes ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVeiculos.map((veiculo) => {
            const equipeAtual = equipes?.find(e => e.id === veiculo.equipe_id);
            const currentSelection = selections[veiculo.id] !== undefined ? selections[veiculo.id] : (veiculo.equipe_id || '');
            
            return (
              <div key={veiculo.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                    veiculo.equipe_id ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}>
                    <Truck className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-slate-900">{veiculo.placa}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{veiculo.modelo}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className={`p-4 rounded-2xl border ${
                    veiculo.equipe_id ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Users className={`w-4 h-4 ${veiculo.equipe_id ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Equipe Atual</span>
                    </div>
                    <p className={`text-sm font-bold ${veiculo.equipe_id ? 'text-indigo-900' : 'text-slate-400 italic'}`}>
                      {equipeAtual?.nome || 'Nenhuma equipe vinculada'}
                    </p>
                  </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <select 
                          value={currentSelection}
                          onChange={(e) => handleSelectChange(veiculo.id, e.target.value)}
                          className="flex-1 h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all"
                        >
                          <option value="">Desvincular</option>
                          {equipes?.map(e => (
                            <option key={e.id} value={e.id}>{e.nome}</option>
                          ))}
                        </select>
                      </div>
                      <button 
                        onClick={() => handleVincular(veiculo.id)}
                        className="w-full h-10 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                      >
                        <LinkIcon className="w-3 h-3" /> Confirmar Vínculo
                      </button>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-2">
                    {veiculo.equipe_id ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <LinkIcon className="w-4 h-4" />
                    )}
                    <span className="text-[10px] font-bold">{veiculo.equipe_id ? 'Em Operação' : 'Disponível'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
