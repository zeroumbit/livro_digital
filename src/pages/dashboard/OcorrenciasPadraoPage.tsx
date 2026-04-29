import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import html2pdf from 'html2pdf.js';
import DOMPurify from 'dompurify';
import { 
  Plus, Search, Filter, Eye, Clock, MapPin, ShieldAlert, X, 
  MessageSquare, MessageSquarePlus, Send, Trash2, Edit2, 
  CheckCircle2, AlertCircle, MoreVertical, ChevronRight, ChevronDown,
  Zap, Shield, Phone, FileText, SlidersHorizontal, Calendar,
  Printer, Download, Loader2, User, Navigation, Camera, ImageIcon
} from 'lucide-react';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import { OcorrenciaMultiStepForm } from '@/components/forms/OcorrenciaMultiStepForm';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useOccurrences } from '@/hooks/useOccurrences';

const TIPOS_FILTRO = [
  { value: 'rua', label: 'Por Rua' },
  { value: 'bairro', label: 'Por Bairro/Distrito' },
  { value: 'horario', label: 'Por Horário' },
  { value: 'genero', label: 'Por Gênero' },
  { value: 'veiculo', label: 'Tipo de Veículo' },
  { value: 'origem', label: 'Iniciado por' },
];

const CustomSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  label?: string;
}> = ({ value, onChange, options, placeholder = 'Selecione...', label }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {label && (
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{label}</label>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-left flex items-center justify-between hover:border-indigo-300 transition-colors"
      >
        <span className={value ? 'text-slate-700' : 'text-slate-400'}>
          {value ? options.find(o => o.value === value)?.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-indigo-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export function OcorrenciasPadraoPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const profile = useAuthStore(state => state.profile);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'rascunho' | 'finalizado'>('todos');
  const [filtroTipo, setFiltroTipo] = useState('rua');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOccurrence, setEditingOccurrence] = useState<any>(null);
  const [viewingOccurrence, setViewingOccurrence] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [occurrenceToDelete, setOccurrenceToDelete] = useState<string | null>(null);
  const [showAnnotations, setShowAnnotations] = useState<string | null>(null);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [annotations, setAnnotations] = useState<Record<string, any[]>>({});

  // Buscar APENAS ocorrências padrão (não rascunhos, não outros tipos)
  const { data: ocorrencias, isLoading, error, refetch } = useOccurrences('padrao', false);

  const filteredOccurrences = useMemo(() => {
    if (!ocorrencias) return [];
    
    return ocorrencias.filter(occ => {
      const matchesSearch = !searchTerm || 
        occ.nome_rua?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        occ.natureza_ocorrencia?.some((n: string) => n.toLowerCase().includes(searchTerm.toLowerCase())) ||
        occ.relatorio_ocorrencia?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'todos' || occ.status_ocorrencia === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [ocorrencias, searchTerm, statusFilter]);

  const handleDelete = async () => {
    if (!occurrenceToDelete) return;
    
    try {
      const { error } = await supabase
        .from('ocorrencias')
        .delete()
        .eq('id', occurrenceToDelete);
      
      if (error) throw error;
      
      toast.success('Ocorrência excluída com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['ocorrencias'] });
      setShowDeleteDialog(false);
      setOccurrenceToDelete(null);
    } catch (err: any) {
      toast.error('Erro ao excluir: ' + err.message);
    }
  };

  const handleAddAnnotation = async (ocorrenciaId: string) => {
    if (!newAnnotation.trim() || !profile) return;
    
    try {
      const { error } = await supabase
        .from('ocorrencia_anotacoes')
        .insert([{
          ocorrencia_id: ocorrenciaId,
          usuario_id: profile.id,
          texto: newAnnotation,
        }]);
      
      if (error) throw error;
      
      toast.success('Anotação adicionada!');
      setNewAnnotation('');
      // Recarregar anotações
      loadAnnotations(ocorrenciaId);
    } catch (err: any) {
      toast.error('Erro ao adicionar anotação: ' + err.message);
    }
  };

  const loadAnnotations = async (ocorrenciaId: string) => {
    try {
      const { data, error } = await supabase
        .from('ocorrencia_anotacoes')
        .select('*')
        .eq('ocorrencia_id', ocorrenciaId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setAnnotations(prev => ({ ...prev, [ocorrenciaId]: data || [] }));
    } catch (err) {
      console.error('Erro ao carregar anotações:', err);
    }
  };

  const generatePDF = async (occurrence: any) => {
    const element = document.getElementById(`occurrence-${occurrence.id}`);
    if (!element) return;
    
    const opt = {
      margin: 10,
      filename: `ocorrencia-${occurrence.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    try {
      await html2pdf().set(opt).from(element).save();
      toast.success('PDF gerado com sucesso!');
    } catch (err: any) {
      toast.error('Erro ao gerar PDF: ' + err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-rose-600">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p className="font-bold">Erro ao carregar ocorrências</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Ocorrências Padrão</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Gerencie as ocorrências padrão da sua instituição.</p>
        </div>
        <button
          onClick={() => { setEditingOccurrence(null); setIsFormOpen(true); }}
          className="flex-1 md:flex-none h-12 px-6 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
        >
          <Plus className="w-5 h-5 mr-3" /> Nova Ocorrência
        </button>
      </div>

      {/* FILTROS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            placeholder="Pesquisar por rua, natureza, relatório..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <CustomSelect
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as any)}
            options={[
              { value: 'todos', label: 'Todos Status' },
              { value: 'rascunho', label: 'Rascunhos' },
              { value: 'finalizado', label: 'Finalizados' },
            ]}
            label="Status"
          />
        </div>
      </div>

      {/* LISTA DE OCORRÊNCIAS */}
      {filteredOccurrences.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm text-slate-400">
          <ShieldAlert className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg font-black tracking-tight">Nenhuma ocorrência encontrada</p>
          <p className="text-sm font-medium">Tente ajustar sua busca ou criar uma nova.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOccurrences.map((ocorrencia) => (
            <div key={ocorrencia.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all p-6 relative">
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => {
                    setOccurrenceToDelete(ocorrencia.id);
                    setShowDeleteDialog(true);
                  }}
                  className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${ocorrencia.status_ocorrencia === 'finalizado' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                    {ocorrencia.status_ocorrencia}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {formatDistanceToNow(new Date(ocorrencia.created_at), { addSuffix: true, locale: ptBR })}
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900 mb-2">{ocorrencia.nome_rua || 'Sem rua informada'}</h3>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {ocorrencia.natureza_ocorrencia?.map((n: string, idx: number) => (
                  <span key={idx} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                    {n}
                  </span>
                ))}
              </div>

              <p className="text-sm text-slate-500 line-clamp-2 mb-4">{ocorrencia.relatorio_ocorrencia}</p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewingOccurrence(ocorrencia)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
                >
                  <Eye className="w-3 h-3" /> Visualizar
                </button>
                <button
                  onClick={() => { setEditingOccurrence(ocorrencia); setIsFormOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  <Edit2 className="w-3 h-3" /> Editar
                </button>
                <button
                  onClick={() => generatePDF(ocorrencia)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  <Download className="w-3 h-3" /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-white animate-in slide-in-from-bottom-8 duration-500 overflow-y-auto">
          <OcorrenciaMultiStepForm
            onClose={() => { setIsFormOpen(false); setEditingOccurrence(null); }}
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingOccurrence(null);
              queryClient.invalidateQueries({ queryKey: ['ocorrencias'] });
            }}
            initialData={editingOccurrence}
            defaultCategoria="padrao"
          />
        </div>
      )}

      {/* DELETE DIALOG */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => { setShowDeleteDialog(false); setOccurrenceToDelete(null); }}
        onConfirm={handleDelete}
        title="Excluir Ocorrência"
        description="Tem certeza que deseja excluir esta ocorrência? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}
