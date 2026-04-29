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
  MapPinCheck,
  ReceiptText,
  ClipboardList,
  Beer,
  Activity,
  CheckSquare,
  AlertCircle,
  Zap
} from 'lucide-react';


import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { NaturezaSelector } from '../NaturezaSelector';
import { LocationInput } from '../LocationInput';
import { validateCPF, fetchCNPJ } from '@/lib/api-services';
import { toast } from 'sonner';
import { useOfflineStore } from '@/store/useOfflineStore';

const envolvidosSchema = z.object({
  nome_completo: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.enum(['Vítima', 'Suspeito', 'Testemunha', 'Informante', 'Condutor', 'Outro']),
  genero: z.string().optional(),
  cpf: z.string().regex(/^\d{11}$|^$/, 'CPF deve ter 11 dígitos').optional(),
  rg: z.string().optional(),
  telefone: z.string().regex(/^\d{10,11}$|^$/, 'Telefone deve ter 10 ou 11 dígitos').optional(),
  descricao_fisica: z.string().optional(),
  declaracao: z.string().optional(),
  observacoes: z.string().optional(),
});

const ocorrenciaSchema = z.object({
  categoria: z.enum(['padrao', 'maria_da_penha', 'embriaguez', 'chamados']).default('padrao'),
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
  natureza_alteracao: z.string().optional(),
  envolvidos: z.array(envolvidosSchema).default([]),
  
  // Módulo Embriaguez
  etilometro_marca: z.string().optional(),
  etilometro_serie: z.string().optional(),
  etilometro_resultado: z.string().optional(),
  etilometro_validade: z.string().optional(),
  etilometro_realizado: z.boolean().optional(),
  etilometro_justificativa: z.string().optional(), // Obrigatório se etilômetro NÃO utilizado
  sinais_aparencia: z.array(z.string()).default([]),
  sinais_atitude: z.array(z.string()).default([]),
  teste_linha_reta: z.string().optional(),
  teste_um_pe: z.string().optional(),
  teste_dedo_nariz: z.string().optional(),
  admitiu_ingestao: z.string().optional(),
  ingestao_quantidade: z.string().optional(),
  ingestao_tempo: z.string().optional(),
  conclusao_tecnica: z.string().optional(),
});


type OcorrenciaFormData = z.infer<typeof ocorrenciaSchema>;

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
defaultCategoria?: 'padrao' | 'maria_da_penha' | 'embriaguez' | 'chamados';
  categoriaLabel?: string;
}


const getTableConfig = (categoria: string) => {
  switch (categoria) {
    case 'embriaguez':
      return { tableName: 'embriaguez', involvedTableName: 'embriaguez_envolvidos', foreignKeyName: 'embriaguez_id' };
    case 'maria_da_penha':
      return { tableName: 'maria_da_penha', involvedTableName: null, foreignKeyName: null };
    case 'chamados':
      return { tableName: 'chamados_ocorrencias', involvedTableName: null, foreignKeyName: null };
    default:
      return { tableName: 'ocorrencias', involvedTableName: 'ocorrencia_envolvidos', foreignKeyName: 'ocorrencia_id' };
  }
};

