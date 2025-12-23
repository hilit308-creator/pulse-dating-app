// src/utils/photos.js

/** Normalize an Unsplash-like URL by stripping variable width/height/quality params. */
export function normalizeUnsplash(url) {
  try {
    const u = new URL(url);
    // Remove common varying params
    ["w", "h", "width", "height", "q", "fit", "auto", "crop", "fp-x", "fp-y"].forEach((k) =>
      u.searchParams.delete(k)
    );
    // Keep path and origin; sort remaining params for stability
    const params = Array.from(u.searchParams.entries()).sort();
    const stable = new URL(u.origin + u.pathname);
    params.forEach(([k, v]) => stable.searchParams.set(k, v));
    return stable.toString();
  } catch {
    return String(url || "");
  }
}

/**
 * Remove exact duplicates and near-duplicates (same base without variable params).
 * Returns a small array (2–6) of distinct URLs in original order.
 */
export function dedupePhotos(arr = []) {
  const seenExact = new Set();
  const seenBase = new Set();
  const out = [];
  for (const src of arr) {
    if (!src) continue;
    if (seenExact.has(src)) continue;
    const base = normalizeUnsplash(src);
    if (seenBase.has(base)) continue;
    seenExact.add(src);
    seenBase.add(base);
    out.push(src);
  }
  return out;
}
