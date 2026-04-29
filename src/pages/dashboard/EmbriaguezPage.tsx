import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Search, Filter, Eye, Trash2, Pencil, 
  Loader2, AlertCircle, ShieldAlert, MapPin,
  FileText, ClipboardList, Beer, Activity, 
  ShieldCheck, X as CloseIcon, Printer, Download,
  Users, User
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useOccurrences } from '@/hooks/useOccurrences';
import { OcorrenciaMultiStepForm } from '@/components/forms/OcorrenciaMultiStepForm';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Componente Interno para Detalhes de Embriaguez
const EmbriaguezDetailsModal = ({ isOpen, onClose, data }: { isOpen: boolean, onClose: () => void, data: any }) => {
  const [involved, setInvolved] = useState<any[]>([]);
  const [loadingInvolved, setLoadingInvolved] = useState(false);

  React.useEffect(() => {
    if (isOpen && data) {
      const loadInvolved = async () => {
        setLoadingInvolved(true);
        const { data: inv } = await supabase.from('embriaguez_envolvidos').select('*').eq('embriaguez_id', data.id);
        setInvolved(inv || []);
        setLoadingInvolved(false);
      };
      loadInvolved();
    }
  }, [isOpen, data]);

  if (!isOpen || !data) return null;

  const DataField = ({ label, value, fullWidth = false }: any) => (
    <div className={fullWidth ? 'col-span-full' : ''}>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-700">{typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : (value || '---')}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-5xl bg-slate-50 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        <div className="px-8 py-6 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-600/20">
              <Beer className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Detalhes: Embriaguez ao Volante</h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocolo #{data.id.substring(0, 8)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200" title="Imprimir"><Printer className="w-5 h-5" /></button>
             <button onClick={onClose} className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200"><CloseIcon className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 pb-32">
          {/* GERAL */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <DataField label="Data e Hora" value={format(new Date(data.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} />
            <DataField label="Origem" value={data.origem} />
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
              <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${
                data.status === 'finalizada' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {data.status}
              </span>
            </div>
          </div>

          {/* LOCALIZAÇÃO */}
          <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
               <MapPin className="w-5 h-5 text-amber-600" />
               <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Localização</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <DataField label="Rua" value={data.rua} />
               <DataField label="Número" value={data.numero} />
               <DataField label="Bairro" value={data.bairro} />
               <DataField label="Cidade" value={data.cidade} />
               <DataField label="CEP" value={data.cep} />
               <DataField label="Referência" value={data.referencia} fullWidth />
            </div>
          </div>

          {/* MÓDULO TÉCNICO */}
          <div className="space-y-6">
             <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Constatação Técnica</h3>
             </div>
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ETILÔMETRO */}
                <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] space-y-6">
                   <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                     Etilômetro {data.etilometro_realizado ? <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded">Realizado</span> : <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded">Não Realizado</span>}
                   </h4>
                   {data.etilometro_realizado ? (
                     <div className="grid grid-cols-2 gap-4">
                        <DataField label="Marca" value={data.etilometro_marca} />
                        <DataField label="Série" value={data.etilometro_serie} />
                        <DataField label="Resultado (mg/L)" value={data.etilometro_resultado} />
                        <DataField label="Validade Calibração" value={data.etilometro_validade} />
                     </div>
                   ) : (
                     <DataField label="Justificativa da Recusa/Não Realização" value={data.etilometro_justificativa} fullWidth />
                   )}
                </div>

                {/* SINAIS E TESTES */}
                <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] space-y-6">
                   <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Sinais e Testes</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <DataField label="Linha Reta" value={data.teste_linha_reta} />
                      <DataField label="Um pé" value={data.teste_um_pe} />
                      <DataField label="Dedo-Nariz" value={data.teste_dedo_nariz} />
                      <DataField label="Conclusão" value={data.conclusao_tecnica} />
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 p-8 bg-white border border-slate-200 rounded-[2.5rem] space-y-4">
                   <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2"><Beer className="w-4 h-4 text-amber-500" /> Ingestão</h4>
                   <DataField label="Admitiu?" value={data.admitiu_ingestao} />
                   <DataField label="Quantidade" value={data.ingestao_quantidade} />
                   <DataField label="Tempo" value={data.ingestao_tempo} />
                </div>
                <div className="lg:col-span-2 p-8 bg-white border border-slate-200 rounded-[2.5rem] space-y-4">
                   <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Sinais Clínicos</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <DataField label="Aparência" value={data.sinais_aparencia?.join(', ')} />
                      <DataField label="Atitude" value={data.sinais_atitude?.join(', ')} />
                   </div>
                </div>
             </div>
          </div>

          {/* ENVOLVIDOS */}
          <div className="space-y-6">
             <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Envolvidos</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {involved.map((inv: any, i: number) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 space-y-4">
                     <div>
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-lg mb-2 inline-block">{inv.tipo}</span>
                        <h4 className="text-lg font-black text-slate-900">{inv.nome_completo}</h4>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <DataField label="CPF" value={inv.cpf} />
                        <DataField label="RG" value={inv.rg} />
                        <DataField label="Telefone" value={inv.telefone} />
                        <DataField label="Gênero" value={inv.genero} />
                     </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Relatório Operacional</h3>
             </div>
             <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8">
                <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{data.descricao || 'Sem relatório.'}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function EmbriaguezPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const profile = useAuthStore(state => state.profile);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'rascunho' | 'finalizado'>('todos');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOccurrence, setEditingOccurrence] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [occurrenceToDelete, setOccurrenceToDelete] = useState<string | null>(null);
  const [viewingOccurrence, setViewingOccurrence] = useState<any>(null);

  // Buscar APENAS ocorrências do tipo embriaguez
  const { data: ocorrencias, isLoading, error, refetch } = useOccurrences('embriaguez', false);

  const filteredOccurrences = useMemo(() => {
    if (!ocorrencias) return [];
    
    return ocorrencias.filter(occ => {
      const matchesSearch = !searchTerm || 
        occ.rua?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        occ.natureza?.some((n: string) => n.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'todos' || occ.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [ocorrencias, searchTerm, statusFilter]);

  const handleDelete = async () => {
    if (!occurrenceToDelete) return;
    
    try {
      // Deletar envolvidos primeiro para evitar erro de constraint (400 Bad Request)
      await supabase.from('embriaguez_envolvidos').delete().eq('embriaguez_id', occurrenceToDelete);
      
      const { error: delError } = await supabase
        .from('embriaguez')
        .delete()
        .eq('id', occurrenceToDelete);
      
      if (delError) throw delError;
      
      toast.success('Ocorrência de embriaguez excluída!');
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
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Operação Embriaguez ao Volante</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Ocorrências exclusivas de embriaguez.</p>
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
            placeholder="Pesquisar por rua, natureza..."
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
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Localização</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Natureza</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOccurrences.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <ShieldAlert className="w-16 h-16 mb-4 opacity-20" />
                      <p className="text-lg font-black tracking-tight">Nenhuma ocorrência encontrada</p>
                      <p className="text-sm font-medium">Crie uma nova ocorrência deste tipo.</p>
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
                      <div className="flex items-center gap-2 text-slate-600 max-w-[200px]">
                        <MapPin className="w-4 h-4 shrink-0 text-slate-400" />
                        <span className="truncate font-medium">{ocorrencia.rua || 'Sem endereço'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-wrap gap-1 max-w-[250px]">
                        {ocorrencia.natureza?.slice(0, 2).map((n: string, idx: number) => (
                          <span key={idx} className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                            {n}
                          </span>
                        ))}
                      </div>
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
                          onClick={() => setViewingOccurrence(ocorrencia)}
                          className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-100 transition-all"
                          title="Visualizar"
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

      {/* MODAL DETALHES */}
      <EmbriaguezDetailsModal 
        isOpen={!!viewingOccurrence}
        onClose={() => setViewingOccurrence(null)}
        data={viewingOccurrence}
      />

      {/* MODAL FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-white animate-in slide-in-from-bottom-8 duration-500 overflow-y-auto">
          <OcorrenciaMultiStepForm
            onClose={() => { setIsFormOpen(false); setEditingOccurrence(null); }}
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingOccurrence(null);
              queryClient.invalidateQueries({ queryKey: ['occurrences'] });
            }}
            initialData={editingOccurrence}
            defaultCategoria="embriaguez"
          />
        </div>
      )}

      {/* DELETE DIALOG */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => { setShowDeleteDialog(false); setOccurrenceToDelete(null); }}
        onConfirm={handleDelete}
        title="Excluir Ocorrência de Embriaguez"
        description="Tem certeza que deseja excluir esta ocorrência? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}
