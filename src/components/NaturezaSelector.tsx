import React from 'react';
import { Shield, Car, LifeBuoy, AlertCircle } from 'lucide-react';

interface NaturezaSelectorProps {
  selected: string[];
  onChange: (naturezas: string[]) => void;
}

const naturezas = [
  {
    group: 'Segurança Pública Municipal',
    icon: <Shield className="w-4 h-4" />,
    items: [
      'Danos ao Patrimônio Público',
      'Perturbação do Sossego',
      'Via de Fato (Desentendimento)',
      'Ameaça',
      'Briga/Conflito entre Pessoas',
      'Embriaguez em Via Pública',
      'Comércio Irregular/Ambulante',
      'Situação de Risco a Crianças/Adolescentes',
      'Pessoa em Situação de Rua',
      'Violência Doméstica (Aguardando Polícia)',
      'Patrulhamento Preventivo',
      'Abordagem de Prevenção',
      'Atividade Suspeita',
      'Ponto de Droga Identificado'
    ]
  },
  {
    group: 'Trânsito e Mobilidade',
    icon: <Car className="w-4 h-4" />,
    items: [
      'Acidente sem Vítimas',
      'Acidente com Vítimas Leves',
      'Acidente com Vítimas Graves',
      'Estacionamento em Local Proibido',
      'Excesso de Velocidade',
      'Avanço de Sinal',
      'Direção Perigosa',
      'Veículo Abandonado',
      'Veículo com Roubo/Furto',
      'Veículo Alterado',
      'Sinalização Danificada',
      'Obstrução de Via Pública'
    ]
  },
  {
    group: 'Apoio e Serviços',
    icon: <LifeBuoy className="w-4 h-4" />,
    items: [
      'Apoio a Cidadão Necessitado',
      'Busca de Animal Solto',
      'Acesso a Residência/Empresa',
      'Apoio à Polícia Civil',
      'Apoio ao SAMU',
      'Apoio aos Bombeiros',
      'Operação Especial Programada',
      'Cobertura de Evento Público'
    ]
  },
  {
    group: 'Emergências',
    icon: <AlertCircle className="w-4 h-4" />,
    items: [
      'Pessoa em Perigo Iminente',
      'Tentativa de Suicídio',
      'Incêndio/Explosão',
      'Desabamento/Deslizamento',
      'Encontro de Artefato Explosivo',
      'Vazamento de Produto Químico',
      'Queda de Árvore/Poste'
    ]
  }
];

export function NaturezaSelector({ selected, onChange }: NaturezaSelectorProps) {
  const toggleNatureza = (item: string) => {
    if (selected.includes(item)) {
      onChange(selected.filter(i => i !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  return (
    <div className="space-y-6">
      {naturezas.map((group) => (
        <div key={group.group} className="space-y-3">
          <div className="flex items-center gap-2 text-slate-400">
            {group.icon}
            <span className="text-[10px] font-black uppercase tracking-widest">{group.group}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {group.items.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleNatureza(item)}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-bold text-left transition-all border leading-tight ${
                  selected.includes(item)
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-600/50 hover:bg-slate-50'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
