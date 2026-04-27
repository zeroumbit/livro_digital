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
  ChevronRight,
  Loader2,
  AlertCircle,
  Eye,
  UserCheck,
  UserX,
  Trash2,
} from 'lucide-react';
import { useMembers, useInviteMember, useDeleteMember, useToggleMemberStatus } from '@/hooks/useMembers';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { MemberProfileModal } from '@/components/team/MemberProfileModal';
import { InviteMemberModal } from '@/components/team/InviteMemberModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

// ============================================================================
// PÁGINA: GESTÃO DE EQUIPE (MODO GESTOR / OPERADOR)
// ============================================================================

export function EquipesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<any>(null);

  const { data: members, isLoading, error } = useMembers();
  const inviteMember = useInviteMember();
  const deleteMember = useDeleteMember();
  const toggleStatus = useToggleMemberStatus();

  const filteredMembers = members?.filter(member => {
    const fullName = `${member.primeiro_nome} ${member.sobrenome}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return fullName.includes(searchLower) ||
      member.matricula?.toLowerCase().includes(searchLower) ||
      member.perfil_acesso?.toLowerCase().includes(searchLower) ||
      member.patente?.toLowerCase().includes(searchLower);
  }) || [];

  const handleViewProfile = (member: any) => {
    setSelectedMember(member);
    setIsProfileOpen(true);
  };

  const handleInvite = (data: { email: string; primeiro_nome: string; sobrenome: string; telefone: string; perfil_acesso: string; patente: string }) => {
    inviteMember.mutate(data, {
      onSuccess: () => setIsInviteOpen(false)
    });
  };

  const handleDeleteClick = (member: any) => {
    setMemberToDelete(member);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (memberToDelete) {
      deleteMember.mutate(memberToDelete.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setMemberToDelete(null);
        }
      });
    }
  };

  const handleToggleStatus = (member: any) => {
    toggleStatus.mutate({ id: member.id, currentStatus: member.status });
  };

  return (
    <div className="space-y-6 lg:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">

      {/* CABEÇALHO DA PÁGINA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Equipe Operacional</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Gerencie o efetivo e as permissões da sua Guarda Municipal.</p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex-1 md:flex-none h-12 px-6 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
          >
            <UserPlus className="w-5 h-5 mr-3" /> Convidar Membro
          </button>
        </div>
      </div>

      {/* FERRAMENTAS DE BUSCA E VISÃO */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            placeholder="Pesquisar por nome, RE ou cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-500 font-bold animate-pulse">Carregando efetivo...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-rose-50 border border-rose-100 rounded-[2.5rem] text-rose-600">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p className="font-black uppercase tracking-widest text-sm">Erro ao carregar dados</p>
          <p className="text-rose-400 text-xs mt-1">{(error as any).message || 'Tente novamente mais tarde'}</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm text-slate-400">
          <Users className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg font-black tracking-tight">Nenhum membro encontrado</p>
          <p className="text-sm font-medium">Tente ajustar sua busca ou filtros.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredMembers.map((member) => (
            <div key={member.id} className={`bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-600/5 transition-all duration-500 group relative overflow-hidden ${viewMode === 'list' ? 'p-4 flex items-center gap-6' : 'p-6'}`}>

              <div className="absolute top-0 right-0 p-6">
                <DropdownMenu
                  trigger={
                    <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  }
                  items={[
                    {
                      label: 'Visualizar Perfil',
                      icon: Eye,
                      onClick: () => handleViewProfile(member)
                    },
                    {
                      label: member.status === 'ativo' ? 'Desativar' : 'Ativar',
                      icon: member.status === 'ativo' ? UserX : UserCheck,
                      onClick: () => handleToggleStatus(member)
                    },
                    {
                      label: 'Excluir',
                      icon: Trash2,
                      onClick: () => handleDeleteClick(member),
                      variant: 'danger'
                    }
                  ]}
                />
              </div>

              <div className={`flex items-center ${viewMode === 'grid' ? 'mb-6' : ''}`}>
                <div className={`${viewMode === 'grid' ? 'w-16 h-16 text-xl' : 'w-12 h-12 text-sm'} rounded-[1.5rem] bg-slate-900 border-4 border-indigo-50 flex items-center justify-center text-white font-black shadow-inner`}>
                  {member.primeiro_nome.charAt(0)}
                </div>
                <div className="ml-4 flex-1 min-w-0">
                  <h3 className={`${viewMode === 'grid' ? 'text-lg' : 'text-md'} font-black text-slate-900 tracking-tight truncate`}>
                    {member.primeiro_nome} {member.sobrenome}
                  </h3>
                  <div className="flex items-center mt-1">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                      {member.patente || member.perfil_acesso}
                    </span>
                    {member.status === 'ativo' && (
                      <div className="ml-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    )}
                  </div>
                </div>
              </div>

              <div className={viewMode === 'grid' ? "space-y-3 mb-6" : "flex flex-1 items-center gap-8 px-4"}>
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

              {viewMode === 'grid' && (
                <div className="pt-6 border-t border-slate-100">
                  <button
                    onClick={() => handleViewProfile(member)}
                    className="w-full flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-all"
                  >
                    Visualizar Perfil Completo
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      <MemberProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        member={selectedMember}
      />

      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onInvite={handleInvite}
        isLoading={inviteMember.isPending}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setMemberToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir Membro"
        description={`Tem certeza que deseja excluir ${memberToDelete ? `${memberToDelete.primeiro_nome} ${memberToDelete.sobrenome}` : 'este membro'}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        loading={deleteMember.isPending}
        variant="danger"
      />

    </div>
  );
}
