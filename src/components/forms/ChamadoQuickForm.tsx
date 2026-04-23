import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  PhoneCall, 
  X, 
  Loader2, 
  Users, 
  Navigation,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { LocationInput } from '../LocationInput';
import { NaturezaSelector } from '../NaturezaSelector';
import { toast } from 'sonner';


const parceirosDisponiveis = [
  'Guarda Municipal (trânsito)', 'Polícia Militar', 'SAMU', 'Bombeiros', 
  'GSU', 'Polícia Civil', 'CRAS', 'PRF', 'Defesa Civil', 'Hospital', 'UPA'
];

const origemOptions = [
  { label: 'DENÚNCIA ANÔNIMA', sub: ['Telefone', 'Redes Sociais', 'Pessoalmente'] },
  { label: 'REDES SOCIAIS', sub: [] },
  { label: 'CÂMERAS DE MONITORAMENTO', sub: [] },
];

const chamadoSchema = z.object({
  origem: z.string().min(1, 'Origem é obrigatória'),
  sub_origem: z.string().optional(),
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
      origem: '',
      sub_origem: '',
      natureza: [],
      qtde_envolvidos: '',
    }
  });

  const watchOrigem = watch('origem');
  const watchSubOrigem = watch('sub_origem');
  const watchNatureza = watch('natureza');
  const watchEnvolvidos = watch('qtde_envolvidos');
  const watchRua = watch('rua');
  const watchBairro = watch('bairro');
  const watchCoordenadas = watch('coordenadas');

  const selectedOrigem = origemOptions.find(o => o.label === watchOrigem);

  const isFormValid = watchOrigem && 
    watchNatureza?.length > 0 && 
    watchEnvolvidos && 
    watchRua && 
    watchBairro && 
    watchCoordenadas;

  const onSubmit = async (data: ChamadoFormData) => {
    setLoading(true);
    try {
      if (!profile?.instituicao_id || !profile?.id) return;

      const { data: novoChamado, error: chError } = await supabase.from('chamados').insert([{
        instituicao_id: profile.instituicao_id,
        criador_id: profile.id,
        status: 'aberto',
        prioridade: 'media',
        natureza: data.natureza,
        qtde_envolvidos: data.qtde_envolvidos === 'Outro' ? data.qtde_especifica : data.qtde_envolvidos,
        rua: data.rua,
        bairro: data.bairro,
        coordenadas: data.coordenadas,
        detalhes: data.detalhes || '',
        origem: data.origem,
        tipo_origem: data.sub_origem || '',
      }]).select().single();

      if (chError) throw chError;

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
      toast.error('Erro ao registrar chamado. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
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
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-10">
        <form id="chamadoQuickForm" onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-12">
          
          {/* Origem */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
               <AlertTriangle className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Origem do Chamado</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {origemOptions.map(o => (
                <button
                  key={o.label}
                  type="button"
                  onClick={() => {
                    setValue('origem', o.label);
                    setValue('sub_origem', '');
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    watchOrigem === o.label 
                      ? 'bg-red-50 border-red-600 text-red-700 shadow-lg shadow-red-600/20' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-sm font-black">{o.label}</p>
                </button>
              ))}
            </div>

            {selectedOrigem && selectedOrigem.sub.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in slide-in-from-left-4">
                {selectedOrigem.sub.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setValue('sub_origem', s)}
                    className={`p-3 rounded-xl text-sm transition-all ${
                      watchSubOrigem === s 
                        ? 'bg-red-100 border border-red-600 text-red-700 font-bold' 
                        : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {errors.origem && <p className="text-xs font-bold text-red-500">{errors.origem.message}</p>}
          </section>

          {/* Detalhes Adicionais */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
               <AlertTriangle className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Detalhes Adicionais</span>
            </div>
            <textarea 
              {...register('detalhes')}
              placeholder="Observações complementares..."
              rows={5}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none resize-none"
            />
          </section>

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
                        className={`p-3 rounded-xl text-xs font-bold text-center transition-all border ${
                          (field.value || []).includes(p)
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20' 
                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
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
                <NaturezaSelector selected={field.value || []} onChange={field.onChange} />
              )}
            />
            {errors.natureza && <p className="text-xs font-bold text-red-500">{errors.natureza.message}</p>}
          </section>

          {/* Envolvidos */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
               <Users className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Quantidade de Envolvidos</span>
            </div>
            <Controller
              name="qtde_envolvidos"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {['1', '2', '3', '4', '5+', 'Outro'].map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => field.onChange(q)}
                      className={`px-5 py-3 rounded-xl text-sm font-bold transition-all border ${
                        field.value === q
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20' 
                          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            />
            {watchEnvolvidos === 'Outro' && (
              <input 
                {...register('qtde_especifica')}
                placeholder="Especifique a quantidade..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              />
            )}
            {errors.qtde_envolvidos && <p className="text-xs font-bold text-red-500">{errors.qtde_envolvidos.message}</p>}
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
             
             <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ponto de Referência</label>
               <input 
                 {...register('ponto_referencia')}
                 placeholder="Próximo a..."
                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
               />
             </div>
</section>

          {/* Detalhes Adicionais */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
               <AlertTriangle className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Detalhes Adicionais</span>
            </div>
            <textarea 
              {...register('detalhes')}
              placeholder="Observações complementares..."
              rows={5}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none resize-none"
            />
          </section>

        </form>
      </div>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={onClose} 
            className="px-8 py-3 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-200 rounded-2xl transition-all flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Cancelar
          </button>

          <button 
            form="chamadoQuickForm"
            type="submit"
            disabled={loading || !isFormValid}
            className={`px-12 py-4 font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              isFormValid && !loading
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-600/20' 
                : 'bg-slate-200 text-slate-400'
            }`}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PhoneCall className="w-5 h-5" />}
            Despachar Chamado
          </button>
        </div>
      </div>
    </div>
  );
}