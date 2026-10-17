# Peggleg Lithophane Studio

A static, browser-only photo-to-lithophane app. Photos, previews and generated models are held in tab memory and downloaded directly; there are no upload endpoints, analytics, accounts, cookies or persistent browser storage. Export runs in a cancellable Web Worker. Downloads remain on the visitor's device. Reset clears application references; immediate physical memory erasure is controlled by the browser.

## Develop

Use Node 22.12+ and the existing checkout (cloud tasks are already isolated; no worktree needed).

```sh
npm ci
npm run dev
npm test
npm run check:resolution
npm run build
```

The dev server defaults to port 5173. `npm run preview -- --port 4173` serves the production build. Smoke check: load a JPEG/PNG/WebP, adjust crop/tones, inspect overlay, export STL and 3MF, download the corner fit test and print summary, cancel an export, and reset. A generated test image can be used; never upload personal files to external test services.

## Cloudflare Pages

Connect this repository in Cloudflare Pages. Framework: Vite (or None). Build command: `npm run build`. Output directory: `dist`. Use Node 22.12 or newer. No Functions, Worker backend, R2, D1, secrets or runtime environment variables are needed. The Vite build generates `_headers` with a Content Security Policy and other response headers. Use HTTPS.

All application dependencies are bundled; no runtime CDN, fonts, or API calls. Photo/model processing consumes visitor device resources, not cloud compute. Static hosting is intended to fit Cloudflare Pages' free plan; verify current quotas and pricing before deployment. Custom domain registration can cost extra. No deployment or Cloudflare account provisioning is performed by this repository.

## Included

- Custom panel dimensions, STL and millimetre 3MF geometry exports.
- Crop/fill with 100–400% enlargement, horizontal/vertical positioning and crop reset; whole-photo fit, brightness, contrast, invert and illustrative backlit preview.
- Planning frame-edge overlay, low-resolution/dark-photo/crop feedback.
- Approximate solid PLA volume/mass, print guidance and downloadable settings summary.
- 20 × 20 mm constant maximum-thickness corner coupon; tests slot/corner fit, not full panel dimensions.
- MakerWorld frame catalogue, LED safety/fit/assembly notes, licensing guidance, session reset.
- Frame presets and real-print comparison gallery are explicitly pending actual dimensions/prototypes and creator-owned photographs. No fabricated compatible designs or real print results.

## Pending physical design decisions

LED Tealight and Bambu Lab Light Kit frames are not designed yet. Confirm the exact Bambu kit, panel sizes, overlap, slot depth, ventilation, cable slit geometry and battery access. The requested 0.2 mm clearance is provisionally shown as total, with a per-side planning option; the convention needs confirmation before publishing presets. Mechanical clearance is not thermal clearance. Test actual prints and operating temperatures before claiming lighting compatibility. Frame downloads and their licences will be hosted at https://makerworld.com/en/@peggleg.

3MF exports contain geometry and units only, not Bambu/Prusa printer profiles or sliced toolpaths. White pixels map to minimum thickness; dark pixels map to maximum. Mesh spacing defaults to 0.2 mm, with 0.1, 0.5 and 1 mm options. There is no silent sample cap: 120 × 100 mm uses 601 × 501 samples at 0.2 mm or 1201 × 1001 at 0.1 mm. Non-divisible dimensions use a slightly finer uniform spacing so panel dimensions stay exact. An explicit memory-budget error refuses oversized exports without changing settings. Preview and material estimates are approximations. Photo limit: 20 MB / 24 megapixels. Decode can still be expensive on low-memory phones; the browser's image decoder must first read image dimensions.

The 3MF writer produces uncompressed ZIP entries for simplicity and has no runtime package dependencies. File size is larger than compressed 3MF. Chunked XML/ZIP encoding avoids giant intermediate strings; typed mesh arrays and a planar back fan reduce working memory while retaining every front sample. The UI reports exact STL size and a conservative 3MF upper estimate before download.

## SEO and deployment at imgdrop.app/lithophane/

`.env.production` sets the non-secret canonical URL to `https://imgdrop.app/lithophane/`. Vite derives its asset base from this path. The build includes descriptive metadata, Open Graph/Twitter sharing tags, a 1200 × 630 social card, SVG favicon, WebApplication JSON-LD, a single-page XML sitemap and crawler preferences. FAQs are visible HTML; no unsupported review ratings or frame availability claims are encoded. No search ranking or rich-result eligibility is guaranteed.

**Subpath hosting:** DNS cannot route a subpath. Integrate the generated `dist` contents under `lithophane/` in the existing imgdrop.app static deployment, or configure the existing site's supported routing to this app. Do not deploy this bundle over the existing domain root. If the existing site uses a different host/framework, determine its routing before deployment. Cloudflare Worker routing is only a possible integration option, not an app requirement.

