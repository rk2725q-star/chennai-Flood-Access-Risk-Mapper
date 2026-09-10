import React, { useState, useMemo, useEffect } from 'react';
import {
  ChennaiSafeRouteHeader,
  PlanRoutePanel,
  RoadRiskDrawer,
  EmergencyAccessView,
  RiskRoadsView,
  FloodMapView,
  HistoryView,
  NavigationMenuBar,
  SafeRouteMap
} from './components/navigation';
import {
  ActiveNavTab,
  RoutePreference,
  RoadRiskSegment,
  RouteOptionData,
  EmergencyFacility,
  PlaceSuggestion,
  DrainageChannel,
  WaterBody,
  HistoricalFloodPoint,
  ElevationBenchmark
} from './types/navigation';
import {
  calculateDynamicRoadRisks,
  fetchRouteRecommendations,
  fetchHydrologyLayers,
  fetchElevationBenchmarks,
  fetchFullDrainageGeoJson,
  fetchFullWaterBodiesGeoJson
} from './services/routeService';
import {
  MOCK_EMERGENCY_FACILITIES,
  MOCK_DRAINAGE_CHANNELS,
  MOCK_WATER_BODIES,
  MOCK_HISTORICAL_FLOODS
} from './data/mockNavigationData';
import { ChevronUp } from 'lucide-react';

