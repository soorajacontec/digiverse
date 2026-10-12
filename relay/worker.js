/**
 * Digiverse data relay — a tiny Cloudflare Worker (free plan is plenty).
 *
 * Some public science APIs (NASA JPL's Horizons, Small-Body Database, Close Approach,
 * Sentry and Fireball services) don't send the headers browsers need, so a web app
 * can't read them directly. This relay fetches them for the app and adds those headers.
 *
 * It only forwards GET requests to the hosts listed below, so it can't be used as an
 * open proxy. Usage from the app:  https://<your-worker>.workers.dev/?url=<encoded API URL>
 */
const ALLOWED_HOSTS = {
  "ssd-api.jpl.nasa.gov": 600,             // JPL SBDB, CAD, Sentry, Fireball (cache 10 min)
  "ssd.jpl.nasa.gov": 300,                 // JPL Horizons
  "exoplanetarchive.ipac.caltech.edu": 3600,
  "celestrak.org": 7200,                   // CelesTrak asks for at most one download per 2 h
  "services.swpc.noaa.gov": 120,
  "ll.thespacedevs.com": 900,              // Launch Library free tier: 15 requests/hour
  "eonet.gsfc.nasa.gov": 900,
  "ccmc.gsfc.nasa.gov": 600,               // NASA DONKI space-weather database (new home since Sep 2026)
  "earthquake.usgs.gov": 300,
  "aviationweather.gov": 600               // airport weather reports (backup for the globe)
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Max-Age": "86400"
};

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (request.method !== "GET") return text("Only GET is supported", 405);

    const raw = new URL(request.url).searchParams.get("url");
    if (!raw) return text("Add ?url=<API address>", 400);

    let target;
    try { target = new URL(raw); } catch { return text("That isn't a valid address", 400); }
    const ttl = ALLOWED_HOSTS[target.hostname];
    if (target.protocol !== "https:" || ttl === undefined) return text("This host isn't on the relay's allow list", 403);

    const upstream = await fetch(target.toString(), {
      headers: { "User-Agent": "Digiverse-relay/1.0 (+https://github.com/)", "Accept": "application/json, text/plain, */*" },
      cf: { cacheTtl: ttl, cacheEverything: true }
    });
    const headers = new Headers(upstream.headers);
    for (const [k, v] of Object.entries(CORS)) headers.set(k, v);
    headers.delete("set-cookie");
    headers.set("Cache-Control", `public, max-age=${ttl}`);
    return new Response(upstream.body, { status: upstream.status, headers });
  }
};

function text(msg, status) {
  return new Response(msg, { status, headers: { ...CORS, "Content-Type": "text/plain; charset=utf-8" } });
}
