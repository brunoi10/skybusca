
import React from 'react';
import { Flight, FlightInsight } from '../types';
import { Plane, MapPin, Wind, ArrowUpRight, Info, Sparkles, X, Globe } from 'lucide-react';

interface SidebarProps {
  flight: Flight | null;
  insight: FlightInsight | null;
  loadingInsight: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ flight, insight, loadingInsight, onClose }) => {
  if (!flight) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-700 z-[1000] overflow-y-auto shadow-2xl flex flex-col transition-all animate-in slide-in-from-right duration-500">
      {/* Cabeçalho */}
      <div className="p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-900/80 backdrop-blur-md z-10">
        <div>
          <h2 className="text-2xl font-bold text-sky-400 tracking-tight">{flight.callsign}</h2>
          <p className="text-slate-400 text-sm flex items-center gap-1">
            <Globe size={14} /> {flight.originCountry}
          </p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-6 space-y-8">
        {/* Métricas Principais */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs uppercase tracking-wider font-semibold">
              <ArrowUpRight size={14} className="text-emerald-400" /> Altitude
            </div>
            <div className="text-xl font-mono">
              {Math.round(flight.altitude || 0).toLocaleString()} <span className="text-xs text-slate-500 font-sans">m</span>
            </div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs uppercase tracking-wider font-semibold">
              <Wind size={14} className="text-sky-400" /> Velocidade
            </div>
            <div className="text-xl font-mono">
              {Math.round((flight.velocity || 0) * 3.6).toLocaleString()} <span className="text-xs text-slate-500 font-sans">km/h</span>
            </div>
          </div>
        </div>

        {/* Dados Detalhados */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-widest font-bold text-slate-500 border-b border-slate-800 pb-2">Dados do Voo</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-2"><Info size={16}/> ICAO24</span>
              <span className="font-mono text-sm">{flight.icao24}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-2"><MapPin size={16}/> Posição</span>
              <span className="text-sm font-mono">{flight.latitude.toFixed(4)}°, {flight.longitude.toFixed(4)}°</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 flex items-center gap-2"><Plane size={16}/> Rumo</span>
              <span className="text-sm">{flight.heading}°</span>
            </div>
          </div>
        </div>

        {/* Seção de Insights da IA */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-slate-800/80 p-6 rounded-3xl border border-slate-700">
            <div className="flex items-center gap-2 text-sky-400 mb-4 font-bold italic">
              <Sparkles size={18} /> INSIGHTS DE IA
            </div>

            {loadingInsight ? (
              <div className="space-y-4">
                <div className="h-4 bg-slate-700/50 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-slate-700/50 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-slate-700/50 rounded animate-pulse w-5/6"></div>
              </div>
            ) : insight ? (
              <div className="space-y-5">
                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold mb-1">Aeronave Provável</div>
                  <div className="text-lg text-slate-100">{insight.aircraftTypeGuess}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold mb-1">Resumo</div>
                  <div className="text-sm text-slate-300 leading-relaxed italic">"{insight.summary}"</div>
                </div>
                <div className="bg-sky-950/30 p-4 rounded-xl border border-sky-800/30">
                  <div className="text-xs text-sky-500 uppercase font-bold mb-2">Curiosidade</div>
                  <div className="text-sm text-sky-200/80 leading-snug">{insight.funFact}</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500 italic">Selecione um voo para gerar insights...</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Rodapé da Sidebar */}
      <div className="mt-auto p-6 text-center border-t border-slate-800/50">
        <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em]">SkyWatch Análises em Tempo Real</p>
      </div>
    </div>
  );
};

export default Sidebar;
