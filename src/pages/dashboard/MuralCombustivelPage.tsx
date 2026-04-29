import React from 'react';
import { 
  Megaphone, 
  Droplets, 
  DollarSign, 
  TrendingDown, 
  Award,
  AlertCircle,
  Clock,
  ChevronRight,
  MessageSquare
} from 'lucide-react';

export function MuralCombustivelPage() {
  const avisos = [
    {
      id: 1,
      titulo: 'Novos Postos Credenciados',
      conteudo: 'A partir de hoje, as viaturas podem abastecer nos postos da Rede Shell conveniados. Verifique a lista no app.',
      data: 'Hoje, 09:00',
      tipo: 'info',
      icon: Megaphone
    },
    {
      id: 2,
      titulo: 'Meta de Consumo Reduzida',
      conteudo: 'A meta de consumo para as viaturas Ford Ranger foi ajustada para 8.5 km/L visando otimização de recursos.',
      data: 'Ontem, 14:20',
      tipo: 'alerta',
      icon: TrendingDown
    },
    {
      id: 3,
      titulo: 'Destaque da Semana: Viatura 105',
      conteudo: 'A equipe da viatura 105 atingiu a maior eficiência do mês com média de 10.2 km/L. Parabéns pelo cuidado!',
      data: '27 Abr, 10:15',
      tipo: 'vitoria',
      icon: Award
    }
  ];

  return (
    <div className="space-y-6 lg:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Mural de Combustível</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">
            Comunicados, metas e destaques da gestão de logística.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          {avisos.map((aviso) => (
            <div key={aviso.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 hover:shadow-xl transition-all group overflow-hidden relative">
              <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full blur-3xl -mr-10 -mt-10 ${
                aviso.tipo === 'info' ? 'bg-blue-500' : aviso.tipo === 'alerta' ? 'bg-amber-500' : 'bg-emerald-500'
              }`}></div>
              
              <div className="flex gap-6 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  aviso.tipo === 'info' ? 'bg-blue-50 text-blue-600' : 
                  aviso.tipo === 'alerta' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  <aviso.icon className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-slate-900">{aviso.titulo}</h3>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{aviso.data}</span>
                  </div>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    {aviso.conteudo}
                  </p>
                  <div className="mt-6 flex items-center gap-4">
                    <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 flex items-center">
                      <MessageSquare className="w-3.5 h-3.5 mr-2" /> Comentar
                    </button>
                    <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
                      Ler Mais <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
             <DollarSign className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-white/5 -rotate-12" />
             <h4 className="text-lg font-black mb-6 uppercase tracking-tight">Preços Médios</h4>
             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/5">
                   <span className="text-xs font-bold text-white/70">Gasolina</span>
                   <span className="text-lg font-black">R$ 5,89</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/5">
                   <span className="text-xs font-bold text-white/70">Diesel S10</span>
                   <span className="text-lg font-black">R$ 6,15</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/5">
                   <span className="text-xs font-bold text-white/70">Etanol</span>
                   <span className="text-lg font-black">R$ 3,45</span>
                </div>
             </div>
             <p className="text-[10px] text-white/40 mt-6 font-medium italic">* Média baseada nos últimos 7 dias de abastecimento.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
