import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Settings, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  X,
  Layers,
  Zap,
  Shield,
  Clock,
  Save,
  Trash
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// ============================================================================
// SCHEMA DE VALIDAÇÃO (ZOD)
// ============================================================================

const planoSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(3, 'Mínimo de 3 caracteres'),
  descricao: z.string().min(10, 'Mínimo de 10 caracteres para a descrição comercial'),
  valor_mensal: z.coerce.number().min(0, 'O valor não pode ser negativo'),
  limite_usuarios: z.coerce.number().min(1, 'Mínimo de 1 usuário'),
  modulos_ativos: z.array(z.string()).min(1, 'Selecione pelo menos 1 módulo'),
  status: z.enum(['ativo', 'inativo'])
});

type PlanoForm = z.infer<typeof planoSchema>;

// ============================================================================
// PÁGINA: GESTÃO DE PLANOS SAAS (VERSÃO 2.0)
// ============================================================================

export function AdminPlanos() {
  const [planos, setPlanos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSoftDeleteModalOpen, setIsSoftDeleteModalOpen] = useState(false);
  const [selectedPlano, setSelectedPlano] = useState<any>(null);
  const [deleteConfirmationName, setDeleteConfirmationName] = useState('');

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PlanoForm>({
    resolver: zodResolver(planoSchema),
    defaultValues: {
      status: 'ativo',
      modulos_ativos: ['ocorrencias']
    }
  });

  const modulosDisponiveis = [
    { id: 'ocorrencias', label: 'Ocorrências' },
    { id: 'veiculos', label: 'Veículos' },
    { id: 'escalas', label: 'Escalas' },
    { id: 'combustivel', label: 'Combustível' },
    { id: 'cameras', label: 'Câmeras/LPR' },
    { id: 'administrativo', label: 'Administrativo' },
  ];

  const fetchPlanos = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('planos').select('*').order('valor_mensal', { ascending: true });
    if (error) toast.error('Falha ao carregar planos');
    else setPlanos(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPlanos();
  }, []);

  const onSubmit = async (data: PlanoForm) => {
    try {
      const { error } = data.id 
        ? await supabase.from('planos').update(data).eq('id', data.id)
        : await supabase.from('planos').insert([data]);

      if (error) throw error;
      
      toast.success(data.id ? 'Plano atualizado!' : 'Plano criado com sucesso!');
      setIsModalOpen(false);
      reset();
      fetchPlanos();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const openEditModal = (plano: any) => {
    setSelectedPlano(plano);
    Object.keys(plano).forEach(key => {
        if (key in planoSchema.shape) {
            setValue(key as any, plano[key]);
        }
    });
    setIsModalOpen(true);
  };

  const handleInactivate = async () => {
    try {
        const { error } = await supabase
            .from('planos')
            .update({ status: 'inativo' })
            .eq('id', selectedPlano.id);
        if (error) throw error;
        toast.success('Plano inativado. Clientes atuais não serão afetados.');
        setIsSoftDeleteModalOpen(false);
        fetchPlanos();
    } catch (e: any) {
        toast.error(e.message);
    }
  };

  const handleHardDelete = async () => {
    if (deleteConfirmationName !== selectedPlano.nome) {
        return toast.error('Nome do plano incorreto para exclusão.');
    }
    
    try {
        // Verificar se há instituições vinculadas antes (Regra de Negócio 3.B)
        const { count } = await supabase.from('instituicoes').select('*', { count: 'exact', head: true }).eq('plano_id', selectedPlano.id);
        
        if (count && count > 0) {
            return toast.error(`Impossível excluir: Existem ${count} instituições vinculadas a este plano.`);
        }

        const { error } = await supabase.from('planos').delete().eq('id', selectedPlano.id);
        if (error) throw error;
        
        toast.success('Plano removido permanentemente.');
        setIsDeleteModalOpen(false);
        setDeleteConfirmationName('');
        fetchPlanos();
    } catch (e: any) {
        toast.error(e.message);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Gestão de Planos</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Configuração de ofertas, limites e módulos SaaS.</p>
        </div>
        <button 
           onClick={() => { setSelectedPlano(null); reset(); setIsModalOpen(true); }}
           className="h-12 px-6 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all hover:-translate-y-1"
        >
            <Plus className="w-5 h-5 mr-3" /> Criar Novo Plano
        </button>
      </div>

      {/* PLAN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {planos.map((plano) => (
          <div key={plano.id} className={`bg-white rounded-[2.5rem] border p-8 shadow-sm hover:shadow-2xl transition-all flex flex-col group ${plano.status === 'inativo' ? 'opacity-60 grayscale' : 'border-slate-200'}`}>
            <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    plano.valor_mensal > 500 ? 'bg-slate-900 text-white' : 'bg-indigo-50 text-indigo-600'
                }`}>
                    {plano.valor_mensal === 0 ? <Layers className="w-6 h-6" /> : plano.valor_mensal > 800 ? <Shield className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={() => openEditModal(plano)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 transition-colors">
                        <Settings className="w-4 h-4" />
                    </button>
                    {plano.status === 'ativo' && (
                         <button onClick={() => { setSelectedPlano(plano); setIsSoftDeleteModalOpen(true); }} className="p-2 bg-amber-50 text-amber-500 rounded-xl">
                            <Clock className="w-4 h-4" />
                        </button>
                    )}
                    <button onClick={() => { setSelectedPlano(plano); setIsDeleteModalOpen(true); }} className="p-2 bg-rose-50 text-rose-500 rounded-xl">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{plano.nome}</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 mb-4">{plano.status}</p>
            <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-6">{plano.descricao}</p>

            <div className="flex items-baseline mb-8">
                <span className="text-3xl font-black text-slate-900">R$ {plano.valor_mensal.toFixed(2)}</span>
                <span className="ml-2 text-slate-400 font-bold text-xs uppercase">/ mês</span>
            </div>

            <div className="space-y-3 mb-10 flex-1">
                <FeatureItem label={`Limite: ${plano.limite_usuarios} usuários`} />
                {plano.modulos_ativos?.map((m: string) => (
                    <FeatureItem key={m} label={m.charAt(0).toUpperCase() + m.slice(1)} />
                ))}
            </div>

            <button onClick={() => openEditModal(plano)} className="w-full py-4 bg-slate-50 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                Configurar Plano
            </button>
          </div>
        ))}
      </div>

      {/* MODAL: CRIAR / EDITAR PLANO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-full animate-in zoom-in-95 duration-300">
                <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-2xl font-black text-slate-900">{selectedPlano ? 'Editar Plano' : 'Novo Plano SaaS'}</h2>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400"><X /></button>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="p-10 overflow-auto space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Nome do Plano" error={errors.nome?.message}>
                            <input {...register('nome')} className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold outline-none ring-offset-2 focus:ring-2 focus:ring-indigo-600" />
                        </InputGroup>
                        <InputGroup label="Valor Mensal (R$)" error={errors.valor_mensal?.message}>
                            <input {...register('valor_mensal')} type="number" step="0.01" className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
                        </InputGroup>
                    </div>

                    <InputGroup label="Descrição Comercial" error={errors.descricao?.message}>
                        <textarea {...register('descricao')} rows={3} className="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600 resize-none" />
                    </InputGroup>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Limite de Usuários/Tropa" error={errors.limite_usuarios?.message}>
                            <input {...register('limite_usuarios')} type="number" className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
                        </InputGroup>
                        <InputGroup label="Status">
                            <select {...register('status')} className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600">
                                <option value="ativo">Ativo</option>
                                <option value="inativo">Inativo</option>
                            </select>
                        </InputGroup>
                    </div>

                    <InputGroup label="Módulos Liberados" error={errors.modulos_ativos?.message}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {modulosDisponiveis.map(m => (
                                <label key={m.id} className="flex items-center p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors">
                                    <input type="checkbox" value={m.id} {...register('modulos_ativos')} className="w-4 h-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-600 mr-2" />
                                    <span className="text-[11px] font-black uppercase text-slate-600">{m.label}</span>
                                </label>
                            ))}
                        </div>
                    </InputGroup>

                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="text-sm font-bold text-slate-400 hover:text-slate-600">Cancelar</button>
                        <button type="submit" className="h-14 px-10 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
                            {selectedPlano ? 'Salvar Alterações' : 'Criar Plano e Públicar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* MODAL: DUPLA CONFIRMAÇÃO - INATIVAÇÃO (SOFT DELETE) */}
      {isSoftDeleteModalOpen && (
        <ConfirmModal 
            title={`Inativar plano ${selectedPlano?.nome}?`}
            desc="O plano deixará de estar disponível para novas vendas. Clientes atuais manterão o plano sem interrupção."
            onClose={() => setIsSoftDeleteModalOpen(false)}
            onConfirm={handleInactivate}
            confirmLabel="Sim, Inativar Plano"
            variant="warning"
        />
      )}

      {/* MODAL: DUPLA CONFIRMAÇÃO - EXCLUSÃO (HARD DELETE) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in" onClick={() => setIsDeleteModalOpen(false)}></div>
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 p-10 animate-in zoom-in-95">
                <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center mb-6">
                    <AlertTriangle className="w-8 h-8 text-rose-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Exclusão Irreversível</h3>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                    Para confirmar, digite o nome exato do plano <strong>{selectedPlano?.nome}</strong> abaixo:
                </p>
                <input 
                    type="text" 
                    placeholder="Digitar nome do plano..."
                    className="w-full h-14 bg-slate-50 rounded-2xl px-6 text-sm font-bold border border-transparent focus:border-rose-500 focus:bg-white transition-all outline-none mb-6"
                    value={deleteConfirmationName}
                    onChange={(e) => setDeleteConfirmationName(e.target.value)}
                />
                <div className="flex space-x-4">
                    <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 h-12 text-sm font-bold text-slate-400">Cancelar</button>
                    <button 
                        onClick={handleHardDelete}
                        disabled={deleteConfirmationName !== selectedPlano?.nome}
                        className={`flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            deleteConfirmationName === selectedPlano?.nome ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                        }`}
                    >
                        Excluir Plano
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}

// ============================================================================
// COMPONENTES DE APOIO INTERNO
// ============================================================================

function FeatureItem({ label }: { label: string }) {
    return (
        <div className="flex items-center text-sm font-semibold text-slate-600">
            <CheckCircle2 className="w-4 h-4 mr-3 text-emerald-500" />
            {label}
        </div>
    );
}

function InputGroup({ label, children, error }: any) {
    return (
        <div className="flex flex-col space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
            {children}
            {error && <span className="text-[10px] text-rose-500 font-bold ml-1">{error}</span>}
        </div>
    );
}

function ConfirmModal({ title, desc, onClose, onConfirm, confirmLabel, variant = 'warning' }: any) {
    const isWarning = variant === 'warning';
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md animate-in fade-in" onClick={onClose}></div>
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 relative z-10 text-center animate-in zoom-in-95">
                <div className={`w-16 h-16 ${isWarning ? 'bg-amber-50 text-amber-500' : 'bg-rose-50 text-rose-500'} rounded-3xl flex items-center justify-center mx-auto mb-6`}>
                    <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">{desc}</p>
                <div className="flex items-center space-x-3">
                    <button onClick={onClose} className="flex-1 h-12 text-sm font-bold text-slate-400">Cancelar</button>
                    <button onClick={onConfirm} className={`flex-grow h-12 px-6 ${isWarning ? 'bg-amber-500 shadow-amber-500/20' : 'bg-rose-600 shadow-rose-600/20'} text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg`}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
