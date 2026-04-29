import React, { useState, useEffect } from 'react';
import { X, Mail, UserPlus, Loader2, Shield, Phone, ChevronDown, Badge, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { usePatentes } from '@/hooks/useUsuarios';

interface UsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    email: string;
    primeiro_nome: string;
    sobrenome: string;
    telefone: string;
    perfil_acesso: string;
    patente: string;
    matricula: string;
    funcao_operacional: string;
    senha?: string;
  }) => void;
  usuario?: any | null;
  isLoading?: boolean;
}

const ACCESS_PROFILES = [
  { value: 'secretario', label: 'Secretário' },
  { value: 'gestor', label: 'Gestor' },
  { value: 'comandante_geral', label: 'Comandante Geral' },
  { value: 'chefe_equipe', label: 'Chefe de Equipe' },
  { value: 'gcm', label: 'GCM' },
  { value: 'operador_radio', label: 'Operador de Rádio' },
  { value: 'gestor_financeiro', label: 'Gestor Financeiro' },
  { value: 'administrativo', label: 'Administrativo' },
];

export function UsuarioModal({ isOpen, onClose, onSubmit, usuario, isLoading = false }: UsuarioModalProps) {
  const { data: patentes, isLoading: loadingPatentes } = usePatentes();
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    primeiro_nome: '',
    sobrenome: '',
    telefone: '',
    perfil_acesso: 'gcm',
    patente: '',
    matricula: '',
    funcao_operacional: '',
    senha: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (usuario) {
      setFormData({
        email: usuario.email || '',
        primeiro_nome: usuario.primeiro_nome || '',
        sobrenome: usuario.sobrenome || '',
        telefone: usuario.telefone || '',
        perfil_acesso: usuario.perfil_acesso || 'gcm',
        patente: usuario.patente || '',
        matricula: usuario.matricula || '',
        funcao_operacional: usuario.funcao_operacional || '',
        senha: '',
      });
    } else {
      setFormData({
        email: '',
        primeiro_nome: '',
        sobrenome: '',
        telefone: '',
        perfil_acesso: 'gcm',
        patente: '',
        matricula: '',
        funcao_operacional: '',
        senha: '',
      });
    }
    setErrors({});
  }, [usuario, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.primeiro_nome.trim()) {
      newErrors.primeiro_nome = 'Nome é obrigatório';
    }
    
    if (!formData.sobrenome.trim()) {
      newErrors.sobrenome = 'Sobrenome é obrigatório';
    }

    if (formData.telefone && formData.telefone.replace(/\D/g, '').length < 10) {
      newErrors.telefone = 'Telefone inválido';
    }
    
    if (!usuario && !formData.senha.trim()) {
      newErrors.senha = 'Senha é obrigatória para novos usuários';
    } else if (!usuario && formData.senha.length < 6) {
      newErrors.senha = 'A senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="relative p-8 pb-6">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
            {usuario ? <User className="w-8 h-8 text-indigo-600" /> : <UserPlus className="w-8 h-8 text-indigo-600" />}
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {usuario ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <p className="text-slate-500 font-medium text-sm mt-1">
            {usuario ? 'Atualize os dados do usuário.' : 'Preencha os dados para criar um novo usuário.'}
          </p>
        </div>

        <div className="px-8 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nome *</label>
              <input
                type="text"
                value={formData.primeiro_nome}
                onChange={(e) => setFormData({ ...formData, primeiro_nome: e.target.value })}
                className={`w-full h-12 px-4 bg-slate-50 border ${errors.primeiro_nome ? 'border-red-300' : 'border-slate-200'} rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all`}
                placeholder="Nome"
                disabled={isLoading}
              />
              {errors.primeiro_nome && <p className="text-xs text-red-500 mt-1 font-medium">{errors.primeiro_nome}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Sobrenome *</label>
              <input
                type="text"
                value={formData.sobrenome}
                onChange={(e) => setFormData({ ...formData, sobrenome: e.target.value })}
                className={`w-full h-12 px-4 bg-slate-50 border ${errors.sobrenome ? 'border-red-300' : 'border-slate-200'} rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all`}
                placeholder="Sobrenome"
                disabled={isLoading}
              />
              {errors.sobrenome && <p className="text-xs text-red-500 mt-1 font-medium">{errors.sobrenome}</p>}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full h-12 pl-10 pr-4 bg-slate-50 border ${errors.email ? 'border-red-300' : 'border-slate-200'} rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all`}
                placeholder="email@exemplo.com"
                disabled={isLoading}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1 font-medium">{errors.email}</p>}
          </div>

          {!usuario && (
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Senha de Acesso *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  className={`w-full h-12 pl-10 pr-12 bg-slate-50 border ${errors.senha ? 'border-red-300' : 'border-slate-200'} rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all`}
                  placeholder="Mínimo 6 caracteres"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.senha && <p className="text-xs text-red-500 mt-1 font-medium">{errors.senha}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Telefone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: maskPhone(e.target.value) })}
                  className={`w-full h-12 pl-10 pr-4 bg-slate-50 border ${errors.telefone ? 'border-red-300' : 'border-slate-200'} rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all`}
                  placeholder="(00) 00000-0000"
                  disabled={isLoading}
                />
              </div>
              {errors.telefone && <p className="text-xs text-red-500 mt-1 font-medium">{errors.telefone}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Matrícula (RE)</label>
              <div className="relative">
                <Badge className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.matricula}
                  onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                  className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all"
                  placeholder="12345"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Perfil de Acesso</label>
              <div className="relative group">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={formData.perfil_acesso}
                  onChange={(e) => setFormData({ ...formData, perfil_acesso: e.target.value })}
                  className="w-full h-12 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all appearance-none cursor-pointer hover:bg-white"
                  disabled={isLoading}
                >
                  {ACCESS_PROFILES.map(profile => (
                    <option key={profile.value} value={profile.value}>{profile.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Patente</label>
              <div className="relative group">
                <select
                  value={formData.patente}
                  onChange={(e) => setFormData({ ...formData, patente: e.target.value })}
                  className="w-full h-12 px-4 pr-10 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all appearance-none cursor-pointer hover:bg-white"
                  disabled={isLoading || loadingPatentes}
                >
                  <option value="">Selecione</option>
                  {patentes?.map(patente => (
                    <option key={patente.id} value={patente.nome}>{patente.nome}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Função Operacional</label>
            <input
              type="text"
              value={formData.funcao_operacional}
              onChange={(e) => setFormData({ ...formData, funcao_operacional: e.target.value })}
              className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all"
              placeholder="Ex: Patrulha, Apoio, Fiscalização"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-6 py-4 bg-white border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-6 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (usuario ? <User className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />)}
            {usuario ? 'Salvar' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  );
}
