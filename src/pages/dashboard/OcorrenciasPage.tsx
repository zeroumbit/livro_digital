import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: { type?: string; quality?: number };
    html2canvas?: { scale?: number; useCORS?: boolean };
    jsPDF?: { unit?: string; format?: string; orientation?: string };
  }
  function set(options: Html2PdfOptions): any;
  function from(element: any): any;
  function save(): Promise<void>;
}
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Clock,
  MapPin,
  ShieldAlert,
  X,
  MessageSquare,
  MessageSquarePlus,
  Send,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  Zap,
  Shield,
  Phone,
  FileText,
  SlidersHorizontal,
  Calendar,
  Printer,
  Download,
  Loader2,
  User,
  Navigation,
  Camera,
  Image as ImageIcon
} from 'lucide-react';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuthStore } from '@/store/useAuthStore';

import { OcorrenciaMultiStepForm } from '@/components/forms/OcorrenciaMultiStepForm';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

import { useOccurrences } from '@/hooks/useOccurrences';

const TIPOS_FILTRO = [
  { value: 'rua', label: 'Por Rua' },
  { value: 'bairro', label: 'Por Bairro/Distrito' },
  { value: 'horario', label: 'Por Horário' },
  { value: 'genero', label: 'Por Gênero' },
  { value: 'veiculo', label: 'Tipo de Veículo' },
  { value: 'origem', label: 'Iniciado por' },
];

const CustomSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  label?: string;
}> = ({ value, onChange, options, placeholder = 'Selecione...', label }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {label && (
        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{label}</label>
      )}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-left flex items-center justify-between hover:border-indigo-300 transition-colors"
      >
        <span className={value ? 'text-slate-700' : 'text-slate-400'}>
          {value ? options.find(o => o.value === value)?.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-indigo-50 hover:text-indigo-600 transition-colors first:rounded-t-xl last:rounded-b-xl"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const RuasUnicas: React.FC<{isOpen: boolean; onClose: () => void; onSelect: (rua: string) => void; data: string[]}> = ({ isOpen, onClose, onSelect, data }) => (
  <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm ${isOpen ? '' : 'hidden'}`}>
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-black text-slate-900">Filtrar por Rua</h2>
        <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
      </div>
      <div className="max-h-80 overflow-y-auto space-y-2">
        {data.length === 0 ? (
          <p className="text-center text-slate-400 py-8">Sem dados para esse tipo de filtro no momento.</p>
        ) : (
          data.map(rua => (
            <button
              key={rua}
              onClick={() => { onSelect(rua); onClose(); }}
              className="w-full text-left px-4 py-3 rounded-xl hover:bg-indigo-50 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
            >
              {rua}
            </button>
          ))
        )}
      </div>
    </div>
  </div>
);

const BairrosModal: React.FC<{isOpen: boolean; onClose: () => void; onSelect: (bairro: string) => void; data: string[]}> = ({ isOpen, onClose, onSelect, data }) => (
  <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm ${isOpen ? '' : 'hidden'}`}>
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-black text-slate-900">Filtrar por Bairro/Distrito</h2>
        <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
      </div>
      <div className="max-h-80 overflow-y-auto space-y-2">
        {data.length === 0 ? (
          <p className="text-center text-slate-400 py-8">Sem dados para esse tipo de filtro no momento.</p>
        ) : (
          data.map(bairro => (
            <button
              key={bairro}
              onClick={() => { onSelect(bairro); onClose(); }}
              className="w-full text-left px-4 py-3 rounded-xl hover:bg-indigo-50 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
            >
              {bairro}
            </button>
          ))
        )}
      </div>
    </div>
  </div>
);

