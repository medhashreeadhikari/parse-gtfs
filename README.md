# Parse GTFS

Converts [GTFS](https://gtfs.org/) static data (zip files) into optimized JSON files for cityscale-frontend [GTFS Explorer](https://react-app.cityscale.turner-engineering.com/admin/gtfs-explorer). Produces routes, shapes, stops, and agency metadata.

## Setup

You will need Node.js installed. Then:

1. create `data` folder with subfolders: `raw`, `extracted`, `parsed`, `dist`
2. run `npm install`

## Usage

1. download a GTFS static zip file into `data/raw`
2. rename it with a short lowercase agency id (e.g. `lacmta`, `octa`, `sfmta`)
3. in `main.js`, add the id to `const agencies = [...]`
4. run `node main.js`
5. copy `data/dist/{id}/` to `cityscale-frontend/src/data/gtfs/{id}/`

Full list of agency IDs is in `cityscale.gtfs_agencies`.

## What the parser does

We want to show routes and stops on GTFS Explorer. GTFS static data stores this across ~17 CSV-like `.txt` files with no direct route→stops or route→shapes relationships, plus a lot of schedule data we don't need. This repo drops everything unnecessary and creates direct mappings used to plot routes and stops.

Steps:

1. **Convert txt to JSON** — parses each `.txt` file to JSON (only files in the GTFS spec, ignoring vendor extras)
2. **Simplify shapes** — sorts by shape_id + sequence, keeps only `shape_id`, `shape_pt_lat`, `shape_pt_lon`
3. **Map routes to stops** — joins routes → trips → stop_times → stops to produce a flat `route_id → stops[]` mapping, keeping only `stop_id`, `stop_name`, `stop_lat`, `stop_lon`
4. **Map routes to shape IDs** — joins routes → trips to get unique shape_ids per route
5. **Compute route centers** — calculates center lat/lon for each route from its stops' bounding box midpoint, adds `route_lat`/`route_lon` to routes.json
6. **Map trip IDs to route IDs** — creates a `trip_id → route_id` lookup (used for realtime vehicle matching)

## Output files

- `agency.json` — agency metadata (straight from GTFS, no changes)
- `routes.json` — all route fields + added `route_lat`/`route_lon` center
- `shapes.json` — simplified to just id, lat, lon (sorted)
- `routesWithStops.json` — route_id → stops with id, name, lat, lon
- `routesWithShapeIds.json` — route_id → unique shape_ids
