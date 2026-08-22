// js/site.js
import { SURVEY_LINES } from "./survey-data.js";

/* ---------------------------------------------------------------------------
   MAP
   - The interactive map is locked to the Greenland–Iceland region so the sites
     sit in context and you can't roam to the rest of the world.
   - One marker per dive. Clicking a marker opens a static "site view": the
     dive's bathymetry image with its fixes fixed in place over it. A back
     button returns to the region map.
--------------------------------------------------------------------------- */
const NATIVE_MAX_ZOOM = 13; // last zoom the ocean basemap has real tiles for

// The window the map is locked to (roughly east Greenland → Iceland → sites).
const REGION_FIT = [
  [62.0, -40.0],
  [73.8, -7.0]
];
const REGION_MAX_BOUNDS = [
  [58.0, -52.0],
  [77.0, 3.0]
];

let map;
let overviewMarkers = [];
let currentSite = null;

function linesWithPoints() {
  return SURVEY_LINES.filter((l) => l.points && l.points.length);
}

function centroid(points) {
  return [avg(points.map((p) => p.lat)), avg(points.map((p) => p.lon))];
}

function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const la1 = (a[0] * Math.PI) / 180;
  const la2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Group dives whose centroids are within `thresholdKm` and return a Map of
// line.id -> index within its cluster (so their labels stack instead of
// hiding each other at the zoomed-out region scale).
function assignStacks(entries, thresholdKm = 25) {
  const idx = new Map();
  const used = new Array(entries.length).fill(false);
  for (let i = 0; i < entries.length; i++) {
    if (used[i]) continue;
    const group = [i];
    used[i] = true;
    for (let j = i + 1; j < entries.length; j++) {
      if (used[j]) continue;
      if (haversineKm(entries[i].c, entries[j].c) < thresholdKm) {
        group.push(j);
        used[j] = true;
      }
    }
    group.forEach((gi, k) => idx.set(entries[gi].line.id, k));
  }
  return idx;
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
        "Click a dive in the list, or the fixes are shown on the right.";
    }
    return;
  }

  map = L.map("map", {
    scrollWheelZoom: false,
    maxBounds: REGION_MAX_BOUNDS,
    maxBoundsViscosity: 1.0,
    minZoom: 4,
    maxZoom: 18
  });

  // Ocean basemap. maxNativeZoom lets Leaflet UPSCALE the last real tile
  // instead of showing blank tiles when zoomed past the source's coverage.
  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}",
    {
      maxNativeZoom: NATIVE_MAX_ZOOM,
      maxZoom: 18,
      attribution:
        "Tiles © Esri — GEBCO, NOAA, National Geographic, Garmin and others"
    }
  ).addTo(map);

  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}",
    { maxNativeZoom: NATIVE_MAX_ZOOM, maxZoom: 18 }
  ).addTo(map);

  map.fitBounds(REGION_FIT);
  // Lock zoom-out at the region framing — can't reach the rest of the world.
  map.setMinZoom(map.getZoom());

  buildOverview();

  const back = document.getElementById("siteview-back");
  if (back) back.addEventListener("click", closeSiteView);
}

/* ---------- Region overview: one marker per dive ---------- */
function buildOverview() {
  overviewMarkers.forEach((m) => map.removeLayer(m));
  overviewMarkers = [];

  const lines = linesWithPoints();
  const entries = lines.map((line) => ({ line, c: centroid(line.points) }));
  const stack = assignStacks(entries);

  entries.forEach(({ line, c }) => {
    const idx = stack.get(line.id) || 0;
    const icon = L.divIcon({
      className: "loc-pin-wrap",
      html:
        `<div class="loc-pin" style="background:${line.color}">` +
        `📍 ${line.name} · ${fixes(line.points.length)}</div>`,
      iconSize: null,
      iconAnchor: [-12, 10 + idx * 30]
    });
    const marker = L.marker(c, { icon }).addTo(map);
    marker.on("click", () => openSiteView(line));
    marker.bindTooltip(`${line.feature || "Dive"} — open dive`, {
      direction: "top"
    });
    overviewMarkers.push(marker);
  });

  setHint("Tip: click a site marker to open its dive over the bathymetry.");
}

