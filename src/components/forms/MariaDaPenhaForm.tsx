import React, { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Shield,
  ChevronRight,
  ChevronLeft,
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
  AlertTriangle,
  AlertOctagon,
  MapPinCheck,
  ClipboardList,
  AlertCircle,
  Zap,
  ReceiptText
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { NaturezaSelector } from '../NaturezaSelector';
import { LocationInput } from '../LocationInput';
import { toast } from 'sonner';

const mariaDaPenhaSchema = z.object({
  origem: z.string().min(1, 'Origem é obrigatória'),
  sub_origem: z.string().optional(),
  descricao: z.string().min(10, 'Descrição é obrigatória'),
  natureza: z.array(z.string()).default(['Violência Doméstica (Aguardando Polícia)']),
  
  rua: z.string().min(1, 'Rua é obrigatória'),
  numero: z.string().optional(),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cep: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  ponto_referencia: z.string().optional(),
  coordenadas: z.string().optional(),

  vitima_nome: z.string().min(1, 'Nome da vítima é obrigatório'),
  vitima_genero: z.string().default('Feminino'),
  vitima_data_nascimento: z.string().optional(),
  vitima_cpf: z.string().optional(),
  vitima_rg: z.string().optional(),
  vitima_telefone: z.string().optional(),
  vitima_tem_filhos: z.boolean().default(false),
  vitima_num_filhos: z.string().optional(),
  vitima_idades_filhos: z.string().optional(),
  vitima_filhos_no_local: z.boolean().default(false),
  vitima_vinculo_agressor: z.string().min(1, 'Vínculo é obrigatório'),
  vitima_tempo_relacionamento: z.string().optional(),
  vitima_medida_protetiva_anterior: z.boolean().default(false),
  vitima_agressor_descumpriu: z.boolean().default(false),
  vitima_necessita_acolhimento: z.boolean().default(false),
  vitima_observacoes: z.string().optional(),

  agressor_nome: z.string().min(1, 'Nome do agressor é obrigatório'),
  agressor_genero: z.string().default('Masculino'),
  agressor_data_nascimento: z.string().optional(),
  agressor_cpf: z.string().optional(),
  agressor_rg: z.string().optional(),
  agressor_telefone: z.string().optional(),
  agressor_endereco: z.string().optional(),
  agressor_vinculo_vitima: z.string().optional(),
  agressor_possui_arma: z.string().min(1, 'Obrigatório'),
  agressor_tipo_arma: z.string().optional(),
  agressor_usa_alcool: z.string().optional(),
  agressor_usa_drogas: z.string().optional(),
  agressor_antecedentes: z.string().optional(),
  agressor_preso_vd: z.string().optional(),
  agressor_descricao_fisica: z.string().optional(),
  agressor_observacoes: z.string().optional(),

  tipos_violencia: z.array(z.string()).min(1, 'Selecione pelo menos um tipo'),
  primeira_agressao: z.string().min(1, 'Obrigatório'), // 'Sim' ou 'Não' (convert to bool on save)
  tempo_violencia: z.string().optional(),
  frequencia_aumentou: z.string().optional(),
  data_ultima_agressao: z.string().min(1, 'Obrigatório'),
  hora_agressao: z.string().min(1, 'Obrigatório'),
  local_agressao: z.string().min(1, 'Obrigatório'),
  uso_arma_fogo: z.boolean().default(false),
  uso_arma_branca: z.boolean().default(false),
  uso_objeto_contundente: z.boolean().default(false),
  vitima_buscou_atendimento: z.string().min(1, 'Obrigatório'),
  lesoes_visiveis: z.string().min(1, 'Obrigatório'), // 'Sim' ou 'Não'
  lesoes_descricao: z.string().optional(),
  ha_testemunhas: z.string().min(1, 'Obrigatório'), // 'Sim' ou 'Não'
  testemunhas_nomes: z.string().optional(),

  fonar_p1_q1: z.boolean().default(false),
  fonar_p1_q2: z.boolean().default(false),
  fonar_p1_q3: z.boolean().default(false),
  fonar_p1_q4: z.boolean().default(false),
  fonar_p1_q5: z.boolean().default(false),
  fonar_p1_q6: z.boolean().default(false),
  fonar_p1_q7: z.boolean().default(false),
  fonar_p1_q8: z.boolean().default(false),
  
  fonar_p2_q1: z.boolean().default(false),
  fonar_p2_q2: z.boolean().default(false),
  fonar_p2_q3: z.boolean().default(false),
  fonar_p2_q4: z.boolean().default(false),
  fonar_p2_q5: z.boolean().default(false),

  fonar_p3_q1: z.boolean().default(false),
  fonar_p3_q2: z.boolean().default(false),
  fonar_p3_q3: z.boolean().default(false),
  fonar_p3_q4: z.boolean().default(false),
  fonar_p3_q5: z.boolean().default(false),

  deseja_medidas_protetivas: z.string().min(1, 'Obrigatório'), // 'Sim' ou 'Não'
  medidas_solicitadas: z.array(z.string()).default([]),
  risco_iminente_morte: z.boolean().default(false),
  necessita_acolhimento_emergencial: z.boolean().default(false),

  encaminhamentos_realizados: z.array(z.string()).default([]),
});

type MDPFormData = z.infer<typeof mariaDaPenhaSchema>;

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export function MariaDaPenhaForm({ onClose, onSuccess, initialData }: Props) {
  const profile = useAuthStore(state => state.profile);
  const isAgent = ['gcm', 'gestor', 'supervisor'].includes(profile?.perfil_acesso || '');
  const isNew = !initialData;

  const [step, setStep] = useState(initialData?.origem ? 2 : 1);
  const totalSteps = 10;
  
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(initialData?.id || null);
  const isSaving = useRef(false);
  const [photos, setPhotos] = useState<{file: File, preview: string}[]>([]);
  const autosaveTimer = useRef<NodeJS.Timeout | null>(null);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<MDPFormData>({
    resolver: zodResolver(mariaDaPenhaSchema),
    defaultValues: {
      origem: initialData?.origem || (isAgent ? 'EQUIPE' : 'CENTRAL DE RÁDIO'),
      natureza: initialData?.natureza || ['Violência Doméstica (Aguardando Polícia)'],
      descricao: initialData?.descricao || '',
      ...initialData // spread the rest if available
    }
  });

  const watchAllFields = watch();
  const watchOrigem = watch('origem');
  
  // Risco Calculado
  const p1Sins = [
    watch('fonar_p1_q1'), watch('fonar_p1_q2'), watch('fonar_p1_q3'), watch('fonar_p1_q4'),
    watch('fonar_p1_q5'), watch('fonar_p1_q6'), watch('fonar_p1_q7'), watch('fonar_p1_q8')
  ].filter(Boolean).length;

  let nivel_risco = 'Baixo';
  if (p1Sins >= 6) nivel_risco = 'Elevado';
  else if (p1Sins >= 3) nivel_risco = 'Médio';

  const isStepValid = () => {
    const f = watchAllFields;
    switch (step) {
      case 1: return !!f.origem;
      case 2: return !!f.descricao && f.descricao.length >= 10 && f.natureza?.length > 0;
      case 3: return !!f.rua && !!f.bairro;
      case 4: return !!f.vitima_nome && !!f.vitima_vinculo_agressor;
      case 5: return !!f.agressor_nome && !!f.agressor_possui_arma;
      case 6: return f.tipos_violencia?.length > 0 && !!f.primeira_agressao && !!f.data_ultima_agressao && !!f.hora_agressao && !!f.local_agressao && !!f.vitima_buscou_atendimento && !!f.lesoes_visiveis && !!f.ha_testemunhas;
      case 7: return true; // FONAR bool defaults to false
      case 8: return !!f.deseja_medidas_protetivas;
      case 9: return true; // Encaminhamentos
      case 10: return true; // Fotos
      default: return true;
    }
  };

  const handleSaveDraft = async () => {
    if (!profile?.instituicao_id || !profile?.id) return;
    const data = watch();
    
    let origem_tipo = 'AGENTE';
    if (data.origem === 'CENTRAL DE RÁDIO' || data.origem === 'DENÚNCIA ANÔNIMA') origem_tipo = 'RADIO';
    if (data.origem === 'ÓRGÃOS PARCEIROS' || data.origem === 'FORÇAS DE SEGURANÇA') origem_tipo = 'PARCEIRO';

    const payload: any = {
      instituicao_id: profile.instituicao_id,
      criador_id: profile.id,
      status: 'rascunho',
      origem: data.origem,
      origem_tipo,
      natureza: data.natureza?.length ? data.natureza : ['Violência Doméstica (Aguardando Polícia)'],
      descricao: data.descricao || 'Ocorrência em rascunho',
      titulo: `Maria da Penha - ${data.vitima_nome || 'Em preenchimento'}`,
      ultimo_passo: step,
      rua: data.rua || 'Pendente',
      numero: data.numero || '',
      bairro: data.bairro || 'Pendente',
      cidade: data.cidade || '',
      estado: data.estado || '',
      cep: data.cep || '',
      referencia: data.ponto_referencia || '',
      coordenadas: data.coordenadas || '',
      
      vitima_nome: data.vitima_nome || '',
      vitima_genero: data.vitima_genero,
      vitima_data_nascimento: data.vitima_data_nascimento || null,
      vitima_cpf: data.vitima_cpf,
      vitima_rg: data.vitima_rg,
      vitima_telefone: data.vitima_telefone,
      vitima_tem_filhos: data.vitima_tem_filhos,
      vitima_num_filhos: data.vitima_num_filhos ? parseInt(data.vitima_num_filhos) : null,
      vitima_idades_filhos: data.vitima_idades_filhos,
      vitima_filhos_no_local: data.vitima_filhos_no_local,
      vitima_vinculo_agressor: data.vitima_vinculo_agressor,
      vitima_tempo_relacionamento: data.vitima_tempo_relacionamento,
      vitima_medida_protetiva_anterior: data.vitima_medida_protetiva_anterior,
      vitima_agressor_descumpriu: data.vitima_agressor_descumpriu,
      vitima_necessita_acolhimento: data.vitima_necessita_acolhimento,
      vitima_observacoes: data.vitima_observacoes,

      agressor_nome: data.agressor_nome || '',
      agressor_genero: data.agressor_genero,
      agressor_data_nascimento: data.agressor_data_nascimento || null,
      agressor_cpf: data.agressor_cpf,
      agressor_rg: data.agressor_rg,
      agressor_telefone: data.agressor_telefone,
      agressor_endereco: data.agressor_endereco,
      agressor_vinculo_vitima: data.agressor_vinculo_vitima,
      agressor_possui_arma: data.agressor_possui_arma,
      agressor_tipo_arma: data.agressor_tipo_arma,
      agressor_usa_alcool: data.agressor_usa_alcool,
      agressor_usa_drogas: data.agressor_usa_drogas,
      agressor_antecedentes: data.agressor_antecedentes,
      agressor_preso_vd: data.agressor_preso_vd,
      agressor_descricao_fisica: data.agressor_descricao_fisica,
      agressor_observacoes: data.agressor_observacoes,

      tipos_violencia: data.tipos_violencia,
      primeira_agressao: data.primeira_agressao === 'Sim',
      tempo_violencia: data.tempo_violencia,
      frequencia_aumentou: data.frequencia_aumentou,
      data_ultima_agressao: data.data_ultima_agressao || null,
      hora_agressao: data.hora_agressao,
      local_agressao: data.local_agressao,
      uso_arma_fogo: data.uso_arma_fogo,
      uso_arma_branca: data.uso_arma_branca,
      uso_objeto_contundente: data.uso_objeto_contundente,
      vitima_buscou_atendimento: data.vitima_buscou_atendimento,
      lesoes_visiveis: data.lesoes_visiveis === 'Sim',
      lesoes_descricao: data.lesoes_descricao,
      ha_testemunhas: data.ha_testemunhas === 'Sim',
      testemunhas_nomes: data.testemunhas_nomes,

      fonar_p1_q1: data.fonar_p1_q1, fonar_p1_q2: data.fonar_p1_q2, fonar_p1_q3: data.fonar_p1_q3, fonar_p1_q4: data.fonar_p1_q4,
      fonar_p1_q5: data.fonar_p1_q5, fonar_p1_q6: data.fonar_p1_q6, fonar_p1_q7: data.fonar_p1_q7, fonar_p1_q8: data.fonar_p1_q8,
      fonar_p2_q1: data.fonar_p2_q1, fonar_p2_q2: data.fonar_p2_q2, fonar_p2_q3: data.fonar_p2_q3, fonar_p2_q4: data.fonar_p2_q4, fonar_p2_q5: data.fonar_p2_q5,
      fonar_p3_q1: data.fonar_p3_q1, fonar_p3_q2: data.fonar_p3_q2, fonar_p3_q3: data.fonar_p3_q3, fonar_p3_q4: data.fonar_p3_q4, fonar_p3_q5: data.fonar_p3_q5,
      
      nivel_risco,

      deseja_medidas_protetivas: data.deseja_medidas_protetivas === 'Sim',
      medidas_solicitadas: data.medidas_solicitadas,
      risco_iminente_morte: data.risco_iminente_morte,
      necessita_acolhimento_emergencial: data.necessita_acolhimento_emergencial,
      encaminhamentos_realizados: data.encaminhamentos_realizados,
    };

    try {
      isSaving.current = true;
      if (draftId) {
        await supabase.from('maria_da_penha').update(payload).eq('id', draftId);
      } else {
        const { data: newOc, error } = await supabase.from('maria_da_penha').insert([payload]).select().single();
        if (error) throw error;
        if (newOc) setDraftId(newOc.id);
      }
    } catch (err) {
      console.error('AUTO-SAVE FAILED:', err);
    } finally {
      isSaving.current = false;
    }
  };

  useEffect(() => {
    if (isSubmitting || isSaving.current) return;
    const isStarted = watchAllFields.descricao?.length > 5 || watchAllFields.rua;
    if (isStarted) {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      autosaveTimer.current = setTimeout(() => handleSaveDraft(), 2000); 
    }
  }, [watchAllFields, step, isSubmitting]);

  const onSubmit = async (data: MDPFormData, isFinal: boolean) => {
    setLoading(true);
    if (isFinal) setIsSubmitting(true);
    
    try {
      await handleSaveDraft(); // Save all text fields first
      if (!draftId) throw new Error('Falha ao salvar rascunho.');

      // Photos upload
      let uploadedPhotos: string[] = [];
      if (photos.length > 0) {
        for (const photo of photos) {
          if (photo.file) {
            const fileName = `${crypto.randomUUID()}.${photo.file.name.split('.').pop()}`;
            const filePath = `${profile?.instituicao_id}/${fileName}`;
            const { error: uploadError } = await supabase.storage.from('ocorrencias').upload(filePath, photo.file);
            if (!uploadError) {
              const { data: { publicUrl } } = supabase.storage.from('ocorrencias').getPublicUrl(filePath);
              uploadedPhotos.push(publicUrl);
            }
          }
        }
      }

      if (uploadedPhotos.length > 0 || isFinal) {
        const finalPayload: any = {
           status: isFinal ? 'finalizada' : 'rascunho'
        };
        if (uploadedPhotos.length > 0) finalPayload.fotos = [...(initialData?.fotos || []), ...uploadedPhotos];
        await supabase.from('maria_da_penha').update(finalPayload).eq('id', draftId);
      }

      if (isFinal) {
        toast.success('Ocorrência Maria da Penha finalizada!');
        onSuccess();
      } else {
        toast.success('Rascunho salvo!');
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      toast.error('Erro ao salvar:', error.message);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const origemOptions = [
    { label: 'EQUIPE', desc: 'Patrulhamento' },
    { label: 'CENTRAL DE RÁDIO', desc: 'Central GCM' },
    { label: 'TRANSEUNTES', desc: 'Cidadão na via' },
    { label: 'DENÚNCIA ANÔNIMA', desc: 'Denúncia' },
    { label: 'ÓRGÃOS PARCEIROS', desc: 'Outros órgãos' },
    { label: 'FORÇAS DE SEGURANÇA', desc: 'PM, PC, PRF' }
  ];

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-slate-900">Registrar Ocorrência</h2>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-widest rounded-lg">
                  Maria da Penha
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {[...Array(totalSteps)].map((_, i) => (
                  <div 
                    key={i + 1} 
                    className={`h-1.5 rounded-full transition-all ${
                      (i + 1) === step ? 'w-8 bg-indigo-600' : (i + 1) < step ? 'w-4 bg-indigo-300' : 'w-4 bg-slate-200'
                    }`} 
                  />
                ))}
                <span className="text-xs font-black text-slate-400 uppercase ml-2">Passo {step} de {totalSteps}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <form id="mdp-form">
            
             {step === 1 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400">
                     <MapPinCheck className="w-4 h-4" />
                     <span className="text-xs font-black uppercase tracking-widest">Origem da Ocorrência</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">Origem da Ocorrência</h3>
                  <p className="text-sm text-slate-500 font-medium">Como esta ocorrência foi iniciada?</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Selecione a Origem</label>
                    <div className="space-y-2">
                      {origemOptions.map(o => (
                        <button
                          key={o.label}
                          type="button"
                          onClick={() => setValue('origem', o.label)}
                          className={`w-full p-4 rounded-2xl border text-left transition-all ${
                            watchOrigem === o.label ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <p className="text-sm font-black">{o.label}</p>
                          <p className={`text-xs font-medium ${watchOrigem === o.label ? 'text-indigo-100' : 'text-slate-400'}`}>{o.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

             {step === 2 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400">
                     <ReceiptText className="w-4 h-4" />
                     <span className="text-xs font-black uppercase tracking-widest">Descrição e Natureza</span>
                  </div>
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
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Autosave ativo (+10 caracteres)</p>
                    <p className="text-xs font-black text-slate-500">{watch('descricao')?.length || 0} CARACTERE(S)</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Natureza(s) da Ocorrência</label>
                  <Controller
                    name="natureza"
                    control={control}
                    render={({ field }) => (
                      <NaturezaSelector 
                        selected={field.value} 
                        onChange={field.onChange} 
                        lockedItems={['Violência Doméstica (Aguardando Polícia)']}
                      />
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

                <div className="p-5 bg-red-50 border border-red-200 rounded-2xl flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black text-red-800 uppercase tracking-widest">Alerta de Segurança</h4>
                    <p className="text-xs text-red-700 font-medium">Ao salvar o endereço, garanta que o agressor não terá acesso a este registro.</p>
                  </div>
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
                    setValue('cidade', loc.cidade);
                    setValue('estado', loc.estado);
                    setValue('numero', loc.numero || '');
                    setValue('coordenadas', loc.coordenadas || '');
                  }}
                />
                
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Ponto de Referência</label>
                  <input 
                    {...register('ponto_referencia')}
                    placeholder="Próximo a, em frente ao, etc..."
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none"
                  />
                </div>

                {(errors.rua || errors.bairro) && <p className="text-xs font-bold text-red-500">Endereço e bairro são campos obrigatórios.</p>}
              </div>
            )}

             {step === 4 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-slate-900">Dados da Vítima</h3>
                  <p className="text-sm text-slate-500 font-medium">Preencha as informações da vítima.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nome Completo *</label>
                    <input {...register('vitima_nome')} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600/10 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Vínculo com o Agressor *</label>
                    <select {...register('vitima_vinculo_agressor')} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600/10 outline-none">
                      <option value="">Selecione...</option>
                      <option value="Cônjuge">Cônjuge</option>
                      <option value="Ex-cônjuge">Ex-cônjuge</option>
                      <option value="Companheiro(a)">Companheiro(a)</option>
                      <option value="Ex-companheiro(a)">Ex-companheiro(a)</option>
                      <option value="Namorado(a)">Namorado(a)</option>
                      <option value="Ex-namorado(a)">Ex-namorado(a)</option>
                      <option value="Familiar">Familiar</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Telefone (Contato Seguro)</label>
                    <input {...register('vitima_telefone')} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600/10 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">CPF</label>
                    <input {...register('vitima_cpf')} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600/10 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                      <input type="checkbox" {...register('vitima_tem_filhos')} /> Possui filhos?
                    </label>
                  </div>
                  {watch('vitima_tem_filhos') && (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Número de filhos</label>
                        <input {...register('vitima_num_filhos')} type="number" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600/10 outline-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                          <input type="checkbox" {...register('vitima_filhos_no_local')} /> Filhos estavam no local?
                        </label>
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                      <input type="checkbox" {...register('vitima_medida_protetiva_anterior')} /> Já possuía medida protetiva?
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                      <input type="checkbox" {...register('vitima_agressor_descumpriu')} /> Agressor já descumpriu medida?
                    </label>
                  </div>
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                      <input type="checkbox" {...register('vitima_necessita_acolhimento')} /> Necessita de acolhimento emergencial?
                    </label>
                  </div>
                </div>
              </div>
            )}

             {step === 5 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-slate-900">Dados do Agressor</h3>
                  <p className="text-sm text-slate-500 font-medium">Preencha as informações do agressor.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nome Completo *</label>
                    <input {...register('agressor_nome')} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600/10 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Possui arma de fogo? *</label>
                    <select {...register('agressor_possui_arma')} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600/10 outline-none">
                      <option value="">Selecione...</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                      <option value="Não sabe">Não sabe</option>
                    </select>
                  </div>
                  {watch('agressor_possui_arma') === 'Sim' && (
                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Tipo de arma</label>
                      <input {...register('agressor_tipo_arma')} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600/10 outline-none" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Faz uso abusivo de álcool?</label>
                    <select {...register('agressor_usa_alcool')} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600/10 outline-none">
                      <option value="">Selecione...</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                      <option value="Às vezes">Às vezes</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Faz uso de drogas?</label>
                    <select {...register('agressor_usa_drogas')} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600/10 outline-none">
                      <option value="">Selecione...</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                      <option value="Às vezes">Às vezes</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Antecedentes Criminais?</label>
                    <select {...register('agressor_antecedentes')} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600/10 outline-none">
                      <option value="">Selecione...</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                      <option value="Não sabe">Não sabe</option>
                    </select>
                  </div>
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Descrição Física</label>
                    <textarea {...register('agressor_descricao_fisica')} rows={2} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600/10 outline-none resize-none" />
                  </div>
                </div>
              </div>
            )}

             {step === 6 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-slate-900">Fato da Violência</h3>
                  <p className="text-sm text-slate-500 font-medium">Detalhes da agressão.</p>
                </div>
                
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Tipo(s) de Violência *</label>
                  <Controller
                    name="tipos_violencia"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-2 gap-2">
                        {['Física', 'Psicológica', 'Sexual', 'Patrimonial', 'Moral'].map(tipo => (
                          <button
                            key={tipo}
                            type="button"
                            onClick={() => {
                              const val = field.value || [];
                              field.onChange(val.includes(tipo) ? val.filter(v => v !== tipo) : [...val, tipo]);
                            }}
                            className={`px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
                              (field.value || []).includes(tipo) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            {tipo}
                          </button>
                        ))}
                      </div>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">É a primeira agressão? *</label>
                    <select {...register('primeira_agressao')} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600/10 outline-none">
                      <option value="">Selecione...</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Data da agressão atual *</label>
                    <input type="date" {...register('data_ultima_agressao')} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600/10 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Hora aproximada *</label>
                    <select {...register('hora_agressao')} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600/10 outline-none">
                      <option value="">Selecione...</option>
                      <option value="Madrugada">Madrugada</option>
                      <option value="Manhã">Manhã</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Noite">Noite</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Local da agressão *</label>
                    <select {...register('local_agressao')} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600/10 outline-none">
                      <option value="">Selecione...</option>
                      <option value="Residência">Residência</option>
                      <option value="Via Pública">Via Pública</option>
                      <option value="Trabalho">Trabalho</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Vítima buscou atendimento médico? *</label>
                    <select {...register('vitima_buscou_atendimento')} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600/10 outline-none">
                      <option value="">Selecione...</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                      <option value="Não precisou">Não precisou</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Há lesões visíveis? *</label>
                    <select {...register('lesoes_visiveis')} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600/10 outline-none">
                      <option value="">Selecione...</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Há testemunhas? *</label>
                    <select {...register('ha_testemunhas')} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600/10 outline-none">
                      <option value="">Selecione...</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

             {step === 7 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400">
                     <ClipboardList className="w-4 h-4" />
                     <span className="text-xs font-black uppercase tracking-widest">Avaliação de Risco</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">Avaliação de Risco (FONAR)</h3>
                  <p className="text-sm text-slate-500 font-medium">Responda SIM ou NÃO (Padrão é Não).</p>
                </div>
                
                <div className={`p-5 rounded-2xl border flex items-center justify-between ${
                  nivel_risco === 'Elevado' ? 'bg-red-50 border-red-200 text-red-800' :
                  nivel_risco === 'Médio' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                  'bg-blue-50 border-blue-200 text-blue-800'
                }`}>
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-5 h-5" />
                    <span className="font-black uppercase text-sm">Nível de Risco Calculado:</span>
                  </div>
                  <span className="font-black text-lg">{nivel_risco}</span>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-slate-800 border-b border-slate-200 pb-2">Parte I - Histórico de Violência</h4>
                  {[
                    { key: 'fonar_p1_q1', text: 'O agressor já praticou outras violências contra você antes?' },
                    { key: 'fonar_p1_q2', text: 'A violência aumentou de frequência ou gravidade nos últimos 12 meses?' },
                    { key: 'fonar_p1_q3', text: 'O agressor já descumpriu medida protetiva anteriormente?' },
                    { key: 'fonar_p1_q4', text: 'O agressor já ameaçou matar você ou alguém da sua família?' },
                    { key: 'fonar_p1_q5', text: 'O agressor já tentou estrangulamento (enforcamento/sufocamento)?' },
                    { key: 'fonar_p1_q6', text: 'O agressor já usou arma de fogo em ameaça contra você?' },
                    { key: 'fonar_p1_q7', text: 'O agressor já espancou você durante gravidez?' },
                    { key: 'fonar_p1_q8', text: 'O agressor já fez ameaça de morte envolvendo filhos?' },
                  ].map(q => (
                    <label key={q.key} className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-300 transition-all">
                      <span className="text-sm font-medium">{q.text}</span>
                      <input type="checkbox" {...register(q.key as any)} className="w-5 h-5 accent-indigo-600" />
                    </label>
                  ))}

                  <h4 className="font-bold text-sm text-slate-800 border-b border-slate-200 pb-2 mt-6">Parte II - Comportamento</h4>
                  {[
                    { key: 'fonar_p2_q1', text: 'O agressor faz uso abusivo de álcool?' },
                    { key: 'fonar_p2_q2', text: 'O agressor faz uso de drogas ilícitas?' },
                    { key: 'fonar_p2_q3', text: 'O agressor possui ciúme excessivo ou comportamento controlador?' },
                    { key: 'fonar_p2_q4', text: 'O agressor já ameaçou suicídio ou tentou suicídio?' },
                    { key: 'fonar_p2_q5', text: 'O agressor monitora seus passos, mensagens ou redes sociais?' },
                  ].map(q => (
                    <label key={q.key} className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-300 transition-all">
                      <span className="text-sm font-medium">{q.text}</span>
                      <input type="checkbox" {...register(q.key as any)} className="w-5 h-5 accent-indigo-600" />
                    </label>
                  ))}

                  <h4 className="font-bold text-sm text-slate-800 border-b border-slate-200 pb-2 mt-6">Parte III - Situação da Vítima</h4>
                  {[
                    { key: 'fonar_p3_q1', text: 'Você tem onde morar com segurança imediata?' },
                    { key: 'fonar_p3_q2', text: 'Você tem autonomia financeira (renda própria)?' },
                    { key: 'fonar_p3_q3', text: 'Há filhos menores de idade na residência?' },
                    { key: 'fonar_p3_q4', text: 'Você está grávida no momento?' },
                    { key: 'fonar_p3_q5', text: 'Tem algum familiar ou amigo que possa acolhê-la?' },
                  ].map(q => (
                    <label key={q.key} className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-300 transition-all">
                      <span className="text-sm font-medium">{q.text}</span>
                      <input type="checkbox" {...register(q.key as any)} className="w-5 h-5 accent-indigo-600" />
                    </label>
                  ))}
                </div>
              </div>
            )}

             {step === 8 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-slate-900">Medidas Protetivas</h3>
                  <p className="text-sm text-slate-500 font-medium">Solicite medidas de proteção conforme a Lei Maria da Penha.</p>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Deseja solicitar medidas protetivas? *</label>
                  <select {...register('deseja_medidas_protetivas')} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600/10 outline-none">
                    <option value="">Selecione...</option>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                </div>
                {watch('deseja_medidas_protetivas') === 'Sim' && (
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Quais medidas? (Múltipla escolha)</label>
                    <Controller
                      name="medidas_solicitadas"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            'Afastamento do lar',
                            'Proibição de aproximação',
                            'Proibição de contato',
                            'Suspensão de porte de arma',
                            'Encaminhamento a programa de proteção',
                            'Prestação de alimentos provisionais'
                          ].map(m => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => {
                                const val = field.value || [];
                                field.onChange(val.includes(m) ? val.filter(v => v !== m) : [...val, m]);
                              }}
                              className={`px-4 py-3 rounded-xl text-sm font-bold text-left transition-all border ${
                                (field.value || []).includes(m) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      )}
                    />
                  </div>
                )}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <label className="flex items-center gap-2 font-bold text-sm">
                    <input type="checkbox" {...register('risco_iminente_morte')} className="w-5 h-5 accent-red-600" />
                    Vítima corre risco iminente de morte?
                  </label>
                  <label className="flex items-center gap-2 font-bold text-sm">
                    <input type="checkbox" {...register('necessita_acolhimento_emergencial')} className="w-5 h-5 accent-indigo-600" />
                    Necessita acolhimento emergencial?
                  </label>
                </div>
              </div>
            )}

             {step === 9 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-slate-900">Encaminhamentos Realizados</h3>
                  <p className="text-sm text-slate-500 font-medium">Selecione os encaminhamentos realizados para a vítima.</p>
                </div>
                <Controller
                  name="encaminhamentos_realizados"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        'Apoio à Polícia Civil',
                        'Apoio ao SAMU',
                        'Encaminhamento para IML',
                        'Acolhimento em Casa Abrigo',
                        'Encaminhamento para Delegacia da Mulher',
                        'Contato com Conselho Tutelar',
                        'Contato com CREAS',
                        'Orientação sobre Medidas Protetivas',
                        'Acompanhamento para local seguro'
                      ].map(enc => (
                        <button
                          key={enc}
                          type="button"
                          onClick={() => {
                            const val = field.value || [];
                            field.onChange(val.includes(enc) ? val.filter(v => v !== enc) : [...val, enc]);
                          }}
                          className={`px-4 py-3 rounded-xl text-sm font-bold text-left transition-all border ${
                            (field.value || []).includes(enc) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {enc}
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>
            )}

             {step === 10 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-slate-900">Anexos e Fotos</h3>
                  <p className="text-sm text-slate-500 font-medium">Insira até 10 fotos comprovando os fatos.</p>
                </div>

                <div className="p-5 bg-purple-50 border border-purple-200 rounded-2xl">
                  <p className="text-xs font-black text-purple-700 uppercase tracking-widest mb-3">Recomendações de Foto para Maria da Penha</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { icon: '👩', text: 'Foto da vítima com lesões (mediante consentimento)' },
                      { icon: '🏠', text: 'Foto do local da agressão (desordem, objetos quebrados)' },
                      { icon: '🔪', text: 'Foto de armas ou objetos usados na agressão' },
                      { icon: '📱', text: 'Foto de mensagens de ameaça (print da tela)' },
                    ].map(rec => (
                      <div key={rec.text} className="flex items-center gap-2 text-xs font-bold text-purple-800">
                        <span className="text-lg">{rec.icon}</span>
                        <span>{rec.text}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-black text-red-600 mt-3 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> NÃO FOTOGRAFE SEM CONSENTIMENTO!
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm group">
                      <img src={photo.preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setPhotos(prev => prev.filter((_, i) => i !== index))}
                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-xl"
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
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Adicionar Foto</span>
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
          </form>
        </div>
      </div>

      <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
            className="px-8 py-3 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-200 rounded-2xl transition-all flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> {step > 1 ? 'Voltar' : 'Cancelar'}
          </button>

          <div className="flex items-center gap-4">
            {step < totalSteps ? (
              <button 
                onClick={() => setStep(s => s + 1)}
                disabled={!isStepValid()}
                className={`px-10 py-3 font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center gap-2 active:scale-95 ${
                  isStepValid() 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/20' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Próximo Passo <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button 
                  onClick={handleSubmit((data) => onSubmit(data, false))}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-white border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 mr-2 inline" /> Salvar Rascunho
                </button>
                <button 
                  onClick={handleSubmit((data) => onSubmit(data, true))}
                  disabled={isSubmitting || !isStepValid()}
                  className="px-12 py-3 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 flex items-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  Registrar Ocorrência
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
