/**
 * Biblioteca de integração com APIs externas (BrasilAPI e ViaCEP)
 * Para validação e preenchimento automático de dados.
 */

export const validateCPF = (cpf: string) => {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11 || /^(\d)\1+$/.test(cleanCPF)) return false;
  
  let sum = 0;
  let rest;
  
  for (let i = 1; i <= 9; i++) sum = sum + parseInt(cleanCPF.substring(i-1, i)) * (11 - i);
  rest = (sum * 10) % 11;
  if ((rest === 10) || (rest === 11)) rest = 0;
  if (rest !== parseInt(cleanCPF.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) sum = sum + parseInt(cleanCPF.substring(i-1, i)) * (12 - i);
  rest = (sum * 10) % 11;
  if ((rest === 10) || (rest === 11)) rest = 0;
  if (rest !== parseInt(cleanCPF.substring(10, 11))) return false;
  
  return true;
};

export const fetchCEP = async (cep: string) => {
  const cleanCEP = cep.replace(/\D/g, '');
  if (cleanCEP.length !== 8) return null;

  try {
    // Tenta BrasilAPI primeiro
    const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCEP}`);
    if (response.ok) {
      const data = await response.json();
      return {
        rua: data.street,
        bairro: data.neighborhood,
        cidade: data.city,
        estado: data.state,
        service: 'brasilapi'
      };
    }
    
    // Fallback para ViaCEP
    const viaCepResponse = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
    const viaData = await viaCepResponse.json();
    if (!viaData.erro) {
      return {
        rua: viaData.logradouro,
        bairro: viaData.bairro,
        cidade: viaData.localidade,
        estado: viaData.uf,
        service: 'viacep'
      };
    }
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
  }
  return null;
};

export const fetchCNPJ = async (cnpj: string) => {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  if (cleanCNPJ.length !== 14) return null;

  try {
    // Tenta BrasilAPI primeiro
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`);
    if (response.ok) {
      const data = await response.json();
      return {
        razao_social: data.razao_social,
        nome_fantasia: data.nome_fantasia,
        rua: data.logradouro,
        numero: data.numero,
        bairro: data.bairro,
        cidade: data.municipio,
        estado: data.uf,
        cep: data.cep
      };
    }
    
    // Fallback para ReceitaWS (com tratamento de erro silencioso)
    if (response.status === 404) {
      const receiptResponse = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cleanCNPJ}`);
      if (receiptResponse.ok) {
        const data = await receiptResponse.json();
        if (data.status === 'OK') {
          return {
            razao_social: data.nome,
            nome_fantasia: data.fantasia,
            rua: data.logradouro,
            numero: data.numero,
            bairro: data.bairro,
            cidade: data.municipio,
            estado: data.uf,
            cep: data.cep
          };
        }
      }
    }
  } catch (error) {
    // Erro silencioso - CNPJ não encontrado em nenhuma API
    console.log('CNPJ não encontrado nas APIs disponíveis');
  }
  return null;
};