export function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('route');

  // Hydrology Background Data Layers
  const [drainageChannels, setDrainageChannels] = useState<DrainageChannel[]>(MOCK_DRAINAGE_CHANNELS);
  const [waterBodies, setWaterBodies] = useState<WaterBody[]>(MOCK_WATER_BODIES);
  const [historicalFloods, setHistoricalFloods] = useState<HistoricalFloodPoint[]>(MOCK_HISTORICAL_FLOODS);
  const [elevationBenchmarks, setElevationBenchmarks] = useState<ElevationBenchmark[]>([]);
  const [drainageGeoJson, setDrainageGeoJson] = useState<any | null>(null);
  const [waterBodiesGeoJson, setWaterBodiesGeoJson] = useState<any | null>(null);

  // Route Planning State & Coordinates
  const [origin, setOrigin] = useState('Current location (T. Nagar)');
  const [originCoords, setOriginCoords] = useState<[number, number]>([13.0418, 80.2341]);
  const [destination, setDestination] = useState('Phoenix Marketcity Velachery');
  const [destinationCoords, setDestinationCoords] = useState<[number, number]>([12.9912, 80.2170]);
  const [rainfallMm, setRainfallMm] = useState(150); // Default 150 mm / 6h
  const [preference, setPreference] = useState<RoutePreference>('balanced');
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [hasSearched, setHasSearched] = useState(true);

  // GPS Location state (optional)
  const [userGpsCoords, setUserGpsCoords] = useState<[number, number] | null>(null);

  // Emergency Focus state
  const [focusedFacilityCoords, setFocusedFacilityCoords] = useState<[number, number] | null>(null);

  // Computed Routes
  const [routes, setRoutes] = useState<RouteOptionData[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>('route-balanced');

  // Selected Road Risk Segment for side drawer inspector
  const [selectedRoadSegment, setSelectedRoadSegment] = useState<RoadRiskSegment | null>(null);

  // Mobile Bottom Sheet State
  const [isMobileSheetExpanded, setIsMobileSheetExpanded] = useState(false);

  // Dynamically compute road risks when rainfall scenario changes
  const dynamicRoadSegments = useMemo(() => {
    return calculateDynamicRoadRisks(rainfallMm);
  }, [rainfallMm]);

  // Unified route calculator supporting immediate overrides (no React state lag)
  const handleFindRouteWithParams = async (overrides?: {
    newOrigin?: string;
    newDestination?: string;
    newRainfallMm?: number;
    newPreference?: RoutePreference;
    newOriginCoords?: [number, number];
    newDestinationCoords?: [number, number];
  }) => {
    setIsLoadingRoutes(true);
    const currentOrig = overrides?.newOrigin ?? origin;
    const currentDest = overrides?.newDestination ?? destination;
    const currentRain = overrides?.newRainfallMm ?? rainfallMm;
    const currentPref = overrides?.newPreference ?? preference;
    const currentOrigCoords = overrides?.newOriginCoords ?? originCoords;
    const currentDestCoords = overrides?.newDestinationCoords ?? destinationCoords;

    try {
      const result = await fetchRouteRecommendations({
        origin: currentOrig,
        destination: currentDest,
        rainfallMm: currentRain,
        preference: currentPref,
        originCoords: currentOrigCoords,
        destinationCoords: currentDestCoords
      });
      setRoutes(result.routes);
      setHasSearched(true);
      const match = result.routes.find(r => r.type === currentPref) || result.routes[1] || result.routes[0];
      if (match) setSelectedRouteId(match.id);
    } finally {
      setIsLoadingRoutes(false);
    }
  };

  const handleFindRoute = () => handleFindRouteWithParams();

  // Run on mount once to pre-load default routes and fetch background hydrology layers
  useEffect(() => {
    handleFindRoute();
    fetchHydrologyLayers().then((layers) => {
      if (layers.drainageChannels?.length) setDrainageChannels(layers.drainageChannels);
      if (layers.waterBodies?.length) setWaterBodies(layers.waterBodies);
      if (layers.historicalFloods?.length) setHistoricalFloods(layers.historicalFloods);
    });
    fetchElevationBenchmarks().then((benchmarks) => {
      if (benchmarks && benchmarks.length > 0) {
        setElevationBenchmarks(benchmarks);
      }
    });
    fetchFullDrainageGeoJson().then((geo) => {
      if (geo) setDrainageGeoJson(geo);
    });
    fetchFullWaterBodiesGeoJson().then((geo) => {
      if (geo) setWaterBodiesGeoJson(geo);
    });
  }, []);

  // When rainfall slider moves, automatically refresh routes
  useEffect(() => {
    if (hasSearched) {
      handleFindRouteWithParams({ newRainfallMm: rainfallMm });
    }
  }, [rainfallMm]);

  // Current active route object
  const activeRoute = useMemo(() => {
    return routes.find(r => r.id === selectedRouteId) || routes[1] || routes[0] || null;
  }, [routes, selectedRouteId]);

  // Quick action: use current GPS location if desired
  const handleUseCurrentLocation = () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const isChennai = lat >= 12.6 && lat <= 13.5 && lng >= 79.8 && lng <= 80.5;
          const coords: [number, number] = isChennai ? [lat, lng] : [13.0418, 80.2341];
          const label = isChennai
            ? `Current location (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`
            : `Current location (T. Nagar)`;

          setOrigin(label);
          setOriginCoords(coords);
          setUserGpsCoords(coords);

          handleFindRouteWithParams({
            newOrigin: label,
            newOriginCoords: coords
          });
        },
        (err) => {
          console.warn('Geolocation fallback:', err.message);
          const fallbackCoords: [number, number] = [13.0418, 80.2341];
          const fallbackLabel = 'Current location (T. Nagar)';
          setOrigin(fallbackLabel);
          setOriginCoords(fallbackCoords);
          setUserGpsCoords(fallbackCoords);

          handleFindRouteWithParams({
            newOrigin: fallbackLabel,
            newOriginCoords: fallbackCoords
          });
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      const fallbackCoords: [number, number] = [13.0418, 80.2341];
      const fallbackLabel = 'Current location (T. Nagar)';
      setOrigin(fallbackLabel);
      setOriginCoords(fallbackCoords);
      setUserGpsCoords(fallbackCoords);

      handleFindRouteWithParams({
        newOrigin: fallbackLabel,
        newOriginCoords: fallbackCoords
      });
    }
  };

  // Select place for origin from autocomplete
  const handleSelectOriginPlace = (place: PlaceSuggestion) => {
    setOrigin(place.name);
    setOriginCoords(place.coordinates);
    handleFindRouteWithParams({
      newOrigin: place.name,
      newOriginCoords: place.coordinates
    });
  };

  // Select place for destination from autocomplete
  const handleSelectDestinationPlace = (place: PlaceSuggestion) => {
    setDestination(place.name);
    setDestinationCoords(place.coordinates);
    handleFindRouteWithParams({
      newDestination: place.name,
      newDestinationCoords: place.coordinates
    });
  };

  // Swap starting location and destination anytime
  const handleSwapLocations = () => {
    const prevOrigin = origin;
    const prevOriginCoords = originCoords;
    const prevDest = destination;
    const prevDestCoords = destinationCoords;

    setOrigin(prevDest);
    setOriginCoords(prevDestCoords);
    setDestination(prevOrigin);
    setDestinationCoords(prevOriginCoords);

    handleFindRouteWithParams({
      newOrigin: prevDest,
      newOriginCoords: prevDestCoords,
      newDestination: prevOrigin,
      newDestinationCoords: prevOriginCoords
    });
  };

  // Handle clicking "View on map" from Risk Roads page
  const handleSelectSegmentFromList = (segment: RoadRiskSegment) => {
    const current = dynamicRoadSegments.find(s => s.id === segment.id) || segment;
    setSelectedRoadSegment(current);
    setIsMobileSheetExpanded(false);
  };

  // Handle one-tap emergency navigation
  const handleNavigateToEmergency = (facility: EmergencyFacility) => {
    setDestination(facility.name);
    setDestinationCoords(facility.coordinates);
    setActiveTab('route');
    setPreference('safer');
    setIsMobileSheetExpanded(false);
    setFocusedFacilityCoords(facility.coordinates);

    handleFindRouteWithParams({
      newDestination: facility.name,
      newDestinationCoords: facility.coordinates,
      newPreference: 'safer'
    });
  };

  // Re-run route from history
  const handleRerunHistory = (orig: string, dest: string) => {
    setOrigin(orig);
    setDestination(dest);
    setActiveTab('route');
    handleFindRouteWithParams({
      newOrigin: orig,
      newDestination: dest
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white text-slate-800 antialiased font-sans">
      {/* Top Header with thin saffron line and bespoke brand */}
      <ChennaiSafeRouteHeader rainfallMm={rainfallMm} />

      {/* Main Content Area: Map + Left Panel */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Desktop Left Slim Panel */}
        <aside className="hidden md:flex flex-col w-96 lg:w-104 border-r border-slate-200 bg-white z-20 shadow-xs h-full shrink-0 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            {activeTab === 'route' && (
              <PlanRoutePanel
                origin={origin}
                setOrigin={setOrigin}
                destination={destination}
                setDestination={setDestination}
                rainfallMm={rainfallMm}
                setRainfallMm={setRainfallMm}
                preference={preference}
                setPreference={setPreference}
                routes={routes}
                selectedRouteId={selectedRouteId}
                onSelectRoute={setSelectedRouteId}
                onFindRoute={handleFindRoute}
                isLoading={isLoadingRoutes}
                hasSearched={hasSearched}
                onSelectOriginPlace={handleSelectOriginPlace}
                onSelectDestinationPlace={handleSelectDestinationPlace}
                onSwapLocations={handleSwapLocations}
                onUseCurrentLocation={handleUseCurrentLocation}
              />
            )}

            {activeTab === 'risk_roads' && (
              <RiskRoadsView
                roadSegments={dynamicRoadSegments}
                onSelectSegment={handleSelectSegmentFromList}
              />
            )}

            {activeTab === 'emergency' && (
              <EmergencyAccessView
                onNavigateToFacility={handleNavigateToEmergency}
                onSelectFacility={(fac) => setFocusedFacilityCoords(fac.coordinates)}
              />
            )}

            {activeTab === 'flood_map' && (
              <FloodMapView rainfallMm={rainfallMm} />
            )}

            {activeTab === 'history' && (
              <HistoryView onRerunRoute={handleRerunHistory} />
            )}
          </div>

          {/* Desktop Tab Switcher at bottom of left panel */}
          <div className="border-t border-slate-200 bg-white p-0.5 w-full shrink-0">
            <NavigationMenuBar
              activeTab={activeTab}
              onTabChange={(tab: ActiveNavTab) => {
                setActiveTab(tab);
                if (tab !== 'risk_roads' && tab !== 'route') {
                  setSelectedRoadSegment(null);
                }
              }}
              riskRoadCount={dynamicRoadSegments.filter(r => r.currentRisk >= 60).length}
            />
          </div>
        </aside>

        {/* Map View fills the entire remaining canvas */}
        <main className="flex-1 relative h-full w-full bg-slate-100 overflow-hidden">
          <SafeRouteMap
            roadSegments={dynamicRoadSegments}
            activeRoute={activeRoute}
            allRoutes={routes}
            selectedSegment={selectedRoadSegment}
            onSelectRoadSegment={(seg: RoadRiskSegment) => setSelectedRoadSegment(seg)}
            emergencyFacilities={MOCK_EMERGENCY_FACILITIES}
            activeTab={activeTab}
            onNavigateToFacility={handleNavigateToEmergency}
            userGpsCoords={userGpsCoords}
            focusedFacilityCoords={focusedFacilityCoords}
            drainageChannels={drainageChannels}
            waterBodies={waterBodies}
            historicalFloods={historicalFloods}
            elevationBenchmarks={elevationBenchmarks}
            drainageGeoJson={drainageGeoJson}
            waterBodiesGeoJson={waterBodiesGeoJson}
          />

          {/* Road Risk Drawer (Slides in from the right when tapping a red road segment) */}
          <RoadRiskDrawer
            segment={selectedRoadSegment}
            onClose={() => setSelectedRoadSegment(null)}
            onAvoidSegment={() => {
              setPreference('safer');
              handleFindRoute();
            }}
          />

          {/* Mobile Collapsible Bottom Sheet */}
          <div
            className={`md:hidden absolute left-0 right-0 bottom-14 z-30 bg-white border-t border-slate-200 rounded-t-2xl shadow-2xl transition-all duration-300 flex flex-col ${
              isMobileSheetExpanded ? 'h-[75vh]' : 'h-36'
            }`}
          >
            {/* Sheet Handle */}
            <div
              onClick={() => setIsMobileSheetExpanded(!isMobileSheetExpanded)}
              className="py-2.5 flex items-center justify-center cursor-pointer select-none"
            >
              <div className="w-10 h-1 bg-slate-300 rounded-full" />
            </div>

            {/* Content preview when collapsed vs full when expanded */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {activeTab === 'route' ? (
                isMobileSheetExpanded ? (
                  <PlanRoutePanel
                    origin={origin}
                    setOrigin={setOrigin}
                    destination={destination}
                    setDestination={setDestination}
                    rainfallMm={rainfallMm}
                    setRainfallMm={setRainfallMm}
                    preference={preference}
                    setPreference={setPreference}
                    routes={routes}
                    selectedRouteId={selectedRouteId}
                    onSelectRoute={setSelectedRouteId}
                    onFindRoute={handleFindRoute}
                    isLoading={isLoadingRoutes}
                    hasSearched={hasSearched}
                    onSelectOriginPlace={handleSelectOriginPlace}
                    onSelectDestinationPlace={handleSelectDestinationPlace}
                    onSwapLocations={handleSwapLocations}
                    onUseCurrentLocation={handleUseCurrentLocation}
                  />
                ) : (
                  <div
                    onClick={() => setIsMobileSheetExpanded(true)}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {activeRoute ? `${activeRoute.name} Route: ${activeRoute.durationMinutes} min` : 'Plan Chennai Safe Route'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {activeRoute?.tagline || 'Tap to configure route and rainfall scenario'}
                      </div>
                    </div>
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  </div>
                )
              ) : activeTab === 'risk_roads' ? (
                <RiskRoadsView
                  roadSegments={dynamicRoadSegments}
                  onSelectSegment={handleSelectSegmentFromList}
                />
              ) : activeTab === 'emergency' ? (
                <EmergencyAccessView
                  onNavigateToFacility={handleNavigateToEmergency}
                  onSelectFacility={(fac) => setFocusedFacilityCoords(fac.coordinates)}
                />
              ) : activeTab === 'flood_map' ? (
                <FloodMapView rainfallMm={rainfallMm} />
              ) : (
                <HistoryView onRerunRoute={handleRerunHistory} />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Menu Bar */}
      <div className="md:hidden z-40 bg-white border-t border-slate-200 shadow-xl">
        <NavigationMenuBar
          activeTab={activeTab}
          onTabChange={(tab: ActiveNavTab) => {
            setActiveTab(tab);
            setIsMobileSheetExpanded(true);
          }}
          riskRoadCount={dynamicRoadSegments.filter(r => r.currentRisk >= 60).length}
        />
      </div>
    </div>
  );
}

export default App;
