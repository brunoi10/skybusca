
import { Flight } from '../types';

const OPENSKY_URL = 'https://opensky-network.org/api/states/all';
const OPENSKY_TRACK_URL = 'https://opensky-network.org/api/tracks/all';

// Lista de proxies resilientes
const PROXIES = [
  (target: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`,
  (target: string) => `https://corsproxy.io/?${encodeURIComponent(target)}`,
  (target: string) => `https://thingproxy.freeboard.io/fetch/${target}`
];

/**
 * Helper para realizar fetch com timeout e fallback de proxy
 */
async function fetchWithRetry(url: string, timeoutMs: number = 12000): Promise<Response> {
  let lastError: Error | null = null;

  // Tenta cada proxy da lista até um funcionar
  for (const proxyFn of PROXIES) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const proxyUrl = proxyFn(url);
      const response = await fetch(proxyUrl, { 
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      
      clearTimeout(id);
      
      if (response.ok || response.status === 429) {
        return response;
      }
      
      throw new Error(`Status ${response.status}`);
    } catch (err: any) {
      clearTimeout(id);
      lastError = err;
      
      if (err.name === 'AbortError') {
        console.warn(`Timeout atingido para o proxy: ${proxyFn(url).substring(0, 30)}...`);
      } else {
        console.warn(`Falha no proxy: ${err.message}`);
      }
      // Continua para o próximo proxy
      continue;
    }
  }

  throw lastError || new Error('Todos os proxies falharam');
}

export const fetchFlights = async (bounds?: {
  lamin: number;
  lomin: number;
  lamax: number;
  lomax: number;
}): Promise<Flight[]> => {
  try {
    let url = OPENSKY_URL;
    if (bounds) {
      url += `?lamin=${bounds.lamin}&lomin=${bounds.lomin}&lamax=${bounds.lamax}&lomax=${bounds.lomax}`;
    }

    const response = await fetchWithRetry(url, 15000); // Aumento de timeout para 15s
    
    if (response.status === 429) {
      // Rate limit do OpenSky é comum, não é um erro fatal
      return [];
    }

    const data = await response.json();
    if (!data || !data.states) return [];

    return data.states.map((s: any[]) => ({
      icao24: s[0],
      callsign: s[1]?.trim() || 'N/A',
      originCountry: s[2],
      longitude: s[5],
      latitude: s[6],
      altitude: s[7],
      velocity: s[9],
      heading: s[10] || 0,
      onGround: s[8],
      verticalRate: s[11],
      lastContact: s[4]
    })).filter((f: any) => f.latitude && f.longitude);
  } catch (error: any) {
    if (error.name !== 'AbortError') {
      console.error('Radar sync error:', error.message);
    }
    return [];
  }
};

export const fetchFlightTrack = async (icao24: string): Promise<[number, number][]> => {
  try {
    const url = `${OPENSKY_TRACK_URL}?icao24=${icao24}`;
    const response = await fetchWithRetry(url, 10000);
    
    if (!response.ok) return [];
    
    const data = await response.json();
    if (!data.path) return [];

    return data.path.map((p: any[]) => [p[1], p[2]] as [number, number]);
  } catch (error) {
    return [];
  }
};
