# Spatial TME Portal

An iTIME-inspired research data portal for interactive exploration and contribution of
spatial biology and tumor microenvironment datasets.

## What is included

- Visual-first landing page centered on an interactive spatial tissue viewer
- Public dataset explorer with search, cancer type, technique, and date filters
- Dataset detail pages with marker selection, heatmap overlays, region annotations,
  layer toggles, zoom controls, metadata, sharing, and collaborator notes
- Guided contribution flow for CSV/GeoJSON/JSON uploads, column mapping, metadata,
  file validation, and visualization-ready dataset creation
- Role-aware user experience for Admin, Researcher, and Viewer accounts
- Side-by-side comparison view with shared visualization controls and composition bars
- Data management dashboards for user submissions and admin moderation

The current implementation is a Vite + React + TypeScript single-page application.
Datasets and demo accounts are persisted in `localStorage`, with code structured so
the storage layer can later be replaced by a FastAPI/PostGIS service and a tile-based
rendering API for very large datasets.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Production backend notes

For a deployed research portal, the frontend flow should be paired with:

- Secure authentication and authorization with server-issued sessions
- File scanning, type validation, and isolated import workers
- PostGIS-backed metadata and geometry storage
- Object storage for raw uploads and processed artifacts
- Optimized JSON, vector tile, or binary tile responses for high-volume spatial rendering
- Audit logs for dataset publishing, sharing, edits, and deletion
