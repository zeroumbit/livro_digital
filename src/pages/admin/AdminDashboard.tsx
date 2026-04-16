import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  Users, 
  ShieldAlert, 
  FileStack, 
  TrendingUp, 
  TrendingDown,
  History,
  Activity,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';

// ============================================================================
// COMPONENTES AUXILIARES (KPI Cards)
// ============================================================================

const KpiCard = ({ title, value, trend, trendValue, icon: Icon, variant = 'default' }: any) => {
  const isDefault = variant === 'default';
  
  return (
    <div className={`p-6 rounded-[2rem] border transition-all duration-300 group hover:-translate-y-1 ${
      isDefault 
        ? 'bg-white border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50' 
        : 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-600/20 text-white'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${isDefault ? 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors' : 'bg-white/20 text-white'}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${
            trend === 'up' 
              ? (isDefault ? 'bg-emerald-50 text-emerald-600' : 'bg-white/20 text-white') 
              : 'bg-rose-50 text-rose-600'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {trendValue}
          </div>
        )}
      </div>
      <div>
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isDefault ? 'text-slate-400' : 'text-indigo-100'}`}>
          {title}
        </p>
        <h3 className={`text-3xl font-black tracking-tight ${isDefault ? 'text-slate-900' : 'text-white'}`}>
          {value}
        </h3>
      </div>
    </div>
  );
};

// ============================================================================
// PÁGINA: DASHBOARD DO SUPER ADMIN (REAL TIME)
// ============================================================================