/* ---------- Site view: bathymetry image + fixed points ---------- */
function openSiteView(line) {
  const sv = document.getElementById("siteview");
  const img = document.getElementById("siteview-img");
  const svg = document.getElementById("siteview-svg");
  const title = document.getElementById("siteview-title");
  if (!sv || !img || !svg || !title) return;

  currentSite = line;
  img.src = line.bg || "";
  img.alt = line.name + " bathymetry";
  title.innerHTML =
    `${escapeHtml(line.name)}` +
    `<span>${escapeHtml(line.feature || "Dive")} · ${fixes(line.points.length)}</span>`;

  sv.hidden = false;
  // Render after layout so the SVG has its pixel size.
  requestAnimationFrame(() => renderSiteSvg(line, svg));
  setHint(`Viewing <b>${escapeHtml(line.name)}</b>. Use “All sites” to return.`);
}

function closeSiteView() {
  const sv = document.getElementById("siteview");
  if (sv) sv.hidden = true;
  currentSite = null;
  if (map) map.invalidateSize();
  setHint("Tip: click a site marker to open its dive over the bathymetry.");
}

// Map the dive's fixes into the image area, preserving relative geometry
// (with a cos(lat) correction) and north-up orientation.
function layoutPoints(points, W, H, pad) {
  const lats = points.map((p) => p.lat);
  const lons = points.map((p) => p.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const k = Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180));
  const geoW = Math.max((maxLon - minLon) * k, 1e-9);
  const geoH = Math.max(maxLat - minLat, 1e-9);
  const availW = Math.max(W - 2 * pad, 10);
  const availH = Math.max(H - 2 * pad, 10);
  const scale = Math.min(availW / geoW, availH / geoH);
  const drawW = geoW * scale;
  const drawH = geoH * scale;
  const offX = (W - drawW) / 2;
  const offY = (H - drawH) / 2;
  return points.map((p) => ({
    p,
    x: offX + (p.lon - minLon) * k * scale,
    y: offY + (maxLat - p.lat) * scale
  }));
}

function renderSiteSvg(line, svg) {
  const host = svg.parentElement;
  const W = svg.clientWidth || host.clientWidth || 600;
  const H = svg.clientHeight || host.clientHeight || 480;
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

  const pts = layoutPoints(line.points, W, H, 64);
  const poly = pts.map((o) => `${o.x.toFixed(1)},${o.y.toFixed(1)}`).join(" ");

  let html = "";
  if (pts.length > 1) {
    html +=
      `<polyline points="${poly}" fill="none" stroke="rgba(0,0,0,0.55)" ` +
      `stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>`;
    html +=
      `<polyline points="${poly}" fill="none" stroke="${line.color}" ` +
      `stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>`;
  }
  pts.forEach((o, i) => {
    const p = o.p;
    const name = p.label || "fix " + (i + 1);
    const depthTxt = p.depth ? ` · ${p.depth} m` : "";
    html +=
      `<circle cx="${o.x.toFixed(1)}" cy="${o.y.toFixed(1)}" r="6.5" ` +
      `fill="${line.color}" stroke="#fff" stroke-width="2">` +
      `<title>${escapeHtml(name)}${escapeHtml(depthTxt)} — ` +
      `${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}</title></circle>`;
    html +=
      `<text class="sv-label" x="${(o.x + 11).toFixed(1)}" ` +
      `y="${(o.y + 4).toFixed(1)}">${escapeHtml(name)}` +
      `<tspan class="sv-depth">${escapeHtml(depthTxt)}</tspan></text>`;
  });
  svg.innerHTML = html;
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
      `<div class="legend-line" data-id="${l.id}" role="button" tabindex="0" title="Open ${escapeHtml(l.name)}">` +
      `<span class="swatch" style="background:${l.color}"></span>` +
      `<span class="legend-text">${escapeHtml(l.name)}` +
      `<span class="legend-sub">${escapeHtml(l.feature || "")} · ${fixes(l.points.length)}</span></span></div>`
  ).join("");
  // Let the legend rows open a site too (works even without the map).
  legend.querySelectorAll(".legend-line").forEach((row) => {
    const line = SURVEY_LINES.find((l) => l.id === row.dataset.id);
    if (!line) return;
    const open = () => openSiteView(line);
    row.addEventListener("click", open);
    row.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });

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
        `<li><span>${escapeHtml(l.name)} ${escapeHtml(p.label || "")}</span>` +
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

function fixes(n) {
  return n + (n === 1 ? " fix" : " fixes");
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
  buildSidePanel(); // stats + fix list + clickable legend, independent of the map
  try {
    initMap();
  } catch (err) {
    console.error("Map init failed:", err);
  }
  initGallery();
  initNavSpy();
});

// Re-fit the current site view on resize.
window.addEventListener("resize", () => {
  if (currentSite) {
    const svg = document.getElementById("siteview-svg");
    if (svg) renderSiteSvg(currentSite, svg);
  }
});
