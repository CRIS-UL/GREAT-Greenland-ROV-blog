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
//   "Volcano" (the Caldera), "Seamount" (the mount), "Glacial valley".
//
// TO ADD / EDIT: add a point to a dive's `points`, or add a new dive object.
// The map, legend, stats and fix list all update automatically.
// ---------------------------------------------------------------------------

export const SURVEY_LINES = [
  // ===================== VOLCANO — the Caldera (~71.02°N / 13.17°W) =========
  {
    id: "caldera-ring",
    name: "Caldera — Sides Ring",
    feature: "Volcano",
    color: "#e8542f",
    description: "Ring of fixes around the caldera rim of the underwater volcano.",
    points: [
      { lat: 71.02244, lon: -13.16976, depth: 457.8, label: "1" },
      { lat: 71.02209, lon: -13.17533, depth: 443.4, label: "2" },
      { lat: 71.02124, lon: -13.17640, depth: 449.2, label: "3" },
      { lat: 71.01970, lon: -13.16881, depth: 450.5, label: "4" },
      { lat: 71.02235, lon: -13.17245, depth: 440.1, label: "5" },
      { lat: 71.02008, lon: -13.16712, depth: 483.4, label: "6" }
    ]
  },
  {
    id: "caldera-first",
    name: "Caldera — First Dive",
    feature: "Volcano",
    color: "#f39c12",
    description: "First dive on the caldera, deep start climbing up the flank.",
    points: [
      { lat: 71.02202, lon: -13.16568, depth: 564.0, label: "Start" },
      { lat: 71.02106, lon: -13.17042, depth: 500.3, label: "Mid" },
      { lat: 71.02009, lon: -13.17508, depth: 450.0, label: "Top" },
      { lat: 71.01955, lon: -13.17153, depth: 441.9, label: "Top 2" }
    ]
  },
  {
    id: "caldera-second",
    name: "Caldera — Second Dive",
    feature: "Volcano",
    color: "#c0392b",
    description:
      "Second caldera dive, ~1.8 km north of the ring. Only the first fix was " +
      "legible in the field sheet — add the rest here once digitised.",
    points: [
      { lat: 71.03997, lon: -13.16065, depth: 464.9, label: "Mid bot" }
      // Remaining Second-dive fixes were cut off in the notes — add them here.
    ]
  },

  // ===================== SEAMOUNT — the mount (~71.00°N / 13.27°W) ==========
  {
    id: "seamount-rov1",
    name: "Seamount — Western Transect",
    feature: "Seamount",
    color: "#16a085",
    description: "Deep-to-shallow transect up the seamount flank, west of the caldera.",
    points: [
      { lat: 71.00393333, lon: -13.26673333, depth: 685, label: "1" },
      { lat: 71.00463333, lon: -13.27271667, depth: 506, label: "2" },
      { lat: 71.00456667, lon: -13.27468333, depth: 520, label: "3" },
      { lat: 71.00460000, lon: -13.27693333, depth: 485, label: "4" },
      { lat: 71.00585000, lon: -13.28128333, depth: 401, label: "5" }
      // A 6th fix (71.00583333, ~-13.28x, 413 m) had its longitude digit cut
      // off in the field sheet — add it here once confirmed.
    ]
  },

  // ===================== GLACIAL VALLEYS (north, ~72.5°N) ===================
  {
    id: "valley-slope",
    name: "Glacial Valley — Slope Dive",
    feature: "Glacial valley",
    color: "#2e86de",
    description:
      "Up-slope transect through a glacier-carved valley (~72.47°N / 13.8°W). " +
      "Ordered deepest-hole → up the slope. Depths were not captured in the notes.",
    points: [
      { lat: 72.47080, lon: -13.80521, label: "Deepest Hole" },
      { lat: 72.47183, lon: -13.80571, label: "Start / ROV start" },
      { lat: 72.47289, lon: -13.80570, label: "Boulder" },
      { lat: 72.47384, lon: -13.81380, label: "Start Slope" },
      { lat: 72.47489, lon: -13.82100, label: "Middle Slope" },
      { lat: 72.47669, lon: -13.82944, label: "Top Slope" },
      { lat: 72.47712, lon: -13.83133, label: "ROV end" },
      { lat: 72.47882, lon: -13.83272, label: "End Slope" }
    ]
  },
  {
    id: "valley-canyon",
    name: "Glacial Valley — Canyon Dive",
    feature: "Glacial valley",
    color: "#6c5ce7",
    description:
      "Canyon (glacier-carved valley) dive, ~72.50°N / 14.1°W. Depths were not " +
      "recorded for most fixes.",
    points: [
      { lat: 72.50788, lon: -14.11005, label: "Start" },
      { lat: 72.50310, lon: -14.10173, label: "Mid Canyon" },
      { lat: 72.50107, lon: -14.10728, label: "Extra point" },
      { lat: 72.49837, lon: -14.11115, label: "Top Canyon" }
      // "End" fix (~72.4_577, -14.10692) had a latitude digit hidden behind the
      // scroll arrow in the notes — add it here once confirmed.
    ]
  }
];
