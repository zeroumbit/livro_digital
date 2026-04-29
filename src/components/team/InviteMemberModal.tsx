import React, { useState } from 'react';
import { X, Mail, UserPlus, Loader2, Shield, Eye, EyeOff, Lock, ChevronDown } from 'lucide-react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (data: {
    email: string;
    senha: string;
    primeiro_nome: string;
    sobrenome: string;
    perfil_acesso: string;
    patente: string;
  }) => void;
  isLoading?: boolean;
}

const ACCESS_PROFILES = [
  { value: 'gestor', label: 'Gestor' },
  { value: 'comandante_geral', label: 'Comandante Geral' },
  { value: 'chefe_equipe', label: 'Chefe de Equipe' },
  { value: 'gcm', label: 'GCM' },
  { value: 'operador_radio', label: 'Operador de Rádio' },
  { value: 'gestor_financeiro', label: 'Gestor Financeiro' },
  { value: 'administrativo', label: 'Administrativo' },
];

import { usePatentes } from '@/hooks/useMembers';

export function InviteMemberModal({ isOpen, onClose, onInvite, isLoading = false }: InviteMemberModalProps) {
  const { data: patentes, isLoading: loadingPatentes } = usePatentes();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    primeiro_nome: '',
    sobrenome: '',
    perfil_acesso: 'gcm',
    patente: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.senha.trim()) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'A senha deve ter pelo menos 6 caracteres';
    }

    if (!formData.primeiro_nome.trim()) {
      newErrors.primeiro_nome = 'Nome é obrigatório';
    }

    if (!formData.sobrenome.trim()) {
      newErrors.sobrenome = 'Sobrenome é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onInvite(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      email: '',
      senha: '',
      primeiro_nome: '',
      sobrenome: '',
      perfil_acesso: 'gcm',
      patente: '',
    });
    setErrors({});
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">

        <div className="relative p-8 pb-6">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-indigo-600" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Convidar Membro</h2>
          <p className="text-slate-500 font-medium text-sm mt-1">Preencha os dados para adicionar um novo membro à equipe.</p>
        </div>

        <div className="px-8 space-y-4 max-h-[60vh] overflow-y-auto">

          {/* EMAIL */}
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

          {/* SENHA */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Senha Inicial *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                className={`w-full h-12 pl-10 pr-12 bg-slate-50 border ${errors.senha ? 'border-red-300' : 'border-slate-200'} rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all`}
                placeholder="Mínimo 6 caracteres"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.senha && <p className="text-xs text-red-500 mt-1 font-medium">{errors.senha}</p>}
            <p className="text-[10px] text-slate-400 mt-1 font-medium">O membro pode alterar a senha após o primeiro acesso.</p>
          </div>

          {/* NOME + SOBRENOME */}
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

          {/* PERFIL + PATENTE */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Perfil de Acesso</label>
              <div className="relative group">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" />
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
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
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
                  <option value="" disabled>Selecione uma patente</option>
                  {patentes?.map(patente => (
                    <option key={patente.id} value={patente.nome}>{patente.nome}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
              </div>
            </div>
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
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Criar Acesso
          </button>
        </div>
      </div>
    </div>
  );
}
