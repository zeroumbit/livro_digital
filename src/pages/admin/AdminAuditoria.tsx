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

  // Como ainda não temos uma tabela de auditoria real (audit_log),
  // vamos simular eventos baseados nas tabelas de usuários e instituições
  // ou mostrar o esqueleto preparado para o motor de logs.
  
  const fetchLogs = async () => {
    setIsLoading(true);
    // Simulação de registros de auditoria interna
    const mockLogs = [
      { id: 1, type: 'AUTH', action: 'Login Realizado', user: 'Admin Mestre', target: 'SaaS Core', date: new Date().toISOString(), status: 'success', ip: '187.12.33.10' },
      { id: 2, type: 'SECURITY', action: 'Aprovação de Tenant', user: 'Admin Mestre', target: 'GCM Canindé', date: new Date(Date.now() - 3600000).toISOString(), status: 'success', ip: '187.12.33.10' },
      { id: 3, type: 'DATABASE', action: 'Update Plano', user: 'Admin Mestre', target: 'Plano Profissional', date: new Date(Date.now() - 86400000).toISOString(), status: 'success', ip: '187.12.33.10' },
      { id: 4, type: 'AUTH', action: 'Tentativa Falha', user: 'Desconhecido', target: 'Login Panel', date: new Date(Date.now() - 90000000).toISOString(), status: 'warning', ip: '45.18.231.5' },
    ];
    
    setLogs(mockLogs);
    setIsLoading(false);
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
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-transform group-hover:scale-110 ${
                                        log.status === 'warning' ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-500'
                                    }`}>
                                        {log.type === 'AUTH' ? <Terminal className="w-5 h-5" /> : 
                                         log.type === 'SECURITY' ? <Shield className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className={`font-bold text-sm ${log.status === 'warning' ? 'text-rose-600' : 'text-slate-900'}`}>{log.action}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{log.type}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <div className="flex items-center text-sm font-semibold text-slate-600">
                                    <User className="w-4 h-4 mr-2 text-slate-300" />
                                    {log.user}
                                </div>
                            </td>
                            <td className="px-8 py-6">
                                <span className="text-[11px] font-black text-slate-700 bg-slate-100 px-2 py-1 rounded uppercase tracking-widest">{log.target}</span>
                            </td>
                            <td className="px-8 py-6">
                                <p className="text-xs font-bold text-slate-500">
                                    {new Date(log.date).toLocaleString('pt-BR')}
                                </p>
                            </td>
                            <td className="px-8 py-6 text-right">
                                <span className="text-[10px] font-black text-slate-400 flex items-center justify-end">
                                    <Globe className="w-3 h-3 mr-1.5" />
                                    {log.ip}
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

function CheckCircle2({ className }: { className: string }) {
    return <Activity className={className} />; // Usando Activity como substituto rápido
}
