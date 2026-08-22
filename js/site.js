// js/site.js
import { SURVEY_LINES } from "./survey-data.js";

/* ---------------------------------------------------------------------------
   MAP
--------------------------------------------------------------------------- */
function initMap() {
  const allPoints = SURVEY_LINES.flatMap((l) => l.points);
  const hasPoints = allPoints.length > 0;

  // Centre on the survey area (fallback to the ROV 1 area if no points yet).
  const center = hasPoints
    ? [avg(allPoints.map((p) => p.lat)), avg(allPoints.map((p) => p.lon))]
    : [71.005, -13.275];

  const map = L.map("map", { scrollWheelZoom: false }).setView(center, 13);

  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}",
    {
      maxZoom: 13,
      attribution:
        "Tiles © Esri — Sources: GEBCO, NOAA, National Geographic, Garmin, and others"
    }
  ).addTo(map);

  const bounds = [];

  SURVEY_LINES.forEach((line) => {
    if (!line.points.length) return;

    const latlngs = line.points.map((p) => [p.lat, p.lon]);
    L.polyline(latlngs, { color: line.color, weight: 3, opacity: 0.9 }).addTo(map);

    line.points.forEach((p) => {
      bounds.push([p.lat, p.lon]);
      L.circleMarker([p.lat, p.lon], {
        radius: 6,
        color: "#04121c",
        weight: 1,
        fillColor: line.color,
        fillOpacity: 0.95
      })
        .addTo(map)
        .bindPopup(
          `<b>${line.name} · ${p.label || ""}</b><br>` +
            `Lat ${p.lat.toFixed(6)}<br>` +
            `Lon ${p.lon.toFixed(6)}<br>` +
            (p.depth ? `Depth <b>${p.depth} m</b>` : "")
        );
    });
  });

  if (bounds.length) {
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
  }

  buildSidePanel(allPoints);
}

function buildSidePanel(allPoints) {
  // Legend
  const legend = document.getElementById("legend");
  legend.innerHTML = SURVEY_LINES.map(
    (l) =>
      `<div class="legend-line"><span class="swatch" style="background:${l.color}"></span>` +
      `${l.name} <span style="color:var(--muted);font-weight:400">· ${l.points.length} pts</span></div>`
  ).join("");

  // Stats
  const depths = allPoints.map((p) => p.depth).filter(Boolean);
  document.getElementById("stat-points").textContent = allPoints.length;
  document.getElementById("stat-lines").textContent = SURVEY_LINES.filter(
    (l) => l.points.length
  ).length;
  document.getElementById("stat-deep").textContent = depths.length
    ? Math.max(...depths) + " m"
    : "—";
  document.getElementById("stat-shallow").textContent = depths.length
    ? Math.min(...depths) + " m"
    : "—";

  // Point list
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
    `<li><span style="color:var(--muted)">No points digitised yet — add them in js/survey-data.js</span></li>`;
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
   INIT
--------------------------------------------------------------------------- */
window.addEventListener("DOMContentLoaded", () => {
  initMap();
  initGallery();
});