Cloudflare Pages reads `_headers` only at the deployment root. Merge the generated `dist/_headers` rules into the existing deployment's root `_headers`; they are scoped to `/lithophane/*`. Preserve all existing routes, redirects and security rules. A strict existing root CSP must allow this app's assets and generated JSON-LD hash. For preview deployments, set the Pages preview environment's `SITE_URL` to an empty string, then rebuild; empty overrides the production env file and emits `noindex` metadata/headers. Avoid exposing unprotected alternate copies as indexable sites.

`dist/robots.txt` contains a **root-level merge proposal**, not an effective subpath policy. Merge relevant crawler blocks and the sitemap line into `https://imgdrop.app/robots.txt` while preserving the existing site's rules. Selected training crawlers (GPTBot, ClaudeBot, CCBot, Google-Extended, Bytespider, Amazonbot) are asked not to crawl `/lithophane/`; ordinary search indexing remains allowed. Check agent names against current vendor documentation when maintaining this list. Robots rules are advisory and do not prevent hostile scraping. Do not deploy a new root robots file blindly over the existing site's policy. Serve the sitemap at `/lithophane/sitemap.xml` and submit it in the site's Google Search Console and Bing Webmaster Tools accounts after launch.

**Cloudflare account steps (not enabled by repository code):** confirm that the hostname is proxied through Cloudflare; enable the free bot protection/AI crawler controls available for your zone and plan; preserve verified search crawler access. Review security events before adding challenges or blocks. Scope custom rules to `/lithophane/` where supported and test asset loading and exports. Avoid blanket challenges for all visitors or search crawlers. Managed protections and exact controls vary by plan; advanced bot management and some rate limits can cost extra. No Turnstile, analytics, paid service or Cloudflare Worker is added. Local processing means scraping cannot collect visitor photos from the server, but public site assets and generator code remain downloadable.

## Design and seasonal collection

The selected visual direction is **Option 03 — Crafted keepsakes**: oat/paper textures, forest-green accents, serif headings and warm product styling. This replaces the initial Option 01 cream/terracotta direction. See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for completed work and launch/physical-design tasks.

The seasonal collection contains four detailed grayscale illustrations: Halloween **Moonlit Manor** and **Harvest Lanterns**, and Christmas **Christmas Village** and **Winter Woodland**. The earlier simple procedural silhouettes have been replaced. Preview cards and panel exports use the same quadrant of a shared, locally bundled illustration sheet (`src/assets/seasonal-collection.webp`). These are AI-generated digital illustrations, not photographs of real prints. Public catalogue artwork is retained as a site asset; visitor photos, working previews and generated STL/3MF files are never uploaded or stored by the app.

“Use design” decodes the selected artwork in-browser and loads it into the existing studio. The selected mesh spacing and custom panel dimensions are preserved; tonal/crop-position controls are reset. Users can adjust and export immediately. Source-resolution feedback warns when the requested grid exceeds the available image pixels; finer spacing cannot invent missing detail. The browser downloads a static first-party artwork asset, without sending visitor content anywhere. Selecting a template releases the active photo reference.

LED Tealight and Bambu Lab Light Kit frame variants are planned for seasonal designs, but the exported files currently contain **flat panels only**. Do not describe them as complete lamps or validated frame-compatible downloads. Test actual frames, final sizes, thermal clearance, the 0.2 mm mechanical fit convention and Bambu cable slit before enabling compatibility presets or publishing model-specific download links.

Keep this README, the implementation plan and relevant Markdown documents current with every change.

Seasonal thumbnail canvases are bounded to fixed preview areas so their intrinsic export resolution cannot overlap the card content on desktop or mobile.

## Preview build (no production release)

Use `npm run build:preview` for a root-hosted `pages.dev` preview in `dist-preview/`; serve it locally with `npm run preview:pages`. This explicit mode forces noindex, disallow-all robots, no production canonical URL and no sitemap even if SITE_URL is present. It does not alter the production subpath build. See [PREVIEW_DEPLOYMENT.md](PREVIEW_DEPLOYMENT.md) for the Git-connected preview workflow and access protection. An online preview is publicly reachable unless Cloudflare Access protects it.

After building the preview, `npm run check:preview` validates its indexing policy, asset references and CSP hash. Generated output is excluded from version control. Git pushes to `preview/lithophane` trigger the configured Pages preview build.

## Review and proposed next work

See [PRODUCT_REVIEW.md](PRODUCT_REVIEW.md) for the evidence-based product review, confirmed gaps and prioritised feature suggestions. These recommendations are proposed work, not a claim that the features are implemented.


## Resolution and verification

