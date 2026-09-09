import React, { useState, useMemo, useEffect } from 'react';
import {
  INITIAL_FLOOD_ZONES,
  WATER_BODIES,
  CRITICAL_FACILITIES,
  SUBMERGED_SUBWAYS,
  RESERVOIR_DATA,
  INITIAL_INCIDENTS
} from './data/chennaiData';
import {
  FloodZone,
  CriticalFacility,
  SubmergedRoadOrSubway,
  IncidentReport
} from './types';
import {
  EngineParams,
  TransportMode,
  ChennaiLocationPreset,
  DynamicRoadSegment,
  CHENNAI_LOCATION_PRESETS,
  CHENNAI_ROAD_SEGMENTS,
  rankRoadDisruptions,
  solveDynamicRoutes
} from './utils/floodEngine';
import { MapComponent } from './components/MapComponent';
import { ProjectControlPanel } from './components/ProjectControlPanel';
import { GoogleDriveNavigationOverlay } from './components/GoogleDriveNavigationOverlay';
import { GoogleMapsAIAssistantModal } from './components/GoogleMapsAIAssistantModal';
import { HydrologySimulationModal } from './components/HydrologySimulationModal';
import { EmergencyDirectoryModal } from './components/EmergencyDirectoryModal';
import { IncidentReporterModal } from './components/IncidentReporterModal';

