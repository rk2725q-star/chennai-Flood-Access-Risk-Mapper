# Chennai Flood Access Risk Mapper

An interactive Geographic Information System (GIS) and crisis response dashboard built to visualize flood inundation zones, analyze emergency route accessibility, track critical lifeline facilities (hospitals, relief shelters, subway closures), and simulate reservoir discharge impacts across Greater Chennai.

---

## Key Capabilities

1. **Interactive Chennai Flood GIS Map**
   - **Vulnerability Polygons**: Visualizes flood hazard zones across North, Central, and South Chennai (Velachery, Mudichur, Madipakkam, Vyasarpadi, Saidapet, Perumbakkam, Kolathur, T. Nagar, Manali).
   - **Drainage Basins & Waterways**: Traces the Adyar River, Cooum River, Buckingham Canal, and Pallikaranai Marshland with active flood stage indicators.
   - **Layer Controls**: Toggle flood polygons, river systems, hospital/shelter facilities, submerged subways, and citizen field reports.
   - **Map Themes**: Switch between Dark GIS, Clean Light, and Street Map modes.

2. **Emergency Access Route Planner**
   - Compares routes from isolated residential neighborhoods to emergency trauma centers (e.g., Velachery to Apollo Greams Road, Mudichur to Tambaram Hospital).
   - Computes **Safety Index Scores (%)**, travel times, and maximum water depth encountered.
   - Recommends elevated detours (such as Anna Salai / Outer Ring Road flyovers) to bypass submerged underpasses and low-lying river approaches.

3. **Submerged Subway & Road Closure Monitoring**
   - Real-time tracking of critical flood-prone underpasses (Gengu Reddy Subway, Madley Subway, Duraisamy Subway, Vyasarpadi Ganesapuram Subway, Thillai Ganga Nagar Subway) with exact water depth readings and alternate bypass routes.

4. **Hydro Surge & Reservoir Simulator**
   - Model the cascading flood impact of 24-hour rainfall (50mm to 350mm+) and surplus discharges from **Chembarambakkam Lake** (up to 28,000 cusecs) and **Red Hills / Puzhal Lake**.
   - Simulates river crest heights, embankment breach alerts, and dynamic expansion of inundation zones.

5. **Citizen Field SOS & Incident Reporting**
   - Field volunteers and residents can report stranded families, requests for inflatable rescue boats, localized waterlogging, or drinking water shortages with geo-coordinates.

6. **Emergency Directory**
   - Quick one-click dial directory for Greater Chennai Corporation (GCC 1913), Disaster Management (1070/1077), Ambulance (108), Fire & Boat Rescue (101), and Chennai Metro Water tankers.

---

## Technical Stack

- **Frontend**: React 18, TypeScript, Vite
- **Mapping & GIS**: Leaflet (Custom SVG DivIcons, CartoDB tile layers, OpenStreetMap)
- **Styling**: Tailwind CSS, Lucide React icons, Motion animations
