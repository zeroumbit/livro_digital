import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Truck, 
  Users, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle2,
  Plus,
  Trash2,
  LayoutGrid
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ============================================================================
// COMPONENTES DE APOIO (UI Premium)
// ============================================================================

const StepIndicator = ({ step, currentStep, title, icon: Icon }: any) => {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep;

  return (
    <div className={`flex flex-col items-center flex-1 relative`}>
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-500 z-10 border-2 ${
        isActive 
          ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-110' 
          : isCompleted 
            ? 'bg-emerald-500 border-emerald-500 text-white' 
            : 'bg-white border-slate-200 text-slate-400'
      }`}>
        {isCompleted ? <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> : <Icon className="w-5 h-5 sm:w-6 sm:h-6" />}
      </div>
      <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mt-3 text-center transition-colors px-1 ${
        isActive ? 'text-indigo-600' : isCompleted ? 'text-emerald-500' : 'text-slate-400'
      } hidden sm:block`}>
        {title}
      </span>
      {/* Linha conectora */}
      {step < 5 && (
        <div className="absolute top-5 sm:top-6 left-1/2 w-full h-[2px] bg-slate-100 -z-0">
          <div className={`h-full bg-emerald-500 transition-all duration-700 ${isCompleted ? 'w-full' : 'w-0'}`}></div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL: SETUP WIZARD
// ============================================================================

export function SetupWizard() {
  const [step, setStep] = useState(1);
  const { profile, institution, setInstitution } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados dos formulários (Simplificados para o esqueleto)
  const [bairros, setBairros] = useState<string[]>([]);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  
  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      if (bairros.length > 0) {
        const bairrosData = bairros.map(nome => ({
          instituicao_id: institution?.id,
          nome,
          ativo: true
        }));
        const { error: errorBairros } = await supabase.from('bairros').insert(bairrosData);
        if (errorBairros) throw errorBairros;
      }

      const { data, error } = await supabase
        .from('instituicoes')
        .update({ 
            status_assinatura: 'trial',
            configuracoes_locais: {
                ...institution?.configuracoes_locais,
                setup_completed: true,
                setup_at: new Date().toISOString()
            }
        })
        .eq('id', institution?.id)
        .select()
        .single();

      if (error) throw error;
      setInstitution(data);
      toast.success('Configuração concluída com sucesso!');
      window.location.href = '/dashboard';
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-0 sm:p-6 md:p-12 font-sans">
      
      <div className="w-full max-w-4xl">
        {/* HEADER DO WIZARD */}
        <div className="text-center mb-8 sm:mb-12 mt-8 sm:mt-0 px-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-3xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Configuração</h1>
          <p className="text-slate-500 text-sm sm:text-lg">Vamos preparar o ambiente para a sua equipe.</p>
        </div>

        {/* INDICADOR DE PROGRESSO */}
        <div className="flex justify-between mb-10 sm:mb-16 px-4 sm:px-10">
          <StepIndicator step={1} currentStep={step} title="Territórios" icon={MapPin} />
          <StepIndicator step={2} currentStep={step} title="Frota" icon={Truck} />
          <StepIndicator step={3} currentStep={step} title="Equipe" icon={Users} />
          <StepIndicator step={4} currentStep={step} title="Unidades" icon={LayoutGrid} />
          <StepIndicator step={5} currentStep={step} title="Escalas" icon={Clock} />
        </div>

        {/* CONTAINER DE CONTEÚDO */}
        <div className="bg-white sm:rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-6 sm:p-12 min-h-[400px] sm:min-h-[450px] flex flex-col">
          
          <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {step === 1 && (
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Zonas e Territórios</h2>
                  <p className="text-slate-500 text-sm sm:text-base">Cadastre os bairros ou setores onde a sua instituição atua.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative group">
                    <input 
                      type="text" 
                      placeholder="Nome do Bairro (ex: Centro)"
                      className="w-full h-12 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500/20 px-4 text-sm font-medium transition-all"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = (e.target as HTMLInputElement).value;
                          if (val) {
                            setBairros([...bairros, val]);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Plus className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4">
                  {bairros.map((b, i) => (
                    <div key={i} className="flex items-center bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-indigo-100 animate-in zoom-in duration-200">
                      {b}
                      <button onClick={() => setBairros(bairros.filter((_, idx) => idx !== i))} className="ml-2 text-indigo-400 hover:text-indigo-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {bairros.length === 0 && (
                    <p className="text-sm text-slate-400 italic">Pressione ENTER para adicionar.</p>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Recursos e Veículos</h2>
                  <p className="text-slate-500 text-sm sm:text-base">Cadastre a frota ativa para o patrulhamento.</p>
                </div>
                <div className="p-8 sm:p-12 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium mb-4 text-sm sm:text-base">Ainda não cadastrou nenhum veículo.</p>
                  <button className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">
                    Adicionar Primeira Viatura
                  </button>
                </div>
              </div>
            )}

            {step > 2 && step <= 5 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <LayoutGrid className="w-12 h-12 sm:w-16 sm:h-16 text-slate-100 mb-6" />
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Próximos Passos em Breve</h3>
                <p className="text-slate-500 text-xs sm:text-sm max-w-sm px-6">
                  As etapas de Equipe, Unidades e Escalas estão sendo preparadas para integração.
                </p>
              </div>
            )}
          </div>

          {/* BOTÕES DE NAVEGAÇÃO */}
          <div className="mt-8 sm:mt-12 flex items-center justify-between pt-6 sm:pt-8 border-t border-slate-100">
            <button 
              onClick={prevStep}
              className={`flex items-center text-xs sm:text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors ${step === 1 ? 'invisible' : ''}`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </button>

            <div className="flex items-center space-x-2 sm:space-x-4">
                <span className="hidden xs:block text-[9px] sm:text-[11px] font-black text-slate-300 uppercase tracking-widest text-nowrap">
                    Ação Obrigatória
                </span>
                {step < 5 ? (
                    <button 
                        onClick={nextStep}
                        className="h-10 sm:h-12 px-6 sm:px-8 bg-indigo-600 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center"
                    >
                        Próximo
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                    </button>
                ) : (
                    <button 
                        onClick={handleFinish}
                        disabled={isSubmitting}
                        className="h-10 sm:h-12 px-8 sm:px-10 bg-emerald-600 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center"
                    >
                        {isSubmitting ? '...' : 'Finalizar'}
                    </button>
                )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
