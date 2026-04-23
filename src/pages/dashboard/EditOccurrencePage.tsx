import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { OcorrenciaMultiStepForm } from '@/components/forms/OcorrenciaMultiStepForm';
import { OriginalLoader } from '@/components/ui/OriginalLoader';
import { toast } from 'sonner';

export function EditOccurrencePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [occurrence, setOccurrence] = useState<any>(null);

  useEffect(() => {
    async function fetchOccurrence() {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('ocorrencias')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        toast.error('Ocorrência não encontrada');
        navigate('/ocorrencias');
        return;
      }

      setOccurrence(data);
      setLoading(false);
    }

    fetchOccurrence();
  }, [id, navigate]);

  if (loading) return <OriginalLoader />;

  return (
    <div className="min-h-screen bg-slate-100">
      <OcorrenciaMultiStepForm 
        initialData={occurrence}
        onClose={() => navigate('/ocorrencias')} 
        onSuccess={() => {
          toast.success('Ocorrência atualizada com sucesso!');
          navigate('/ocorrencias');
        }} 
      />
    </div>
  );
}
