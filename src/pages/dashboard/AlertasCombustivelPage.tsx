import React from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  Truck, 
  Fuel, 
  ChevronRight,
  Filter,
  CheckCircle2,
  TrendingUp,
  History
} from 'lucide-react';
import { useAbastecimentos } from '@/hooks/useLogistics';

export function AlertasCombustivelPage() {
  const { data: abastecimentos } = useAbastecimentos();
  const alertas = abastecimentos?.filter(a => a.alerta_gerado && a.alerta_gerado !== 'NORMAL') || [];

  const getAlertaConfig = (tipo: string) => {
    switch (tipo) {
      case 'CRITICO':
        return { color: 'rose', label: 'Crítico', icon: AlertCircle, bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' };
      case 'ATENCAO':
        return { color: 'amber', label: 'Atenção', icon: AlertTriangle, bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' };
      case 'ELOGIO':
        return { color: 'emerald', label: 'Elogio', icon: TrendingUp, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' };
      default:
        return { color: 'slate', label: 'Informativo', icon: Clock, bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' };
    }
  };

  return (
    <div className="space-y-6 lg:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Alertas de Abastecimento</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">
            Notificações automáticas baseadas em padrões de consumo.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
           <button className="h-10 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl flex items-center text-xs font-bold shadow-sm hover:bg-slate-50 transition-all">
              <Filter className="w-3.5 h-3.5 mr-2" /> Filtrar por Tipo
           </button>
           <button className="h-10 px-4 bg-slate-900 text-white rounded-xl flex items-center text-xs font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all">
              <History className="w-3.5 h-3.5 mr-2" /> Histórico Completo
           </button>
        </div>
      </div>

      {alertas.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-20 text-center">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Tudo em Ordem!</h3>
          <p className="text-slate-500 font-medium max-w-sm mx-auto">
            Não foram detectadas anomalias ou alertas críticos nos abastecimentos recentes da frota.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {alertas.map((alerta) => {
            const config = getAlertaConfig(alerta.alerta_gerado || 'NORMAL');
            return (
              <div key={alerta.id} className={`bg-white rounded-3xl border ${config.border} p-6 flex flex-col md:flex-row md:items-center gap-6 hover:shadow-md transition-all group`}>
                <div className={`w-14 h-14 rounded-2xl ${config.bg} ${config.text} flex items-center justify-center shrink-0`}>
                  <config.icon className="w-7 h-7" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${config.bg} ${config.text}`}>
                      {config.label}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> {new Date(alerta.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {alerta.alerta_gerado === 'CRITICO' ? 'Consumo excessivo detectado' : 
                     alerta.alerta_gerado === 'ELOGIO' ? 'Excelente eficiência operacional' : 'Variação de consumo em atenção'}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mt-0.5">
                    A viatura <span className="font-bold text-slate-700">{alerta.veiculo?.placa}</span> apresentou média de <span className="font-bold text-indigo-600">{alerta.consumo_real?.toFixed(1)} km/L</span> no último abastecimento.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <p className="text-xs font-black text-slate-900">{alerta.litros}L</p>
                    <p className="text-[10px] font-bold text-slate-400">ABASTECIDOS</p>
                  </div>
                  <button className="h-12 w-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all group">
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
