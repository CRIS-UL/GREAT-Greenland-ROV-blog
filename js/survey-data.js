// js/survey-data.js
// ---------------------------------------------------------------------------
// ROV survey dives for the GREAT Greenland mission (Aquarius Project).
//
// Each object below is ONE dive and becomes ONE marker on the map. Click a
// marker to reveal that dive's track (the fixes travelled) with depths.
//
// Coordinates are decimal degrees; longitude uses the ±180 convention
// (west of Greenwich is negative). `depth` is metres below sea level and is
// optional (omit it where it wasn't recorded).
//
// `feature` labels what the dive was surveying:
//   "Volcano" (the Caldera) or "Glacial valley".
//
// A site normally has a `points` array (one track). A site can instead have
// `segments` (an array of { label, points }) to hold several dives under one
// marker — each segment's track is drawn separately. The Caldera uses this.
//
// TO ADD / EDIT: add a point to a `points` array, add a segment, or add a new
// site object. The map, legend, stats and fix list all update automatically.
// ---------------------------------------------------------------------------

export const SURVEY_LINES = [
  // ===================== VOLCANO — the Caldera (~71.02°N / 13.17°W) =========
  // All three caldera dives are merged into one site. Each dive is a
  // `segment` so its track is drawn separately (no line joining the dives).
  {
    id: "caldera",
    bg: "images/sites/caldera.jpg",
    name: "Caldera",
    feature: "Volcano",
    color: "#e8542f",
    description:
      "The underwater volcano. Combines the sides-ring survey and the first " +
      "caldera dive.",
    // Custom connections drawn on the site view. `seq` lists point labels in
    // the order to join them (labels are unique across this site's segments).
    paths: [
      {
        label: "Mountain-top outline",
        color: "#e8542f",
        seq: ["R1", "R5", "R2", "R3", "Top", "Top 2", "R4", "R6"]
      },
      {
        label: "Path travelled",
        color: "#22d3ee",
        seq: ["Start", "Mid", "Top", "Top 2"]
      }
    ],
    segments: [
      {
        label: "Sides Ring",
        points: [
          { lat: 71.02244, lon: -13.16976, depth: 457.8, label: "R1" },
          { lat: 71.02209, lon: -13.17533, depth: 443.4, label: "R2" },
          { lat: 71.02124, lon: -13.17640, depth: 449.2, label: "R3" },
          { lat: 71.01970, lon: -13.16881, depth: 450.5, label: "R4" },
          { lat: 71.02235, lon: -13.17245, depth: 440.1, label: "R5" },
          { lat: 71.02008, lon: -13.16712, depth: 483.4, label: "R6" }
        ]
      },
      {
        label: "First Dive",
        points: [
          { lat: 71.02202, lon: -13.16568, depth: 564.0, label: "Start" },
          { lat: 71.02106, lon: -13.17042, depth: 500.3, label: "Mid" },
          { lat: 71.02009, lon: -13.17508, depth: 450.0, label: "Top" },
          { lat: 71.01955, lon: -13.17153, depth: 441.9, label: "Top 2" }
        ]
      }
    ]
  },

  // ===================== GLACIAL VALLEYS (north, ~72.5°N) ===================
  {
    id: "valley-slope",
    bg: "images/sites/placeholder-valley-slope.svg",
    name: "Glacial Valley — Slope Dive",
    feature: "Glacial valley",
    color: "#2e86de",
    description:
      "Up-slope transect through a glacier-carved valley (~72.47°N / 13.8°W). " +
      "Ordered deepest-hole → up the slope.",
    points: [
      { lat: 72.47080, lon: -13.80521, depth: 939, label: "Deepest Hole" },
      { lat: 72.47183, lon: -13.80571, depth: 900, label: "Start / ROV start" },
      { lat: 72.47289, lon: -13.80570, depth: 852, label: "Boulder" },
      { lat: 72.47384, lon: -13.81380, depth: 840, label: "Start Slope" },
      { lat: 72.47489, lon: -13.82100, depth: 759, label: "Middle Slope" },
      { lat: 72.47669, lon: -13.82944, depth: 615, label: "Top Slope" },
      { lat: 72.47712, lon: -13.83133, label: "ROV end" },
      { lat: 72.47882, lon: -13.83272, depth: 593, label: "End Slope" }
    ]
  },
  {
    id: "valley-canyon",
    bg: "images/sites/placeholder-valley-canyon.svg",
    name: "Glacial Valley — Canyon Dive",
    feature: "Glacial valley",
    color: "#6c5ce7",
    description:
      "Canyon (glacier-carved valley) dive, ~72.50°N / 14.1°W.",
    points: [
      { lat: 72.50788, lon: -14.11005, depth: 857.2, label: "Start" },
      { lat: 72.50310, lon: -14.10173, depth: 644.5, label: "Mid Canyon" },
      { lat: 72.50107, lon: -14.10728, label: "Extra point" },
      { lat: 72.49837, lon: -14.11115, depth: 432.6, label: "Top Canyon" },
      { lat: 72.49577, lon: -14.10692, depth: 453.9, label: "End" }
    ]
  },

  // ===================== ISOLATED SEAMOUNT (~72.39°N / 15.64°W) =============
  {
    id: "seamount",
    bg: "images/sites/placeholder-seamount.svg",
    name: "Isolated Seamount",
    feature: "Seamount",
    color: "#f5a623",
    description:
      "Isolated seamount rising from ~1157 m at its base to ~658 m at the " +
      "summit. Endpoint was not recorded.",
    points: [
      { lat: 72.394833, lon: -15.642150, depth: 1157, label: "Start" },
      { lat: 72.385317, lon: -15.634700, label: "Wall" },
      { lat: 72.382733, lon: -15.633633, depth: 658, label: "Top" }
      // Deepest 1157 m at Start, shallowest 658 m at Top (summit); Wall depth
      // not recorded. Endpoint: not recorded.
    ]
  },

  // ===================== FAULT LINE (west, ~71.00°N / 13.27°W) ==============
  {
    id: "fault-line",
    bg: "images/sites/placeholder-fault-line.svg",
    name: "Fault Line",
    feature: "Fault line",
    color: "#16a085",
    description: "A fault line surveyed west of the caldera (~71.00°N / 13.27°W).",
    points: [
      { lat: 71.00393333, lon: -13.26673333, depth: 685, label: "1 (Start)" },
      { lat: 71.00463333, lon: -13.27271667, depth: 506, label: "2" },
      { lat: 71.00456667, lon: -13.27468333, depth: 520, label: "3" },
      { lat: 71.00460000, lon: -13.27693333, depth: 485, label: "4" },
      { lat: 71.00585000, lon: -13.28128333, depth: 401, label: "5" },
      { lat: 71.00583333, lon: -13.28800000, depth: 413, label: "6" }
    ]
  }
];
