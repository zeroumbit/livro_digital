import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Settings, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  X,
  Truck,
  Car,
  Bike,
  Wrench,
  Search,
  Filter,
  Fuel
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/useAuthStore';

// ============================================================================
// SCHEMA DE VALIDAÇÃO (ZOD)
// ============================================================================

const veiculoSchema = z.object({
  id: z.string().optional(),
  placa: z.string().min(7, 'Placa inválida').max(8),
  ano: z.coerce.number().min(1900, 'Ano inválido').max(2100),
  marca: z.string().min(2, 'Marca obrigatória'),
  modelo: z.string().min(2, 'Modelo obrigatório'),
  tipo_veiculo: z.enum(['Moto', 'Carro', 'Caminhão', 'Outro']),
  tipo_combustivel: z.enum(['Gasolina comum', 'Gasolina aditivada', 'Gasolina premium', 'Etanol hidratado', 'Etanol anidro', 'Diesel S-500', 'Diesel S-10', 'GNV', 'Biodiesel', 'Flex']),
  status: z.enum(['ativo', 'inativo', 'em_manutencao'])
});

type VeiculoForm = z.infer<typeof veiculoSchema>;

// ============================================================================
// PÁGINA: GESTÃO DE FROTA
// ============================================================================

export function VeiculosPage() {
  const { institution } = useAuthStore();
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVeiculo, setSelectedVeiculo] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<VeiculoForm>({
    resolver: zodResolver(veiculoSchema),
    defaultValues: {
      tipo_veiculo: 'Carro',
      tipo_combustivel: 'Flex',
      status: 'ativo',
    }
  });

  const fetchVeiculos = async () => {
    if (!institution?.id) return;
    setIsLoading(true);
    const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .eq('instituicao_id', institution.id)
        .order('created_at', { ascending: false });
        
    if (error) toast.error('Falha ao carregar frota');
    else setVeiculos(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchVeiculos();
  }, [institution?.id]);

  const onSubmit = async (data: VeiculoForm) => {
    try {
      if (!institution?.id) throw new Error('Instituição não definida');

      const paylod = {
          ...data,
          instituicao_id: institution.id,
          placa: data.placa.toUpperCase()
      };

      const { error } = data.id 
        ? await supabase.from('veiculos').update(paylod).eq('id', data.id)
        : await supabase.from('veiculos').insert([paylod]);

      if (error) throw error;
      
      toast.success(data.id ? 'Veículo atualizado!' : 'Veículo adicionado com sucesso!');
      setIsModalOpen(false);
      reset();
      fetchVeiculos();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const openEditModal = (veiculo: any) => {
    setSelectedVeiculo(veiculo);
    Object.keys(veiculoSchema.shape).forEach(key => {
        if (key in veiculo) {
            setValue(key as keyof VeiculoForm, veiculo[key]);
        }
    });
    setIsModalOpen(true);
  };

  const handleHardDelete = async () => {
    try {
        const { error } = await supabase.from('veiculos').delete().eq('id', selectedVeiculo.id);
        if (error) throw error;
        
        toast.success('Veículo removido da frota.');
        setIsDeleteModalOpen(false);
        fetchVeiculos();
    } catch (e: any) {
        toast.error(e.message);
    }
  };

  const getVeiculoIcon = (tipo: string) => {
      switch (tipo) {
          case 'Moto': return <Bike className="w-6 h-6" />;
          case 'Caminhão': return <Truck className="w-6 h-6" />;
          default: return <Car className="w-6 h-6" />;
      }
  };

  const filteredVeiculos = veiculos.filter(v => 
      v.placa.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.modelo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Gestão de Frota</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">Controle de viaturas, manutenções e combustível.</p>
        </div>
        
        <div className="flex items-center space-x-3">
            <div className="relative group flex-1 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Buscar placa ou modelo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-12 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all shadow-sm"
                />
            </div>
            <button 
                onClick={() => { setSelectedVeiculo(null); reset(); setIsModalOpen(true); }}
                className="h-12 px-6 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all hover:-translate-y-1"
            >
                <Plus className="w-5 h-5 mr-3" /> Nova Viatura
            </button>
        </div>
      </div>

      {/* TOTAIS / RESUMO */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total de Viaturas" value={veiculos.length} icon={<Truck />} />
          <StatCard label="Em Operação" value={veiculos.filter(v => v.status === 'ativo').length} color="text-emerald-500" bg="bg-emerald-50" icon={<CheckCircle2 />} />
          <StatCard label="Em Manutenção" value={veiculos.filter(v => v.status === 'em_manutencao').length} color="text-amber-500" bg="bg-amber-50" icon={<Wrench />} />
          <StatCard label="Inativos" value={veiculos.filter(v => v.status === 'inativo').length} color="text-slate-500" bg="bg-slate-100" icon={<AlertTriangle />} />
      </div>

      {/* GRID DE VEÍCULOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredVeiculos.map((veiculo) => (
          <div key={veiculo.id} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-2xl transition-all flex flex-col group">
            <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${veiculo.status === 'em_manutencao' ? 'bg-amber-50 text-amber-500' : veiculo.status === 'inativo' ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600'}`}>
                    {getVeiculoIcon(veiculo.tipo_veiculo)}
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={() => openEditModal(veiculo)} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 transition-colors">
                        <Settings className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setSelectedVeiculo(veiculo); setIsDeleteModalOpen(true); }} className="p-2 bg-rose-50 text-rose-500 rounded-xl">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{veiculo.placa}</h3>
            <p className="text-slate-500 text-sm font-bold mb-6">{veiculo.marca} {veiculo.modelo} - {veiculo.ano}</p>

            <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center text-slate-500 text-sm font-bold">
                        <Fuel className="w-4 h-4 mr-2" /> Combustível
                    </div>
                    <span className="text-xs font-black uppercase text-slate-700">{veiculo.tipo_combustivel}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center text-slate-500 text-sm font-bold">
                        <AlertTriangle className="w-4 h-4 mr-2" /> Status
                    </div>
                    <StatusBadge status={veiculo.status} />
                </div>
            </div>
          </div>
        ))}

        {filteredVeiculos.length === 0 && (
            <div className="col-span-full py-20 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Truck className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Nenhum veículo encontrado</h3>
                <p className="text-slate-500">Cadastre a primeira viatura da instituição.</p>
            </div>
        )}
      </div>

      {/* MODAL: CRIAR / EDITAR VEÍCULO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
            <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 flex flex-col my-auto animate-in zoom-in-95 duration-300">
                <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center sm:sticky sm:top-0 bg-white/80 backdrop-blur-sm z-20 rounded-t-[3rem]">
                    <h2 className="text-2xl font-black text-slate-900">{selectedVeiculo ? 'Editar Viatura' : 'Nova Viatura'}</h2>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400"><X /></button>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Placa" error={errors.placa?.message}>
                            <input {...register('placa')} placeholder="ABC1D23" className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold outline-none uppercase focus:ring-2 focus:ring-indigo-600" />
                        </InputGroup>
                        <InputGroup label="Ano" error={errors.ano?.message}>
                            <input {...register('ano')} type="number" className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
                        </InputGroup>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Marca" error={errors.marca?.message}>
                            <input {...register('marca')} placeholder="Ex: Chevrolet" className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
                        </InputGroup>
                        <InputGroup label="Modelo" error={errors.modelo?.message}>
                            <input {...register('modelo')} placeholder="Ex: Spin 1.8" className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600" />
                        </InputGroup>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InputGroup label="Tipo">
                            <select {...register('tipo_veiculo')} className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600">
                                <option value="Carro">Carro</option>
                                <option value="Moto">Moto</option>
                                <option value="Caminhão">Caminhão</option>
                                <option value="Outro">Outro</option>
                            </select>
                        </InputGroup>
                        <InputGroup label="Combustível">
                            <select {...register('tipo_combustivel')} className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600">
                                <option value="Flex">Flex</option>
                                <option value="Gasolina comum">Gasolina comum</option>
                                <option value="Gasolina aditivada">Gasolina aditivada</option>
                                <option value="Etanol hidratado">Etanol hidratado</option>
                                <option value="Diesel S-10">Diesel S-10</option>
                                <option value="GNV">GNV</option>
                            </select>
                        </InputGroup>
                        <InputGroup label="Status">
                            <select {...register('status')} className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-600">
                                <option value="ativo">Ativo</option>
                                <option value="em_manutencao">Manutenção</option>
                                <option value="inativo">Inativo</option>
                            </select>
                        </InputGroup>
                    </div>

                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between sm:sticky sm:bottom-0 bg-white/80 backdrop-blur-sm">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="text-sm font-bold text-slate-400 hover:text-slate-600">Cancelar</button>
                        <button type="submit" className="h-14 px-10 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
                            {selectedVeiculo ? 'Salvar Alterações' : 'Adicionar Viatura'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* MODAL: DELETE */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in" onClick={() => setIsDeleteModalOpen(false)}></div>
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl relative z-10 p-10 animate-in zoom-in-95 text-center">
                <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-rose-500" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Excluir Viatura</h3>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                    Deseja mesmo excluir <strong>{selectedVeiculo?.placa}</strong>? Esta ação é irreversível.
                </p>
                <div className="flex space-x-4">
                    <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 h-12 text-sm font-bold text-slate-400">Cancelar</button>
                    <button 
                        onClick={handleHardDelete}
                        className="flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-widest bg-rose-600 text-white shadow-lg shadow-rose-600/20 transition-all"
                    >
                        Excluir
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}

// ============================================================================
// COMPONENTES DE APOIO
// ============================================================================

function InputGroup({ label, children, error }: any) {
    return (
        <div className="flex flex-col space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
            {children}
            {error && <span className="text-[10px] text-rose-500 font-bold ml-1">{error}</span>}
        </div>
    );
}

function StatCard({ label, value, icon, color = 'text-indigo-600', bg = 'bg-indigo-50' }: any) {
    return (
        <div className="bg-white border border-slate-100 rounded-[2rem] p-6 flex flex-col justify-between">
            <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center mb-4`}>
                {icon}
            </div>
            <div>
                <p className="text-3xl font-black text-slate-900">{value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'ativo') return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Em Operação</span>;
    if (status === 'em_manutencao') return <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Manutenção</span>;
    return <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest">Inativo</span>;
}
