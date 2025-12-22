# Walkingtube Implementation Plan (Inferred)

## Project Overview
Walkingtube is a location-based video sharing platform where users can discover and share YouTube videos tied to specific real-world locations.

## Core Features
1. **Interactive Map**:
   - Display a global map (likely using Google Maps or Leaflet/Mapbox).
   - Show markers for video locations.
2. **Video Management**:
   - Users can add YouTube videos to the map.
   - Metadata includes: Title, YouTube ID, Description, Location Name, Latitude/Longitude.
3. **Video Playback**:
   - Click a marker to view video details and play the video (likely in a modal).
4. **Authentication**:
   - User authentication via Supabase Auth.
   - Users can only manage their own videos.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS
- **Backend/Database**: Supabase (PostgreSQL, Auth)
- **Map Integration**: Mapbox GL JS (via `react-map-gl`)
- **State Management**: React Context or similar (if needed)

## Current Status
- [x] Next.js Project Initialized
- [x] Database Schema Defined (`videos` table)
- [x] Git Repository Configured
- [x] Map Component Basic Implementation (Mapbox)
- [x] Supabase Client Configured
- [x] Connect Map to Real Data (Supabase)
- [ ] Authentication Flow
- [ ] Video Addition UI

## Next Steps
1.  **Frontend Setup**: Install necessary map libraries (e.g., `react-leaflet` or `@react-google-maps/api`).
2.  **Supabase Integration**: Set up the Supabase client and environment variables.
3.  **Map Feature**: Implement the main map view with clustering or markers.
4.  **Add Video Feature**: Create a form to input video details and pick a location.
