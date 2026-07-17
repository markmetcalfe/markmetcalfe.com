#!/usr/bin/env node
// One-time/occasional data-prep step -- not part of the app build.
// Regenerates public/countries.geojson from Natural Earth's
// 1:10m admin-0 countries dataset. Run with:
//   node web/modules/countries/scripts/build-countries-geojson.mjs
//
// Every landmass in the source (not just our 197 guessable countries)
// is kept, so non-guessable territory (Greenland, Antarctica, Hong
// Kong, French Guiana, ...) still renders instead of leaving a hole in
// the map.
//
// Small landmasses are simplified far less than large ones:
// percentage-based simplification removes points proportionally, which
// guts an already-sparse small-island shape much more than it does a
// big landmass's already-dense coastline.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import mapshaper from "mapshaper";

const NE_SOURCE_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson";

// Below this footprint (largest-piece bbox, in square degrees),
// landmasses are left completely unsimplified. Covers not just
// microstates but ordinary small-to-mid countries (Slovenia ~4.5,
// Timor-Leste ~2.8, Brunei ~1.1, Denmark ~8.4, Switzerland ~8.9,
// Croatia ~21.2) where 15% simplification visibly distorted borders --
// small shapes have few points to begin with, so there's little size
// cost to keeping them all, and percentage-based simplification can
// collapse a tiny, simple polygon (e.g. Vatican City) to nothing.
const SMALL_AREA_THRESHOLD = 20;

// Countries above the small-area threshold are simplified on a sliding
// scale by size (log of largest-piece bbox area) rather than one flat
// percentage: a country just over the threshold (Croatia ~21) keeps
// far more of its points than a country two orders of magnitude
// bigger (Russia ~1500) -- the latter's shape reads fine with far less
// detail, and dropping its point count keeps the overall file small
// enough to afford the extra detail smaller countries need. Percents
// are rounded to the nearest SIMPLIFY_BUCKET_STEP so the whole dataset
// only needs a handful of mapshaper calls, not one per country.
const MAX_SIMPLIFY_PERCENT = 45;
const MIN_SIMPLIFY_PERCENT = 8;
const SIMPLIFY_BUCKET_STEP = 5;

// A country's zoom-in framing unions the largest piece with every
// other piece that's both a meaningful fraction of its size (so tiny
// far-flung islets -- Tokelau and the Kermadecs for New Zealand, an
// uninhabited atoll anywhere else -- don't drag the box toward them)
// and within a generous distance of it (so genuinely-distant *large*
// territory -- France's South American/Indian Ocean departments --
// still gets excluded even though it clears the size bar). Distance
// alone can't do this split: New Zealand's Tokelau piece is *closer*
// in degrees to the NZ mainland than Indonesia's Papua is to Sumatra,
// so a threshold loose enough for Indonesia would still catch Tokelau
// if size weren't also considered.
const PIECE_AREA_RATIO = 0.02;
const PIECE_DISTANCE_DEGREES = 50;

// Vatican City, Nauru, and Monaco are comfortably under
// SMALL_AREA_THRESHOLD already, but they're small enough (~0.44, ~21,
// and ~2 sq km respectively) that even a slightly different threshold
// down the line could sweep one into simplification and collapse its
// already-tiny polygon to nothing (see the mapshaper note above) --
// pinned here so that can't happen regardless of future tuning.
const ALWAYS_FULL_ACCURACY_CODES = new Set(["va", "nr", "mc"]);

const OUT_DIR = fileURLToPath(new URL("../public", import.meta.url));
const COUNTRIES_JSON_PATH = fileURLToPath(
  new URL("../../../../shared/countries.json", import.meta.url),
);

function round(n) {
  return Math.round(n * 10000) / 10000;
}

function ringBox(ring) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const [x, y] of ring) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  return {
    minX,
    minY,
    maxX,
    maxY,
    area: (maxX - minX) * (maxY - minY),
  };
}

