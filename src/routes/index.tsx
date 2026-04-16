import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';

// Páginas (Criaremos os esqueletos a seguir)
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { SetupWizard } from '@/pages/onboarding/SetupWizard';
// import { DashboardPage } from '@/pages/dashboard/DashboardPage';

import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminInstituicoes } from '@/pages/admin/AdminInstituicoes';
import { AdminPlanos } from '@/pages/admin/AdminPlanos';
import { AdminAssinaturas } from '@/pages/admin/AdminAssinaturas';
import { AdminAuditoria } from '@/pages/admin/AdminAuditoria';
import { AdminConfiguracoes } from '@/pages/admin/AdminConfiguracoes';
import { EquipesPage } from '@/pages/dashboard/EquipesPage';
import { AssinaturaPage } from '@/pages/dashboard/AssinaturaPage';
import { VeiculosPage } from '@/pages/dashboard/VeiculosPage';
import { OcorrenciasPage } from '@/pages/dashboard/OcorrenciasPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/setup',
    element: <SetupWizard />,
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
        element: <AdminDashboard />,
      },
      {
        path: 'instituicoes',
        element: <AdminInstituicoes />,
      },
      {
        path: 'planos',
        element: <AdminPlanos />,
      },
      {
        path: 'assinaturas',
        element: <AdminAssinaturas />,
      },
      {
        path: 'suporte',
        element: <div className="p-8"><h1 className="text-3xl font-black">Central de Suporte</h1></div>,
      },
      {
        path: 'auditoria',
        element: <AdminAuditoria />,
      },
      {
        path: 'configuracoes',
        element: <AdminConfiguracoes />,
      },
    ]
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/registrar',
        element: <RegisterPage />,
      },
    ],
  },
  {
    element: <DashboardLayout />,
    children: [
      {
        path: '/dashboard',
        element: <div className="space-y-6">
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Painel de Controle</h1>
          <p className="text-slate-500 font-medium">Benvindo à Central de Operações.</p>
        </div>,
      },
      {
        path: '/ocorrencias',
        element: <OcorrenciasPage />,
      },
      {
        path: '/veiculos',
        element: <VeiculosPage />,
      },
      {
        path: '/equipes',
        element: <EquipesPage />,
      },
      {
        path: '/assinatura',
        element: <AssinaturaPage />,
      },
      {
        path: '/configuracoes',
        element: <div className="p-8"><h1 className="text-3xl font-black text-slate-900 tracking-tight">Configurações Locais</h1></div>,
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