Screen preview resolution follows the displayed area and device pixel ratio. It draws directly from the full decoded source and never uses the mesh grid. The export worker separately samples the source at the chosen physical spacing, using the same crop and tonal functions. Float32 tones preserve fractional luminance. The backlit preview remains an illustrative tone curve, not a calibrated prediction of filament transmission or a 3D mesh view.

`npm run check:resolution` validates full 120 × 100 mm meshes at 0.2 and 0.1 mm, every directed edge, non-degenerate triangles, volume, all STL coordinates and all 3MF vertex/triangle records. It writes reproducible slicer fixtures under ignored `artifacts/resolution/`. See [QUALITY_VALIDATION.md](QUALITY_VALIDATION.md) for browser and Bambu Studio evidence and remaining physical-print checks.

Export memory estimates include source pixels, sampling buffers, mesh arrays, output buffers and a reserve. The conservative budget is capped at 768 MiB and reduced on devices reporting less memory; unknown devices use 768 MiB. This is a planning limit, not a measurement of free RAM. Browser allocation failures still produce an explicit failure, never a coarser file. Replacement-photo loading disables downloads; settings changes, reset and cancellation invalidate pending workers and bitmap clones.

## Current Cloudflare workflow

The repository is Git-connected to the `lithophane-site` Pages project. Push only to `preview/lithophane` for this work; production auto-deployments are disabled according to the configured setup. No Cloudflare token, Wrangler command, DNS change or custom-domain attachment is needed. Earlier Direct Upload instructions are superseded by [PREVIEW_DEPLOYMENT.md](PREVIEW_DEPLOYMENT.md).

## Crop controls

In Fill panel mode, zoom above 100% creates room to move the image on both axes, including photos that match the panel proportions. Sliders with no available movement are disabled with a nearby explanation. Fit whole photo shows the full image with centred white margins and disables crop-only controls. Reset crop returns to 100% zoom and centred positioning without changing tones or dimensions; a new photo or seasonal design also resets crop positioning. Preview and worker exports share the same source rectangle. Print summaries include zoom and positions.

## First Bambu LED frame prototypes

Editable A6 postcard and four-sided lantern prototypes are now in [models/bambu-led-frames](models/bambu-led-frames/README.md), with STL, STEP and FreeCAD files. These have 11 mm front borders and pockets for the supplied 59 × 8 mm LED dimensions. This is a CAD checkpoint; physical fit, lighting and thermal checks remain pending, so website compatibility presets stay disabled.


## Slim postcard frame revision

The postcard prototype now uses an 8.8 mm open frame with 11 mm borders and a removable 110 × 90 mm stand with a raised, angled LED cradle. The deep hood and roof are superseded. A top-loading panel channel and removable rail use two M3 × 6 mm screws for retention in either orientation. Updated STL/STEP/FreeCAD files and insertion renders are in models/bambu-led-frames/. Digital checks cover panel insertion and assembly clearances; physical fit and illumination remain pending. The lantern geometry is unchanged.


The postcard stand is now split into a base plate and keyed press-in LED holder. Route the cable in the open-bottom central bypass before pressing the holder into the socket. Joint fit-test pieces and CAD cable-clearance/insertion checks are included. Lantern assembly renders are supplied without changing lantern geometry.


## Direct crop dragging

Drag the image directly in the preview to choose the crop. Mouse and pointer/touch input use bounded crop positions, synchronised with the sliders and worker export. Arrow keys provide keyboard positioning. At 100% the panel stays filled; optional enlargement up to 400% creates more movement room. Shrinking below the fill size has been removed so dragging cannot create blank strips. Fit whole photo remains an explicit mode with margins when aspect ratios differ.

All 19 Node tests pass, including drag direction, edge clamping, no movement on a fitted axis and no blank source edges. Chromium checks verify actual pointer dragging (50/50 to 16/25), release outside the canvas clamping to 100/100, arrow-key movement, STL download, reset to 100%, and mouse drag at a 390 × 844 responsive viewport without page overflow. Touch-event handlers are implemented; a physical phone has not been tested. Production/preview builds and preview-policy checks pass.


Physical-fit adjustment: postcard top-rail tabs are now 5.2 × 3.4 × 8.5 mm with tapered tips, giving 0.4 mm width clearance per side in the unchanged frame pockets. Reprint only the rail or try its small fit coupon first. Rear screw positions are unchanged.

## Postcard Frame V2

A separate screwless frame and rear-sliding dovetail top rail are available in [frame-v2](models/bambu-led-frames/frame-v2/README.md). The image channel is checked against V1 and remains identical. The existing base and LED-holder files are unchanged. V1 remains available; V2 has its own filenames, CAD, ZIP and small fit samples.
