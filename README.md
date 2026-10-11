# Digiverse

**A live, animated guide to our solar system that you can install like an app.**

102 worlds on real orbits — 8 planets, 43 moons, 6 dwarf planets, 18 asteroids, 11 trans-Neptunian objects and 16 comets, including all three known interstellar visitors — plus 13 deep-space spacecraft, the live sky above you, mission control tracking from NASA, JPL and NOAA, and an unusual-events tracker that alerts you when something out of the ordinary happens beyond Earth.

![Digiverse on a phone](screenshots/mobile.png)

## Features

- **Animated solar system** with a time machine (1800–2300), real-time mode with a microsecond clock, and zoom from the inner planets out to Sedna and the Voyagers.
- **Detail sheet for every world:** facts, live position, orbit data, moon-system diagram, live Wikipedia summary, NASA photo gallery and official JPL data.
- **Tonight's sky** for your location: sky map, Sun and Moon times, moon phase, visible planets, live space station position, clouds, aurora chances and a stargazing score.
- **Mission control:** unusual events, launches with countdowns, satellite passes over you, the Sun right now, asteroid watch, Earth events, exoplanets, crew in space, deep-space spacecraft, space agencies and NASA image search.
- **Unusual events tracker:** ten sources checked every 10 minutes, ranked High / Notable / Info, with pop-up, in-app and phone notifications.
- **Discovery feed** of solar-system news with alerts for new findings.
- **Ambient music:** five original space soundscapes generated live in the browser.
- **Themes:** Light, Dark and Blue neon. **Layouts:** Mobile (portrait), Tablet (landscape split view) or Auto.
- **Installable PWA:** works offline after the first visit, app shortcuts, update prompt, no build step, no tracking.

## Put it on GitHub Pages (5 minutes)

1. Create a new repository on GitHub, for example `digiverse` (public, so Pages is free).
2. Upload everything in this folder, **including the hidden `.github` folder and `.nojekyll` file**.
   - Command line: see below.
   - Website: *Add file → Upload files*, then drag the folder contents in. If `.github` doesn't upload, create `.github/workflows/pages.yml` with *Add file → Create new file* and paste its contents.
3. Open **Settings → Pages** and set **Source** to **GitHub Actions**.
4. The **Deploy to GitHub Pages** workflow runs automatically (see the **Actions** tab). When it finishes, your app is live at
   `https://<your-username>.github.io/digiverse/`

Every later push to `main` redeploys, and installed copies pick up the new version the next time they're opened.

```bash
cd digiverse
git init -b main
git add .
git commit -m "Digiverse: initial release"
git remote add origin https://github.com/<your-username>/digiverse.git
git push -u origin main
```

## Install it as an app

- **Android (Chrome, Edge, Samsung Internet):** tap **Install** in the app header, or the browser menu → *Install app*.
- **iPhone / iPad (Safari):** Share → **Add to Home Screen**. The app shows this tip once.
- **Windows, macOS, Linux (Chrome, Edge):** the install icon in the address bar, or the **Install** button.

Long-press the installed icon for shortcuts to *Tonight's sky*, *Unusual events*, *Live data* and *All worlds*.

PWA features need HTTPS, which GitHub Pages provides. Opening `index.html` straight from your disk works for browsing, but can't install or work offline.

## Run it locally

```bash
npx serve .          # or: python3 -m http.server 8080
```

Then open the address it prints. `localhost` counts as secure, so install and offline mode work there too.

## Deep links

Add these to the app address: `#sky`, `#live`, `#watch`, `#launches`, `#spacecraft`, `#feed`, `#worlds`, `#time`, or a world's id such as `#saturn`, `#europa`, `#halley`, `#apophis`.

## Live data sources

| Area | Service | Key needed | Works straight from the browser |
|---|---|---|---|
| Planet positions, time machine, sky map | Computed in the app from NASA JPL orbital elements | — | yes |
| Asteroid, comet and TNO orbits | NASA JPL Small-Body Database (built in) | — | yes |
| Planet position check | JPL Horizons | no | needs relay |
| Comet / dwarf-planet orbit data | JPL Small-Body Database (SBDB) | no | needs relay |
| Asteroid flybys | JPL Close Approach (CAD) | no | needs relay |
| Impact-risk list | JPL Sentry | no | needs relay |
| Fireballs | JPL Fireball | no | needs relay |
| Deep-space probes | JPL Horizons spacecraft ephemerides | no | needs relay (stored positions used otherwise) |
| Solar flares, CMEs, storm alerts | NASA DONKI | DEMO_KEY (add your own free key in Data settings) | yes |
| Photo galleries and search | NASA Image and Video Library | no | yes |
| Natural events on Earth | NASA EONET | no | yes |
| Earth imagery | NASA GIBS (VIIRS true colour) | no | yes |
| The Sun right now | Helioviewer (NASA SDO), SDO latest images | no | yes |
| X-ray flux, solar wind, NOAA scales, Kp | NOAA SWPC | no | yes |
| Satellites, ISS / Tiangong passes | CelesTrak TLEs + satellite.js | no | yes (relay optional) |
| ISS live position | Where the ISS at? | no | yes |
| Launches, people in space | The Space Devs Launch Library 2 (15 requests/hour, cached) | no | yes |
| Space news | Spaceflight News API | no | yes |
| Exoplanets | NASA Exoplanet Archive (TAP) | no | yes (relay optional) |
| Weather, city search | Open-Meteo | no | yes |
| Summaries | Wikipedia REST API | no | yes |
| Space agencies directory | Built-in facts, with links to each agency's open-data portals | — | yes |

