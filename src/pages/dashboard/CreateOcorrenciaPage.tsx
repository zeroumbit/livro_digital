import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OcorrenciaMultiStepForm } from '@/components/forms/OcorrenciaMultiStepForm';
import { MariaDaPenhaForm } from '@/components/forms/MariaDaPenhaForm';
import { toast } from 'sonner';

const CATEGORIAS: Record<string, { defaultCategoria: 'padrao' | 'maria_da_penha' | 'embriaguez' | 'chamados'; title: string }> = {
  'padrao': { defaultCategoria: 'padrao', title: 'Nova Ocorrência Padrão' },
  'embriaguez': { defaultCategoria: 'embriaguez', title: 'Operação Embriaguez ao Volante' },
  'maria-da-penha': { defaultCategoria: 'maria_da_penha', title: 'Ocorrência Maria da Penha' },
  'maria_da_penha': { defaultCategoria: 'maria_da_penha', title: 'Ocorrência Maria da Penha' },
  'chamados': { defaultCategoria: 'chamados', title: 'Ocorrência via Chamado' },
};

export function CreateOcorrenciaPage() {
  const { tipo } = useParams<{ tipo: string }>();
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState<'padrao' | 'maria_da_penha' | 'embriaguez' | 'chamados'>('padrao');

  useEffect(() => {
    const cat = tipo?.toLowerCase().replace(/-/g, '_') || 'padrao';
    if (cat === 'embriaguez' || cat === 'maria_da_penha' || cat === 'padrao' || cat === 'chamados') {
      setCategoria(cat as any);
    } else {
      toast.error('Tipo de ocorrência inválido');
      navigate('/ocorrencias');
    }
  }, [tipo, navigate]);

  const handleClose = () => {
    const redirectPath = 
      categoria === 'embriaguez' ? '/ocorrencias/embriaguez' :
      categoria === 'maria_da_penha' ? '/ocorrencias/maria-da-penha' :
      categoria === 'chamados' ? '/ocorrencias/chamados' :
      '/ocorrencias';
    navigate(redirectPath);
  };

  const handleSuccess = () => {
    toast.success('Ocorrência registrada com sucesso!');
    const redirectPath = 
      categoria === 'embriaguez' ? '/ocorrencias/embriaguez' :
      categoria === 'maria_da_penha' ? '/ocorrencias/maria-da-penha' :
      categoria === 'chamados' ? '/ocorrencias/chamados' :
      '/ocorrencias';
    navigate(redirectPath);
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