import { RoadRiskSegment, RouteOptionData, EmergencyFacility, PlaceSuggestion, JourneyHistoryItem } from '../types/navigation';

export const CHENNAI_COORDINATES: [number, number] = [13.0450, 80.2250];

export const MOCK_PLACE_SUGGESTIONS: PlaceSuggestion[] = [
  {
    id: 'place-tnagar',
    name: 'T. Nagar (Panagal Park)',
    description: 'Prakasam Road / Usman Road, T. Nagar, Chennai',
    category: 'Commercial Hub',
    coordinates: [13.0418, 80.2341]
  },
  {
    id: 'place-adyar',
    name: 'Adyar (Madhya Kailash)',
    description: 'Sardar Patel Road / OMR Junction, Chennai',
    category: 'Arterial Junction',
    coordinates: [13.0067, 80.2570]
  },
  {
    id: 'place-guindy',
    name: 'Guindy (Kathipara Junction)',
    description: 'GST Road / Inner Ring Road, Guindy, Chennai',
    category: 'Transit Interchange',
    coordinates: [13.0080, 80.2070]
  },
  {
    id: 'dest-gh',
    name: 'Government General Hospital (Rajiv Gandhi GH)',
    description: 'EVR Periyar Salai, Park Town, Chennai',
    category: 'Hospital',
    coordinates: [13.0805, 80.2798]
  },
  {
    id: 'dest-apollo',
    name: 'Apollo Hospital Greams Road',
    description: 'Greams Lane, Thousand Lights, Chennai',
    category: 'Hospital',
    coordinates: [13.0563, 80.2514]
  },
  {
    id: 'dest-central',
    name: 'Chennai Central Railway Station',
    description: 'Kannappar Thidal, Periamet, Chennai',
    category: 'Transit',
    coordinates: [13.0827, 80.2755]
  },
  {
    id: 'dest-airport',
    name: 'Chennai International Airport (T1)',
    description: 'GST Road, Meenambakkam, Chennai',
    category: 'Airport',
    coordinates: [12.9941, 80.1709]
  },
  {
    id: 'dest-phoenix',
    name: 'Phoenix Marketcity Velachery',
    description: 'Velachery Road, Indira Gandhi Nagar, Chennai',
    category: 'Commercial',
    coordinates: [12.9922, 80.2173]
  },
  {
    id: 'dest-iit',
    name: 'IIT Madras Adyar Campus',
    description: 'Sardar Patel Road, Guindy/Adyar, Chennai',
    category: 'Education',
    coordinates: [13.0064, 80.2425]
  },
  {
    id: 'dest-cmbt',
    name: 'Koyambedu CMBT Bus Terminus',
    description: 'Jawaharlal Nehru Salai, Koyambedu, Chennai',
    category: 'Transit',
    coordinates: [13.0673, 80.1932]
  },
  {
    id: 'dest-marina',
    name: 'Marina Beach Lighthouse',
    description: 'Kamarajar Salai, Santhome, Chennai',
    category: 'Landmark',
    coordinates: [13.0398, 80.2789]
  },
  {
    id: 'dest-omr',
    name: 'OMR IT Corridor (Thoraipakkam)',
    description: 'Rajiv Gandhi Salai, Thoraipakkam, Chennai',
    category: 'Tech Corridor',
    coordinates: [12.9416, 80.2362]
  },
  {
    id: 'dest-annanagar',
    name: 'Anna Nagar Tower Park',
    description: '3rd Avenue, Anna Nagar East, Chennai',
    category: 'Civic',
    coordinates: [13.0850, 80.2100]
  },
  {
    id: 'dest-tambaram',
    name: 'Tambaram Railway Junction',
    description: 'GST Road, Tambaram West, Chennai',
    category: 'Transit',
    coordinates: [12.9249, 80.1000]
  }
];

