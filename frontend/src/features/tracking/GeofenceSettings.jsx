import React, { useState } from 'react';
import { ChevronLeft, Plus, Trash2, MapPin, Shield, AlertTriangle } from 'lucide-react';

const GeofenceSettings = ({ onBack }) => {
  const [safeZones, setSafeZones] = useState([
    { id: 1, name: 'Home', radius: 100, status: 'safe' },
    { id: 2, name: 'School', radius: 250, status: 'safe' }
  ]);

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl w-full max-w-2xl rounded-3xl shadow-2xl border border-white/50 pointer-events-auto overflow-hidden">
        
        {/* Header */}
        <header className="p-6 bg-blue-700 text-white flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-xl transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-grow">
            <h3 className="text-xl font-black tracking-tight">Geofence Settings</h3>
            <p className="text-xs text-blue-100 font-bold uppercase opacity-80">Define Safe & Alert Zones</p>
          </div>
          <button className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl transition group">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          </button>
        </header>

        <div className="p-6">
          <div className="flex flex-col gap-4">
            {safeZones.map((zone) => (
              <article 
                key={zone.id}
                className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-200 transition group"
              >
                <div className="p-3 bg-green-50 rounded-xl">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                
                <div className="flex-grow">
                  <h4 className="font-bold text-slate-800 text-lg">{zone.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      RADIUS: {zone.radius}m
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-0.5 rounded flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> SAFE ZONE
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-slate-400 hover:text-red-500 transition">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </article>
            ))}

            <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-sm hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              ADD NEW ZONE ON MAP
            </button>
          </div>

          <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-900">Push Notifications</p>
              <p className="text-xs text-amber-700 mt-0.5 font-medium leading-relaxed">
                You will receive an alert if any friend enters or leaves these designated zones.
              </p>
            </div>
          </div>
        </div>

        <footer className="p-6 bg-slate-50 border-t border-slate-200">
          <button 
            onClick={onBack}
            className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-900 transition active:scale-[0.98]"
          >
            Save Configuration
          </button>
        </footer>
      </div>
    </div>
  );
};

export default GeofenceSettings;
