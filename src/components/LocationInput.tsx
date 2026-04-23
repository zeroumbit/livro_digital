import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchCEP } from '@/lib/api-services';
import { toast } from 'sonner';


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
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [cep, setCep] = useState(defaultValues?.cep || '');
  const [rua, setRua] = useState(defaultValues?.rua || '');
  const [bairro, setBairro] = useState(defaultValues?.bairro || '');
  const [cidade, setCidade] = useState(defaultValues?.cidade || '');
  const [estado, setEstado] = useState(defaultValues?.estado || '');
  const [numero, setNumero] = useState(defaultValues?.numero || '');
  const [coordenadas, setCoordenadas] = useState(defaultValues?.coordenadas || '');

  const searchTimer = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchBairros();
    const handleClick = () => setShowSuggestions(false);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
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

  // Busca inteligente por Rua (Autocomplete)
  const handleRuaChange = (value: string) => {
    setRua(value);
    updateParent(value, bairro, cep, cidade, estado, numero, coordenadas);

    if (value.length < 4) {
      setSuggestions([]);
      return;
    }

    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      try {
        const cleanCep = cep.replace(/\D/g, '');
        
        // Se não tiver CEP, não busca para evitar ruas de outras cidades/estados
        if (!cleanCep || cleanCep.length < 8) {
          return;
        }

        // Busca ULTRA REFINADA: Fixa o CEP como filtro principal
        let url = `https://nominatim.openstreetmap.org/search?street=${encodeURIComponent(value)}&postalcode=${encodeURIComponent(cleanCep)}&countrycodes=br&format=json&addressdetails=1&limit=10`;
        
        if (cidade) url += `&city=${encodeURIComponent(cidade)}`;

        const response = await fetch(url);
        const data = await response.json();
        
        // Filtro de Garantia: O resultado PRECISA pertencer ao CEP ou à Cidade
        const filteredData = data.filter((item: any) => {
          const itemCep = item.address.postcode?.replace(/\D/g, '') || '';
          return itemCep === cleanCep || cleanCep.endsWith('000');
        });

        setSuggestions(filteredData.length > 0 ? filteredData : data.slice(0, 5));
        setShowSuggestions(true);
      } catch (err) {
        console.error('Erro no autocomplete:', err);
      }
    }, 400);



  };

  const selectSuggestion = (s: any) => {
    const street = s.address.road || s.address.pedestrian || s.display_name.split(',')[0];
    const neighborhood = s.address.suburb || s.address.neighbourhood || s.address.city_district || bairro;
    const city = s.address.city || s.address.town || s.address.village || cidade;
    const state = s.address.state || estado;
    const postCode = s.address.postcode || cep;

    setRua(street);
    setBairro(neighborhood);
    setCidade(city);
    setEstado(state);
    if (postCode) setCep(postCode);
    setCoordenadas(`${s.lat},${s.lon}`);
    
    updateParent(street, neighborhood, postCode || cep, city, state, numero, `${s.lat},${s.lon}`);
    setShowSuggestions(false);
  };

  const handleCepBlur = async () => {
    if (cep.length < 8) return;
    handleCepChange(cep);
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
      try {
        // Tenta BrasilAPI/ViaCEP primeiro para dados oficiais
        const data = await fetchCEP(digits);
        if (data && data.rua) {
          setRua(data.rua);
          setBairro(data.bairro);
          setCidade(data.cidade);
          setEstado(data.estado);
          updateParent(data.rua, data.bairro, formatted, data.cidade, data.estado, numero, coordenadas);
        } else {
          // Se falhar ou for CEP geral, busca no Nominatim para listar ruas
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?postalcode=${digits}&country=brazil&format=json&addressdetails=1`
          );
          const results = await response.json();
          if (results.length > 0) {
            setSuggestions(results);
            setShowSuggestions(true);
            toast.info('Várias ruas encontradas para este CEP. Selecione uma.');
          }
        }
      } catch (err) {
        console.error('Erro CEP:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não suportada pelo seu navegador.');
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
      setLoading(false);

      
      if (error.code === 1) {
        toast.error('Permissão de GPS negada. Por favor, habilite a localização nas configurações do seu navegador.');
      } else if (error.code === 2) {
        toast.error('Localização indisponível. Tente digitar o CEP ou a Rua manualmente.');
      } else if (error.code === 3) {
        toast.error('Tempo esgotado ao obter localização. Verifique seu sinal de internet/GPS.');
      } else {
        toast.error('Não foi possível obter sua localização atual via GPS.');
      }
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

        <div className="md:col-span-2 space-y-2 relative">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Rua / Logradouro</label>
          <input
            type="text"
            value={rua}
            onChange={(e) => handleRuaChange(e.target.value)}
            placeholder="Nome da rua ou avenida"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all"
          />
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => selectSuggestion(s)}
                  className="w-full text-left px-5 py-4 hover:bg-indigo-50 border-b border-slate-50 last:border-0 transition-all flex items-start gap-3"
                >
                  <MapPin className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{s.address.road || s.address.pedestrian || s.display_name.split(',')[0]}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{s.display_name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
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
          <div className="relative group">
             <input
                list="bairros-list"
                value={bairro}
                onChange={(e) => {
                  const val = e.target.value;
                  setBairro(val);
                  updateParent(rua, val, cep, cidade, estado, numero, coordenadas);
                }}
                placeholder="Selecione o bairro oficial"
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400"
              />
              <div className="absolute right-3 top-3.5 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                <Search className="w-4 h-4" />
              </div>
              <datalist id="bairros-list">
                {bairros.map((b) => (
                  <option key={b.id} value={b.nome}>
                    {b.nome} (Território Oficial)
                  </option>
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
