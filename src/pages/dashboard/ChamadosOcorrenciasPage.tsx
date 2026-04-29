import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Eye, Trash2, Edit2, Loader2, 
  AlertCircle, ShieldAlert, Phone, MapPin, Clock
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useOccurrences } from '@/hooks/useOccurrences';
import { useQueryClient } from '@tanstack/react-query';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function ChamadosOcorrenciasPage() {
  const queryClient = useQueryClient();
  const profile = useAuthStore(state => state.profile);  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'rascunho' | 'finalizado'>('todos');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [occurrenceToDelete, setOccurrenceToDelete] = useState<string | null>(null);

  // Buscar APENAS ocorrências do tipo chamados (convertidas de chamados)
  const { data: ocorrencias, isLoading, error } = useOccurrences('chamados', false);

  const filteredOccurrences = useMemo(() => {
    if (!ocorrencias) return [];
    
    return ocorrencias.filter(occ => {
      const matchesSearch = !searchTerm || 
        occ.endereco_rua?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        occ.natureza?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        occ.solicitante_nome?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'todos' || occ.status_ocorrencia === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [ocorrencias, searchTerm, statusFilter]);

  const handleDelete = async () => {
    if (!occurrenceToDelete) return;
    
    try {
      const { error } = await supabase
        .from('chamados_ocorrencias')
        .delete()
        .eq('id', occurrenceToDelete);
      
      if (error) throw error;
      
      toast.success('Ocorrência de chamado excluída!');
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
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Ocorrências via Central/Chamados</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Ocorrências convertidas de chamados da central.</p>
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar por rua, solicitante, natureza..."
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
          <Phone className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg font-black tracking-tight">Nenhuma ocorrência de chamado</p>
          <p className="text-sm font-medium">As ocorrências convertidas de chamados aparecerão aqui.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOccurrences.map((ocorrencia) => (
            <div key={ocorrencia.id} className="bg-white rounded-[2.5rem] border border-blue-100 shadow-sm hover:shadow-xl transition-all p-6 relative">
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
                  <span className="text-xs font-black uppercase tracking-widest text-blue-600">
                    {ocorrencia.status_ocorrencia}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {formatDistanceToNow(new Date(ocorrencia.created_at), { addSuffix: true, locale: ptBR })}
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-900 mb-2">
                <MapPin className="w-4 h-4 inline mr-2 text-slate-400" />
                {ocorrencia.endereco_rua || 'Sem endereço'}
              </h3>

              <div className="flex items-center gap-4 mb-4 text-sm text-slate-500">
                <span>
                  <Phone className="w-3 h-3 inline mr-1" />
                  {ocorrencia.solicitante_nome || 'Solicitante não informado'}
                </span>
                <span>
                  <Clock className="w-3 h-3 inline mr-1" />
                  {ocorrencia.natureza || 'Sem natureza'}
                </span>
              </div>

              <p className="text-sm text-slate-500 line-clamp-2">{ocorrencia.relatorio_ocorrencia}</p>
            </div>
          ))}
        </div>
      )}

      {/* DELETE DIALOG */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => { setShowDeleteDialog(false); setOccurrenceToDelete(null); }}
        onConfirm={handleDelete}
        title="Excluir Ocorrência de Chamado"
        description="Tem certeza que deseja excluir esta ocorrência? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}
