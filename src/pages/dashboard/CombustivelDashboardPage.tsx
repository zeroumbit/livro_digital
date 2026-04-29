import React from 'react';
import { 
  Fuel, 
  TrendingDown, 
  TrendingUp, 
  Droplets, 
  DollarSign, 
  AlertCircle,
  BarChart3,
  Calendar,
  Truck,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAbastecimentos } from '@/hooks/useLogistics';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#F43F5E'];

const StatCard = ({ title, value, subValue, trend, icon: Icon, color }: any) => (
  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 rounded-full blur-3xl -mr-10 -mt-10`}></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div className={`w-12 h-12 rounded-2xl bg-${color}-50 text-${color}-600 flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
            trend > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
          }`}>
            {trend > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}</p>
      <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
      <p className="text-xs font-bold text-slate-500 mt-1">{subValue}</p>
    </div>
  </div>
);

export function CombustivelDashboardPage() {
  const { data: abastecimentos } = useAbastecimentos();

  // Dados simulados para o gráfico (normalmente viriam de uma query agregada)
  const chartData = [
    { name: 'Seg', valor: 450 },
    { name: 'Ter', valor: 320 },
    { name: 'Qua', valor: 600 },
    { name: 'Qui', valor: 480 },
    { name: 'Sex', valor: 750 },
    { name: 'Sab', valor: 300 },
    { name: 'Dom', valor: 200 },
  ];

  const totalGasto = abastecimentos?.reduce((acc, curr) => acc + curr.custo_total, 0) || 0;
  const totalLitros = abastecimentos?.reduce((acc, curr) => acc + curr.litros, 0) || 0;
  const mediaConsumo = abastecimentos?.length 
    ? (abastecimentos.reduce((acc, curr) => acc + (curr.consumo_real || 0), 0) / abastecimentos.length).toFixed(1) 
    : 0;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Painel de Combustível</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">
            Análise de performance, gastos e eficiência da frota.
          </p>
        </div>
        <div className="flex items-center gap-4 text-slate-400 font-bold text-sm">
          <Calendar className="w-4 h-4" /> Últimos 30 dias
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Investimento Total"
          value={`R$ ${totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subValue="Gasto no período"
          icon={DollarSign}
          color="indigo"
          trend={12}
        />
        <StatCard 
          title="Volume Abastecido"
          value={`${totalLitros.toLocaleString('pt-BR')} L`}
          subValue="Total de litros"
          icon={Droplets}
          color="blue"
          trend={-5}
        />
        <StatCard 
          title="Média da Frota"
          value={`${mediaConsumo} km/L`}
          subValue="Eficiência média"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard 
          title="Alertas Críticos"
          value={abastecimentos?.filter(a => a.alerta_gerado === 'CRITICO').length || 0}
          subValue="Anomalias detectadas"
          icon={AlertCircle}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Consumo Diário (L)</h3>
              <p className="text-sm text-slate-400 font-medium italic">Monitoramento de volume diário.</p>
            </div>
            <BarChart3 className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis hide />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold'}} />
                <Area type="monotone" dataKey="valor" stroke="#4F46E5" strokeWidth={4} fillOpacity={1} fill="url(#colorFuel)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-8">Top Eficiência</h3>
          <div className="space-y-6">
            {abastecimentos?.slice(0, 5).map((item, i) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                  i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-400'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">{item.veiculo?.placa}</p>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full" 
                      style={{ width: `${Math.min(item.eficiencia || 0, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-900">{item.eficiencia?.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
