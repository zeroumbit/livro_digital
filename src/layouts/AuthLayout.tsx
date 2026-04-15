import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Aqui futuramente podemos colocar a logo da plataforma */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            LIVRO DIGITAL
          </h1>
          <p className="text-sm text-slate-500">Plataforma para Guardas Municipais</p>
        </div>
        
        <Outlet />
      </div>
    </div>
  );
}
