import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  RoadRiskSegment,
  RouteOptionData,
  EmergencyFacility,
  DrainageChannel,
  WaterBody,
  HistoricalFloodPoint,
  ElevationBenchmark
} from '../../types/navigation';
import {
  MOCK_DRAINAGE_CHANNELS,
  MOCK_WATER_BODIES,
  MOCK_HISTORICAL_FLOODS
} from '../../data/mockNavigationData';

interface SafeRouteMapProps {
  roadSegments: RoadRiskSegment[];
  activeRoute: RouteOptionData | null;
  allRoutes: RouteOptionData[];
  selectedSegment: RoadRiskSegment | null;
  onSelectRoadSegment: (segment: RoadRiskSegment) => void;
  emergencyFacilities?: EmergencyFacility[];
  activeTab: string;
  onNavigateToFacility?: (facility: EmergencyFacility) => void;
  userGpsCoords?: [number, number] | null;
  focusedFacilityCoords?: [number, number] | null;
  drainageChannels?: DrainageChannel[];
  waterBodies?: WaterBody[];
  historicalFloods?: HistoricalFloodPoint[];
  elevationBenchmarks?: ElevationBenchmark[];
  drainageGeoJson?: any;
  waterBodiesGeoJson?: any;
}

const CHENNAI_CENTER: [number, number] = [13.0450, 80.2200];

