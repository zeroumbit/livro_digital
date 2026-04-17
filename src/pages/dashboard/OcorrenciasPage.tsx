import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  MoreVertical, 
  Eye, 
  Edit, 
  Clock,
  MapPin,
  ShieldAlert
} from 'lucide-react';

// Mock de dados para demonstração da tabela
const mockOcorrencias = [
  { id: '1', codigo: 'OC-2024-001', tipo: 'Apoio ao SAMU', local: 'Rua das Flores, 123', data: '15/04/2024 14:30', status: 'Finalizado', responsavel: 'GCM Silva' },
  { id: '2', codigo: 'OC-2024-002', tipo: 'Perturbação do Sossego', local: 'Av. Brasil, 500', data: '15/04/2024 16:15', status: 'Em Andamento', responsavel: 'GCM Santos' },
  { id: '3', codigo: 'OC-2024-003', tipo: 'Furto de Fios', local: 'Praça Central', data: '16/04/2024 02:45', status: 'Aguardando Relatório', responsavel: 'GCM Costa' },
];

export function OcorrenciasPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER DA PÁGINA: Título + Botão Criar (Single Page Pattern) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Registro de Ocorrências</h1>
          <p className="text-slate-500 font-medium mt-1">Gerencie e registre todos os atendimentos operacionais da sua instituição.</p>
        </div>
        <button className="flex items-center justify-center px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
          <Plus className="w-5 h-5 mr-3" /> Registrar Nova Ocorrência
        </button>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="grid grid-cols-1 md:flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por código, tipo ou local..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">
          <Filter className="w-5 h-5 mr-3" /> Filtros Avançados
        </button>
      </div>

      {/* TABELA DE REGISTROS (DataTable Pattern) */}
      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Código</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Natureza da Ocorrência</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Localização</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data / Hora</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {mockOcorrencias.map((oc) => (
                <tr key={oc.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg text-xs tracking-tighter">
                      {oc.codigo}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mr-3 group-hover:bg-white transition-colors">
                        <ShieldAlert className="w-5 h-5 text-slate-400" />
                      </div>
                      <span className="font-bold text-slate-700">{oc.tipo}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 flex flex-col">
                    <span className="text-slate-600 font-medium">{oc.local}</span>
                    <span className="text-[10px] text-slate-400 flex items-center mt-1">
                        <MapPin className="w-3 h-3 mr-1" /> Município Sede
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center text-slate-500 font-medium">
                      <Clock className="w-4 h-4 mr-2" /> {oc.data}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      oc.status === 'Finalizado' ? 'bg-emerald-50 text-emerald-600' : 
                      oc.status === 'Em Andamento' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                        oc.status === 'Finalizado' ? 'bg-emerald-600' : 
                        oc.status === 'Em Andamento' ? 'bg-amber-600' : 'bg-blue-600'
                      }`} />
                      {oc.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm transition-all">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm transition-all">
                        <Edit className="w-4 h-4" />
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
