import React, { useState, useEffect, Suspense } from 'react';

import { Outlet, Navigate, Link, useLocation, ScrollRestoration } from 'react-router-dom';
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
  CreditCard,
  ChevronDown,
  ChevronRight,
  Phone,
  Calendar,
  Fuel,
  BarChart3,
  User,
  Building2,
  Lock,
  History,
  AlertTriangle,
  Award,
  Circle
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { usePlan } from '@/hooks/usePlan';
import { supabase } from '@/lib/supabase';
import { OriginalLoader } from '@/components/ui/OriginalLoader';
import { useQueryClient } from '@tanstack/react-query';
import { fetchOccurrences } from '@/hooks/useOccurrences';

// ============================================================================
// ESTRUTURA DE NAVEGAÇÃO
// ============================================================================

interface NavSubItem {
  label: string;
  path: string;
  roles?: string[];
}

interface NavItem {
  label: string;
  icon: any;
  path?: string;
  module?: string;
  roles?: string[];
  subItems?: NavSubItem[];
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const managerNavGroups: NavGroup[] = [
  {
    group: "Operacional",
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['gestor', 'comando', 'gcm', 'administrativo'] },
      { 
        label: 'Operações', 
        icon: FileText, 
        module: 'ocorrencias',
        roles: ['gestor', 'comando', 'gcm'],
        subItems: [
          { label: 'Ocorrências', path: '/ocorrencias' },
          { label: 'Chamados', path: '/chamados' },
          { label: 'Embriaguez', path: '/ocorrencias/embriaguez' },
          { label: 'Maria da Penha', path: '/ocorrencias/maria-da-penha' },
        ]
      },
      { label: 'Equipes', icon: Users, path: '/equipes', module: 'equipes', roles: ['gestor', 'comando'] },
      { label: 'Escalas', icon: Calendar, path: '/escalas', module: 'escalas', roles: ['gestor', 'comando', 'administrativo'] },
    ]
  },
  {
    group: "Logística",
    items: [
      { 
        label: 'Veículos', 
        icon: Truck, 
        module: 'veiculos',
        roles: ['gestor', 'comando', 'administrativo', 'gcm'],
        subItems: [
          { label: 'Frota', path: '/veiculos' },
          { label: 'KM Diário', path: '/veiculos/km' },
          { label: 'Vistorias', path: '/veiculos/vistorias' },
          { label: 'Vincular Equipe', path: '/veiculos/vincular' },
        ]
      },
      { 
        label: 'Combustível', 
        icon: Fuel, 
        module: 'combustivel',
        roles: ['gestor', 'administrativo'],
        subItems: [
          { label: 'Dashboard', path: '/combustivel' },
          { label: 'Alertas', path: '/combustivel/alertas' },
          { label: 'Abastecimento', path: '/combustivel/abastecimento' },
          { label: 'Mural', path: '/combustivel/mural' },
          { label: 'Alertas Positivos', path: '/combustivel/vitorias' },
        ]
      },
    ]
  },
  {
      group: "Relatórios & Admin",
      items: [
          { label: 'Relatórios', icon: BarChart3, path: '/relatorios', module: 'relatorios', roles: ['gestor', 'comando'] },
          { label: 'Usuários', icon: Shield, path: '/usuarios', module: 'administrativo', roles: ['gestor'] },
          { label: 'Configurações', icon: Settings, path: '/configuracoes', module: 'administrativo', roles: ['gestor'] },
          { label: 'Auditoria', icon: History, path: '/auditoria', module: 'administrativo', roles: ['gestor'] },
      ]
  },
  {
    group: "Sobre Mim",
    items: [
      { label: 'Minha Equipe', icon: Users, path: '/me/equipe', roles: ['gcm', 'comando', 'gestor', 'administrativo'] },
      { label: 'Minha Escala', icon: Calendar, path: '/me/escala', roles: ['gcm', 'comando', 'gestor', 'administrativo'] },
      { label: 'Meu Perfil', icon: User, path: '/me/perfil', roles: ['gcm', 'comando', 'gestor', 'administrativo'] },
      { label: 'Instituição', icon: Building2, path: '/assinatura', roles: ['gestor'] },
    ]
  }
];

