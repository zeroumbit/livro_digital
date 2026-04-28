import React from 'react';
import {
  User,
  Mail,
  Shield,
  Badge,
  Calendar,
  Building2,
  Hash,
  Activity,
  UserCheck,
  MapPin,
  Phone,
  FileText,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export function ProfilePage() {
  const profile = useAuthStore(state => state.profile);
  const institution = useAuthStore(state => state.institution);
  
  if (!profile) return null;

  const isSecretary = profile.funcao_operacional?.toUpperCase() === 'SECRETÁRIO';
  const fullName = `${profile.primeiro_nome} ${profile.sobrenome}`;

  const personalInfo = [
    { icon: Mail, label: 'Email Institucional', value: profile.email || 'Não informado' },
    { icon: Phone, label: 'Telefone para Contato', value: profile.telefone || 'Não informado' },
    { icon: Shield, label: 'Matrícula (RE)', value: profile.matricula || 'Pendente' },
    { icon: Badge, label: 'Patente / Cargo', value: profile.patente || 'Pendente' },
    { icon: UserCheck, label: 'Função Operacional', value: profile.funcao_operacional || 'Pendente' },
    { icon: Activity, label: 'Status da Conta', value: profile.status === 'ativo' ? 'Ativo' : 'Inativo', color: profile.status === 'ativo' ? 'text-emerald-600' : 'text-slate-400' },
  ];

  const institutionInfo = [
    { icon: Building2, label: 'Razão Social', value: institution?.razao_social || 'GCM Municipal' },
    { icon: Hash, label: 'CNPJ', value: institution?.cnpj || 'Não informado' },
    { icon: Phone, label: 'Telefone', value: institution?.telefone || 'Não informado' },
    { icon: MapPin, label: 'Endereço', value: [
        institution?.logradouro,
        institution?.numero,
        institution?.complemento
      ].filter(Boolean).join(', ') || 'Não informado' },
    { icon: MapPin, label: 'Bairro', value: institution?.bairro || 'Não informado' },
    { icon: MapPin, label: 'Cidade/Estado', value: `${institution?.cidade || ''} - ${institution?.estado || ''}` },
    { icon: Hash, label: 'CEP', value: institution?.cep || 'Não informado' },
    { icon: CheckCircle2, label: 'Status da Assinatura', value: institution?.status_assinatura || 'Pendente', color: institution?.status_assinatura === 'ativa' ? 'text-emerald-600' : 'text-amber-600' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 p-4 md:p-8">
      
      {/* Hero Section / Profile Header */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-xl flex flex-col md:flex-row items-center gap-8">
          
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-slate-900 flex items-center justify-center text-white text-4xl md:text-5xl font-black shadow-2xl border-8 border-indigo-50 transform transition duration-500 hover:rotate-3">
              {profile.primeiro_nome.charAt(0)}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                  {profile.perfil_acesso === 'gestor' ? 'Comando Geral' : 'Efetivo Operacional'}
                </span>
                {isSecretary && (
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200 animate-pulse">
                    Comando Supremo
                  </span>
                )}
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Desde {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '---'}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">
                {fullName}
              </h1>
              <p className="text-lg text-slate-500 font-medium mt-2">
                {profile.patente} • RE {profile.matricula}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-400 font-bold uppercase tracking-wider">
               <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {profile.instituicoes?.razao_social}</span>
               <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
               <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {profile.instituicoes?.cidade}</span>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="hidden lg:block w-64 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Resumo da Conta</p>
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <span className="text-xs font-bold text-slate-500">Status</span>
                   <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg uppercase">Ativo</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-xs font-bold text-slate-500">Acesso</span>
                   <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg uppercase">{profile.perfil_acesso}</span>
                </div>
                <div className="pt-4 border-t border-slate-200">
                   <button className="w-full py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-100 transition-all">
                      Alterar Senha
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Info Grid - Full Width Stack */}
      <div className="space-y-8">
         
        {/* Personal Details */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <FileText className="w-5 h-5" />
             </div>
             <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Dados Pessoais</h3>
                <p className="text-xs text-slate-500 font-medium tracking-wide">Informações registradas no seu RE.</p>
             </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
             {personalInfo.map((info, i) => (
                <div key={i} className="space-y-1.5 group">
                   <div className="flex items-center gap-2 text-slate-400 group-hover:text-indigo-600 transition-colors">
                      <info.icon className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{info.label}</span>
                   </div>
                   <p className={`text-sm font-bold truncate ${
                      info.label === 'Função Operacional' && isSecretary 
                        ? 'text-amber-600' 
                        : (info.color || 'text-slate-700')
                   }`}>
                      {info.value}
                   </p>
                </div>
             ))}
          </div>
        </div>

        {/* Institution Details */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                <Building2 className="w-5 h-5" />
             </div>
             <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Minha Instituição</h3>
                <p className="text-xs text-slate-500 font-medium tracking-wide">Dados da corporação atual.</p>
             </div>
          </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 space-y-8">
              <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-3xl border border-slate-100">
                 <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-300">
                    <Building2 className="w-8 h-8" />
                 </div>
                 <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instituição Vinculada</p>
                    <h4 className="text-lg font-black text-slate-900 tracking-tight">{institution?.razao_social || 'Guarda Civil Municipal'}</h4>
                 </div>
                 {profile?.perfil_acesso === 'gestor' && (
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gestor Responsável</p>
                       <p className="text-sm font-bold text-slate-700">{profile.primeiro_nome} {profile.sobrenome}</p>
                    </div>
                 )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {institutionInfo.map((info, i) => (
                    <div key={i} className="space-y-1.5">
                       <div className="flex items-center gap-2 text-slate-400">
                          <info.icon className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{info.label}</span>
                       </div>
                       <p className={`text-sm font-bold ${info.color || 'text-slate-700'} whitespace-pre-wrap`}>
                          {info.value}
                       </p>
                    </div>
                 ))}
              </div>
          </div>
        </div>

      </div>

      {/* Footer Support */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-8 md:p-12 text-white overflow-hidden relative group">
         <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-1000">
            <Shield className="w-64 h-64" />
         </div>
         <div className="relative max-w-2xl space-y-6">
            <h3 className="text-3xl font-black tracking-tight leading-none">Precisa atualizar algum dado?</h3>
            <p className="text-indigo-100 font-medium leading-relaxed">
               Dados como RE, Patente e Função são controlados pelo seu comando. Caso identifique alguma inconsistência, entre em contato com o administrador do sistema da sua unidade.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
               <button className="px-8 py-3 bg-white text-indigo-600 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-black/10 hover:-translate-y-0.5 transition-all active:scale-95">
                  Solicitar Alteração
               </button>
               <button className="px-8 py-3 bg-indigo-500/50 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-500/70 transition-all">
                  Ajuda e Suporte
               </button>
            </div>
         </div>
      </div>

    </div>
  );
}
