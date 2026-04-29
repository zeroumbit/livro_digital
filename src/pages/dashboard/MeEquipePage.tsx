import React from 'react';
import {
  Users,
  UserPlus,
  Search,
  MoreVertical,
  Mail,
  Phone,
  Shield,
  ChevronRight,
  Loader2,
  AlertCircle,
  Crown,
  UserCheck,
  Building2,
  Calendar,
  Hash,
} from 'lucide-react';
import { useMyTeam } from '@/hooks/useMyTeam';
import { useAuthStore } from '@/store/useAuthStore';
import { MemberProfileModal } from '@/components/team/MemberProfileModal';

export function MeEquipePage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedMember, setSelectedMember] = React.useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  const profile = useAuthStore(state => state.profile);
  const { data, isLoading, error } = useMyTeam();

  const team = data?.team;
  const members = data?.members || [];
  const isLeader = data?.isLeader || false;

  const filteredMembers = members.filter(member => {
    const fullName = `${member.primeiro_nome} ${member.sobrenome}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) ||
      member.matricula?.toLowerCase().includes(searchLower) ||
      member.perfil_acesso?.toLowerCase().includes(searchLower) ||
      member.patente?.toLowerCase().includes(searchLower);
  });

  const handleViewProfile = (member: any) => {
    setSelectedMember(member);
    setIsProfileOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse">Carregando sua equipe...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-rose-50 border border-rose-100 rounded-[2.5rem] text-rose-600">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p className="font-black uppercase tracking-widest text-sm">Erro ao carregar dados</p>
        <p className="text-rose-400 text-xs mt-1">{(error as any).message || 'Tente novamente mais tarde'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">

      {/* CABEÇALHO DA PÁGINA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Minha Equipe</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">
            {team ? `Equipe ${team.nome}` : 
             profile?.perfil_acesso === 'administrativo' ? 'Perfil administrativo (sem equipe vinculada)' :
             'Você ainda não está vinculado a uma equipe'}
          </p>
        </div>
      </div>

      {/* INFORMAÇÕES DA EQUIPE */}
      {team && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-32 h-32 text-indigo-600" />
          </div>

          <div className="relative">
            <div className="flex items-start gap-6 mb-6">
              <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-600/20">
                {team.nome.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-black text-slate-900">{team.nome}</h2>
                  {isLeader && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200">
                      <Crown className="w-3 h-3" /> Líder
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500">
                  {team.descricao || 'Sem descrição'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Membros</p>
                  <p className="text-lg font-black text-slate-900">{members.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</p>
                  <p className="text-lg font-black text-emerald-600">Ativa</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Desde</p>
                  <p className="text-sm font-black text-slate-900">
                    {new Date(team.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BUSCA DE MEMBROS */}
      {team && members.length > 0 && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative group flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Pesquisar membros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">
              {filteredMembers.length} membro{filteredMembers.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* LISTA DE MEMBROS */}
      {!team ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm text-slate-400">
          <Building2 className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg font-black tracking-tight text-slate-600">
            {profile?.perfil_acesso === 'administrativo' ? 'Páginas de Equipes não se aplicam' : 'Nenhuma equipe encontrada'}
          </p>
          <p className="text-sm font-medium mt-1">
            {profile?.perfil_acesso === 'administrativo' 
              ? 'Como perfil administrativo, você atua de forma transversal e não pertence a uma equipe operacional.' 
              : 'Você ainda não foi vinculado a uma equipe.'}
          </p>
          <p className="text-xs text-slate-400 mt-4 max-w-md text-center">
            {profile?.perfil_acesso === 'administrativo'
              ? 'Você ainda pode ser visualizado em escalas de serviço, mas não possui membros de equipe fixos.'
              : 'Entre em contato com o comando ou gestor da sua unidade para ser alocado em uma equipe de trabalho.'}
          </p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm text-slate-400">
          <Users className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg font-black tracking-tight">Nenhum membro encontrado</p>
          <p className="text-sm font-medium">Tente ajustar sua busca.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div key={member.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-600/5 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6">
                <button
                  onClick={() => handleViewProfile(member)}
                  className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 text-xl rounded-[1.5rem] bg-slate-900 border-4 border-indigo-50 flex items-center justify-center text-white font-black shadow-inner">
                    {member.primeiro_nome.charAt(0)}
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight truncate">
                      {member.primeiro_nome} {member.sobrenome}
                    </h3>
                    <div className="flex items-center mt-1">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                        {member.patente || member.perfil_acesso}
                      </span>
                      {member.status === 'ativo' && (
                        <div className="ml-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                      )}
                      {member.id === team.lider_id && (
                        <span className="ml-2 inline-flex items-center gap-0.5 text-[9px] font-black text-amber-600 uppercase tracking-widest">
                          <Crown className="w-2.5 h-2.5" /> Líder
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-slate-500 group/item min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center mr-3 group-hover/item:text-indigo-600 transition-colors shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="font-semibold truncate">{member.email || 'Email pendente'}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-500 group/item min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center mr-3 group-hover/item:text-indigo-600 transition-colors shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="font-semibold truncate">{member.telefone || 'Sem telefone'}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-500 group/item min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center mr-3 group-hover/item:text-indigo-600 transition-colors shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-slate-700 truncate">{member.matricula || '---'}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <button
                    onClick={() => handleViewProfile(member)}
                    className="w-full flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-all"
                  >
                    Visualizar Perfil
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <MemberProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        member={selectedMember}
      />
    </div>
  );
}
