import React from 'react';
import { 
  X, Shield, User, MapPin, AlertTriangle, 
  Phone, Calendar, ClipboardList, ShieldAlert,
  Download, Printer, FileText, Heart, UserMinus
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export function MariaDaPenhaDetails({ isOpen, onClose, data }: Props) {
  if (!isOpen || !data) return null;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Não informado';
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const Section = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
        <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">{title}</h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    </div>
  );

  const DataField = ({ label, value, fullWidth = false }: { label: string, value: any, fullWidth?: boolean }) => (
    <div className={fullWidth ? 'md:col-span-2 lg:col-span-3' : ''}>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-700">
        {typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : (value || 'Não informado')}
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-5xl bg-slate-50 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        {/* HEADER */}
        <div className="px-8 py-6 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Detalhes da Ocorrência</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-md">Maria da Penha</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">OC-{data.numero_oficial || data.id.substring(0, 8)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all">
              <Printer className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 space-y-12">
          
          {/* RESUMO DE RISCO */}
          <div className={`p-8 rounded-[2.5rem] border-2 flex flex-col md:flex-row md:items-center justify-between gap-6 ${
            data.nivel_risco === 'Elevado' ? 'bg-rose-50 border-rose-100 text-rose-900' :
            data.nivel_risco === 'Médio' ? 'bg-amber-50 border-amber-100 text-amber-900' :
            'bg-emerald-50 border-emerald-100 text-emerald-900'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                data.nivel_risco === 'Elevado' ? 'bg-rose-600 text-white' :
                data.nivel_risco === 'Médio' ? 'bg-amber-500 text-white' :
                'bg-emerald-600 text-white'
              }`}>
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Nível de Risco Calculado (FONAR)</p>
                <h3 className="text-3xl font-black tracking-tight">{data.nivel_risco || 'Não Avaliado'}</h3>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.risco_iminente_morte && <span className="px-4 py-2 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-rose-600/20">Risco Iminente de Morte</span>}
              {data.necessita_acolhimento_emergencial && <span className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-indigo-600/20">Necessita Acolhimento</span>}
            </div>
          </div>

          {/* INFORMAÇÕES GERAIS */}
          <Section title="Informações de Origem" icon={FileText}>
            <DataField label="Origem" value={data.origem} />
            <DataField label="Sub-Origem" value={data.sub_origem} />
            <DataField label="Data de Criação" value={formatDate(data.created_at)} />
            <DataField label="Descrição dos Fatos" value={data.descricao} fullWidth />
          </Section>

          {/* LOCALIZAÇÃO */}
          <Section title="Localização" icon={MapPin}>
            <DataField label="Logradouro" value={data.rua} />
            <DataField label="Número" value={data.numero} />
            <DataField label="Bairro" value={data.bairro} />
            <DataField label="CEP" value={data.cep} />
            <DataField label="Cidade/UF" value={`${data.cidade || ''} - ${data.estado || ''}`} />
            <DataField label="Ponto de Referência" value={data.referencia} />
          </Section>

          {/* VÍTIMA */}
          <Section title="Dados da Vítima" icon={Heart}>
            <DataField label="Nome Completo" value={data.vitima_nome} />
            <DataField label="Gênero" value={data.vitima_genero} />
            <DataField label="Data Nascimento" value={formatDate(data.vitima_data_nascimento)} />
            <DataField label="CPF" value={data.vitima_cpf} />
            <DataField label="RG" value={data.vitima_rg} />
            <DataField label="Telefone" value={data.vitima_telefone} />
            <DataField label="Vínculo com Agressor" value={data.vitima_vinculo_agressor} />
            <DataField label="Tempo Relacionamento" value={data.vitima_tempo_relacionamento} />
            <DataField label="Possui Filhos?" value={data.vitima_tem_filhos} />
            {data.vitima_tem_filhos && (
              <>
                <DataField label="Nº de Filhos" value={data.vitima_num_filhos} />
                <DataField label="Idades" value={data.vitima_idades_filhos} />
                <DataField label="No Local?" value={data.vitima_filhos_no_local} />
              </>
            )}
          </Section>

          {/* AGRESSOR */}
          <Section title="Dados do Agressor" icon={UserMinus}>
            <DataField label="Nome Completo" value={data.agressor_nome} />
            <DataField label="Gênero" value={data.agressor_genero} />
            <DataField label="CPF/RG" value={`${data.agressor_cpf || ''} / ${data.agressor_rg || ''}`} />
            <DataField label="Telefone" value={data.agressor_telefone} />
            <DataField label="Possui Arma?" value={data.agressor_possui_arma} />
            <DataField label="Tipo de Arma" value={data.agressor_tipo_arma} />
            <DataField label="Uso de Álcool" value={data.agressor_usa_alcool} />
            <DataField label="Uso de Drogas" value={data.agressor_usa_drogas} />
            <DataField label="Antecedentes?" value={data.agressor_antecedentes} />
            <DataField label="Observações Agressor" value={data.agressor_observacoes} fullWidth />
          </Section>

          {/* DETALHES DA VIOLÊNCIA */}
          <Section title="Fatos e Lesões" icon={AlertTriangle}>
            <DataField label="Tipos de Violência" value={data.tipos_violencia?.join(', ')} fullWidth />
            <DataField label="Primeira Agressão?" value={data.primeira_agressao} />
            <DataField label="Data da Última" value={formatDate(data.data_ultima_agressao)} />
            <DataField label="Hora" value={data.hora_agressao} />
            <DataField label="Local" value={data.local_agressao} />
            <DataField label="Uso de Arma (Fogo/Branca/Obj)" value={`${data.uso_arma_fogo?'Fogo ':''}${data.uso_arma_branca?'Branca ':''}${data.uso_objeto_contundente?'Objeto':''}` || 'Não'} />
            <DataField label="Vítima buscou Médico?" value={data.vitima_buscou_atendimento} />
            <DataField label="Lesões Visíveis?" value={data.lesoes_visiveis} />
            <DataField label="Descrição das Lesões" value={data.lesoes_descricao} fullWidth />
            <DataField label="Há Testemunhas?" value={data.ha_testemunhas} />
            <DataField label="Nomes Testemunhas" value={data.testemunhas_nomes} fullWidth />
          </Section>

          {/* FONAR DETALHADO */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Protocolo FONAR - Respostas Positivas</h4>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Filtrar apenas o que foi respondido como true */}
               {Object.entries(data).filter(([key, val]) => key.startsWith('fonar_') && val === true).map(([key, _]) => (
                 <div key={key} className="flex items-center gap-3 text-xs font-bold text-rose-600">
                    <div className="w-2 h-2 bg-rose-500 rounded-full shrink-0" />
                    <span>{getFonarQuestionText(key)}</span>
                 </div>
               ))}
               {Object.entries(data).filter(([key, val]) => key.startsWith('fonar_') && val === true).length === 0 && (
                 <p className="text-sm text-slate-400 font-medium italic col-span-2">Nenhum marcador de risco positivo no protocolo FONAR.</p>
               )}
            </div>
          </div>

          {/* ENCAMINHAMENTOS E MEDIDAS */}
          <Section title="Medidas e Encaminhamentos" icon={Shield}>
            <DataField label="Deseja Medidas Protetivas?" value={data.deseja_medidas_protetivas} />
            <DataField label="Medidas Solicitadas" value={data.medidas_solicitadas?.join(', ')} fullWidth />
            <DataField label="Encaminhamentos Realizados" value={data.encaminhamentos_realizados?.join(', ')} fullWidth />
          </Section>

          {/* FOTOS */}
          {data.fotos && data.fotos.length > 0 && (
            <div className="space-y-4 pb-12">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Anexos Fotográficos</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.fotos.map((foto: string, idx: number) => (
                  <div key={idx} className="aspect-square bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm group relative">
                    <img src={foto} alt={`Anexo ${idx + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <a href={foto} target="_blank" rel="noreferrer" className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                       <Download className="w-6 h-6 text-white" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getFonarQuestionText(key: string): string {
  const questions: Record<string, string> = {
    fonar_p1_q1: 'Histórico de violências anteriores',
    fonar_p1_q2: 'Aumento de frequência/gravidade (12 meses)',
    fonar_p1_q3: 'Descumprimento de medida protetiva',
    fonar_p1_q4: 'Ameaça de morte contra vítima/família',
    fonar_p1_q5: 'Tentativa de estrangulamento/sufocamento',
    fonar_p1_q6: 'Uso de arma de fogo em ameaças',
    fonar_p1_q7: 'Espancamento durante gravidez',
    fonar_p1_q8: 'Ameaça de morte envolvendo filhos',
    fonar_p2_q1: 'Uso abusivo de álcool pelo agressor',
    fonar_p2_q2: 'Uso de drogas ilícitas pelo agressor',
    fonar_p2_q3: 'Agressor possui arma de fogo',
    fonar_p2_q4: 'Ciúme excessivo / Controle obsessivo',
    fonar_p2_q5: 'Agressor persegue a vítima (Stalking)',
    fonar_p3_q1: 'Vítima depende financeiramente',
    fonar_p3_q2: 'Vítima teme por sua vida',
    fonar_p3_q3: 'Vítima está isolada socialmente',
    fonar_p3_q4: 'Presença de crianças no local',
    fonar_p3_q5: 'Vítima tentou separação recentemente'
  };
  return questions[key] || key;
}
