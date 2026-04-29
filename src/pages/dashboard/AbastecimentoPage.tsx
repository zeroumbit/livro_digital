import React, { useState } from 'react';
import { 
  Fuel, 
  History, 
  Plus, 
  Search, 
  Clock, 
  AlertCircle,
  Loader2,
  Droplets,
  DollarSign,
  TrendingDown,
  ChevronRight,
  Truck
} from 'lucide-react';
import { useAbastecimentos } from '@/hooks/useLogistics';
import { useVeiculos } from '@/hooks/useVeiculos';
import { toast } from 'sonner';

export function AbastecimentoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: abastecimentos, isLoading } = useAbastecimentos();

  const filteredAbastecimentos = abastecimentos?.filter(a => 
    a.veiculo?.placa.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 lg:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Abastecimentos</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">
            Controle de consumo e custos de combustível da frota.
          </p>
        </div>
        
        <button 
          className="h-12 px-6 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5 mr-3" /> Novo Registro
        </button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Pesquisar por placa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all shadow-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : filteredAbastecimentos.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-12 text-center">
          <Fuel className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-black text-slate-900 mb-2">Nenhum abastecimento encontrado</h3>
          <p className="text-slate-500">Registre os abastecimentos para monitorar a eficiência da frota.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAbastecimentos.map((item) => (
            <div key={item.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Fuel className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-slate-900">{item.veiculo?.placa}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Litros</span>
                  </div>
                  <p className="text-lg font-black text-slate-900">{item.litros}L</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custo</span>
                  </div>
                  <p className="text-lg font-black text-slate-900">R$ {item.custo_total.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-2">
                  <span>Consumo Real</span>
                  <span className="text-slate-900 font-black">{item.consumo_real?.toFixed(1) || '---'} km/L</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      (item.eficiencia || 0) > 100 ? 'bg-emerald-500' : 
                      (item.eficiencia || 0) > 70 ? 'bg-blue-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(item.eficiencia || 0, 100)}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Eficiência</span>
                  <span className={
                    (item.eficiencia || 0) > 100 ? 'text-emerald-600' : 
                    (item.eficiencia || 0) > 70 ? 'text-blue-600' : 'text-rose-600'
                  }>{item.eficiencia?.toFixed(0) || 0}%</span>
                </div>
              </div>

              {item.alerta_gerado === 'CRITICO' && (
                <div className="mt-6 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Consumo Irregular</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
