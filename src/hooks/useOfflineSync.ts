import { useEffect, useCallback, useRef } from 'react';
import { useOfflineStore } from '@/store/useOfflineStore';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useOfflineSync() {
  const { queue, isOnline, removeFromQueue, setOnlineStatus } = useOfflineStore();
  const isSyncing = useRef(false);

  const syncItem = useCallback(async (item: any) => {
    try {
      let error;
      if (item.action === 'insert') {
        const { error: insertError } = await supabase.from(item.tableName).upsert([{ ...item.data, id: item.id }]);
        error = insertError;
      } else {
        const { error: updateError } = await supabase.from(item.tableName).update(item.data).eq('id', item.id);
        error = updateError;
      }

      if (!error) {
        // Sync related data if any
        if (item.related && item.related.items.length > 0) {
          const { error: relError } = await supabase
            .from(item.related.tableName)
            .delete()
            .eq(item.related.foreignKey, item.id);
          
          if (!relError) {
            await supabase.from(item.related.tableName).insert(
              item.related.items.map((i: any) => ({ ...i, [item.related.foreignKey]: item.id }))
            );
          }
        }
        
        removeFromQueue(item.id);
        return true;
      } else {
        console.error('Sync error:', error);
        return false;
      }
    } catch (err) {
      console.error('Sync failed:', err);
      return false;
    }
  }, [removeFromQueue]);

  const processQueue = useCallback(async () => {
    if (isSyncing.current || queue.length === 0 || !isOnline) return;
    
    isSyncing.current = true;
    toast.info(`Sincronizando ${queue.length} item(ns) pendente(s)...`);
    
    let successCount = 0;
    for (const item of queue) {
      const success = await syncItem(item);
      if (success) successCount++;
    }

    if (successCount > 0) {
      toast.success(`${successCount} item(ns) sincronizados com sucesso!`);
    }
    
    isSyncing.current = false;
  }, [queue, isOnline, syncItem]);

  useEffect(() => {
    const handleOnline = () => {
      setOnlineStatus(true);
      toast.success('Conexão restabelecida! Sincronizando dados...');
    };
    const handleOffline = () => {
      setOnlineStatus(false);
      toast.warning('Você está offline. As alterações serão salvas localmente.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);

  useEffect(() => {
    if (isOnline && queue.length > 0) {
      const timer = setTimeout(() => {
        processQueue();
      }, 3000); // Wait 3 seconds after coming online
      return () => clearTimeout(timer);
    }
  }, [isOnline, queue.length, processQueue]);

  return { isOnline, pendingCount: queue.length };
}
