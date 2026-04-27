import React from 'react';
import { X, Mail, Phone, Shield, Badge, Calendar, Clock, UserCheck, UserX } from 'lucide-react';
import type { Member } from '@/hooks/useMembers';

interface MemberProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

export function MemberProfileModal({ isOpen, onClose, member }: MemberProfileModalProps) {
  if (!isOpen || !member) return null;

  const fullName = `${member.primeiro_nome} ${member.sobrenome}`;

  const infoItems = [
    { icon: Mail, label: 'Email', value: member.email || 'Não informado' },
    { icon: Phone, label: 'Telefone', value: member.telefone || 'Não informado' },
    { icon: Shield, label: 'Matrícula (RE)', value: member.matricula || 'Não informado' },
    { icon: Badge, label: 'Patente', value: member.patente || 'Não informado' },
    { icon: UserCheck, label: 'Função', value: member.funcao_operacional || 'Não informado' },
    { icon: UserCheck, label: 'Perfil de Acesso', value: member.perfil_acesso || 'Não informado' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="relative p-8 pb-6 bg-gradient-to-br from-slate-50 to-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-[1.5rem] bg-slate-900 border-4 border-indigo-50 flex items-center justify-center text-white font-black text-2xl shadow-inner">
              {member.primeiro_nome.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{fullName}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                  {member.patente || member.perfil_acesso}
                </span>
                <div className={`w-2 h-2 rounded-full ${member.status === 'ativo' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
                <span className="text-xs font-semibold text-slate-500 capitalize">{member.status}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-4">
          {infoItems.map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                <p className="text-sm font-semibold text-slate-700 truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
