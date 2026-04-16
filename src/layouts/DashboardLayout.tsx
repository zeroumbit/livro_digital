import React, { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Bell, 
  Search, 
  Menu, 
  X,
  PlusCircle,
  Shield,
  Truck,
  CreditCard
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

// ============================================================================
// COMPONENTES AUXILIARES: NAVEGAÇÃO
// ============================================================================

const navItems = [
  { label: 'Início', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Ocorrências', icon: FileText, path: '/ocorrencias' },
  { label: 'Viaturas', icon: Truck, path: '/veiculos' },
  { label: 'Equipe', icon: Users, path: '/equipes' },
  { label: 'Minha Assinatura', icon: CreditCard, path: '/assinatura' },
  { label: 'Ajustes', icon: Settings, path: '/configuracoes' },
];

// ============================================================================
// LAYOUT PRINCIPAL: DASHBOARD (ADAPTATIVO)
// ============================================================================

export function DashboardLayout() {
  const { user, profile, institution, isLoading, signOut } = useAuthStore();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasPendingProposal, setHasPendingProposal] = useState(false);

  // Verificar propostas pendentes (Passo 2 da Spec)
  const checkProposals = async () => {
    if (profile?.perfil_acesso === 'gestor' && institution?.id) {
        const { count } = await supabase
            .from('assinaturas_propostas')
            .select('*', { count: 'exact', head: true })
            .eq('instituicao_id', institution.id)
            .eq('status', 'aguardando_gestor');
        setHasPendingProposal(!!count && count > 0);
    }
  };

  React.useEffect(() => {
    checkProposals();
    
    // Inscrever no Realtime para atualizações (Passo 2 da Spec)
    const channel = supabase
        .channel('propostas-changes')
        .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'assinaturas_propostas',
            filter: `instituicao_id=eq.${institution?.id}`
        }, () => {
            checkProposals();
        })
        .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile, institution]);

  // Loading State
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Segurança Camada 2...</p>
        </div>
      </div>
    );
  }

  // Auth Protection
  if (!user) return <Navigate to="/login" replace />;

  // Isolation: Super Admin não deve entrar no dashboard das instituições
  if (profile?.perfil_acesso === 'super_admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Manager Setup Check
  const setupCompleted = institution?.configuracoes_locais?.setup_completed;
  if (profile?.perfil_acesso === 'gestor' && !setupCompleted) {
    return <Navigate to="/setup" replace />;
  }

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
      
      {/* ================= SIDEBAR (DESKTOP) ================= */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 shadow-sm z-20">
        <div className="h-20 flex items-center px-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 mr-3">
                <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-slate-900 tracking-tight text-xl italic uppercase">Livro Digital</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center flex-1">
                    <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {item.label}
                </div>
                {item.label === 'Minha Assinatura' && hasPendingProposal && (
                    <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-3xl">
                <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs mr-3">
                        {profile?.primeiro_nome?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{profile?.primeiro_nome} {profile?.sobrenome}</p>
                        <p className="text-[10px] text-slate-500 truncate uppercase font-black">{profile?.perfil_acesso}</p>
                    </div>
                </div>
                <button 
                    onClick={signOut}
                    className="w-full flex items-center justify-center py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:text-rose-500 hover:border-rose-100 transition-all"
                >
                    <LogOut className="w-3 h-3 mr-2" /> Sair
                </button>
            </div>
        </div>
      </aside>

      {/* ================= MAIN AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* HEADER (DESKTOP & MOBILE) */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 z-10 sticky top-0">
          <div className="flex items-center">
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 mr-2"
            >
                <Menu className="w-6 h-6" />
            </button>
            <div className="lg:hidden w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20 mr-3">
                <Shield className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg lg:text-xl font-black text-slate-900 tracking-tight capitalize">
                {location.pathname.split('/').pop() || 'Início'}
            </h2>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-4">
            <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all">
                <Search className="w-5 h-5" />
            </button>
            <button className="relative p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="hidden sm:flex h-11 px-4 bg-slate-900 text-white rounded-2xl items-center text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
                <PlusCircle className="w-4 h-4 mr-2" /> Nova Ocorrência
            </button>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-10 pb-24 lg:pb-10 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* ================= TAB BAR (MOBILE ONLY) ================= */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-6 flex items-center justify-between z-30">
          {navItems.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex flex-col items-center transition-all ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}
              >
                <item.icon className={`w-6 h-6 mb-1 ${isActive ? 'animate-in zoom-in-75 duration-300' : ''}`} />
                <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
              </Link>
            );
          })}
          <Link to="/setup" className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 -mt-8 border-4 border-white">
            <PlusCircle className="w-6 h-6" />
          </Link>
        </div>
      </div>

      {/* ================= MOBILE DRAWER (SIDEBAR) ================= */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
                onClick={() => setIsSidebarOpen(false)}
            />
            <aside className="absolute inset-y-0 left-0 w-80 bg-white p-8 animate-in slide-in-from-left duration-500">
                <div className="flex items-center justify-between mb-10">
                    <span className="font-black text-slate-900 text-xl tracking-tighter uppercase italic">Menu Global</span>
                    <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <nav className="space-y-2">
                    {navItems.map((item) => (
                        <Link 
                            key={item.path} 
                            to={item.path} 
                            onClick={() => setIsSidebarOpen(false)}
                            className="flex items-center px-4 py-4 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                        >
                            <item.icon className="w-5 h-5 mr-4 text-slate-400" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="absolute bottom-10 left-8 right-8">
                    <button 
                        onClick={signOut}
                        className="w-full flex items-center justify-center py-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-black uppercase tracking-widest"
                    >
                        <LogOut className="w-4 h-4 mr-2" /> Encerrar Sessão
                    </button>
                </div>
            </aside>
        </div>
      )}

    </div>
  );
}
