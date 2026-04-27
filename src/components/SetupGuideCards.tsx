import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  MapPin, 
  Handshake, 
  UserCircle, 
  Truck, 
  Calendar, 
  X, 
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useSetupGuideStore } from '@/store/useSetupGuideStore';
import { useAuthStore } from '@/store/useAuthStore';

const STEP_ICONS: Record<string, React.ComponentType<any>> = {
  efetivo: Users,
  territorios: MapPin,
  parceiros: Handshake,
  equipes: UserCircle,
  frota: Truck,
  escalas: Calendar,
};

const STEP_COLORS: Record<string, { bg: string; border: string; icon: string; badge: string }> = {
  efetivo:    { bg: 'bg-blue-50',    border: 'border-blue-200',    icon: 'text-blue-600',    badge: 'bg-blue-500' },
  territorios:{ bg: 'bg-green-50',  border: 'border-green-200',   icon: 'text-green-600',   badge: 'bg-green-500' },
  parceiros:  { bg: 'bg-purple-50',  border: 'border-purple-200',  icon: 'text-purple-600',  badge: 'bg-purple-500' },
  equipes:    { bg: 'bg-orange-50',  border: 'border-orange-200',  icon: 'text-orange-600',  badge: 'bg-orange-500' },
  frota:      { bg: 'bg-amber-50',   border: 'border-amber-200',   icon: 'text-amber-600',   badge: 'bg-amber-500' },
  escalas:    { bg: 'bg-indigo-50', border: 'border-indigo-200',  icon: 'text-indigo-600',  badge: 'bg-indigo-500' },
};

export function SetupGuideBanner() {
  const { profile } = useAuthStore();
  const { isDismissed, setDismissed, steps, refreshSteps, isAllCompleted } = useSetupGuideStore();
  const isGestor = profile?.perfil_acesso === 'gestor';
  const navigate = useNavigate();

  useEffect(() => {
    if (isGestor) {
      refreshSteps();
    }
  }, [profile?.instituicao_id, isGestor]);

  if (!isGestor) return null;
  if (isDismissed && !isAllCompleted()) return null;
  if (isAllCompleted()) return null;

  const pendingSteps = steps.filter((s) => !s.completed);
  const completedCount = steps.filter((s) => s.completed).length;
  const totalCount = steps.length;

  return (
    <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-600 rounded-[2rem] p-8 shadow-xl shadow-indigo-600/20 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute left-0 bottom-0 w-48 h-48 bg-white rounded-full blur-3xl -ml-16 -mb-16" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">Guia de Configuração</h3>
              <p className="text-white/70 text-xs font-medium">
                {completedCount}/{totalCount} etapas completas — Sua instituição está a poucos passos de funcionar
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-all"
            title="Dispensar guia"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {steps.map((step) => {
            const Icon = STEP_ICONS[step.id] || ShieldCheck;
            const colors = STEP_COLORS[step.id] || STEP_COLORS.efetivo;
            return (
              <Link
                key={step.id}
                to={step.path}
                onClick={() => {
                  if (step.completed) return;
                  navigate(step.path);
                }}
                className={`relative group flex flex-col items-center text-center p-4 rounded-2xl border transition-all duration-300 ${
                  step.completed
                    ? `${colors.bg} ${colors.border} cursor-default opacity-70`
                    : 'bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 hover:border-white/40 cursor-pointer hover:-translate-y-1 hover:shadow-lg'
                }`}
              >
                {step.completed && (
                  <div className={`absolute top-2 right-2 w-5 h-5 ${colors.badge} rounded-full flex items-center justify-center shadow`}>
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform ${
                  step.completed ? 'bg-white/30' : 'bg-white/10 group-hover:bg-white/20'
                }`}>
                  <Icon className={`w-5 h-5 ${step.completed ? 'text-white/60' : 'text-white'}`} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wide mb-1 ${step.completed ? 'text-white/50' : 'text-white'}`}>
                  {step.label}
                </span>
                <span className={`text-[9px] leading-tight ${step.completed ? 'text-white/40' : 'text-white/60'}`}>
                  {step.completed ? 'Concluído' : step.description}
                </span>
                {!step.completed && (
                  <ArrowRight className="w-3 h-3 text-white/40 absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </Link>
            );
          })}
        </div>

        {pendingSteps.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-white/60 text-xs font-medium">
              Faltam <span className="text-white font-black">{pendingSteps.length}</span> etapa{pendingSteps.length > 1 ? 's' : ''} para completar
            </p>
            <button
              onClick={() => navigate('/usuarios')}
              className="px-4 py-2 bg-white text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/90 transition-all flex items-center shadow-lg"
            >
              Começar Configuração <ArrowRight className="w-3 h-3 ml-2" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}