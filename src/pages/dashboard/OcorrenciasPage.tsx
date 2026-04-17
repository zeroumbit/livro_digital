import React, { useState, useEffect } from 'react';
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
  FileText
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { OcorrenciaMultiStepForm } from '@/components/forms/OcorrenciaMultiStepForm';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export function OcorrenciasPage() {
  const profile = useAuthStore(state => state.profile);
  const [ocorrencias, setOcorrencias] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedOc, setSelectedOc] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  
  // Anotações state
  const [anotacoes, setAnotacoes] = useState<any[]>([]);
  const [novaAnotacao, setNovaAnotacao] = useState('');
  const [sendingNota, setSendingNota] = useState(false);

  const fetchOcorrencias = async () => {
    if (!profile?.instituicao_id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('ocorrencias')
      .select('*')
      .eq('instituicao_id', profile.instituicao_id)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setOcorrencias(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOcorrencias();
  }, [profile]);

  const openDetails = async (oc: any) => {
    setSelectedOc(oc);
    setIsDetailsOpen(true);
    fetchAnotacoes(oc.id);
  };

  const fetchAnotacoes = async (id: string) => {
    const { data } = await supabase
      .from('ocorrencia_anotacoes')
      .select('*, usuarios(primeiro_nome, sobrenome)')
      .eq('ocorrencia_id', id)
      .order('criado_em', { ascending: true });
    if (data) setAnotacoes(data);
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
    // Regra: Ocorrência finalizada/arquivada/em_atendimento NÃO pode ser excluída
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

  const canEditAnotacao = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    return diff < 5 * 60 * 1000; // 5 minutes
  };

  const filtered = ocorrencias.filter(oc => 
    oc.natureza?.join(' ').toLowerCase().includes(searchTerm.toLowerCase()) ||
    oc.rua?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    oc.numero_oficial?.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Registro de Ocorrências</h1>
          <p className="text-slate-500 font-medium mt-1">Gestão operacional e relatórios de campo.</p>
        </div>
        <button 
          onClick={() => {
            setEditMode(false);
            setSelectedOc(null);
            setIsFormOpen(true);
          }}
          className="flex items-center justify-center px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="w-5 h-5 mr-3" /> Nova Ocorrência
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por código, natureza ou endereço..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600/20 outline-none shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="p-4 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-indigo-600 transition-all shadow-sm">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Código</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Natureza Principal</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Origem</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Localização</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-400">Carregando registros operacionais...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-400">Nenhuma ocorrência encontrada.</td></tr>
              ) : filtered.map((oc) => (
                <tr key={oc.id} className="hover:bg-slate-50/50 transition-colors group">
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
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openDetails(oc)}
                        className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-200 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {oc.status === 'rascunho' && (
                        <button 
                          onClick={() => handleEdit(oc)}
                          className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-200 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}

                      {!['finalizada', 'arquivada', 'em_atendimento'].includes(oc.status) && (
                        <button 
                          onClick={() => handleDelete(oc)}
                          className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-200 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fullscreen Modal for Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-white animate-in slide-in-from-bottom-8 duration-500">
          <OcorrenciaMultiStepForm 
            initialData={editMode ? selectedOc : null}
            onClose={() => {
              setIsFormOpen(false);
              setEditMode(false);
              setSelectedOc(null);
            }} 
            onSuccess={() => fetchOcorrencias()} 
          />
        </div>
      )}

      {/* Details Slide-over / Modal */}
      {isDetailsOpen && selectedOc && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right-8 duration-500">
            {/* Details Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">OC-{selectedOc.numero_oficial}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                     <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{selectedOc.status}</span>
                     <span className="w-1 h-1 bg-slate-300 rounded-full" />
                     <span className="text-[10px] text-slate-400 font-medium">{new Date(selectedOc.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsDetailsOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Details Content */}
            <div className="flex-1 overflow-y-auto px-8 py-10 space-y-10">
              
              {/* Tags de Origem (Intelligence) */}
              <div className="flex flex-wrap gap-2">
                 <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Origem:</span>
                    <span className="text-[10px] font-black text-slate-700 uppercase">{selectedOc.origem}</span>
                 </div>
                 {selectedOc.tipo_origem && (
                   <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg">
                      <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Tipo:</span>
                      <span className="text-[10px] font-black text-indigo-700 uppercase">{selectedOc.tipo_origem}</span>
                   </div>
                 )}
              </div>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Relatório dos Fatos</span>
                </div>
                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6 shadow-sm">
                   <div className="flex flex-wrap gap-2">
                     {selectedOc.natureza?.map((n: string) => (
                       <span key={n} className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-tighter shadow-sm">{n}</span>
                     ))}
                   </div>
                   <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedOc.descricao}</p>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Local do Atendimento</span>
                </div>
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                   <p className="text-sm font-bold text-slate-800">{selectedOc.rua}{selectedOc.numero ? `, ${selectedOc.numero}` : ''}</p>
                   <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{selectedOc.bairro}</p>
                   {selectedOc.referencia && (
                     <p className="text-[11px] text-slate-400 font-medium mt-2 italic">Ref: {selectedOc.referencia}</p>
                   )}
                </div>
              </section>

              {/* Anotações Section */}
              <section className="space-y-6 pt-10 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Timeline de Anotações</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {anotacoes.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                       <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Nenhuma anotação registrada ainda.</p>
                    </div>
                  ) : anotacoes.map((nota) => (
                    <div key={nota.id} className="flex gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                         <span className="text-xs font-black text-slate-500 uppercase">{nota.usuarios?.primeiro_nome[0]}</span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900">{nota.usuarios?.primeiro_nome} {nota.usuarios?.sobrenome}</span>
                          <span className="text-[10px] text-slate-400 font-medium lowercase italic">{formatDistanceToNow(new Date(nota.criado_em), { addSuffix: true, locale: ptBR })}</span>
                        </div>
                        <div className="p-4 bg-white border border-slate-200 rounded-2xl text-sm text-slate-600 relative shadow-sm">
                           {nota.texto}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* New Anotação Input */}
                <div className="space-y-3">
                  <textarea 
                    value={novaAnotacao}
                    onChange={(e) => setNovaAnotacao(e.target.value)}
                    placeholder="Adicionar nova nota (mínimo 10 caracteres)..."
                    rows={3}
                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-[2rem] text-sm focus:ring-2 focus:ring-indigo-600/20 outline-none shadow-sm transition-all resize-none"
                  />
                  <div className="flex justify-between items-center px-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Auditoria: Bloqueada após 5 minutos.</p>
                    <button 
                      onClick={handleAddAnotacao}
                      disabled={novaAnotacao.length < 10 || sendingNota}
                      className="px-8 py-3 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 flex items-center gap-2 disabled:opacity-50"
                    >
                      {sendingNota ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Adicionar Nota
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
