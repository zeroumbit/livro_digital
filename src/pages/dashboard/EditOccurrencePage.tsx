import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { OcorrenciaMultiStepForm } from '@/components/forms/OcorrenciaMultiStepForm';
import { MariaDaPenhaForm } from '@/components/forms/MariaDaPenhaForm';
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
      
      // Tenta primeiro em ocorrencias padrão
      let { data, error } = await supabase
        .from('ocorrencias')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      // Se não encontrar, tenta na tabela de embriaguez
      if (!data && !error) {
        const { data: embData, error: embError } = await supabase
          .from('embriaguez')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        data = embData;
        error = embError;
        if (data) data.categoria = 'embriaguez';
      }

      // Se ainda não encontrou, tenta em maria_da_penha
      if (!data && !error) {
        const { data: mdpData, error: mdpError } = await supabase
          .from('maria_da_penha')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        data = mdpData;
        error = mdpError;
        if (data) data.categoria = 'maria_da_penha';
      }

      if (error || !data) {
        toast.error('Registro não encontrado');
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
      {occurrence.categoria === 'maria_da_penha' ? (
        <MariaDaPenhaForm
          initialData={occurrence}
          onClose={() => navigate('/ocorrencias')} 
          onSuccess={() => {
            toast.success('Ocorrência atualizada com sucesso!');
            navigate('/ocorrencias');
          }} 
        />
      ) : (
        <OcorrenciaMultiStepForm 
          initialData={occurrence}
          onClose={() => navigate('/ocorrencias')} 
          onSuccess={() => {
            toast.success('Ocorrência atualizada com sucesso!');
            navigate('/ocorrencias');
          }} 
        />
      )}
    </div>
  );
}
