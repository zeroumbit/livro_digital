import React, { useState, useMemo } from 'react';
import { 
  Phone, 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ChevronRight,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useCalls } from '@/hooks/useCalls';
import { ChamadoQuickForm } from '@/components/forms/ChamadoQuickForm';
import { OcorrenciaMultiStepForm } from '@/components/forms/OcorrenciaMultiStepForm';
import { toast } from 'sonner';

export function ChamadosPage() {
  const profile = useAuthStore(state => state.profile);
  const { data: chamadosData, isLoading: loading, refetch: fetchChamados } = useCalls();
  const chamados = (chamadosData as any[]) || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isOcFormOpen, setIsOcFormOpen] = useState(false);
  const [preFillData, setPreFillData] = useState<any>(null);

  const filtered = useMemo(() => {
    return chamados.filter(c => 
      !searchTerm || 
      c.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.rua?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [chamados, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Gestão de Chamados</h1>
          <p className="text-slate-500 font-medium mt-1">Atendimento ao cidadão e triagem inicial.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="flex items-center justify-center px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="w-5 h-5 mr-3" /> Novo Chamado
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Buscar chamados..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600/20 outline-none shadow-sm transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocolo</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Solicitante</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Localização</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-400">Carregando chamados...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-400">Nenhum chamado pendente.</td></tr>
              ) : filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6 font-black text-indigo-600">#{c.id.slice(0, 8)}</td>
                  <td className="px-6 py-6 font-bold text-slate-700">{c.solicitante_nome}</td>
                  <td className="px-6 py-6 text-slate-600">{c.rua}, {c.bairro}</td>
                  <td className="px-6 py-6">
                    <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {c.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => {
                        setPreFillData({
                          categoria: 'chamados',
                          rua: c.rua,
                          bairro: c.bairro,
                          numero: c.numero,
                          referencia: c.referencia,
                          descricao: `CHAMADO: ${c.solicitante_nome}\nTELEFONE: ${c.solicitante_telefone}\nDESCRIÇÃO: ${c.descricao}`,
                          origem: 'CENTRAL DE RÁDIO',
                          tipo_origem: 'Rádio'

                        });
                        setIsOcFormOpen(true);
                      }}
                      className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center ml-auto gap-2"
                    >
                      Converter em OC <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-white animate-in slide-in-from-bottom-8 duration-500">
          <ChamadoQuickForm 
            onClose={() => setIsFormOpen(false)} 
            onSuccess={() => fetchChamados()} 
          />
        </div>
      )}

      {isOcFormOpen && (
        <div className="fixed inset-0 z-50 bg-white animate-in slide-in-from-bottom-8 duration-500">
          <OcorrenciaMultiStepForm 
            initialData={preFillData}
            defaultCategoria="chamados"
            onClose={() => { setIsOcFormOpen(false); setPreFillData(null); }} 
            onSuccess={() => fetchChamados()} 
          />
        </div>
      )}

    </div>
  );
}
