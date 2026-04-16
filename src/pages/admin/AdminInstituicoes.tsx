import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MoreVertical,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Zap
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ============================================================================
// PÁGINA: GESTÃO DE INSTITUIÇÕES (SUPER ADMIN)
// ============================================================================

export function AdminInstituicoes() {
  const [instituicoes, setInstituicoes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('todas');
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [selectedInst, setSelectedInst] = useState<any>(null);
  const [newPlanoId, setNewPlanoId] = useState('');
  const [planos, setPlanos] = useState<any[]>([]);

  const fetchInstituicoes = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('instituicoes')
      .select('*, planos(nome)')
      .order('created_at', { ascending: false });
    
    if (error) {
        toast.error('Erro ao carregar instituições');
    } else {
        setInstituicoes(data || []);
    }
    setIsLoading(false);
  };

  const fetchPlanos = async () => {
    const { data } = await supabase.from('planos').select('*').eq('status', 'ativo');
    setPlanos(data || []);
  };

  useEffect(() => {
    fetchInstituicoes();
    fetchPlanos();
  }, []);

  const handleApprove = async (id: string) => {
    const { error } = await supabase
        .from('instituicoes')
        .update({ 
            status_assinatura: 'ativa',
            data_ativacao: new Date().toISOString()
        })
        .eq('id', id);

    if (error) {
        toast.error('Erro ao aprovar instituição');
    } else {
        toast.success('Instituição aprovada e ativada!');
        fetchInstituicoes();
    }
  };

  const handleCreateProposal = async () => {
    if (!newPlanoId) return toast.error('Selecione um plano');

    try {
        const { error } = await supabase.from('assinaturas_propostas').insert([{
            instituicao_id: selectedInst.id,
            plano_novo_id: newPlanoId,
            admin_id: (await supabase.auth.getUser()).data.user?.id,
            status: 'aguardando_gestor'
        }]);

        if (error) throw error;
        toast.success('Proposta enviada ao Gestor com sucesso!');
        setIsProposalModalOpen(false);
        setNewPlanoId('');
    } catch (e: any) {
        toast.error(e.message);
    }
  };

  const filteredData = instituicoes.filter(inst => {
    if (filter === 'todas') return true;
    return inst.status_assinatura === filter;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* HEADER ADAPTATIVO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded">SaaS Control</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Instituições</h1>
          <p className="text-slate-500 font-medium mt-1">Gerencie o onboarding e o status das Guardas Municipais.</p>
        </div>
        
        <div className="flex items-center space-x-3">
            <div className="relative group flex-1 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Buscar por CNPJ ou Nome..."
                    className="w-full h-12 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all shadow-sm"
                />
            </div>
            <button className="h-12 w-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
                <Filter className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* FILTROS DE STATUS */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide md:mx-0 md:px-0">
        <StatusTab active={filter === 'todas'} onClick={() => setFilter('todas')} label="Todas" count={instituicoes.length} />
        <StatusTab active={filter === 'pendente'} onClick={() => setFilter('pendente')} label="Pendentes" variant="warning" count={instituicoes.filter(i => i.status_assinatura === 'pendente').length} />
        <StatusTab active={filter === 'ativa'} onClick={() => setFilter('ativa')} label="Ativas" variant="success" count={instituicoes.filter(i => i.status_assinatura === 'ativa').length} />
        <StatusTab active={filter === 'trial'} onClick={() => setFilter('trial')} label="Trial" variant="info" count={instituicoes.filter(i => i.status_assinatura === 'trial').length} />
      </div>

      {/* MODAL: PROPOSTA DE TROCA DE PLANO */}
      {isProposalModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in" onClick={() => setIsProposalModalOpen(false)}></div>
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-black text-slate-900">Alterar Plano SaaS</h3>
                    <button onClick={() => setIsProposalModalOpen(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400"><XCircle /></button>
                </div>
                <div className="p-8 space-y-6">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Instituição</p>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-700">{selectedInst?.razao_social}</div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Selecione o Novo Plano</p>
                        <select 
                            value={newPlanoId}
                            onChange={(e) => setNewPlanoId(e.target.value)}
                            className="w-full h-14 bg-slate-50 rounded-2xl px-4 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-600"
                        >
                            <option value="">Selecione...</option>
                            {planos.map(p => (
                                <option key={p.id} value={p.id}>{p.nome} - R$ {p.valor_mensal.toFixed(2)}</option>
                            ))}
                        </select>
                    </div>
                    <button 
                        onClick={handleCreateProposal}
                        className="w-full h-14 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
                    >
                        Solicitar Aprovação do Gestor
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* TABELA / LISTA */}
      <div className="bg-white md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                        <th className="px-8 py-6">Instituição</th>
                        <th className="px-8 py-6">Plano Atual</th>
                        <th className="px-8 py-6">Cidade</th>
                        <th className="px-8 py-6 text-right">Ação</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredData.map((inst) => (
                        <tr key={inst.id} className="hover:bg-slate-50/30 transition-colors group">
                            <td className="px-8 py-6">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs mr-4">{inst.razao_social.substring(0,2)}</div>
                                    <div>
                                        <p className="font-bold text-slate-900">{inst.razao_social}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{inst.cnpj}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-1 rounded uppercase">{inst.planos?.nome || 'Trial'}</span>
                            </td>
                            <td className="px-8 py-6 text-xs font-bold text-slate-500">{inst.cidade} / {inst.estado}</td>
                            <td className="px-8 py-6 text-right">
                                <div className="flex items-center justify-end space-x-2">
                                    {inst.status_assinatura === 'pendente' && (
                                        <button onClick={() => handleApprove(inst.id)} className="px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg">Aprovar</button>
                                    )}
                                    <button 
                                        onClick={() => { setSelectedInst(inst); setIsProposalModalOpen(true); }}
                                        className="h-9 px-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                                    >
                                        Mudar Plano
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

function StatusTab({ active, onClick, label, count }: any) {
    return (
        <button onClick={onClick} className={`flex items-center px-4 h-10 rounded-2xl whitespace-nowrap text-xs font-bold transition-all ${active ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200'}`}>
            {label} <span className="ml-2 opacity-50">{count}</span>
        </button>
    );
}
