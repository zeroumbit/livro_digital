import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  PhoneCall, 
  X, 
  CheckCircle2, 
  Loader2, 
  Users, 
  Navigation,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { NaturezaSelector } from '../NaturezaSelector';
import { LocationInput } from '../LocationInput';

const parceirosDisponiveis = [
  'Guarda Municipal (trânsito)', 'Polícia Militar', 'SAMU', 'Bombeiros', 
  'GSU', 'Polícia Civil', 'CRAS', 'PRF', 'Defesa Civil', 'Hospital', 'UPA'
];

const naturezasCriticas = ['Incêndio', 'Ameaça', 'Acidente com Vítima', 'Maria da Penha', 'Desabamento', 'Pessoa em Perigo'];

const chamadoSchema = z.object({
  parceiros: z.array(z.string()).min(1, 'Selecione pelo menos um parceiro'),
  natureza: z.array(z.string()).min(1, 'Selecione a natureza'),
  qtde_envolvidos: z.string().min(1, 'Selecione a quantidade de envolvidos'),
  qtde_especifica: z.string().optional(),
  rua: z.string().min(1, 'Rua é obrigatória'),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  numero: z.string().optional(),
  cep: z.string().optional(),
  coordenadas: z.string().min(1, 'GPS obrigatório para chamados rápidos'),
  ponto_referencia: z.string().optional(),
  detalhes: z.string().optional(),
});

type ChamadoFormData = z.infer<typeof chamadoSchema>;

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export function ChamadoQuickForm({ onClose, onSuccess }: Props) {
  const profile = useAuthStore(state => state.profile);
  const [loading, setLoading] = useState(false);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ChamadoFormData>({
    resolver: zodResolver(chamadoSchema),
    defaultValues: {
      parceiros: [],
      natureza: [],
      qtde_envolvidos: '',
    }
  });

  const watchNatureza = watch('natureza');
  const watchEnvolvidos = watch('qtde_envolvidos');

  // Auto-priority logic
  const isCritico = watchNatureza?.some(n => naturezasCriticas.includes(n));

  const onSubmit = async (data: ChamadoFormData) => {
    setLoading(true);
    try {
      if (!profile?.instituicao_id || !profile?.id) return;

      const { data: novoChamado, error: chError } = await supabase.from('chamados').insert([{
        instituicao_id: profile.instituicao_id,
        criador_id: profile.id,
        status: 'aberto',
        prioridade: isCritico ? 'critica' : 'media',
        natureza: data.natureza,
        qtde_envolvidos: data.qtde_envolvidos === 'Outro' ? data.qtde_especifica : data.qtde_envolvidos,
        rua: data.rua,
        bairro: data.bairro,
        coordenadas: data.coordenadas,
        detalhes: data.detalhes || '',
      }]).select().single();

      if (chError) throw chError;

      // Link Partners
      if (novoChamado && data.parceiros.length > 0) {
        await supabase.from('chamados_parceiros').insert(
          data.parceiros.map(p => ({
            chamado_id: novoChamado.id,
            parceiro_tipo: p,
            status_resposta: 'pendente'
          }))
        );
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Erro ao registrar chamado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Acionamento Rápido (Chamado)</h2>
            <p className="text-sm text-slate-500 font-medium">Preencha os dados essenciais para o despacho.</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-10">
        <form id="chamadoQuickForm" onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-12">
          
          {/* Parceiros */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
               <Users className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Parceiros a Acionar</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Controller
                name="parceiros"
                control={control}
                render={({ field }) => (
                  <>
                    {parceirosDisponiveis.map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          const val = field.value || [];
                          field.onChange(val.includes(p) ? val.filter(v => v !== p) : [...val, p]);
                        }}
                        className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center border transition-all ${
                          field.value?.includes(p)
                            ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-red-600/50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </>
                )}
              />
            </div>
            {errors.parceiros && <p className="text-xs font-bold text-red-500">{errors.parceiros.message}</p>}
          </section>

          {/* Natureza */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
               <AlertTriangle className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Natureza da Ocorrência</span>
            </div>
            <Controller
              name="natureza"
              control={control}
              render={({ field }) => (
                <NaturezaSelector selected={field.value} onChange={field.onChange} />
              )}
            />
            {isCritico && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in slide-in-from-left-4">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-xs font-black text-red-900 uppercase tracking-widest">Prioridade Automática: CRÍTICA</span>
              </div>
            )}
          </section>

          {/* Envolvidos */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
               <Users className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Quantidade de Envolvidos</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {['1-2 pessoas', '3-5 pessoas', '6-10 pessoas', '10+ pessoas', 'Não informado', 'Outro'].map(opt => (
                <label key={opt} className={`flex items-center gap-3 px-6 py-4 rounded-2xl border cursor-pointer transition-all ${
                  watchEnvolvidos === opt ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}>
                  <input 
                    type="radio" 
                    value={opt} 
                    {...register('qtde_envolvidos')} 
                    className="hidden" 
                  />
                  <span className="text-xs font-bold">{opt}</span>
                  {opt === 'Outro' && watchEnvolvidos === 'Outro' && (
                    <input 
                      type="text" 
                      placeholder="Qtd" 
                      {...register('qtde_especifica')}
                      className="w-16 px-2 py-1 bg-white/20 border border-white/40 rounded-lg text-white text-xs placeholder:text-white/50 focus:outline-none"
                    />
                  )}
                </label>
              ))}
            </div>
          </section>

          {/* Localização */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
               <Navigation className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Localização do Chamado</span>
            </div>
            <LocationInput 
              onLocationChange={(loc) => {
                setValue('rua', loc.rua);
                setValue('bairro', loc.bairro);
                setValue('cep', loc.cep);
                setValue('numero', loc.numero || '');
                setValue('coordenadas', loc.coordenadas || '');
              }}
            />
            {errors.coordenadas && <p className="text-xs font-bold text-red-500">O GPS é obrigatório para acionamento rápido.</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ponto de Referência</label>
                 <input 
                   {...register('ponto_referencia')}
                   placeholder="Próximo a..."
                   className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Detalhes Adicionais</label>
                 <input 
                   {...register('detalhes')}
                   placeholder="Observações complementares..."
                   className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                 />
               </div>
            </div>
          </section>

        </form>
      </div>

      {/* Footer */}
      <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <button onClick={onClose} className="px-6 py-3 text-slate-600 font-bold text-sm hover:bg-slate-200 rounded-xl transition-all">
          Cancelar
        </button>
        <button 
          form="chamadoQuickForm"
          type="submit"
          disabled={loading}
          className="px-12 py-4 bg-red-600 text-white font-black text-sm uppercase tracking-wider rounded-xl hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Despachar Chamado'}
        </button>
      </div>
    </div>
  );
}
