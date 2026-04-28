import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  MapPin, 
  UserCircle2, 
  Bell, 
  Database, 
  Save, 
  Plus, 
  Trash2, 
  Check, 
  ChevronRight,
  ShieldCheck,
  Type,
  Pencil,
  X
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ============================================================================
// COMPONENTES DE APOIO (UI Premium)
// ============================================================================

const SettingGroup = ({ title, desc, children }: any) => (
  <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-100 shadow-sm">
    <div className="mb-10">
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-slate-500 font-medium mt-1">{desc}</p>
    </div>
    <div className="space-y-8">
      {children}
    </div>
  </div>
);

const InputField = ({ label, icon: Icon, value, onChange, placeholder, description }: any) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
        {description && <span className="text-[10px] font-bold text-indigo-400 italic">{description}</span>}
    </div>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-14 pl-12 pr-6 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 outline-none ring-offset-0 focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
      />
    </div>
  </div>
);

// ============================================================================
// PÁGINA: CONFIGURAÇÕES DA INSTITUIÇÃO
// ============================================================================

export function ConfiguracoesPage() {
  const { institution, setInstitution } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab ] = useState('geral');

  // Dashboard Settings State
  const [config, setConfig] = useState<any>({
    nomenclaturas: {
      comandante_geral: "Secretário de Segurança",
      chefe_equipe: "Inspecionado",
      operador_radio: "Central de Operações"
    },
    bairros: []
  });

  const [newBairro, setNewBairro] = useState('');
  const [editingBairroId, setEditingBairroId] = useState<string | null>(null);
  const [editingBairroNome, setEditingBairroNome] = useState('');

  const fetchBairros = async () => {
    if (!institution?.id) return;
    const { data } = await supabase.from('bairros').select('*').eq('instituicao_id', institution.id).order('nome');
    setConfig((prev: any) => ({ ...prev, bairros: data || [] }));
  };

  useEffect(() => {
    if (institution) {
        setConfig((prev: any) => ({
            ...prev,
            nomenclaturas: institution.configuracoes_locais?.nomenclaturas || prev.nomenclaturas
        }));
        fetchBairros();
    }
  }, [institution]);

  const handleSaveNomenclaturas = async () => {
    setIsSaving(true);
    try {
        const { data, error } = await supabase
            .from('instituicoes')
            .update({
                configuracoes_locais: {
                    ...institution?.configuracoes_locais,
                    nomenclaturas: config.nomenclaturas
                }
            })
            .eq('id', institution?.id)
            .select()
            .single();

        if (error) throw error;
        setInstitution(data);
        toast.success('Nomenclaturas atualizadas com sucesso!');
    } catch (e: any) {
        toast.error(e.message);
    } finally {
        setIsSaving(false);
    }
  };

  const handleAddBairro = async () => {
    if (!newBairro || !institution?.id) return;
    const { error } = await supabase.from('bairros').insert({
        instituicao_id: institution.id,
        nome: newBairro
    });
    if (error) return toast.error(error.message);
    setNewBairro('');
    fetchBairros();
    toast.success('Novo território registrado.');
  };

  const handleDeleteBairro = async (id: string) => {
    const { error } = await supabase.from('bairros').delete().eq('id', id);
    if (error) return toast.error(error.message);
    fetchBairros();
  };

  const handleStartEditBairro = (bairro: any) => {
    setEditingBairroId(bairro.id);
    setEditingBairroNome(bairro.nome);
  };

  const handleSaveEditBairro = async () => {
    if (!editingBairroId || !editingBairroNome) return;
    try {
      const { error } = await supabase
        .from('bairros')
        .update({ nome: editingBairroNome })
        .eq('id', editingBairroId);
      if (error) throw error;
      setEditingBairroId(null);
      setEditingBairroNome('');
      fetchBairros();
      toast.success('Território atualizado com sucesso!');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingBairroId(null);
    setEditingBairroNome('');
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Gestão de Identidade</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Personalize nomenclaturas, territórios e regras da sua instituição.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
            <button 
                onClick={() => setActiveTab('geral')}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'geral' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-600'}`}
            >
                Geral
            </button>
            <button 
                onClick={() => setActiveTab('territorios')}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'territorios' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-600'}`}
            >
                Territórios
            </button>
            <button 
                onClick={() => setActiveTab('seguranca')}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'seguranca' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-600'}`}
            >
                Segurança
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* COLUNA DE CONFIGURAÇÃO (ESQUERDA) */}
        <div className="lg:col-span-8 space-y-8">
            
            {activeTab === 'geral' && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                    <SettingGroup 
                        title="Nomenclaturas Customizadas" 
                        desc="Como o sistema deve se referir aos cargos e funções na sua instituição."
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InputField 
                                label="Comante Geral" 
                                icon={ShieldCheck} 
                                value={config.nomenclaturas.comandante_geral}
                                onChange={(val: string) => setConfig({ ...config, nomenclaturas: { ...config.nomenclaturas, comandante_geral: val } })}
                                description="Ex: Comandante, Secretário..."
                            />
                            <InputField 
                                label="Chefe de Equipe" 
                                icon={UserCircle2} 
                                value={config.nomenclaturas.chefe_equipe}
                                onChange={(val: string) => setConfig({ ...config, nomenclaturas: { ...config.nomenclaturas, chefe_equipe: val } })}
                                description="Ex: Encarregado, Líder..."
                            />
                             <InputField 
                                label="Operador de Rádio" 
                                icon={Type} 
                                value={config.nomenclaturas.operador_radio}
                                onChange={(val: string) => setConfig({ ...config, nomenclaturas: { ...config.nomenclaturas, operador_radio: val } })}
                                description="Ex: Central, Despachante..."
                            />
                        </div>
                        <div className="pt-10 border-t border-slate-50 flex justify-end">
                            <button 
                                onClick={handleSaveNomenclaturas}
                                disabled={isSaving}
                                className="h-14 px-10 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center"
                            >
                                <Save className="w-4 h-4 mr-3" /> {isSaving ? 'Salvando...' : 'Salvar Nomenclaturas'}
                            </button>
                        </div>
                    </SettingGroup>
                </div>
            )}

            {activeTab === 'territorios' && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                    <SettingGroup 
                        title="Zonas, Bairros e Setores" 
                        desc="Defina os locais de atuação para relatórios estatísticos e registro de ocorrências."
                    >
                        <div className="flex gap-4">
                            <div className="flex-1 relative group">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                                <input 
                                    type="text" 
                                    placeholder="Nome da Zona ou Bairro..."
                                    value={newBairro}
                                    onChange={(e) => setNewBairro(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddBairro()}
                                    className="w-full h-14 pl-12 pr-6 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                                />
                            </div>
                            <button 
                                onClick={handleAddBairro}
                                className="h-14 w-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all"
                            >
                                <Plus />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                             {config.bairros.map((b: any) => (
                                 <div key={b.id} className="group bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-transparent hover:border-slate-200 transition-all">
                                     {editingBairroId === b.id ? (
                                         // Modo de edição
                                         <div className="flex-1 flex items-center gap-2">
                                             <input 
                                                 value={editingBairroNome}
                                                 onChange={(e) => setEditingBairroNome(e.target.value)}
                                                 className="flex-1 h-8 px-3 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                                 autoFocus
                                             />
                                             <button 
                                                 onClick={handleSaveEditBairro}
                                                 className="p-2 text-emerald-600 hover:text-emerald-700"
                                             >
                                                 <Check className="w-4 h-4" />
                                             </button>
                                             <button 
                                                 onClick={handleCancelEdit}
                                                 className="p-2 text-slate-400 hover:text-slate-600"
                                             >
                                                 <X className="w-4 h-4" />
                                             </button>
                                         </div>
                                     ) : (
                                         // Modo de visualização
                                         <>
                                             <span className="text-sm font-bold text-slate-700">{b.nome}</span>
                                             <div className="flex items-center gap-1">
                                                 <button 
                                                     onClick={() => handleStartEditBairro(b)}
                                                     className="p-2 text-slate-300 hover:text-indigo-600"
                                                 >
                                                     <Pencil className="w-4 h-4" />
                                                 </button>
                                                 <button 
                                                     onClick={() => handleDeleteBairro(b.id)}
                                                     className="p-2 text-slate-300 hover:text-rose-500"
                                                 >
                                                     <Trash2 className="w-4 h-4" />
                                                 </button>
                                             </div>
                                         </>
                                     )}
                                 </div>
                             ))}
                         </div>
                    </SettingGroup>
                </div>
            )}

            {activeTab === 'seguranca' && (
                <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm text-center">
                    <ShieldCheck className="w-16 h-16 text-indigo-100 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-slate-900">Configurações de Acesso</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mt-2">Nesta área você poderá gerenciar políticas de auditoria e logs de segurança em breve.</p>
                </div>
            )}

        </div>

        {/* BARRA LATERAL (SUMMARY) */}
        <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-6">Resumo da Identidade</h4>
                <div className="space-y-6 relative z-10">
                    <div className="flex items-center">
                         <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mr-4">
                            <MapPin className="w-5 h-5 text-indigo-300" />
                         </div>
                         <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase">Territórios</p>
                             <p className="text-sm font-black">{config.bairros.length} Ativos</p>
                         </div>
                    </div>
                    <div className="flex items-center">
                         <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mr-4">
                            <Settings className="w-5 h-5 text-indigo-300" />
                         </div>
                         <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase">Hierarquia</p>
                             <p className="text-sm font-black">Personalizada</p>
                         </div>
                    </div>
                </div>
                <div className="mt-10 pt-10 border-t border-white/10">
                    <p className="text-[10px] font-medium text-slate-400 italic">As mudanças afetarão como todos os agentes visualizam os nomes no aplicativo.</p>
                </div>
            </div>
            
            <div className="bg-emerald-50 rounded-[3rem] p-8 border border-emerald-100">
                <Check className="w-8 h-8 text-emerald-500 mb-6" />
                <h4 className="text-lg font-bold text-emerald-900 leading-tight">Backup Automático Ativo</h4>
                <p className="text-emerald-700/70 text-sm mt-2">Suas configurações são sincronizadas em tempo real com a nuvem militar segura.</p>
            </div>
        </div>

      </div>

    </div>
  );
}
