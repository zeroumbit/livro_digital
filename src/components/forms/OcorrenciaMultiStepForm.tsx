import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Shield, 
  ChevronRight, 
  ChevronLeft, 
  UserPlus, 
  Trash2, 
  Camera, 
  Save, 
  CheckCircle,
  X,
  FileText,
  MapPin,
  Users,
  Image as ImageIcon,
  Loader2,
  Info
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { NaturezaSelector } from '../NaturezaSelector';
import { LocationInput } from '../LocationInput';
import { validateCPF, fetchCNPJ } from '@/lib/api-services';
import { toast } from 'sonner';

const envolvidosSchema = z.object({
  nome_completo: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.enum(['Vítima', 'Suspeito', 'Testemunha', 'Informante', 'Outro']),
  genero: z.string().optional(),
  cpf: z.string().regex(/^\d{11}$|^$/, 'CPF deve ter 11 dígitos').optional(),
  rg: z.string().optional(),
  telefone: z.string().regex(/^\d{10,11}$|^$/, 'Telefone deve ter 10 ou 11 dígitos').optional(),
  descricao_fisica: z.string().optional(),
  declaracao: z.string().optional(),
  observacoes: z.string().optional(),
});

const ocorrenciaSchema = z.object({
  origem: z.string().min(1, 'Origem é obrigatória'),
  sub_origem: z.string().optional(),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  natureza: z.array(z.string()).min(1, 'Selecione pelo menos uma natureza'),
  rua: z.string().min(1, 'Rua é obrigatória'),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  numero: z.string().optional(),
  cep: z.string().optional(),
  ponto_referencia: z.string().optional(),
  coordenadas: z.string().optional(),
  envolvidos: z.array(envolvidosSchema).default([]),
});

