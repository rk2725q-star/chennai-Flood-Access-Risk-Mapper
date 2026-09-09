# Chennai Flood Access & Risk Mapper

A geospatial machine learning data pipeline designed to assess and predict road-level flood accessibility and risk across Greater Chennai Corporation (GCC).

## 📊 Overview

This project compiles high-resolution meteorological, topographical, and hydrological data across Chennai to predict road impassability and flooding during extreme rainfall events.

### Key Data Features
- **Road Network Topology**: 4,531 arterial road segments, 29,607 road nodes (with 1,257 intersection markers), and directed road edges extracted from OpenStreetMap.
- **Meteorological Ground Truth**: Historical hourly precipitation and multi-station rainfall for catastrophic Chennai flood events (December 2015, Cyclone Vardah 2016, Cyclone Nivar 2020, November 2021 Monsoon, Cyclone Michaung 2023).
- **Hydrological Terrain Indices**:
  - **HAND (Height Above Nearest Drainage)**: Vertical elevation difference between road segments and hydrologically nearest drainage/canal channels ($Z_{\text{road}} - Z_{\text{drain}}$).
  - **Flow Accumulation & Topographic Wetness Index (TWI)**: Upslope contributing catchment area calculated using D8 flow routing across a Copernicus 90m DEM grid.
- **Water Bodies**: 1,213 mapped water bodies (lakes, eris, reservoirs, wetlands like Pallikaranai, and temple tanks) with distance-to-water-body lookups.

---

## 📁 Repository Structure

```
├── data/
│   ├── drainage/
│   │   └── chennai_drainage.geojson     # Canal, river, stormwater network
│   ├── elevation/
│   │   ├── chennai_dem_grid.csv         # Regular DEM elevation mesh
│   │   ├── chennai_elevation.csv        # Benchmark elevation landmarks
│   │   └── chennai_flow_accumulation.csv# D8 Flow Accumulation and TWI
│   ├── historical_floods/
│   │   └── flood_events.csv             # Ground truth flood occurrence records
│   ├── model/
│   │   └── road_flood_features.csv      # Model-ready feature table (27,186 rows × 31 columns)
│   ├── rainfall/
│   │   ├── forecast.csv                 # Real-time multi-day weather forecast
│   │   └── historical.csv               # Multi-station historical precipitation
│   ├── roads/
│   │   ├── chennai_roads.geojson        # Arterial road network with topology refs
│   │   ├── chennai_road_edges.csv/.geojson # Directed road edges and attributes
│   │   └── chennai_road_nodes.csv/.geojson # Road nodes and intersection degrees
│   └── water_bodies/
│       └── chennai_water_bodies.csv/.geojson # 1,213 mapped Chennai water bodies
├── scripts/
│   ├── compute_hydrology.py             # D8 flow routing, TWI, and HAND engine
│   ├── fetch_drainage.py                # OSM drainage scraping pipeline
│   ├── fetch_elevation.py               # Copernicus DEM API ingestion
│   ├── fetch_flood_events.py            # Historical disaster records collector
│   ├── fetch_rainfall.py                # Open-Meteo rainfall ingestor
│   ├── fetch_road_topology.py           # OSM road network & graph builder
│   ├── fetch_water_bodies.py            # Overpass water body scraper
│   ├── prepare_model_data.py            # Master feature engineering pipeline
│   └── verify_enriched_data.py          # Data validation and QA suite
└── README.md
```

---

## 🚀 Usage

### 1. Recompute or Scrape All Datasets
```bash
# Scrape road topology (segments, edges, nodes)
python scripts/fetch_road_topology.py

# Scrape water bodies
python scripts/fetch_water_bodies.py

# Compute DEM grid, D8 flow accumulation, TWI, and HAND
python scripts/compute_hydrology.py

# Ingest rainfall and flood ground truth
python scripts/fetch_rainfall.py
python scripts/fetch_flood_events.py
```

### 2. Build Model Feature Table
```bash
python scripts/prepare_model_data.py
```

### 3. Validate Data Quality
```bash
python scripts/verify_enriched_data.py
```
