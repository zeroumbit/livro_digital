import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Settings, 
  Trash2, 
  MapPin,
  AlertTriangle,
  X,
  FileText,
  Search,
  Filter,
  ShieldAlert,
  Clock,
  Radio,
  User,
  Users
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/useAuthStore';

// ============================================================================
// SCHEMA DE VALIDAÇÃO (ZOD)
// ============================================================================

const ocorrenciaSchema = z.object({
  id: z.string().optional(),
  natureza: z.array(z.string()).min(1, 'Selecione ao menos 1 natureza'),
  descricao: z.string().min(10, 'Descrição detalhada é obrigatória'),
  prioridade: z.enum(['baixa', 'media', 'alta', 'critica', 'urgente']),
  rua: z.string().min(2, 'Logradouro obrigatório'),
  numero: z.string().optional(),
  bairro: z.string().min(2, 'Bairro obrigatório'),
  referencia: z.string().optional(),
  origem: z.string().min(2, 'Nome/Referência da origem'),
  origem_tipo: z.enum(['RADIO', 'AGENTE', 'PARCEIRO']),
  status: z.enum(['rascunho', 'aberta', 'em_atendimento', 'finalizada', 'arquivada']).optional()
});

type OcorrenciaForm = z.infer<typeof ocorrenciaSchema>;

// ============================================================================
// PÁGINA: MÓDULO DE OCORRÊNCIAS
// ============================================================================

