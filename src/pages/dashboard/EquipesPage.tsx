import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Shield, 
  Phone,
  LayoutGrid,
  List,
  ChevronRight
} from 'lucide-react';

// ============================================================================
// PÁGINA: GESTÃO DE EQUIPE (MODO GESTOR / OPERADOR)
// ============================================================================

export function EquipesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Mock para visualizar o design (Conectaremos ao Supabase futuramente)
  const members = [
    { id: 1, name: 'Carlos Oliveira', role: 'Comandante', status: 'ativo', email: 'carlos@gcm.gov.br', phone: '(11) 98888-7777', badge: 'GCM-001' },
    { id: 2, name: 'Ana Costa', role: 'Operador de Rádio', status: 'ativo', email: 'ana.costa@gcm.gov.br', phone: '(11) 97777-6666', badge: 'GCM-042' },
    { id: 3, name: 'Ricardo Silva', role: 'Inspetor', status: 'ausente', email: 'ricardo@gcm.gov.br', phone: '(11) 96666-5555', badge: 'GCM-105' },
    { id: 4, name: 'Beatriz Santos', role: 'GCM 1ª Classe', status: 'ativo', email: 'beatriz@gcm.gov.br', phone: '(11) 95555-4444', badge: 'GCM-218' },
  ];

  return (
    <div className="space-y-6 lg:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* CABEÇALHO DA PÁGINA (ADAPTATIVO) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Equipe Operacional</h1>
          <p className="text-slate-500 font-medium text-lg mt-1 group">Gerencie o efetivo e as permissões da sua Guarda Municipal.</p>
        </div>
        
        <div className="flex items-center space-x-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none h-12 px-6 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">
                <UserPlus className="w-5 h-5 mr-3" /> Convidar Membro
            </button>
        </div>
      </div>

      {/* FERRAMENTAS DE BUSCA E VISÃO (ADAPTATIVO) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative group flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
                type="text" 
                placeholder="Pesquisar por nome, RE ou cargo..."
                className="w-full h-12 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all shadow-sm"
            />
        </div>
        
        <div className="flex items-center space-x-2">
            <div className="hidden sm:flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <List className="w-4 h-4" />
                </button>
            </div>
            <button className="flex-1 sm:flex-none h-12 px-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
                <Filter className="w-4 h-4 mr-2" /> Filtros
            </button>
        </div>
      </div>

      {/* GRID DE CARDS (MOBILE FIRST & RESPONSIVE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {members.map((member) => (
          <div key={member.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-600/5 transition-all duration-500 group relative overflow-hidden">
            
            <div className="absolute top-0 right-0 p-6">
                <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 border-4 border-indigo-50 flex items-center justify-center text-white text-xl font-black shadow-inner">
                    {member.name.charAt(0)}
                </div>
                <div className="ml-4 flex-1 min-w-0">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight truncate">{member.name}</h3>
                    <div className="flex items-center mt-1">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">{member.role}</span>
                        {member.status === 'ativo' && (
                            <div className="ml-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-slate-500 group/item">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center mr-3 group-hover/item:text-indigo-600 transition-colors">
                        <Mail className="w-4 h-4" />
                    </div>
                    <span className="font-semibold truncate">{member.email}</span>
                </div>
                <div className="flex items-center text-sm text-slate-500 group/item">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center mr-3 group-hover/item:text-indigo-600 transition-colors">
                        <Phone className="w-4 h-4" />
                    </div>
                    <span className="font-semibold">{member.phone}</span>
                </div>
                <div className="flex items-center text-sm text-slate-500 group/item">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center mr-3 group-hover/item:text-indigo-600 transition-colors">
                        <Shield className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-slate-700">{member.badge}</span>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
                <button className="w-full flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-all">
                    Visualizar Perfil Completo
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
            
          </div>
        ))}
      </div>

    </div>
  );
}
