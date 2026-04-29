import React, { useState } from 'react';
import { 
  Truck, 
  History, 
  Plus, 
  Search, 
  Clock, 
  AlertCircle,
  Loader2,
  Calendar,
  ChevronRight,
  Gauge
} from 'lucide-react';
import { useKmDiario, useCreateKmDiario } from '@/hooks/useLogistics';
import { useVeiculos } from '@/hooks/useVeiculos';
import { toast } from 'sonner';

export function KmDiarioPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: registros, isLoading } = useKmDiario();
  const { data: veiculos } = useVeiculos();
  const createKm = useCreateKmDiario();

  const [formData, setFormData] = useState({
    veiculo_id: '',
    quilometragem: '',
    turno: 'Manhã',
    observacoes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.veiculo_id || !formData.quilometragem) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      await createKm.mutateAsync({
        veiculo_id: formData.veiculo_id,
        quilometragem: parseInt(formData.quilometragem),
        turno: formData.turno,
        data_registro: new Date().toISOString().split('T')[0],
        observacoes: formData.observacoes
      });
      toast.success('Quilometragem registrada!');
      setIsFormOpen(false);
      setFormData({ veiculo_id: '', quilometragem: '', turno: 'Manhã', observacoes: '' });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao registrar KM');
    }
  };

  const filteredRegistros = registros?.filter(r => 
    r.veiculo?.placa.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 lg:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Controle de KM</h1>
          <p className="text-slate-500 font-medium text-lg mt-1">
            Registro diário de quilometragem da frota por turno.
          </p>
        </div>
        
        <button 
          onClick={() => setIsFormOpen(true)}
          className="h-12 px-6 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5 mr-3" /> Novo Registro
        </button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Pesquisar por placa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-medium focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all shadow-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : filteredRegistros.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-12 text-center">
          <Gauge className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-black text-slate-900 mb-2">Nenhum registro encontrado</h3>
          <p className="text-slate-500">Inicie o controle registrando a KM de uma viatura.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRegistros.map((registro) => (
            <div key={registro.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                  <Truck className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-slate-900">{registro.veiculo?.placa}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{registro.veiculo?.modelo}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Gauge className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">KM</span>
                  </div>
                  <span className="text-lg font-black text-slate-900">{registro.quilometragem.toLocaleString('pt-BR')}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Turno</p>
                    <p className="text-xs font-bold text-slate-700">{registro.turno}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Data</p>
                    <p className="text-xs font-bold text-slate-700">{new Date(registro.data_registro).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black">
                    {registro.usuario?.primeiro_nome.charAt(0)}
                  </div>
                  <span className="text-[10px] font-bold">{registro.usuario?.primeiro_nome}</span>
                </div>
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE REGISTRO */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Novo Registro de KM</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <Plus className="w-5 h-5 text-slate-400 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Viatura</label>
                <select 
                  value={formData.veiculo_id}
                  onChange={e => setFormData({...formData, veiculo_id: e.target.value})}
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all"
                >
                  <option value="">Selecione uma viatura</option>
                  {veiculos?.map(v => (
                    <option key={v.id} value={v.id}>{v.placa} - {v.modelo}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Quilometragem</label>
                  <input 
                    type="number"
                    value={formData.quilometragem}
                    onChange={e => setFormData({...formData, quilometragem: e.target.value})}
                    placeholder="0"
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Turno</label>
                  <select 
                    value={formData.turno}
                    onChange={e => setFormData({...formData, turno: e.target.value})}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all"
                  >
                    <option>Manhã</option>
                    <option>Tarde</option>
                    <option>Noite</option>
                    <option>12 horas</option>
                    <option>24 horas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Observações</label>
                <textarea 
                  value={formData.observacoes}
                  onChange={e => setFormData({...formData, observacoes: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-600/5 transition-all h-24 resize-none"
                  placeholder="Opcional..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 h-12 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={createKm.isPending}
                  className="flex-1 h-12 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-600/20"
                >
                  {createKm.isPending ? 'Salvando...' : 'Salvar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
