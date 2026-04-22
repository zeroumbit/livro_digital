import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Clock,
  MapPin,
  ShieldAlert,
  X,
  MessageSquare,
  Send,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  Zap,
  Shield,
  Phone,
  FileText,
  SlidersHorizontal,
  Calendar,
  Printer,
  Download,
  Loader2
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { OcorrenciaMultiStepForm } from '@/components/forms/OcorrenciaMultiStepForm';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

import { useOccurrences } from '@/hooks/useOccurrences';

// Componente de Linha Memoizado para Performance de Renderização
const OcorrenciaRow = React.memo(({ oc, onOpenDetails, onEdit, onDelete }: any) => {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-8 py-6">
        <span className="font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg text-xs tracking-tighter">
          OC-{oc.numero_oficial}
        </span>
      </td>
      <td className="px-6 py-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mr-3 group-hover:bg-white transition-colors">
            <ShieldAlert className="w-5 h-5 text-slate-400" />
          </div>
          <span className="font-bold text-slate-700 truncate max-w-[200px]">{oc.natureza?.[0]}</span>
        </div>
      </td>
      <td className="px-6 py-6">
        <div className="flex flex-col">
           <div className="flex items-center gap-1.5">
              {oc.origem_tipo === 'ORIGEM_CHAMADO' ? <Phone className="w-3 h-3 text-indigo-500" /> : <Shield className="w-3 h-3 text-emerald-500" />}
              <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">{oc.origem || 'EQUIPE'}</span>
           </div>
           {oc.tipo_origem && <span className="text-[10px] text-slate-400 font-bold ml-4.5">{oc.tipo_origem}</span>}
        </div>
      </td>
      <td className="px-6 py-6">
        <div className="flex flex-col">
          <span className="text-slate-600 font-medium truncate max-w-[150px]">{oc.rua}{oc.numero ? `, ${oc.numero}` : ''}</span>
          <span className="text-[10px] text-slate-400 flex items-center mt-1 uppercase font-bold tracking-widest">
            {oc.bairro}
          </span>
        </div>
      </td>
      <td className="px-6 py-6">
        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
          oc.status === 'rascunho' ? 'bg-slate-100 text-slate-600' : 
          oc.status === 'finalizada' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
        }`}>
          {oc.status === 'rascunho' ? <Clock className="w-3 h-3 mr-1.5" /> : <CheckCircle2 className="w-3 h-3 mr-1.5" />}
          {oc.status}
        </span>
      </td>
      <td className="px-8 py-6 text-right">
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => onOpenDetails(oc)}
            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-200 transition-all"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {oc.status === 'rascunho' && (
            <button 
              onClick={() => onEdit(oc)}
              className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-200 transition-all"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          {!['finalizada', 'arquivada', 'em_atendimento'].includes(oc.status) && (
            <button 
              onClick={() => onDelete(oc)}
              className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-200 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
});

export function OcorrenciasPage() {
  const profile = useAuthStore(state => state.profile);
  const { data: ocorrenciasData, isLoading: loading, refetch: fetchOcorrencias } = useOccurrences();
  const ocorrencias = (ocorrenciasData as any[]) || [];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedOc, setSelectedOc] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  
  // Anotações state
  const [anotacoes, setAnotacoes] = useState<any[]>([]);
  const [novaAnotacao, setNovaAnotacao] = useState('');
  const [sendingNota, setSendingNota] = useState(false);

  // Filtros avançados
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('');
  const [filterGenero, setFilterGenero] = useState<string>('');
  const [filterVeiculo, setFilterVeiculo] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState<string>('');
  const [ruasUnicas, setRuasUnicas] = useState<string[]>([]);
  const [bairrosUnicos, setBairrosUnicos] = useState<string[]>([]);
  const [generosUnicos, setGenerosUnicos] = useState<string[]>([]);
  const [veiculosUnicos, setVeiculosUnicos] = useState<string[]>([]);
  const [filterHoraInicio, setFilterHoraInicio] = useState('');
  const [filterHoraFim, setFilterHoraFim] = useState('');
  const [filterValue, setFilterValue] = useState<string>('');

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.dropdown-tipo')) {
        if (dropdownOpen === 'tipo') setDropdownOpen('');
      }
    };
    setTimeout(() => document.addEventListener('click', handleClick), 0);
    return () => document.removeEventListener('click', handleClick);
  }, [dropdownOpen]);

  const openDetails = async (oc: any) => {
    setSelectedOc(oc);
    setIsDetailsOpen(true);
    fetchAnotacoes(oc.id);
  };

  const fetchAnotacoes = async (id: string) => {
    const { data: anotacoesData } = await supabase
      .from('ocorrencia_anotacoes')
      .select('*')
      .eq('ocorrencia_id', id)
      .order('criado_em', { ascending: true });
    
    if (anotacoesData && anotacoesData.length > 0) {
      const userIds = [...new Set(anotacoesData.map((a: any) => a.usuario_id))];
      const { data: usersData } = await supabase
        .from('usuarios')
        .select('id, primeiro_nome, sobrenome')
        .in('id', userIds);
      
      const usersMap = new Map((usersData || []).map((u: any) => [u.id, u]));
      const anotacoesWithUsers = anotacoesData.map((a: any) => ({
        ...a,
        usuarios: usersMap.get(a.usuario_id)
      }));
      setAnotacoes(anotacoesWithUsers);
    } else {
      setAnotacoes([]);
    }
  };

  const handleAddAnotacao = async () => {
    if (!novaAnotacao.trim() || novaAnotacao.length < 10 || !selectedOc || !profile?.id) return;
    setSendingNota(true);
    const { error } = await supabase.from('ocorrencia_anotacoes').insert([{
      ocorrencia_id: selectedOc.id,
      usuario_id: profile.id,
      texto: novaAnotacao
    }]);
    if (!error) {
      setNovaAnotacao('');
      fetchAnotacoes(selectedOc.id);
      toast.success('Anotação adicionada com sucesso!');
    } else {
      toast.error('Erro ao adicionar anotação.');
    }
    setSendingNota(false);
  };

  const handleDelete = async (oc: any) => {
    const statusBloqueados = ['finalizada', 'arquivada', 'em_atendimento'];
    if (statusBloqueados.includes(oc.status)) {
      toast.error(`Ocorrência com status "${oc.status}" não pode ser excluída.`);
      return;
    }
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;
    const { error } = await supabase.from('ocorrencias').delete().eq('id', oc.id);
    if (!error) {
      toast.success('Ocorrência excluída com sucesso.');
      fetchOcorrencias();
    } else {
      toast.error('Erro ao excluir ocorrência.');
    }
  };

  const handleEdit = (oc: any) => {
    if (oc.status === 'finalizada') {
      toast.error('Ocorrências finalizadas não podem ser editadas.');
      return;
    }
    setSelectedOc(oc);
    setEditMode(true);
    setIsFormOpen(true);
  };

  const filtered = useMemo(() => {
    return ocorrencias.filter(oc => {
      const matchSearch = !searchTerm || 
        oc.natureza?.join(' ').toLowerCase().includes(searchTerm.toLowerCase()) ||
        oc.rua?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        oc.numero_oficial?.toString().includes(searchTerm);
      const matchStatus = !filterStatus || oc.status === filterStatus;
      let matchDate = true;
      if (filterDateFrom) matchDate = matchDate && new Date(oc.created_at) >= new Date(filterDateFrom);
      if (filterDateTo) matchDate = matchDate && new Date(oc.created_at) <= new Date(filterDateTo);
      let matchRua = true;
      if (filterValue && filterTipo === 'rua') matchRua = oc.rua === filterValue;
      let matchBairro = true;
      if (filterValue && filterTipo === 'bairro') matchBairro = oc.bairro === filterValue;
      let matchGenero = true;
      if (filterGenero) matchGenero = oc.genero === filterGenero;
      let matchVeiculo = true;
      if (filterVeiculo) matchVeiculo = oc.veiculo_tipo === filterVeiculo;
      let matchHora = true;
      if ((filterHoraInicio || filterHoraFim) && filterTipo === 'horario') {
        const ocHora = new Date(oc.created_at).toTimeString().slice(0, 5);
        if (filterHoraInicio && ocHora < filterHoraInicio) matchHora = false;
        if (filterHoraFim && ocHora > filterHoraFim) matchHora = false;
      }
      return matchSearch && matchStatus && matchDate && matchRua && matchBairro && matchGenero && matchVeiculo && matchHora;
    });
  }, [ocorrencias, searchTerm, filterStatus, filterDateFrom, filterDateTo, filterTipo, filterGenero, filterVeiculo, filterHoraInicio, filterHoraFim, filterValue]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterTipo('');
    setFilterGenero('');
    setFilterVeiculo('');
    setFilterValue('');
    setFilterHoraInicio('');
    setFilterHoraFim('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Registro de Ocorrências</h1>
          <p className="text-slate-500 font-medium mt-1">Gestão operacional e relatórios de campo.</p>
        </div>
        <button 
          onClick={() => { setEditMode(false); setSelectedOc(null); setIsFormOpen(true); }}
          className="flex items-center justify-center px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="w-5 h-5 mr-3" /> Nova Ocorrência
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-[0.6]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por código, natureza ou endereço..." 
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600/20 outline-none shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`p-4 bg-white border border-slate-200 rounded-2xl transition-all shadow-sm flex items-center gap-2 ${
              filtersOpen ? 'text-indigo-600 border-indigo-200 bg-indigo-50' : 'text-slate-400 hover:text-indigo-600'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest hidden lg:inline">Filtros</span>
          </button>
        </div>

        {filtersOpen && (
          <div className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm space-y-4 animate-in slide-in-from-top-2 duration-200">
             {/* Conteúdo de filtros aqui - simplificado para reversão */}
             <div className="flex flex-wrap gap-4">
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                >
                  <option value="">Todos os Status</option>
                  <option value="rascunho">Rascunho</option>
                  <option value="finalizada">Finalizada</option>
                  <option value="em_atendimento">Em Atendimento</option>
                </select>
                <button onClick={clearFilters} className="text-xs font-bold text-slate-400 hover:text-rose-500 uppercase tracking-widest">Limpar</button>
             </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Código</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Natureza</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Origem</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Localização</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-400">Carregando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-400">Nenhum registro encontrado.</td></tr>
              ) : filtered.map((oc) => (
                <OcorrenciaRow key={oc.id} oc={oc} onOpenDetails={openDetails} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-white animate-in slide-in-from-bottom-8 duration-500">
          <OcorrenciaMultiStepForm 
            initialData={editMode ? selectedOc : null}
            onClose={() => { setIsFormOpen(false); setEditMode(false); setSelectedOc(null); }} 
            onSuccess={() => fetchOcorrencias()} 
          />
        </div>
      )}

      {isDetailsOpen && selectedOc && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
           <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right-8 duration-500">
             <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900">Detalhes OC-{selectedOc.numero_oficial}</h2>
                <button onClick={() => setIsDetailsOpen(false)}><X className="w-6 h-6 text-slate-400" /></button>
             </div>
             <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <p className="text-sm text-slate-600 leading-relaxed">{selectedOc.descricao}</p>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
