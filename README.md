# Chennai Flood Access & Risk Mapper (AI Tactical Commander)

A geospatial machine learning data pipeline and autonomous AI tactical decision system designed to predict road-level flood accessibility and dynamically guide citizen navigation and municipal emergency operations across Greater Chennai Corporation (GCC).

---

## 🌟 What Makes This System 10x More Powerful?

1. **Physics-Informed Soft-Voting ML Ensemble** (`models/chennai_flood_model.joblib`):
   - Combines **Balanced Random Forest** and **HistGradientBoosting** trained on 27,186 data points across 31 features (HAND elevation, TWI, catchment, water body proximity, road highway class, and precipitation).
   - **5-Fold Cross-Validation: 95.5% Recall, 99.05% ROC-AUC**.
   - Accurately generalises to **unseen extreme weather events** (e.g. 250mm Michaung scale, 450mm 2015 mega-floods) rather than merely memorizing historical locations.

2. **Topological Graph Routing Engine** (`scripts/flood_routing_engine.py`):
   - Snapped topological road network graph across 4,531 road corridors and 4,303 junctions.
   - Computes Dijkstra normal shortest path vs **Safe Alternate Bypass Route** by applying non-linear flood penalty weights ($W = \text{length} \times (1 + 100 \cdot P(\text{flood})^2)$).

3. **OmniRoute Local LLM Proxy Integration** (`scripts/omniroute_client.py` & `scripts/flood_ai_agent.py`):
   - Directly connects to **OmniRoute proxy at `http://localhost:20128/v1`** (OpenAI-compatible SSE streaming).
   - Translates raw mathematical flood probabilities into **actionable tactical decisions**:
     - **Bilingual Citizen Advisory (English & Chennai Tamil)**: Vehicle-specific clearance checks (Hatchback vs SUV, hydrostatic lock risks), road-by-road chokepoint alerts, and safe detours.
     - **Disaster Operations Centre (EOC) SitRep**: 100HP/50HP de-watering pump allocations mapped to lowest HAND sites, hospital lifeline corridor defense (RGGGH, Apollo, MIOT, Stanley), and NDRF boat positioning.
     - **Natural Language Copilot**: Answers questions in natural Tamil or English.

4. **Interactive Dark-Mode Web Dashboard** (`web/index.html` & `scripts/serve_app.py`):
   - Leaflet map with CartoDB dark tiles, real-time live Open-Meteo rainfall feed, side-by-side shortest vs safe route rendering, and floating AI Commander chat drawer.

---

## 📁 Repository Structure

```
├── data/
│   ├── drainage/chennai_drainage.geojson     # Canal, river, stormwater network
│   ├── elevation/
│   │   ├── chennai_dem_grid.csv              # Copernicus DEM elevation mesh
│   │   ├── chennai_flow_accumulation.csv     # D8 Flow Accumulation & TWI
│   │   └── chennai_elevation.csv             # Benchmark elevation landmarks
│   ├── historical_floods/flood_events.csv    # Ground truth flood records
│   ├── model/
│   │   ├── road_flood_features.csv           # 27,186 rows × 31 features
│   │   └── road_level_risk_test_report.csv   # Comprehensive 4,531 road risk test
│   ├── rainfall/historical.csv & forecast.csv # Open-Meteo historical & forecast
│   ├── roads/
│   │   ├── chennai_roads.geojson             # Arterial road network geometry
│   │   ├── chennai_road_edges.csv/.geojson   # 4,531 directed road corridors
│   │   └── chennai_road_nodes.csv/.geojson   # 29,607 road junctions & degrees
│   └── water_bodies/chennai_water_bodies.csv # 1,213 mapped lakes & tanks
├── models/
│   ├── chennai_flood_model.joblib            # Physics Soft-Voting ML Bundle
│   └── model_metadata.json                   # Hyperparameters & performance metrics
├── scripts/
│   ├── omniroute_client.py                   # Local LLM client with SSE streaming
│   ├── flood_ai_agent.py                     # Autonomous AI Tactical Commander
│   ├── flood_routing_engine.py               # NetworkX safe bypass routing
│   ├── predict_flood.py                      # Early-warning CLI & Live Weather
│   ├── test_road_level_risk.py               # 50mm-400mm stress-test suite
│   ├── train_model.py                        # Model training pipeline
│   ├── prepare_model_data.py                 # Feature engineering pipeline
│   └── serve_app.py                          # Zero-dependency Web & API Server
├── web/
│   └── index.html                            # Leaflet dark-mode interactive map
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Launch Interactive Web Dashboard
```bash
python scripts/serve_app.py 8050
```
Open **`http://localhost:8050`** in your browser:
- Adjust 24h rainfall slider (50mm to 450mm) or fetch live satellite weather.
- Select Origin & Destination (e.g. Velachery to Airport).
- View side-by-side shortest vs safe bypass route on the map.
- Chat with the AI Tactical Commander in English or தமிழ்!

---

### 2. Natural Language Flood Copilot (`--ask`)
Ask any commute or flood question in English or Tamil:
```bash
# Tamil / English Commute Query
python scripts/predict_flood.py --ask "Velachery to Airport la 180mm rain irundha hatchback car la pogalama?"

# General City Question
python scripts/predict_flood.py --ask "Which areas in Chennai will flood first if it rains 200mm?"
```

---

### 3. Tactical Route Advisory (`flood_ai_agent.py`)
```bash
# Plan route for small car with specific rainfall
python scripts/flood_ai_agent.py --from "Velachery" --to "Airport" --vehicle hatchback --rain 180

# Plan route using live satellite forecast
python scripts/flood_ai_agent.py --from "Tambaram" --to "Chennai Central" --live
```

---

### 4. GCC Emergency Operations SitRep (`--sitrep`)
Generate automated municipal command directives for NDRF, GCC, and Police:
```bash
python scripts/flood_ai_agent.py --sitrep --scenario cyclone
```
Outputs:
- Total km of city network submerged.
- Hard road closures & mandatory traffic diversions.
- Heavy-duty (100HP / 50HP) de-watering pump deployment targets with drainage discharge lines.
- Hospital lifeline corridor clearance (RGGGH, Apollo, MIOT, Stanley).
- NDRF / SDRF water rescue boat sector staging.
- Official public emergency warning in Tamil.

---

### 5. Interactive Terminal Chat Mode
```bash
python scripts/flood_ai_agent.py --interactive
```

---

### 6. Run Road-Level Risk Stress Test Across 4,531 Roads
```bash
python scripts/test_road_level_risk.py
```
Outputs complete distribution across 50mm, 100mm, 150mm, 200mm, 300mm, and 400mm rainfall tiers to `data/model/road_level_risk_test_report.csv`.
