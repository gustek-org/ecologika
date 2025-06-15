
// Validação NIF/CNPJ
export const validateNifCnpj = (value: string): boolean => {
  const regex = /^(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{9})$/;
  return regex.test(value);
};

// Mapear interesse keys para labels em português
export const getInterestLabel = (key: string): string => {
  const labels: Record<string, string> = {
    'metal': 'Metal',
    'rubber': 'Borracha',
    'textile': 'Têxteis',
    'plastic': 'Plástico',
    'used-oil': 'Óleo (OAU)',
    'forestry-and-land-use': 'Florestal e Uso do Solo',
    'renewable-energy': 'Energia Renovável',
    'energy-efficiency-and-fuel-substitution': 'Eficiência Energética e Substituição de Combustíveis',
    'waste-and-biomass': 'Resíduos e Biomassa',
    'industry-and-processes': 'Indústria e Processos'
  };
  return labels[key] || key;
};

// Categorizar interesses por seção
export const categorizeInterests = (interests: Array<{id: string, key: string}>) => {
  const residuos = interests.filter(i => 
    ['metal', 'rubber', 'textile', 'plastic', 'used-oil'].includes(i.key)
  );
  
  const projetosCertificados = interests.filter(i => 
    ['forestry-and-land-use', 'renewable-energy', 'energy-efficiency-and-fuel-substitution', 'waste-and-biomass', 'industry-and-processes'].includes(i.key)
  );
  
  const projetosApoiados = [...projetosCertificados]; // Mesmas opções
  
  return { residuos, projetosCertificados, projetosApoiados };
};
