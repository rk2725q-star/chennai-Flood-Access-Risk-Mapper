import React, { useState } from 'react';
import { Phone, ShieldCheck, CloudRain, Calendar, Sun } from 'lucide-react';
import { ChennaiForecastResponse } from '../../types/weather';

interface HeaderProps {
  rainfallMm: number;
  forecast?: ChennaiForecastResponse | null;
  onOpenForecastModal?: () => void;
}

export const ChennaiSafeRouteHeader: React.FC<HeaderProps> = ({ 
  rainfallMm,
  forecast,
  onOpenForecastModal 
}) => {
  const [showMlModal, setShowMlModal] = useState(false);

  return (
    <header className="relative z-30 bg-white border-b border-slate-200/90 select-none">
      {/* Thin saffron line running directly beneath the header */}
      <div className="h-[2.5px] w-full bg-[#f97316]" />

      <div className="w-full px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          {/* Bespoke Logo: A road with a drop of rain colored with green and navy */}
          <div className="flex items-center justify-center w-8.5 h-8.5 rounded-lg bg-slate-50 border border-slate-200 shadow-xs">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 21L9.2 3H14.8L19 21"
                stroke="#0f172a"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="12"
                y1="3"
                x2="12"
                y2="21"
                stroke="#059669"
                strokeWidth="1.8"
                strokeDasharray="2 3"
                strokeLinecap="round"
              />
              <path
                d="M12 2.8C12 2.8 15 6.2 15 8.2C15 9.85 13.65 11.2 12 11.2C10.35 11.2 9 9.85 9 8.2C9 6.2 12 2.8 12 2.8Z"
                fill="#059669"
                fillOpacity="0.95"
              />
            </svg>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-slate-900 font-sans">
                ChennaiSafeRoute
              </span>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200/80">
                Live Monsoon Navigation
              </span>
              <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Background Engine: 4,531 Roads • 634 Drains • 1,215 Lakes • 58 Flood Hotspots
              </span>
            </div>
          </div>
        </div>

        {/* Right Controls: Weather Forecast, Scenario status, ML notice, GCC contact */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Real-time Weather & 7-Day Forecast Button */}
          {onOpenForecastModal && (
            <button
              type="button"
              onClick={onOpenForecastModal}
              title="Open Real-Time & 7-Day Chennai Weather Forecast"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50/80 hover:bg-sky-100 border border-sky-200/80 text-xs text-sky-900 transition-colors cursor-pointer shadow-2xs font-medium"
            >
              <span className="text-sm leading-none">{forecast?.current?.icon || '⛅'}</span>
              <span className="font-bold text-slate-900 font-mono">
                {forecast?.current ? `${forecast.current.temperature}°C` : 'Forecast'}
              </span>
              {forecast?.daily?.[0] && (
                <span className="text-sky-700 hidden sm:inline text-[11px]">
                  • Today {forecast.daily[0].precipSumMm}mm
                </span>
              )}
              <span className="text-[10px] text-sky-600 font-semibold px-1 rounded bg-white/80 border border-sky-200/60 ml-0.5">
                7-Day ▾
              </span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <CloudRain className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="font-medium text-slate-900">{rainfallMm} mm</span>
            <span className="text-slate-400 hidden sm:inline">/ 6h</span>
          </div>

          <button
            type="button"
            onClick={() => setShowMlModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
            title="View predictive risk estimation details"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden lg:inline">Background Engine</span>
          </button>

          <a
            href="tel:1913"
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Phone className="w-3 h-3 text-orange-400" />
            <span>1913</span>
            <span className="text-slate-400 hidden sm:inline text-[10px]">GCC Helpline</span>
          </a>
        </div>
      </div>

      {showMlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 text-slate-800 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Background Hydrology & ML Engine</h3>
                  <p className="text-xs text-slate-500">Live operational data pipeline & predictive modeling</p>
                </div>
              </div>
              <button
                onClick={() => setShowMlModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-sm rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-600">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Road Corridors</span>
                  <span className="text-sm font-bold text-slate-900">4,531 Segments</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Drainage Network</span>
                  <span className="text-sm font-bold text-sky-700">634 Channels & Canals</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Water Bodies</span>
                  <span className="text-sm font-bold text-sky-700">1,215 Lakes & Tanks</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Flood Hotspots</span>
                  <span className="text-sm font-bold text-red-600">58 Historical Events</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Physical Hydrological Features (14 Variables):</h4>
                <p>
                  Every road segment in Chennai is dynamically evaluated on 14 physical factors:
                  Elevation (GLO-90 DEM), Height Above Nearest Drainage (HAND), Topographic Wetness Index (TWI),
                  Flow Accumulation, Catchment Area, Proximity to Water Bodies, Distance to Stormwater Drains,
                  Drainage Density, Built-Up Imperviousness %, and Road Connectivity Degree.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Major Waterways & Reservoirs Tracked:</h4>
                <p>
                  Adyar River, Cooum River, Buckingham Canal, Otteri Nullah, Mambalam Canal, Veerangal Odai,
                  Chembarambakkam Lake, Puzhal / Red Hills Reservoir, Porur Lake, Velachery Lake, Ambattur Lake,
                  Retteri Lake, and Pallikaranai Marsh Wetland.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Predictive Model Ensemble:</h4>
                <p>
                  Balanced Random Forest + Histogram-based Gradient Boosting trained on historical Chennai flood ground-truth
                  events (Michaung 2023, Nivar 2020, 2015 Floods) achieving <strong>99.05% ROC-AUC</strong> validation accuracy.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Greater Chennai Corporation & TNSDMA Integration</span>
                <span className="font-medium text-emerald-600">Engine Active</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};


export default ChennaiSafeRouteHeader;