function zoomBoxFor(geometry) {
  const polys =
    geometry.type === "MultiPolygon"
      ? geometry.coordinates
      : [geometry.coordinates];
  const boxes = polys.map(poly => ringBox(poly[0]));
  const largest = boxes.reduce((a, b) => (b.area > a.area ? b : a));
  const refLng = (largest.minX + largest.maxX) / 2;
  const refLat = (largest.minY + largest.maxY) / 2;

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const box of boxes) {
    if (box.area / largest.area < PIECE_AREA_RATIO) {
      continue;
    }
    const centerLng = (box.minX + box.maxX) / 2;
    const centerLat = (box.minY + box.maxY) / 2;
    // A piece geographically close to the largest one can still have a
    // wildly different raw longitude if it's stored on the other side
    // of the antimeridian (e.g. New Zealand's Chatham Islands, at
    // ~-176.5 despite sitting just east of the North Island's ~178.6
    // edge) -- shift by the nearest multiple of 360 relative to the
    // largest piece so that reads as an 8-degree gap, not a 355-degree
    // one, before measuring distance.
    const shift = Math.round((refLng - centerLng) / 360) * 360;
    const shiftedLng = centerLng + shift;
    if (
      Math.abs(shiftedLng - refLng) > PIECE_DISTANCE_DEGREES ||
      Math.abs(centerLat - refLat) > PIECE_DISTANCE_DEGREES
    ) {
      continue;
    }
    minX = Math.min(minX, box.minX + shift);
    minY = Math.min(minY, box.minY);
    maxX = Math.max(maxX, box.maxX + shift);
    maxY = Math.max(maxY, box.maxY);
  }
  return { minX, minY, maxX, maxY, area: largest.area };
}

function roundGeometry(geometry) {
  const roundRing = ring =>
    ring.map(([x, y]) => [round(x), round(y)]);
  if (geometry.type === "Polygon") {
    return {
      type: "Polygon",
      coordinates: geometry.coordinates.map(roundRing),
    };
  }
  return {
    type: "MultiPolygon",
    coordinates: geometry.coordinates.map(poly =>
      poly.map(roundRing),
    ),
  };
}

async function simplify(features, percent) {
  const out = await mapshaper.applyCommands(
    `-i in.json -simplify ${percent}% -o out.json`,
    {
      "in.json": JSON.stringify({
        type: "FeatureCollection",
        features,
      }),
    },
  );
  return JSON.parse(out["out.json"]).features;
}

const [raw, ours] = await Promise.all([
  fetch(NE_SOURCE_URL).then(r => r.json()),
  import(COUNTRIES_JSON_PATH, { with: { type: "json" } }).then(
    m => m.default,
  ),
]);

// A handful of dependent territories (e.g. Australia's Indian Ocean
// Territories) share their parent's ISO_A2 code as a separate NE
// feature. Prefer whichever feature isn't a Dependency so the parent
// country's own geometry wins when there's a collision.
const byIso2 = new Map();
for (const f of raw.features) {
  const p = f.properties;
  const iso2 = (
    (p.ISO_A2_EH !== "-99" ? p.ISO_A2_EH : p.ISO_A2) ?? "-99"
  ).toLowerCase();
  const existing = byIso2.get(iso2);
  if (!existing || existing.properties.TYPE === "Dependency") {
    byIso2.set(iso2, f);
  }
}

const codeByFeature = new Map();
for (const country of ours) {
  const f = byIso2.get(country.code);
  if (!f) {
    throw new Error(`No Natural Earth feature for ${country.code}`);
  }
  codeByFeature.set(f, country.code);
}

