import React, { useState } from 'react';
import { 
  Settings, 
  Globe, 
  Mail, 
  Database, 
  Lock, 
  Cloud, 
  Save, 
  RefreshCw,
  Server,
  BellRing,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// PÁGINA: CONFIGURAÇÕES GLOBAIS DO SAAS (SUPER ADMIN)
// ============================================================================

export function AdminConfiguracoes() {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
        setIsSaving(false);
        toast.success('Configurações globais atualizadas!');
    }, 1500);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded transition-all hover:bg-slate-900 hover:text-white pointer-events-none">SaaS Engine</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Definições do Sistema</h1>
            <p className="text-slate-500 font-medium text-lg mt-1">Gerencie chaves de API, gateways de pagamento e limites globais.</p>
        </div>
        
        <button 
            onClick={handleSave}
            disabled={isSaving}
            className="h-12 px-8 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all hover:-translate-y-1"
        >
            {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-3" /> Salvar Tudo</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* PAINEL DE NAVEGAÇÃO DE CONFIGS */}
          <div className="lg:col-span-1 space-y-4">
              <ConfigNavItem icon={Globe} title="Geral e Marca" active />
              <ConfigNavItem icon={CreditCard} title="Pagamentos (Stripe/Pagar.me)" />
              <ConfigNavItem icon={Mail} title="Servidor de E-mail (SMTP)" />
              <ConfigNavItem icon={Database} title="Storage e Backups" />
              <ConfigNavItem icon={Lock} title="Segurança e 2FA" />
              <ConfigNavItem icon={BellRing} title="Notificações Globais" />
          </div>

          {/* ÁREA DE FORMULÁRIO */}
          <div className="lg:col-span-2 space-y-8">
              
              {/* SEÇÃO: IDENTIDADE */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 sm:p-10 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Cloud className="w-24 h-24" />
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-900 mb-8 border-b border-slate-50 pb-6 uppercase tracking-tight">Identidade da Plataforma</h3>
                  
                  <div className="space-y-6 max-w-lg">
                      <div className="grid grid-cols-1 gap-6">
                        <ConfigInput label="Nome Oficial do Sistema" defaultValue="Livro Digital GCM" />
                        <ConfigInput label="URL de Acesso (Canonical)" defaultValue="https://livrodigital.gcm.gov.br" />
                        <ConfigInput label="E-mail de Suporte Técnico" defaultValue="suporte@zeroumbit.com.br" />
                      </div>
                  </div>
              </div>

              {/* SEÇÃO: LIMITES GLOBAIS */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 sm:p-10 shadow-sm">
                  <h3 className="text-xl font-black text-slate-900 mb-8 border-b border-slate-50 pb-6 uppercase tracking-tight">Limites e Performance</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                          <div className="flex items-center text-indigo-600 mb-2">
                             <Server className="w-5 h-5 mr-2" />
                             <span className="text-xs font-black uppercase tracking-widest">Storage por Guarda</span>
                          </div>
                          <input type="range" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                          <div className="flex justify-between text-[10px] font-bold text-slate-400">
                              <span>5GB</span>
                              <span className="text-indigo-600">50GB (Recomendado)</span>
                              <span>1TB</span>
                          </div>
                      </div>

                      <div className="space-y-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                          <div className="flex items-center text-slate-600 mb-2">
                             <Lock className="w-5 h-5 mr-2" />
                             <span className="text-xs font-black uppercase tracking-widest">Sessão do Usuário</span>
                          </div>
                          <select className="w-full h-12 bg-white rounded-xl px-4 text-sm font-bold border border-slate-200 outline-none">
                              <option>8 Horas (Padrão)</option>
                              <span>24 Horas</span>
                              <span>7 Dias</span>
                          </select>
                      </div>
                  </div>
              </div>

          </div>

      </div>

    </div>
  );
}

function ConfigNavItem({ icon: Icon, title, active = false }: any) {
    return (
        <button className={`w-full flex items-center justify-between p-5 rounded-3xl transition-all border ${
            active 
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20 translate-x-3' 
                : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50 hover:border-slate-200'
        }`}>
            <div className="flex items-center">
                <Icon className={`w-5 h-5 mr-4/ ${active ? 'text-white' : 'text-slate-400'}`} />
                <span className="font-bold text-sm ml-4">{title}</span>
            </div>
            {active ? <ChevronRight className="w-4 h-4" /> : null}
        </button>
    );
}

function ConfigInput({ label, defaultValue }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">{label}</label>
            <input 
                type="text" 
                defaultValue={defaultValue}
                className="w-full h-14 bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all rounded-2xl px-6 text-sm font-bold text-slate-700 outline-none"
            />
        </div>
    );
}
