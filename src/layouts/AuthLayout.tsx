import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen w-full bg-[#f8fafc]">
      {/* 
         Removido max-w-md e cabeçalho antigo para permitir que as páginas de Auth 
         expandam e utilizem seus próprios layouts premium e responsivos.
      */}
      <Outlet />
    </div>
  );
}
