# Chennai Flood Access & Risk Mapper

An interactive Geographic Information System (GIS) and crisis response dashboard built to visualize flood inundation zones, analyze emergency route accessibility, track critical lifeline facilities (hospitals, relief shelters, subway closures), and simulate reservoir discharge impacts across Greater Chennai.

---

## 🌟 Comprehensive Architecture & Capabilities

1. **Production React + Vite GIS Frontend** (from `main` branch):
   - **Interactive Leaflet GIS Map**: Custom SVG markers, CartoDB dark/light layers, OpenStreetMap.
   - **Emergency Route Navigation**: Turn-by-turn guidance with flood risk scoring and safe elevated bypass routes.
   - **Submerged Subway & Chokepoint Tracking**: Real-time water depth warnings for critical underpasses (Madley, Duraisamy, Gengu Reddy, Vyasarpadi).
   - **Hydro Surge & Reservoir Simulator**: Chembarambakkam Lake (up to 28,000 cusecs) and Red Hills discharge simulation.
   - **Google Maps & Local AI Assistant**: Real-time place intelligence and conversational travel advisory.

2. **Backend Physics ML Ensemble & Hydrology Pipeline**:
   - **Soft-Voting Ensemble Model** (`models/chennai_flood_model.joblib`): Balanced Random Forest + HistGradientBoosting trained on 27,186 data points across 31 features (HAND elevation, TWI, catchment, water bodies, road highway class, and precipitation). 5-Fold Cross-Validation: 95.5% Recall, 99.05% ROC-AUC.
   - **Topological Graph Routing Engine** (`scripts/flood_routing_engine.py`): Snapped topological road network graph across 4,531 road corridors and 4,303 junctions with Dijkstra safe alternate routing.
   - **Live Weather Feed** (`scripts/predict_flood.py`): Real-time multi-station Open-Meteo satellite/radar rainfall feed across 6 Chennai meteorological zones.

3. **OmniRoute LLM Tactical Decision Commander** (`scripts/flood_ai_agent.py` & `scripts/omniroute_client.py`):
   - Integrates with local OmniRoute proxy (`http://localhost:20128/v1`).
   - Translates mathematical flood probabilities into actionable, vehicle-specific travel advisories in English and Chennai Tamil.
   - Generates GCC Emergency Operations Centre (EOC) SitReps with de-watering pump deployment recommendations.

---

## 📁 Repository Structure

```
├── data/
│   ├── drainage/chennai_drainage.geojson     # Canal, river, stormwater network
│   ├── elevation/                            # Copernicus DEM elevation mesh & TWI
│   ├── historical_floods/flood_events.csv    # Historical flood ground truth
│   ├── model/road_flood_features.csv         # 27,186 rows × 31 features
│   ├── rainfall/historical.csv & forecast.csv
│   ├── roads/chennai_roads.geojson           # 4,531 arterial road corridors
│   └── water_bodies/chennai_water_bodies.csv # 1,213 mapped water bodies
├── models/
│   ├── chennai_flood_model.joblib            # Physics ML model bundle
│   └── model_metadata.json                   # Model performance & hyperparameters
├── scripts/
│   ├── omniroute_client.py                   # Local LLM client with SSE streaming
│   ├── flood_ai_agent.py                     # Autonomous AI Tactical Commander
│   ├── flood_routing_engine.py               # NetworkX safe bypass routing
│   ├── predict_flood.py                      # Early-warning CLI & Live Weather
│   ├── test_road_level_risk.py               # 50mm-400mm stress-test suite
│   ├── train_model.py                        # Model training pipeline
│   └── prepare_model_data.py                 # Feature engineering pipeline
├── src/                                      # React 18 TypeScript application
│   ├── components/                           # GIS map, navigation, modals, HUD
│   ├── data/                                 # Chennai geographical & facility datasets
│   ├── utils/                                # Flood engine & hydrology solvers
│   ├── App.tsx                               # Main application component
│   └── main.tsx                              # Application root entrypoint
├── index.html                                # HTML root template
├── server.ts                                 # Express + Vite backend server
├── vite.config.ts                            # Vite configuration
└── package.json                              # Dependencies & scripts
```

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start development server (Frontend + Backend)
npm run dev
```

Open **`http://localhost:3000`** in your browser.
