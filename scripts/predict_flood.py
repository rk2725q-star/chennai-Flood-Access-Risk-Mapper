"""
predict_flood.py
================
Unified Early-Warning Flood Risk Predictor & Route Recommender.
Predicts road inundation BEFORE cloudbursts occur, ranks disruptions,
and suggests safe alternate bypass routes.

Usage Examples:
  # 1. Citywide future storm prediction:
  python scripts/predict_flood.py --rain24 180 --rain3h 70

  # 2. Inspect specific road risk:
  python scripts/predict_flood.py --road "Velachery" --rain24 150

  # 3. Predict using live weather forecast:
  python scripts/predict_flood.py --live-forecast

  # 4. Find safe alternate route:
  python scripts/predict_flood.py --route "Guindy" "Chennai Central" --rain24 200
"""

import os
import sys
import csv
import json
import joblib
import argparse
import numpy as np

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "chennai_flood_model.joblib")
FEATURES_CSV = os.path.join(BASE_DIR, "data", "model", "road_flood_features.csv")
FORECAST_CSV = os.path.join(BASE_DIR, "data", "rainfall", "forecast.csv")

sys.path.insert(0, os.path.join(BASE_DIR, "scripts"))
from flood_routing_engine import FloodRoutingEngine

KNOWN_LANDMARKS = {
    "guindy": (13.0070, 80.2050),
    "chennai central": (13.0830, 80.2750),
    "tambaram": (12.9230, 80.1270),
    "velachery": (12.9800, 80.2220),
    "anna nagar": (13.0850, 80.2100),
    "omr": (12.9010, 80.2280),
    "marina": (13.0500, 80.2830),
    "koyambedu": (13.0690, 80.1940),
    "adyar": (13.0060, 80.2570),
    "airport": (12.9940, 80.1800),
}

class ChennaiFloodPredictor:
    def __init__(self):
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model bundle not found at {MODEL_PATH}. Run 'python scripts/train_model.py' first.")

        bundle = joblib.load(MODEL_PATH)
        self.model = bundle["model"]
        self.feature_columns = bundle["feature_columns"]
        self.threshold = bundle.get("optimal_threshold", 0.40)

        # Load road static infrastructure attributes (deduplicated by road_id)
        self.roads = {}
        with open(FEATURES_CSV, encoding="utf-8") as f:
            for r in csv.DictReader(f):
                rid = r["road_id"]
                if rid not in self.roads:
                    self.roads[rid] = {
                        "road_id": rid,
                        "osm_way_id": r.get("osm_way_id", ""),
                        "edge_id": r.get("edge_id", rid),
                        "start_node_id": r.get("start_node_id", ""),
                        "end_node_id": r.get("end_node_id", ""),
                        "road_name": r.get("road_name", "Unnamed Road"),
                        "highway_type": r.get("highway_type", "unclassified"),
                        "lat": float(r["lat"]),
                        "lon": float(r["lon"]),
                        "elevation": float(r["elevation"]),
                        "slope": float(r["slope"]),
                        "hand": float(r["hand"]),
                        "dist_to_drain_m": float(r["dist_to_drain_m"]),
                        "flow_accumulation": float(r["flow_accumulation"]),
                        "catchment_km2": float(r["catchment_km2"]),
                        "twi": float(r["twi"]),
                        "drainage_density": float(r["drainage_density"]),
                        "dist_to_water_body_m": float(r["dist_to_water_body_m"]),
                        "nearest_water_body_name": r.get("nearest_water_body_name", "None"),
                        "nearest_water_body_type": r.get("nearest_water_body_type", "None"),
                        "built_up": float(r.get("built_up", 10.0)),
                        "node_degree": float(r.get("node_degree", 2)),
                        "length_m": float(r.get("length_m", 250.0))
                    }

        self._routing_engine = None

    @property
    def routing_engine(self):
        if self._routing_engine is None:
            self._routing_engine = FloodRoutingEngine()
        return self._routing_engine

    def predict_citywide(self, rain_24h_mm: float, rain_3h_mm: float):
        """Predicts flood probability and risk tier for all roads in Chennai under given rainfall."""
        X_batch = []
        road_meta = list(self.roads.values())

        for r in road_meta:
            row_features = [
                rain_24h_mm,
                rain_3h_mm,
                r["elevation"],
                r["slope"],
                r["hand"],
                r["dist_to_drain_m"],
                r["flow_accumulation"],
                r["catchment_km2"],
                r["twi"],
                r["drainage_density"],
                r["dist_to_water_body_m"],
                r["built_up"],
                r["node_degree"],
                r["length_m"]
            ]
            X_batch.append(row_features)

        probs = self.model.predict_proba(np.array(X_batch))[:, 1]
        results = {}

        for r, p in zip(road_meta, probs):
            p_val = float(p)
            if p_val >= 0.70:
                tier = "🔴 CRITICAL (Impassable)"
                action = "Close road immediately; deploy dewatering pumps; divert all vehicles."
            elif p_val >= 0.40:
                tier = "🟠 HIGH RISK (Inundation Expected)"
                action = "Subway/corridor waterlogging likely; advise light vehicles to bypass."
            elif p_val >= 0.20:
                tier = "🟡 ALERT (Moderate Risk)"
                action = "Slow traffic expected due to water pooling along curbs."
            else:
                tier = "🟢 PASSABLE (Safe)"
                action = "Normal traffic passable; no significant waterlogging."

            results[r["road_id"]] = {
                **r,
                "flood_probability": round(p_val, 4),
                "risk_tier": tier,
                "recommended_action": action
            }

        return results

