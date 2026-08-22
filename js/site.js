// js/site.js
import { SURVEY_LINES } from "./survey-data.js";

/* ---------------------------------------------------------------------------
   MAP
   - Single "location" marker per survey line (zoomed-out overview).
   - Click a marker to reveal the dive track (the fixes we travelled) + zoom in.
   - "All locations" button returns to the overview.
--------------------------------------------------------------------------- */
const OVERVIEW_MAX_ZOOM = 9;   // how far in the overview is allowed to zoom
const TRACK_MAX_ZOOM = 13;     // how far in a single track zooms
const NATIVE_MAX_ZOOM = 13;    // last zoom the ocean basemap actually has tiles for

let map;
let overviewMarkers = [];
let detailLayers = [];         // polyline + fix markers currently shown
let backControl = null;

function linesWithPoints() {
  return SURVEY_LINES.filter((l) => l.points && l.points.length);
}

function centroid(points) {
  return [
    avg(points.map((p) => p.lat)),
    avg(points.map((p) => p.lon))
  ];
}

function initMap() {
  if (typeof L === "undefined") {
    const el = document.getElementById("map");
    if (el) {
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.padding = "20px";
      el.style.textAlign = "center";
      el.style.color = "#6a7178";
      el.innerHTML =
        "The map library could not be loaded (no network). " +
        "The survey fixes are listed in the panel on the right.";
    }
    return;
  }

  const fallbackCenter = [71.005, -13.275];

  map = L.map("map", {
    scrollWheelZoom: false,
    minZoom: 3,
    maxZoom: 18
  }).setView(fallbackCenter, OVERVIEW_MAX_ZOOM);

  // Ocean basemap. maxNativeZoom lets Leaflet UPSCALE the last real tile
  // instead of showing blank tiles when the user zooms past the source's
  // coverage — so the map is never empty.
  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}",
    {
      maxNativeZoom: NATIVE_MAX_ZOOM,
      maxZoom: 18,
      attribution:
        "Tiles © Esri — GEBCO, NOAA, National Geographic, Garmin and others"
    }
  ).addTo(map);

  // Place-name / reference labels on top (also upscaled past native zoom).
  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}",
    { maxNativeZoom: NATIVE_MAX_ZOOM, maxZoom: 18 }
  ).addTo(map);

  showOverview(true);
}

/* ---------- Overview: one marker per location ---------- */
function showOverview(initial = false) {
  clearDetail();
  removeBackControl();

  const lines = linesWithPoints();
  const centers = [];

  lines.forEach((line) => {
    const c = centroid(line.points);
    centers.push(c);

    const icon = L.divIcon({
      className: "",
      html:
        `<div class="loc-pin" style="background:${line.color}">` +
        `📍 ${line.name} · ${line.points.length} fixes</div>`,
      iconSize: null,
      iconAnchor: [0, 0]
    });

    const marker = L.marker(c, { icon }).addTo(map);
    marker.on("click", () => expandLine(line));
    marker.bindTooltip("Click to view the dive track", { direction: "top" });
    overviewMarkers.push(marker);
  });

  setHint("Tip: click a location marker to open its dive track.");

  if (!initial) {
    if (centers.length > 1) {
      map.fitBounds(centers, { padding: [60, 60], maxZoom: OVERVIEW_MAX_ZOOM });
    } else if (centers.length === 1) {
      map.setView(centers[0], OVERVIEW_MAX_ZOOM);
    }
  } else if (centers.length) {
    // Initial load: start zoomed out and centred on the survey area.
    if (centers.length > 1) {
      map.fitBounds(centers, { padding: [60, 60], maxZoom: OVERVIEW_MAX_ZOOM });
    } else {
      map.setView(centers[0], OVERVIEW_MAX_ZOOM);
    }
  }
}

/* ---------- Detail: the fixes we travelled for one location ---------- */
function expandLine(line) {
  // Hide overview markers.
  overviewMarkers.forEach((m) => map.removeLayer(m));
  overviewMarkers = [];
  clearDetail();

  const latlngs = line.points.map((p) => [p.lat, p.lon]);

  const poly = L.polyline(latlngs, {
    color: line.color,
    weight: 3,
    opacity: 0.9
  }).addTo(map);
  detailLayers.push(poly);

  line.points.forEach((p, i) => {
    const marker = L.circleMarker([p.lat, p.lon], {
      radius: 6,
      color: "#ffffff",
      weight: 2,
      fillColor: line.color,
      fillOpacity: 0.95
    })
      .addTo(map)
      .bindPopup(
        `<b>${line.name} · ${p.label || "fix " + (i + 1)}</b><br>` +
          `Lat ${p.lat.toFixed(6)}<br>` +
          `Lon ${p.lon.toFixed(6)}<br>` +
          (p.depth ? `Depth <b>${p.depth} m</b>` : "")
      );
    detailLayers.push(marker);
  });

  map.fitBounds(latlngs, { padding: [50, 50], maxZoom: TRACK_MAX_ZOOM });
  setHint(`Showing <b>${line.name}</b> — ${line.points.length} fixes travelled.`);
  addBackControl();
}

