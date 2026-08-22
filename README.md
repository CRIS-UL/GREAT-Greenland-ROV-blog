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

## Repository layout

```
index.html            Main single-page site
css/site.css          Site styles
js/site.js            Map + gallery logic
js/survey-data.js     Survey lines / coordinates (edit this to add points)
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
