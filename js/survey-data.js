// js/survey-data.js
// ---------------------------------------------------------------------------
// ROV survey lines for the GREAT Greenland mission (Aquarius Project).
//
// Coordinates are decimal degrees. Longitude uses the ±180 convention
// (west of Greenwich is negative). `depth` is metres below sea level.
//
// TO ADD MORE POINTS OR LINES:
//   1. Add an object to the `points` array of an existing line, or
//   2. Add a new line object to `SURVEY_LINES`.
// The map, the point list and the stats all update automatically.
// ---------------------------------------------------------------------------

export const SURVEY_LINES = [
  {
    id: "rov1",
    name: "ROV 1",
    color: "#ff5a3c",
    description: "Western seamount flank — deep to shallow transect (~71.00°N / 13.27°W).",
    points: [
      { lat: 71.00393333, lon: -13.26673333, depth: 685, label: "R1-1" },
      { lat: 71.00463333, lon: -13.27271667, depth: 506, label: "R1-2" },
      { lat: 71.00456667, lon: -13.27468333, depth: 520, label: "R1-3" },
      { lat: 71.00460000, lon: -13.27693333, depth: 485, label: "R1-4" },
      { lat: 71.00585000, lon: -13.28128333, depth: 401, label: "R1-5" }
      // R1-6 (71.00583333, ~-13.28x, 413 m) — longitude digit was cut off
      // in the field sheet; add it here once confirmed.
    ]
  },
  {
    id: "rov2",
    name: "ROV 2",
    color: "#3c7bff",
    description: "Second transect (~71.02°N / 13.10°W). Add points below once digitised.",
    points: [
      // Example row — replace with the real ROV 2 fixes:
      // { lat: 71.02000000, lon: -13.10000000, depth: 0, label: "R2-1" },
    ]
  }
];
