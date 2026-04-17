import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  PhoneCall, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  X,
  FileText,
  Zap,
  MoreVertical,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { ChamadoQuickForm } from '@/components/forms/ChamadoQuickForm';
import { OcorrenciaMultiStepForm } from '@/components/forms/OcorrenciaMultiStepForm';

export function ChamadosPage() {
  const profile = useAuthStore(state => state.profile);
  const [chamados, setChamados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isOcFormOpen, setIsOcFormOpen] = useState(false);
  const [preFillData, setPreFillData] = useState<any>(null);

  const fetchChamados = async () => {
    if (!profile?.instituicao_id) return;
    setLoading(true);
    const { data } = await supabase
      .from('chamados')
      .select('*, chamados_parceiros(*)')
      .eq('instituicao_id', profile.instituicao_id)
      .order('created_at', { ascending: false });
    if (data) setChamados(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchChamados();
  }, [profile]);

  const handleConvert = (ch: any) => {
    setPreFillData({
      origem: 'CENTRAL DE RÁDIO',
      sub_origem: 'Rádio',
      descricao: ch.detalhes || '',
      natureza: ch.natureza || [],
      rua: ch.rua || '',
      bairro: ch.bairro || '',
      numero: ch.numero || '',
      cep: ch.cep || '',
      coordenadas: ch.coordenadas || '',
    });
    setIsOcFormOpen(true);
  };

  const filtered = chamados.filter(ch => 
    ch.natureza?.join(' ').toLowerCase().includes(searchTerm.toLowerCase()) ||
    ch.rua?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Central de Chamados</h1>
          <p className="text-slate-500 font-medium mt-1">Acionamento rápido de viaturas e órgãos parceiros.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="flex items-center justify-center px-6 py-4 bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-95"
        >
          <Zap className="w-5 h-5 mr-3" /> Acionamento Rápido
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por natureza ou local..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-red-600/20 outline-none shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Prioridade</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Natureza</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Localização</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Parceiros</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {loading ? (
                 <tr><td colSpan={5} className="p-12 text-center text-slate-400 font-medium">Carregando chamados...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-400 font-medium">Nenhum chamado pendente.</td></tr>
              ) : filtered.map((ch) => (
                <tr key={ch.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      ch.prioridade === 'critica' ? 'bg-red-50 text-red-600' : 
                      ch.prioridade === 'alta' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      <AlertCircle className="w-3 h-3 mr-1.5" />
                      {ch.prioridade}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <span className="font-bold text-slate-700">{ch.natureza?.join(', ')}</span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="text-slate-600 font-medium">{ch.rua}</span>
                      <span className="text-[10px] text-slate-400 flex items-center mt-1 uppercase font-bold tracking-widest">
                        {ch.bairro}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-wrap gap-1">
                      {ch.chamados_parceiros?.map((p: any) => (
                        <span key={p.parceiro_tipo} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase tracking-widest">{p.parceiro_tipo}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => handleConvert(ch)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                    >
                      <FileText className="w-3.5 h-3.5" /> Converter em Ocorrência
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fullscreen Modal for Quick Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-white animate-in slide-in-from-bottom-8 duration-500">
          <ChamadoQuickForm 
            onClose={() => setIsFormOpen(false)} 
            onSuccess={() => fetchChamados()} 
          />
        </div>
      )}

      {/* Fullscreen Modal for Convert to Occurrence */}
      {isOcFormOpen && (
        <div className="fixed inset-0 z-50 bg-white animate-in slide-in-from-bottom-8 duration-500">
          <OcorrenciaMultiStepForm 
            initialData={preFillData}
            onClose={() => setIsOcFormOpen(false)} 
            onSuccess={() => {
              // Optionally mark chamado as converted/closed here
              fetchChamados();
            }} 
          />
        </div>
      )}

    </div>
  );
}
