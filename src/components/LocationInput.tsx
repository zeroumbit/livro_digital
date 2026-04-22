import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchCEP } from '@/lib/api-services';

interface LocationInputProps {
  onLocationChange: (data: {
    rua: string;
    bairro: string;
    cep: string;
    cidade: string;
    estado: string;
    numero?: string;
    coordenadas?: string;
  }) => void;
  defaultValues?: any;
}

export function LocationInput({ onLocationChange, defaultValues }: LocationInputProps) {
  const profile = useAuthStore(state => state.profile);
  const [loading, setLoading] = useState(false);
  const [bairros, setBairros] = useState<any[]>([]);
  
  const [cep, setCep] = useState(defaultValues?.cep || '');
  const [rua, setRua] = useState(defaultValues?.rua || '');
  const [bairro, setBairro] = useState(defaultValues?.bairro || '');
  const [cidade, setCidade] = useState(defaultValues?.cidade || '');
  const [estado, setEstado] = useState(defaultValues?.estado || '');
  const [numero, setNumero] = useState(defaultValues?.numero || '');
  const [coordenadas, setCoordenadas] = useState(defaultValues?.coordenadas || '');

  useEffect(() => {
    fetchBairros();
  }, [profile]);

  const fetchBairros = async () => {
    if (!profile?.instituicao_id) return;
    const { data } = await supabase
      .from('bairros')
      .select('id, nome')
      .eq('instituicao_id', profile.instituicao_id)
      .eq('ativo', true)
      .order('nome');
    if (data) setBairros(data);
  };

  const handleCepBlur = async () => {
    const data = await fetchCEP(cep);
    if (data) {
      setRua(data.rua || '');
      setBairro(data.bairro || '');
      setCidade(data.cidade || '');
      setEstado(data.estado || '');
      updateParent(data.rua || '', data.bairro || '', cep, data.cidade || '', data.estado || '', numero, coordenadas);
    }
  };

  const formatCep = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 5) return digits;
    if (digits.length <= 8) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
  };

  const handleCepChange = async (value: string) => {
    const formatted = formatCep(value);
    setCep(formatted);
    const digits = value.replace(/\D/g, '');
    if (digits.length === 8) {
      setLoading(true);
      const data = await fetchCEP(digits);
      if (data) {
        setRua(data.rua || '');
        setBairro(data.bairro || '');
        setCidade(data.cidade || '');
        setEstado(data.estado || '');
        updateParent(data.rua || '', data.bairro || '', formatted, data.cidade || '', data.estado || '', numero, coordenadas);
      }
      setLoading(false);
    }
  };

  const handleGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não suportada pelo seu navegador.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const coordsString = `${latitude},${longitude}`;
      setCoordenadas(coordsString);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        
        const street = data.address.road || data.address.pedestrian || '';
        const neighborhood = data.address.suburb || data.address.neighbourhood || data.address.city_district || '';
        const city = data.address.city || data.address.town || data.address.village || '';
        const state = data.address.state || '';
        const postCode = data.address.postcode || '';

        setRua(street);
        setBairro(neighborhood);
        setCidade(city);
        setEstado(state);
        if (postCode) setCep(postCode);
        
        updateParent(street, neighborhood, postCode || cep, city, state, numero, coordsString);
      } catch (error) {
        console.error('Erro no Reverse Geocoding:', error);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error('Erro GPS:', error);
      setLoading(false);
      alert('Não foi possível obter sua localização atual.');
    });
  };

  const updateParent = (r: string, b: string, c: string, city: string, state: string, n: string, co: string) => {
    onLocationChange({ rua: r, bairro: b, cep: c, cidade: city, estado: state, numero: n, coordenadas: co });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">CEP</label>
          <div className="relative">
            <input
              type="text"
              value={cep}
              maxLength={9}
              onChange={(e) => handleCepChange(e.target.value)}
              onBlur={handleCepBlur}
              placeholder="00000-000"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all"
            />
            {loading && <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-indigo-600" />}
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Rua / Logradouro</label>
          <input
            type="text"
            value={rua}
            onChange={(e) => {
              setRua(e.target.value);
              updateParent(e.target.value, bairro, cep, numero, coordenadas);
            }}
            placeholder="Nome da rua ou avenida"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all"
          />
        </div>

        <div className="md:col-span-1 space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Número</label>
          <input
            type="text"
            value={numero}
            onChange={(e) => {
              setNumero(e.target.value);
              updateParent(rua, bairro, cep, e.target.value, coordenadas);
            }}
            placeholder="S/N"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Bairro</label>
          <div className="relative">
             <input
                list="bairros-list"
                value={bairro}
                onChange={(e) => {
                  setBairro(e.target.value);
                  updateParent(rua, e.target.value, cep, numero, coordenadas);
                }}
                placeholder="Selecione ou digite o bairro"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all"
              />
              <datalist id="bairros-list">
                {bairros.map((b) => (
                  <option key={b.id} value={b.nome} />
                ))}
              </datalist>
          </div>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleGPS}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            Obter Localização via GPS
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cidade</label>
          <input
            type="text"
            value={cidade}
            onChange={(e) => {
              setCidade(e.target.value);
              updateParent(rua, bairro, cep, e.target.value, estado, numero, coordenadas);
            }}
            placeholder="Cidade"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all"
          />
        </div>
        <div className="md:col-span-1 space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Estado (UF)</label>
          <input
            type="text"
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value);
              updateParent(rua, bairro, cep, cidade, e.target.value, numero, coordenadas);
            }}
            placeholder="UF"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all"
          />
        </div>
      </div>
      
      {coordenadas && (
        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg w-fit">
          <MapPin className="w-3 h-3" />
          Coordenadas: {coordenadas}
        </div>
      )}
    </div>
  );
}
