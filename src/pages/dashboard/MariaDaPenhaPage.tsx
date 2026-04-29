import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Eye, Trash2, Pencil, Loader2, 
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
        occ.rua?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        occ.natureza?.some((n: string) => n.toLowerCase().includes(searchTerm.toLowerCase())) ||
        occ.vitima_nome?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'todos' || occ.status === statusFilter;
      
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

      {/* TABELA DE OCORRÊNCIAS */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocolo</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vítima</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Endereço</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Natureza</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Risco</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOccurrences.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-20 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <ShieldAlert className="w-16 h-16 mb-4 opacity-20" />
                      <p className="text-lg font-black tracking-tight">Nenhuma ocorrência encontrada</p>
                      <p className="text-sm font-medium">Tente ajustar sua busca ou criar uma nova.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOccurrences.map((ocorrencia) => (
                  <tr key={ocorrencia.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <span className="font-black text-indigo-600">#{ocorrencia.id.slice(0, 8)}</span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-700">{ocorrencia.vitima_nome || 'Não informado'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2 text-slate-600 max-w-[200px]">
                        <MapPin className="w-4 h-4 shrink-0 text-slate-400" />
                        <span className="truncate font-medium">{ocorrencia.rua || 'Sem endereço'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-slate-600 font-medium">{ocorrencia.natureza || '---'}</td>
                    <td className="px-6 py-6">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                        ocorrencia.nivel_risco === 'Elevado' 
                          ? 'bg-rose-50 text-rose-600 border-rose-100' 
                          : 'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>
                        {ocorrencia.nivel_risco || 'Não avaliado'}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${ocorrencia.status === 'finalizada' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${ocorrencia.status === 'finalizada' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {ocorrencia.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setSelectedOccurrence(ocorrencia); setIsDetailsOpen(true); }}
                          className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-100 transition-all"
                          title="Visualizar Detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setEditingOccurrence(ocorrencia); setIsFormOpen(true); }}
                          className="w-10 h-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setOccurrenceToDelete(ocorrencia.id);
                            setShowDeleteDialog(true);
                          }}
                          className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center hover:bg-rose-100 transition-all"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
