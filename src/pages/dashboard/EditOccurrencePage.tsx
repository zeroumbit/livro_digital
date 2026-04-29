import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { OcorrenciaMultiStepForm } from '@/components/forms/OcorrenciaMultiStepForm';
import { MariaDaPenhaForm } from '@/components/forms/MariaDaPenhaForm';
import { OriginalLoader } from '@/components/ui/OriginalLoader';
import { toast } from 'sonner';

interface EditOccurrencePageProps {
  tipo?: 'padrao' | 'embriaguez' | 'maria_da_penha' | 'chamados';
}

export function EditOccurrencePage({ tipo = 'padrao' }: EditOccurrencePageProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [occurrence, setOccurrence] = useState<any>(null);

  useEffect(() => {
    async function fetchOccurrence() {
      if (!id) return;
      
      let data: any = null;
      let error: any = null;
      let tableName = '';
      let categoria = tipo;

      // Buscar APENAS na tabela correspondente ao tipo
      if (tipo === 'embriaguez') {
        tableName = 'embriaguez';
        const result = await supabase
          .from(tableName)
          .select('*')
          .eq('id', id)
          .maybeSingle();
        data = result.data;
        error = result.error;
      } else if (tipo === 'maria_da_penha') {
        tableName = 'maria_da_penha';
        const result = await supabase
          .from(tableName)
          .select('*')
          .eq('id', id)
          .maybeSingle();
        data = result.data;
        error = result.error;
      } else if (tipo === 'chamados') {
        tableName = 'chamados_ocorrencias';
        const result = await supabase
          .from(tableName)
          .select('*')
          .eq('id', id)
          .maybeSingle();
        data = result.data;
        error = result.error;
      } else {
        tableName = 'ocorrencias';
        const result = await supabase
          .from(tableName)
          .select('*')
          .eq('id', id)
          .maybeSingle();
        data = result.data;
        error = result.error;
      }

      if (error || !data) {
        toast.error('Registro não encontrado nesta categoria');
        navigate(`/ocorrencias${tipo !== 'padrao' ? `/${tipo.replace('_', '-')}` : ''}`);
        return;
      }

      data.categoria = categoria;
      setOccurrence(data);
      setLoading(false);
    }

    fetchOccurrence();
  }, [id, navigate, tipo]);

  if (loading) return <OriginalLoader />;

  // Redirecionar para a página correta após salvar
  const handleSuccess = () => {
    toast.success('Ocorrência atualizada com sucesso!');
    const basePath = `/ocorrencias${tipo !== 'padrao' ? `/${tipo.replace('_', '-')}` : ''}`;
    navigate(basePath);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {tipo === 'maria_da_penha' ? (
        <MariaDaPenhaForm
          initialData={occurrence}
          onClose={() => navigate(`/ocorrencias/maria-da-penha`)} 
          onSuccess={handleSuccess} 
        />
      ) : tipo === 'chamados' ? (
        <OcorrenciaMultiStepForm 
          initialData={occurrence}
          onClose={() => navigate('/ocorrencias/chamados')} 
          onSuccess={handleSuccess}
          categoria="chamados"
        />
      ) : (
        <OcorrenciaMultiStepForm 
          initialData={occurrence}
          onClose={() => navigate('/ocorrencias')} 
          onSuccess={handleSuccess}
          categoria={tipo}
        />
      )}
    </div>
  );
}
