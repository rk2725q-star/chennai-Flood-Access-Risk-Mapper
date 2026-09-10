import React, { useState } from 'react';
import { MapPin, ArrowRight, Check, SlidersHorizontal, ArrowUpDown, Crosshair } from 'lucide-react';
import { RoutePreference, RouteOptionData, PlaceSuggestion } from '../../types/navigation';
import { searchChennaiPlaces } from '../../services/routeService';

interface PlanRoutePanelProps {
  origin: string;
  setOrigin: (val: string) => void;
  destination: string;
  setDestination: (val: string) => void;
  rainfallMm: number;
  setRainfallMm: (val: number) => void;
  preference: RoutePreference;
  setPreference: (val: RoutePreference) => void;
  routes: RouteOptionData[];
  selectedRouteId: string | null;
  onSelectRoute: (routeId: string) => void;
  onFindRoute: () => void;
  isLoading: boolean;
  hasSearched: boolean;
  onSelectOriginPlace?: (place: PlaceSuggestion) => void;
  onSelectDestinationPlace?: (place: PlaceSuggestion) => void;
  onSwapLocations?: () => void;
  onUseCurrentLocation?: () => void;
}

const POPULAR_DESTINATIONS = [
  'Chennai Central Railway Station (Park Town)',
  'Apollo Hospital Greams Road (Thousand Lights)',
  'Velachery (Vijayanagar Bus Stand)',
  'Koyambedu (CMBT Intercity Bus Terminus)',
  'Chennai International Airport (MAA Meenambakkam)',
  'Navalur / Siruseri (SIPCOT IT Park)',
  'Tambaram Railway Junction (West & Bus Stand)'
];

