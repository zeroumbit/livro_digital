import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Plus, 
  Search, 
  Clock, 
  AlertCircle,
  Loader2,
  Truck,
  CheckCircle2,
  Calendar,
  Eye,
  FileText
} from 'lucide-react';
import { useVistorias } from '@/hooks/useLogistics';
import { useVeiculos } from '@/hooks/useVeiculos';
import { toast } from 'sonner';

export function VistoriasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: vistorias, isLoading } = useVistorias();

  const filteredVistorias = vistorias?.filter(v => 
    v.veiculo?.placa.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 lg:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Vistorias de Frota</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">
            Checklist de entrada, saída e manutenção preventiva.
          </p>
        </div>
        
        <button 
          className="h-12 px-6 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5 mr-3" /> Nova Vistoria
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
      ) : filteredVistorias.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-12 text-center">
          <ClipboardCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-black text-slate-900 mb-2">Nenhuma vistoria encontrada</h3>
          <p className="text-slate-500">Comece registrando a primeira vistoria de uma viatura.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVistorias.map((item) => (
            <div key={item.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                  item.tipo_vistoria === 'Saída' ? 'bg-indigo-600 text-white' : 
                  item.tipo_vistoria === 'Entrada' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  <Truck className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-slate-900">{item.veiculo?.placa}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.tipo_vistoria}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-600">{new Date(item.created_at).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <p className="text-xs text-slate-500 font-medium line-clamp-1">
                    {item.observacoes_gerais || 'Sem observações adicionais'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Vistoria OK</span>
                </div>
                <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors">
                  <Eye className="w-4 h-4" /> Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
