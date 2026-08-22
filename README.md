# GREAT Greenland ROV — Aquarius Project

A GitHub Pages site for the GREAT Greenland ROV mission, part of the **Aquarius
Project**, surveying submarine **seamounts** and **underwater volcanoes** off
Greenland.

**Live site:** https://lukegrif.github.io/GREAT-Greenland-ROV/

## What's on the page

- **Description** of the mission and the Aquarius Project.
- **Survey map** — an interactive Leaflet map of the ROV dive transects and
  position fixes (with depth).
- **ROV CAD model** — an interactive Three.js 3D viewer (embedded from `cad/`).
- **Photo gallery** — imagery from the dives.

The look and feel (blue `#0083c1`, white logo bar, blue nav/footer) matches the
main [CRIS-UL site](https://github.com/CRIS-UL/cris-ul.github.io).

## Repository layout

```
index.html            Main single-page site
favicon.ico           Site icon
css/site.css          Site styles (CRIS-UL palette)
js/site.js            Map + gallery logic
js/survey-data.js     Survey lines / coordinates (edit this to add points)
assets/               CRIS / UL logos used in the header and footer
cad/                  Embedded Three.js ROV CAD viewer
  index.html
  css/styles.css
  js/{main,viewer,config}.js
  models/DCG_PartA.glb
images/               Gallery images
  manifest.json       List of gallery photos
  placeholder-*.svg   Placeholders (replace with real photos)
.nojekyll             Serve files as-is on GitHub Pages
```

## How the map works

Each **dive** shows as a **single marker** on a zoomed-out ocean map, coloured
by the feature it surveyed — the **volcano** (the Caldera), the **seamount**,
and two glacier-carved **valleys**. Click a marker to reveal that dive's
**track** — the individual fixes travelled, each with its depth — and the map
zooms to it. An **“All locations”** button returns to the overview. The basemap
upscales its last available tiles past zoom 13, so the map is never blank when
you zoom in.

### Surveyed dives (in `js/survey-data.js`)

| Feature | Dive | Fixes |
|---|---|---|
| Volcano (Caldera) | Sides Ring | 6 |
| Volcano (Caldera) | First Dive | 4 |
| Volcano (Caldera) | Second Dive | 1 (rest cut off in notes) |
| Seamount | Western Transect | 5 |
| Glacial valley | Slope Dive | 8 |
| Glacial valley | Canyon Dive | 4 |

A few fixes were partly obscured in the field notes (Caldera Second Dive fixes,
the ROV 1 6th fix, and the Canyon “End” fix) — these are flagged in comments in
`js/survey-data.js` to be filled in once confirmed.

## How to update it

### Add or edit survey points
Edit **`js/survey-data.js`**. Each line has a name, colour and a list of
`{ lat, lon, depth, label }` points (longitude in ±180 / negative-west form).
The map, legend, stats and fix list update automatically.

### Add photos
1. Commit image files into **`images/`**.
2. Add an entry (`file` + `caption`) to **`images/manifest.json`**.

### Swap or add CAD models
Drop a `.glb` into **`cad/models/`** and add an entry in **`cad/js/config.js`**.

## Enabling GitHub Pages
In the repository **Settings → Pages**, set the source to **Deploy from a
branch**, branch **main** (or your default branch) and folder **/ (root)**.
The site is a static site — no build step required.
