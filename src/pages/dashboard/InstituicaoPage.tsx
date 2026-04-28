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
  XCircle,
  Building2,
  Mail,
  Phone,
  MapPin,
  Hash,
  Pencil,
  Save,
  X,
  UserCheck
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ============================================================================
// PÁGINA: INSTITUIÇÃO (GESTOR)
// ============================================================================

type TabType = 'dados' | 'assinatura';

export function InstituicaoPage() {
  const { institution, setInstitution, profile, setProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('dados');
  
  // Estados para edição dos dados da instituição
  const [isEditingInst, setIsEditingInst] = useState(false);
  const [instForm, setInstForm] = useState({
    razao_social: '',
    cnpj: '',
    telefone: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  });

  // Estados para edição dos dados do gestor
  const [isEditingGestor, setIsEditingGestor] = useState(false);
  const [gestorForm, setGestorForm] = useState({
    primeiro_nome: '',
    sobrenome: '',
    gestor_nome_completo: '',
    gestor_como_chamado: '',
    gestor_telefone: '',
    gestor_email: '',
  });

  // Carregar dados nos forms quando institution carregar
  useEffect(() => {
    if (institution) {
      setInstForm({
        razao_social: institution.razao_social || '',
        cnpj: institution.cnpj || '',
        telefone: institution.telefone || '',
        cep: institution.cep || '',
        logradouro: institution.logradouro || '',
        numero: institution.numero || '',
        complemento: institution.complemento || '',
        bairro: institution.bairro || '',
        cidade: institution.cidade || '',
        estado: institution.estado || '',
      });
      setGestorForm({
        primeiro_nome: profile?.primeiro_nome || '',
        sobrenome: profile?.sobrenome || '',
        gestor_nome_completo: institution.gestor_nome_completo || '',
        gestor_como_chamado: institution.gestor_como_chamado || '',
        gestor_telefone: institution.gestor_telefone || '',
        gestor_email: institution.gestor_email || '',
      });
    }
  }, [institution, profile]);

  // ==========================================
  // ABA 1: DADOS DA INSTITUIÇÃO
  // ==========================================
  const handleSaveInstituicao = async () => {
    if (!institution?.id) return;
    try {
      const { error } = await supabase
        .from('instituicoes')
        .update({
          razao_social: instForm.razao_social,
          cnpj: instForm.cnpj,
          telefone: instForm.telefone,
          cep: instForm.cep,
          logradouro: instForm.logradouro,
          numero: instForm.numero,
          complemento: instForm.complemento,
          bairro: instForm.bairro,
          cidade: instForm.cidade,
          estado: instForm.estado,
        })
        .eq('id', institution.id);
      
      if (error) throw error;
      
      // Atualizar store
      const { data } = await supabase.from('instituicoes').select('*, planos(*)').eq('id', institution.id).single();
      setInstitution(data);
      setIsEditingInst(false);
      toast.success('Dados da instituição atualizados!');
    } catch (e: any) {
      toast.error('Erro ao salvar: ' + e.message);
    }
  };

  // ==========================================
  // ABA 1: DADOS DO GESTOR
  // ==========================================
  const handleSaveGestor = async () => {
    if (!institution?.id) return;
    try {
      // Atualizar institution (dados do gestor)
      const { error: instError } = await supabase
        .from('instituicoes')
        .update({
          gestor_nome_completo: gestorForm.gestor_nome_completo,
          gestor_como_chamado: gestorForm.gestor_como_chamado,
          gestor_telefone: gestorForm.gestor_telefone,
          gestor_email: gestorForm.gestor_email,
        })
        .eq('id', institution.id);

      if (instError) throw instError;

      // Atualizar perfil do usuário (primeiro_nome, sobrenome)
      if (profile?.id) {
        const { error: profileError } = await supabase
          .from('usuarios')
          .update({
            primeiro_nome: gestorForm.primeiro_nome,
            sobrenome: gestorForm.sobrenome,
          })
          .eq('id', profile.id);
        
        if (profileError) throw profileError;
        
        // Atualizar store do profile
        setProfile({
          ...profile,
          primeiro_nome: gestorForm.primeiro_nome,
          sobrenome: gestorForm.sobrenome,
        });
      }

      // Atualizar store da institution
      const { data } = await supabase.from('instituicoes').select('*, planos(*)').eq('id', institution.id).single();
      setInstitution(data);
      setIsEditingGestor(false);
      toast.success('Dados do gestor atualizados!');
    } catch (e: any) {
      toast.error('Erro ao salvar: ' + e.message);
    }
  };

  // ==========================================
  // ABA 2: ASSINATURA (código existente)
  // ==========================================
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

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
       
      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Instituição</h1>
        <p className="text-slate-500 font-medium text-lg mt-1">Gerencie os dados da organização e o plano de assinatura.</p>
      </div>

      {/* TABS */}
      <div className="flex gap-2 bg-slate-50 p-1.5 rounded-[1.5rem] w-fit border border-slate-100">
        <button 
          onClick={() => setActiveTab('dados')}
          className={`px-6 py-3 rounded-[1.2rem] text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'dados' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 inline mr-2" />
          Dados da Instituição
        </button>
        <button 
          onClick={() => setActiveTab('assinatura')}
          className={`px-6 py-3 rounded-[1.2rem] text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'assinatura' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 inline mr-2" />
          Assinatura
        </button>
      </div>

      {/* ABA 1: DADOS DA INSTITUIÇÃO */}
      {activeTab === 'dados' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* Dados da Instituição */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 sm:p-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Dados da Instituição</h3>
                  <p className="text-xs text-slate-500">Informações cadastrais (CNPJ não pode ser alterado)</p>
                </div>
              </div>
              {!isEditingInst ? (
                <button 
                  onClick={() => setIsEditingInst(true)}
                  className="h-10 px-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-2 transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditingInst(false)}
                    className="h-10 px-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-2 transition-all"
                  >
                    <X className="w-3.5 h-3.5" /> Cancelar
                  </button>
                  <button 
                    onClick={handleSaveInstituicao}
                    className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                  >
                    <Save className="w-3.5 h-3.5" /> Salvar
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Razão Social</label>
                {isEditingInst ? (
                  <input 
                    value={instForm.razao_social}
                    onChange={(e) => setInstForm({...instForm, razao_social: e.target.value})}
                    className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-700">{institution?.razao_social || 'Não informado'}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CNPJ</label>
                <p className="text-sm font-bold text-slate-700">{institution?.cnpj || 'Não informado'}</p>
                <p className="text-[10px] text-slate-400">Para alterar, contate o suporte.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefone</label>
                {isEditingInst ? (
                  <input 
                    value={instForm.telefone}
                    onChange={(e) => setInstForm({...instForm, telefone: e.target.value})}
                    className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {institution?.telefone || 'Não informado'}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail</label>
                <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {profile?.email || 'Não informado'}
                </p>
              </div>
            </div>

            {/* Endereço */}
            <div className="mt-8 pt-8 border-t border-slate-100">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Endereço da Sede
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CEP</label>
                  {isEditingInst ? (
                    <input 
                      value={instForm.cep}
                      onChange={(e) => setInstForm({...instForm, cep: e.target.value})}
                      className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  ) : (
                    <p className="text-sm font-bold text-slate-700">{institution?.cep || 'Não informado'}</p>
                  )}
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logradouro</label>
                  {isEditingInst ? (
                    <input 
                      value={instForm.logradouro}
                      onChange={(e) => setInstForm({...instForm, logradouro: e.target.value})}
                      className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  ) : (
                    <p className="text-sm font-bold text-slate-700">{institution?.logradouro || 'Não informado'}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Número</label>
                  {isEditingInst ? (
                    <input 
                      value={instForm.numero}
                      onChange={(e) => setInstForm({...instForm, numero: e.target.value})}
                      className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  ) : (
                    <p className="text-sm font-bold text-slate-700">{institution?.numero || 'Não informado'}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Complemento</label>
                  {isEditingInst ? (
                    <input 
                      value={instForm.complemento}
                      onChange={(e) => setInstForm({...instForm, complemento: e.target.value})}
                      className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  ) : (
                    <p className="text-sm font-bold text-slate-700">{institution?.complemento || 'Não informado'}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bairro</label>
                  {isEditingInst ? (
                    <input 
                      value={instForm.bairro}
                      onChange={(e) => setInstForm({...instForm, bairro: e.target.value})}
                      className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  ) : (
                    <p className="text-sm font-bold text-slate-700">{institution?.bairro || 'Não informado'}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cidade</label>
                  {isEditingInst ? (
                    <input 
                      value={instForm.cidade}
                      onChange={(e) => setInstForm({...instForm, cidade: e.target.value})}
                      className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  ) : (
                    <p className="text-sm font-bold text-slate-700">{institution?.cidade || 'Não informado'}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</label>
                  {isEditingInst ? (
                    <input 
                      value={instForm.estado}
                      onChange={(e) => setInstForm({...instForm, estado: e.target.value})}
                      className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  ) : (
                    <p className="text-sm font-bold text-slate-700">{institution?.estado || 'Não informado'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dados do Gestor (Secretário) */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 sm:p-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Dados do Secretário</h3>
                  <p className="text-xs text-slate-500">Gestor responsável pela instituição</p>
                </div>
              </div>
              {!isEditingGestor ? (
                <button 
                  onClick={() => setIsEditingGestor(true)}
                  className="h-10 px-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-2 transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditingGestor(false)}
                    className="h-10 px-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-2 transition-all"
                  >
                    <X className="w-3.5 h-3.5" /> Cancelar
                  </button>
                  <button 
                    onClick={handleSaveGestor}
                    className="h-10 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                  >
                    <Save className="w-3.5 h-3.5" /> Salvar
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome</label>
                {isEditingGestor ? (
                  <input 
                    value={gestorForm.primeiro_nome}
                    onChange={(e) => setGestorForm({...gestorForm, primeiro_nome: e.target.value})}
                    className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Primeiro nome"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-700">{profile?.primeiro_nome || 'Não informado'}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sobrenome</label>
                {isEditingGestor ? (
                  <input 
                    value={gestorForm.sobrenome}
                    onChange={(e) => setGestorForm({...gestorForm, sobrenome: e.target.value})}
                    className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Sobrenome"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-700">{profile?.sobrenome || 'Não informado'}</p>
                )}
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome Completo do Secretário</label>
                {isEditingGestor ? (
                  <input 
                    value={gestorForm.gestor_nome_completo}
                    onChange={(e) => setGestorForm({...gestorForm, gestor_nome_completo: e.target.value})}
                    className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Nome completo"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-700">{institution?.gestor_nome_completo || 'Não informado'}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Como é chamado</label>
                {isEditingGestor ? (
                  <input 
                    value={gestorForm.gestor_como_chamado}
                    onChange={(e) => setGestorForm({...gestorForm, gestor_como_chamado: e.target.value})}
                    className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Apelido ou como prefere ser chamado"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-700">{institution?.gestor_como_chamado || 'Não informado'}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefone/WhatsApp</label>
                {isEditingGestor ? (
                  <input 
                    value={gestorForm.gestor_telefone}
                    onChange={(e) => setGestorForm({...gestorForm, gestor_telefone: e.target.value})}
                    className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="(00) 00000-0000"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {institution?.gestor_telefone || 'Não informado'}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">E-mail Institucional</label>
                {isEditingGestor ? (
                  <input 
                    value={gestorForm.gestor_email}
                    onChange={(e) => setGestorForm({...gestorForm, gestor_email: e.target.value})}
                    className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="secretario@prefeitura.gov.br"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {institution?.gestor_email || 'Não informado'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: ASSINATURA */}
      {activeTab === 'assinatura' && (
        <div className="space-y-10 animate-in fade-in duration-500">
          
          {/* ALERTAS DE MUDANÇA */}
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
      )}
    </div>
  );
}
