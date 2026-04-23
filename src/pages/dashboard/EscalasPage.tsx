import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  Users,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Edit2,
  Trash2,
  Eye,
  LayoutGrid,
  List,
  MoreVertical,
  ChevronRight
} from 'lucide-react';

import { useEscalas, useEquipes, useAgentes, useCreateEscala, useUpdateEscala, useDeleteEscala, useAddAgentesEscala } from '@/hooks/useEscalas';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';

const TIPOS_ESCALA = [
  { value: '12x72', label: '12x72 (12h trabalho / 72h folga)' },
  { value: '12x36', label: '12x36 (12h trabalho / 36h folga)' },
  { value: '24x48', label: '24x48 (24h trabalho / 48h folga)' },
  { value: '24x72', label: '24x72 (24h trabalho / 72h folga)' },
  { value: '6x1', label: '6x1 (6 dias trabalho / 1 dia folga)' },
  { value: '5x2', label: '5x2 (5 dias trabalho / 2 dias folga)' },
  { value: '12x60', label: '12x60 (12h trabalho / 60h folga)' },
  { value: '8x40', label: '8x40 (8h trabalho / 40h folga)' },
  { value: 'mista_8_12', label: 'Mista 8/12 (Escala híbrida)' },
  { value: '4x2', label: '4x2 (4 dias trabalho / 2 dias folga)' },
  { value: '24x24', label: '24x24 (24h trabalho / 24h folga)' },
  { value: '48x96', label: '48x96 (48h trabalho / 96h folga)' },
  { value: 'dias_semana', label: 'Dias da Semana (Escala comercial)' },
];

