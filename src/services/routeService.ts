import { RoadRiskSegment, RouteOptionData, RoutePreference, EmergencyFacility, EmergencyCategory, PlaceSuggestion } from '../types/navigation';
import { MOCK_ROAD_SEGMENTS, MOCK_ROUTES, MOCK_EMERGENCY_FACILITIES, MOCK_PLACE_SUGGESTIONS } from '../data/mockNavigationData';

/**
 * Recalculate dynamic road risk based on the 6-hour rainfall intensity (in mm).
 * Base benchmark is 150 mm/6h.
 */
export function calculateDynamicRoadRisks(rainfallMm: number): RoadRiskSegment[] {
  const ratio = rainfallMm / 150.0;

  return MOCK_ROAD_SEGMENTS.map(segment => {
    // Dynamic risk adjustment formula reflecting soil saturation and drainage gradient
    let adjustedRisk = Math.round(segment.baseRisk * Math.pow(ratio, 0.45));
    if (rainfallMm <= 50) {
      adjustedRisk = Math.max(10, Math.round(segment.baseRisk * 0.4));
    }
    adjustedRisk = Math.min(99, Math.max(8, adjustedRisk));

    let riskLevel: RoadRiskSegment['riskLevel'] = 'low';
    if (adjustedRisk >= 80) riskLevel = 'very_high';
    else if (adjustedRisk >= 60) riskLevel = 'high';
    else if (adjustedRisk >= 35) riskLevel = 'moderate';

    // Estimate water depth in cm
    const depthCm = Math.round(segment.waterDepthCm * (rainfallMm / 150.0));

    return {
      ...segment,
      currentRisk: adjustedRisk,
      riskLevel,
      waterDepthCm: Math.max(0, depthCm),
      factors: {
        ...segment.factors,
        rainfall: rainfallMm >= 220 ? 'Severe' : rainfallMm >= 120 ? 'High' : rainfallMm >= 60 ? 'Moderate' : 'Low'
      }
    };
  });
}

/**
 * Simulate POST /api/route endpoint with intelligent trade-offs.
 * Generates dynamic route options tailored to coordinates and weather scenario.
 */
