// Máscara e Validação de CPF
export const formatCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

export const isValidCPF = (cpf: string) => {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let soma = 0;
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;
  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;
  return true;
};

// Máscara e Validação de CNPJ
export const formatCNPJ = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

export const isValidCNPJ = (cnpj: string) => {
  cnpj = cnpj.replace(/\D/g, '');
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;
  return true;
};

// Máscara de Telefone (Fixo e Celular)
export const formatPhone = (value: string) => {
  value = value.replace(/\D/g, '');
  if (value.length > 11) value = value.slice(0, 11);
  
  if (value.length === 11) {
    return value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  } else if (value.length === 10) {
    return value.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }
  
  if (value.length > 6) return value.replace(/^(\d{2})(\d{4,5})(\d{0,4}).*/, '($1) $2-$3');
  if (value.length > 2) return value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
  if (value.length > 0) return value.replace(/^(\d*)/, '($1');
  return value;
};

// Máscara de CEP
export const formatCEP = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d{1,3})/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1');
};

// Buscar Dados do Endereço via ViaCEP
export const fetchAddressByCEP = async (cep: string) => {
  const cleanCEP = cep.replace(/\D/g, '');
  if (cleanCEP.length !== 8) return null;
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
    const data = await response.json();
    if (data.erro) return null;
    
    return {
      logradouro: data.logradouro || '',
      bairro: data.bairro || '',
      cidade: data.localidade || '',
      estado: data.uf || ''
    };
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
};

// Integração Opcional externa de CPF/CNPJ na API Brasil via Rapid API.
// NOTA: Para uso real, configurar chaves. O Fallback é a validação algorítmica.
export const validateCNPJExternal = async (cnpj: string) => {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  if (!isValidCNPJ(cleanCNPJ)) return false; // Fails local check anyway

  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
  if (!apiKey) return true; // Se não houver chave, assume válido via algoritmo local

  try {
    const response = await fetch(`https://api-brasil.p.rapidapi.com/cnpj/${cleanCNPJ}`, {
      headers: {
         'X-RapidAPI-Key': apiKey,
         'X-RapidAPI-Host': 'api-brasil.p.rapidapi.com'
      }
    });
    if(!response.ok) return true; // Fallback se api falhar no momento
    const data = await response.json();
    return data.status !== 'ERROR';
  } catch (error) {
    return true; // Fallback
  }
};