export function OcorrenciasPage() {
  const { institution, user } = useAuthStore();
  const [ocorrencias, setOcorrencias] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<OcorrenciaForm>({
    resolver: zodResolver(ocorrenciaSchema),
    defaultValues: {
      natureza: [],
      prioridade: 'media',
      origem_tipo: 'RADIO',
      status: 'rascunho'
    }
  });

  const naturezasComuns = ['Roubo/Furto', 'Perturbação do Sossego', 'Acidente de Trânsito', 'Apoio a Outro Órgão', 'Violência Doméstica', 'Dano ao Patrimônio Púb.', 'Uso/Tráfico de Drogas'];

  const fetchOcorrencias = async () => {
    if (!institution?.id) return;
    setIsLoading(true);
    const { data, error } = await supabase
        .from('ocorrencias')
        .select('*, criador:usuarios(primeiro_nome, sobrenome)')
        .eq('instituicao_id', institution.id)
        .order('created_at', { ascending: false });
        
    if (error) toast.error('Falha ao carregar ocorrências');
    else setOcorrencias(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOcorrencias();
  }, [institution?.id]);

  const onSubmit = async (data: OcorrenciaForm) => {
    try {
      if (!institution?.id || !user?.id) throw new Error('Credenciais não definidas');

      const payload = {
          ...data,
          instituicao_id: institution.id,
          criador_id: user.id
      };

      // Como exigido na SPEC, rascunho pode adicionar/editar, finalizado não.
      const { error } = data.id 
        ? await supabase.from('ocorrencias').update(payload).eq('id', data.id)
        : await supabase.from('ocorrencias').insert([payload]);

      if (error) throw error;
      
      toast.success(data.id ? 'Ocorrência salva com sucesso!' : 'Nova ocorrência gerada e despachada!');
      setIsModalOpen(false);
      reset();
      fetchOcorrencias();
    } catch (e: any) {
      toast.error(e.message || 'Erro de violação de negócio. (Ex: Ocorrência finalizada)');
    }
  };

  const filteredOcorrencias = ocorrencias.filter(o => 
      o.natureza.join(' ').toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.rua.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(o.numero_oficial).includes(searchTerm)
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Ocorrências</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Registo Oficial e Despacho de Viaturas.</p>
        </div>
        
        <div className="flex items-center space-x-3">
            <div className="relative group flex-1 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Buscar RO, Natureza ou Local..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-12 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-rose-600/5 focus:border-rose-600 transition-all shadow-sm"
                />
            </div>
            <button 
                onClick={() => { reset(); setIsModalOpen(true); }}
                className="h-12 px-6 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg shadow-slate-900/20 hover:bg-black transition-all hover:-translate-y-1"
            >
                <Plus className="w-5 h-5 mr-3" /> Novo Despacho
            </button>
        </div>
      </div>

      {/* GRID DE OCORRÊNCIAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredOcorrencias.map((ocorrencia) => (
          <div key={ocorrencia.id} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all group">
              <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-3">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                          ocorrencia.prioridade === 'critica' || ocorrencia.prioridade === 'urgente' ? 'bg-rose-50 text-rose-600' :
                          ocorrencia.prioridade === 'alta' ? 'bg-amber-50 text-amber-500' : 'bg-slate-100 text-slate-500'
                      }`}>
                          <ShieldAlert className="w-6 h-6" />
                      </div>
                      <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">RO #{ocorrencia.numero_oficial}</p>
                          <h3 className="text-xl font-black text-slate-900 truncate max-w-[200px] xl:max-w-[300px]">
                              {ocorrencia.natureza[0]} {ocorrencia.natureza.length > 1 && '(+)'}
                          </h3>
                      </div>
                  </div>
                  <PriorityBadge priority={ocorrencia.prioridade} />
              </div>

              <div className="flex-1 space-y-4 mb-6">
                  <div className="flex items-start bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5 mr-3 shrink-0" />
                      <div>
                          <p className="text-sm font-bold text-slate-700">{ocorrencia.rua}, {ocorrencia.numero || 'S/N'}</p>
                          <p className="text-xs text-slate-500">{ocorrencia.bairro} {ocorrencia.referencia && `- ${ocorrencia.referencia}`}</p>
                      </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-2">
                       <div className="flex items-center">
                           <Clock className="w-4 h-4 mr-2" />
                           {new Date(ocorrencia.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                       </div>
                       <div className="flex items-center">
                           <User className="w-4 h-4 mr-2" />
                           {ocorrencia.criador?.primeiro_nome}
                       </div>
                  </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <StatusBadge status={ocorrencia.status} />
                  <button 
                      onClick={() => {
                          Object.keys(ocorrenciaSchema.shape).forEach(key => {
                              if(key in ocorrencia) setValue(key as any, ocorrencia[key]);
                          });
                          setIsModalOpen(true);
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800"
                  >
                      Acessar Detalhes
                  </button>
              </div>
          </div>
        ))}
      </div>

      {/* MODAL: NOVA OCORRÊNCIA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white w-full max-w-4xl rounded-[2.5rem] relative z-10 flex flex-col my-auto animate-in zoom-in-95 overflow-hidden">
                <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
                    <div className="flex items-center">
                        <ShieldAlert className="w-6 h-6 mr-3 text-rose-500" />
                        <h2 className="text-2xl font-black">Central de Operações</h2>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20"><X className="w-5 h-5"/></button>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    
                    {/* ORIGEM */}
                    <section className="space-y-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center"><Radio className="w-4 h-4 mr-2" /> Origem do Acionamento</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Tipo de Modulação" error={errors.origem_tipo?.message}>
                                <select {...register('origem_tipo')} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none focus:border-slate-900">
                                    <option value="RADIO">Via Rádio (CECOM)</option>
                                    <option value="AGENTE">Guarnição (Avistamento patrulha)</option>
                                    <option value="PARCEIRO">Apoio (PM, SAMU, BM)</option>
                                </select>
                            </InputGroup>
                            <InputGroup label="Nome/Referência (Quem Acionou)" error={errors.origem?.message}>
                                <input {...register('origem')} placeholder="Ex: Viatura 104, ou Base SAMU" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none focus:border-slate-900" />
                            </InputGroup>
                        </div>
                    </section>
                    
                    <div className="w-full h-px bg-slate-100"></div>

                    {/* NATUREZA DA OCORRÊNCIA */}
                    <section className="space-y-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center"><AlertTriangle className="w-4 h-4 mr-2" /> Classificação & Risco</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <InputGroup label="Natureza Primária" error={errors.natureza?.message}>
                                    <select 
                                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none focus:border-slate-900"
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val) setValue('natureza', [val]); // Simplificado para fins de MVP UI
                                        }}
                                    >
                                        <option value="">Selecione...</option>
                                        {naturezasComuns.map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </InputGroup>
                            </div>
                            <InputGroup label="Prioridade Tática" error={errors.prioridade?.message}>
                                <select {...register('prioridade')} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none focus:border-slate-900 text-rose-600">
                                    <option value="baixa">Baixa (Rotina)</option>
                                    <option value="media">Média</option>
                                    <option value="alta">Alta</option>
                                    <option value="critica">Crítica</option>
                                    <option value="urgente">Urgente (Risco Vida)</option>
                                </select>
                            </InputGroup>
                        </div>

                        <InputGroup label="Descrição Detalhada do Fato" error={errors.descricao?.message}>
                            <textarea {...register('descricao')} rows={4} placeholder="Relate o que aconteceu detalhadamente..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium outline-none focus:border-slate-900 resize-none" />
                        </InputGroup>
                    </section>

                    <div className="w-full h-px bg-slate-100"></div>

                    {/* LOCALIZAÇÃO EPIX */}
                    <section className="space-y-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center"><MapPin className="w-4 h-4 mr-2" /> Localização Exata</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <InputGroup label="Logradouro Principal" error={errors.rua?.message}>
                                    <input {...register('rua')} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none focus:border-slate-900" />
                                </InputGroup>
                            </div>
                            <InputGroup label="Número" error={errors.numero?.message}>
                                <input {...register('numero')} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none focus:border-slate-900" />
                            </InputGroup>
                            <div className="md:col-span-1">
                                <InputGroup label="Bairro" error={errors.bairro?.message}>
                                    <input {...register('bairro')} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none focus:border-slate-900" />
                                </InputGroup>
                            </div>
                            <div className="md:col-span-2">
                                <InputGroup label="Ponto de Referência" error={errors.referencia?.message}>
                                    <input {...register('referencia')} className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none focus:border-slate-900" />
                                </InputGroup>
                            </div>
                        </div>
                    </section>

                    {/* FOOTER ACTIONS */}
                    <div className="pt-8 border-t border-slate-100 flex items-center justify-end space-x-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-4 text-sm font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">Descartar</button>
                        <button type="submit" className="h-14 px-10 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-black transition-all">
                            Despachar Guarnição
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}

// ============================================================================
// COMPONENTES DE APOIO INTERNO
// ============================================================================

function InputGroup({ label, children, error }: any) {
    return (
        <div className="flex flex-col space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{label}</label>
            {children}
            {error && <span className="text-[10px] text-rose-500 font-bold ml-1">{error}</span>}
        </div>
    );
}

function PriorityBadge({ priority }: { priority: string }) {
    const colors: Record<string, string> = {
        baixa: 'bg-slate-100 text-slate-500',
        media: 'bg-indigo-100 text-indigo-600',
        alta: 'bg-amber-100 text-amber-600',
        critica: 'bg-rose-100 text-rose-600',
        urgente: 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
    };
    return <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${colors[priority]}`}>Prio: {priority}</span>;
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'rascunho') return <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Em Modulação (Aberto)</span>;
    if (status === 'finalizada') return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Encerrada</span>;
    return <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">{status}</span>;
}