export async function fetchRouteRecommendations(params: {
  origin: string;
  destination: string;
  rainfallMm: number;
  preference: RoutePreference;
  originCoords?: [number, number];
  destinationCoords?: [number, number];
}): Promise<{
  routes: RouteOptionData[];
  highRiskSegmentsAvoided: number;
  rainfallUsed: number;
  modelConfidence: number;
}> {
  // Simulate rapid realistic response
  await new Promise(res => setTimeout(res, 180));

  const rainScale = params.rainfallMm / 150.0;
  const origCoords: [number, number] = params.originCoords || [13.0418, 80.2341];

  // Match emergency facility or custom destination
  const emgMatch = MOCK_EMERGENCY_FACILITIES.find(f =>
    f.name.toLowerCase().includes(params.destination.toLowerCase()) ||
    params.destination.toLowerCase().includes(f.name.toLowerCase()) ||
    params.destination.toLowerCase().includes(f.category)
  );

  const destCoords: [number, number] = params.destinationCoords ||
    (emgMatch ? emgMatch.coordinates : [12.9912, 80.2170]);

  const isEmergencyRoute = Boolean(emgMatch || (params.destinationCoords && params.destinationCoords[0] > 13.06));

  // If destination is in North/Central Chennai (e.g. Rajiv Gandhi GH, Fire Command, Police HQ, Ripon Relief Camp)
  if (isEmergencyRoute && destCoords[0] > 13.06) {
    const destName = emgMatch ? emgMatch.name.split('(')[0].trim() : params.destination;

    const routes: RouteOptionData[] = [
      {
        id: 'route-fastest',
        type: 'fastest',
        name: 'Fastest',
        durationMinutes: Math.round(11 + Math.max(0, (rainScale - 1) * 5)),
        distanceKm: emgMatch ? emgMatch.distanceKm : 4.8,
        exposurePercent: Math.min(85, Math.round(24 * Math.pow(rainScale, 0.4))),
        isRecommended: false,
        segmentsAvoidedCount: 1,
        tagline: `Direct arterial via Mount Rd & Central corridor to ${destName}`,
        primaryRoads: ['Anna Salai (Mount Rd)', 'EVR Periyar Salai'],
        color: '#dc2626',
        coordinates: [
          origCoords,
          [13.0470, 80.2420],
          [13.0535, 80.2505],
          [13.0610, 80.2580],
          [13.0680, 80.2645],
          [13.0745, 80.2710],
          [13.0790, 80.2745],
          [13.0805, 80.2770],
          destCoords
        ]
      },
      {
        id: 'route-balanced',
        type: 'balanced',
        name: 'Balanced',
        durationMinutes: Math.round(13 + Math.max(0, (rainScale - 1) * 3)),
        distanceKm: emgMatch ? emgMatch.distanceKm + 0.4 : 5.2,
        exposurePercent: Math.min(45, Math.max(10, Math.round(12 * Math.pow(rainScale, 0.4)))),
        isRecommended: params.preference === 'balanced',
        segmentsAvoidedCount: 3,
        tagline: `Avoids low-lying Cooum bends via College Road flyover to ${destName}`,
        primaryRoads: ['Sterling Road', 'Pantheon Road', 'EVR Salai'],
        color: '#059669',
        coordinates: [
          origCoords,
          [13.0510, 80.2360],
          [13.0610, 80.2425],
          [13.0700, 80.2530],
          [13.0760, 80.2640],
          [13.0800, 80.2730],
          [13.0805, 80.2770],
          destCoords
        ]
      },
      {
        id: 'route-safer',
        type: 'safer',
        name: 'Safer (Emergency Corridor)',
        durationMinutes: Math.round(15 + Math.max(0, (rainScale - 1) * 2)),
        distanceKm: emgMatch ? emgMatch.distanceKm + 0.9 : 5.7,
        exposurePercent: Math.min(20, Math.max(3, Math.round(5 * Math.pow(rainScale, 0.3)))),
        isRecommended: true,
        segmentsAvoidedCount: 4,
        tagline: `100% elevated evacuation ridge via Poonamallee High Rd — zero flooding`,
        primaryRoads: ['EVR Periyar Salai (Ridge)', 'Sydenhams High Road'],
        color: '#2563eb',
        coordinates: [
          origCoords,
          [13.0540, 80.2320],
          [13.0660, 80.2380],
          [13.0740, 80.2450],
          [13.0780, 80.2560],
          [13.0815, 80.2670],
          [13.0820, 80.2740],
          destCoords
        ]
      }
    ];

    return {
      routes,
      highRiskSegmentsAvoided: 4,
      rainfallUsed: params.rainfallMm,
      modelConfidence: 0.96
    };
  }

  // Standard routes (e.g. to Velachery / South Chennai)
  const routes = MOCK_ROUTES.map(r => {
    let exp = r.exposurePercent;
    let dur = r.durationMinutes;

    if (r.type === 'fastest') {
      exp = Math.min(95, Math.round(61 * Math.pow(rainScale, 0.4)));
      dur = Math.round(29 + Math.max(0, (rainScale - 1) * 8));
    } else if (r.type === 'balanced') {
      exp = Math.min(60, Math.max(15, Math.round(27 * Math.pow(rainScale, 0.4))));
      dur = Math.round(34 + Math.max(0, (rainScale - 1) * 4));
    } else if (r.type === 'safer') {
      exp = Math.min(30, Math.max(6, Math.round(12 * Math.pow(rainScale, 0.3))));
      dur = Math.round(39 + Math.max(0, (rainScale - 1) * 2));
    }

    const updatedCoords = [...r.coordinates];
    updatedCoords[0] = origCoords;
    updatedCoords[updatedCoords.length - 1] = destCoords;

    return {
      ...r,
      exposurePercent: exp,
      durationMinutes: dur,
      coordinates: updatedCoords
    };
  });

  return {
    routes,
    highRiskSegmentsAvoided: 3,
    rainfallUsed: params.rainfallMm,
    modelConfidence: 0.94
  };
}

/**
 * Filter place suggestions for autocomplete
 */
export function searchChennaiPlaces(query: string): PlaceSuggestion[] {
  if (!query || query.trim().length === 0) {
    return MOCK_PLACE_SUGGESTIONS.slice(0, 5);
  }
  const clean = query.toLowerCase().trim();
  return MOCK_PLACE_SUGGESTIONS.filter(p =>
    p.name.toLowerCase().includes(clean) ||
    p.description.toLowerCase().includes(clean) ||
    p.category.toLowerCase().includes(clean)
  );
}

/**
 * Retrieve nearest accessible emergency facility by category
 */
export function getEmergencyFacilityByCategory(category: EmergencyCategory): EmergencyFacility {
  const facility = MOCK_EMERGENCY_FACILITIES.find(f => f.category === category);
  return facility || MOCK_EMERGENCY_FACILITIES[0];
}
