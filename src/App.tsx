import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';

import { useOfflineSync } from './hooks/useOfflineSync';

function App() {
  const initializeAuth = useAuthStore((state) => state.initialize);
  useOfflineSync();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}

export default App;
