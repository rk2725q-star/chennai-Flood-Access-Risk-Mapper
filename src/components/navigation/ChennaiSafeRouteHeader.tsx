import React, { useState } from 'react';
import { Phone, ShieldCheck, CloudRain } from 'lucide-react';

interface HeaderProps {
  rainfallMm: number;
}

export const ChennaiSafeRouteHeader: React.FC<HeaderProps> = ({ rainfallMm }) => {
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
                y1="7"
                x2="12"
                y2="10"
                stroke="#94a3b8"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              <line
                x1="12"
                y1="14"
                x2="12"
                y2="17"
                stroke="#94a3b8"
                strokeWidth="1.4"
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
            </div>
          </div>
        </div>

        {/* Right Controls: Scenario status, ML notice, GCC contact */}
        <div className="flex items-center gap-2 sm:gap-3">
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
            <span className="hidden lg:inline">Risk Model</span>
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
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Road Risk Intelligence</h3>
                  <p className="text-xs text-slate-500">Model specification & training methodology</p>
                </div>
              </div>
              <button
                onClick={() => setShowMlModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 text-sm rounded-md cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium">
                Road risk is estimated using machine-learning models trained on rainfall and geospatial features.
                <div className="mt-1 text-[11px] font-mono text-slate-500 font-normal">
                  Random Forest + HistGradientBoosting
                </div>
              </div>
              <p>
                Synthesized with Chennai Corporation storm-water drain telemetry, elevation contours, and historical inundation logs across Velachery, Madipakkam, and Vyasarpadi.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowMlModal(false)}
                className="px-4 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default ChennaiSafeRouteHeader;

