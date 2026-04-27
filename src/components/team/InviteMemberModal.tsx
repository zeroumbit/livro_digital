import React, { useState } from 'react';
import { X, Mail, UserPlus, Loader2, Shield, Phone } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (data: { email: string; primeiro_nome: string; sobrenome: string; telefone: string; perfil_acesso: string; patente: string }) => void;
  isLoading?: boolean;
}

const ACCESS_PROFILES = [
  { value: 'gestor', label: 'Gestor' },
  { value: 'operador', label: 'Operador' },
  { value: 'agente', label: 'Agente' },
];

const PATENTES = [
  { value: 'Coronel', label: 'Coronel' },
  { value: 'Tenente-Coronel', label: 'Tenente-Coronel' },
  { value: 'Major', label: 'Major' },
  { value: 'Capitão', label: 'Capitão' },
  { value: '1º Tenente', label: '1º Tenente' },
  { value: '2º Tenente', label: '2º Tenente' },
  { value: 'Subtenente', label: 'Subtenente' },
  { value: '1º Sargento', label: '1º Sargento' },
  { value: '2º Sargento', label: '2º Sargento' },
  { value: '3º Sargento', label: '3º Sargento' },
  { value: 'Cabo', label: 'Cabo' },
  { value: 'Soldado', label: 'Soldado' },
];

export function InviteMemberModal({ isOpen, onClose, onInvite, isLoading = false }: InviteMemberModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    primeiro_nome: '',
    sobrenome: '',
    telefone: '',
    perfil_acesso: 'agente',
    patente: 'Soldado',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
      primeiro_nome: '',
      sobrenome: '',
      telefone: '',
      perfil_acesso: 'agente',
      patente: 'Soldado',
    });
    setErrors({});
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
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Telefone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all"
                placeholder="(00) 00000-0000"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Perfil de Acesso</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={formData.perfil_acesso}
                  onChange={(e) => setFormData({ ...formData, perfil_acesso: e.target.value })}
                  className="w-full h-12 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all appearance-none"
                  disabled={isLoading}
                >
                  {ACCESS_PROFILES.map(profile => (
                    <option key={profile.value} value={profile.value}>{profile.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Patente</label>
              <select
                value={formData.patente}
                onChange={(e) => setFormData({ ...formData, patente: e.target.value })}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all appearance-none"
                disabled={isLoading}
              >
                {PATENTES.map(patente => (
                  <option key={patente.value} value={patente.value}>{patente.label}</option>
                ))}
              </select>
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
            Convidar
          </button>
        </div>
      </div>
    </div>
  );
}
