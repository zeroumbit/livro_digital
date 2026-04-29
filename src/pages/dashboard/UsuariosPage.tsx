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
  Pencil,
} from 'lucide-react';
import { useUsuarios, useCreateUsuario, useUpdateUsuario, useDeleteUsuario, useToggleUsuarioStatus, usePatentes } from '@/hooks/useUsuarios';
import { useAuthStore } from '@/store/useAuthStore';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { UsuarioModal } from '@/components/usuarios/UsuarioModal';
import { UsuarioProfileModal } from '@/components/usuarios/UsuarioProfileModal';
import toast from 'react-hot-toast';

export function UsuariosPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'inativo'>('todos');
  const [perfilFilter, setPerfilFilter] = useState<string>('todos');

  const [selectedUsuario, setSelectedUsuario] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState<any>(null);

  const profile = useAuthStore(state => state.profile);
  const { data: usuarios, isLoading, error } = useUsuarios();
  const { data: patentes } = usePatentes();
  const createUsuario = useCreateUsuario();
  const updateUsuario = useUpdateUsuario();
  const deleteUsuario = useDeleteUsuario();
  const toggleStatus = useToggleUsuarioStatus();

  const perfisUnicos = [...new Set(usuarios?.map(u => u.perfil_acesso) || [])];

  const filteredUsuarios = usuarios?.filter(usuario => {
    const fullName = `${usuario.primeiro_nome} ${usuario.sobrenome}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = fullName.includes(searchLower) ||
      usuario.matricula?.toLowerCase().includes(searchLower) ||
      usuario.email?.toLowerCase().includes(searchLower) ||
      usuario.perfil_acesso?.toLowerCase().includes(searchLower) ||
      usuario.patente?.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === 'todos' || usuario.status === statusFilter;
    const matchesPerfil = perfilFilter === 'todos' || usuario.perfil_acesso === perfilFilter;

    return matchesSearch && matchesStatus && matchesPerfil;
  }) || [];

  const handleViewProfile = (usuario: any) => {
    setSelectedUsuario(usuario);
    setIsProfileOpen(true);
  };

  const handleCreate = () => {
    setEditingUsuario(null);
    setIsModalOpen(true);
  };

  const handleEdit = (usuario: any) => {
    setEditingUsuario(usuario);
    setIsModalOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (editingUsuario) {
      updateUsuario.mutate({ id: editingUsuario.id, data }, {
        onSuccess: () => setIsModalOpen(false)
      });
    } else {
      createUsuario.mutate(data, {
        onSuccess: () => {
          setIsModalOpen(false);
          toast.success('Usuário criado com sucesso! Ele já pode fazer login com as credenciais definidas.', {
            duration: 6000,
          });
        },
        onError: (err: any) => {
          const msg = err?.message || 'Erro ao criar usuário';
          // Mensagens comuns do Supabase Auth em português
          const translated = msg.includes('already registered') || msg.includes('already been registered')
            ? 'Este e-mail já está cadastrado no sistema.'
            : msg.includes('Password should be at least')
            ? 'A senha deve ter pelo menos 6 caracteres.'
            : msg.includes('Unable to validate email')
            ? 'E-mail inválido.'
            : msg;
          toast.error(translated, { duration: 6000 });
        }
      });
    }
  };

  const handleDeleteClick = (usuario: any) => {
    setUsuarioToDelete(usuario);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (usuarioToDelete) {
      deleteUsuario.mutate(usuarioToDelete.id, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setUsuarioToDelete(null);
        }
      });
    }
  };

  const handleToggleStatus = (usuario: any) => {
    toggleStatus.mutate({ id: usuario.id, currentStatus: usuario.status });
  };

  return (
    <div className="space-y-6 lg:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">

      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Gestão de Usuários</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Gerencie todos os usuários e efetivo da sua instituição.</p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            onClick={handleCreate}
            className="flex-1 md:flex-none h-12 px-6 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
          >
            <UserPlus className="w-5 h-5 mr-3" /> Novo Usuário
          </button>
        </div>
      </div>

      {/* FERRAMENTAS DE BUSCA E FILTROS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            placeholder="Pesquisar por nome, email, matrícula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-12 px-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all cursor-pointer"
          >
            <option value="todos">Todos Status</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>

          <select
            value={perfilFilter}
            onChange={(e) => setPerfilFilter(e.target.value)}
            className="h-12 px-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all cursor-pointer"
          >
            <option value="todos">Todos Perfis</option>
            {perfisUnicos.map(perfil => (
              <option key={perfil} value={perfil}>{perfil}</option>
            ))}
          </select>

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
        </div>
      </div>

      {/* ESTATÍSTICAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{usuarios?.length || 0}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Ativos</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{usuarios?.filter(u => u.status === 'ativo').length || 0}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inativos</p>
          <p className="text-2xl font-black text-slate-500 mt-1">{usuarios?.filter(u => u.status === 'inativo').length || 0}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Perfis</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">{perfisUnicos.length}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-500 font-bold animate-pulse">Carregando usuários...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-rose-50 border border-rose-100 rounded-[2.5rem] text-rose-600">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p className="font-black uppercase tracking-widest text-sm">Erro ao carregar dados</p>
          <p className="text-rose-400 text-xs mt-1">{(error as any).message || 'Tente novamente mais tarde'}</p>
        </div>
      ) : filteredUsuarios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm text-slate-400">
          <Users className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg font-black tracking-tight">Nenhum usuário encontrado</p>
          <p className="text-sm font-medium">Tente ajustar sua busca ou filtros.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredUsuarios.map((usuario) => (
            <div key={usuario.id} className={`bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-600/5 transition-all duration-500 group relative overflow-hidden ${viewMode === 'list' ? 'p-4 flex items-center gap-6' : 'p-6'}`}>

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
                      onClick: () => handleViewProfile(usuario)
                    },
                    {
                      label: 'Editar',
                      icon: Pencil,
                      onClick: () => handleEdit(usuario)
                    },
                    {
                      label: usuario.status === 'ativo' ? 'Desativar' : 'Ativar',
                      icon: usuario.status === 'ativo' ? UserX : UserCheck,
                      onClick: () => handleToggleStatus(usuario)
                    },
                    {
                      label: 'Excluir',
                      icon: Trash2,
                      onClick: () => handleDeleteClick(usuario),
                      variant: 'danger'
                    }
                  ]}
                />
              </div>

              <div className={`flex items-center ${viewMode === 'grid' ? 'mb-6' : ''}`}>
                <div className={`${viewMode === 'grid' ? 'w-16 h-16 text-xl' : 'w-12 h-12 text-sm'} rounded-[1.5rem] bg-slate-900 border-4 border-indigo-50 flex items-center justify-center text-white font-black shadow-inner`}>
                  {usuario.primeiro_nome.charAt(0)}
                </div>
                <div className="ml-4 flex-1 min-w-0">
                  <h3 className={`${viewMode === 'grid' ? 'text-lg' : 'text-md'} font-black text-slate-900 tracking-tight truncate`}>
                    {usuario.primeiro_nome} {usuario.sobrenome}
                  </h3>
                  <div className="flex items-center mt-1 gap-2">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                      {usuario.patente || usuario.perfil_acesso}
                    </span>
                    {usuario.status === 'ativo' ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    )}
                  </div>
                </div>
              </div>

              <div className={viewMode === 'grid' ? "space-y-3 mb-6" : "flex flex-1 items-center gap-8 px-4"}>
                <div className="flex items-center text-sm text-slate-500 group/item min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center mr-3 group-hover/item:text-indigo-600 transition-colors shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="font-semibold truncate">{usuario.email || 'Email pendente'}</span>
                </div>
                <div className="flex items-center text-sm text-slate-500 group/item min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center mr-3 group-hover/item:text-indigo-600 transition-colors shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="font-semibold truncate">{usuario.telefone || 'Sem telefone'}</span>
                </div>
                <div className="flex items-center text-sm text-slate-500 group/item min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center mr-3 group-hover/item:text-indigo-600 transition-colors shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-slate-700 truncate">{usuario.matricula || '---'}</span>
                </div>
              </div>

              {viewMode === 'grid' && (
                <div className="pt-6 border-t border-slate-100 flex gap-3">
                  <button
                    onClick={() => handleViewProfile(usuario)}
                    className="flex-1 flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-all"
                  >
                    Visualizar Perfil
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(usuario)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
                  >
                    <Pencil className="w-3 h-3" /> Editar
                  </button>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      <UsuarioProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        usuario={selectedUsuario}
      />

      <UsuarioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        usuario={editingUsuario}
        isLoading={createUsuario.isPending || updateUsuario.isPending}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setUsuarioToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Excluir Usuário"
        description={`Tem certeza que deseja excluir ${usuarioToDelete ? `${usuarioToDelete.primeiro_nome} ${usuarioToDelete.sobrenome}` : 'este usuário'}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        loading={deleteUsuario.isPending}
        variant="danger"
      />

    </div>
  );
}