export const PlanRoutePanel: React.FC<PlanRoutePanelProps> = ({
  origin,
  setOrigin,
  destination,
  setDestination,
  rainfallMm,
  setRainfallMm,
  preference,
  setPreference,
  routes,
  selectedRouteId,
  onSelectRoute,
  onFindRoute,
  isLoading,
  hasSearched,
  onSelectOriginPlace,
  onSelectDestinationPlace,
  onSwapLocations,
  onUseCurrentLocation
}) => {
  const [isSearchingOrigin, setIsSearchingOrigin] = useState(false);
  const [originSuggestions, setOriginSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearchingDest, setIsSearchingDest] = useState(false);
  const [destSuggestions, setDestSuggestions] = useState<PlaceSuggestion[]>([]);

  const handleOriginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setOrigin(val);
    setOriginSuggestions(searchChennaiPlaces(val));
    setIsSearchingOrigin(true);
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDestination(val);
    setDestSuggestions(searchChennaiPlaces(val));
    setIsSearchingDest(true);
  };

  const selectOriginPlace = (place: PlaceSuggestion) => {
    setOrigin(place.name);
    setIsSearchingOrigin(false);
    if (onSelectOriginPlace) {
      onSelectOriginPlace(place);
    }
  };

  const selectDestPlace = (place: PlaceSuggestion) => {
    setDestination(place.name);
    setIsSearchingDest(false);
    if (onSelectDestinationPlace) {
      onSelectDestinationPlace(place);
    }
  };

  const activeRoute = routes.find(r => r.id === selectedRouteId) || routes[1] || routes[0];

  return (
    <div className="flex flex-col h-full bg-white text-slate-800 p-5 overflow-y-auto space-y-6">
      <div>
        <h2 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
          PLAN ROUTE
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Select origin, destination and weather scenario
        </p>
      </div>

      <div className="space-y-2.5 relative">
        {/* From Input with Autocomplete */}
        <div className="relative">
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            From:
          </label>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-slate-200 bg-white focus-within:border-slate-800 focus-within:ring-1 focus-within:ring-slate-800 transition-all">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <input
              type="text"
              value={origin}
              onChange={handleOriginChange}
              onFocus={() => {
                setOriginSuggestions(searchChennaiPlaces(origin));
                setIsSearchingOrigin(true);
              }}
              placeholder="Search origin (e.g. T. Nagar, Adyar)"
              className="w-full text-xs font-medium text-slate-800 bg-transparent border-none outline-hidden placeholder:text-slate-400"
            />
            {origin && (
              <button
                type="button"
                onClick={() => {
                  setOrigin('');
                  setOriginSuggestions(searchChennaiPlaces(''));
                  setIsSearchingOrigin(true);
                }}
                className="text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
                title="Clear origin"
              >
                ✕
              </button>
            )}
            {onUseCurrentLocation && (
              <button
                type="button"
                onClick={() => {
                  onUseCurrentLocation();
                  setIsSearchingOrigin(false);
                }}
                title="Fill current GPS location"
                className="text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 p-1 rounded-md transition-colors cursor-pointer shrink-0"
              >
                <Crosshair className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {isSearchingOrigin && originSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {onUseCurrentLocation && (
                <button
                  type="button"
                  onClick={() => {
                    onUseCurrentLocation();
                    setIsSearchingOrigin(false);
                  }}
                  className="w-full px-3 py-2 text-left bg-emerald-50/50 hover:bg-emerald-50 flex items-center gap-2 text-emerald-800 text-xs font-semibold cursor-pointer border-b border-emerald-100"
                >
                  <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Use Current GPS Location</span>
                </button>
              )}
              {originSuggestions.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => selectOriginPlace(place)}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-start gap-2.5 transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-slate-900">{place.name}</span>
                      {place.zone && (
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {place.zone}
                        </span>
                      )}
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {place.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{place.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Swap Origin & Destination button */}
        {onSwapLocations && (
          <div className="flex justify-end -my-1.5 pr-2 z-10 relative">
            <button
              type="button"
              onClick={onSwapLocations}
              title="Swap starting point and destination"
              className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-full border border-slate-200 transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>Swap</span>
            </button>
          </div>
        )}

        {/* To Input with Autocomplete */}
        <div className="relative">
          <label className="block text-[11px] font-medium text-slate-500 mb-1">
            To:
          </label>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-slate-200 bg-white focus-within:border-slate-800 focus-within:ring-1 focus-within:ring-slate-800 transition-all">
            <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <input
              type="text"
              value={destination}
              onChange={handleDestinationChange}
              onFocus={() => {
                setDestSuggestions(searchChennaiPlaces(destination));
                setIsSearchingDest(true);
              }}
              placeholder="Search destination across Greater Chennai"
              className="w-full text-xs font-medium text-slate-800 bg-transparent border-none outline-hidden placeholder:text-slate-400"
            />
            {destination && (
              <button
                type="button"
                onClick={() => {
                  setDestination('');
                  setDestSuggestions(searchChennaiPlaces(''));
                  setIsSearchingDest(true);
                }}
                className="text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
                title="Clear destination"
              >
                ✕
              </button>
            )}
          </div>

          {isSearchingDest && destSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {destSuggestions.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => selectDestPlace(place)}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-start gap-2.5 transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-slate-900">{place.name}</span>
                      {place.zone && (
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {place.zone}
                        </span>
                      )}
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-100">
                        {place.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{place.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!destination && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {POPULAR_DESTINATIONS.slice(0, 5).map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setDestination(chip)}
                  className="text-[11px] px-2 py-1 rounded bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  {chip.split('(')[0].trim()}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 pt-1 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            Rainfall scenario
          </label>
          <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
            {rainfallMm} mm / 6h
          </span>
        </div>

        <input
          type="range"
          min="25"
          max="350"
          step="25"
          value={rainfallMm}
          onChange={(e) => setRainfallMm(Number(e.target.value))}
          className="w-full accent-slate-900 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
        />

        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>50 mm (Light)</span>
          <span className="text-slate-600 font-medium">150 mm (Heavy)</span>
          <span>350 mm (Extreme)</span>
        </div>
      </div>

      <div className="space-y-2 pt-1 border-t border-slate-100">
        <label className="block text-xs font-semibold text-slate-700">
          Route preference
        </label>
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-slate-100 border border-slate-200">
          {(['fastest', 'balanced', 'safer'] as RoutePreference[]).map((pref) => {
            const isSelected = preference === pref;
            const label = pref === 'fastest' ? 'Fastest' : pref === 'balanced' ? 'Balanced' : 'Safer';
            return (
              <button
                key={pref}
                type="button"
                onClick={() => setPreference(pref)}
                className={`py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={onFindRoute}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-xs font-semibold tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Computing safe path...
            </span>
          ) : (
            <>
              <span>FIND ROUTE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {hasSearched && routes.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-slate-200 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Route Options
            </span>
            <span className="text-[11px] text-slate-400">
              {routes.length} paths computed
            </span>
          </div>

          <div className="space-y-2.5">
            {routes.map((route) => {
              const isSelected = selectedRouteId === route.id;
              return (
                <div
                  key={route.id}
                  onClick={() => onSelectRoute(route.id)}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50/90 shadow-xs ring-1 ring-slate-900'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        {route.name}
                      </h3>
                      {route.isRecommended && (
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.2 rounded">
                          recommended
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900 font-mono">
                        {route.durationMinutes} min
                      </div>
                    </div>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span>{route.exposurePercent}% predicted exposure</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {route.distanceKm} km
                    </span>
                  </div>

                  {route.tagline && (
                    <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1 pt-1.5 border-t border-slate-100">
                      {route.isRecommended ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-slate-700">
                            {route.tagline}
                          </span>
                        </>
                      ) : (
                        <span>{route.tagline}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {activeRoute && (
            <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span>
                  {activeRoute.name === 'Balanced'
                    ? '3 high-risk road segments avoided.'
                    : `${activeRoute.name} route active on map.`}
                </span>
              </div>
              <p className="text-[11px] text-emerald-800/90 leading-normal">
                Avoids low-lying dips in Velachery & T. Nagar subways via dry arterial flyovers.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlanRoutePanel;

