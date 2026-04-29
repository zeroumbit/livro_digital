import React from 'react';
import { 
  Award, 
  Trophy, 
  Star, 
  TrendingUp, 
  Truck, 
  ChevronRight,
  ShieldCheck,
  Medal,
  ThumbsUp
} from 'lucide-react';
import { useAbastecimentos } from '@/hooks/useLogistics';

export function VitoriasPage() {
  const { data: abastecimentos } = useAbastecimentos();
  const vitorias = abastecimentos?.filter(a => a.alerta_gerado === 'ELOGIO') || [];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-center md:text-left">
        <div>
          <div className="inline-flex items-center px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-amber-100">
            <Trophy className="w-3 h-3 mr-2" /> Reconhecimento Operacional
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">Vitórias & Eficiência</h1>
          <p className="text-slate-500 font-medium text-xl mt-2 max-w-2xl">
            Celebrando as equipes e veículos que atingiram a excelência em economia e performance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* DESTAQUE DO MÊS (Simulado) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[3rem] p-10 text-white relative overflow-hidden group">
            <div className="absolute right-[-40px] top-[-40px] opacity-10 group-hover:scale-110 transition-transform duration-1000">
                <Trophy className="w-80 h-80" />
            </div>
            
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-12">
                    <div>
                        <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em] mb-2">Equipe Destaque do Mês</p>
                        <h2 className="text-4xl font-black tracking-tight">Viatura {vitorias[0]?.veiculo?.placa || '105'}</h2>
                    </div>
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
                        <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-auto">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                        <p className="text-white/40 text-[10px] font-black uppercase mb-1">Média</p>
                        <p className="text-2xl font-black">{vitorias[0]?.consumo_real?.toFixed(1) || '10.5'} <span className="text-xs">km/L</span></p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                        <p className="text-white/40 text-[10px] font-black uppercase mb-1">Eficiência</p>
                        <p className="text-2xl font-black text-emerald-400">{vitorias[0]?.eficiencia?.toFixed(0) || '115'}%</p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5 hidden md:block">
                        <p className="text-white/40 text-[10px] font-black uppercase mb-1">Vantagem</p>
                        <p className="text-2xl font-black text-blue-400">+1.2 <span className="text-xs">L/km</span></p>
                    </div>
                </div>
            </div>
        </div>

        {/* INDICADORES LATERAIS */}
        <div className="space-y-6">
            <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <h4 className="font-black text-lg">Economia Global</h4>
                </div>
                <p className="text-4xl font-black mb-2">R$ 1.450 <span className="text-sm opacity-50">/mês</span></p>
                <p className="text-xs text-white/70 font-medium">Economia gerada através da eficiência das equipes.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8">
                <h4 className="font-black text-slate-900 mb-6 flex items-center gap-3">
                    <Medal className="w-5 h-5 text-indigo-600" /> Próxima Meta
                </h4>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Redução de Emissão</p>
                    <p className="text-sm font-bold text-slate-700">-15% CO2 no próximo trimestre</p>
                </div>
            </div>
        </div>

      </div>

      {/* FEED DE VITÓRIAS */}
      <div className="space-y-6">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ThumbsUp className="w-6 h-6 text-indigo-600" /> Mural de Reconhecimento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vitorias.length > 0 ? (
              vitorias.map((v) => (
                <div key={v.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900">Viatura {v.veiculo?.placa}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(v.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>
                    <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-center">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Eficiência Alcançada</p>
                        <p className="text-3xl font-black text-emerald-700">{v.eficiencia?.toFixed(0)}%</p>
                    </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200 text-center text-slate-400">
                  <Award className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-black tracking-tight">Novas conquistas em breve!</p>
                  <p className="text-sm font-medium">As vitórias aparecem quando a eficiência supera a meta.</p>
              </div>
            )}
        </div>
      </div>

    </div>
  );
}