export function OcorrenciaMultiStepForm({ onClose, onSuccess, initialData, defaultCategoria = 'padrao', categoriaLabel }: Props) {

  const profile = useAuthStore(state => state.profile);
  const institution = useAuthStore(state => state.institution);
  
  const isAgent = ['gcm', 'gestor', 'supervisor'].includes(profile?.perfil_acesso || '');

  const isNew = !initialData;

  const currentCategoria = initialData?.categoria || defaultCategoria;
  const { tableName: mainTableName, involvedTableName, foreignKeyName } = getTableConfig(currentCategoria);

  const isEmbriaguez = currentCategoria === 'embriaguez';
  const isMariaDaPenha = currentCategoria === 'maria_da_penha';
  const totalSteps = isEmbriaguez ? 6 : 5;

  const [step, setStep] = useState(() => {
    if (initialData?.origem) return 2;
    return 1;
  });

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(initialData?.id || null);
  const isSaving = useRef(false);

  const [origemSelecionada, setOrigemSelecionada] = useState(!!initialData?.origem);
   const [showSuccessModal, setShowSuccessModal] = useState(false);
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [deleteIndexTarget, setDeleteIndexTarget] = useState<number | null>(null);
   const [photos, setPhotos] = useState<{file: File, preview: string}[]>([]);
    const autosaveTimer = useRef<NodeJS.Timeout | null>(null);

    const { addToQueue } = useOfflineStore();
    const [offlineId] = useState(() => crypto.randomUUID());

  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<OcorrenciaFormData>({
    resolver: zodResolver(ocorrenciaSchema),
    defaultValues: {
      categoria: initialData?.categoria || defaultCategoria,
      origem: initialData?.origem || (isAgent ? 'EQUIPE' : 'CENTRAL DE RÁDIO'),
      sub_origem: initialData?.sub_origem || '',
      descricao: initialData?.descricao || '',
      natureza: initialData?.natureza || (isEmbriaguez ? ['Embriaguez em Via Pública'] : isMariaDaPenha ? ['Violência Doméstica'] : []),
      rua: initialData?.rua || '',
      bairro: initialData?.bairro || '',
      numero: initialData?.numero || '',
      cep: initialData?.cep || '',
      ponto_referencia: initialData?.ponto_referencia || '',
      coordenadas: initialData?.coordenadas || '',
      natureza_alteracao: initialData?.natureza_alteracao || '',
      envolvidos: initialData?.envolvidos || (isEmbriaguez ? [{ nome_completo: '', tipo: 'Suspeito' }] : []),
      sinais_aparencia: initialData?.sinais_aparencia || [],
      sinais_atitude: initialData?.sinais_atitude || [],
      etilometro_realizado: initialData?.etilometro_realizado || false,
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
    { label: 'FORÇAS DE SEGURANÇA', desc: 'PM, PC, PRF, PF, Bombeiros', sub: ['Polícia Militar', 'Polícia Civil', 'PRF', 'Polícia Federal', 'Bombeiros'] },
  ];

  const filteredOrigemOptions = isNew 
    ? origemOptions.filter(o => o.label !== 'CENTRAL DE RÁDIO' && o.label !== 'ÓRGÃOS PARCEIROS')
    : origemOptions;

  const selectedOrigem = filteredOrigemOptions.find(o => o.label === watchOrigem);


  const watchAllFields = watch();

  const isStepValid = () => {
    const fields = watchAllFields;
    
    switch (step) {
      case 1:
        return origemSelecionada;
      case 2:
        return !!fields.descricao && fields.descricao.length >= 10 && fields.natureza && fields.natureza.length > 0;
      case 3:
        return !!fields.rua && !!fields.bairro;
      case 4:
        // Na embriaguez, o primeiro envolvido deve ter nome preenchido
        return isEmbriaguez ? (fields.envolvidos?.length > 0 && !!fields.envolvidos[0].nome_completo) : true;
      case 5:
        if (isEmbriaguez) {
          const etilometroUsado = fields.etilometro_realizado;
          // Se etilômetro usado: resultado é obrigatório
          const etilometroOk = etilometroUsado
            ? !!fields.etilometro_resultado
            : !!fields.etilometro_justificativa; // Se não usado: justificativa é obrigatória
          // Se conclusão por sinais clínicos: pelo menos 1 sinal é obrigatório
          const conclusaoPorSinais = fields.conclusao_tecnica === 'confirmada_sinais';
          const hasSinais = (fields.sinais_aparencia?.length || 0) > 0 || (fields.sinais_atitude?.length || 0) > 0;
          const sinaisOk = conclusaoPorSinais ? hasSinais : true;
          return !!fields.conclusao_tecnica && etilometroOk && sinaisOk;
        }
        return true;
      default:
        return true;
    }
  };

  const canProceed = isStepValid();

  // Efeito de Auto-Save Robusto (Debounced) - Dispara em todos os passos
  useEffect(() => {
    if (initialData?.status === 'finalizada' || isSubmitting || isSaving.current) return;
    
    // Auto-save assim que a origem for selecionada (passo 1 em diante)
    if (watchAllFields.origem) {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      autosaveTimer.current = setTimeout(() => {
        handleSaveDraft();
      }, 2000); 
    }
  }, [watchAllFields, step, isSubmitting]);



  const handleSaveDraft = async () => {
    if (!profile?.instituicao_id || !profile?.id) return;
    const data = watch();
    
    // Mapeamento conforme CHECK constraint do DB: ('RADIO', 'AGENTE', 'PARCEIRO')
    let origem_tipo: 'RADIO' | 'AGENTE' | 'PARCEIRO' = 'AGENTE';
    if (data.origem === 'CENTRAL DE RÁDIO' || data.origem === 'DENÚNCIA ANÔNIMA') origem_tipo = 'RADIO';
    if (data.origem === 'ÓRGÃOS PARCEIROS' || data.origem === 'FORÇAS DE SEGURANÇA') origem_tipo = 'PARCEIRO';

    const payload: any = {
      instituicao_id: profile.instituicao_id,
      criador_id: profile.id,
      status: 'rascunho',
      ...(currentCategoria !== 'embriaguez' && currentCategoria !== 'maria_da_penha' ? {
        prioridade: 'media',
      } : {}),
      ...(currentCategoria === 'maria_da_penha' || currentCategoria === 'chamados' ? {
        ultimo_passo: step,
      } : {}),
      origem: data.origem || (isAgent ? 'EQUIPE' : 'CENTRAL DE RÁDIO'),
      origem_tipo,
      natureza: (data.natureza && data.natureza.length > 0) ? data.natureza : ['Em preenchimento'],
      descricao: data.descricao || 'Ocorrência em rascunho',
      rua: data.rua || 'Pendente',
      numero: data.numero || '',
      bairro: data.bairro || 'Pendente',
      referencia: data.ponto_referencia || '',
      coordenadas: data.coordenadas || '',
      ...(currentCategoria === 'maria_da_penha' || currentCategoria === 'chamados' ? {
        titulo: isEmbriaguez ? `Embriaguez - ${data.envolvidos?.find((e:any) => e.tipo === 'Suspeito')?.nome_completo || 'Em preenchimento'}` : (data.natureza?.[0] || 'Ocorrência em preenchimento'),
      } : {}),
      cep: data.cep || '',
      cidade: data.cidade || '',
      estado: data.estado || '',
      ...(currentCategoria === 'chamados' ? {
        canal_origem: data.sub_origem || '',
        tipo_origem: data.sub_origem || '',
      } : {}),
      ...(isEmbriaguez ? {
        etilometro_marca: data.etilometro_marca,
        etilometro_serie: data.etilometro_serie,
        etilometro_resultado: data.etilometro_resultado,
        etilometro_validade: data.etilometro_validade || null,
        etilometro_realizado: data.etilometro_realizado,
        etilometro_justificativa: data.etilometro_justificativa,
        sinais_aparencia: data.sinais_aparencia,
        sinais_atitude: data.sinais_atitude,
        teste_linha_reta: data.teste_linha_reta,
        teste_um_pe: data.teste_um_pe,
        teste_dedo_nariz: data.teste_dedo_nariz,
        admitiu_ingestao: data.admitiu_ingestao,
        ingestao_quantidade: data.ingestao_quantidade,
        ingestao_tempo: data.ingestao_tempo,
        conclusao_tecnica: data.conclusao_tecnica,
      } : {}),
      // Natureza alteração só existe nas tabelas padrão e de chamados
      ...(!isEmbriaguez && currentCategoria !== 'maria_da_penha' ? {
        natureza_alteracao: data.natureza_alteracao || null,
      } : {}),
    };

    // Adicionar chamado_id se vier de um chamado
    if (currentCategoria === 'chamados' && initialData?.chamado_id) {
      payload.chamado_id = initialData.chamado_id;
    }

    const tableName = mainTableName;
    const currentId = draftId || offlineId;

    if (!navigator.onLine) {
      addToQueue({
        id: currentId,
        tableName,
        data: payload,
        action: 'insert'
      });
      return;
    }

    try {
      isSaving.current = true;
      const { error } = await supabase.from(tableName).upsert([{ ...payload, id: currentId }]);
      if (error) throw error;
      if (!draftId) setDraftId(currentId);
    } catch (err: any) {
      console.error('AUTO-SAVE FAILED:', err);
      // Fallback to offline queue on network error
      if (err.message?.includes('Fetch') || err.code === 'PGRST100') {
         addToQueue({
            id: currentId,
            tableName,
            data: payload,
            action: 'insert'
         });
      }
    } finally {
      isSaving.current = false;
    }

  };

  const onSubmit = async (data: OcorrenciaFormData, isFinal: boolean) => {
    setLoading(true);
    if (isFinal) setIsSubmitting(true);
    
    const finalId = draftId || offlineId;
    let payloadFinal: any = null;

    try {
      if (!profile?.instituicao_id || !profile?.id) return;

      const tipo_registro = profile.perfil_acesso === 'gcm' ? 'campo' : 'central_radio';
      
      // Mapeamento conforme CHECK constraint do DB: ('RADIO', 'AGENTE', 'PARCEIRO')
      let origem_tipo: 'RADIO' | 'AGENTE' | 'PARCEIRO' = 'AGENTE';
      if (data.origem === 'CENTRAL DE RÁDIO' || data.origem === 'DENÚNCIA ANÔNIMA') origem_tipo = 'RADIO';
      if (data.origem === 'ÓRGÃOS PARCEIROS' || data.origem === 'FORÇAS DE SEGURANÇA') origem_tipo = 'PARCEIRO';

      const payload: any = {
        instituicao_id: profile.instituicao_id,
        criador_id: profile.id,
        status: isFinal ? 'finalizada' : 'rascunho',
        ...(currentCategoria !== 'embriaguez' && currentCategoria !== 'maria_da_penha' ? {
          prioridade: 'media',
        } : {}),
        ...(currentCategoria === 'maria_da_penha' || currentCategoria === 'chamados' ? {
          ultimo_passo: step,
        } : {}),
        origem: data.origem || (isAgent ? 'EQUIPE' : 'CENTRAL DE RÁDIO'),
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
        cep: data.cep || '',
        ...(currentCategoria === 'chamados' ? {
          canal_origem: data.sub_origem || '',
          tipo_origem: data.sub_origem || '',
        } : {}),
        ...(currentCategoria === 'maria_da_penha' || currentCategoria === 'chamados' ? {
          titulo: isEmbriaguez ? `Embriaguez - ${data.envolvidos.find(e => e.tipo === 'Condutor')?.nome_completo || 'Condutor'}` : (data.natureza?.[0] || 'Ocorrência registrada'),
        } : {}),
        
        ...(isEmbriaguez ? {
          etilometro_marca: data.etilometro_marca,
          etilometro_serie: data.etilometro_serie,
          etilometro_resultado: data.etilometro_resultado,
          etilometro_validade: data.etilometro_validade || null,
          etilometro_realizado: data.etilometro_realizado,
          etilometro_justificativa: data.etilometro_justificativa,
          sinais_aparencia: data.sinais_aparencia,
          sinais_atitude: data.sinais_atitude,
          teste_linha_reta: data.teste_linha_reta,
          teste_um_pe: data.teste_um_pe,
          teste_dedo_nariz: data.teste_dedo_nariz,
          admitiu_ingestao: data.admitiu_ingestao,
          ingestao_quantidade: data.ingestao_quantidade,
          ingestao_tempo: data.ingestao_tempo,
          conclusao_tecnica: data.conclusao_tecnica,
        } : {}),
        // Natureza alteração só existe nas tabelas padrão e de chamados
        ...(!isEmbriaguez && currentCategoria !== 'maria_da_penha' ? {
          natureza_alteracao: data.natureza_alteracao || null,
        } : {}),
      };
      
      // Inicializa payloadFinal com os dados básicos para garantir disponibilidade no catch
      payloadFinal = { ...payload };

      // Adicionar chamado_id se vier de um chamado
      if (currentCategoria === 'chamados' && initialData?.chamado_id) {
        payload.chamado_id = initialData.chamado_id;
      }


      let currentId = draftId;
      let uploadedPhotos: string[] = [];

      // 1. Upload Photos if any
      if (photos.length > 0) {
        console.log('Iniciando upload de fotos...', photos.length);
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        for (const photo of photos) {
          if (photo.file) {
            if (!allowedTypes.includes(photo.file.type)) {
              toast.error(`Arquivo ${photo.file.name} inválido. Use JPG, PNG ou WebP.`);
              continue;
            }
            if (photo.file.size > maxSize) {
              toast.error(`Arquivo ${photo.file.name} excede 10MB.`);
              continue;
            }
            const fileExt = photo.file.name.split('.').pop();
            const fileName = `${crypto.randomUUID()}.${fileExt}`;
            const filePath = `${profile.instituicao_id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from('ocorrencias')
              .upload(filePath, photo.file);

            if (uploadError) {
              console.error('Erro no upload:', uploadError);
              toast.error(`Falha ao subir foto: ${photo.file.name}`);
            } else {
              const { data: { publicUrl } } = supabase.storage
                .from('ocorrencias')
                .getPublicUrl(filePath);
              uploadedPhotos.push(publicUrl);
            }
          }
        }
      }

      payloadFinal = {
        ...payload,
        fotos: uploadedPhotos.length > 0 ? uploadedPhotos : (initialData?.fotos || [])
      };


      if (!navigator.onLine) {
        addToQueue({
          id: finalId,
          tableName: mainTableName,
          data: payloadFinal,
          action: 'insert',
          related: involvedTableName ? {
            tableName: involvedTableName,
            foreignKey: foreignKeyName,
            items: data.envolvidos
          } : undefined
        });
        
        if (isFinal) {
          setShowSuccessModal(true);
          onSuccess();
        } else {
          onSuccess();
          onClose();
        }
        return;
      }


        const { error: upsertError } = await supabase.from(mainTableName).upsert([{ ...payloadFinal, id: finalId }]);
        if (upsertError) throw upsertError;

        if (finalId && involvedTableName && foreignKeyName) {
           await supabase.from(involvedTableName).delete().eq(foreignKeyName, finalId);
           if (data.envolvidos.length > 0) {
              const { error: invError } = await supabase.from(involvedTableName).insert(
                data.envolvidos.map(e => ({ ...e, [foreignKeyName]: finalId }))
              );
              if (invError) console.error('ERRO NOS ENVOLVIDOS:', invError);
           }
        }

        if (isFinal) {
          setShowSuccessModal(true);
          onSuccess();
        } else {
          onSuccess();
          onClose();
        }
      } catch (error: any) {
        console.error('ERRO NO SUBMIT:', error);
        // Fallback offline
        addToQueue({
          id: finalId,
          tableName: mainTableName,
          data: payloadFinal,
          action: 'insert',
          related: involvedTableName ? {
            tableName: involvedTableName,
            foreignKey: foreignKeyName,
            items: data.envolvidos
          } : undefined
        });
        toast.warning('Erro de conexão. A ocorrência foi salva localmente e será sincronizada em breve.');
        if (isFinal) {
          setShowSuccessModal(true);
          onSuccess();
        } else {
          onSuccess();
          onClose();
        }
      } finally {
        setLoading(false);
        setIsSubmitting(false);
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
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-slate-900">Registrar Ocorrência</h2>
                {categoriaLabel && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-widest rounded-lg">
                    {categoriaLabel === 'maria-da-penha' ? 'Maria da Penha' : categoriaLabel === 'embriaguez' ? 'Embriaguez' : 'Padrão'}
                  </span>
                )}
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400">
                   <MapPinCheck className="w-4 h-4" />
                   <span className="text-xs font-black uppercase tracking-widest">Origem do Chamado</span>
                </div>
                <h3 className="text-lg font-black text-slate-900">Origem do Chamado</h3>
                <p className="text-sm text-slate-500 font-medium">Como esta ocorrência foi reportada?</p>
              </div>
              
              {!isNew && initialData && (
                <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                   <Zap className="w-5 h-5 text-indigo-600" />
                   <div>
                     <p className="text-xs font-black text-indigo-400 uppercase tracking-widest leading-none">Origem do Chamado Original</p>
                     <p className="text-sm font-bold text-indigo-900">{initialData.origem}</p>
                   </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Selecione a Origem</label>
                  <div className="space-y-2">
                    {filteredOrigemOptions.map(o => (

                      <button
                        key={o.label}
                        type="button"
                        onClick={() => {
                          setValue('origem', o.label);
                          setValue('sub_origem', '');
                          setOrigemSelecionada(true);
                        }}
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
                  <p className="text-xs font-black text-slate-500">{watchDescricao?.length || 0} CARACTERE(S)</p>
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
                      limitToEmbriaguez={isEmbriaguez}
                      limitToMariaDaPenha={isMariaDaPenha}
                      lockedItems={
                        isEmbriaguez ? ['Embriaguez em Via Pública'] : 
                        isMariaDaPenha ? ['Violência Doméstica'] : 
                        []
                      }
                    />
                  )}
                />
                {errors.natureza && <p className="text-xs font-bold text-red-500">{errors.natureza.message}</p>}
              </div>

              {/* Natureza da Alteração removida - Integrada no Passo 5 Técnico */}
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
                  onClick={() => append({ nome_completo: '', tipo: isEmbriaguez ? 'Testemunha' : 'Vítima' })}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                >
                  <UserPlus className="w-4 h-4" /> Novo Envolvido
                </button>
              </div>

              <div className="space-y-8">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          {isEmbriaguez && index === 0 ? 'Nome do Condutor' : 'Nome Completo'}
                        </label>
                        <input 
                          {...register(`envolvidos.${index}.nome_completo`)}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600/10 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Tipo de Vínculo</label>
                        <select 
                          {...register(`envolvidos.${index}.tipo`)}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-600/10 outline-none"
                        >
                          <option value="Vítima">Vítima</option>
                          <option value="Suspeito">Suspeito (Condutor/Infrator)</option>
                          <option value="Testemunha">Testemunha</option>
                          <option value="Informante">Informante</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">CPF / CNPJ</label>
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
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">RG</label>
                        <input 
                          {...register(`envolvidos.${index}.rg`)}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600/10 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Gênero</label>
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
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Telefone de Contato</label>
                        <input 
                          {...register(`envolvidos.${index}.telefone`)}
                          placeholder="(00) 00000-0000"
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600/10 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Descrição Física (Altura, Peso, Sinais)</label>
                        <input 
                          {...register(`envolvidos.${index}.descricao_fisica`)}
                          placeholder="Ex: Tatuagem braço direito..."
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600/10 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Declaração / Versão do Fato</label>
                          <textarea 
                            {...register(`envolvidos.${index}.declaracao`)}
                            rows={3}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none resize-none"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Observações Extras</label>
                          <textarea 
                            {...register(`envolvidos.${index}.observacoes`)}
                            rows={3}
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none resize-none"
                          />
                        </div>
                     </div>

                     {(!isEmbriaguez || index > 0) && (
                        <div className="flex justify-end pt-4 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteIndexTarget(index);
                              setShowDeleteModal(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" /> Remover Envolvido
                          </button>
                        </div>
                      )}
                   </div>
                 ))}

                {fields.length === 0 && (
                  <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                    <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhum envolvido registrado no evento.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 5 && isEmbriaguez && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                 <div className="flex items-center gap-2 text-slate-400">
                   <ClipboardList className="w-4 h-4" />
                   <span className="text-xs font-black uppercase tracking-widest">Módulo Técnico</span>
                </div>
                <h3 className="text-lg font-black text-slate-900">Módulo de Constatação de Embriaguez</h3>
                <p className="text-sm text-slate-500 font-medium">Dados do etilômetro e sinais clínicos observados.</p>
              </div>

              {/* 5.1 Etilômetro */}
              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Etilômetro (Bafômetro)</h4>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <span className="text-xs font-bold text-slate-500 uppercase">Teste realizado?</span>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" {...register('etilometro_realizado')} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </div>
                  </label>
                </div>

                {watch('etilometro_realizado') ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Marca <span className="text-red-400">*</span></label>
                      <input {...register('etilometro_marca')} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm" placeholder="Ex: Bafômetro Intoxilyzer" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nº de Série <span className="text-red-400">*</span></label>
                      <input {...register('etilometro_serie')} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Resultado (mg/L) <span className="text-red-400">*</span></label>
                      <input {...register('etilometro_resultado')} type="number" step="0.01" min="0" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-indigo-600" placeholder="0.00" />
                      {watch('etilometro_resultado') && Number(watch('etilometro_resultado')) >= 0.34 && (
                        <p className="text-xs font-black text-red-500 flex items-center gap-1">
                          ⚠️ ACIMA DO LIMITE LEGAL (0,34 mg/L) — Possível crime
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Validade Calibração <span className="text-red-400">*</span></label>
                      <input {...register('etilometro_validade')} type="date" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm" />
                    </div>
                  </div>
                ) : (
                  <div className="animate-in fade-in space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Motivo da Não Realização do Teste <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        'Aparelho indisponível',
                        'Condutor recusou o teste',
                        'Condutor em estado inconsciente',
                        'Outra razão (descrever abaixo)'
                      ].map(motivo => (
                        <button
                          key={motivo}
                          type="button"
                          onClick={() => setValue('etilometro_justificativa', motivo)}
                          className={`px-4 py-3 rounded-xl text-xs font-bold text-left transition-all border ${
                            watch('etilometro_justificativa') === motivo
                              ? 'bg-amber-600 border-amber-600 text-white shadow-md'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {motivo}
                        </button>
                      ))}
                    </div>
                    {watch('etilometro_justificativa') === 'Outra razão (descrever abaixo)' && (
                      <textarea
                        {...register('etilometro_justificativa')}
                        rows={2}
                        placeholder="Descreva o motivo..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none outline-none"
                      />
                    )}
                    {!watch('etilometro_justificativa') && (
                      <p className="text-xs font-bold text-amber-600">Selecione ou descreva o motivo para continuar.</p>
                    )}
                  </div>
                )}
              </div>

              {/* 5.2 Sinais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Aparência</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <Controller
                      name="sinais_aparencia"
                      control={control}
                      render={({ field }) => (
                        <>
                          {['Olhos vermelhos', 'Hálito etílico', 'Descoordenação motora', 'Fala pastosa', 'Vestimenta desarrumada', 'Face ruborizada', 'Sonolência aparente', 'Agitação psicomotora', 'Náusea ou vômito'].map(s => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => {
                                const val = field.value || [];
                                field.onChange(val.includes(s) ? val.filter(v => v !== s) : [...val, s]);
                              }}
                              className={`px-4 py-3 rounded-xl text-xs font-bold text-left transition-all border ${
                                (field.value || []).includes(s) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Atitude</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <Controller
                      name="sinais_atitude"
                      control={control}
                      render={({ field }) => (
                        <>
                          {['Agressividade / Hostilidade', 'Eufórico / Excitado', 'Sonolento / Letárgico', 'Confuso / Desorientado', 'Cooperativo / Calmo'].map(s => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => {
                                const val = field.value || [];
                                field.onChange(val.includes(s) ? val.filter(v => v !== s) : [...val, s]);
                              }}
                              className={`px-4 py-3 rounded-xl text-xs font-bold text-left transition-all border ${
                                (field.value || []).includes(s) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* 5.3 Testes de Equilíbrio */}
              <div className="p-8 bg-indigo-50/30 rounded-[2.5rem] border border-indigo-100 space-y-6">
                 <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Testes de Equilíbrio e Coordenação</h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { name: 'Andar em linha reta', key: 'teste_linha_reta' },
                      { name: 'Apoiar-se em um pé', key: 'teste_um_pe' },
                      { name: 'Tocar o dedo no nariz', key: 'teste_dedo_nariz' }
                    ].map(t => (
                      <div key={t.key} className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase">{t.name}</label>
                        <select {...register(t.key as any)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs">
                           <option value="">Não realizado</option>
                           <option value="Aprovado">Aprovado</option>
                           <option value="Reprovado">Reprovado</option>
                        </select>
                      </div>
                    ))}
                 </div>
              </div>

              {/* 5.4 Relato de Ingestão */}
              <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm space-y-6">
                 <div className="flex items-center gap-3">
                    <Beer className="w-5 h-5 text-amber-500" />
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Relato de Ingestão de Álcool</h4>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Admitiu ingestão?</label>
                      <select {...register('admitiu_ingestao')} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold">
                         <option value="">Selecione...</option>
                         <option value="Sim">Sim</option>
                         <option value="Não">Não</option>
                         <option value="Não respondeu">Não respondeu</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Quantidade informada</label>
                      <input {...register('ingestao_quantidade')} placeholder="Ex: 3 latas de cerveja" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Há quanto tempo?</label>
                      <input {...register('ingestao_tempo')} placeholder="Ex: 1 hora" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" />
                    </div>
                 </div>
              </div>

              {/* 5.5 Natureza da Alteração */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Natureza da Alteração Observada</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { label: 'Álcool', val: 'Álcool' },
                    { label: 'Drogas Ilícitas', val: 'Drogas Ilícitas' },
                    { label: 'Crise Psiquiátrica', val: 'Crise Psiquiátrica (sem álcool ou drogas)' },
                    { label: 'Abstinência', val: 'Abstinência' },
                    { label: 'Causa Médica (Diabetes, AVC, etc)', val: 'Causa Médica (diabetes, AVC, epilepsia)' },
                  ].map(n => (
                    <button
                      key={n.val}
                      type="button"
                      onClick={() => setValue('natureza_alteracao', n.val)}
                      className={`px-6 py-4 rounded-2xl text-xs font-black text-left transition-all border ${
                        watch('natureza_alteracao') === n.val ? 'bg-amber-600 border-amber-600 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {n.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5.6 Conclusão */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Conclusão Técnica do Agente</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { label: 'Embriaguez confirmada por etilômetro', val: 'confirmada_etilometro' },
                    { label: 'Embriaguez confirmada por sinais clínicos', val: 'confirmada_sinais' },
                    { label: 'Embriaguez não confirmada', val: 'nao_confirmada' },
                    { label: 'Recusa ao teste', val: 'recusa' },
                  ].map(c => (
                    <button
                      key={c.val}
                      type="button"
                      onClick={() => setValue('conclusao_tecnica', c.val)}
                      className={`px-6 py-4 rounded-2xl text-xs font-black text-left transition-all border ${
                        watch('conclusao_tecnica') === c.val ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                {errors.conclusao_tecnica && <p className="text-xs font-bold text-red-500">Selecione uma conclusão técnica.</p>}
              </div>
            </div>
          )}

          {((step === 5 && !isEmbriaguez) || (step === 6 && isEmbriaguez)) && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900">Anexos e Fotos</h3>
                <p className="text-sm text-slate-500 font-medium">Insira até 10 fotos comprovando os fatos.</p>
              </div>

              {isEmbriaguez && (
                <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl">
                  <p className="text-xs font-black text-amber-700 uppercase tracking-widest mb-3">Recomendações de Foto para Embriaguez</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { icon: '🧑', text: 'Foto do condutor (rosto visível)' },
                      { icon: '📱', text: 'Etilômetro exibindo o resultado' },
                      { icon: '📍', text: 'Local da abordagem / via' },
                    ].map(rec => (
                      <div key={rec.text} className="flex items-center gap-2 text-xs font-bold text-amber-800">
                        <span className="text-lg">{rec.icon}</span>
                        <span>{rec.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={prevStep}
            className="px-8 py-3 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-200 rounded-2xl transition-all flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar
          </button>

          <div className="flex items-center gap-4">
            {step < totalSteps ? (
              <button 
                onClick={nextStep}
                disabled={!canProceed}
                className={`px-10 py-3 font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center gap-2 active:scale-95 ${
                  canProceed 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/20' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Próximo Passo <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button 
                  onClick={handleSubmit(d => onSubmit(d, false))}
                  disabled={loading || initialData?.status === 'finalizada'}
                  className="px-8 py-3 bg-white border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Salvar Rascunho
                </button>
                <button 
                  onClick={handleSubmit(d => onSubmit(d, true))}
                  disabled={loading || initialData?.status === 'finalizada'}
                  className="px-12 py-3 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 flex items-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  Registrar Ocorrência
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Modal de Sucesso */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Ocorrência Registrada!</h3>
              <p className="text-sm text-slate-500 font-medium mb-8">
                Os dados foram enviados com sucesso para a central.
              </p>
              
              <div className="w-full space-y-3">
                <button
                  onClick={() => {
                    reset();
                    setStep(1);
                    setDraftId(null);
                    setShowSuccessModal(false);
                    setOrigemSelecionada(false);
                    setPhotos([]);
                  }}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                  Nova Ocorrência
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    onClose();
                    // Navega para a página de gerenciamento
                    window.location.href = '/ocorrencias';
                  }}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-95"
                >
                  Ir para Gerenciar
                </button>
              </div>
            </div>
          </div>
        </div>
       )}

       {/* Modal de Confirmação de Exclusão */}
       {showDeleteModal && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-300">
             <div className="flex flex-col items-center text-center">
               <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                 <Trash2 className="w-10 h-10" />
               </div>
               <h3 className="text-xl font-black text-slate-900 mb-2">Remover Envolvido</h3>
               <p className="text-sm text-slate-500 font-medium mb-8">
                 Tem certeza que deseja remover este envolvido? Esta ação não pode ser desfeita.
               </p>
               
               <div className="w-full space-y-3">
                 <button
                   onClick={() => {
                     if (deleteIndexTarget !== null) {
                       remove(deleteIndexTarget);
                     }
                     setShowDeleteModal(false);
                     setDeleteIndexTarget(null);
                   }}
                   className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95 flex items-center justify-center gap-2"
                 >
                   <Trash2 className="w-4 h-4" /> Confirmar Exclusão
                 </button>
                 <button
                   onClick={() => {
                     setShowDeleteModal(false);
                     setDeleteIndexTarget(null);
                   }}
                   className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-95"
                 >
                   Cancelar
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}
     </div>

   );
 }
