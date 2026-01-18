
import React, { useState, useEffect, useMemo } from 'react';
import { Flight, FlightInsight } from '../types';
import { Plane, MapPin, Wind, ArrowUpRight, Info, Sparkles, X, Globe, MoveHorizontal, Clock, ChevronUp, ChevronDown, Calendar, PlaneTakeoff, PlaneLanding, Timer } from 'lucide-react';

interface FlightInfoCardProps {
  flight: Flight | null;
  insight: FlightInsight | null;
  loadingInsight: boolean;
  onClose: () => void;
}

const FlightInfoCard: React.FC<FlightInfoCardProps> = ({ flight, insight, loadingInsight, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (flight) {
      const timer = setTimeout(() => setIsExpanded(false), 50);
      return () => clearTimeout(timer);
    }
  }, [flight?.icao24]);

  // Cálculo de Distância e Tempo Restante
  const remainingData = useMemo(() => {
    if (!flight || !insight?.destinationCoords || flight.velocity <= 0 || flight.onGround) return null;

    const toRad = (n: number) => (n * Math.PI) / 180;
    const R = 6371; // Raio da Terra em km
    const dLat = toRad(insight.destinationCoords.lat - flight.latitude);
    const dLon = toRad(insight.destinationCoords.lng - flight.longitude);
    const lat1 = toRad(flight.latitude);
    const lat2 = toRad(insight.destinationCoords.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;

    const speedKmh = flight.velocity * 3.6;
    const timeHours = distanceKm / speedKmh;
    
    const hours = Math.floor(timeHours);
    const minutes = Math.round((timeHours - hours) * 60);

    return {
      distance: Math.round(distanceKm),
      hours,
      minutes,
      totalMinutes: Math.round(timeHours * 60)
    };
  }, [flight, insight]);

  if (!flight) return null;

  const speedKmh = Math.round((flight.velocity || 0) * 3.6);
  const altitudeMeters = Math.round(flight.altitude || 0);

  return (
    <div 
      className={`fixed bottom-[calc(1.5rem+var(--sab))] right-6 left-6 md:left-auto md:w-[400px] bg-slate-900/95 backdrop-blur-3xl border border-white/10 z-[1002] rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col transition-all duration-500 ease-in-out slide-up-fade ${
        isExpanded ? 'max-h-[90vh]' : 'max-h-[180px]'
      }`}
    >
      {/* Botão de Fechar */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white z-30"
      >
        <X size={18} />
      </button>

      {/* Seção Principal */}
      <div 
        className="p-6 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="relative h-16 w-16 rounded-2xl bg-slate-800 overflow-hidden flex-shrink-0 border border-white/10 shadow-inner">
            {insight?.imageUrl ? (
              <img src={insight.imageUrl} className="w-full h-full object-cover" alt="Aeronave" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
                <Plane size={28} className="text-slate-500 -rotate-12" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-black text-white tracking-tighter leading-none">{flight.callsign}</h2>
              <span className="px-2 py-0.5 bg-sky-500/20 rounded-md border border-sky-500/30 text-[10px] font-mono text-sky-400 font-bold">
                {flight.icao24}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wide truncate">
              {insight?.aircraftTypeGuess || 'Identificando aeronave...'}
            </p>
          </div>
        </div>

        {/* Rota Resumida */}
        <div className="flex items-center justify-between gap-4 bg-white/5 p-3 rounded-2xl border border-white/5">
          <div className="flex-1">
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1 mb-1">
              <PlaneTakeoff size={10} className="text-orange-400" /> ORIGEM
            </div>
            <div className="text-sm font-bold text-white truncate">{insight?.origin || 'Buscando...'}</div>
          </div>
          <MoveHorizontal size={16} className="text-slate-600 shrink-0" />
          <div className="flex-1 text-right">
            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-1 justify-end mb-1">
              DESTINO <PlaneLanding size={10} className="text-emerald-400" />
            </div>
            <div className="text-sm font-bold text-white truncate">{insight?.destination || 'Buscando...'}</div>
          </div>
        </div>
      </div>

      {/* Conteúdo Detalhado */}
      <div className={`px-6 pb-8 space-y-6 overflow-y-auto custom-scrollbar transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 h-0 p-0'}`}>
        
        {/* Estimativa de Tempo de Voo (ETE) */}
        {remainingData && (
          <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
              <Timer size={24} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-0.5">Tempo Restante Estimado</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white font-mono">
                  {remainingData.hours > 0 && `${remainingData.hours}h `}{remainingData.minutes}min
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                  • {remainingData.distance} KM faltantes
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Métricas Técnicas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 text-sky-400 text-[10px] font-black uppercase tracking-widest mb-1">
              <Wind size={14} /> Velocidade
            </div>
            <div className="text-2xl font-mono text-white font-black">
              {speedKmh} <span className="text-xs text-slate-500 font-sans font-bold">km/h</span>
            </div>
          </div>
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1">
              <ArrowUpRight size={14} /> Altitude
            </div>
            <div className="text-2xl font-mono text-white font-black">
              {altitudeMeters} <span className="text-xs text-slate-500 font-sans font-bold">m</span>
            </div>
          </div>
        </div>

        {/* Cronograma Detalhado */}
        <div className="bg-slate-800/20 rounded-2xl p-4 border border-white/5 space-y-4">
          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
            <Clock size={12} /> Horários Operacionais
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Partida Estimada</p>
                <p className="text-sm font-mono text-slate-300">{insight?.schedule?.departureEstimated || '--:--'}</p>
              </div>
              <div className="pt-2 border-t border-white/5">
                <p className="text-[9px] text-sky-400 font-bold uppercase mb-1">Partida Real</p>
                <p className="text-sm font-mono text-sky-400 font-bold">{insight?.schedule?.departureActual || '--:--'}</p>
              </div>
            </div>
            <div className="space-y-3 text-right">
              <div>
                <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Chegada Estimada</p>
                <p className="text-sm font-mono text-slate-300">{insight?.schedule?.arrivalEstimated || '--:--'}</p>
              </div>
              <div className="pt-2 border-t border-white/5">
                <p className="text-[9px] text-emerald-400 font-bold uppercase mb-1">Chegada Real</p>
                <p className="text-sm font-mono text-emerald-400 font-bold">{insight?.schedule?.arrivalActual || '--:--'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Análise de IA */}
        {loadingInsight ? (
          <div className="flex flex-col gap-3 p-4 bg-sky-500/5 rounded-2xl border border-sky-500/10">
            <div className="h-3 bg-sky-500/20 rounded w-1/3 animate-pulse"></div>
            <div className="h-2.5 bg-sky-500/10 rounded w-full animate-pulse"></div>
            <div className="h-2.5 bg-sky-500/10 rounded w-3/4 animate-pulse"></div>
          </div>
        ) : insight && (
          <div className="bg-sky-500/5 p-4 rounded-2xl border border-sky-500/10 space-y-3">
            <div className="flex items-center gap-2 text-sky-400 text-[10px] font-black tracking-widest">
              <Sparkles size={14} fill="currentColor" /> INSIGHT SKYWATCH
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">"{insight.summary}"</p>
            <div className="p-3 bg-sky-500/10 rounded-xl">
              <p className="text-[10px] text-sky-300 leading-snug font-medium">
                <span className="font-black">FATO:</span> {insight.funFact}
              </p>
            </div>
          </div>
        )}

        {/* Rodapé do Card */}
        <div className="flex justify-between items-center text-[9px] px-1 text-slate-600 font-black uppercase tracking-tighter pt-2 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <MapPin size={10} /> {flight.latitude.toFixed(4)}°, {flight.longitude.toFixed(4)}°
          </div>
          <div className="flex items-center gap-1.5">
            <Globe size={10} /> {flight.originCountry}
          </div>
        </div>
      </div>

      {/* Indicador de Swipe */}
      <div 
        className="h-1.5 w-12 bg-slate-700/50 rounded-full mx-auto my-3 shrink-0 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      ></div>
    </div>
  );
};

export default FlightInfoCard;