const GenerosModal: React.FC<{isOpen: boolean; onClose: () => void; onSelect: (genero: string) => void; data: string[]}> = ({ isOpen, onClose, onSelect, data }) => (
  <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm ${isOpen ? '' : 'hidden'}`}>
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-black text-slate-900">Filtrar por Gênero</h2>
        <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
      </div>
      <div className="max-h-80 overflow-y-auto space-y-2">
        {data.length === 0 ? (
          <p className="text-center text-slate-400 py-8">Sem dados para esse tipo de filtro no momento.</p>
        ) : (
          data.map(genero => (
            <button
              key={genero}
              onClick={() => { onSelect(genero); onClose(); }}
              className="w-full text-left px-4 py-3 rounded-xl hover:bg-indigo-50 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
            >
              {genero}
            </button>
          ))
        )}
      </div>
    </div>
  </div>
);

const VeiculosModal: React.FC<{isOpen: boolean; onClose: () => void; onSelect: (veiculo: string) => void;}> = ({ isOpen, onClose, onSelect }) => {
  const veiculos = ['Carro', 'Moto'];
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm ${isOpen ? '' : 'hidden'}`}>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-slate-900">Filtrar por Tipo de Veículo</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="space-y-2">
          {veiculos.map(v => (
            <button
              key={v}
              onClick={() => { onSelect(v); onClose(); }}
              className="w-full text-left px-4 py-3 rounded-xl hover:bg-indigo-50 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const OrigemModal: React.FC<{isOpen: boolean; onClose: () => void; onSelect: (origem: string) => void; data: { tipo: string; label: string }[]}> = ({ isOpen, onClose, onSelect, data }) => (
  <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm ${isOpen ? '' : 'hidden'}`}>
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-black text-slate-900">Filtrar por Iniciado por</h2>
        <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
      </div>
      <div className="space-y-2">
        {data.map(item => (
          <button
            key={item.tipo}
            onClick={() => { onSelect(item.tipo); onClose(); }}
            className="w-full text-left px-4 py-3 rounded-xl hover:bg-indigo-50 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  </div>
);

const HorarioModal: React.FC<{isOpen: boolean; onClose: () => void; onApply: (inicio: string, fim: string) => void;}> = ({ isOpen, onClose, onApply }) => {
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');

  const handleApply = () => {
    onApply(horaInicio, horaFim);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm ${isOpen ? '' : 'hidden'}`}>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-slate-900">Filtrar por Horário</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Hora Início</label>
            <input 
              type="time"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Hora Fim</label>
            <input 
              type="time"
              value={horaFim}
              onChange={(e) => setHoraFim(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
            />
          </div>
          <button 
            onClick={handleApply}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-sm uppercase tracking-wider hover:bg-indigo-700 transition-all"
          >
            Aplicar Filtro
          </button>
        </div>
      </div>
    </div>
  );
};

const OcorrenciaRow = React.memo(({ oc, onOpenDetails, onEdit, onDelete, onOpenAnotacoes, onDownloadPdf, onPrint }: any) => {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-8 py-6">
        <span className="font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg text-xs tracking-tighter">
          OC-{oc.numero_oficial}
        </span>
      </td>
      <td className="px-6 py-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mr-3 group-hover:bg-white transition-colors">
            <ShieldAlert className="w-5 h-5 text-slate-400" />
          </div>
          <span className="font-bold text-slate-700 truncate max-w-[200px]">{oc.natureza?.[0]}</span>
        </div>
      </td>
      <td className="px-6 py-6">
        <div className="flex flex-col">
           <div className="flex items-center gap-1.5">
              {oc.origem_tipo === 'RADIO' ? <Phone className="w-3 h-3 text-indigo-500" /> : <Shield className="w-3 h-3 text-emerald-500" />}
              <span className="text-xs font-black text-slate-600 uppercase tracking-tighter">{oc.origem || 'EQUIPE'}</span>
           </div>
           {oc.tipo_origem && <span className="text-[10px] text-slate-400 font-bold ml-4.5">{oc.tipo_origem}</span>}
        </div>
      </td>
      <td className="px-6 py-6">
        <div className="flex flex-col">
          <span className="text-slate-600 font-medium truncate max-w-[150px]">{oc.rua}{oc.numero ? `, ${oc.numero}` : ''}</span>
          <span className="text-[10px] text-slate-400 flex items-center mt-1 uppercase font-bold tracking-widest">
            {oc.bairro}
          </span>
        </div>
      </td>
      <td className="px-6 py-6">
        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
          oc.status === 'rascunho' ? 'bg-slate-100 text-slate-600' : 
          oc.status === 'finalizada' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
        }`}>
          {oc.status === 'rascunho' ? <Clock className="w-3 h-3 mr-1.5" /> : <CheckCircle2 className="w-3 h-3 mr-1.5" />}
          {oc.status}
        </span>
      </td>
      <td className="px-8 py-6 text-right">
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => onOpenDetails(oc)}
            title="Ver detalhes"
            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-200 transition-all"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {oc.status === 'finalizada' && (
            <button 
              onClick={() => onOpenAnotacoes(oc)}
              title="Adicionar anotações / histórico"
              className="p-2.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl shadow-sm border border-transparent hover:border-amber-200 transition-all"
            >
              <MessageSquarePlus className="w-4 h-4" />
            </button>
          )}

          <button 
            onClick={() => onDownloadPdf(oc)}
            title="Baixar PDF"
            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-200 transition-all"
          >
            <Download className="w-4 h-4" />
          </button>

          <button 
            onClick={() => onPrint(oc)}
            title="Imprimir"
            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-200 transition-all"
          >
            <Printer className="w-4 h-4" />
          </button>
          
          
          {oc.status === 'rascunho' && (
            <button 
              onClick={() => onEdit(oc)}
              title="Editar ocorrência"
              className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-200 transition-all"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          {!['finalizada', 'arquivada', 'em_atendimento'].includes(oc.status) && (
            <button 
              onClick={() => onDelete(oc)}
              title="Excluir ocorrência"
              className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-slate-200 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
});

interface OcorrenciasPageProps {
  categoria?: 'padrao' | 'maria_da_penha' | 'embriaguez' | 'chamados';
  title?: string;
}

export function OcorrenciasPage({ categoria = 'padrao', title = 'Registro de Ocorrências' }: OcorrenciasPageProps) {
  const navigate = useNavigate();

  const profile = useAuthStore(state => state.profile);
  const { data: ocorrenciasData, isLoading: loading, refetch: fetchOcorrencias } = useOccurrences(categoria);
  const ocorrencias = (ocorrenciasData as any[]) || [];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedOc, setSelectedOc] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const [editMode, setEditMode] = useState(false);
  
  const [anotacoes, setAnotacoes] = useState<any[]>([]);
  const [envolvidos, setEnvolvidos] = useState<any[]>([]);
  const [novaAnotacao, setNovaAnotacao] = useState('');
  const [sendingNota, setSendingNota] = useState(false);
  const [isAnotacoesOpen, setIsAnotacoesOpen] = useState(false);


  const [filterTipo, setFilterTipo] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [filterHoraInicio, setFilterHoraInicio] = useState('');
  const [filterHoraFim, setFilterHoraFim] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterGenero, setFilterGenero] = useState('');
  const [filterVeiculo, setFilterVeiculo] = useState('');
  const [filterOrigem, setFilterOrigem] = useState('');

  const [modalRuasOpen, setModalRuasOpen] = useState(false);
  const [modalBairrosOpen, setModalBairrosOpen] = useState(false);
  const [modalHorarioOpen, setModalHorarioOpen] = useState(false);
  const [modalGenerosOpen, setModalGenerosOpen] = useState(false);
  const [modalVeiculosOpen, setModalVeiculosOpen] = useState(false);
  const [modalOrigemOpen, setModalOrigemOpen] = useState(false);

  const dataRuas = useMemo(() => {
    return [...new Set(ocorrencias.map((oc: any) => oc.rua).filter(Boolean))].sort();
  }, [ocorrencias]);

  const dataBairros = useMemo(() => {
    return [...new Set(ocorrencias.map((oc: any) => oc.bairro).filter(Boolean))].sort();
  }, [ocorrencias]);

  const dataGeneros = useMemo(() => {
    return [...new Set(ocorrencias.map((oc: any) => oc.genero).filter(Boolean))].sort();
  }, [ocorrencias]);

  const dataVeiculos = useMemo(() => {
    return [...new Set(ocorrencias.map((oc: any) => oc.veiculo_tipo).filter(Boolean))].sort();
  }, [ocorrencias]);

  const dataOrigens = [
    { tipo: 'radio', label: 'Rádio' },
    { tipo: 'parceiro', label: 'Parceiros' },
    { tipo: 'agente', label: 'Agente' },
  ];

  const openDetails = async (oc: any) => {
    setSelectedOc(oc);
    setIsDetailsOpen(true);
    fetchAnotacoes(oc.id);
    fetchEnvolvidos(oc.id);
  };

  const openAnotacoes = async (oc: any) => {
    setSelectedOc(oc);
    setIsAnotacoesOpen(true);
    fetchAnotacoes(oc.id);
  };

  const fetchEnvolvidos = async (id: string) => {
    if (categoria === 'maria_da_penha') {
      setEnvolvidos([]); // Vítima e agressor já estão nos campos da tabela
      return;
    }
    const { data } = await supabase
      .from(categoria === 'embriaguez' ? 'embriaguez_envolvidos' : 'ocorrencia_envolvidos')
      .select('*')
      .eq(categoria === 'embriaguez' ? 'embriaguez_id' : 'ocorrencia_id', id);
    if (data) setEnvolvidos(data);
    else setEnvolvidos([]);
  };


  const fetchAnotacoes = async (id: string) => {
    const tableName = categoria === 'maria_da_penha' ? 'maria_da_penha_anotacoes' : categoria === 'embriaguez' ? 'embriaguez_anotacoes' : 'ocorrencia_anotacoes';
    const idField = categoria === 'maria_da_penha' ? 'mdp_id' : categoria === 'embriaguez' ? 'embriaguez_id' : 'ocorrencia_id';
    
    const { data: anotacoesData } = await supabase
      .from(tableName)
      .select('*')
      .eq(idField, id)
      .order('created_at', { ascending: true });

    
    if (anotacoesData && anotacoesData.length > 0) {
      const userIds = [...new Set(anotacoesData.map((a: any) => a.usuario_id))];
      const { data: usersData } = await supabase
        .from('usuarios')
        .select('id, primeiro_nome, sobrenome')
        .in('id', userIds);
      
      const usersMap = new Map((usersData || []).map((u: any) => [u.id, u]));
      const anotacoesWithUsers = anotacoesData.map((a: any) => ({
        ...a,
        usuarios: usersMap.get(a.usuario_id)
      }));
      setAnotacoes(anotacoesWithUsers);
    } else {
      setAnotacoes([]);
    }
  };

  const handleAddAnotacao = async () => {
    if (!novaAnotacao.trim() || novaAnotacao.length < 10 || !selectedOc || !profile?.id) return;
    setSendingNota(true);
    
    const tableName = categoria === 'maria_da_penha' ? 'maria_da_penha_anotacoes' : categoria === 'embriaguez' ? 'embriaguez_anotacoes' : 'ocorrencia_anotacoes';
    const idField = categoria === 'maria_da_penha' ? 'mdp_id' : categoria === 'embriaguez' ? 'embriaguez_id' : 'ocorrencia_id';

    const { error } = await supabase.from(tableName).insert([{
      [idField]: selectedOc.id,
      usuario_id: profile.id,
      texto: novaAnotacao
    }]);
    if (!error) {
      setNovaAnotacao('');
      fetchAnotacoes(selectedOc.id);
      toast.success('Anotação adicionada com sucesso!');
    } else {
      toast.error('Erro ao adicionar anotação.');
    }
    setSendingNota(false);
  };

  const handleDeleteClick = (oc: any) => {
    const statusBloqueados = ['finalizada', 'arquivada', 'em_atendimento'];
    if (statusBloqueados.includes(oc.status)) {
      toast.error(`Ocorrência com status "${oc.status}" não pode ser excluída.`);
      return;
    }
    setSelectedOc(oc);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedOc) return;
    setDeleting(true);
    
    try {
      const tableName = categoria === 'maria_da_penha' ? 'maria_da_penha' : categoria === 'embriaguez' ? 'embriaguez' : 'ocorrencias';
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', selectedOc.id);

      if (error) throw error;
      
      toast.success('Ocorrência excluída com sucesso!');
      fetchOcorrencias();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao excluir ocorrência.');
    } finally {
      setDeleting(false);
      setIsConfirmOpen(false);
      setSelectedOc(null);
    }
  };

  const handleEdit = (oc: any) => {
    if (oc.status === 'finalizada') {
      toast.error('Ocorrências finalizadas não podem ser editadas.');
      return;
    }
    navigate(`/editar/ocorrencia/${oc.id}`);
  };

  const handleDownloadPdf = async (oc: any) => {
    toast.info('Gerando PDF...');
    const printContent = generatePrintContent(oc);
    
    const container = document.createElement('div');
    container.innerHTML = printContent;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    const opt = {
      margin: 10,
      filename: `OC-${oc.numero_oficial}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(container).save();
      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao gerar PDF');
    } finally {
      document.body.removeChild(container);
    }
  };

  const handlePrint = (oc: any) => {
    const printContent = generatePrintContent(oc);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generatePrintContent = (oc: any): string => {
    const data = new Date(oc.created_at).toLocaleString('pt-BR');
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>OC-${oc.numero_oficial}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; }
    .header h1 { font-size: 28px; color: #4f46e5; margin-bottom: 5px; }
    .status { display: inline-block; padding: 5px 15px; background: ${oc.status === 'finalizada' ? '#dcfce7' : '#fef3c7'}; 
              color: ${oc.status === 'finalizada' ? '#16a34a' : '#d97706'}; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
    .section { margin-bottom: 25px; }
    .section h3 { font-size: 14px; color: #64748b; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .field { margin-bottom: 10px; }
    .field label { display: block; font-size: 10px; color: #94a3b8; text-transform: uppercase; }
    .field span { font-size: 14px; font-weight: 600; }
    .naturezas { display: flex; flex-wrap: wrap; gap: 8px; }
    .natureza { background: #e0e7ff; color: #4f46e5; padding: 5px 12px; border-radius: 15px; font-size: 12px; font-weight: bold; }
    .descricao { background: #f8fafc; padding: 20px; border-radius: 10px; font-style: italic; line-height: 1.6; }
    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>OCORRÊNCIA OC-${oc.numero_oficial}</h1>
    <span class="status">${oc.status}</span>
    <p style="margin-top: 10px; font-size: 12px; color: #64748b;">${data}</p>
  </div>

  <div class="section">
    <h3>Origem do Registro</h3>
    <div class="grid">
      <div class="field"><label>Iniciado por</label><span>${oc.origem || 'NÃO INFORMADO'}</span></div>
      <div class="field"><label>Canal</label><span>${oc.tipo_origem || 'DIRETO / CAMPO'}</span></div>
    </div>
  </div>

  <div class="section">
    <h3>Natureza do Fato</h3>
    <div class="naturezas">
      ${(oc.natureza || []).map((n: string) => `<span class="natureza">${n}</span>`).join('')}
    </div>
  </div>

  <div class="section">
    <h3>Localização</h3>
    <div class="grid">
      <div class="field"><label>Rua/Logradouro</label><span>${oc.rua || '---'}</span></div>
      <div class="field"><label>Número</label><span>${oc.numero || 'S/N'}</span></div>
      <div class="field"><label>Bairro</label><span>${oc.bairro || '---'}</span></div>
      <div class="field"><label>CEP</label><span>${oc.cep || '---'}</span></div>
      <div class="field"><label>Cidade/Estado</label><span>${oc.cidade || '---'} ${oc.estado ? '- ' + oc.estado : ''}</span></div>
    </div>
    ${oc.referencia ? `<div class="field" style="margin-top:15px"><label>Ponto de Referência</label><span>"${oc.referencia}"</span></div>` : ''}
  </div>

  <div class="section">
    <h3>Relato dos Fatos</h3>
    <div class="descricao">"${oc.descricao || 'Sem descrição'}"</div>
  </div>

  <div class="footer">
    <p>Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
  </div>
</body>
</html>`;
  };

  const filtered = useMemo(() => {
    return ocorrencias.filter(oc => {
      // Isolamento já feito pelo hook/tabela
      // if (oc.categoria !== categoria) return false;

      const matchSearch = !searchTerm || 
        oc.natureza?.join(' ').toLowerCase().includes(searchTerm.toLowerCase()) ||
        oc.rua?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        oc.numero_oficial?.toString().includes(searchTerm);

      const matchStatus = !filterStatus || oc.status === filterStatus;
      
      let matchDate = true;
      if (filterDateFrom) matchDate = matchDate && new Date(oc.created_at) >= new Date(filterDateFrom);
      if (filterDateTo) matchDate = matchDate && new Date(oc.created_at) <= new Date(filterDateTo);

      let matchRua = true;
      if (filterTipo === 'rua' && filterValue) matchRua = oc.rua === filterValue;

      let matchBairro = true;
      if (filterTipo === 'bairro' && filterValue) matchBairro = oc.bairro === filterValue;

      let matchGenero = true;
      if (filterGenero) matchGenero = oc.genero === filterGenero;

      let matchVeiculo = true;
      if (filterVeiculo) matchVeiculo = oc.veiculo_tipo === filterVeiculo;

      let matchOrigem = true;
      if (filterOrigem) {
        const origemLower = (filterOrigem || '').toLowerCase();
        if (origemLower === 'radio') matchOrigem = oc.origem_tipo === 'RADIO';
        else if (origemLower === 'parceiro') matchOrigem = oc.origem_tipo === 'PARCEIRO';
        else if (origemLower === 'agente') matchOrigem = oc.origem_tipo === 'AGENTE';
      }

      let matchHora = true;
      if (filterHoraInicio || filterHoraFim) {
        const ocHora = new Date(oc.created_at).toTimeString().slice(0, 5);
        if (filterHoraInicio && ocHora < filterHoraInicio) matchHora = false;
        if (filterHoraFim && ocHora > filterHoraFim) matchHora = false;
      }

      return matchSearch && matchStatus && matchDate && matchRua && matchBairro && matchGenero && matchVeiculo && matchOrigem && matchHora;
    });
  }, [ocorrencias, searchTerm, filterStatus, filterDateFrom, filterDateTo, filterTipo, filterValue, filterGenero, filterVeiculo, filterOrigem, filterHoraInicio, filterHoraFim]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterTipo('');
    setFilterValue('');
    setFilterGenero('');
    setFilterVeiculo('');
    setFilterOrigem('');
    setFilterHoraInicio('');
    setFilterHoraFim('');
  };

  const handleTipoChange = (tipo: string) => {
    if (!tipo) return;
    switch(tipo) {
      case 'rua':
        setModalRuasOpen(true);
        break;
      case 'bairro':
        setModalBairrosOpen(true);
        break;
      case 'horario':
        setModalHorarioOpen(true);
        break;
      case 'genero':
        setModalGenerosOpen(true);
        break;
      case 'veiculo':
        setModalVeiculosOpen(true);
        break;
      case 'origem':
        setModalOrigemOpen(true);
        break;
    }
  };

  const getFilterLabel = () => {
    if (filterTipo === 'rua' && filterValue) return `Rua: ${filterValue}`;
    if (filterTipo === 'bairro' && filterValue) return `Bairro: ${filterValue}`;
    if (filterGenero) return `Gênero: ${filterGenero}`;
    if (filterVeiculo) return `Veículo: ${filterVeiculo}`;
    if (filterOrigem) return `Origem: ${filterOrigem}`;
    if (filterHoraInicio || filterHoraFim) return `Hora: ${filterHoraInicio}-${filterHoraFim}`;
    return '';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">{title}</h1>
          <p className="text-slate-500 font-medium mt-1">Gestão operacional e relatórios de campo.</p>
        </div>
        <button 
          onClick={() => {
            const tipo = categoria === 'maria_da_penha' ? 'maria-da-penha' : categoria === 'embriaguez' ? 'embriaguez' : 'padrao';
            navigate(`/criar/ocorrencia/${tipo}`);
          }}
          className="flex items-center justify-center px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="w-5 h-5 mr-3" /> Nova Ocorrência
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-[0.6]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por código, natureza ou endereço..." 
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-600/20 outline-none shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`p-4 bg-white border border-slate-200 rounded-2xl transition-all shadow-sm flex items-center gap-2 ${
              filtersOpen ? 'text-indigo-600 border-indigo-200 bg-indigo-50' : 'text-slate-400 hover:text-indigo-600'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest hidden lg:inline">Filtros</span>
          </button>
        </div>

{filtersOpen && (
          <div className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm space-y-4 animate-in slide-in-from-top-2 duration-200">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <CustomSelect
                  label="Tipos"
                  value={filterTipo}
                  onChange={(val) => { setFilterTipo(val); if (val) handleTipoChange(val); }}
                  options={[
                    { value: '', label: 'Selecione...' },
                    ...TIPOS_FILTRO
                  ]}
                />
                <CustomSelect
                  label="Status"
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={[
                    { value: '', label: 'Todos' },
                    { value: 'rascunho', label: 'Rascunho' },
                    { value: 'finalizada', label: 'Finalizada' },
                    { value: 'em_atendimento', label: 'Em Atendimento' },
                  ]}
                />
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Data Início</label>
                  <input 
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Data Fim</label>
                  <input 
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                  />
                </div>
             </div>
             {getFilterLabel() && (
               <div className="flex items-center gap-2">
                 <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">
                   {getFilterLabel()}
                 </span>
                 <button 
                   onClick={() => {
                     setFilterTipo('');
                     setFilterValue('');
                     setFilterGenero('');
                     setFilterVeiculo('');
                     setFilterOrigem('');
                     setFilterHoraInicio('');
                     setFilterHoraFim('');
                   }}
                   className="text-xs text-slate-400 hover:text-rose-500"
                 >
                   <X className="w-4 h-4" />
                 </button>
               </div>
             )}
             <div className="flex justify-end">
                <button onClick={clearFilters} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-rose-500 uppercase tracking-widest">Limpar Filtros</button>
             </div>
          </div>
)}
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Código</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Natureza</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Origem</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Localização</th>
                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-400">Carregando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-400">Nenhum registro encontrado.</td></tr>
              ) : filtered.map((oc) => (
<OcorrenciaRow 
                    key={oc.id} 
                    oc={oc} 
                    onOpenDetails={openDetails} 
                    onEdit={handleEdit} 
                    onDelete={handleDeleteClick} 
                    onOpenAnotacoes={openAnotacoes}
                    onDownloadPdf={handleDownloadPdf}
                    onPrint={handlePrint}
                  />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <RuasUnicas isOpen={modalRuasOpen} onClose={() => setModalRuasOpen(false)} onSelect={(rua) => { setFilterValue(rua); setFilterTipo('rua'); }} data={dataRuas} />
      <BairrosModal isOpen={modalBairrosOpen} onClose={() => setModalBairrosOpen(false)} onSelect={(bairro) => { setFilterValue(bairro); setFilterTipo('bairro'); }} data={dataBairros} />
      <GenerosModal isOpen={modalGenerosOpen} onClose={() => setModalGenerosOpen(false)} onSelect={(genero) => setFilterGenero(genero)} data={dataGeneros} />
      <VeiculosModal isOpen={modalVeiculosOpen} onClose={() => setModalVeiculosOpen(false)} onSelect={(veiculo) => setFilterVeiculo(veiculo)} />
      <OrigemModal isOpen={modalOrigemOpen} onClose={() => setModalOrigemOpen(false)} onSelect={(origem) => setFilterOrigem(origem)} data={dataOrigens} />
      <HorarioModal isOpen={modalHorarioOpen} onClose={() => setModalHorarioOpen(false)} onApply={(inicio, fim) => { setFilterHoraInicio(inicio); setFilterHoraFim(fim); }} />

      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-white animate-in slide-in-from-bottom-8 duration-500">
          <OcorrenciaMultiStepForm 
            defaultCategoria={categoria}
            onClose={() => setIsFormOpen(false)} 
            onSuccess={() => fetchOcorrencias()} 
          />
        </div>
      )}

      {isDetailsOpen && selectedOc && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
           <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right-8 duration-500">
              {/* Header */}
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Relatório OC-{selectedOc.numero_oficial}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                        selectedOc.status === 'finalizada' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {selectedOc.status}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedOc.categoria}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsDetailsOpen(false)}
                  className="p-3 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                
                {/* 1. Origem e Informações Iniciais */}
                <section className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-3 h-3 text-indigo-500" /> Origem do Registro
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Iniciado por</span>
                      <p className="text-sm font-black text-slate-700 uppercase">
                        {selectedOc.origem || 'NÃO INFORMADO'}
                      </p>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                      <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Sub-origem / Canal</span>
                      <p className="text-sm font-black text-slate-700 uppercase">
                        {selectedOc.tipo_origem || 'DIRETO / CAMPO'}
                      </p>
                    </div>



                  </div>
                  {selectedOc.tipo_origem && (
                    <div className="p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                      <span className="text-[9px] font-black text-indigo-400 uppercase block mb-1">Sub-origem / Detalhe</span>
                      <p className="text-sm font-bold text-indigo-900">{selectedOc.tipo_origem}</p>
                    </div>
                  )}
                </section>

                {/* 2. Natureza e Embriaguez */}
                <section className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert className="w-3 h-3 text-indigo-500" /> Natureza do Fato
                  </h4>
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedOc.natureza?.map((n: string, i: number) => (
                        <span key={i} className="px-4 py-2 bg-white text-indigo-600 text-[10px] font-black rounded-xl border border-indigo-100 shadow-sm uppercase">
                          {n}
                        </span>
                      ))}
                    </div>
                    
                    {selectedOc.natureza_alteracao && (
                      <div className="pt-4 border-t border-slate-200">
                         <span className="text-[9px] font-black text-indigo-500 uppercase block mb-2">Constatação de Embriaguez / Alteração:</span>
                         <div className="px-4 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase inline-block">
                            {selectedOc.natureza_alteracao}
                         </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* 2.1 Módulo Técnico de Embriaguez (Se aplicável) */}
                {selectedOc.categoria === 'embriaguez' && (
                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <ClipboardList className="w-3 h-3 text-indigo-500" /> Constatação Técnica de Embriaguez
                    </h4>
                    <div className="p-8 bg-indigo-50/30 rounded-[2.5rem] border border-indigo-100 space-y-8">
                      {/* Conclusão */}
                      <div className="flex items-center gap-4">
                        <div className="px-5 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20">
                          {selectedOc.conclusao_tecnica?.replace('_', ' ') || 'SEM CONCLUSÃO REGISTRADA'}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Etilômetro */}
                        <div className="space-y-3">
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Etilômetro</span>
                          {selectedOc.etilometro_realizado ? (
                            <div className="space-y-2">
                              <p className="text-sm font-bold text-slate-700">Resultado: <span className="text-indigo-600">{selectedOc.etilometro_resultado} mg/L</span></p>
                              <p className="text-[10px] text-slate-400 font-medium uppercase">{selectedOc.etilometro_marca} • SN: {selectedOc.etilometro_serie}</p>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 italic">Teste de etilômetro não realizado.</p>
                          )}
                        </div>

                        {/* Ingestão */}
                        <div className="space-y-3">
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Relato de Ingestão</span>
                          <p className="text-sm font-bold text-slate-700">{selectedOc.admitiu_ingestao === 'Sim' ? 'Admitiu Ingestão' : 'Negou ou Não Respondeu'}</p>
                          {selectedOc.ingestao_quantidade && <p className="text-xs text-slate-500">{selectedOc.ingestao_quantidade} ({selectedOc.ingestao_tempo})</p>}
                        </div>
                      </div>

                      {/* Sinais */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-indigo-100/50">
                        <div className="space-y-3">
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Sinais de Aparência</span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedOc.sinais_aparencia?.length > 0 ? selectedOc.sinais_aparencia.map((s: string, i: number) => (
                              <span key={i} className="px-2 py-1 bg-white border border-indigo-100 rounded-lg text-[9px] font-bold text-indigo-600 uppercase">{s}</span>
                            )) : <span className="text-[10px] text-slate-400 italic">Nenhum sinal registrado</span>}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Sinais de Atitude</span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedOc.sinais_atitude?.length > 0 ? selectedOc.sinais_atitude.map((s: string, i: number) => (
                              <span key={i} className="px-2 py-1 bg-white border border-indigo-100 rounded-lg text-[9px] font-bold text-indigo-600 uppercase">{s}</span>
                            )) : <span className="text-[10px] text-slate-400 italic">Nenhum sinal registrado</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* 3. Localização */}
                <section className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-indigo-500" /> Localização Detalhada
                  </h4>
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Rua / Logradouro</span>
                        <p className="text-sm font-bold text-slate-800 leading-tight">{selectedOc.rua}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Número</span>
                        <p className="text-sm font-bold text-slate-800">{selectedOc.numero || 'S/N'}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Bairro</span>
                        <p className="text-sm font-bold text-slate-800 uppercase tracking-wide">{selectedOc.bairro}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">CEP</span>
                        <p className="text-sm font-bold text-slate-800">{selectedOc.cep || '---'}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Cidade / Estado</span>
                        <p className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                          {selectedOc.cidade || '---'} {selectedOc.estado ? `- ${selectedOc.estado}` : ''}
                        </p>
                      </div>
                    </div>
                    
                    {selectedOc.referencia && (
                      <div className="pt-4 border-t border-slate-200">
                        <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Ponto de Referência</span>
                        <p className="text-sm text-slate-600 font-medium italic">"{selectedOc.referencia}"</p>
                      </div>
                    )}

                    {selectedOc.coordenadas && (
                      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Coordenadas GPS</span>
                          <p className="text-[10px] font-mono text-slate-500">{selectedOc.coordenadas}</p>
                        </div>
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${selectedOc.coordenadas}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase text-indigo-600 hover:bg-indigo-50 transition-all flex items-center gap-2"
                        >
                          <Navigation className="w-3 h-3" /> Ver no Mapa
                        </a>
                      </div>
                    )}
                  </div>
                </section>

                {/* 4. Fotos e Evidências */}
                {selectedOc.fotos && selectedOc.fotos.length > 0 && (
                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Camera className="w-3 h-3 text-indigo-500" /> Evidências Fotográficas ({selectedOc.fotos.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {selectedOc.fotos.map((url: string, i: number) => (
                        <a 
                          key={i} 
                          href={url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="aspect-square rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm hover:scale-[1.02] transition-transform cursor-zoom-in"
                        >
                          <img src={url} alt={`Evidência ${i+1}`} className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                {/* 5. Descrição / Relato */}

                <section className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-3 h-3 text-indigo-500" /> Relato dos Fatos
                  </h4>
                  <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm italic">
                    <p className="text-slate-700 font-medium leading-relaxed">
                      "{selectedOc.descricao}"
                    </p>
                  </div>
                </section>

                {/* --- SEÇÃO ESPECÍFICA DE MARIA DA PENHA --- */}
                {selectedOc.categoria === 'maria_da_penha' && (
                  <>
                    {/* Vítima */}
                    <section className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <User className="w-3 h-3 text-indigo-500" /> Dados da Vítima
                      </h4>
                      <div className="p-6 bg-slate-50 border border-slate-200 rounded-[2rem] grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Nome</span>
                          <p className="text-sm font-bold">{selectedOc.vitima_nome}</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Vínculo com Agressor</span>
                          <p className="text-sm font-bold">{selectedOc.vitima_vinculo_agressor}</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Contato</span>
                          <p className="text-sm font-bold">{selectedOc.vitima_telefone || '---'}</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Tem filhos?</span>
                          <p className="text-sm font-bold">{selectedOc.vitima_tem_filhos ? `Sim (${selectedOc.vitima_num_filhos} - No local: ${selectedOc.vitima_filhos_no_local ? 'Sim' : 'Não'})` : 'Não'}</p>
                        </div>
                      </div>
                    </section>

                    {/* Agressor */}
                    <section className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <User className="w-3 h-3 text-red-500" /> Dados do Agressor
                      </h4>
                      <div className="p-6 bg-slate-50 border border-slate-200 rounded-[2rem] grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Nome</span>
                          <p className="text-sm font-bold">{selectedOc.agressor_nome}</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Possui arma?</span>
                          <p className="text-sm font-bold text-red-600">{selectedOc.agressor_possui_arma}</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Uso de Álcool / Drogas</span>
                          <p className="text-sm font-bold">{selectedOc.agressor_usa_alcool} / {selectedOc.agressor_usa_drogas}</p>
                        </div>
                      </div>
                    </section>

                    {/* Avaliação FONAR */}
                    <section className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle className="w-3 h-3 text-amber-500" /> Risco FONAR
                      </h4>
                      <div className={`p-6 rounded-[2rem] border ${
                        selectedOc.nivel_risco === 'Elevado' ? 'bg-red-50 border-red-200 text-red-900' :
                        selectedOc.nivel_risco === 'Médio' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                        'bg-blue-50 border-blue-200 text-blue-900'
                      }`}>
                        <span className="text-[9px] font-black uppercase block mb-1">Nível de Risco Identificado</span>
                        <p className="text-lg font-black uppercase">{selectedOc.nivel_risco || 'Baixo'}</p>
                        
                        <div className="mt-4 pt-4 border-t border-current/20 grid grid-cols-2 gap-4">
                           <div>
                              <span className="text-[9px] font-black uppercase block mb-1">Lesões Visíveis</span>
                              <p className="text-sm font-bold">{selectedOc.lesoes_visiveis ? 'Sim' : 'Não'}</p>
                           </div>
                           <div>
                              <span className="text-[9px] font-black uppercase block mb-1">Deseja Medidas?</span>
                              <p className="text-sm font-bold">{selectedOc.deseja_medidas_protetivas ? 'Sim' : 'Não'}</p>
                           </div>
                           <div>
                              <span className="text-[9px] font-black uppercase block mb-1">Risco Iminente de Morte</span>
                              <p className="text-sm font-bold">{selectedOc.risco_iminente_morte ? 'Sim' : 'Não'}</p>
                           </div>
                        </div>
                      </div>
                    </section>
                  </>
                )}

                {/* 5. Envolvidos (Não exibe para Maria da Penha) */}
                {selectedOc.categoria !== 'maria_da_penha' && (
                <section className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <User className="w-3 h-3 text-indigo-500" /> Pessoas Envolvidas ({envolvidos.length})
                  </h4>
                  {envolvidos.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                      <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Nenhum envolvido qualificado</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {envolvidos.map((env: any, idx: number) => (
                        <div key={idx} className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                              <User className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 leading-tight">{env.nome || 'Nome Não Informado'}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{env.cpf || 'Sem CPF'} • {env.rg || 'Sem RG'}</p>
                            </div>
                          </div>
                          <span className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-lg uppercase tracking-widest">
                            {env.papel}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
                )}

                {/* 6. Anotações */}
                <section className="space-y-6 pt-10 border-t border-slate-100">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-600" /> Histórico de Complementos
                  </h4>
                  
                  <div className="space-y-4">
                    {anotacoes.map((nota: any) => (
                      <div key={nota.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 animate-in fade-in">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-black text-indigo-600 uppercase">
                            {nota.usuarios?.primeiro_nome} {nota.usuarios?.sobrenome}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase">
                            {new Date(nota.created_at).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">{nota.texto}</p>
                      </div>
                    ))}
                    
                    <div className="relative pt-4">
                      <textarea 
                        value={novaAnotacao}
                        onChange={(e) => setNovaAnotacao(e.target.value)}
                        placeholder="Adicionar um novo complemento ou observação importante..."
                        className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2.5rem] text-sm focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all resize-none min-h-[120px] font-medium"
                      />
                      <button 
                        onClick={handleAddAnotacao}
                        disabled={sendingNota || !novaAnotacao.trim() || novaAnotacao.length < 10}
                        className="absolute bottom-6 right-6 w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:grayscale active:scale-90"
                      >
                        {sendingNota ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </section>
              </div>
           </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Excluir Ocorrência?"
        description={`Você tem certeza que deseja excluir permanentemente a ocorrência OC-${selectedOc?.numero_oficial}? Esta ação não poderá ser desfeita.`}
        confirmText="Sim, Excluir"
        cancelText="Manter Registro"
        variant="danger"
      />

      {isAnotacoesOpen && selectedOc && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
           <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right-8 duration-500">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <MessageSquarePlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">Anotações</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">OC-{selectedOc.numero_oficial}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAnotacoesOpen(false)}
                  className="p-3 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {anotacoes.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">Nenhuma anotação ainda.</p>
                    <p className="text-slate-300 text-sm">Seja o primeiro a adicionar uma observação.</p>
                  </div>
                ) : (
                  anotacoes.map((nota: any) => (
                    <div key={nota.id} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 animate-in fade-in">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-indigo-600 uppercase">
                          {nota.usuarios?.primeiro_nome} {nota.usuarios?.sobrenome}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">
                          {new Date(nota.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">{nota.texto}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <div className="relative">
                  <textarea 
                    value={novaAnotacao}
                    onChange={(e) => setNovaAnotacao(e.target.value)}
                    placeholder="Adicionar uma nova anotação ou observação..."
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all resize-none min-h-[100px] font-medium"
                  />
                  <button 
                    onClick={handleAddAnotacao}
                    disabled={sendingNota || !novaAnotacao.trim() || novaAnotacao.length < 10}
                    className="mt-3 w-full py-3 bg-amber-500 text-white rounded-xl font-black text-sm uppercase tracking-wider hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:grayscale"
                  >
                    {sendingNota ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Salvar Anotação'}
                  </button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}