import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

// Componente de preload para cache instantâneo
const PreloadLink = ({ to }: { to: string }) => {
  if (typeof window !== 'undefined') {
    import('@/pages/dashboard/ChamadosPage').catch(() => {});
    import('@/pages/dashboard/OcorrenciasPadraoPage').catch(() => {});
  }
  return null;
};

// Páginas com Lazy Loading otimizado
const createLazy = (factory: () => Promise<{ default: React.ComponentType<any> }>) => 
  lazy(factory);

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
  const InstituicaoPage = createLazy(() => import('@/pages/dashboard/InstituicaoPage').then(m => ({ default: m.InstituicaoPage })));
const VeiculosPage = createLazy(() => import('@/pages/dashboard/VeiculosPage').then(m => ({ default: m.VeiculosPage })));
const OcorrenciasPadraoPage = createLazy(() => import('@/pages/dashboard/OcorrenciasPadraoPage').then(m => ({ default: m.OcorrenciasPadraoPage })));
const EmbriaguezPage = createLazy(() => import('@/pages/dashboard/EmbriaguezPage').then(m => ({ default: m.EmbriaguezPage })));
const MariaDaPenhaPage = createLazy(() => import('@/pages/dashboard/MariaDaPenhaPage').then(m => ({ default: m.MariaDaPenhaPage })));
const ChamadosOcorrenciasPage = createLazy(() => import('@/pages/dashboard/ChamadosOcorrenciasPage').then(m => ({ default: m.ChamadosOcorrenciasPage })));
const EditOccurrencePage = createLazy(() => import('@/pages/dashboard/EditOccurrencePage').then(m => ({ default: m.EditOccurrencePage })));

const ConfiguracoesPage = createLazy(() => import('@/pages/dashboard/ConfiguracoesPage').then(m => ({ default: m.ConfiguracoesPage })));
const ChamadosPage = createLazy(() => import('@/pages/dashboard/ChamadosPage').then(m => ({ default: m.ChamadosPage })));
const EscalasPage = createLazy(() => import('@/pages/dashboard/EscalasPage').then(m => ({ default: m.EscalasPage })));
const CreateOcorrenciaPage = createLazy(() => import('@/pages/dashboard/CreateOcorrenciaPage').then(m => ({ default: m.CreateOcorrenciaPage })));
const ProfilePage = createLazy(() => import('@/pages/dashboard/ProfilePage').then(m => ({ default: m.ProfilePage })));
const MeEquipePage = createLazy(() => import('@/pages/dashboard/MeEquipePage').then(m => ({ default: m.MeEquipePage })));
const MeEscalaPage = createLazy(() => import('@/pages/dashboard/MeEscalaPage').then(m => ({ default: m.MeEscalaPage })));
const KmDiarioPage = createLazy(() => import('@/pages/dashboard/KmDiarioPage').then(m => ({ default: m.KmDiarioPage })));
const VistoriasPage = createLazy(() => import('@/pages/dashboard/VistoriasPage').then(m => ({ default: m.VistoriasPage })));
const VincularViaturaPage = createLazy(() => import('@/pages/dashboard/VincularViaturaPage').then(m => ({ default: m.VincularViaturaPage })));
const CombustivelDashboardPage = createLazy(() => import('@/pages/dashboard/CombustivelDashboardPage').then(m => ({ default: m.CombustivelDashboardPage })));
const AbastecimentoPage = createLazy(() => import('@/pages/dashboard/AbastecimentoPage').then(m => ({ default: m.AbastecimentoPage })));
const MuralCombustivelPage = createLazy(() => import('@/pages/dashboard/MuralCombustivelPage').then(m => ({ default: m.MuralCombustivelPage })));
const AlertasCombustivelPage = createLazy(() => import('@/pages/dashboard/AlertasCombustivelPage').then(m => ({ default: m.AlertasCombustivelPage })));
const VitoriasPage = createLazy(() => import('@/pages/dashboard/VitoriasPage').then(m => ({ default: m.VitoriasPage })));
const UsuariosPage = createLazy(() => import('@/pages/dashboard/UsuariosPage').then(m => ({ default: m.UsuariosPage })));

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
    // Páginas em tela cheia (sem layout) - Edição isolada por tipo
    {
      path: '/criar/ocorrencia/:tipo?',
      element: <Page><CreateOcorrenciaPage /></Page>,
    },
    {
      path: '/editar/ocorrencia/padrao/:id',
      element: <Page><EditOccurrencePage tipo="padrao" /></Page>,
    },
    {
      path: '/editar/ocorrencia/embriaguez/:id',
      element: <Page><EditOccurrencePage tipo="embriaguez" /></Page>,
    },
    {
      path: '/editar/ocorrencia/maria-da-penha/:id',
      element: <Page><EditOccurrencePage tipo="maria_da_penha" /></Page>,
    },
    {
      path: '/editar/ocorrencia/chamados/:id',
      element: <Page><EditOccurrencePage tipo="chamados" /></Page>,
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
      // Operações - Páginas Isoladas por Tipo
      {
        path: '/ocorrencias',
        element: <Page><OcorrenciasPage categoria="padrao" title="Ocorrências Padrão" /></Page>,
      },
      {
        path: '/ocorrencias/embriaguez',
        element: <Page><OcorrenciasPage categoria="embriaguez" title="Operação Embriaguez" /></Page>,
      },
      {
        path: '/ocorrencias/maria-da-penha',
        element: <Page><OcorrenciasPage categoria="maria_da_penha" title="Patrulha Maria da Penha" /></Page>,
      },
      {
        path: '/ocorrencias/chamados',
        element: <Page><ChamadosOcorrenciasPage /></Page>,
      },
      {
        path: '/chamados',
        element: <Page><ChamadosPage /></Page>,
      },

      // Veículos
      {
        path: '/veiculos',
        element: <Page><VeiculosPage /></Page>,
      },
      {
        path: '/veiculos/km',
        element: <Page><KmDiarioPage /></Page>,
      },
      {
        path: '/veiculos/vistorias',
        element: <Page><VistoriasPage /></Page>,
      },
      {
        path: '/veiculos/vincular',
        element: <Page><VincularViaturaPage /></Page>,
      },
      // Combustível
      {
        path: '/combustivel',
        element: <Page><CombustivelDashboardPage /></Page>,
      },
      {
        path: '/combustivel/alertas',
        element: <Page><AlertasCombustivelPage /></Page>,
      },
      {
        path: '/combustivel/abastecimento',
        element: <Page><AbastecimentoPage /></Page>,
      },
      {
        path: '/combustivel/mural',
        element: <Page><MuralCombustivelPage /></Page>,
      },
      {
        path: '/combustivel/vitorias',
        element: <Page><VitoriasPage /></Page>,
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
        element: <Page><UsuariosPage /></Page>,
      },
       {
         path: '/instituicao',
         element: <Page><InstituicaoPage /></Page>,
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
        element: <Page><MeEquipePage /></Page>,
      },
      {
        path: '/me/escala',
        element: <Page><MeEscalaPage /></Page>,
      },
      {
        path: '/me/perfil',
        element: <Page><ProfilePage /></Page>,
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