const DIAS_SEMANA = [
  { value: 'segunda', label: 'Segunda' },
  { value: 'terca', label: 'Terça' },
  { value: 'quarta', label: 'Quarta' },
  { value: 'quinta', label: 'Quinta' },
  { value: 'sexta', label: 'Sexta' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
];

interface EscalaFormData {
  tipo_escala: string;
  dias_semana: string[];
  data_inicio: string;
  validade_meses: number;
}

const EscalaCard = React.memo(({ escala, onEdit, onDelete, onViewAgentes }: any) => {
  const tipoLabel = TIPOS_ESCALA.find(t => t.value === escala.tipo_escala)?.label || escala.tipo_escala;
  
  const dataInicio = new Date(escala.data_inicio);
  const dataFim = new Date(escala.data_fim);
  const hoje = new Date();
  const diasRestantes = Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  const isExpired = dataFim < hoje;
  const isExpiringSoon = diasRestantes <= 30 && diasRestantes > 0;

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-600/5 transition-all duration-300 overflow-hidden group">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            escala.status === 'ativa' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
          }`}>
            <Calendar className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => onViewAgentes(escala)}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              title="Ver agentes"
            >
              <Users className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onEdit(escala)}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              title="Editar escala"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onDelete(escala)}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              title="Excluir escala"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h3 className="text-lg font-black text-slate-900 mb-1">{tipoLabel}</h3>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          {escala.tipo_escala}
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">
              Início: <strong>{dataInicio.toLocaleDateString('pt-BR')}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">
              Término: <strong>{dataFim.toLocaleDateString('pt-BR')}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">
              Validade: <strong>{escala.validade_meses} meses</strong>
            </span>
          </div>
        </div>

        {escala.dias_semana && escala.dias_semana.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Dias</p>
            <div className="flex flex-wrap gap-1">
              {escala.dias_semana.map((dia: string) => (
                <span key={dia} className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-600 uppercase">
                  {dia.substring(0, 3)}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
            escala.status === 'ativa' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
          }`}>
            {escala.status === 'ativa' ? <CheckCircle2 className="w-3 h-3 mr-1.5" /> : <AlertCircle className="w-3 h-3 mr-1.5" />}
            {escala.status}
          </span>
          
          {isExpired && (
            <span className="ml-2 inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter bg-red-50 text-red-600">
              Expirada
            </span>
          )}
          {isExpiringSoon && !isExpired && (
            <span className="ml-2 inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter bg-amber-50 text-amber-600">
              Expira em {diasRestantes} dias
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

export function EscalasPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEscala, setSelectedEscala] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [isAgentesOpen, setIsAgentesOpen] = useState(false);
  const [selectedEscalaAgentes, setSelectedEscalaAgentes] = useState<any>(null);
  
  const [formData, setFormData] = useState<EscalaFormData>({
    tipo_escala: '12x36',
    dias_semana: [],
    data_inicio: new Date().toISOString().split('T')[0],
    validade_meses: 6,
  });

  const profile = useAuthStore(state => state.profile);
  const { data: escalas, isLoading, refetch: fetchEscalas } = useEscalas();
  const { data: equipes } = useEquipes();
  const { data: agentes } = useAgentes();
  
  const createEscala = useCreateEscala();
  const updateEscala = useUpdateEscala();
  const addAgentes = useAddAgentesEscala();

  const filteredEscalas = escalas?.filter(escala => {
    const tipoLabel = TIPOS_ESCALA.find(t => t.value === escala.tipo_escala)?.label || '';
    return tipoLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
           escala.tipo_escala.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dataInicio = new Date(formData.data_inicio);
      const dataFim = new Date(dataInicio);
      dataFim.setMonth(dataFim.getMonth() + formData.validade_meses);

      const payload = {
        tipo_escala: formData.tipo_escala,
        dias_semana: formData.tipo_escala === 'dias_semana' ? formData.dias_semana : [],
        data_inicio: formData.data_inicio,
        data_fim: dataFim.toISOString().split('T')[0],
        validade_meses: formData.validade_meses,
        status: 'ativa' as const,
      };

      if (editMode && selectedEscala) {
        await updateEscala.mutateAsync({ id: selectedEscala.id, data: payload });
        toast.success('Escala atualizada com sucesso!');
      } else {
        await createEscala.mutateAsync(payload);
        toast.success('Escala criada com sucesso!');
      }

      setIsFormOpen(false);
      setEditMode(false);
      setSelectedEscala(null);
      setFormData({
        tipo_escala: '12x36',
        dias_semana: [],
        data_inicio: new Date().toISOString().split('T')[0],
        validade_meses: 6,
      });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar escala');
    }
  };

  const handleEdit = (escala: any) => {
    setSelectedEscala(escala);
    setFormData({
      tipo_escala: escala.tipo_escala,
      dias_semana: escala.dias_semana || [],
      data_inicio: escala.data_inicio,
      validade_meses: escala.validade_meses,
    });
    setEditMode(true);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (escala: any) => {
    setSelectedEscala(escala);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEscala) return;
    setDeleting(true);

    try {
      const { error } = await supabase
        .from('escalas')
        .delete()
        .eq('id', selectedEscala.id);

      if (error) throw error;
      
      toast.success('Escala excluída com sucesso!');
      fetchEscalas();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao excluir escala.');
    } finally {
      setDeleting(false);
      setIsConfirmOpen(false);
      setSelectedEscala(null);
    }
  };

  const handleViewAgentes = async (escala: any) => {
    const { data } = await supabase
      .from('escala_agentes')
      .select(`
        *,
        agente:usuario_id(primeiro_nome, sobrenome, matricula, funcao_operacional),
        equipe:equipe_id(nome)
      `)
      .eq('escala_id', escala.id);
    
    setSelectedEscalaAgentes({ escala, agentes: data || [] });
    setIsAgentesOpen(true);
  };

  const handleAddAgentes = async (agenteIds: string[], equipeId?: string) => {
    if (!selectedEscala) return;
    
    try {
      const agentesData = agenteIds.map(usuario_id => ({
        escala_id: selectedEscala.id,
        usuario_id,
        equipe_id: equipeId || null,
      }));
      
      await addAgentes.mutateAsync(agentesData);
      toast.success('Agentes adicionados à escala!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar agentes');
    }
  };

  return (
    <div className="space-y-6 lg:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Gestão de Escalas</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">
            Organize e gerencie as escalas de trabalho da sua Guarda Municipal.
          </p>
        </div>
        
        <button 
          onClick={() => { setEditMode(false); setSelectedEscala(null); setFormData({
            tipo_escala: '12x36',
            dias_semana: [],
            data_inicio: new Date().toISOString().split('T')[0],
            validade_meses: 6,
          }); setIsFormOpen(true); }}
          className="flex-1 md:flex-none h-12 px-6 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5 mr-3" /> Nova Escala
        </button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Pesquisar escalas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-500">
            {filteredEscalas.length} escala{filteredEscalas.length !== 1 ? 's' : ''} encontrada{filteredEscalas.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        </div>
      ) : filteredEscalas.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[2rem] p-12 text-center">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-black text-slate-900 mb-2">Nenhuma escala encontrada</h3>
          <p className="text-slate-500 mb-6">Comece criando sua primeira escala de trabalho.</p>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="px-6 h-12 bg-indigo-600 text-white rounded-2xl inline-flex items-center text-sm font-bold hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-5 h-5 mr-3" /> Criar Escala
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEscalas.map((escala) => (
            <EscalaCard 
              key={escala.id} 
              escala={escala} 
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewAgentes={handleViewAgentes}
            />
          ))}
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">
                {editMode ? 'Editar Escala' : 'Nova Escala'}
              </h2>
              <button 
                onClick={() => { setIsFormOpen(false); setEditMode(false); setSelectedEscala(null); }}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Tipo de Escala
                </label>
                <select
                  value={formData.tipo_escala}
                  onChange={(e) => setFormData({ ...formData, tipo_escala: e.target.value })}
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none"
                >
                  {TIPOS_ESCALA.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>

              {formData.tipo_escala === 'dias_semana' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Dias da Semana
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DIAS_SEMANA.map((dia) => (
                      <button
                        key={dia.value}
                        type="button"
                        onClick={() => {
                          const newDias = formData.dias_semana.includes(dia.value)
                            ? formData.dias_semana.filter(d => d !== dia.value)
                            : [...formData.dias_semana, dia.value];
                          setFormData({ ...formData, dias_semana: newDias });
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                          formData.dias_semana.includes(dia.value)
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {dia.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Validade (meses)
                  </label>
                  <select
                    value={formData.validade_meses}
                    onChange={(e) => setFormData({ ...formData, validade_meses: parseInt(e.target.value) })}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((mes) => (
                      <option key={mes} value={mes}>{mes} mês{mes > 1 ? 'es' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setIsFormOpen(false); setEditMode(false); setSelectedEscala(null); }}
                  className="flex-1 h-12 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createEscala.isPending || updateEscala.isPending}
                  className="flex-1 h-12 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {createEscala.isPending || updateEscala.isPending ? 'Salvando...' : editMode ? 'Atualizar' : 'Criar Escala'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAgentesOpen && selectedEscalaAgentes && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">Agentes da Escala</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {TIPOS_ESCALA.find(t => t.value === selectedEscalaAgentes.escala.tipo_escala)?.label}
                </p>
              </div>
              <button 
                onClick={() => { setIsAgentesOpen(false); setSelectedEscalaAgentes(null); }}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              {selectedEscalaAgentes.agentes.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Nenhum agente nesta escala.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedEscalaAgentes.agentes.map((agente: any) => (
                    <div key={agente.usuario_id} className="flex items-center p-4 bg-slate-50 rounded-2xl">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black">
                        {agente.agente?.primeiro_nome?.charAt(0) || '?'}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="font-bold text-slate-900">
                          {agente.agente?.primeiro_nome} {agente.agente?.sobrenome}
                        </p>
                        <p className="text-xs text-slate-500">
                          {agente.agente?.matricula && `Mat: ${agente.agente.matricula} • `}
                          {agente.equipe?.nome || 'Sem equipe'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}