export const MOCK_ROAD_SEGMENTS: RoadRiskSegment[] = [
  {
    id: 'R1042',
    code: 'R1042',
    name: 'Velachery Main Road (Vijayanagar Bus Stand section)',
    area: 'Velachery',
    baseRisk: 87,
    currentRisk: 87,
    riskLevel: 'very_high',
    waterDepthCm: 65,
    factors: {
      rainfall: 'High',
      elevation: 'Low',
      elevationDetails: '4.2m MSL (depression basin)',
      drainage: 'Moderate',
      drainageDetails: 'Pallikaranai marsh runoff overflow',
      builtUpArea: 'High',
      builtUpDetails: 'Dense commercial concrete cover (88%)'
    },
    advice: 'Consider an alternate route. Divert via 100ft Elevated Bypass or Inner Ring Road.',
    coordinates: [
      [12.9785, 80.2190],
      [12.9810, 80.2220],
      [12.9840, 80.2255],
      [12.9875, 80.2285],
      [12.9910, 80.2260]
    ]
  },
  {
    id: 'R0871',
    code: 'R0871',
    name: 'Usman Road Subway & Duraisamy Rd Underpass',
    area: 'T. Nagar',
    baseRisk: 82,
    currentRisk: 82,
    riskLevel: 'very_high',
    waterDepthCm: 90,
    factors: {
      rainfall: 'High',
      elevation: 'Low',
      elevationDetails: 'Subway deck 2.1m below road surface',
      drainage: 'Poor',
      drainageDetails: 'Mambalam Canal back-surge',
      builtUpArea: 'High',
      builtUpDetails: 'Intense shopping district footprint'
    },
    advice: 'Subway closed to light vehicular traffic. Use Usman Road Elevated Flyover.',
    coordinates: [
      [13.0370, 80.2330],
      [13.0395, 80.2338],
      [13.0425, 80.2345],
      [13.0450, 80.2352]
    ]
  },
  {
    id: 'R1190',
    code: 'R1190',
    name: 'GST Road Underpass (St. Thomas Mount)',
    area: 'Guindy / St. Thomas Mount',
    baseRisk: 76,
    currentRisk: 76,
    riskLevel: 'high',
    waterDepthCm: 50,
    factors: {
      rainfall: 'High',
      elevation: 'Low',
      elevationDetails: '3.8m MSL natural slope dip',
      drainage: 'Moderate',
      drainageDetails: 'Adyar river channel proximity',
      builtUpArea: 'High',
      builtUpDetails: 'Highway intersection convergence'
    },
    advice: 'Stay on elevated Kathipara Grade Separator flyover spans.',
    coordinates: [
      [13.0030, 80.1980],
      [13.0065, 80.2015],
      [13.0090, 80.2050],
      [13.0115, 80.2085]
    ]
  },
  {
    id: 'R0512',
    code: 'R0512',
    name: 'Madipakkam Lake Link Road',
    area: 'Madipakkam',
    baseRisk: 74,
    currentRisk: 74,
    riskLevel: 'high',
    waterDepthCm: 45,
    factors: {
      rainfall: 'High',
      elevation: 'Low',
      elevationDetails: '3.4m MSL adjacent to lake weir',
      drainage: 'Poor',
      drainageDetails: 'Lake overflow into residential lanes',
      builtUpArea: 'High',
      builtUpDetails: 'Paved residential colony lanes'
    },
    advice: 'Waterlogging across both carriageways. Avoid low chassis sedans.',
    coordinates: [
      [12.9640, 80.1950],
      [12.9675, 80.1995],
      [12.9710, 80.2040],
      [12.9735, 80.2080]
    ]
  },
  {
    id: 'R0304',
    code: 'R0304',
    name: 'Vyasarpadi Gengu Reddy Subway',
    area: 'Vyasarpadi / North Chennai',
    baseRisk: 71,
    currentRisk: 71,
    riskLevel: 'high',
    waterDepthCm: 70,
    factors: {
      rainfall: 'High',
      elevation: 'Low',
      elevationDetails: 'Depressed railway crossing track',
      drainage: 'Poor',
      drainageDetails: 'Otteri Nullah water backup',
      builtUpArea: 'High',
      builtUpDetails: 'Dense northern railway freight hub'
    },
    advice: 'Subway completely barricaded. Traffic diverted to Perambur Bridge.',
    coordinates: [
      [13.1020, 80.2610],
      [13.1045, 80.2635],
      [13.1070, 80.2655]
    ]
  },
  {
    id: 'R0943',
    code: 'R0943',
    name: 'Perumbakkam Link Road & Global Hospital Rd',
    area: 'Perumbakkam / Sholinganallur',
    baseRisk: 68,
    currentRisk: 68,
    riskLevel: 'high',
    waterDepthCm: 35,
    factors: {
      rainfall: 'Moderate',
      elevation: 'Low',
      elevationDetails: '2.9m MSL flat marsh edge',
      drainage: 'Moderate',
      drainageDetails: 'Marsh discharge restriction',
      builtUpArea: 'Moderate',
      builtUpDetails: 'Suburban IT residential clusters'
    },
    advice: 'Ponding in slow lanes. Use central median lanes or OMR main highway.',
    coordinates: [
      [12.9050, 80.1980],
      [12.9090, 80.2050],
      [12.9130, 80.2120],
      [12.9160, 80.2180]
    ]
  },
  {
    id: 'R1420',
    code: 'R1420',
    name: 'Ambattur Industrial Estate 3rd Main Road',
    area: 'Ambattur',
    baseRisk: 65,
    currentRisk: 65,
    riskLevel: 'high',
    waterDepthCm: 30,
    factors: {
      rainfall: 'Moderate',
      elevation: 'Moderate',
      elevationDetails: '7.8m MSL plateau',
      drainage: 'Poor',
      drainageDetails: 'Industrial storm drain blockage',
      builtUpArea: 'High',
      builtUpDetails: 'Heavy manufacturing units footprint'
    },
    advice: 'Heavy vehicle transit only. Two-wheelers advised to take CTH Road.',
    coordinates: [
      [13.1010, 80.1550],
      [13.1040, 80.1600],
      [13.1070, 80.1650],
      [13.1090, 80.1700]
    ]
  },
  {
    id: 'R0115',
    code: 'R0115',
    name: 'Anna Salai (DMS to Saidapet Metro corridor)',
    area: 'Central Chennai',
    baseRisk: 28,
    currentRisk: 28,
    riskLevel: 'low',
    waterDepthCm: 5,
    factors: {
      rainfall: 'Moderate',
      elevation: 'High',
      elevationDetails: '11.5m MSL ridge alignment',
      drainage: 'Adequate',
      drainageDetails: 'Storm drain network newly augmented',
      builtUpArea: 'High',
      builtUpDetails: 'Wide 6-lane paved arterial'
    },
    advice: 'Safe and clear transit corridor. Speed limit 40 km/h in rainfall.',
    coordinates: [
      [13.0410, 80.2450],
      [13.0330, 80.2370],
      [13.0240, 80.2290],
      [13.0150, 80.2210]
    ]
  },
  {
    id: 'R0230',
    code: 'R0230',
    name: 'Poonamallee High Road (Central to Kilpauk)',
    area: 'Kilpauk / Periamet',
    baseRisk: 22,
    currentRisk: 22,
    riskLevel: 'low',
    waterDepthCm: 0,
    factors: {
      rainfall: 'Moderate',
      elevation: 'High',
      elevationDetails: '13.2m MSL natural high ridge',
      drainage: 'Adequate',
      drainageDetails: 'Direct gradient runoff to Cooum',
      builtUpArea: 'High',
      builtUpDetails: 'Hospital & institutional zone'
    },
    advice: 'Primary emergency evacuation corridor. All lanes open and dry.',
    coordinates: [
      [13.0820, 80.2740],
      [13.0800, 80.2600],
      [13.0780, 80.2460],
      [13.0760, 80.2320]
    ]
  }
];

