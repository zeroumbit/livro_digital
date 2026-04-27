import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OcorrenciaMultiStepForm } from '@/components/forms/OcorrenciaMultiStepForm';
import { MariaDaPenhaForm } from '@/components/forms/MariaDaPenhaForm';
import { toast } from 'sonner';

const CATEGORIAS: Record<string, { defaultCategoria: 'padrao' | 'maria_da_penha' | 'embriaguez'; title: string }> = {
  'padrao': { defaultCategoria: 'padrao', title: 'Nova Ocorrência Padrão' },
  'embriaguez': { defaultCategoria: 'embriaguez', title: 'Operação Embriaguez ao Volante' },
  'maria-da-penha': { defaultCategoria: 'maria_da_penha', title: 'Ocorrência Maria da Penha' },
  'maria_da_penha': { defaultCategoria: 'maria_da_penha', title: 'Ocorrência Maria da Penha' },
};

export function CreateOcorrenciaPage() {
  const { tipo } = useParams<{ tipo: string }>();
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState<'padrao' | 'maria_da_penha' | 'embriaguez'>('padrao');

  useEffect(() => {
    const cat = tipo?.toLowerCase().replace(/-/g, '_') || 'padrao';
    if (cat === 'embriaguez' || cat === 'maria_da_penha' || cat === 'padrao') {
      setCategoria(cat);
    } else {
      toast.error('Tipo de ocorrência inválido');
      navigate('/ocorrencias');
    }
  }, [tipo, navigate]);

  const handleClose = () => {
    navigate('/ocorrencias');
  };

  const handleSuccess = () => {
    toast.success('Ocorrência registrada com sucesso!');
    navigate('/ocorrencias');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {categoria === 'maria_da_penha' ? (
        <MariaDaPenhaForm 
          onClose={handleClose} 
          onSuccess={handleSuccess}
        />
      ) : (
        <OcorrenciaMultiStepForm 
          onClose={handleClose} 
          onSuccess={handleSuccess}
          defaultCategoria={categoria}
          categoriaLabel={tipo || 'padrao'}
        />
      )}
    </div>
  );
}