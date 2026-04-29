import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Eye, Trash2, Edit2, Loader2, 
  AlertCircle, ShieldAlert, MapPin, User, Calendar,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useOccurrences } from '@/hooks/useOccurrences';
import { useQueryClient } from '@tanstack/react-query';
import { MariaDaPenhaForm } from '@/components/forms/MariaDaPenhaForm';
import { MariaDaPenhaDetails } from '@/components/modals/MariaDaPenhaDetails';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function MariaDaPenhaPage() {
  const queryClient = useQueryClient();
  const profile = useAuthStore(state => state.profile);  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'rascunho' | 'finalizado'>('todos');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOccurrence, setEditingOccurrence] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [occurrenceToDelete, setOccurrenceToDelete] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedOccurrence, setSelectedOccurrence] = useState<any>(null);

  // Buscar APENAS ocorrências do tipo maria_da_penha
  const { data: ocorrencias, isLoading, error } = useOccurrences('maria_da_penha', false);

  const filteredOccurrences = useMemo(() => {
    if (!ocorrencias) return [];
    
    return ocorrencias.filter(occ => {
      const matchesSearch = !searchTerm || 
        occ.endereco_rua?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        occ.natureza?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        occ.nome_vitima?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'todos' || occ.status_ocorrencia === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [ocorrencias, searchTerm, statusFilter]);

  const handleDelete = async () => {
    if (!occurrenceToDelete) return;
    
    try {
      const { error } = await supabase
        .from('maria_da_penha')
        .delete()
        .eq('id', occurrenceToDelete);
      
      if (error) throw error;
      
      toast.success('Ocorrência Maria da Penha excluída!');
      queryClient.invalidateQueries({ queryKey: ['occurrences'] });
      setShowDeleteDialog(false);
      setOccurrenceToDelete(null);
    } catch (err: any) {
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
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Patrulha Maria da Penha</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Ocorrências exclusivas da Lei Maria da Penha.</p>
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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar por rua, vítima, natureza..."
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
        </div>
      </div>

      {/* LISTA */}
      {filteredOccurrences.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm text-slate-400">
          <ShieldAlert className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg font-black tracking-tight">Nenhuma ocorrência Maria da Penha</p>
          <p className="text-sm font-medium">Crie uma nova ocorrência deste tipo.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOccurrences.map((ocorrencia) => (
            <div key={ocorrencia.id} className="bg-white rounded-[2.5rem] border border-purple-100 shadow-sm hover:shadow-xl transition-all p-6 relative">
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => { setSelectedOccurrence(ocorrencia); setIsDetailsOpen(true); }}
                  className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"
                  title="Ver Detalhes"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setEditingOccurrence(ocorrencia); setIsFormOpen(true); }}
                  className="p-2 hover:bg-indigo-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
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
                  <div className={`w-3 h-3 rounded-full ${ocorrencia.status === 'finalizada' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="text-xs font-black uppercase tracking-widest text-purple-600">
                    {ocorrencia.status}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {formatDistanceToNow(new Date(ocorrencia.created_at), { addSuffix: true, locale: ptBR })}
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900 mb-2">
                <User className="w-4 h-4 inline mr-2 text-slate-400" />
                {ocorrencia.vitima_nome || 'Vítima não informada'}
              </h3>

              <div className="flex items-center gap-4 mb-4 text-sm text-slate-500">
                <span>
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {ocorrencia.rua || 'Sem endereço'}
                </span>
                <span>
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {ocorrencia.natureza || 'Sem natureza'}
                </span>
              </div>

              <p className="text-sm text-slate-500 line-clamp-2">{ocorrencia.descricao}</p>
              
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-widest ${
                  ocorrencia.nivel_risco === 'Elevado' ? 'text-rose-600' : 'text-slate-400'
                }`}>
                  Risco: {ocorrencia.nivel_risco || 'Não avaliado'}
                </span>
                <button 
                  onClick={() => { setSelectedOccurrence(ocorrencia); setIsDetailsOpen(true); }}
                  className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline"
                >
                  Ver Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DETAILS */}
      <MariaDaPenhaDetails
        isOpen={isDetailsOpen}
        onClose={() => { setIsDetailsOpen(false); setSelectedOccurrence(null); }}
        data={selectedOccurrence}
      />

      {/* MODAL FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-white animate-in slide-in-from-bottom-8 duration-500 overflow-y-auto">
          <MariaDaPenhaForm
            onClose={() => { setIsFormOpen(false); setEditingOccurrence(null); }}
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingOccurrence(null);
              queryClient.invalidateQueries({ queryKey: ['occurrences'] });
            }}
            initialData={editingOccurrence}
          />
        </div>
      )}

      {/* DELETE DIALOG */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => { setShowDeleteDialog(false); setOccurrenceToDelete(null); }}
        onConfirm={handleDelete}
        title="Excluir Registro Especializado"
        description="Esta ação removerá permanentemente o histórico desta ocorrência Maria da Penha. Deseja prosseguir?"
        confirmText="Confirmar Exclusão"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}
