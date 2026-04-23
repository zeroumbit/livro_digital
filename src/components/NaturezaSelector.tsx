import React from 'react';
import { Shield, Car, LifeBuoy, AlertCircle } from 'lucide-react';

interface NaturezaSelectorProps {
  selected: string[];
  onChange: (naturezas: string[]) => void;
}

const naturezas = [
  {
    group: 'Emergências',
    icon: <AlertCircle className="w-4 h-4" />,
    items: [
      'Surto Psicótico',
      'Ameaça de Morte Iminente',
      'Sequestro / Cárcere Privado',
      'Roubo em Andamento',
      'Arrombamento / Invasão em Andamento',
      'Pessoa Desaparecida (Criança ou Idoso)',
      'Afogamento',
      'Choque Elétrico / Eletrocussão',
      'Edifício em Risco de Desabamento',
      'Fuga de Interno (Hospício, Prisão ou UBS)',
      'Pessoa em Perigo Iminente',
      'Tentativa de Suicídio',
      'Incêndio/Explosão',
      'Desabamento/Deslizamento'
    ]
  },
  {
    group: 'Segurança Pública Municipal',
    icon: <Shield className="w-4 h-4" />,
    items: [
      'Abandono de Incapaz',
      'Maus-Tratos contra Animal',
      'Rixa / Briga Generalizada',
      'Pixação / Pichação',
      'Descumprimento de Medida Protetiva',
      'Danos ao Patrimônio Público',
      'Perturbação do Sossego',
      'Via de Fato (Desentendimento)',
      'Ameaça',
      'Embriaguez em Via Pública',
      'Comércio Irregular/Ambulante',
      'Situação de Risco a Crianças/Adolescentes',
      'Pessoa em Situação de Rua',
      'Atividade Suspeita'
    ]
  },
  {
    group: 'Trânsito e Mobilidade',
    icon: <Car className="w-4 h-4" />,
    items: [
      'Rolezinho / Concentração de Motos',
      'Veículo em Alta Velocidade em Via Local',
      'Bebê ou Criança Sozinha Dentro de Veículo',
      'Carga Perigosa Derramada',
      'Acidente sem Vítimas',
      'Acidente com Vítimas Leves',
      'Acidente com Vítimas Graves',
      'Estacionamento em Local Proibido',
      'Direção Perigosa',
      'Veículo Abandonado',
      'Veículo com Roubo/Furto'
    ]
  },
  {
    group: 'Apoio e Serviços',
    icon: <LifeBuoy className="w-4 h-4" />,
    items: [
      'Acompanhamento de Escolta',
      'Verificação de Bem-Estar',
      'Remoção de Ébrio',
      'Apoio a Cidadão Necessitado',
      'Busca de Animal Solto',
      'Acesso a Residência/Empresa',
      'Apoio à Polícia Civil',
      'Apoio ao SAMU',
      'Apoio aos Bombeiros',
      'Operação Especial Programada'
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
                className={`px-4 py-3 rounded-xl text-sm font-bold text-left transition-all border leading-tight ${
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
