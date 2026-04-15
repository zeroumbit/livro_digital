import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';

// Páginas (Criaremos os esqueletos a seguir)
// import { LoginPage } from '@/pages/auth/LoginPage';
// import { RegisterPage } from '@/pages/auth/RegisterPage';
// import { DashboardPage } from '@/pages/dashboard/DashboardPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <div className="p-8"><h1 className="text-2xl font-bold mb-4">Acesse sua conta</h1><p className="text-slate-500">Módulo de autenticação em construção.</p></div>,
      },
      {
        path: '/registrar',
        element: <div className="p-8"><h1 className="text-2xl font-bold mb-4">Cadastro de Instituição</h1><p className="text-slate-500">Fluxo de registro em construção.</p></div>,
      },
    ],
  },
  {
    element: <DashboardLayout />,
    children: [
      {
        path: '/dashboard',
        element: <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Total Ocorrências</p>
              <h3 className="text-3xl font-bold mt-1">128</h3>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Em Aberto</p>
              <h3 className="text-3xl font-bold mt-1">12</h3>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Média de Resposta</p>
              <h3 className="text-3xl font-bold mt-1">14min</h3>
            </div>
          </div>
        </div>,
      },
      {
        path: '/ocorrencias',
        element: <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Módulo de Ocorrências</h1>
          <p className="text-slate-500 text-lg">Gerenciamento e registro de eventos operacionais.</p>
        </div>,
      },
      {
        path: '/chamados',
        element: <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Módulo de Chamados</h1>
          <p className="text-slate-500 text-lg">Central de despacho e atendimento em tempo real.</p>
        </div>,
      },
      {
        path: '/configuracoes',
        element: <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">Configurações do Sistema</h1>
          <p className="text-slate-500 text-lg">Personalize sua experiência e gerencie preferências.</p>
        </div>,
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
