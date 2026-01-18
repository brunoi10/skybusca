
export interface Airport {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  iata: string;
  type: 'major' | 'minor' | 'regional';
}

export const BRAZILIAN_AIRPORTS: Airport[] = [
  // Principais (Major)
  { id: '1', name: 'Aeroporto de Guarulhos', city: 'São Paulo', lat: -23.4356, lng: -46.4731, iata: 'GRU', type: 'major' },
  { id: '2', name: 'Aeroporto de Congonhas', city: 'São Paulo', lat: -23.6273, lng: -46.6566, iata: 'CGH', type: 'major' },
  { id: '3', name: 'Aeroporto de Brasília', city: 'Brasília', lat: -15.8697, lng: -47.9172, iata: 'BSB', type: 'major' },
  { id: '4', name: 'Aeroporto do Galeão', city: 'Rio de Janeiro', lat: -22.81, lng: -43.2506, iata: 'GIG', type: 'major' },
  { id: '5', name: 'Aeroporto Santos Dumont', city: 'Rio de Janeiro', lat: -22.9105, lng: -43.1631, iata: 'SDU', type: 'major' },
  { id: '6', name: 'Aeroporto de Confins', city: 'Belo Horizonte', lat: -19.6244, lng: -43.9719, iata: 'CNF', type: 'major' },
  { id: '7', name: 'Aeroporto de Viracopos', city: 'Campinas', lat: -23.0069, lng: -47.1344, iata: 'VCP', type: 'major' },
  { id: '8', name: 'Aeroporto de Porto Alegre', city: 'Porto Alegre', lat: -29.9939, lng: -51.1711, iata: 'POA', type: 'major' },
  { id: '9', name: 'Aeroporto de Recife', city: 'Recife', lat: -8.1264, lng: -34.9228, iata: 'REC', type: 'major' },
  { id: '10', name: 'Aeroporto de Salvador', city: 'Salvador', lat: -12.9086, lng: -38.3225, iata: 'SSA', type: 'major' },
  { id: '11', name: 'Aeroporto de Fortaleza', city: 'Fortaleza', lat: -3.7758, lng: -38.5322, iata: 'FOR', type: 'major' },
  { id: '12', name: 'Aeroporto de Curitiba', city: 'Curitiba', lat: -25.5317, lng: -49.1761, iata: 'CWB', type: 'major' },
  { id: '13', name: 'Aeroporto de Manaus', city: 'Manaus', lat: -3.0358, lng: -60.0506, iata: 'MAO', type: 'major' },
  { id: '14', name: 'Aeroporto de Belém', city: 'Belém', lat: -1.3792, lng: -48.4764, iata: 'BEL', type: 'major' },
  { id: '15', name: 'Aeroporto de Florianópolis', city: 'Florianópolis', lat: -27.6703, lng: -48.5525, iata: 'FLN', type: 'major' },
  
  // Regionais (Aparecem com zoom médio)
  { id: '101', name: 'Aeroporto de Ribeirão Preto', city: 'Ribeirão Preto', lat: -21.1364, lng: -47.7767, iata: 'RAO', type: 'regional' },
  { id: '102', name: 'Aeroporto de Londrina', city: 'Londrina', lat: -23.3303, lng: -51.1303, iata: 'LDB', type: 'regional' },
  { id: '103', name: 'Aeroporto de Joinville', city: 'Joinville', lat: -26.2231, lng: -48.7978, iata: 'JOI', type: 'regional' },
  { id: '104', name: 'Aeroporto de Uberlândia', city: 'Uberlândia', lat: -18.8836, lng: -48.2253, iata: 'UDI', type: 'regional' },
  { id: '105', name: 'Aeroporto de Navegantes', city: 'Navegantes', lat: -26.8789, lng: -48.6514, iata: 'NVT', type: 'regional' },
  { id: '106', name: 'Aeroporto de Foz do Iguaçu', city: 'Foz do Iguaçu', lat: -25.5978, lng: -54.485, iata: 'IGU', type: 'regional' },
  { id: '107', name: 'Aeroporto de Cuiabá', city: 'Várzea Grande', lat: -15.6528, lng: -56.1167, iata: 'CGB', type: 'major' },
  { id: '108', name: 'Aeroporto de Goiânia', city: 'Goiânia', lat: -16.6322, lng: -49.2203, iata: 'GYN', type: 'major' },
  { id: '109', name: 'Aeroporto de Natal', city: 'Parnamirim', lat: -5.7689, lng: -35.3664, iata: 'NAT', type: 'major' },

  // Menores (Aparecem com zoom alto)
  { id: '201', name: 'Aeroporto de Bauru-Arealva', city: 'Bauru', lat: -22.1578, lng: -49.0606, iata: 'JTC', type: 'minor' },
  { id: '202', name: 'Aeroporto de Maringá', city: 'Maringá', lat: -23.4794, lng: -52.0122, iata: 'MGF', type: 'minor' },
  { id: '203', name: 'Aeroporto de Cascavel', city: 'Cascavel', lat: -24.985, lng: -53.5011, iata: 'CAC', type: 'minor' },
  { id: '204', name: 'Aeroporto de Chapecó', city: 'Chapecó', lat: -27.1339, lng: -52.6617, iata: 'XAP', type: 'minor' },
  { id: '205', name: 'Aeroporto de Passo Fundo', city: 'Passo Fundo', lat: -28.2458, lng: -52.3275, iata: 'PFB', type: 'minor' },
  { id: '206', name: 'Aeroporto de Caxias do Sul', city: 'Caxias do Sul', lat: -29.1953, lng: -51.1886, iata: 'CXJ', type: 'minor' },
  { id: '207', name: 'Aeroporto de Pelotas', city: 'Pelotas', lat: -31.7178, lng: -52.3314, iata: 'PET', type: 'minor' },
  { id: '208', name: 'Aeroporto de Santarém', city: 'Santarém', lat: -2.4244, lng: -54.7911, iata: 'STM', type: 'minor' },
  { id: '209', name: 'Aeroporto de Marabá', city: 'Marabá', lat: -5.3686, lng: -49.1378, iata: 'MAB', type: 'minor' },
  { id: '210', name: 'Aeroporto de Imperatriz', city: 'Imperatriz', lat: -5.5317, lng: -47.4589, iata: 'IMP', type: 'minor' },
  { id: '211', name: 'Aeroporto de Petrolina', city: 'Petrolina', lat: -9.3622, lng: -40.5636, iata: 'PNZ', type: 'minor' },
  { id: '212', name: 'Aeroporto de Ilhéus', city: 'Ilhéus', lat: -14.8142, lng: -39.0331, iata: 'IOS', type: 'minor' },
  { id: '213', name: 'Aeroporto de Porto Seguro', city: 'Porto Seguro', lat: -16.4381, lng: -39.0778, iata: 'BPS', type: 'minor' },
  { id: '214', name: 'Aeroporto de Montes Claros', city: 'Montes Claros', lat: -16.7061, lng: -43.8219, iata: 'MOC', type: 'minor' },
  { id: '215', name: 'Aeroporto de Juiz de Fora (Regional)', city: 'Goianá', lat: -21.5125, lng: -43.1747, iata: 'IZA', type: 'minor' },
  { id: '216', name: 'Aeroporto de Sorocaba', city: 'Sorocaba', lat: -23.4831, lng: -47.4853, iata: 'SOD', type: 'minor' },
  { id: '217', name: 'Aeroporto de Jundiaí', city: 'Jundiaí', lat: -23.18, lng: -46.9442, iata: 'QDV', type: 'minor' },
  { id: '218', name: 'Aeroporto Campo de Marte', city: 'São Paulo', lat: -23.5092, lng: -46.6375, iata: 'RTE', type: 'minor' }
];