export function AdminDashboard() {
  const [stats, setStats] = useState({
    tenants: 0,
    users: 0,
    pending: 0,
    trial: 0
  });
  const [recentInstituicoes, setRecentInstituicoes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
        // 1. Contagens Reais
        const [
            { count: totalTenants },
            { count: totalUsers },
            { count: totalPending },
            { count: totalTrial }
        ] = await Promise.all([
            supabase.from('instituicoes').select('*', { count: 'exact', head: true }),
            supabase.from('usuarios').select('*', { count: 'exact', head: true }),
            supabase.from('instituicoes').select('*', { count: 'exact', head: true }).eq('status_assinatura', 'pendente'),
            supabase.from('instituicoes').select('*', { count: 'exact', head: true }).eq('status_assinatura', 'trial'),
        ]);

        setStats({
            tenants: totalTenants || 0,
            users: totalUsers || 0,
            pending: totalPending || 0,
            trial: totalTrial || 0
        });

        // 2. Instituições Recentes
        const { data: recent } = await supabase
            .from('instituicoes')
            .select('*, planos(nome)')
            .order('created_at', { ascending: false })
            .limit(5);
        
        setRecentInstituicoes(recent || []);

    } catch (error) {
        console.error('Erro ao carregar dashboard admin:', error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-12">
      
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded transition-all hover:bg-indigo-600 hover:text-white cursor-default">SaaS Monitor</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tempo Real</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Painel de Controle</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Visão global da infraestrutura Livro Digital.</p>
        </div>
        
        <button 
            onClick={fetchDashboardData}
            className="flex items-center h-12 px-6 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
        >
            <Activity className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Atualizar Dados
        </button>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total Instituições" value={stats.tenants} icon={Building2} trend="up" trendValue="+12%" />
        <KpiCard title="Base de Usuários" value={stats.users} icon={Users} trend="up" trendValue="+5%" />
        <KpiCard title="Modo Trial" value={stats.trial} icon={Clock} />
        <KpiCard title="Aprovação Pendente" value={stats.pending} icon={ShieldAlert} variant="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* TABELA DE INSTITUIÇÕES RECENTES */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="px-8 py-7 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Onboarding Recente</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Últimas 5 entidades cadastradas</p>
            </div>
            <Link to="/admin/instituicoes" className="h-10 px-4 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase flex items-center hover:bg-indigo-600 hover:text-white transition-all tracking-widest">
                Gerenciar Todas
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 transition-colors">
                  <th className="px-8 py-5">Identificação</th>
                  <th className="px-8 py-5">Plano / Assinatura</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-sm">
                {recentInstituicoes.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                            <div className="flex items-center">
                            <div className="w-11 h-11 rounded-[1.25rem] bg-slate-900 text-white flex items-center justify-center font-black text-xs mr-4 shadow-lg shadow-slate-900/10">
                                {inst.razao_social.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{inst.razao_social}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{inst.cnpj}</p>
                            </div>
                            </div>
                        </td>
                        <td className="px-8 py-6">
                            <span className="text-[10px] font-black text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg uppercase tracking-wider">{inst.planos?.nome || 'Trial'}</span>
                        </td>
                        <td className="px-8 py-6">
                            <div className={`flex items-center text-[10px] font-black uppercase tracking-widest ${
                                inst.status_assinatura === 'ativa' ? 'text-emerald-500' : 
                                inst.status_assinatura === 'pendente' ? 'text-amber-500 animate-pulse' : 'text-slate-400'
                            }`}>
                                <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                                    inst.status_assinatura === 'ativa' ? 'bg-emerald-500' : 
                                    inst.status_assinatura === 'pendente' ? 'bg-amber-500' : 'bg-slate-400'
                                }`}></div>
                                {inst.status_assinatura}
                            </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                            <Link 
                                to={`/admin/instituicoes?id=${inst.id}`} 
                                className="inline-flex items-center justify-center h-10 w-10 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-2xl transition-all shadow-sm border border-slate-100"
                            >
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </td>
                    </tr>
                ))}
                {recentInstituicoes.length === 0 && (
                    <tr>
                        <td colSpan={4} className="px-8 py-20 text-center text-slate-400 italic">Nenhuma instituição cadastrada recentemente.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* FEED DE ATIVIDADES GLOBAIS (DADOS REAIS SIMULADOS POR EVENTOS) */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center">
                    <History className="w-6 h-6 mr-3 text-indigo-600" />
                    SaaS Log
                </h3>
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">Audit Track</span>
            </div>
            
            <div className="space-y-7 w-full">
                {recentInstituicoes.slice(0, 4).map((inst, i) => (
                    <ActivityItem 
                        key={inst.id}
                        title={inst.status_assinatura === 'pendente' ? 'Aprovação Necessária' : 'Nova Ativação'} 
                        desc={`${inst.razao_social} ${inst.status_assinatura === 'pendente' ? 'aguarda revisão do super admin.' : 'foi integrada ao SaaS.'}`}
                        time={i === 0 ? 'Agora' : `${i * 2}h atrás`} 
                        variant={inst.status_assinatura === 'pendente' ? 'warning' : 'success'}
                    />
                ))}
                
                {recentInstituicoes.length === 0 && (
                     <div className="text-center py-10">
                        <Activity className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                        <p className="text-slate-400 text-xs font-medium">Sem registros de auditoria no momento.</p>
                     </div>
                )}
            </div>
            
            <button className="w-full mt-auto py-4 bg-slate-900 text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"> 
                Relatórios de Auditoria 
            </button>
        </div>

      </div>

    </div>
  );
}

function ActivityItem({ title, desc, time, variant = 'default' }: any) {
    const iconColor = variant === 'success' ? 'bg-emerald-500 shadow-emerald-500/30' : variant === 'warning' ? 'bg-amber-500 shadow-amber-500/30' : 'bg-indigo-600 shadow-indigo-600/30';
    
    return (
        <div className="flex group">
            <div className="mr-4 flex flex-col items-center">
                <div className={`w-2.5 h-2.5 rounded-full ${iconColor} shadow-lg transition-transform group-hover:scale-125`}></div>
                <div className="w-px h-full bg-slate-100 mt-2"></div>
            </div>
            <div className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{title}</span>
                    <span className="text-[9px] font-bold text-slate-300 tracking-widest uppercase">/ {time}</span>
                </div>
                <p className="text-sm text-slate-500 leading-snug line-clamp-2">{desc}</p>
            </div>
        </div>
    );
}
