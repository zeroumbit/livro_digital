import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  FileText, 
  Truck, 
  TrendingUp, 
  AlertCircle,
  Clock,
  ChevronRight,
  Filter,
  Download,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import { SetupGuideBanner } from '@/components/SetupGuideCards';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// ============================================================================
// CORES PARA GRÁFICOS
// ============================================================================

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#F43F5E'];

// ============================================================================
// COMPONENTES DE APOIO (UI Premium com Memoização)
// ============================================================================

const StatCard = React.memo(({ title, value, subValue, icon: Icon, color }: any) => (
  <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700`}></div>
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{title}</p>
        <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{value}</h3>
        <p className="text-xs font-bold text-slate-500">{subValue}</p>
      </div>
      <div className={`w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-500`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
));

const ActivityItem = React.memo(({ title, time, type }: any) => {
  const icons: any = {
    ocorrencia: { icon: FileText, color: 'indigo' },
    equipe: { icon: Users, color: 'emerald' },
    viatura: { icon: Truck, color: 'amber' },
    alerta: { icon: AlertCircle, color: 'rose' }
  };
  const { icon: Icon, color } = icons[type] || icons.ocorrencia;

  return (
    <div className="flex items-center p-4 hover:bg-slate-50 rounded-3xl transition-all cursor-pointer group">
      <div className={`w-12 h-12 rounded-2xl bg-${color}-50 text-${color}-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-0.5">{time}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300" />
    </div>
  );
});

// ============================================================================
// PÁGINA: DASHBOARD DO GESTOR (Cockpit Institucional)
// ============================================================================