type OcorrenciaFormData = z.infer<typeof ocorrenciaSchema>;

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export function OcorrenciaMultiStepForm({ onClose, onSuccess, initialData }: Props) {
  const profile = useAuthStore(state => state.profile);
  const institution = useAuthStore(state => state.institution);
  
  const isAgent = profile?.perfil_acesso === 'gcm';
  const isNew = !initialData;

  const [step, setStep] = useState(isNew ? 2 : 1); // Sempre pula Step 1 se for nova
  const [loading, setLoading] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(initialData?.id || null);
  const [photos, setPhotos] = useState<{file: File, preview: string}[]>([]);
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<OcorrenciaFormData>({
    resolver: zodResolver(ocorrenciaSchema),
    defaultValues: {
      origem: initialData?.origem || (isAgent ? 'EQUIPE' : 'CENTRAL DE RÁDIO'),
      sub_origem: initialData?.sub_origem || '',
      descricao: initialData?.descricao || '',
      natureza: initialData?.natureza || [],
      rua: initialData?.rua || '',
      bairro: initialData?.bairro || '',
      numero: initialData?.numero || '',
      cep: initialData?.cep || '',
      ponto_referencia: initialData?.ponto_referencia || '',
      coordenadas: initialData?.coordenadas || '',
      envolvidos: initialData?.envolvidos || [],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "envolvidos"
  });

  const watchDescricao = watch('descricao');
  const watchOrigem = watch('origem');
  const watchNatureza = watch('natureza');

  const origemOptions = [
    { label: 'EQUIPE', desc: 'Patrulhamento/Abordagem GCM', sub: ['Preventiva', 'Reativa', 'Programada'] },
    { label: 'CENTRAL DE RÁDIO', desc: 'Central de Comunicação GCM', sub: ['Telefone', 'Rádio', 'App', 'Outro'] },
    { label: 'TRANSEUNTES', desc: 'Cidadão em Via Pública', sub: ['Abordagem', 'Procura Espontânea'] },
    { label: 'DENÚNCIA ANÔNIMA', desc: 'Encaminhado pela central', sub: ['Telefone', 'Redes Sociais', 'Pessoalmente'] },
    { label: 'REDES SOCIAIS', desc: 'Monitoramento Digital', sub: [] },
    { label: 'CÂMERAS DE MONITORAMENTO', desc: 'Olho Vivo / Cerca Digital', sub: [] },
    { label: 'ÓRGÃOS PARCEIROS', desc: 'PM, SAMU, etc via Rádio', sub: [] },
  ];

  const selectedOrigem = origemOptions.find(o => o.label === watchOrigem);

  useEffect(() => {
    if (watchDescricao?.length >= 10 && step >= 2) {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      autosaveTimer.current = setTimeout(() => {
        handleSaveDraft();
      }, 3000);
    }
  }, [watchDescricao]);

  const handleSaveDraft = async () => {
    if (!profile?.instituicao_id || !profile?.id) return;
    const data = watch();
    
    // Mapeamento conforme CHECK constraint do DB: ('RADIO', 'AGENTE', 'PARCEIRO')
    let origem_tipo: 'RADIO' | 'AGENTE' | 'PARCEIRO' = 'AGENTE';
    if (data.origem === 'CENTRAL DE RÁDIO' || data.origem === 'DENÚNCIA ANÔNIMA') origem_tipo = 'RADIO';
    if (data.origem === 'ÓRGÃOS PARCEIROS') origem_tipo = 'PARCEIRO';
    
    const payload = {
      instituicao_id: profile.instituicao_id,
      criador_id: profile.id,
      status: 'rascunho',
      prioridade: 'media',
      origem: data.origem || (isAgent ? 'EQUIPE' : 'CENTRAL DE RÁDIO'),
      tipo_origem: data.sub_origem || '',
      origem_tipo,
      natureza: data.natureza.length > 0 ? data.natureza : ['Em preenchimento'],
      descricao: data.descricao,
      rua: data.rua || 'Pendente',
      numero: data.numero || '',
      bairro: data.bairro || 'Pendente',
      cidade: data.cidade || '',
      estado: data.estado || '',
      referencia: data.ponto_referencia || '',
      coordenadas: data.coordenadas || '',
    };

    try {
      if (draftId) {
        const { error } = await supabase.from('ocorrencias').update(payload).eq('id', draftId);
        if (error) console.error('Erro ao atualizar rascunho:', error.message, error.details);
      } else {
        const { data: newOc, error } = await supabase.from('ocorrencias').insert([payload]).select().single();
        if (error) {
          console.error('Erro ao criar rascunho:', error.message, error.details);
        } else if (newOc) {
          setDraftId(newOc.id);
        }
      }
    } catch (err) {
      console.error('Falha na operação de rascunho:', err);
    }
  };

  const onSubmit = async (data: OcorrenciaFormData, isFinal: boolean) => {
    setLoading(true);
    try {
      if (!profile?.instituicao_id || !profile?.id) return;

      const tipo_registro = profile.perfil_acesso === 'gcm' ? 'campo' : 'central_radio';
      
      // Mapeamento conforme CHECK constraint do DB: ('RADIO', 'AGENTE', 'PARCEIRO')
      let origem_tipo: 'RADIO' | 'AGENTE' | 'PARCEIRO' = 'AGENTE';
      if (data.origem === 'CENTRAL DE RÁDIO' || data.origem === 'DENÚNCIA ANÔNIMA') origem_tipo = 'RADIO';
      if (data.origem === 'ÓRGÃOS PARCEIROS') origem_tipo = 'PARCEIRO';

      const payload = {
        instituicao_id: profile.instituicao_id,
        criador_id: profile.id,
        status: isFinal ? 'finalizada' : 'rascunho',
        prioridade: 'media',
        titulo: data.natureza[0] || 'Ocorrência registrada',
        origem: data.origem || (isAgent ? 'EQUIPE' : 'CENTRAL DE RÁDIO'),
        tipo_origem: data.sub_origem || '',
        origem_tipo,
        natureza: data.natureza,
        descricao: data.descricao,
        rua: data.rua || 'Pendente',
        numero: data.numero || '',
        bairro: data.bairro || 'Pendente',
        cidade: data.cidade || '',
        estado: data.estado || '',
        referencia: data.ponto_referencia || '',
        coordenadas: data.coordenadas || '',
      };

      let currentId = draftId;
      if (currentId) {
        await supabase.from('ocorrencias').update(payload).eq('id', currentId);
      } else {
        const { data: newOc } = await supabase.from('ocorrencias').insert([payload]).select().single();
        if (newOc) currentId = newOc.id;
      }

      if (currentId) {
        await supabase.from('ocorrencia_envolvidos').delete().eq('ocorrencia_id', currentId);
        if (data.envolvidos.length > 0) {
          await supabase.from('ocorrencia_envolvidos').insert(
            data.envolvidos.map(e => ({ ...e, ocorrencia_id: currentId }))
          );
        }
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => {
    if (step === 2 && isNew) {
      onClose();
    } else {
      setStep(s => s - 1);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Registrar Ocorrência</h2>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2, 3, 4, 5].map(i => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all ${
                    i === step ? 'w-8 bg-indigo-600' : i < step ? 'w-4 bg-indigo-300' : 'w-4 bg-slate-200'
                  }`} 
                />
              ))}
              <span className="text-[10px] font-black text-slate-400 uppercase ml-2">Passo {step} de 5</span>
            </div>
          </div>
        </div>
        
        {isNew && (
           <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-xl">
             <Info className="w-4 h-4" />
             <span className="text-[10px] font-black uppercase tracking-widest">Iniciada pelo Usuário</span>
           </div>
        )}

        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-10">
        <div className="max-w-4xl mx-auto">
          
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900">Origem do Chamado</h3>
                <p className="text-sm text-slate-500 font-medium">Como esta ocorrência foi reportada?</p>
              </div>
              
              {!isNew && initialData && (
                <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                   <Zap className="w-5 h-5 text-indigo-600" />
                   <div>
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Origem do Chamado Original</p>
                     <p className="text-sm font-bold text-indigo-900">{initialData.origem}</p>
                   </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Selecione a Origem</label>
                  <div className="space-y-2">
                    {origemOptions.map(o => (
                      <button
                        key={o.label}
                        type="button"
                        onClick={() => {
                          setValue('origem', o.label);
                          setValue('sub_origem', '');
                        }}
                        className={`w-full p-4 rounded-2xl border text-left transition-all ${
                          watchOrigem === o.label ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <p className="text-sm font-black">{o.label}</p>
                        <p className={`text-[10px] font-medium ${watchOrigem === o.label ? 'text-indigo-100' : 'text-slate-400'}`}>{o.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedOrigem && selectedOrigem.sub.length > 0 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Sub-opção / Canal</label>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedOrigem.sub.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setValue('sub_origem', s)}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            watch('sub_origem') === s ? 'bg-indigo-50 border-indigo-600 text-indigo-600 font-bold' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900">Descrição e Natureza</h3>
                <p className="text-sm text-slate-500 font-medium">Relate o fato e selecione os enquadramentos legais.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Descrição Geral do Fato</label>
                <textarea 
                  {...register('descricao')}
                  rows={8}
                  placeholder="Relate detalhadamente o ocorrido..."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all resize-none"
                />
                {errors.descricao && <p className="text-xs font-bold text-red-500">{errors.descricao.message}</p>}
                <div className="flex justify-between items-center px-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Autosave ativo (+10 caracteres)</p>
                  <p className="text-[10px] font-black text-slate-500">{watchDescricao?.length || 0} CARACTERE(S)</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Natureza(s) da Ocorrência</label>
                <Controller
                  name="natureza"
                  control={control}
                  render={({ field }) => (
                    <NaturezaSelector selected={field.value} onChange={field.onChange} />
                  )}
                />
                {errors.natureza && <p className="text-xs font-bold text-red-500">{errors.natureza.message}</p>}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900">Localização</h3>
                <p className="text-sm text-slate-500 font-medium">Onde a equipe atuou? Use o GPS para coordenadas exatas.</p>
              </div>

              <LocationInput 
                defaultValues={{
                  rua: watch('rua'),
                  bairro: watch('bairro'),
                  cep: watch('cep'),
                  numero: watch('numero'),
                  coordenadas: watch('coordenadas')
                }}
                onLocationChange={(loc) => {
                  setValue('rua', loc.rua);
                  setValue('bairro', loc.bairro);
                  setValue('cep', loc.cep);
                  setValue('numero', loc.numero || '');
                  setValue('coordenadas', loc.coordenadas || '');
                }}
              />
              
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Ponto de Referência</label>
                <input 
                  {...register('ponto_referencia')}
                  placeholder="Próximo a, em frente ao, etc..."
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none"
                />
              </div>

              {(errors.rua || errors.bairro) && <p className="text-xs font-bold text-red-500">Endereço e bairro são campos obrigatórios.</p>}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-slate-900">Envolvidos</h3>
                  <p className="text-sm text-slate-500 font-medium">Qualifique as pessoas relacionadas ao evento.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => append({ nome_completo: '', tipo: 'Vítima' })}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                >
                  <UserPlus className="w-4 h-4" /> Novo Envolvido
                </button>
              </div>

              <div className="space-y-8">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
                    <button 
                      type="button"
                      onClick={() => remove(index)}
                      className="absolute top-6 right-6 p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Completo</label>
                        <input 
                          {...register(`envolvidos.${index}.nome_completo`)}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600/10 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Vínculo</label>
                        <select 
                          {...register(`envolvidos.${index}.tipo`)}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600/10 outline-none"
                        >
                          <option value="Vítima">Vítima</option>
                          <option value="Suspeito">Suspeito</option>
                          <option value="Testemunha">Testemunha</option>
                          <option value="Informante">Informante</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CPF / CNPJ</label>
                        <input 
                          {...register(`envolvidos.${index}.cpf`)}
                          placeholder="000.000.000-00"
                          onBlur={async (e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length === 11) {
                              if (!validateCPF(val)) toast.error('CPF Inválido');
                            } else if (val.length === 14) {
                              const data = await fetchCNPJ(val);
                              if (data) {
                                setValue(`envolvidos.${index}.nome_completo`, data.razao_social);
                                setValue(`envolvidos.${index}.observacoes`, `Empresa: ${data.nome_fantasia || data.razao_social}`);
                                toast.success('Dados da empresa carregados!');
                              }
                            }
                          }}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600/10 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RG</label>
                        <input 
                          {...register(`envolvidos.${index}.rg`)}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600/10 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gênero</label>
                        <select 
                          {...register(`envolvidos.${index}.genero`)}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600/10 outline-none"
                        >
                          <option value="">Selecione...</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Feminino">Feminino</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefone de Contato</label>
                        <input 
                          {...register(`envolvidos.${index}.telefone`)}
                          placeholder="(00) 00000-0000"
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600/10 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição Física (Altura, Peso, Sinais)</label>
                        <input 
                          {...register(`envolvidos.${index}.descricao_fisica`)}
                          placeholder="Ex: Tatuagem braço direito..."
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600/10 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Declaração / Versão do Fato</label>
                          <textarea 
                            {...register(`envolvidos.${index}.declaracao`)}
                            rows={3}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none resize-none"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observações Extras</label>
                          <textarea 
                            {...register(`envolvidos.${index}.observacoes`)}
                            rows={3}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none resize-none"
                          />
                       </div>
                    </div>
                  </div>
                ))}

                {fields.length === 0 && (
                  <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                    <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Nenhum envolvido registrado no evento.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900">Anexos e Fotos</h3>
                <p className="text-sm text-slate-500 font-medium">Insira até 10 fotos comprovando os fatos.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm group">
                    <img src={photo.preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setPhotos(prev => prev.filter((_, i) => i !== index))}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {photos.length < 10 && (
                  <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-2 hover:bg-indigo-50 hover:border-indigo-200 transition-all cursor-pointer group">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        const newPhotos = files.map(file => ({
                          file,
                          preview: URL.createObjectURL(file)
                        }));
                        setPhotos(prev => [...prev, ...newPhotos].slice(0, 10));
                      }}
                    />
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Camera className="w-6 h-6 text-indigo-600" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adicionar Foto</span>
                  </label>
                )}
              </div>

              <div className="p-8 bg-amber-50 border border-amber-100 rounded-[2.5rem] flex gap-6">
                <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center shrink-0">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-amber-900">Finalização Irreversível</h4>
                  <p className="text-sm text-amber-700 font-medium mt-1 leading-relaxed">Ao registrar a ocorrência como <strong>FINALIZADA</strong>, todos os campos acima se tornam imutáveis para garantir a integridade dos logs. Futuros complementos deverão ser feitos via <strong>Módulo de Anotações</strong>.</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <button 
          onClick={prevStep}
          className="px-8 py-4 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-200 rounded-2xl transition-all flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="flex items-center gap-4">
          {step < 5 ? (
            <button 
              onClick={nextStep}
              className="px-10 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2 active:scale-95"
            >
              Próximo Passo <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button 
                onClick={handleSubmit(d => onSubmit(d, false))}
                disabled={loading}
                className="px-8 py-4 bg-white border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
              >
                Salvar Rascunho
              </button>
              <button 
                onClick={handleSubmit(d => onSubmit(d, true))}
                disabled={loading}
                className="px-12 py-4 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 flex items-center gap-3 active:scale-95"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                Registrar Ocorrência
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