def format_disruption_table(ranked_list):
    lines = []
    lines.append(f"{'Rank':<4} | {'Road Name':<32} | {'Highway':<14} | {'Prob':<7} | {'Score':<7} | {'HAND':<8} | {'Elev':<6}")
    lines.append("-" * 88)
    for idx, r in enumerate(ranked_list, 1):
        name = (r["road_name"][:30] + "..") if len(r["road_name"]) > 32 else r["road_name"]
        lines.append(f"{idx:>3}. | {name:<32} | {r['highway_type']:<14} | {r['flood_probability_pct']:>5.1f}% | {r['disruption_score']:>5.1f} | {r['hand_m']:>6.2f}m | {r['elevation_m']:>4.1f}m")
    return "\n".join(lines)

def parse_landmark(query_str):
    q = query_str.strip().lower()
    for name, coords in KNOWN_LANDMARKS.items():
        if name in q or q in name:
            return coords, name.title()
    # Try comma separated lat,lon
    if "," in query_str:
        try:
            parts = [float(x.strip()) for x in query_str.split(",")]
            return (parts[0], parts[1]), f"Coord({parts[0]:.4f}, {parts[1]:.4f})"
        except Exception:
            pass
    return None, None

def main():
    parser = argparse.ArgumentParser(description="Chennai Pre-Disaster Flood Predictor & Safe Route Recommender")
    parser.add_argument("--rain24", type=float, default=None, help="24-hour rainfall forecast in mm (e.g. 180)")
    parser.add_argument("--rain3h", type=float, default=None, help="3-hour peak cloudburst rainfall in mm (e.g. 60)")
    parser.add_argument("--road", type=str, default=None, help="Inspect specific road name (e.g. 'Velachery')")
    parser.add_argument("--live-forecast", action="store_true", help="Automatically load real-time forecast from Open-Meteo")
    parser.add_argument("--route", nargs=2, metavar=("START", "DEST"), help="Compute safe alternate route avoiding flood roads")
    parser.add_argument("--top", type=int, default=12, help="Number of top disrupted roads to show (default: 12)")

    args = parser.parse_args()
    predictor = ChennaiFloodPredictor()

    # Determine rainfall scenario
    rain24 = args.rain24
    rain3h = args.rain3h

    if args.live_forecast:
        print("[METEO] Reading live weather forecast...")
        if os.path.exists(FORECAST_CSV):
            with open(FORECAST_CSV, encoding="utf-8") as f:
                f_rows = list(csv.DictReader(f))
            vals = [float(r["rainfall_mm"] or 0) for r in f_rows]
            rain24 = round(sum(vals[:24]), 1) if len(vals) >= 24 else sum(vals)
            rain3h = max((sum(vals[i:i+3]) for i in range(len(vals)-2)), default=round(rain24*0.35, 1))
            print(f"  Live 24h precipitation forecast: {rain24:.1f} mm | Peak 3h cloudburst: {rain3h:.1f} mm")
        else:
            rain24, rain3h = 160.0, 55.0
            print(f"  Forecast file not found; defaulting to moderate storm scenario: 24h={rain24}mm, 3h={rain3h}mm")

    if rain24 is None:
        rain24 = 180.0
    if rain3h is None:
        rain3h = round(rain24 * 0.35, 1)

    print("\n" + "="*85)
    print("🌊 CHENNAI EARLY-WARNING FLOOD RESILIENCE SYSTEM")
    print(f"   Rainfall Input: 24h Total = {rain24:.1f} mm  |  3h Peak Intensity = {rain3h:.1f} mm/3h")
    print("="*85)

    # 1. Run citywide inference
    preds = predictor.predict_citywide(rain24, rain3h)
    
    total_roads = len(preds)
    critical = [p for p in preds.values() if "CRITICAL" in p["risk_tier"]]
    high_risk = [p for p in preds.values() if "HIGH RISK" in p["risk_tier"]]
    alert = [p for p in preds.values() if "ALERT" in p["risk_tier"]]
    passable = [p for p in preds.values() if "PASSABLE" in p["risk_tier"]]

    print(f"\n📊 CITYWIDE ACCESS IMPACT SUMMARY (Total Roads Monitored: {total_roads:,}):")
    print(f"  🟢 Passable / Safe Roads      : {len(passable):>5,} ({len(passable)/total_roads*100:>5.1f}%) -> Normal Transit Permitted")
    print(f"  🟡 Alert / Minor Waterlogging : {len(alert):>5,} ({len(alert)/total_roads*100:>5.1f}%) -> Caution in Subways/Curbs")
    print(f"  🟠 High Risk Roads            : {len(high_risk):>5,} ({len(high_risk)/total_roads*100:>5.1f}%) -> Light Vehicles Diverted")
    print(f"  🔴 Critical / Impassable Roads: {len(critical):>5,} ({len(critical)/total_roads*100:>5.1f}%) -> PUMPS DEPLOYED & CORRIDORS CLOSED")

    # 2. Road Query Mode
    if args.road:
        query_road = args.road.lower()
        matched = [p for p in preds.values() if query_road in p["road_name"].lower()]
        print(f"\n🔍 ROAD-LEVEL DIAGNOSIS FOR '{args.road}' ({len(matched)} segments found):")
        print("-" * 85)
        for idx, m in enumerate(matched[:5], 1):
            print(f"[{idx}] {m['road_name']} ({m['highway_type']}) - ID: {m['road_id']}")
            print(f"    Risk Assessment : {m['risk_tier']} (Probability: {m['flood_probability']*100:.1f}%)")
            print(f"    Terrain Physics : Elevation = {m['elevation']:.1f} m  |  HAND = {m['hand']:.2f} m  |  Slope = {m['slope']:.3f}°")
            print(f"    Hydrology       : Flow Catchment = {m['catchment_km2']:.2f} km²  |  Drainage Density = {m['drainage_density']:.1f} m/km²")
            print(f"    Water Body      : Nearest is {m['nearest_water_body_name']} ({m['nearest_water_body_type']}) at {m['dist_to_water_body_m']:.0f} m")
            print(f"    Protocol Action : {m['recommended_action']}\n")

    # 3. Disruption Ranking Mode
    ranked_disruptions = predictor.routing_engine.rank_road_disruption(preds, top_n=args.top)
    print(f"\n🚨 TOP {len(ranked_disruptions)} CRITICAL DISRUPTION CHOKEPOINTS (Priority Evacuation & Pump Deployment):")
    print(format_disruption_table(ranked_disruptions))

    # 4. Safe Alternate Route Mode
    if args.route:
        start_q, dest_q = args.route[0], args.route[1]
        start_coord, s_name = parse_landmark(start_q)
        dest_coord, d_name = parse_landmark(dest_q)

        if not start_coord or not dest_coord:
            print(f"\n[ROUTE ERROR] Could not resolve coordinates for '{start_q}' or '{dest_q}'.")
            print(f"  Supported landmarks: {list(KNOWN_LANDMARKS.keys())} or 'lat,lon'")
        else:
            print(f"\n🧭 SAFE ALTERNATE ROUTE PLANNER: {s_name} ➔ {d_name}")
            print("-" * 85)
            routing = predictor.routing_engine.find_safe_alternate_route(
                start_coord[0], start_coord[1],
                dest_coord[0], dest_coord[1],
                preds
            )
            if routing:
                norm = routing["normal_route"]
                safe = routing["safe_route"]
                print(f"  Standard Route : {norm['distance_km']:.2f} km | ⚠️ Flooded Segments Encountered: {norm['flooded_segments_count']}")
                if norm['flooded_segments']:
                    for seg in norm['flooded_segments']:
                        print(f"    - Blocked segment: {seg['name']} ({seg['highway']}) | P(flood) = {seg['probability_pct']:.1f}%")
                
                print(f"\n  🛡️ SAFE ALTERNATE ROUTE:")
                print(f"    Distance          : {safe['distance_km']:.2f} km (Detour: +{safe['detour_km']:.2f} km)")
                print(f"    Floods Avoided    : {safe['floods_avoided_count']} critical inundation segments safely bypassed")
                print(f"    Residual Risk     : {safe['remaining_risk_segments']} minor water pooling segments")
                print(f"    Routing Principle : Diverted along elevated ridges & high-HAND corridors.")
            else:
                print("  No route path found between specified endpoints.")

    print("\n" + "="*85)
    print("✅ PRE-DISASTER REPORT GENERATED SUCCESSFULLY.")
    print("="*85 + "\n")

if __name__ == "__main__":
    main()
