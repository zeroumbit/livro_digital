import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Building2, 
  LayoutDashboard, 
  CreditCard, 
  Settings, 
  LogOut,
  ChevronRight,
  Menu,
  Bell,
  Search,
  ShieldAlert,
  Server,
  LifeBuoy,
  Users,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

// ============================================================================
// CONFIGURAÇÃO DE MENUS DO SUPER ADMIN (Gestão do SaaS)
// ============================================================================

type MenuItemType = {
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number; 
};

type MenuCategory = { title?: string; items: MenuItemType[] };

const superAdminMenu: MenuCategory[] = [
  {
    items: [
      { label: 'Visão Geral', icon: LayoutDashboard, path: '/admin/dashboard' }
    ]
  },
  {
    title: 'Gestão de Tenants',
    items: [
      { label: 'Instituições', icon: Building2, path: '/admin/instituicoes' },
      { label: 'Planos SaaS', icon: Server, path: '/admin/planos' },
    ]
  },
  {
    title: 'Faturamento & Suporte',
    items: [
      { label: 'Assinaturas', icon: CreditCard, path: '/admin/assinaturas' },
      { label: 'Tickets de Suporte', icon: LifeBuoy, path: '/admin/suporte' },
    ]
  },
  {
    title: 'Segurança & Config',
    items: [
      { label: 'Auditoria SaaS', icon: ShieldAlert, path: '/admin/auditoria' },
      { label: 'Configurações Globais', icon: Settings, path: '/admin/configuracoes' },
    ]
  }
];

// ============================================================================
// COMPONENTES AUXILIARES (Sidebar Item)
// ============================================================================

const SidebarItem = ({ item, currentPath }: { item: MenuItemType, currentPath: string }) => {
  const isActive = currentPath === item.path;

  return (
    <Link 
      to={item.path}
      className={`flex items-center justify-between w-full px-4 py-3 mb-1 rounded-xl text-sm font-medium transition-all duration-200 ${
        isActive 
          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
      }`}
    >
      <div className="flex items-center">
        <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
        {item.label}
      </div>
      {item.badge && (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow-sm shadow-blue-600/20">
          {item.badge}
        </span>
      )}
    </Link>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL: APP SHELL DO SUPER ADMIN
// ============================================================================

export default function SuperAdminLayout() {
  const { profile, isLoading, signOut } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Enquanto carrega o perfil, mostramos o mesmo loading elegante do Dashboard
  if (isLoading) {
    return (
        <div className="flex h-screen items-center justify-center bg-[#0F172A]">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-blue-400 font-bold text-xs uppercase tracking-widest">Verificando Credenciais SaaS...</p>
          </div>
        </div>
    );
  }

  // Proteção de Rota: Se não houver perfil ou não for admin, bloqueia imediatamente
  if (!profile || profile.perfil_acesso !== 'super_admin') {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="p-10 bg-white rounded-[2.5rem] shadow-2xl text-center max-w-sm border border-rose-100 animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Acesso Restrito</h2>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">O seu perfil não possui autorização para aceder aos módulos de gestão do SaaS.</p>
          <button 
            className="h-12 px-6 bg-slate-900 text-white rounded-2xl text-sm font-bold w-full hover:bg-slate-800 transition-all shadow-lg"
            onClick={() => navigate('/login')}
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full bg-[#0F172A] font-sans overflow-hidden">
      
      {/* ================= BARRA LATERAL (SIDEBAR DARK/BLUE) ================= */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0A0F1D] border-r border-blue-900/10 shadow-2xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* LOGOTIPO SaaS */}
        <div className="h-24 flex items-center px-8 text-nowrap">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 mr-4">
            <Server className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight leading-none">Super Admin</h1>
            <div className="flex items-center mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
              <p className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">Plataforma SaaS</p>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO ADMIN */}
        <div className="h-[calc(100vh-6rem)] overflow-y-auto px-4 py-8">
          {superAdminMenu.map((category, idx) => (
            <div key={idx} className="mb-8">
              {category.title && (
                <h3 className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">
                  {category.title}
                </h3>
              )}
              <div className="space-y-1">
                {category.items.map((item, itemIdx) => (
                  <SidebarItem key={itemIdx} item={item} currentPath={currentPath} />
                ))}
              </div>
            </div>
          ))}

          <div className="mt-8 pt-8 border-t border-slate-800/40 px-4">
            <div className="flex items-center space-x-3 mb-6 bg-slate-800/30 p-3 rounded-2xl border border-slate-800/20">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg">
                    {profile?.primeiro_nome?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{profile?.primeiro_nome} {profile?.sobrenome}</p>
                    <p className="text-[10px] text-slate-500 truncate">SaaS Management</p>
                </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/20"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sair da conta
            </button>
          </div>
        </div>
      </aside>

      {/* OVERLAY MOBILE */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* ================= ÁREA DE CONTEÚDO PRINCIPAL ================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        
        {/* CABEÇALHO (HEADER ADMIN) */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10">
          
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden mr-6 p-2 rounded-xl text-slate-500 hover:bg-slate-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="hidden sm:flex items-center text-sm font-bold text-slate-400">
              <span className="hover:text-blue-600 transition-colors cursor-pointer">SaaS Admin</span>
              <ChevronRight className="w-4 h-4 mx-3 text-slate-300" />
              <span className="text-slate-900 capitalize">{currentPath.split('/').pop()?.replace('-', ' ')}</span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl group focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600/10 transition-all">
                <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input type="text" placeholder="Pesquisar..." className="bg-transparent border-none focus:ring-0 ml-3 text-sm text-slate-600 w-48 font-medium" />
            </div>

            <button className="relative p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white"></span>
            </button>

            <div className="w-px h-8 bg-slate-200 hidden md:block"></div>

            <div className="hidden lg:flex h-10 w-10 rounded-2xl bg-slate-50 border border-slate-100 items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-indigo-500" />
            </div>
          </div>
        </header>

        {/* ÁREA DE RENDERIZAÇÃO REAL (Outlet) */}
        <main className="flex-1 overflow-auto p-8 lg:p-12 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
