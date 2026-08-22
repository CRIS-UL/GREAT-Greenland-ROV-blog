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

The interactive map opens framed on the **Greenland–Iceland** area
(`REGION_FIT` in `js/site.js`) and is bounded (`REGION_MAX_BOUNDS`) so you can
pan **east and south to the top of Europe** (British Isles, Scandinavia) but
can't roam out to the rest of the world.

Each **dive** shows as a **single marker**, coloured by the feature it surveyed
— the **volcano** (the Caldera), the **seamount**, and two glacier-carved
**valleys**. Clicking a marker (or a row in the legend) opens a **site view**:
the dive's **bathymetry image** fills the frame and the fixes are plotted and
fixed in place over it, joined by the dive track, each labelled with its depth.
The **“All sites”** button returns to the region map.

### Site background images (`images/sites/`)

Each dive points at a background image via its `bg` field in
`js/survey-data.js`:

- **Caldera** dives → `images/sites/caldera.jpg` (the real bathymetry render).
- **Seamount** and the two **valleys** → placeholder SVGs
  (`placeholder-seamount.svg`, `placeholder-valley-slope.svg`,
  `placeholder-valley-canyon.svg`). Replace these with the real renders when
  available (keep the filenames, or update the `bg` paths).

The fixes are fitted to the image frame (relative geometry preserved,
north-up); they are not georeferenced to the image, since the renders aren't
geotagged.

### Surveyed sites (in `js/survey-data.js`)

| Site (marker) | Feature | Fixes |
|---|---|---|
| **Caldera** (Sides Ring + First Dive as segments) | Volcano | 10 |
| Glacial Valley — Slope Dive | Glacial valley | 8 |
| Glacial Valley — Canyon Dive | Glacial valley | 4 |

The Caldera dives are merged into one site: each is a `segment` so its track
draws separately under a single Caldera marker.

The Canyon “End” fix was partly obscured in the field notes — it is flagged in
a comment in `js/survey-data.js` to be filled in once confirmed.

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
