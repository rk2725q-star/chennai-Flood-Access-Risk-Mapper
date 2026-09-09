import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RoadRiskSegment, RouteOptionData, EmergencyFacility } from '../../types/navigation';

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
  focusedFacilityCoords
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const roadsLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const gpsLayerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: CHENNAI_CENTER,
      zoom: 12,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: false
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const roadsGroup = L.layerGroup().addTo(map);
    const routesGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);
    const gpsGroup = L.layerGroup().addTo(map);

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

    const gpsMarker = L.marker(userGpsCoords, { icon: pulseIcon }).bindTooltip('<strong>Your Location (GPS Locked)</strong>', { offset: [0, -12] });
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

      <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-lg bg-white/95 border border-slate-200/90 shadow-sm backdrop-blur-xs text-[11px] text-slate-600 select-none">
        <span className="font-semibold text-slate-900">Road Risk:</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Low
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> Mod
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-500" /> High
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" /> Very High
        </span>
      </div>
    </div>
  );
};

export default SafeRouteMap;