function clearDetail() {
  detailLayers.forEach((l) => map.removeLayer(l));
  detailLayers = [];
}

/* ---------- "All locations" button ---------- */
function addBackControl() {
  removeBackControl();
  const ctrl = L.control({ position: "topright" });
  ctrl.onAdd = function () {
    const div = L.DomUtil.create("div");
    div.innerHTML =
      '<button class="map-back-btn">← All locations</button>';
    L.DomEvent.disableClickPropagation(div);
    div.querySelector("button").addEventListener("click", () => showOverview(false));
    return div;
  };
  ctrl.addTo(map);
  backControl = ctrl;
}

function removeBackControl() {
  if (backControl) {
    map.removeControl(backControl);
    backControl = null;
  }
}

function setHint(html) {
  const el = document.getElementById("map-hint");
  if (el) el.innerHTML = html;
}

/* ---------- Side panel (legend, stats, fix list) ---------- */
function buildSidePanel() {
  const allPoints = SURVEY_LINES.flatMap((l) => l.points);

  const legend = document.getElementById("legend");
  legend.innerHTML = SURVEY_LINES.map(
    (l) =>
      `<div class="legend-line"><span class="swatch" style="background:${l.color}"></span>` +
      `${l.name} <span style="color:var(--muted);font-weight:normal">· ${l.points.length} fixes</span></div>`
  ).join("");

  const depths = allPoints.map((p) => p.depth).filter(Boolean);
  document.getElementById("stat-points").textContent = allPoints.length;
  document.getElementById("stat-lines").textContent = linesWithPoints().length;
  document.getElementById("stat-deep").textContent = depths.length
    ? Math.max(...depths) + " m"
    : "—";
  document.getElementById("stat-shallow").textContent = depths.length
    ? Math.min(...depths) + " m"
    : "—";

  const list = document.getElementById("pt-list");
  const rows = SURVEY_LINES.flatMap((l) =>
    l.points.map(
      (p) =>
        `<li><span>${l.name} ${p.label || ""}</span>` +
        `<span class="d">${p.depth ? p.depth + " m" : ""}</span></li>`
    )
  );
  list.innerHTML =
    rows.join("") ||
    `<li><span style="color:var(--muted)">No fixes digitised yet — add them in js/survey-data.js</span></li>`;
}

function avg(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/* ---------------------------------------------------------------------------
   GALLERY
--------------------------------------------------------------------------- */
async function initGallery() {
  const grid = document.getElementById("gallery");
  try {
    const res = await fetch("images/manifest.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("manifest not found");
    const data = await res.json();
    const photos = (data.photos || []).filter((p) => p && p.file);

    if (!photos.length) {
      grid.outerHTML =
        '<div class="gallery-empty">No photos yet. Add images to <code>images/</code> and list them in <code>images/manifest.json</code>.</div>';
      return;
    }

    grid.innerHTML = photos
      .map(
        (p) =>
          `<figure class="shot">` +
          `<img src="images/${p.file}" alt="${escapeHtml(p.caption || p.file)}" loading="lazy">` +
          `<figcaption>${escapeHtml(p.caption || "")}</figcaption></figure>`
      )
      .join("");
  } catch (err) {
    grid.outerHTML =
      '<div class="gallery-empty">Could not load the gallery manifest. Check <code>images/manifest.json</code>.</div>';
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

/* ---------------------------------------------------------------------------
   NAV — active link on scroll
--------------------------------------------------------------------------- */
function initNavSpy() {
  const links = Array.from(document.querySelectorAll(".nav-item"));
  const byId = {};
  links.forEach((a) => {
    const id = a.getAttribute("href").slice(1);
    if (id) byId[id] = a;
  });
  const sections = Object.keys(byId)
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((l) => l.classList.remove("active"));
          const a = byId[e.target.id];
          if (a) a.classList.add("active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((s) => obs.observe(s));
}

/* ---------------------------------------------------------------------------
   INIT
--------------------------------------------------------------------------- */
window.addEventListener("DOMContentLoaded", () => {
  buildSidePanel();       // stats + fix list, independent of the map/network
  try {
    initMap();
  } catch (err) {
    console.error("Map init failed:", err);
  }
  initGallery();
  initNavSpy();
});
