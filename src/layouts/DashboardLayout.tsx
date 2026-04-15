import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

export function DashboardLayout() {
  const { user, isLoading } = useAuthStore();

  // Enquanto verifica se o usuário está logado
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  // Se não estiver logado, redireciona para o login
  // COMENTADO temporariamente para você conseguir visualizar sem estar logado no Supabase
  // if (!user) {
  //   return <Navigate to="/login" replace />;
  // }

  return (
    <div className="flex min-h-screen w-full bg-slate-100">
      {/* Sidebar (Menu Lateral) entrará aqui futuramente */}
      <aside className="hidden w-64 border-r bg-white md:block">
        <div className="p-6">
          <span className="font-bold text-indigo-600 italic text-xl">LIVRO DIGITAL</span>
        </div>
        <nav className="px-4 space-y-2">
          <div className="p-2 text-sm font-medium hover:bg-slate-100 rounded-md cursor-pointer">Dashboard</div>
          <div className="p-2 text-sm font-medium hover:bg-slate-100 rounded-md cursor-pointer">Ocorrências</div>
          <div className="p-2 text-sm font-medium hover:bg-slate-100 rounded-md cursor-pointer">Equipes</div>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Header (Barra Superior) */}
        <header className="h-16 border-b bg-white flex items-center px-8 justify-between">
          <span className="text-sm font-semibold text-slate-700">Bem-vindo, Operador</span>
          <button className="text-xs text-red-500 font-medium">Sair</button>
        </header>

        {/* Área de Conteúdo */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