const SidebarItem = ({ item, allowedModules }: any) => {
  const { profile } = useAuthStore();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(location.pathname.startsWith(item.path || '!!!!'));
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const isActive = item.path ? location.pathname === item.path : item.subItems?.some((si: any) => location.pathname === si.path);

  const handlePrefetch = () => {
    if ((item.module === 'ocorrencias' || item.path === '/ocorrencias') && profile?.instituicao_id) {
      queryClient.prefetchQuery({
        queryKey: ['occurrences', profile.instituicao_id],
        queryFn: () => fetchOccurrences(profile.instituicao_id),
        staleTime: 1000 * 60 * 10,
      });
    }
  };

  const isGestor = profile?.perfil_acesso === 'gestor';
  const roleAllowed = !item.roles || item.roles.includes(profile?.perfil_acesso);
  const moduleAllowed = !item.module || allowedModules.includes(item.module) || isGestor;

  if (!roleAllowed || !moduleAllowed) return null;

  return (
    <div className="space-y-1">
      {hasSubItems ? (
        <>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            onMouseEnter={handlePrefetch}
            className={`w-full flex items-center px-4 py-3 rounded-2xl text-sm font-bold transition-all group ${
              isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
            <span className="flex-1 text-left">{item.label}</span>
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          
          {isOpen && (
            <div className="ml-9 space-y-1 mt-1 animate-in slide-in-from-top-2 duration-300">
              {item.subItems.map((sub: NavSubItem) => (
                <Link
                  key={sub.path}
                  to={sub.path}
                  onMouseEnter={() => {
                    if (sub.path === '/ocorrencias') handlePrefetch();
                  }}
                  className={`flex items-center px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    location.pathname === sub.path 
                      ? 'text-indigo-600 bg-indigo-50/50' 
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Circle className={`w-1.5 h-1.5 mr-3 ${location.pathname === sub.path ? 'fill-indigo-600' : 'fill-slate-300'}`} />
                  {sub.label}
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <Link
          to={item.path!}
          onMouseEnter={handlePrefetch}
          className={`flex items-center px-4 py-3 rounded-2xl text-sm font-bold transition-all group ${
            isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
          <span>{item.label}</span>
        </Link>
      )}
    </div>
  );
};

// Componente de Barra de Carregamento Sutil (TopBar)
const TopBarLoader = () => (
  <div className="fixed top-0 left-0 right-0 h-1 z-[100] overflow-hidden bg-slate-100">
    <div className="h-full bg-indigo-600 animate-loading-bar" style={{ width: '100%' }}></div>
  </div>
);

export function DashboardLayout() {

  const { user, profile, institution, isLoading, signOut } = useAuthStore();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const allowedModules = institution?.planos?.modulos_ativos || [];

  if (isLoading) return <OriginalLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.perfil_acesso === 'super_admin') return <Navigate to="/admin/dashboard" replace />;

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden">
      <ScrollRestoration />
      
      {/* SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 shadow-sm z-20">
        <div className="h-20 flex items-center px-8 border-b border-slate-50">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 mr-3">
                <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-slate-900 tracking-tighter text-xl italic uppercase">GCM DIGITAL</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto custom-scrollbar">
          {managerNavGroups.map((group) => (
            <div key={group.group} className="space-y-2">
              <h5 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{group.group}</h5>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <SidebarItem key={item.label} item={item} allowedModules={allowedModules} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 bg-slate-50/50 border-t border-slate-100">
            <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm">
                <div className="flex items-center mb-3">
                    <div className="w-9 h-9 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs mr-3 shadow-lg shadow-indigo-600/20">
                        {profile?.primeiro_nome?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-slate-900 truncate">{profile?.primeiro_nome} {profile?.sobrenome}</p>
                        <p className="text-[10px] text-indigo-500 truncate uppercase font-black tracking-tighter">{profile?.perfil_acesso}</p>
                    </div>
                </div>
                <button 
                    onClick={() => signOut()}
                    className="w-full flex items-center justify-center py-2.5 bg-rose-50 border border-rose-100 rounded-xl text-[10px] font-black uppercase text-rose-600 hover:bg-rose-600 hover:text-white transition-all duration-300"
                >
                    <LogOut className="w-3.5 h-3.5 mr-2" /> Encerrar Sessão
                </button>
            </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 z-10 sticky top-0">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2.5 rounded-2xl text-slate-500 hover:bg-slate-100 mr-2">
                <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg lg:text-xl font-black text-slate-900 tracking-tight capitalize">
                {location.pathname.split('/').pop()?.replace(/-/g, ' ') || 'Início'}
            </h2>
          </div>
          <div className="flex items-center space-x-2 lg:space-x-4">
             <button className="relative p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-10 pb-24 lg:pb-10 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            <Suspense fallback={<TopBarLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </main>

      </div>

      {/* MOBILE DRAWER */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-80 bg-white p-6 flex flex-col animate-in slide-in-from-left duration-500">
                <div className="flex items-center justify-between mb-8">
                    <span className="font-black text-slate-900 text-xl tracking-tighter uppercase italic">GCM DIGITAL</span>
                    <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {managerNavGroups.map((group) => (
                        <div key={group.group} className="mb-8">
                             <h5 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{group.group}</h5>
                             <div className="space-y-2">
                                {group.items.map((item) => (
                                    <SidebarItem key={item.label} item={item} allowedModules={allowedModules} />
                                ))}
                             </div>
                        </div>
                    ))}
                </div>
            </aside>
        </div>
      )}
    </div>
  );
}
