import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';

// Páginas (Criaremos os esqueletos a seguir)
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { SetupWizard } from '@/pages/onboarding/SetupWizard';

import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminInstituicoes } from '@/pages/admin/AdminInstituicoes';
import { AdminPlanos } from '@/pages/admin/AdminPlanos';
import { AdminAssinaturas } from '@/pages/admin/AdminAssinaturas';
import { AdminAuditoria } from '@/pages/admin/AdminAuditoria';
import { AdminConfiguracoes } from '@/pages/admin/AdminConfiguracoes';

import { DashboardGestor } from '@/pages/dashboard/DashboardGestor';
import { EquipesPage } from '@/pages/dashboard/EquipesPage';
import { AssinaturaPage } from '@/pages/dashboard/AssinaturaPage';
import { VeiculosPage } from '@/pages/dashboard/VeiculosPage';
import { OcorrenciasPage } from '@/pages/dashboard/OcorrenciasPage';
import { ConfiguracoesPage } from '@/pages/dashboard/ConfiguracoesPage';
import { ChamadosPage } from '@/pages/dashboard/ChamadosPage';

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
        element: <DashboardGestor />,
      },
      // Operações (Agrupado)
      {
        path: '/ocorrencias',
        element: <OcorrenciasPage />,
      },
      {
        path: '/chamados',
        element: <ChamadosPage />,
      },
      {
        path: '/ocorrencias/embriaguez',
        element: <div className="p-8"><h1 className="text-3xl font-black">Operação Embriaguez ao Volante</h1></div>,
      },
      {
        path: '/ocorrencias/maria-da-penha',
        element: <div className="p-8"><h1 className="text-3xl font-black">Patrulha Maria da Penha</h1></div>,
      },
      // Veículos
      {
        path: '/veiculos',
        element: <VeiculosPage />,
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
        element: <EquipesPage />,
      },
      {
        path: '/escalas',
        element: <div className="p-8"><h1 className="text-3xl font-black">Gestão de Escalas</h1></div>,
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
        element: <AssinaturaPage />,
      },
      {
        path: '/configuracoes',
        element: <ConfiguracoesPage />,
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
