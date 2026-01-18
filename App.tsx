
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import { fetchFlights, fetchFlightTrack } from './services/flightService';
import { getFlightInsight, getAirportBoard } from './services/geminiService';
import { fetchTemperature } from './services/weatherService';
import { Flight, FlightInsight, AirportBoard } from './types';
import { BRAZILIAN_AIRPORTS, Airport } from './data/airports';
import FlightInfoCard from './components/FlightInfoCard';
import AirportInfoPanel from './components/AirportInfoPanel';
import PlaneIcon from './components/PlaneIcon';
import { Search, Navigation, Layers, Info, MapPin, Thermometer, Smartphone, AlertCircle, Globe, Map as MapIcon } from 'lucide-react';

const MapStateController: React.FC<{ 
  onBoundsChange: (bounds: any) => void, 
  onZoomChange: (zoom: number) => void 
}> = ({ onBoundsChange, onZoomChange }) => {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      onBoundsChange({
        lamin: bounds.getSouth(),
        lomin: bounds.getWest(),
        lamax: bounds.getNorth(),
        lomax: bounds.getEast()
      });
      onZoomChange(map.getZoom());
    },
    zoomend: () => {
      onZoomChange(map.getZoom());
    }
  });
  return null;
};

const AirportMarkerComponent: React.FC<{ airport: Airport; temp: number | null; zoom: number }> = ({ airport, temp, zoom }) => {
  const isMinor = airport.type === 'minor';
  const isRegional = airport.type === 'regional';
  
  // Aeroportos menores ficam mais discretos para não poluir
  const sizeClass = isMinor ? 'p-1.5' : isRegional ? 'p-2' : 'p-2.5';
  const iconSize = isMinor ? 12 : 14;

  return (
    <div className="relative flex items-center group cursor-pointer touch-none">
      <div className={`bg-slate-900/95 border border-slate-600 ${sizeClass} rounded-full shadow-2xl group-active:bg-sky-500 transition-all backdrop-blur-md ring-2 ring-white/10`}>
        <MapPin size={iconSize} className="text-sky-400 group-active:text-white" fill="currentColor" />
      </div>
      
      {/* Nome e temperatura aparecem se for Major ou se o zoom estiver alto */}
      {(airport.type === 'major' || zoom >= 8) && (
        <div className="ml-2 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 py-1.5 px-3 rounded-full shadow-lg">
          <span className="text-[10px] font-black text-slate-100 tracking-tighter">{airport.iata}</span>
          {temp !== null && (
            <>
              <div className="w-px h-2 bg-slate-700"></div>
              <div className="flex items-center gap-0.5 text-sky-400 font-mono text-[10px] font-bold">
                <Thermometer size={10} />
                {Math.round(temp)}°
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedAirportBoard, setSelectedAirportBoard] = useState<AirportBoard | null>(null);
  const [insight, setInsight] = useState<FlightInsight | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [loadingAirport, setLoadingAirport] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [mapStyle, setMapStyle] = useState<'radar' | 'satellite'>('satellite');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapBounds, setMapBounds] = useState({ lamin: -35, lomin: -60, lamax: 5, lomax: -30 });
  const [currentZoom, setCurrentZoom] = useState(4);
  const [track, setTrack] = useState<[number, number][]>([]);
  const [airportTemps, setAirportTemps] = useState<Record<string, number | null>>({});
  const [showMobileHelp, setShowMobileHelp] = useState(false);
  
  const refreshInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadFlights = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await fetchFlights(mapBounds);
      if (data && data.length > 0) {
        setFlights(data);
        setApiError(false);
      } else if (flights.length === 0) {
        setApiError(true);
      }
    } catch {
      setApiError(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [mapBounds, flights.length]);

  useEffect(() => {
    const loadTemps = async () => {
      const tempMap: Record<string, number | null> = {};
      // Carrega temperaturas gradualmente para não travar
      const fetchBatch = async (airports: Airport[]) => {
        await Promise.all(airports.map(async (airport) => {
          const temp = await fetchTemperature(airport.lat, airport.lng);
          tempMap[airport.id] = temp;
        }));
        setAirportTemps(prev => ({ ...prev, ...tempMap }));
      };
      
      // Aeroportos principais primeiro
      await fetchBatch(BRAZILIAN_AIRPORTS.filter(a => a.type === 'major'));
      // Depois os outros com delay
      setTimeout(() => fetchBatch(BRAZILIAN_AIRPORTS.filter(a => a.type !== 'major')), 2000);
    };
    loadTemps();
  }, []);

  useEffect(() => {
    loadFlights();
    refreshInterval.current = setInterval(loadFlights, 15000);
    return () => {
      if (refreshInterval.current) clearInterval(refreshInterval.current);
    };
  }, [loadFlights]);

  const handleFlightClick = async (flight: Flight) => {
    setSelectedAirportBoard(null);
    setSelectedFlight(flight);
    setInsight(null);
    setTrack([]);
    setLoadingInsight(true);

    try {
      const [insightData, trackData] = await Promise.all([
        getFlightInsight(flight),
        fetchFlightTrack(flight.icao24)
      ]);
      setInsight(insightData);
      setTrack(trackData);
    } catch (err) {
      console.error("Erro ao carregar detalhes do voo:", err);
    } finally {
      setLoadingInsight(false);
    }
  };

  const handleAirportClick = async (airport: Airport) => {
    setSelectedFlight(null);
    setTrack([]);
    setLoadingAirport(true);
    setSelectedAirportBoard({ airportName: airport.name, city: airport.city, flights: [] });

    try {
      const board = await getAirportBoard(airport.iata, airport.name);
      setSelectedAirportBoard(board);
    } catch (err) {
      console.error("Erro ao buscar quadro de voos:", err);
    } finally {
      setLoadingAirport(false);
    }
  };

  const filteredFlights = flights.filter(f => 
    f.callsign.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.icao24.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtra aeroportos visíveis com base no zoom
  const visibleAirports = useMemo(() => {
    return BRAZILIAN_AIRPORTS.filter(airport => {
      if (airport.type === 'major') return true;
      if (airport.type === 'regional' && currentZoom >= 6) return true;
      if (airport.type === 'minor' && currentZoom >= 9) return true;
      return false;
    });
  }, [currentZoom]);

  return (
    <div className="relative h-screen w-screen overflow-hidden flex font-sans bg-[#020408] touch-pan-y">
      {/* Mobile Install Help Modal */}
      {showMobileHelp && (
        <div className="fixed inset-0 z-[2500] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl">
          <div className="bg-slate-900 border border-slate-700 rounded-[40px] p-8 max-w-sm w-full shadow-2xl space-y-6 slide-up-fade">
            <div className="w-20 h-20 bg-sky-500/20 rounded-[30px] flex items-center justify-center mx-auto ring-1 ring-sky-500/50">
              <Smartphone className="text-sky-400" size={40} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">App Mobile</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Transforme este radar em um aplicativo nativo no seu Android ou iPhone.</p>
            </div>
            <div className="space-y-3">
              <div className="flex gap-4 items-center bg-slate-800/40 p-4 rounded-2xl border border-white/5">
                <div className="w-8 h-8 bg-sky-500 rounded-xl flex items-center justify-center text-xs font-black shrink-0 shadow-lg shadow-sky-500/20">1</div>
                <p className="text-sm text-slate-300">Toque no ícone de <span className="text-white font-bold">Menu</span> do navegador.</p>
              </div>
              <div className="flex gap-4 items-center bg-slate-800/40 p-4 rounded-2xl border border-white/5">
                <div className="w-8 h-8 bg-sky-500 rounded-xl flex items-center justify-center text-xs font-black shrink-0 shadow-lg shadow-sky-500/20">2</div>
                <p className="text-sm text-slate-300">Escolha <span className="text-sky-400 font-bold">"Adicionar à Tela de Início"</span>.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowMobileHelp(false)}
              className="w-full py-5 bg-sky-500 hover:bg-sky-400 text-white font-black rounded-3xl transition-all shadow-xl shadow-sky-500/30 active:scale-95"
            >
              VAMOS DECOLAR!
            </button>
          </div>
        </div>
      )}

      {/* Interface Controls */}
      <div className="absolute top-[calc(1.5rem+var(--sat))] left-6 z-[1001] w-full max-w-sm pointer-events-none pr-12">
        <div className="pointer-events-auto flex flex-col gap-4">
          <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-2xl p-4 rounded-[32px] border border-slate-700/50 shadow-2xl">
            <div className="p-2.5 bg-sky-500 rounded-2xl shadow-lg shadow-sky-500/20">
              <Navigation className="text-white" size={20} fill="white" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-black tracking-tighter text-white uppercase leading-none">SkyWatch <span className="text-sky-400">BR</span></h1>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Radar Pro v1.5</p>
            </div>
            <button 
              onClick={() => setShowMobileHelp(true)}
              className="p-2 bg-slate-800 rounded-xl text-slate-400 active:text-white"
            >
              <Smartphone size={18} />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              inputMode="search"
              placeholder="Buscar voo ou aeroporto..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 backdrop-blur-2xl border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-all shadow-xl text-white placeholder:text-slate-500"
            />
          </div>

          {/* API Error Alert */}
          {apiError && (
            <div className="flex items-center gap-3 bg-rose-600/90 backdrop-blur-xl p-3 rounded-2xl border border-rose-400/50 shadow-2xl animate-pulse">
              <AlertCircle className="text-white shrink-0" size={18} />
              <p className="text-[10px] text-white font-bold leading-tight uppercase tracking-tight">Dados de radar atrasados. Reconectando...</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="absolute bottom-[calc(2rem+var(--sab))] left-6 z-[1001] flex items-center gap-4 bg-slate-900/90 backdrop-blur-xl px-5 py-2.5 rounded-full border border-slate-800/50 text-[10px] font-black text-slate-200 shadow-2xl">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-sky-500 animate-pulse' : apiError ? 'bg-rose-500' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></div>
          <span className="opacity-70">{isRefreshing ? 'SYNC' : apiError ? 'RETRY' : 'LIVE'}</span>
        </div>
        <div className="w-px h-3 bg-slate-700"></div>
        <div className="tracking-widest uppercase">{flights.length} AERONAVES NO AR</div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer 
          center={[-15.7938, -47.8827]} 
          zoom={4} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          attributionControl={false}
          tap={false}
        >
          {mapStyle === 'radar' ? (
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; CARTO'
            />
          ) : (
            <>
              {/* Camada de Imagem de Satélite */}
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; Esri'
              />
              {/* Camada de Rótulos (Nomes de Cidades/Países) */}
              <TileLayer
                url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                opacity={0.7}
              />
            </>
          )}
          
          <MapStateController 
            onBoundsChange={setMapBounds} 
            onZoomChange={setCurrentZoom} 
          />

          {/* Airports (Dinamizados pelo Zoom) */}
          {visibleAirports.map((airport) => (
            <Marker 
              key={airport.id} 
              position={[airport.lat, airport.lng]} 
              icon={L.divIcon({
                className: 'custom-airport-marker',
                html: ReactDOMServer.renderToString(
                  <AirportMarkerComponent 
                    airport={airport} 
                    temp={airportTemps[airport.id] || null} 
                    zoom={currentZoom}
                  />
                ),
                iconSize: [40, 40],
                iconAnchor: [20, 20]
              })}
              eventHandlers={{ click: (e) => {
                L.DomEvent.stopPropagation(e);
                handleAirportClick(airport);
              }}}
            />
          ))}

          {/* Trajectory */}
          {track.length > 0 && (
            <Polyline 
              positions={track} 
              pathOptions={{ 
                color: '#38bdf8', 
                weight: 4, 
                opacity: 0.8,
                dashArray: '8, 12',
                lineCap: 'round'
              }} 
            />
          )}

          {/* Flights */}
          {filteredFlights.map((flight) => {
            if (!flight.latitude || !flight.longitude) return null;
            const isSelected = selectedFlight?.icao24 === flight.icao24;
            
            return (
              <Marker 
                key={flight.icao24} 
                position={[flight.latitude, flight.longitude]} 
                icon={L.divIcon({
                  className: 'custom-marker-icon',
                  html: ReactDOMServer.renderToString(<PlaneIcon heading={flight.heading} isSelected={isSelected} />),
                  iconSize: [32, 32],
                  iconAnchor: [16, 16]
                })}
                eventHandlers={{ click: (e) => {
                  L.DomEvent.stopPropagation(e);
                  handleFlightClick(flight);
                }}}
              />
            );
          })}
        </MapContainer>
      </div>

      {/* Panels */}
      <FlightInfoCard 
        flight={selectedFlight} 
        insight={insight} 
        loadingInsight={loadingInsight}
        onClose={() => {
          setSelectedFlight(null);
          setInsight(null);
          setTrack([]);
        }}
      />

      <AirportInfoPanel 
        board={selectedAirportBoard} 
        loading={loadingAirport}
        onClose={() => setSelectedAirportBoard(null)}
      />
      
      {/* Map Style Toggle Button */}
      <div className="absolute top-[calc(1.5rem+var(--sat))] right-6 z-[999] flex flex-col gap-3">
        <button 
          onClick={() => setMapStyle(mapStyle === 'radar' ? 'satellite' : 'radar')}
          className="p-4 bg-slate-900/95 backdrop-blur-2xl rounded-2xl border border-slate-700/50 text-sky-400 active:bg-slate-800 shadow-2xl transition-all flex items-center justify-center ring-1 ring-white/10"
        >
          {mapStyle === 'radar' ? <Globe size={24} /> : <MapIcon size={24} className="text-emerald-400" />}
        </button>
      </div>
    </div>
  );
};

export default App;