**Left out, and why:**
- *Portals rather than open web APIs:* ESA Earth Online and EVDC, JAXA EORC, ISRO Bhuvan, CSA / Open Government Canada, DLR (linked from each agency card instead).
- *Couldn't be verified:* NASA SSC Web Services.
- *Need an account or token:* N2YO, ESA DISCOS, Copernicus Data Space, Sentinel Hub, NASA Earthdata, FIRMS, NOAA NCEI, USGS EarthExplorer.
- *Research archives, not live feeds:* ESA Gaia, MAST, ESO, SIMBAD, VizieR, VO TAP services.
- *Full applications:* Aladin Lite, WorldWide Telescope, ESA Space Weather portal.
- *Superseded:* Open Notify (HTTP only), SpaceX API (no longer updated), NASA APOD (removed; NASA retires the legacy endpoint on 1 December 2026).

## Optional: the data relay for NASA JPL

NASA JPL's APIs don't send the CORS headers browsers require, so the app can't read them directly. `relay/worker.js` is a tiny Cloudflare Worker (free plan) that fetches them for you. It only forwards GET requests to a fixed allow list of science hosts, so it can't be used as an open proxy.

**Dashboard:** dash.cloudflare.com → Workers & Pages → Create → Worker → paste `relay/worker.js` → Deploy.
**Command line:** `npm i -g wrangler && cd relay && wrangler login && wrangler deploy`

Then open **Data settings** in Digiverse (bell → settings) and paste the worker address, for example `https://digiverse-relay.<you>.workers.dev`.

## Unusual events tracker

While the app is open it checks these every 10 minutes and alerts you about anything unusual:

- Strong solar flares (GOES X-rays), NOAA radio-blackout / radiation / geomagnetic storm scales, fast solar wind or strongly southward Bz, Kp 5+
- NASA DONKI alerts: solar energetic particles, interplanetary shocks, X flares, CMEs faster than 1,000 km/s, magnetopause crossings
- Asteroids passing inside the Moon's orbit (JPL CAD) and Torino 1+ / Palermo > −2 impact risks (JPL Sentry)
- Deep-space news: supernovae, gamma-ray bursts, interstellar objects, outbursts
- Computed in the app: Moon and planet pairings within 1°, catalogued comets or asteroids within 0.1 AU of Earth

Browsers can't run checks while a web app is closed unless a push server is involved, so alerts arrive while Digiverse is open (including in the background on desktop).

## Project structure

```
index.html              the whole app (HTML, CSS, JavaScript)
sw.js                   service worker: offline support and updates
manifest.webmanifest    install metadata, shortcuts, screenshots
offline.html            shown if the app is opened offline before it was ever saved
404.html                sends unknown GitHub Pages paths back to the app
icons/                  app icons (SVG, PNG, maskable, Apple touch, favicon)
screenshots/            store-style screenshots for the install dialog
relay/                  optional Cloudflare Worker for NASA JPL APIs
.github/workflows/      GitHub Pages deployment
```

## Updating

Edit, commit and push. The page itself is always fetched fresh when online, so changes to `index.html` reach installed apps on their next launch, with an "updated" notice. If you change icons, screenshots or other static files, also raise `VERSION` in `sw.js` (for example `digiverse-v15`).

## Privacy

No accounts, analytics or tracking. Settings, your location choice and alert history are stored only in your browser. Your location is used to calculate your sky and to ask Open-Meteo for local weather.

## Licence and credits

Code: MIT (see `LICENSE`). Data: NASA, JPL, NOAA SWPC, ESA, CelesTrak, The Space Devs, Spaceflight News API, Open-Meteo, Helioviewer, Where the ISS at? and Wikipedia (text under CC BY-SA 4.0), each under its own terms. Orbit calculations use NASA JPL's published elements; satellite positions use satellite.js.