export const SafeRouteMap: React.FC<SafeRouteMapProps> = ({
  roadSegments,
  activeRoute,
  allRoutes,
  selectedSegment,
  onSelectRoadSegment,
  emergencyFacilities = [],
  activeTab,
  onNavigateToFacility,
  userGpsCoords,
  focusedFacilityCoords,
  drainageChannels = MOCK_DRAINAGE_CHANNELS,
  waterBodies = MOCK_WATER_BODIES,
  historicalFloods = MOCK_HISTORICAL_FLOODS,
  elevationBenchmarks = [],
  drainageGeoJson,
  waterBodiesGeoJson
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const roadsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const gpsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const drainageLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const waterBodiesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const elevationLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const historicalFloodsLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Map Style mode (Default to 'satellite' as requested)
  const [mapMode, setMapMode] = useState<'satellite' | 'street'>('satellite');

  // Tile layer references for dynamic switching
  const streetTileLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteTileLayerRef = useRef<L.TileLayer | null>(null);
  const labelsTileLayerRef = useRef<L.TileLayer | null>(null);

  // Layer toggles
  const [showDrainage, setShowDrainage] = useState(true);
  const [showWaterBodies, setShowWaterBodies] = useState(true);
  const [showElevation, setShowElevation] = useState(true);
  const [showHistoricalFloods, setShowHistoricalFloods] = useState(true);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: CHENNAI_CENTER,
      zoom: 12,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: false
    });

    const streetTile = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    });

    const satelliteTile = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 19
    });

    const labelsTile = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      opacity: 0.85
    });

    streetTileLayerRef.current = streetTile;
    satelliteTileLayerRef.current = satelliteTile;
    labelsTileLayerRef.current = labelsTile;

    // Default to Satellite + Hybrid Labels for high-resolution aerial view
    satelliteTile.addTo(map);
    labelsTile.addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const drainageGroup = L.layerGroup().addTo(map);
    const waterBodiesGroup = L.layerGroup().addTo(map);
    const elevationGroup = L.layerGroup().addTo(map);
    const historicalFloodsGroup = L.layerGroup().addTo(map);
    const roadsGroup = L.layerGroup().addTo(map);
    const routesGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);
    const gpsGroup = L.layerGroup().addTo(map);

    drainageLayerGroupRef.current = drainageGroup;
    waterBodiesLayerGroupRef.current = waterBodiesGroup;
    elevationLayerGroupRef.current = elevationGroup;
    historicalFloodsLayerGroupRef.current = historicalFloodsGroup;
    roadsLayerGroupRef.current = roadsGroup;
    routesLayerGroupRef.current = routesGroup;
    markersLayerGroupRef.current = markersGroup;
    gpsLayerGroupRef.current = gpsGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch between Street and Satellite base tile layers
  useEffect(() => {
    if (!mapInstanceRef.current || !streetTileLayerRef.current || !satelliteTileLayerRef.current) return;
    const map = mapInstanceRef.current;
    const street = streetTileLayerRef.current;
    const satellite = satelliteTileLayerRef.current;
    const labels = labelsTileLayerRef.current;

    if (mapMode === 'satellite') {
      if (map.hasLayer(street)) map.removeLayer(street);
      if (!map.hasLayer(satellite)) satellite.addTo(map);
      if (labels && !map.hasLayer(labels)) labels.addTo(map);
    } else {
      if (map.hasLayer(satellite)) map.removeLayer(satellite);
      if (labels && map.hasLayer(labels)) map.removeLayer(labels);
      if (!map.hasLayer(street)) street.addTo(map);
    }
  }, [mapMode]);

  useEffect(() => {
    if (!roadsLayerGroupRef.current || !mapInstanceRef.current) return;
    const group = roadsLayerGroupRef.current;
    group.clearLayers();

    roadSegments.forEach((segment) => {
      let color = '#10b981';
      if (segment.currentRisk >= 80) color = '#ef4444';
      else if (segment.currentRisk >= 60) color = '#f97316';
      else if (segment.currentRisk >= 35) color = '#eab308';

      const isSelected = selectedSegment?.id === segment.id;

      const polyline = L.polyline(segment.coordinates, {
        color,
        weight: isSelected ? 8 : 5,
        opacity: isSelected ? 1 : 0.85,
        lineCap: 'round',
        lineJoin: 'round'
      });

      polyline.on('click', () => {
        onSelectRoadSegment(segment);
      });

      polyline.bindTooltip(
        `<div style="font-family: inherit; font-size: 11px; padding: 2px;">
           <strong>${segment.code}</strong> — ${segment.currentRisk}% Risk<br/>
           <span style="color: #64748b;">${segment.name.split('(')[0]}</span>
         </div>`,
        { sticky: true, className: 'leaflet-clean-tooltip' }
      );

      group.addLayer(polyline);

      if (segment.currentRisk >= 75) {
        const midPoint = segment.coordinates[Math.floor(segment.coordinates.length / 2)];
        const badgeIcon = L.divIcon({
          className: 'custom-road-badge',
          html: `<div style="background-color: ${color}; color: white; font-weight: 700; font-size: 9px; font-family: monospace; padding: 1px 5px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.3); white-space: nowrap; border: 1px solid white;">${segment.code} • ${segment.currentRisk}%</div>`,
          iconSize: [64, 16],
          iconAnchor: [32, 8]
        });
        const badgeMarker = L.marker(midPoint, { icon: badgeIcon, interactive: true });
        badgeMarker.on('click', () => onSelectRoadSegment(segment));
        group.addLayer(badgeMarker);
      }
    });
  }, [roadSegments, selectedSegment, onSelectRoadSegment]);

  useEffect(() => {
    if (!routesLayerGroupRef.current || !mapInstanceRef.current) return;
    const group = routesLayerGroupRef.current;
    group.clearLayers();

    if (!activeRoute) return;

    allRoutes.forEach((route) => {
      if (route.id === activeRoute.id) return;
      const altLine = L.polyline(route.coordinates, {
        color: '#94a3b8',
        weight: 4,
        opacity: 0.6,
        dashArray: '6, 8',
        lineCap: 'round',
        lineJoin: 'round'
      });
      altLine.bindTooltip(`<strong>${route.name}</strong> • ${route.durationMinutes} min`, { sticky: true });
      group.addLayer(altLine);
    });

    const activeLine = L.polyline(activeRoute.coordinates, {
      color: activeRoute.type === 'balanced' ? '#059669' : activeRoute.type === 'safer' ? '#2563eb' : '#dc2626',
      weight: 6,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round'
    });

    group.addLayer(activeLine);

    const bounds = activeLine.getBounds();
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 14,
        animate: true
      });
    }

    const startCoord = activeRoute.coordinates[0];
    const startIcon = L.divIcon({
      className: 'start-pin-icon',
      html: `<div style="width: 14px; height: 14px; background: #10b981; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
    const startMarker = L.marker(startCoord, { icon: startIcon }).bindTooltip('<strong>Origin:</strong> Current Location', { offset: [0, -10] });
    group.addLayer(startMarker);

    const endCoord = activeRoute.coordinates[activeRoute.coordinates.length - 1];
    const endIcon = L.divIcon({
      className: 'end-pin-icon',
      html: `<div style="width: 14px; height: 14px; background: #0f172a; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
    const endMarker = L.marker(endCoord, { icon: endIcon }).bindTooltip('<strong>Destination</strong>', { offset: [0, -10] });
    group.addLayer(endMarker);
  }, [activeRoute, allRoutes]);

  useEffect(() => {
    if (!selectedSegment || !mapInstanceRef.current) return;
    const midPoint = selectedSegment.coordinates[Math.floor(selectedSegment.coordinates.length / 2)];
    mapInstanceRef.current.setView(midPoint, 14, { animate: true });
  }, [selectedSegment]);

  useEffect(() => {
    if (!markersLayerGroupRef.current || !mapInstanceRef.current) return;
    const group = markersLayerGroupRef.current;
    group.clearLayers();

    if (activeTab !== 'emergency') return;

    emergencyFacilities.forEach((facility) => {
      const isHospital = facility.category === 'hospital';
      const iconHtml = `
        <div style="background: white; border: 2px solid ${isHospital ? '#e11d48' : '#0f172a'}; color: ${isHospital ? '#e11d48' : '#0f172a'}; font-size: 11px; font-weight: bold; border-radius: 8px; padding: 3px 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.25); white-space: nowrap; display: flex; align-items: center; gap: 4px;">
          <span>${isHospital ? '🏥' : facility.category === 'fire_station' ? '🚒' : facility.category === 'police' ? '🚓' : '⛺'}</span>
          <span>${facility.name.split('(')[0].trim()}</span>
        </div>
      `;

      const facilityIcon = L.divIcon({
        className: 'emergency-marker',
        html: iconHtml,
        iconSize: [130, 26],
        iconAnchor: [65, 13]
      });

      const marker = L.marker(facility.coordinates, { icon: facilityIcon });
      marker.on('click', () => {
        if (onNavigateToFacility) onNavigateToFacility(facility);
      });
      marker.bindTooltip(`<strong>${facility.name}</strong><br/><span style="color: #64748b; font-size: 10px;">${facility.exposureNote}</span><br/><span style="color: #f97316; font-size: 10px; font-weight: 600;">Click to Navigate</span>`, { offset: [0, -14] });

      group.addLayer(marker);
    });
  }, [emergencyFacilities, activeTab, onNavigateToFacility]);

  // 1. Render Drainage Channels (Waterways, Canals & 634-drain GeoJSON network)
  useEffect(() => {
    if (!drainageLayerGroupRef.current || !mapInstanceRef.current) return;
    const group = drainageLayerGroupRef.current;
    group.clearLayers();

    if (!showDrainage) return;

    if (drainageGeoJson && drainageGeoJson.features && drainageGeoJson.features.length > 0) {
      const geoLayer = L.geoJSON(drainageGeoJson, {
        style: (feature) => {
          const type = feature?.properties?.waterway || feature?.properties?.type || '';
          const name = (feature?.properties?.name || '').toLowerCase();
          const isMajor = type === 'river' || /adyar|cooum|buckingham|nullah|canal|kosasthalaiyar/i.test(name);
          return {
            color: isMajor ? '#0284c7' : '#38bdf8',
            weight: isMajor ? 3.5 : 2,
            opacity: isMajor ? 0.9 : 0.75,
            dashArray: type === 'canal' ? '5, 5' : undefined,
            lineCap: 'round',
            lineJoin: 'round'
          };
        },
        onEachFeature: (feature, layer) => {
          const name = feature.properties?.name || feature.properties?.waterway || 'Chennai Stormwater Drain';
          const type = feature.properties?.waterway || 'drain';
          layer.bindTooltip(
            `<div style="font-family: inherit; font-size: 11px;">
               <span style="color: #0284c7; font-weight: 700;">💧 ${name}</span><br/>
               <span style="color: #64748b; text-transform: capitalize;">${type} Drainage Channel</span>
             </div>`,
            { sticky: true }
          );
        }
      });
      group.addLayer(geoLayer);
    } else {
      drainageChannels.forEach((channel) => {
        const isRiver = channel.waterwayType === 'river';
        const polyline = L.polyline(channel.coordinates, {
          color: isRiver ? '#0284c7' : '#0ea5e9',
          weight: isRiver ? 3.5 : 2.5,
          opacity: 0.8,
          dashArray: isRiver ? undefined : '5, 5',
          lineCap: 'round',
          lineJoin: 'round'
        });

        polyline.bindTooltip(
          `<div style="font-family: inherit; font-size: 11px;">
             <span style="color: #0284c7; font-weight: 700;">💧 ${channel.name}</span><br/>
             <span style="color: #64748b; text-transform: capitalize;">${channel.waterwayType} Network</span>
           </div>`,
          { sticky: true }
        );

        group.addLayer(polyline);
      });
    }
  }, [drainageChannels, drainageGeoJson, showDrainage]);

  // 2. Render Water Bodies (Lakes, Reservoirs & 1,213-feature GeoJSON)
  useEffect(() => {
    if (!waterBodiesLayerGroupRef.current || !mapInstanceRef.current) return;
    const group = waterBodiesLayerGroupRef.current;
    group.clearLayers();

    if (!showWaterBodies) return;

    if (waterBodiesGeoJson && waterBodiesGeoJson.features && waterBodiesGeoJson.features.length > 0) {
      const geoLayer = L.geoJSON(waterBodiesGeoJson, {
        style: (feature) => {
          const isLarge = feature?.properties?.area_ha && feature.properties.area_ha > 50;
          return {
            fillColor: '#38bdf8',
            fillOpacity: 0.4,
            color: '#0284c7',
            weight: isLarge ? 2 : 1,
            opacity: 0.85
          };
        },
        pointToLayer: (_feature, latlng) => {
          return L.circleMarker(latlng, {
            radius: 6,
            fillColor: '#38bdf8',
            color: '#0369a1',
            weight: 1.5,
            fillOpacity: 0.5
          });
        },
        onEachFeature: (feature, layer) => {
          const name = feature.properties?.name || feature.properties?.water || 'Chennai Water Body';
          const area = feature.properties?.area_ha ? `${Number(feature.properties.area_ha).toFixed(1)} ha` : 'Natural Retention Buffer';
          layer.bindTooltip(
            `<div style="font-family: inherit; font-size: 11px;">
               <span style="color: #0369a1; font-weight: 700;">🌊 ${name}</span><br/>
               <span style="color: #64748b;">${area}</span>
             </div>`,
            { sticky: true }
          );
        }
      });
      group.addLayer(geoLayer);
    } else {
      waterBodies.forEach((wb) => {
        const isReservoir = wb.waterType === 'reservoir';
        const circle = L.circleMarker(wb.coordinates, {
          radius: isReservoir ? 11 : 8,
          fillColor: '#38bdf8',
          color: '#0369a1',
          weight: 1.5,
          opacity: 0.9,
          fillOpacity: 0.45
        });

        circle.bindTooltip(
          `<div style="font-family: inherit; font-size: 11px;">
             <span style="color: #0369a1; font-weight: 700;">🌊 ${wb.name}</span><br/>
             <span style="color: #64748b;">${wb.category} • ${wb.areaHa ? `${wb.areaHa} ha` : 'Natural Buffer'}</span>
           </div>`,
          { sticky: true }
        );

        group.addLayer(circle);
      });
    }
  }, [waterBodies, waterBodiesGeoJson, showWaterBodies]);

  // 3. Render Elevation Benchmarks & Copernicus GLO-90 DEM Contours
  useEffect(() => {
    if (!elevationLayerGroupRef.current || !mapInstanceRef.current) return;
    const group = elevationLayerGroupRef.current;
    group.clearLayers();

    if (!showElevation || !elevationBenchmarks || elevationBenchmarks.length === 0) return;

    elevationBenchmarks.forEach((bm) => {
      const elev = bm.elevationM;
      let badgeBg = '#0284c7';
      let riskLabel = 'Mid Plain';

      if (elev < 6.0) {
        badgeBg = '#ef4444'; // Red for critical sinks
        riskLabel = 'Critical Sink';
      } else if (elev < 12.0) {
        badgeBg = '#f59e0b'; // Amber for lowlands
        riskLabel = 'Lowland Plain';
      } else if (elev >= 18.0) {
        badgeBg = '#059669'; // Green for high ground safe ridge
        riskLabel = 'High Safe Ridge';
      }

      const isCritical = elev < 6.0;
      const isHigh = elev >= 18.0;

      const iconHtml = `
        <div style="background-color: ${badgeBg}; color: white; border: 1.5px solid white; border-radius: 6px; padding: 1.5px 5px; font-size: 9.5px; font-weight: 700; font-family: monospace; box-shadow: 0 1px 4px rgba(0,0,0,0.35); display: flex; align-items: center; gap: 3px; white-space: nowrap; cursor: pointer;">
          <span>${isCritical ? '⚠️' : isHigh ? '🛡️' : '⛰️'}</span>
          <span>${elev.toFixed(1)}m</span>
        </div>
      `;

      const elevIcon = L.divIcon({
        className: 'elevation-benchmark-marker',
        html: iconHtml,
        iconSize: [54, 20],
        iconAnchor: [27, 10]
      });

      const marker = L.marker([bm.lat, bm.lon], { icon: elevIcon });
      marker.bindTooltip(
        `<div style="font-family: inherit; font-size: 11px; min-width: 150px;">
           <strong style="color: #0f172a; font-size: 12px;">${bm.name}</strong><br/>
           <span style="color: ${badgeBg}; font-weight: 700; font-size: 11px;">Elevation: ${elev.toFixed(1)}m MSL (${(elev * 3.28084).toFixed(1)} ft)</span><br/>
           <span style="color: #64748b; font-size: 10px;">Classification: ${bm.terrainClass}</span><br/>
           <span style="display: inline-block; margin-top: 2px; padding: 1px 5px; border-radius: 3px; background: ${badgeBg}; color: white; font-size: 9.5px; font-weight: 600;">
             ${riskLabel} (${bm.riskCategory.replace('_', ' ')})
           </span>
         </div>`,
        { offset: [0, -10] }
      );

      group.addLayer(marker);
    });
  }, [elevationBenchmarks, showElevation]);

  // 4. Render Historical Flood Inundation Hotspots
  useEffect(() => {
    if (!historicalFloodsLayerGroupRef.current || !mapInstanceRef.current) return;
    const group = historicalFloodsLayerGroupRef.current;
    group.clearLayers();

    if (!showHistoricalFloods) return;

    historicalFloods.forEach((hf) => {
      const warningIcon = L.divIcon({
        className: 'flood-hotspot-pin',
        html: `
          <div style="background: rgba(220, 38, 38, 0.95); color: white; border: 1.5px solid white; border-radius: 6px; padding: 1px 5px; font-size: 9px; font-weight: bold; box-shadow: 0 1px 4px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 2px;">
            <span>⚠️</span>
            <span>${hf.waterLevelM}m</span>
          </div>
        `,
        iconSize: [44, 18],
        iconAnchor: [22, 9]
      });

      const marker = L.marker(hf.coordinates, { icon: warningIcon });
      marker.bindTooltip(
        `<div style="font-family: inherit; font-size: 11px;">
           <strong style="color: #b91c1c;">${hf.eventName}</strong><br/>
           <span>${hf.locationName}</span><br/>
           <span style="color: #b91c1c; font-weight: 600;">Recorded Water Depth: ${hf.waterLevelM}m (${(hf.waterLevelM * 3.28).toFixed(1)} ft)</span><br/>
           <span style="color: #64748b; font-size: 10px;">Severity: ${hf.severityClass} • Rain: ${hf.rainfall24hMm} mm</span>
         </div>`,
        { offset: [0, -10] }
      );

      group.addLayer(marker);
    });
  }, [historicalFloods, showHistoricalFloods]);

  // Live User GPS marker & auto-fly
  useEffect(() => {
    if (!gpsLayerGroupRef.current || !mapInstanceRef.current) return;
    const group = gpsLayerGroupRef.current;
    group.clearLayers();

    if (!userGpsCoords) return;

    const pulseIcon = L.divIcon({
      className: 'gps-pulse-marker',
      html: `
        <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 26px; height: 26px; background: rgba(16, 185, 129, 0.3); border-radius: 50%; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 14px; height: 14px; background: #059669; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.35); position: relative; z-index: 2;"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const gpsMarker = L.marker(userGpsCoords, { icon: pulseIcon }).bindTooltip('<strong>Your Location</strong>', { offset: [0, -12] });
    group.addLayer(gpsMarker);

    mapInstanceRef.current.flyTo(userGpsCoords, 14, { duration: 1.2 });
  }, [userGpsCoords]);

  // Focus facility when category clicked
  useEffect(() => {
    if (!focusedFacilityCoords || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(focusedFacilityCoords, 14, { duration: 1.2 });
  }, [focusedFacilityCoords]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Right: Hydrology Layer Toggles & Multi-Factor Legend */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2 max-w-[calc(100vw-32px)]">
        {/* Style & Layer Toggles Row */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {/* Base Map Switcher: Satellite vs Street */}
          <div className="flex items-center bg-slate-900/90 p-0.5 rounded-lg border border-slate-700 shadow-md backdrop-blur-xs text-[11px]">
            <button
              type="button"
              onClick={() => setMapMode('satellite')}
              className={`px-2 py-1 rounded font-semibold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                mapMode === 'satellite'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="High-Resolution Satellite Aerial View"
            >
              <span>🛰️</span>
              <span>Satellite</span>
            </button>
            <button
              type="button"
              onClick={() => setMapMode('street')}
              className={`px-2 py-1 rounded font-semibold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                mapMode === 'street'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Standard Street Map"
            >
              <span>🗺️</span>
              <span>Street</span>
            </button>
          </div>

          {/* Layer Toggles */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-white/95 border border-slate-200/90 shadow-sm backdrop-blur-xs text-[11px] overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setShowDrainage(!showDrainage)}
              className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${
                showDrainage ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Toggle 634 Drainage Channels & Rivers (Adyar, Cooum, Buckingham)"
            >
              <span>💧</span>
              <span>Canals ({drainageGeoJson?.features?.length || 634})</span>
            </button>
            <button
              type="button"
              onClick={() => setShowWaterBodies(!showWaterBodies)}
              className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${
                showWaterBodies ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Toggle 1,213 Lakes, Reservoirs & Water Bodies"
            >
              <span>🌊</span>
              <span>Lakes ({waterBodiesGeoJson?.features?.length || '1.2k'})</span>
            </button>
            <button
              type="button"
              onClick={() => setShowElevation(!showElevation)}
              className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${
                showElevation ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Toggle 158 Elevation Benchmarks & DEM Contours (Copernicus GLO-90 DEM)"
            >
              <span>⛰️</span>
              <span>Elevation ({elevationBenchmarks.length || 158})</span>
            </button>
            <button
              type="button"
              onClick={() => setShowHistoricalFloods(!showHistoricalFloods)}
              className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${
                showHistoricalFloods ? 'bg-red-50 text-red-700 border border-red-200 shadow-2xs' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Toggle Historical Flood Inundation Hotspots (Michaung & 2015)"
            >
              <span>⚠️</span>
              <span>Floods</span>
            </button>
          </div>
        </div>

        {/* Multi-Factor Legends: Road Risk & MSL Elevation Tiers */}
        <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/95 border border-slate-200/90 shadow-sm backdrop-blur-xs text-[10.5px] text-slate-600 select-none">
          <div className="flex items-center gap-1.5 border-r border-slate-200 pr-3">
            <span className="font-semibold text-slate-900">Road:</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Low
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Mod
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" /> High
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">MSL Elevation:</span>
            <span className="flex items-center gap-1" title="Critical low basin (<6m MSL) - highest flood vulnerability">
              <span className="w-2 h-2 rounded-xs bg-red-500" /> &lt;6m Sink
            </span>
            <span className="flex items-center gap-1" title="Lowland (6-12m MSL)">
              <span className="w-2 h-2 rounded-xs bg-amber-500" /> 6-12m Low
            </span>
            <span className="flex items-center gap-1" title="Mid plain (12-18m MSL)">
              <span className="w-2 h-2 rounded-xs bg-sky-600" /> 12-18m Plain
            </span>
            <span className="flex items-center gap-1" title="Elevated ridge (>18m MSL) - minimal flood vulnerability">
              <span className="w-2 h-2 rounded-xs bg-emerald-600" /> &gt;18m Ridge
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafeRouteMap;


