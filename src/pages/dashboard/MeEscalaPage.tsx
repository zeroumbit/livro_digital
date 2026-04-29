import React from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  CalendarDays,
  History,
  Shield,
  ArrowRight
} from 'lucide-react';
import { useMyEscala } from '@/hooks/useEscalas';
import { useAuthStore } from '@/store/useAuthStore';

const TIPOS_ESCALA: Record<string, string> = {
  '12x72': '12x72 (12h trabalho / 72h folga)',
  '12x36': '12x36 (12h trabalho / 36h folga)',
  '24x48': '24x48 (24h trabalho / 48h folga)',
  '24x72': '24x72 (24h trabalho / 72h folga)',
  '6x1': '6x1 (6 dias trabalho / 1 dia folga)',
  '5x2': '5x2 (5 dias trabalho / 2 dias folga)',
  '12x60': '12x60 (12h trabalho / 60h folga)',
  '8x40': '8x40 (8h trabalho / 40h folga)',
  'mista_8_12': 'Mista 8/12 (Escala híbrida)',
  '4x2': '4x2 (4 dias trabalho / 2 dias folga)',
  '24x24': '24x24 (24h trabalho / 24h folga)',
  '48x96': '48x96 (48h trabalho / 96h folga)',
  'dias_semana': 'Dias da Semana (Escala comercial)',
};

export function MeEscalaPage() {
  const profile = useAuthStore(state => state.profile);
  const { data: minhaEscala, isLoading, error } = useMyEscala();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse">Carregando sua escala...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-rose-50 border border-rose-100 rounded-[2.5rem] text-rose-600">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p className="font-black uppercase tracking-widest text-sm">Erro ao carregar escala</p>
        <p className="text-rose-400 text-xs mt-1">{(error as any).message || 'Tente novamente mais tarde'}</p>
      </div>
    );
  }

  const escala = minhaEscala?.escala;
  const equipe = minhaEscala?.equipe;

  return (
    <div className="space-y-6 lg:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Minha Escala</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">
            Consulte seus horários e período de serviço atual.
          </p>
        </div>
      </div>

      {!escala ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm text-slate-400">
          <CalendarDays className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg font-black tracking-tight text-slate-600">Nenhuma escala vinculada</p>
          <p className="text-sm font-medium mt-1">Você ainda não foi alocado em nenhuma escala de serviço.</p>
          <p className="text-xs text-slate-400 mt-4 max-w-md text-center">
            Entre em contato com o gestor da sua unidade para verificar sua alocação de horários.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CARD PRINCIPAL DA ESCALA */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Calendar className="w-32 h-32 text-indigo-600" />
              </div>

              <div className="relative">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                    <Shield className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Serviço Ativo</h2>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Instituição: {profile?.instituicao_id?.substring(0, 8)}...</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo de Escala</p>
                        <p className="text-lg font-black text-slate-900">{TIPOS_ESCALA[escala.tipo_escala] || escala.tipo_escala}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Período de Validade</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold text-slate-900">{new Date(escala.data_inicio).toLocaleDateString('pt-BR')}</span>
                          <ArrowRight className="w-3 h-3 text-slate-300" />
                          <span className="font-bold text-slate-900">{new Date(escala.data_fim).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Equipe Vinculada</p>
                        <p className="text-lg font-black text-indigo-600">{equipe?.nome || 'Sem equipe vinculada'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status da Escala</p>
                        <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200 mt-1">
                          {escala.status === 'ativa' ? 'Ativa e Válida' : 'Inativa'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {escala.tipo_escala === 'dias_semana' && escala.dias_semana && (
                  <div className="mt-8 pt-8 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Dias de Atuação</p>
                    <div className="flex flex-wrap gap-2">
                      {['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'].map((dia) => {
                        const isActive = escala.dias_semana.includes(dia);
                        return (
                          <div 
                            key={dia}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                              isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-50 text-slate-400 opacity-50'
                            }`}
                          >
                            {dia.substring(0, 3)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* INFORMAÇÕES ADICIONAIS / LEMBRETES */}
            <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Aviso de Plantão</h4>
                <p className="text-sm text-amber-700/80 font-medium mt-1">
                  Lembre-se de registrar sua entrada e saída no livro digital. Em caso de atraso ou falta justificada, informe imediatamente seu superior imediato.
                </p>
              </div>
            </div>
          </div>

          {/* LATERAL: RESUMO E HISTÓRICO (Simulado) */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <History className="w-5 h-5 text-indigo-600" /> Próximos Passos
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fim da Vigência</p>
                  <p className="text-sm font-bold text-slate-700">
                    Sua escala atual vence em {new Date(escala.data_fim).toLocaleDateString('pt-BR')}.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Troca de Horário</p>
                  <p className="text-sm font-bold text-slate-700">
                    Solicitações de permuta devem ser feitas com 48h de antecedência.
                  </p>
                </div>
              </div>
              <button className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                Solicitar Ajuste
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
