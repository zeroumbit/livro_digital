import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import html2pdf from 'html2pdf.js';
import { 
  Plus, Search, Filter, Eye, Clock, MapPin, ShieldAlert, X, 
  MessageSquare, MessageSquarePlus, Send, Trash2, Pencil, 
  CheckCircle2, AlertCircle, MoreVertical, ChevronRight, ChevronDown,
  Zap, Shield, Phone, FileText, SlidersHorizontal, Calendar,
  Printer, Download, Loader2, User, Users, Navigation, Camera, ImageIcon,
  LayoutGrid, List, Heart, UserMinus, ShieldCheck
} from 'lucide-react';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import { OcorrenciaMultiStepForm } from '@/components/forms/OcorrenciaMultiStepForm';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useOccurrences } from '@/hooks/useOccurrences';

// Componente de Detalhes da Ocorrência (Visualização + PDF)
const OcorrenciaDetailsModal = ({ isOpen, onClose, occurrence, onAddAnotacao, onAddAnexo }: any) => {
  const [involved, setInvolved] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && occurrence) {
      loadInvolved();
    }
  }, [isOpen, occurrence]);

  const loadInvolved = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('ocorrencia_envolvidos')
      .select('*')
      .eq('ocorrencia_id', occurrence.id);
    setInvolved(data || []);
    setLoading(false);
  };

  if (!isOpen || !occurrence) return null;

  const DataField = ({ label, value, fullWidth = false }: any) => (
    <div className={fullWidth ? 'col-span-full' : ''}>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-700">{value || '---'}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-5xl bg-slate-50 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        {/* HEADER */}
        <div className="px-8 py-6 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Detalhes da Ocorrência</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-md">Padrão</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">#{occurrence.id.substring(0, 8)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={() => {
                const element = document.getElementById(`pdf-content-${occurrence.id}`);
                const opt = {
                  margin: 10,
                  filename: `ocorrencia-${occurrence.id.substring(0,8)}.pdf`,
                  image: { type: 'jpeg', quality: 0.98 },
                  html2canvas: { scale: 2, useCORS: true },
                  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };
                html2pdf().set(opt).from(element).save();
                toast.success('PDF gerado!');
              }}
              className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
              title="Gerar PDF"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 pb-32">
          
          {/* PDF CONTENT (Hidden from UI) */}
          <div id={`pdf-content-${occurrence.id}`} className="hidden print:block bg-white p-10 text-slate-900">
             <div className="flex items-center justify-between border-b-2 border-slate-900 pb-6 mb-8">
                <h1 className="text-2xl font-black uppercase">Relatório de Ocorrência</h1>
                <p className="font-bold">Protocolo: #{occurrence.id.substring(0,8)}</p>
             </div>
             <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <p><span className="font-bold uppercase text-[10px]">Data/Hora:</span> {format(new Date(occurrence.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                   <p><span className="font-bold uppercase text-[10px]">Origem:</span> {occurrence.origem}</p>
                   <p><span className="font-bold uppercase text-[10px]">Rua:</span> {occurrence.rua}</p>
                   <p><span className="font-bold uppercase text-[10px]">Bairro:</span> {occurrence.bairro}</p>
                   <p><span className="font-bold uppercase text-[10px]">Natureza:</span> {occurrence.natureza?.join(', ')}</p>
                </div>
                <div>
                   <h3 className="text-sm font-black uppercase border-b border-slate-200 pb-2 mb-3">Relatório Operacional</h3>
                   <p className="whitespace-pre-wrap text-sm">{occurrence.descricao}</p>
                </div>
                {involved.length > 0 && (
                  <div>
                    <h3 className="text-sm font-black uppercase border-b border-slate-200 pb-2 mb-3">Envolvidos</h3>
                    {involved.map((inv, i) => (
                      <div key={i} className="mb-2 text-sm">
                        <p><span className="font-bold">{inv.tipo}:</span> {inv.nome_completo} - CPF: {inv.cpf || 'N/I'} - RG: {inv.rg || 'N/I'}</p>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>

          {/* UI VISIBLE CONTENT */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <DataField label="Data e Hora" value={format(new Date(occurrence.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} />
             <DataField label="Origem" value={occurrence.origem} />
             <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${
                  occurrence.status === 'finalizada' || occurrence.status_ocorrencia === 'finalizado' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                }`}>
                  {occurrence.status || occurrence.status_ocorrencia}
                </span>
             </div>
          </div>

          <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] space-y-6">
             <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Localização</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <DataField label="Rua/Logradouro" value={occurrence.rua} />
                <DataField label="Número" value={occurrence.numero} />
                <DataField label="Bairro" value={occurrence.bairro} />
                <DataField label="Cidade" value={occurrence.cidade} />
                <DataField label="Estado" value={occurrence.estado} />
                <DataField label="CEP" value={occurrence.cep} />
                <DataField label="Referência" value={occurrence.referencia} fullWidth />
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Natureza da Ocorrência</h3>
             </div>
             <div className="flex flex-wrap gap-2">
                {occurrence.natureza?.map((n: string, idx: number) => (
                  <span key={idx} className="px-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 shadow-sm">
                    {n}
                  </span>
                ))}
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Relatório Operacional</h3>
             </div>
             <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8">
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">{occurrence.descricao || 'Sem relatório detalhado.'}</p>
             </div>
          </div>

          {/* ENVOLVIDOS */}
          <div className="space-y-6">
             <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Envolvidos Qualificados</h3>
             </div>
             
             {loading ? (
               <div className="flex items-center gap-2 text-slate-400">
                 <Loader2 className="w-4 h-4 animate-spin" />
                 <span className="text-xs font-bold uppercase tracking-widest">Buscando do banco...</span>
               </div>
             ) : involved.length === 0 ? (
               <div className="p-8 bg-slate-50 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-center text-slate-400">
                  <p className="text-xs font-bold uppercase tracking-widest">Nenhum envolvido registrado.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {involved.map((inv: any, i: number) => (
                   <div key={i} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-2 h-full bg-slate-100 group-hover:bg-indigo-600 transition-colors" />
                      <div className="flex items-start justify-between">
                         <div>
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg mb-2 inline-block">
                               {inv.tipo}
                            </span>
                            <h4 className="text-lg font-black text-slate-900">{inv.nome_completo}</h4>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <DataField label="CPF" value={inv.cpf} />
                         <DataField label="RG" value={inv.rg} />
                         <DataField label="Telefone" value={inv.telefone} />
                         <DataField label="Gênero" value={inv.genero} />
                      </div>
                      {inv.declaracao && (
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Declaração</p>
                           <p className="text-xs text-slate-600 font-medium italic">"{inv.declaracao}"</p>
                        </div>
                      )}
                   </div>
                 ))}
               </div>
             )}
          </div>

          {/* FOTOS SE HOUVER */}
          {occurrence.fotos && occurrence.fotos.length > 0 && (
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <Camera className="w-5 h-5 text-indigo-600" />
                   <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Anexos Fotográficos</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {occurrence.fotos.map((foto: string, idx: number) => (
                     <a key={idx} href={foto} target="_blank" rel="noreferrer" className="aspect-square bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm group">
                        <img src={foto} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                     </a>
                   ))}
                </div>
             </div>
          )}

        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-8 py-6 bg-white border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
           <button 
            onClick={() => onAddAnotacao(occurrence)}
            className="px-6 h-12 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-slate-200 transition-all"
           >
              <MessageSquarePlus className="w-5 h-5" /> Anotação
           </button>
           <button 
            onClick={() => onAddAnexo(occurrence)}
            className="px-6 h-12 bg-indigo-600 text-white rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
           >
              <Camera className="w-5 h-5" /> Adicionar Foto
           </button>
        </div>
      </div>
    </div>
  );
};

// Componente de Anotações
const AnotacaoModal = ({ isOpen, onClose, occurrence, profile, onReload }: any) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [annotations, setAnnotations] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && occurrence) {
      loadAnnotations();
    }
  }, [isOpen, occurrence]);

  const loadAnnotations = async () => {
    const { data } = await supabase
      .from('ocorrencia_anotacoes')
      .select('*, usuario:usuarios(primeiro_nome, sobrenome)')
      .eq('ocorrencia_id', occurrence.id)
      .order('created_at', { ascending: false });
    setAnnotations(data || []);
  };

  const handleSave = async () => {
    if (!text.trim()) return;
    setLoading(true);
    const { error } = await supabase.from('ocorrencia_anotacoes').insert([{
      ocorrencia_id: occurrence.id,
      usuario_id: profile.id,
      texto: text
    }]);
    
    if (!error) {
      toast.success('Anotação salva!');
      setText('');
      loadAnnotations();
      if (onReload) onReload();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                 <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Anotações Internas</h3>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all"><X className="w-6 h-6 text-slate-400" /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
           <div className="space-y-4">
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escreva sua anotação aqui..."
                className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl text-sm focus:ring-4 focus:ring-indigo-600/5 outline-none resize-none h-32"
              />
              <button 
                onClick={handleSave}
                disabled={loading || !text.trim()}
                className="w-full h-12 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar Anotação'}
              </button>
           </div>

           <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Histórico</h4>
              {annotations.length === 0 ? (
                <p className="text-sm text-slate-400 italic text-center py-10">Nenhuma anotação registrada ainda.</p>
              ) : annotations.map((ann) => (
                <div key={ann.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                        {ann.usuario?.primeiro_nome} {ann.usuario?.sobrenome}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {format(new Date(ann.created_at), "dd/MM/yyyy HH:mm")}
                      </span>
                   </div>
                   <p className="text-sm text-slate-700">{ann.texto}</p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export function OcorrenciasPadraoPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const profile = useAuthStore(state => state.profile);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'rascunho' | 'finalizado'>('todos');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOccurrence, setEditingOccurrence] = useState<any>(null);
  const [viewingOccurrence, setViewingOccurrence] = useState<any>(null);
  
  const [isAnotacaoOpen, setIsAnotacaoOpen] = useState(false);
  const [selectedForAnotacao, setSelectedForAnotacao] = useState<any>(null);
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [occurrenceToDelete, setOccurrenceToDelete] = useState<string | null>(null);

  // Buscar APENAS ocorrências padrão
  const { data: ocorrencias, isLoading, error } = useOccurrences('padrao', false);

  const filteredOccurrences = useMemo(() => {
    if (!ocorrencias) return [];
    
    return ocorrencias.filter(occ => {
      const matchesSearch = !searchTerm || 
        occ.rua?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        occ.natureza?.some((n: string) => n.toLowerCase().includes(searchTerm.toLowerCase())) ||
        occ.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        occ.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'todos' || occ.status_ocorrencia === statusFilter || occ.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [ocorrencias, searchTerm, statusFilter]);

  const handleDelete = async () => {
    if (!occurrenceToDelete) return;
    
    try {
      // Deletar dependências primeiro (envolvidos e anotações)
      // Nota: Idealmente o banco deveria ter ON DELETE CASCADE, mas fazemos aqui por segurança
      await supabase.from('ocorrencia_envolvidos').delete().eq('ocorrencia_id', occurrenceToDelete);
      await supabase.from('ocorrencia_anotacoes').delete().eq('ocorrencia_id', occurrenceToDelete);
      
      const { error: delError } = await supabase
        .from('ocorrencias')
        .delete()
        .eq('id', occurrenceToDelete);
      
      if (delError) throw delError;
      
      toast.success('Ocorrência excluída com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['occurrences'] });
      setShowDeleteDialog(false);
      setOccurrenceToDelete(null);
    } catch (err: any) {
      console.error('DELETE ERROR:', err);
      toast.error('Erro ao excluir: ' + err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Ocorrências Padrão</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Gerencie os registros operacionais da sua instituição.</p>
        </div>
        <button
          onClick={() => { setEditingOccurrence(null); setIsFormOpen(true); }}
          className="flex-1 md:flex-none h-12 px-6 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5 mr-3" /> Nova Ocorrência
        </button>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            placeholder="Pesquisar por rua, natureza, relatório, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-12 px-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all cursor-pointer"
          >
            <option value="todos">Todos Status</option>
            <option value="rascunho">Rascunhos</option>
            <option value="finalizado">Finalizados</option>
          </select>

          <div className="hidden sm:flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL (GRID OU LISTA) */}
      {filteredOccurrences.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-20 text-center">
          <ShieldAlert className="w-16 h-16 text-slate-300 mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-black text-slate-900 mb-2">Nenhuma ocorrência encontrada</h3>
          <p className="text-slate-500 font-medium">Tente ajustar sua busca ou filtros.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOccurrences.map((occ) => (
            <div key={occ.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-600/5 transition-all duration-500 group relative overflow-hidden flex flex-col h-full">
               {/* BARRA SUPERIOR DO CARD */}
               <div className="p-6 pb-0 flex items-start justify-between">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">#{occ.id.substring(0,8)}</span>
                     <h3 className="font-black text-slate-900 tracking-tight leading-tight">
                        {occ.natureza?.[0] || 'Ocorrência Padrão'}
                     </h3>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${occ.status === 'finalizada' || occ.status_ocorrencia === 'finalizado' ? 'bg-emerald-500' : 'bg-amber-500'} shadow-[0_0_8px_rgba(var(--color-status),0.5)]`} />
               </div>

               {/* INFO CENTRAL */}
               <div className="p-6 flex-1 space-y-4">
                  <div className="flex items-center gap-3 text-slate-500">
                     <Calendar className="w-4 h-4 shrink-0" />
                     <span className="text-xs font-bold">{format(new Date(occ.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                  </div>
                  <div className="flex items-start gap-3 text-slate-500">
                     <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                     <span className="text-xs font-bold truncate">{occ.rua}, {occ.bairro}</span>
                  </div>
                  <div className="pt-4 border-t border-slate-50">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Resumo</p>
                     <p className="text-xs text-slate-600 line-clamp-3 font-medium leading-relaxed">
                        {occ.descricao || 'Sem descrição detalhada disponível.'}
                     </p>
                  </div>
               </div>

               {/* AÇÕES DO CARD */}
               <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                     <button 
                        onClick={() => { setViewingOccurrence(occ); }}
                        className="p-2.5 text-indigo-600 hover:bg-white rounded-xl transition-all shadow-sm shadow-indigo-600/5"
                        title="Ver Detalhes"
                     >
                        <Eye className="w-4.5 h-4.5" />
                     </button>
                     <button 
                        onClick={() => { setSelectedForAnotacao(occ); setIsAnotacaoOpen(true); }}
                        className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all"
                        title="Anotações"
                     >
                        <MessageSquare className="w-4.5 h-4.5" />
                     </button>
                  </div>
                  <div className="flex items-center gap-1">
                     <button 
                        onClick={() => { setEditingOccurrence(occ); setIsFormOpen(true); }}
                        className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all"
                     >
                        <Pencil className="w-4.5 h-4.5" />
                     </button>
                     <button 
                        onClick={() => { setOccurrenceToDelete(occ.id); setShowDeleteDialog(true); }}
                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                     >
                        <Trash2 className="w-4.5 h-4.5" />
                     </button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocolo</th>
                      <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data/Hora</th>
                      <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Localização</th>
                      <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Natureza</th>
                      <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {filteredOccurrences.map((occ) => (
                      <tr key={occ.id} className="hover:bg-slate-50/50 transition-colors group">
                         <td className="px-8 py-6">
                            <span className="font-black text-indigo-600">#{occ.id.substring(0,8)}</span>
                         </td>
                         <td className="px-6 py-6">
                            <div className="flex flex-col">
                               <span className="font-bold text-slate-700">{format(new Date(occ.created_at), "dd/MM/yyyy")}</span>
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(new Date(occ.created_at), "HH:mm")}</span>
                            </div>
                         </td>
                         <td className="px-6 py-6">
                            <div className="flex items-center gap-2 text-slate-600 max-w-[200px]">
                               <MapPin className="w-4 h-4 shrink-0 text-slate-400" />
                               <span className="truncate font-medium">{occ.rua}, {occ.bairro}</span>
                            </div>
                         </td>
                         <td className="px-6 py-6">
                            <div className="flex flex-wrap gap-1">
                               {occ.natureza?.slice(0, 1).map((n: string, i: number) => (
                                 <span key={i} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{n}</span>
                               ))}
                               {occ.natureza?.length > 1 && (
                                 <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">+{occ.natureza.length - 1}</span>
                               )}
                            </div>
                         </td>
                         <td className="px-6 py-6">
                            <div className="flex items-center gap-2">
                               <div className={`w-2 h-2 rounded-full ${occ.status === 'finalizada' || occ.status_ocorrencia === 'finalizado' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                               <span className={`text-[10px] font-black uppercase tracking-widest ${occ.status === 'finalizada' || occ.status_ocorrencia === 'finalizado' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                  {occ.status || occ.status_ocorrencia}
                               </span>
                            </div>
                         </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                               <button 
                                onClick={() => setViewingOccurrence(occ)}
                                className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-100 transition-all"
                                title="Visualizar"
                               >
                                  <Eye className="w-4 h-4" />
                               </button>
                               <button 
                                onClick={() => { setSelectedForAnotacao(occ); setIsAnotacaoOpen(true); }}
                                className="w-9 h-9 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all"
                                title="Anotações"
                               >
                                  <MessageSquare className="w-4 h-4" />
                               </button>
                               <button 
                                onClick={() => { setEditingOccurrence(occ); setIsFormOpen(true); }}
                                className="w-9 h-9 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all"
                                title="Editar"
                               >
                                  <Pencil className="w-4 h-4" />
                               </button>
                               <button 
                                onClick={() => { setOccurrenceToDelete(occ.id); setShowDeleteDialog(true); }}
                                className="w-9 h-9 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center hover:bg-rose-100 transition-all"
                                title="Excluir"
                               >
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>
      )}

      {/* MODAIS E DIÁLOGOS */}
      <OcorrenciaDetailsModal 
        isOpen={!!viewingOccurrence}
        onClose={() => setViewingOccurrence(null)}
        occurrence={viewingOccurrence}
        onAddAnotacao={(occ: any) => { setViewingOccurrence(null); setSelectedForAnotacao(occ); setIsAnotacaoOpen(true); }}
        onAddAnexo={(occ: any) => { setViewingOccurrence(null); setEditingOccurrence(occ); setIsFormOpen(true); }}
      />

      <AnotacaoModal 
        isOpen={isAnotacaoOpen}
        onClose={() => { setIsAnotacaoOpen(false); setSelectedForAnotacao(null); }}
        occurrence={selectedForAnotacao}
        profile={profile}
      />

      {isFormOpen && (
        <div className="fixed inset-0 z-[120] bg-white animate-in slide-in-from-bottom-8 duration-500 overflow-y-auto">
          <OcorrenciaMultiStepForm
            onClose={() => { setIsFormOpen(false); setEditingOccurrence(null); }}
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingOccurrence(null);
              queryClient.invalidateQueries({ queryKey: ['occurrences'] });
            }}
            initialData={editingOccurrence}
            defaultCategoria="padrao"
          />
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => { setShowDeleteDialog(false); setOccurrenceToDelete(null); }}
        onConfirm={handleDelete}
        title="Excluir Ocorrência"
        description="Esta ação removerá permanentemente o registro e todos os seus dados vinculados (envolvidos e anotações). Deseja prosseguir?"
        confirmText="Excluir Registro"
        cancelText="Cancelar"
        variant="danger"
      />

    </div>
  );
}
