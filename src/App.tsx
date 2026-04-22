import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { Toaster } from 'sonner';
import { useEffect, Suspense } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { OriginalLoader } from './components/ui/OriginalLoader';

function App() {
  const initializeAuth = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <>
      <RouterProvider router={router} />
      {/* O Sonner gerencia as notificações Toast do sistema */}
      <Toaster position="top-right" richColors closeButton />
    </>
  );

}



export default App;