export const MOCK_EMERGENCY_FACILITIES: EmergencyFacility[] = [
  {
    id: 'emg-hospital',
    category: 'hospital',
    name: 'Government General Hospital (Rajiv Gandhi GH)',
    distanceKm: 4.8,
    durationMinutes: 11,
    exposureLevel: 'LOW',
    exposureNote: 'Route via EVR Periyar Salai (Poonamallee High Rd) remains elevated & completely dry.',
    address: 'EVR Periyar Salai, Park Town, Chennai 600003',
    phone: '044-25305000 / 108',
    coordinates: [13.0805, 80.2798],
    operationalStatus: '24/7 Trauma Care Operational • Backup Power Active'
  },
  {
    id: 'emg-fire',
    category: 'fire_station',
    name: 'Egmore Fire & Rescue Operations Command HQ',
    distanceKm: 3.2,
    durationMinutes: 8,
    exposureLevel: 'LOW',
    exposureNote: 'Direct elevated corridor via Pantheon Road with zero waterlogging.',
    address: 'Pantheon Road, Egmore, Chennai 600008',
    phone: '101 / 044-28555101',
    coordinates: [13.0784, 80.2605],
    operationalStatus: 'Flood Rescue Inflatable Boats & Pumping Teams On Standby'
  },
  {
    id: 'emg-police',
    category: 'police',
    name: 'Vepery Commissionerate & Law Enforcement Post',
    distanceKm: 2.7,
    durationMinutes: 7,
    exposureLevel: 'LOW',
    exposureNote: 'EVR Salai and Vepery High Road ridge fully passable for emergency response.',
    address: 'Vepery High Road, Chennai 600007',
    phone: '100 / 044-23452359',
    coordinates: [13.0844, 80.2655],
    operationalStatus: 'Monsoon Traffic Control Room Active (Helpline 103)'
  },
  {
    id: 'emg-shelter',
    category: 'shelter',
    name: 'Ripon Building Community High-Ground Relief Camp',
    distanceKm: 3.9,
    durationMinutes: 9,
    exposureLevel: 'LOW',
    exposureNote: 'Designated GCC dry relief center with medical triage and community kitchen.',
    address: 'Sydenhams Road, Periamet, Chennai 600003',
    phone: '1913 (GCC Toll-Free)',
    coordinates: [13.0827, 80.2755],
    operationalStatus: 'Capacity: 1,200 Persons • Food, Clean Water & First Aid Ready'
  }
];