// "Lease" features (Baikonur Cosmodrome in Kazakhstan, Guantanamo Bay
// in Cuba) are small enclaves Natural Earth draws as their own polygon
// on top of the leasing country's territory -- rendered as a stray
// unfilled shape (a "white circle" for Baikonur) rather than a
// distinct landmass, so they're dropped entirely. Their footprint is
// also cut out as an interior ring (hole) of the leasing country's own
// polygon; left alone, dropping the lease polygon would just swap the
// stray white shape for a stray black one (the background showing
// through that hole), so the matching hole is stripped too.
const leaseFeatures = raw.features.filter(
  f => f.properties.TYPE === "Lease",
);
const leaseBoxes = leaseFeatures.map(f =>
  ringBox(f.geometry.coordinates[0]),
);
const keptFeatures = raw.features.filter(
  f => f.properties.TYPE !== "Lease",
);

function boxesOverlap(a, b) {
  return (
    a.minX <= b.maxX &&
    a.maxX >= b.minX &&
    a.minY <= b.maxY &&
    a.maxY >= b.minY
  );
}

function stripLeaseHoles(geometry) {
  const stripPoly = poly =>
    poly.length === 1
      ? poly
      : [
          poly[0],
          ...poly
            .slice(1)
            .filter(
              ring =>
                !leaseBoxes.some(box =>
                  boxesOverlap(ringBox(ring), box),
                ),
            ),
        ];
  if (geometry.type === "Polygon") {
    return {
      type: "Polygon",
      coordinates: stripPoly(geometry.coordinates),
    };
  }
  return {
    type: "MultiPolygon",
    coordinates: geometry.coordinates.map(stripPoly),
  };
}

const small = [];
const sizeable = [];
let maxArea = 0;
for (const f of keptFeatures) {
  const code = codeByFeature.get(f);
  const box = zoomBoxFor(f.geometry);
  const properties = {};
  if (code) {
    properties.code = code;
    properties.zoomBounds = [
      box.minX,
      box.minY,
      box.maxX,
      box.maxY,
    ].map(round);
  }
  const feature = {
    type: "Feature",
    properties,
    geometry: roundGeometry(stripLeaseHoles(f.geometry)),
  };
  if (
    box.area < SMALL_AREA_THRESHOLD ||
    ALWAYS_FULL_ACCURACY_CODES.has(code)
  ) {
    small.push(feature);
  } else {
    sizeable.push({ feature, area: box.area });
    maxArea = Math.max(maxArea, box.area);
  }
}

function simplifyPercentFor(area) {
  const t =
    Math.log(area / SMALL_AREA_THRESHOLD) /
    Math.log(maxArea / SMALL_AREA_THRESHOLD);
  const percent =
    MAX_SIMPLIFY_PERCENT +
    t * (MIN_SIMPLIFY_PERCENT - MAX_SIMPLIFY_PERCENT);
  const clamped = Math.min(
    MAX_SIMPLIFY_PERCENT,
    Math.max(MIN_SIMPLIFY_PERCENT, percent),
  );
  return (
    Math.round(clamped / SIMPLIFY_BUCKET_STEP) * SIMPLIFY_BUCKET_STEP
  );
}

const buckets = new Map();
for (const { feature, area } of sizeable) {
  const percent = simplifyPercentFor(area);
  const bucket = buckets.get(percent) ?? [];
  bucket.push(feature);
  buckets.set(percent, bucket);
}

const simplifiedBuckets = await Promise.all(
  [...buckets.entries()].map(([percent, bucketFeatures]) =>
    simplify(bucketFeatures, percent),
  ),
);

const features = [...simplifiedBuckets.flat(), ...small];
writeFileSync(
  `${OUT_DIR}/countries.geojson`,
  JSON.stringify({ type: "FeatureCollection", features }),
);
const bucketSummary = [...buckets.entries()]
  .sort((a, b) => b[0] - a[0])
  .map(
    ([percent, bucketFeatures]) =>
      `${bucketFeatures.length}@${percent}%`,
  )
  .join(", ");
console.log(
  "wrote countries.geojson -",
  features.length,
  "landmasses total,",
  ours.length,
  "guessable",
  `(${small.length} left unsimplified, sizeable: ${bucketSummary})`,
);
