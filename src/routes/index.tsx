import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import SuperAdminLayout from '@/layouts/SuperAdminLayout';

// Páginas com Lazy Loading
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const SetupWizard = lazy(() => import('@/pages/onboarding/SetupWizard').then(m => ({ default: m.SetupWizard })));

const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminInstituicoes = lazy(() => import('@/pages/admin/AdminInstituicoes').then(m => ({ default: m.AdminInstituicoes })));
const AdminPlanos = lazy(() => import('@/pages/admin/AdminPlanos').then(m => ({ default: m.AdminPlanos })));
const AdminAssinaturas = lazy(() => import('@/pages/admin/AdminAssinaturas').then(m => ({ default: m.AdminAssinaturas })));
const AdminAuditoria = lazy(() => import('@/pages/admin/AdminAuditoria').then(m => ({ default: m.AdminAuditoria })));
const AdminConfiguracoes = lazy(() => import('@/pages/admin/AdminConfiguracoes').then(m => ({ default: m.AdminConfiguracoes })));

const DashboardGestor = lazy(() => import('@/pages/dashboard/DashboardGestor').then(m => ({ default: m.DashboardGestor })));
const EquipesPage = lazy(() => import('@/pages/dashboard/EquipesPage').then(m => ({ default: m.EquipesPage })));
const AssinaturaPage = lazy(() => import('@/pages/dashboard/AssinaturaPage').then(m => ({ default: m.AssinaturaPage })));
const VeiculosPage = lazy(() => import('@/pages/dashboard/VeiculosPage').then(m => ({ default: m.VeiculosPage })));
const OcorrenciasPage = lazy(() => import('@/pages/dashboard/OcorrenciasPage').then(m => ({ default: m.OcorrenciasPage })));
const EditOccurrencePage = lazy(() => import('@/pages/dashboard/EditOccurrencePage').then(m => ({ default: m.EditOccurrencePage })));

const ConfiguracoesPage = lazy(() => import('@/pages/dashboard/ConfiguracoesPage').then(m => ({ default: m.ConfiguracoesPage })));
const ChamadosPage = lazy(() => import('@/pages/dashboard/ChamadosPage').then(m => ({ default: m.ChamadosPage })));
const EscalasPage = lazy(() => import('@/pages/dashboard/EscalasPage').then(m => ({ default: m.EscalasPage })));
const CreateOcorrenciaPage = lazy(() => import('@/pages/dashboard/CreateOcorrenciaPage').then(m => ({ default: m.CreateOcorrenciaPage })));

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
    element: <CreateOcorrenciaPage />,
  },
  {
    path: '/editar/ocorrencia/:id',
    element: <EditOccurrencePage />,
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
        element: <OcorrenciasPage categoria="embriaguez" title="Operação Embriaguez ao Volante" />,
      },
      {
        path: '/ocorrencias/maria-da-penha',
        element: <OcorrenciasPage categoria="maria_da_penha" title="Patrulha Maria da Penha" />,
      },
      {
        path: '/ocorrencias/chamados',
        element: <OcorrenciasPage categoria="chamados" title="Ocorrências via Central/Chamados" />,
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
        element: <EscalasPage />,
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

