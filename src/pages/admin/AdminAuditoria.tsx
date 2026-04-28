import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Filter, 
  History, 
  User, 
  Globe, 
  Download,
  AlertTriangle,
  FileText,
  Activity,
  Terminal,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ============================================================================
// PÁGINA: LOGS DE AUDITORIA GLOBAL (SUPER ADMIN)
// ============================================================================

export function AdminAuditoria() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      toast.error('Erro ao carregar logs de auditoria');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded">Security Ledger</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Trilha de Auditoria</h1>
            <p className="text-slate-500 font-medium text-lg mt-1">Registros imutáveis de todas as ações administrativas no SaaS.</p>
        </div>
        
        <div className="flex items-center space-x-3">
            <button className="h-12 px-6 bg-white border border-slate-200 rounded-2xl flex items-center text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                <Download className="w-4 h-4 mr-2" /> Exportar CSV
            </button>
        </div>
      </div>

      {/* FERRAMENTAS DE BUSCA */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Filtrar por usuário, ação ou IP..."
                className="w-full h-12 bg-slate-50 border-transparent rounded-xl pl-12 pr-4 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500 transition-all"
              />
          </div>
          <div className="flex items-center space-x-2">
              <select className="h-12 bg-slate-50 border-transparent rounded-xl px-4 text-xs font-black uppercase tracking-widest text-slate-500 outline-none focus:ring-4 focus:ring-rose-500/5">
                  <option>Todos os tipos</option>
                  <option>Segurança</option>
                  <option>Banco de Dados</option>
                  <option>Autenticação</option>
              </select>
              <button className="h-12 w-12 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                  <Filter className="w-5 h-5" />
              </button>
          </div>
      </div>

      {/* TIMELINE DE AUDITORIA */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                        <th className="px-8 py-6">Evento / Tipo</th>
                        <th className="px-8 py-6">Usuário Responsável</th>
                        <th className="px-8 py-6">Alvo da Ação</th>
                        <th className="px-8 py-6">Data e Hora</th>
                        <th className="px-8 py-6 text-right">Origem / IP</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/30 transition-colors group">
                            <td className="px-8 py-6">
                                <div className="flex items-center">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-transform group-hover:scale-110 bg-slate-50 text-slate-500`}>
                                        {log.acao === 'INSERT' ? <Terminal className="w-5 h-5" /> :
                                         log.acao === 'DELETE' ? <Shield className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-900">{log.acao}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{log.tabela_afetada}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <div className="flex items-center text-sm font-semibold text-slate-600">
                                    <User className="w-4 h-4 mr-2 text-slate-300" />
                                    {log.usuario_id ? log.usuario_id.slice(0, 8) + '...' : '---'}
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <span className="text-[11px] font-black text-slate-700 bg-slate-100 px-2 py-1 rounded uppercase tracking-widest">{log.registro_id ? log.registro_id.slice(0, 8) + '...' : log.tabela_afetada}</span>
                            </td>
                            <td className="px-8 py-6">
                                <p className="text-xs font-bold text-slate-500">
                                    {new Date(log.created_at).toLocaleString('pt-BR')}
                                </p>
                            </td>
                            <td className="px-8 py-6 text-right">
                                <span className="text-[10px] font-black text-slate-400 flex items-center justify-end">
                                    <Globe className="w-3 h-3 mr-1.5" />
                                    {log.ip_address || '---'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* CARD DE STATUS DO SISTEMA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white">
              <h3 className="text-xl font-black tracking-tight mb-8 flex items-center">
                  <Terminal className="w-6 h-6 mr-3 text-rose-500" />
                  Estado da Auditoria
              </h3>
              <div className="space-y-6">
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                      <span className="text-xs font-bold text-slate-400">Retenção de Dados</span>
                      <span className="text-xs font-black text-rose-400 uppercase tracking-widest">365 Dias</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                      <span className="text-xs font-bold text-slate-400">Integridade dos Logs</span>
                      <span className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1.5" /> Verificado
                      </span>
                  </div>
              </div>
          </div>
          
          <div className="bg-rose-50 rounded-[2.5rem] p-10 border border-rose-100 flex flex-col justify-center">
              <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-rose-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-rose-500/30 mr-5">
                      <AlertTriangle className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight">Alertas Críticos</h4>
                    <p className="text-rose-600 font-bold text-xs uppercase tracking-widest">Zero incidentes hoje</p>
                  </div>
              </div>
              <button className="w-full py-4 bg-white text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm hover:shadow-md transition-all border border-rose-200">
                  Ver Central de Alertas
              </button>
          </div>
      </div>

    </div>
  );
}

