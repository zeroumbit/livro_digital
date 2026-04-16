import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  ArrowUpRight, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  MoreVertical,
  Calendar,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ============================================================================
// PÁGINA: GESTÃO DE ASSINATURAS E FATURAMENTO (SUPER ADMIN)
// ============================================================================

export function AdminAssinaturas() {
  const [assinaturas, setAssinaturas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssinaturas = async () => {
    setIsLoading(true);
    // Buscamos as instituições e seus planos vinculados
    const { data, error } = await supabase
      .from('instituicoes')
      .select('*, planos(nome, valor_mensal)')
      .order('created_at', { ascending: false });
    
    if (error) {
        toast.error('Erro ao carregar assinaturas');
    } else {
        setAssinaturas(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAssinaturas();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded">Revenue Center</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Assinaturas</h1>
            <p className="text-slate-500 font-medium text-lg mt-1">Controle de faturamento, ciclos de trial e pagamentos.</p>
          </div>
          
          <div className="flex items-center space-x-3">
              <div className="bg-white border border-slate-200 rounded-2xl p-1.5 flex items-center shadow-sm">
                  <div className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest">Todos</div>
                  <div className="px-5 py-2.5 text-slate-400 text-xs font-black uppercase tracking-widest hover:text-slate-600 cursor-pointer">Atrasados</div>
                  <div className="px-5 py-2.5 text-slate-400 text-xs font-black uppercase tracking-widest hover:text-slate-600 cursor-pointer">Trial</div>
              </div>
          </div>
      </div>

      {/* LISTA DE ASSINATURAS */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                        <th className="px-8 py-6">Instituição</th>
                        <th className="px-8 py-6">Plano Atual</th>
                        <th className="px-8 py-6">Status Financeiro</th>
                        <th className="px-8 py-6">Vencimento</th>
                        <th className="px-8 py-6 text-right">Valor</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {assinaturas.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                            <td className="px-8 py-6">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-black text-xs mr-4 border border-slate-200">
                                        {item.razao_social.substring(0,2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{item.razao_social}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">ID: {item.id.substring(0,8)}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <div className="flex items-center">
                                    <span className="text-xs font-black text-slate-600 bg-slate-100 px-2 py-1 rounded shadow-sm border border-slate-200 uppercase tracking-widest">{item.planos?.nome || 'Trial'}</span>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <div className={`flex items-center text-[10px] font-black uppercase tracking-widest ${
                                    item.status_assinatura === 'ativa' ? 'text-emerald-500' : 
                                    item.status_assinatura === 'pendente' ? 'text-amber-500' : 'text-rose-500'
                                }`}>
                                    {item.status_assinatura === 'ativa' ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Clock className="w-4 h-4 mr-2" />}
                                    {item.status_assinatura === 'ativa' ? 'Pago / Ativo' : 'Aguardando'}
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <p className="text-xs font-bold text-slate-500 flex items-center">
                                    <Calendar className="w-3.5 h-3.5 mr-2 text-slate-300" />
                                    {item.data_ativacao ? new Date(item.data_ativacao).toLocaleDateString() : 'Não definido'}
                                </p>
                            </td>
                            <td className="px-8 py-6 text-right">
                                <span className="text-sm font-black text-slate-900">
                                    R$ {item.planos?.valor_mensal ? item.planos.valor_mensal.toFixed(2) : '0,00'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-emerald-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-xl shadow-emerald-600/20">
              <DollarSign className="absolute -bottom-10 -right-10 w-48 h-48 text-white/10 rotate-12" />
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-100 mb-2">Total Recebido (Mês)</p>
              <h4 className="text-5xl font-black tracking-tighter mb-6">R$ 8.420,00</h4>
              <button className="h-12 px-8 bg-white/20 hover:bg-white/30 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all backdrop-blur-md border border-white/20">
                  Conciliar Manualmente
              </button>
          </div>
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm flex flex-col justify-center">
              <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mr-4 shadow-inner">
                      <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Inadimplência</p>
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight">02 Faturas Atrasadas</h4>
                  </div>
              </div>
              <button className="w-full py-4 bg-slate-50 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-100 transition-all border border-slate-100">
                  Visualizar Devedores
              </button>
          </div>
      </div>

    </div>
  );
}
