
import React, { useState } from 'react';
import { AirportBoard, AirportFlight } from '../types';
import { Plane, X, PlaneTakeoff, PlaneLanding, Clock, AlertCircle } from 'lucide-react';

interface AirportInfoPanelProps {
  board: AirportBoard | null;
  loading: boolean;
  onClose: () => void;
}

const AirportInfoPanel: React.FC<AirportInfoPanelProps> = ({ board, loading, onClose }) => {
  const [activeTab, setActiveTab] = useState<'Em curso' | 'Estimado' | 'Próximo'>('Em curso');

  if (!board && !loading) return null;

  const filteredFlights = board?.flights.filter(f => f.status === activeTab) || [];

  return (
    <div className="fixed top-[calc(1.5rem+var(--sat))] right-6 bottom-[calc(6rem+var(--sab))] left-6 md:left-auto md:w-full md:max-w-sm bg-slate-900/95 backdrop-blur-2xl border border-slate-700/50 z-[1002] rounded-[32px] shadow-2xl overflow-hidden flex flex-col slide-up-fade">
      {/* Header */}
      <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 border-b border-white/5 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
        >
          <X size={18} />
        </button>
        
        <h2 className="text-2xl font-black text-white tracking-tighter leading-tight pr-8">
          {loading ? 'Carregando...' : board?.airportName}
        </h2>
        <p className="text-sky-400 text-xs font-bold uppercase tracking-widest mt-1">
          {board?.city || 'Brasil'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-950/50 p-1 m-4 rounded-2xl border border-white/5">
        {(['Em curso', 'Estimado', 'Próximo'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-tighter rounded-xl transition-all ${
              activeTab === tab 
                ? 'bg-sky-500 text-white shadow-lg' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Flight List */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
        {loading ? (
          <div className="space-y-4 pt-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-slate-800/40 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredFlights.length > 0 ? (
          <div className="space-y-3">
            {filteredFlights.map((f, idx) => (
              <div 
                key={idx} 
                className="bg-slate-800/40 active:bg-slate-800/60 transition-colors p-4 rounded-2xl border border-white/5 group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {f.type === 'Partida' ? (
                      <PlaneTakeoff size={14} className="text-orange-400" />
                    ) : (
                      <PlaneLanding size={14} className="text-sky-400" />
                    )}
                    <span className="text-lg font-mono font-bold text-white group-active:text-sky-300 transition-colors">
                      {f.callsign}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono text-slate-100">{f.time}</span>
                    <div className="text-[9px] text-slate-500 uppercase font-bold">Horário</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">{f.airline}</div>
                    <div className="text-xs text-slate-300 font-medium truncate max-w-[150px]">{f.destinationOrigin}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                      f.type === 'Partida' ? 'bg-orange-500/10 text-orange-500' : 'bg-sky-500/10 text-sky-500'
                    }`}>
                      {f.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-12 text-slate-600 opacity-50">
            <AlertCircle size={48} className="mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest text-center px-8">Nenhum tráfego detectado para esta categoria</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-slate-950/50 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
          <Clock size={12} /> IA-SYNC
        </div>
        <div className="text-[10px] text-sky-500/80 font-black">RADAR BOARD LIVE</div>
      </div>
    </div>
  );
};

export default AirportInfoPanel;