export const MOCK_ROUTES: RouteOptionData[] = [
  {
    id: 'route-fastest',
    type: 'fastest',
    name: 'Fastest',
    durationMinutes: 29,
    distanceKm: 11.4,
    exposurePercent: 61,
    isRecommended: false,
    segmentsAvoidedCount: 0,
    tagline: 'Direct arterial path through low-lying sectors',
    primaryRoads: ['Usman Road', 'Velachery Main Rd', 'GST Road dip'],
    color: '#ef4444', // red warning
    coordinates: [
      [13.0418, 80.2337], // T. Nagar origin
      [13.0370, 80.2330], // R0871 Usman subway
      [13.0250, 80.2280],
      [13.0100, 80.2200],
      [12.9980, 80.2150],
      [12.9850, 80.2230], // R1042 Velachery
      [12.9922, 80.2173]  // Phoenix / Velachery dest
    ]
  },
  {
    id: 'route-balanced',
    type: 'balanced',
    name: 'Balanced',
    durationMinutes: 34,
    distanceKm: 13.2,
    exposurePercent: 27,
    isRecommended: true,
    segmentsAvoidedCount: 3,
    tagline: '3 high-risk road segments avoided',
    primaryRoads: ['Usman Road Flyover', 'Anna Salai', 'Kathipara Grade Separator'],
    color: '#059669', // calm emerald/navy
    coordinates: [
      [13.0418, 80.2337], // T. Nagar origin
      [13.0400, 80.2400], // Bypass subway via Usman Flyover
      [13.0330, 80.2370], // Anna Salai dry corridor
      [13.0200, 80.2250],
      [13.0080, 80.2070], // Kathipara elevated loop
      [12.9980, 80.2120], // 100ft elevated bypass
      [12.9922, 80.2173]  // Phoenix dest
    ]
  },
  {
    id: 'route-safer',
    type: 'safer',
    name: 'Safer',
    durationMinutes: 39,
    distanceKm: 15.8,
    exposurePercent: 12,
    isRecommended: false,
    segmentsAvoidedCount: 5,
    tagline: 'Elevated flyovers & dry arterial corridors',
    primaryRoads: ['Inner Ring Road Elevated Corridor', 'Poonamallee High Rd', 'Guindy Flyover'],
    color: '#2563eb', // subtle blue
    coordinates: [
      [13.0418, 80.2337], // T. Nagar
      [13.0470, 80.2450],
      [13.0550, 80.2400],
      [13.0600, 80.2200],
      [13.0450, 80.2050], // Inner Ring elevated
      [13.0250, 80.2020],
      [13.0080, 80.2070], // Kathipara top ramp
      [12.9950, 80.2100],
      [12.9922, 80.2173]  // Phoenix dest
    ]
  }
];

export const MOCK_JOURNEY_HISTORY: JourneyHistoryItem[] = [
  {
    id: 'hist-1',
    timestamp: 'Today, 08:30 AM',
    origin: 'T. Nagar (Panagal Park)',
    destination: 'Chennai Central Railway Station',
    routeType: 'balanced',
    durationMinutes: 34,
    exposureAvoidedPercent: 42,
    rainfallAtTime: '150 mm / 6h',
    status: 'completed'
  },
  {
    id: 'hist-2',
    timestamp: 'Yesterday, 07:45 PM',
    origin: 'Guindy Industrial Estate',
    destination: 'Velachery Bypass Road',
    routeType: 'safer',
    durationMinutes: 41,
    exposureAvoidedPercent: 58,
    rainfallAtTime: '190 mm / 6h',
    status: 'completed'
  },
  {
    id: 'hist-3',
    timestamp: '08 Sep, 02:15 PM',
    origin: 'Anna Nagar West',
    destination: 'Apollo Hospital Greams Road',
    routeType: 'fastest',
    durationMinutes: 28,
    exposureAvoidedPercent: 24,
    rainfallAtTime: '80 mm / 6h',
    status: 'completed'
  }
];