export const DashboardGestor = React.memo(({ isVisible }: { isVisible?: boolean }) => {

  const { institution } = useAuthStore();
  const [stats, setStats] = useState({
    ocorrenciasHoje: 0,
    efetivoAtivo: 0,
    viaturasEmUso: 0,
    bairrosAtendidos: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [atividadesRecentes, setAtividadesRecentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!institution?.id) return;
      try {
        setLoading(true);
        const hoje = new Date().toISOString().split('T')[0];

        const { count: ocorrenciasHoje } = await supabase
          .from('ocorrencias')
          .select('*', { count: 'exact', head: true })
          .eq('instituicao_id', institution.id)
          .gte('created_at', `${hoje}T00:00:00`)
          .lte('created_at', `${hoje}T23:59:59`);

        const { count: efetivoAtivo } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('instituicao_id', institution.id)
          .eq('status', 'ativo');

        const { count: viaturasEmUso } = await supabase
          .from('viaturas')
          .select('*', { count: 'exact', head: true })
          .eq('instituicao_id', institution.id)
          .eq('status', 'em_patrulhamento');

        const { data: bairros } = await supabase
          .from('ocorrencias')
          .select('bairro')
          .eq('instituicao_id', institution.id)
          .not('bairro', 'is', null);

        const bairrosUnicos = new Set(bairros?.map(b => b.bairro) || []);

        setStats({
          ocorrenciasHoje: ocorrenciasHoje || 0,
          efetivoAtivo: efetivoAtivo || 0,
          viaturasEmUso: viaturasEmUso || 0,
          bairrosAtendidos: bairrosUnicos.size
        });

        const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
        const chartPromises = Array.from({ length: 7 }, (_, i) => {
          const data = new Date();
          data.setDate(data.getDate() - (6 - i));
          const dataStr = data.toISOString().split('T')[0];
          return supabase
            .from('ocorrencias')
            .select('*', { count: 'exact', head: true })
            .eq('instituicao_id', institution.id)
            .gte('created_at', `${dataStr}T00:00:00`)
            .lte('created_at', `${dataStr}T23:59:59`)
            .then(({ count }) => ({
              name: diasSemana[data.getDay()],
              valor: count || 0
            }));
        });

        const chartResult = await Promise.all(chartPromises);
        setChartData(chartResult);

        const { data: ocorrenciasNatureza } = await supabase
          .from('ocorrencias')
          .select('natureza')
          .eq('instituicao_id', institution.id)
          .not('natureza', 'is', null);

        const naturezaCount: Record<string, number> = {};
        ocorrenciasNatureza?.forEach((o: any) => {
          naturezaCount[o.natureza] = (naturezaCount[o.natureza] || 0) + 1;
        });

        const pieResult = Object.entries(naturezaCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([name, value]) => ({ name, value }));

        setPieData(pieResult.length > 0 ? pieResult : []);

        const { data: logs } = await supabase
          .from('logs')
          .select('*, profiles(nome, perfil_acesso)')
          .eq('instituicao_id', institution.id)
          .order('created_at', { ascending: false })
          .limit(5);

        const tipoMap: Record<string, string> = {
          'ocorrencia': 'ocorrencia',
          'viatura': 'viatura',
          'equipe': 'equipe',
          'alerta': 'alerta'
        };

        setAtividadesRecentes(
          (logs || []).map((log: any) => ({
            title: log.descricao || 'Atividade registrada',
            time: new Date(log.created_at).toLocaleString('pt-BR'),
            type: tipoMap[log.tipo] || 'ocorrencia'
          }))
        );

      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [institution?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
      {/* GUIA DE CONFIGURAÇÃO */}
      <SetupGuideBanner />
      
      {/* HEADER DINÂMICO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Operação Ativa</span>
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest flex items-center">
              <Clock className="w-3 h-3 mr-1.5" /> Atualizado há 2 min
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Painel de Comando</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">{institution?.razao_social}</p>
        </div>
        
        <div className="flex items-center space-x-4">
             <button className="h-12 px-5 bg-white border border-slate-200 text-slate-600 rounded-2xl flex items-center text-sm font-bold shadow-sm hover:bg-slate-50 transition-all">
                <Download className="w-4 h-4 mr-2" /> Exportar PDF
             </button>
             <button className="h-12 px-6 bg-slate-900 text-white rounded-2xl flex items-center text-sm font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all hover:-translate-y-1">
                <Activity className="w-4 h-4 mr-2" /> Monitoramento em Tempo Real
             </button>
        </div>
      </div>

      {/* CARDS DE ESTATÍSTICAS FUNDAMENTAIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Ocorrências / 24h" 
          value={stats.ocorrenciasHoje} 
          subValue="+12% em relação a ontem" 
          icon={FileText} 
          color="indigo" 
        />
        <StatCard 
          title="Efetivo On-line" 
          value={stats.efetivoAtivo} 
          subValue="4 equipes em patrulhamento" 
          icon={Users} 
          color="emerald" 
        />
        <StatCard 
          title="Frota Ativa" 
          value={stats.viaturasEmUso} 
          subValue="2 viaturas em manutenção" 
          icon={Truck} 
          color="amber" 
        />
        <StatCard 
          title="Zonas Monitoradas" 
          value={stats.bairrosAtendidos} 
          subValue="100% do território coberto" 
          icon={MapPin} 
          color="slate" 
        />
      </div>

      {/* SEÇÃO GRÁFICOS E ATIVIDADE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* GRÁFICO DE VOLUME OPERACIONAL */}
        <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Volume de Ocorrências</h3>
              <p className="text-sm text-slate-400 font-medium italic">Distribuição de chamados nos últimos 7 dias.</p>
            </div>
            <div className="flex space-x-2">
                <span className="px-3 py-1 bg-slate-100 rounded-lg text-slate-500 text-[10px] font-black">7 DIAS</span>
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-500 text-[10px] font-black">30 DIAS</span>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            {isVisible && chartData.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} 
                      dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold'}}
                  />
                  <Area type="monotone" dataKey="valor" stroke="#4F46E5" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>

        {/* ÚLTIMAS ATIVIDADES */}
        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center">
                <Clock className="w-5 h-5 mr-3 text-indigo-600" /> Atividade Recente
            </h3>
            <div className="space-y-4 flex-1 overflow-auto pr-2 custom-scrollbar">
                <ActivityItem title="Novo Registro: Maria da Penha" time="Há 5 minutos" type="ocorrencia" />
                <ActivityItem title="Viatura V-04 iniciou patrulha" time="Há 12 minutos" type="viatura" />
                <ActivityItem title="Equipe Delta: Troca de Turno" time="Há 45 minutos" type="equipe" />
                <ActivityItem title="Alerta: Bateria Baixa Viatura V-10" time="Há 1 hora" type="alerta" />
                <ActivityItem title="Relatório Gerado: Semanal" time="Há 2 horas" type="ocorrencia" />
            </div>
            <button className="mt-8 w-full py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                Ver Todo Histórico
            </button>
        </div>

      </div>

      {/* SEÇÃO INFERIOR: NATUREZAS E MAPA SIMBÓLICO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-8">Naturezas Frequentes</h3>
            <div className="flex flex-col md:flex-row items-center gap-10">
                 <div className="w-full md:w-1/2 h-[200px]">
                     {isVisible && pieData.length > 0 && (
                       <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                           <Pie
                               data={pieData}
                               innerRadius={60}
                               outerRadius={80}
                               paddingAngle={5}
                               dataKey="value"
                           >
                               {pieData.map((_entry, index) => (
                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                               ))}
                           </Pie>
                           <Tooltip />
                           </PieChart>
                       </ResponsiveContainer>
                     )}
                 </div>

                 <div className="w-full md:w-1/2 space-y-4">
                     {pieData.map((d, i) => {
                         const total = pieData.reduce((sum, item) => sum + item.value, 0);
                         return (
                         <div key={d.name} className="flex items-center justify-between text-sm">
                             <div className="flex items-center">
                                 <div className="w-3 h-3 rounded-full mr-3" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                                 <span className="font-bold text-slate-600">{d.name}</span>
                             </div>
                             <span className="font-black text-slate-900">{total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%</span>
                         </div>
                     )})}
                 </div>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-[3rem] p-10 shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
            {/* Decoração Estilizada Background */}
            <MapPin className="absolute right-[-20px] bottom-[-20px] w-64 h-64 text-white/5 -rotate-12 transition-transform duration-700 group-hover:rotate-0" />
            
            <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Status Geral do Território</h3>
                    <p className="text-white/70 font-medium">Situação de segurança por zona de patrulhamento.</p>
                </div>
                
                <div className="space-y-4 mt-8">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/10">
                        <span className="text-white font-bold text-sm">Zona Norte</span>
                        <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-full">Tranquilo</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/10">
                        <span className="text-white font-bold text-sm">Centro Histórico</span>
                        <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase rounded-full">Atenção</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/10">
                        <span className="text-white font-bold text-sm">Zona Leste</span>
                        <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-full">Tranquilo</span>
                    </div>
                </div>
                
                <button className="mt-8 py-4 bg-white text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center">
                    Ver Mapa Completo <ChevronRight className="w-4 h-4 ml-2" />
                </button>
            </div>
          </div>

      </div>

    </div>
  );
});