export function App() {
  // Navigation & Origin/Destination State
  const [origin, setOrigin] = useState<ChennaiLocationPreset>(CHENNAI_LOCATION_PRESETS[0]); // Velachery
  const [destination, setDestination] = useState<ChennaiLocationPreset>(CHENNAI_LOCATION_PRESETS[6]); // Apollo Hospitals
  const [selectedMode, setSelectedMode] = useState<TransportMode>('drive');

  // Driving Navigation Mode (Google Maps style drive simulation)
  const [isDriving, setIsDriving] = useState(false);
  const [navigationStepIndex, setNavigationStepIndex] = useState(0);

  // Background Hydrology Simulation Parameters
  const [engineParams, setEngineParams] = useState<EngineParams>({
    rainfallRateMmHr: 110,
    cumulative24hMm: 210,
    stormCenter: [12.9800, 80.2200],
    stormRadiusKm: 14,
    chembarambakkamDischargeCusecs: 12500,
    highTideActive: true
  });

  // Modal Dialog States
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showHydrology, setShowHydrology] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showIncident, setShowIncident] = useState(false);

  // Dynamic Incidents
  const [incidents, setIncidents] = useState<IncidentReport[]>(INITIAL_INCIDENTS);

  // Panel collapse
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [focusedRoad, setFocusedRoad] = useState<DynamicRoadSegment | null>(null);

  // Inspector Selections
  const [selectedZone, setSelectedZone] = useState<FloodZone | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<CriticalFacility | null>(null);
  const [selectedSubway, setSelectedSubway] = useState<SubmergedRoadOrSubway | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);

  // Layer Toggles
  const [showInundationPolygons, setShowInundationPolygons] = useState(true);
  const [showWaterways, setShowWaterways] = useState(true);
  const [showFacilities, setShowFacilities] = useState(false);
  const [showSubways, setShowSubways] = useState(false);
  const [showIncidents, setShowIncidents] = useState(false);
  const [showRoadRiskSegments, setShowRoadRiskSegments] = useState(false);

  // Setup global interactive map-click listeners for picking start/end pins
  useEffect(() => {
    (window as any).__setOriginFromMap = (coords: [number, number]) => {
      setOrigin({
        id: `map-${Date.now()}`,
        name: `Map Origin (${coords[0].toFixed(3)}, ${coords[1].toFixed(3)})`,
        shortName: 'Map Pin',
        area: 'Chennai Pin',
        coords: coords,
        elevationMsl: 6.5,
        type: 'hub'
      });
      setSelectedRouteId(null);
    };
    (window as any).__setDestFromMap = (coords: [number, number]) => {
      setDestination({
        id: `map-${Date.now()}`,
        name: `Map Destination (${coords[0].toFixed(3)}, ${coords[1].toFixed(3)})`,
        shortName: 'Map Pin',
        area: 'Chennai Pin',
        coords: coords,
        elevationMsl: 7.2,
        type: 'hub'
      });
      setSelectedRouteId(null);
    };
    return () => {
      delete (window as any).__setOriginFromMap;
      delete (window as any).__setDestFromMap;
    };
  }, []);

  // 1. Dynamic Physics-Based Evaluation of Road Segments
  const rankedRoads = useMemo(() => {
    return rankRoadDisruptions(CHENNAI_ROAD_SEGMENTS, engineParams);
  }, [engineParams]);

  // 2. Dynamic Route Solver (Computes alternatives & recommends SAFEST ROUTE)
  const dynamicRoutes = useMemo(() => {
    return solveDynamicRoutes(origin, destination, engineParams, selectedMode);
  }, [origin, destination, engineParams, selectedMode]);

  // Active selected route (defaults to safest route auto-picked!)
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const activeRoute = useMemo(() => {
    if (selectedRouteId) {
      const found = dynamicRoutes.find((r) => r.id === selectedRouteId);
      if (found) return found;
    }
    // Auto pick best/safest route!
    const safest = dynamicRoutes.find((r) => r.isSafest);
    return safest || dynamicRoutes[0] || null;
  }, [dynamicRoutes, selectedRouteId]);

  // Dynamic Inundation Zones
  const simulatedZones = useMemo(() => {
    const rainfallFactor = engineParams.rainfallRateMmHr / 100;
    const dischargeFactor = engineParams.chembarambakkamDischargeCusecs / 9500;

    return INITIAL_FLOOD_ZONES.map((zone) => {
      let multiplier = rainfallFactor;
      if (zone.id.includes('saidapet') || zone.id.includes('mudichur')) {
        multiplier = 0.4 * rainfallFactor + 0.6 * dischargeFactor;
      }
      const depth = Math.round(zone.waterDepthMeters * multiplier * 100) / 100;
      let risk: FloodZone['riskLevel'] = 'low';
      if (depth >= 1.0) risk = 'critical';
      else if (depth >= 0.6) risk = 'high';
      else if (depth >= 0.3) risk = 'moderate';

      return {
        ...zone,
        waterDepthMeters: depth,
        riskLevel: risk,
        accessStatus: (depth > 0.8 ? 'blocked' : depth > 0.4 ? 'restricted' : 'open') as FloodZone['accessStatus']
      };
    });
  }, [engineParams]);

  // Dynamic Water Bodies
  const simulatedWaterBodies = useMemo(() => {
    return WATER_BODIES.map((wb) => {
      if (wb.id === 'water-adyar') {
        const discharge = engineParams.chembarambakkamDischargeCusecs + engineParams.rainfallRateMmHr * 40;
        const level = Math.min(8.0, 3.8 + discharge / 4500);
        return {
          ...wb,
          dischargeCusecs: Math.round(discharge),
          currentLevelMeters: Math.round(level * 10) / 10,
          status: discharge > 16000 ? ('danger_overflow' as const) : ('rising' as const)
        };
      }
      return wb;
    });
  }, [engineParams]);

  // Swap Locations Handler
  const handleSwapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    setSelectedRouteId(null);
  };

  const handleFocusRoad = (road: DynamicRoadSegment) => {
    setFocusedRoad(road);
    const matchingZone = simulatedZones.find((z) =>
      Math.abs(z.center[0] - road.coordinates[0][0]) < 0.02
    );
    if (matchingZone) {
      setSelectedZone(matchingZone);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none flex flex-col">
      {/* Full-screen Leaflet Map without any top border or top header banner */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <MapComponent
          zones={simulatedZones}
          waterBodies={simulatedWaterBodies}
          facilities={CRITICAL_FACILITIES}
          subways={SUBMERGED_SUBWAYS}
          incidents={incidents}
          reservoirs={RESERVOIR_DATA}
          selectedRoute={null}
          dynamicRoute={activeRoute}
          routes={dynamicRoutes}
          onSelectRouteId={(id) => setSelectedRouteId(id)}
          originName={origin.shortName || origin.name}
          destinationName={destination.shortName || destination.name}
          originCoords={origin.coords}
          destinationCoords={destination.coords}
          dynamicRoads={rankedRoads}
          selectedZone={selectedZone}
          onSelectZone={(z) => setSelectedZone(z)}
          onSelectFacility={(f) => setSelectedFacility(f)}
          onSelectSubway={(s) => setSelectedSubway(s)}
          onSelectIncident={(i) => setSelectedIncident(i)}
          onSelectRoadSegment={handleFocusRoad}
          showInundationPolygons={showInundationPolygons}
          showWaterways={showWaterways}
          showFacilities={showFacilities}
          showSubways={showSubways}
          showIncidents={showIncidents}
          showRoadRiskSegments={showRoadRiskSegments}
          onToggleInundation={setShowInundationPolygons}
          onToggleWaterways={setShowWaterways}
          onToggleFacilities={setShowFacilities}
          onToggleSubways={setShowSubways}
          onToggleIncidents={setShowIncidents}
          onToggleRoadRiskSegments={setShowRoadRiskSegments}
          rainfallRate={engineParams.rainfallRateMmHr}
          stormCenter={engineParams.stormCenter}
          stormRadiusKm={engineParams.stormRadiusKm}
          focusedRoad={focusedRoad}
          isDriving={isDriving}
          navigationStepIndex={navigationStepIndex}
        />

        {/* Clean Google Maps Style Search & Safe Routes Panel (when not in active drive mode) */}
        {!isDriving && (
          <ProjectControlPanel
            origin={origin}
            destination={destination}
            onSelectOrigin={(loc) => {
              setOrigin(loc);
              setSelectedRouteId(null);
            }}
            onSelectDestination={(loc) => {
              setDestination(loc);
              setSelectedRouteId(null);
            }}
            onSwapLocations={handleSwapLocations}
            selectedMode={selectedMode}
            onChangeMode={setSelectedMode}
            routes={dynamicRoutes}
            selectedRoute={activeRoute}
            onSelectRoute={(r) => setSelectedRouteId(r.id)}
            onStartDrive={() => {
              setIsDriving(true);
              setNavigationStepIndex(0);
            }}
            rankedRoads={rankedRoads}
            onFocusRoadOnMap={handleFocusRoad}
            isCollapsed={isPanelCollapsed}
            onToggleCollapse={() => setIsPanelCollapsed(!isPanelCollapsed)}
            onOpenAIAssistant={() => setShowAIAssistant(true)}
            onOpenHydrology={() => setShowHydrology(true)}
            onOpenEmergency={() => setShowEmergency(true)}
            onOpenIncident={() => setShowIncident(true)}
          />
        )}

        {/* Live Driving Navigation Mode HUD Overlay (Active when Start Drive is pressed) */}
        {isDriving && activeRoute && (
          <GoogleDriveNavigationOverlay
            route={activeRoute}
            rainfallRateMmHr={engineParams.rainfallRateMmHr}
            alertThresholdMmHr={75}
            onStepChange={(stepIdx) => setNavigationStepIndex(stepIdx)}
            onExitNavigation={() => {
              setIsDriving(false);
              setNavigationStepIndex(0);
            }}
          />
        )}

        {/* Tactical Chennai Flood AI Assistant Modal */}
        <GoogleMapsAIAssistantModal
          isOpen={showAIAssistant}
          onClose={() => setShowAIAssistant(false)}
          userCoords={origin.coords}
          onSelectDestinationName={(destName) => {
            const match = CHENNAI_LOCATION_PRESETS.find(
              (p) =>
                p.name.toLowerCase().includes(destName.toLowerCase()) ||
                p.shortName.toLowerCase().includes(destName.toLowerCase())
            );
            if (match) {
              setDestination(match);
              setSelectedRouteId(null);
            }
          }}
        />

        {/* Hydrological Rainfall & Lake Surge Simulator Modal */}
        <HydrologySimulationModal
          isOpen={showHydrology}
          onClose={() => setShowHydrology(false)}
          params={engineParams}
          onUpdateParams={setEngineParams}
          onReset={() => {
            setEngineParams({
              rainfallRateMmHr: 110,
              cumulative24hMm: 210,
              stormCenter: [12.9800, 80.2200],
              stormRadiusKm: 14,
              chembarambakkamDischargeCusecs: 12500,
              highTideActive: true
            });
          }}
          criticalRoadsCount={rankedRoads.filter((r) => r.expectedDepthCm >= 30).length}
        />

        {/* Chennai Emergency Helplines & Disaster Directory Modal */}
        <EmergencyDirectoryModal
          isOpen={showEmergency}
          onClose={() => setShowEmergency(false)}
        />

        {/* Citizen Real-Time Field Flood Incident / SOS Reporter Modal */}
        <IncidentReporterModal
          isOpen={showIncident}
          onClose={() => setShowIncident(false)}
          onSubmitIncident={(newInc) => {
            setIncidents((prev) => [newInc, ...prev]);
            setShowIncident(false);
          }}
        />
      </main>
    </div>
  );
}

export default App;
