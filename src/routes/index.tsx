import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense, startTransition } from 'react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

// Componente de preload para cache instantâneo
const PreloadLink = ({ to }: { to: string }) => {
  if (typeof window !== 'undefined') {
    import('@/pages/dashboard/ChamadosPage').catch(() => {});
    import('@/pages/dashboard/OcorrenciasPage').catch(() => {});
  }
  return null;
};

// Páginas com Lazy Loading otimizado
const createLazy = (factory: () => Promise<{ default: React.ComponentType<any> }>) => 
  lazy(() => startTransition(() => factory()));

const LoginPage = createLazy(() => import('@/pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = createLazy(() => import('@/pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const SetupWizard = createLazy(() => import('@/pages/onboarding/SetupWizard').then(m => ({ default: m.SetupWizard })));

const AdminDashboard = createLazy(() => import('@/pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminInstituicoes = createLazy(() => import('@/pages/admin/AdminInstituicoes').then(m => ({ default: m.AdminInstituicoes })));
const AdminPlanos = createLazy(() => import('@/pages/admin/AdminPlanos').then(m => ({ default: m.AdminPlanos })));
const AdminAssinaturas = createLazy(() => import('@/pages/admin/AdminAssinaturas').then(m => ({ default: m.AdminAssinaturas })));
const AdminAuditoria = createLazy(() => import('@/pages/admin/AdminAuditoria').then(m => ({ default: m.AdminAuditoria })));
const AdminConfiguracoes = createLazy(() => import('@/pages/admin/AdminConfiguracoes').then(m => ({ default: m.AdminConfiguracoes })));

const DashboardGestor = createLazy(() => import('@/pages/dashboard/DashboardGestor').then(m => ({ default: m.DashboardGestor })));
const EquipesPage = createLazy(() => import('@/pages/dashboard/EquipesPage').then(m => ({ default: m.EquipesPage })));
const AssinaturaPage = createLazy(() => import('@/pages/dashboard/AssinaturaPage').then(m => ({ default: m.AssinaturaPage })));
const VeiculosPage = createLazy(() => import('@/pages/dashboard/VeiculosPage').then(m => ({ default: m.VeiculosPage })));
const OcorrenciasPage = createLazy(() => import('@/pages/dashboard/OcorrenciasPage').then(m => ({ default: m.OcorrenciasPage })));
const EditOccurrencePage = createLazy(() => import('@/pages/dashboard/EditOccurrencePage').then(m => ({ default: m.EditOccurrencePage })));

const ConfiguracoesPage = createLazy(() => import('@/pages/dashboard/ConfiguracoesPage').then(m => ({ default: m.ConfiguracoesPage })));
const ChamadosPage = createLazy(() => import('@/pages/dashboard/ChamadosPage').then(m => ({ default: m.ChamadosPage })));
const EscalasPage = createLazy(() => import('@/pages/dashboard/EscalasPage').then(m => ({ default: m.EscalasPage })));
const CreateOcorrenciaPage = createLazy(() => import('@/pages/dashboard/CreateOcorrenciaPage').then(m => ({ default: m.CreateOcorrenciaPage })));

// Page wrapper com Suspense otimizado
const Page = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingScreen minimal />}>{children}</Suspense>
);

// Page wrapper com Suspense otimizado
const Page = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingScreen minimal />}>{children}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/setup',
    element: <SetupWizard />,
  },
  // Páginas em tela cheia (sem layout)
  {
    path: '/criar/ocorrencia/:tipo?',
    element: <Page><CreateOcorrenciaPage /></Page>,
  },
  {
    path: '/editar/ocorrencia/:id',
    element: <Page><EditOccurrencePage /></Page>,
  },
  {
    path: '/admin',
    element: <SuperAdminLayout />,
    children: [
      {
        path: '',
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Page><AdminDashboard /></Page>,
      },
      {
        path: 'instituicoes',
        element: <Page><AdminInstituicoes /></Page>,
      },
      {
        path: 'planos',
        element: <Page><AdminPlanos /></Page>,
      },
      {
        path: 'assinaturas',
        element: <Page><AdminAssinaturas /></Page>,
      },
      {
        path: 'suporte',
        element: <div className="p-8"><h1 className="text-3xl font-black">Central de Suporte</h1></div>,
      },
      {
        path: 'auditoria',
        element: <Page><AdminAuditoria /></Page>,
      },
      {
        path: 'configuracoes',
        element: <Page><AdminConfiguracoes /></Page>,
      },
    ]
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <Page><LoginPage /></Page>,
      },
      {
        path: '/registrar',
        element: <Page><RegisterPage /></Page>,
      },
    ],
  },
  {
    element: <DashboardLayout />,
    children: [
      {
        path: '/dashboard',
        element: <Page><DashboardGestor /></Page>,
      },
      // Operações (Agrupado)
      {
        path: '/ocorrencias',
        element: <Page><OcorrenciasPage /></Page>,
      },
      {
        path: '/chamados',
        element: <Page><ChamadosPage /></Page>,
      },
      {
        path: '/ocorrencias/embriaguez',
        element: <Page><OcorrenciasPage categoria="embriaguez" title="Operação Embriaguez ao Volante" /></Page>,
      },
      {
        path: '/ocorrencias/maria-da-penha',
        element: <Page><OcorrenciasPage categoria="maria_da_penha" title="Patrulha Maria da Penha" /></Page>,
      },
      {
        path: '/ocorrencias/chamados',
        element: <Page><OcorrenciasPage categoria="chamados" title="Ocorrências via Central/Chamados" /></Page>,
      },

      // Veículos
      {
        path: '/veiculos',
        element: <Page><VeiculosPage /></Page>,
      },
      {
        path: '/veiculos/km',
        element: <div className="p-8"><h1 className="text-3xl font-black">Controle de KM Diário</h1></div>,
      },
      {
        path: '/veiculos/vistorias',
        element: <div className="p-8"><h1 className="text-3xl font-black">Vistorias de Frota</h1></div>,
      },
      {
        path: '/veiculos/vincular',
        element: <div className="p-8"><h1 className="text-3xl font-black">Vincular Equipe a Viatura</h1></div>,
      },
      // Combustível
      {
        path: '/combustivel',
        element: <div className="p-8"><h1 className="text-3xl font-black">Dashboard de Combustível</h1></div>,
      },
      {
        path: '/combustivel/alertas',
        element: <div className="p-8"><h1 className="text-3xl font-black">Alertas de Abastecimento</h1></div>,
      },
      {
        path: '/combustivel/abastecimento',
        element: <div className="p-8"><h1 className="text-3xl font-black">Registro de Abastecimento</h1></div>,
      },
      {
        path: '/combustivel/mural',
        element: <div className="p-8"><h1 className="text-3xl font-black">Mural de Combustível</h1></div>,
      },
      {
        path: '/combustivel/vitorias',
        element: <div className="p-8"><h1 className="text-3xl font-black">Alertas Positivos (Reconhecimento)</h1></div>,
      },
      // Outros
      {
        path: '/equipes',
        element: <Page><EquipesPage /></Page>,
      },
      {
        path: '/escalas',
        element: <Page><EscalasPage /></Page>,
      },
      {
        path: '/relatorios',
        element: <div className="p-8"><h1 className="text-3xl font-black">Relatórios Gerenciais</h1></div>,
      },
      {
        path: '/usuarios',
        element: <div className="p-8"><h1 className="text-3xl font-black">Gestão de Usuários e Efetivo</h1></div>,
      },
      {
        path: '/assinatura',
        element: <Page><AssinaturaPage /></Page>,
      },
      {
        path: '/configuracoes',
        element: <Page><ConfiguracoesPage /></Page>,
      },
      {
        path: '/auditoria',
        element: <div className="p-8"><h1 className="text-3xl font-black">Logs de Auditoria</h1></div>,
      },
      // Sobre Mim
      {
        path: '/me/equipe',
        element: <div className="p-8"><h1 className="text-3xl font-black">Minha Equipe Atual</h1></div>,
      },
      {
        path: '/me/escala',
        element: <div className="p-8"><h1 className="text-3xl font-black">Minha Escala de Serviço</h1></div>,
      },
      {
        path: '/me/perfil',
        element: <div className="p-8"><h1 className="text-3xl font-black">Meus Dados Pessoais</h1></div>,
      },
    ],
  },
  {
    path: '*',
    element: <div className="flex h-screen items-center justify-center flex-col gap-4">
      <h1 className="text-6xl font-black text-slate-200">404</h1>
      <p className="text-slate-500 font-medium">Ops! Esta página não existe.</p>
      <Navigate to="/dashboard" />
    </div>,
  },
]);

