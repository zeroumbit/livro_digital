import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Zap, 
  ShieldCheck, 
  Layers,
  ArrowRight,
  TrendingUp,
  XCircle
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ============================================================================
// PÁGINA: MINHA ASSINATURA (PERFIL GESTOR)
// ============================================================================

export function AssinaturaPage() {
  const { institution, setInstitution } = useAuthStore();
  const [propostas, setPropostas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usuariosCount, setUsuariosCount] = useState(0);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);

  useEffect(() => {
    const fetchUsuarios = async () => {
      if (!institution?.id) return;
      setLoadingUsuarios(true);
      try {
        const { count } = await supabase
          .from('usuarios')
          .select('*', { count: 'exact', head: true })
          .eq('instituicao_id', institution.id)
          .eq('status', 'ativo');
        setUsuariosCount(count || 0);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
      } finally {
        setLoadingUsuarios(false);
      }
    };
    fetchUsuarios();
  }, [institution?.id]);

  const fetchPropostas = async () => {
    if (!institution?.id) return;
    setIsLoading(true);
    const { data } = await supabase
      .from('assinaturas_propostas')
      .select('*, plano_novo:planos(*)')
      .eq('instituicao_id', institution.id)
      .eq('status', 'aguardando_gestor')
      .order('created_at', { ascending: false });
    
    setPropostas(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPropostas();
  }, [institution?.id]);

  const handleResponderProposta = async (id: string, status: 'aprovado' | 'recusado') => {
    try {
        const { error } = await supabase
            .from('assinaturas_propostas')
            .update({ status })
            .eq('id', id);

        if (error) throw error;

        if (status === 'aprovado') {
            toast.success('Plano atualizado com sucesso! Novos recursos liberados.');
            // Recarregar dados da instituição no store para refletir o novo plano
            const { data: updatedInst } = await supabase.from('instituicoes').select('*, planos(*)').eq('id', institution?.id).single();
            setInstitution(updatedInst);
        } else {
            toast.info('Proposta de alteração recusada.');
        }

        fetchPropostas();
    } catch (e: any) {
        toast.error(e.message);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Assinatura do Sistema</h1>
        <p className="text-slate-500 font-medium text-lg mt-1">Gerencie seu plano, faturamento e recursos disponíveis.</p>
      </div>

      {/* ALERTAS DE MUDANÇA (PASSO 3 DA SPEC) */}
      {propostas.map((proposta) => (
          <div key={proposta.id} className="bg-indigo-600 rounded-[2.5rem] p-8 sm:p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-600/30 animate-pulse-slow">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                  <Zap className="w-32 h-32" />
              </div>
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="max-w-xl">
                      <div className="flex items-center space-x-2 mb-4">
                          <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">Upgrade Disponível</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-4">
                        A administração do SaaS propôs uma atualização para o plano {proposta.plano_novo?.nome}
                      </h2>
                      <p className="text-indigo-100 font-medium leading-relaxed">
                        Novos limites: {proposta.plano_novo?.limite_usuarios} usuários. 
                        Módulos incluídos: {proposta.plano_novo?.modulos_ativos?.join(', ')}.
                      </p>
                      <div className="mt-6 flex items-baseline">
                          <span className="text-3xl font-black">R$ {proposta.plano_novo?.valor_mensal.toFixed(2)}</span>
                          <span className="ml-2 text-indigo-300 font-bold text-xs uppercase">/ mês</span>
                      </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={() => handleResponderProposta(proposta.id, 'recusado')}
                        className="h-14 px-8 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all backdrop-blur-md border border-white/20"
                      >
                        Recusar
                      </button>
                      <button 
                        onClick={() => handleResponderProposta(proposta.id, 'aprovado')}
                        className="h-14 px-10 bg-white text-indigo-600 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-50 transition-all flex items-center justify-center"
                      >
                        Aprovar Mudança <ArrowRight className="w-4 h-4 ml-3" />
                      </button>
                  </div>
              </div>
          </div>
      ))}

      {/* PLANO ATUAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 sm:p-12 shadow-sm">
                  <div className="flex justify-between items-start mb-10">
                      <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Seu Plano Atual</p>
                          <h3 className="text-4xl font-black text-slate-900 tracking-tight">{institution?.planos?.nome || 'Trial / Cortesia'}</h3>
                      </div>
                      <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300">
                          <ShieldCheck className="w-8 h-8" />
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status da Conta</p>
                          <div className="flex items-center text-emerald-600 font-black text-lg">
                              <CheckCircle2 className="w-5 h-5 mr-2" /> Ativa
                          </div>
                      </div>
          <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Próximo Faturamento</p>
                           <div className="flex items-center text-slate-700 font-black text-lg uppercase tracking-tight">
                               <Clock className="w-5 h-5 mr-2 text-slate-400" /> {institution?.proxima_cobranca ? new Date(institution.proxima_cobranca).toLocaleDateString('pt-BR') : '---'}
                           </div>
                       </div>
                  </div>

                  <div className="space-y-4 pt-10 border-t border-slate-50">
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Recursos Habilitados</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {institution?.planos?.modulos_ativos?.map((m: string) => (
                              <div key={m} className="flex items-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                  <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mr-3">
                                      <CheckCircle2 className="w-4 h-4" />
                                  </div>
                                  <span className="text-sm font-bold text-slate-700 capitalize">{m}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>

          <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
                   <TrendingUp className="w-10 h-10 text-indigo-400 mb-6" />
                   <h4 className="text-xl font-black mb-4">Uso da Cota</h4>
                   <div className="space-y-6">
                       {loadingUsuarios ? (
                         <div className="animate-pulse">
                           <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                           <div className="h-2 bg-white/10 rounded w-full"></div>
                         </div>
                       ) : (
                       <div>
                           <div className="flex justify-between text-xs font-bold mb-2">
                               <span className="text-slate-400">Usuários Ativos</span>
                               <span>{usuariosCount} / {institution?.planos?.limite_usuarios || 50}</span>
                           </div>
                           <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                               <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${usuariosCount > 0 ? (usuariosCount / (institution?.planos?.limite_usuarios || 50)) * 100 : 0}%` }}></div>
                           </div>
                       </div>
                       )}
                       <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-widest">
                           Ao atingir o limite, novos usuários não poderão ser cadastrados sem um upgrade de plano.
                       </p>
                   </div>
               </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm text-center">
                  <CreditCard className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                  <h4 className="font-black text-slate-900 mb-2">Método de Pagamento</h4>
                  <p className="text-xs text-slate-500 mb-6">Cartão final **** 4421 (Padrão)</p>
                  <button className="text-[11px] font-black text-indigo-600 uppercase tracking-widest underline underline-offset-4">Alterar Cartão</button>
              </div>
          </div>

      </div>

    </div>
  );
}
