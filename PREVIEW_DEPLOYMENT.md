# Cloudflare Pages preview deployment

## Active workflow

GitHub repository: https://github.com/peggleg/lithophane-site . Branch: `preview/lithophane`. Cloudflare Pages project: `lithophane-site`. The existing Git integration builds pushes to that branch; production auto-deployments are disabled in the owner's setup. Do not use a Cloudflare API token or the legacy `pages:create` / `pages:deploy:preview` scripts for this workflow.

Branch preview: https://preview-lithophane.lithophane-site.pages.dev . Confirm the new commit's Cloudflare Pages GitHub check before assuming this URL serves the latest revision. GitHub check output includes the immutable deployment URL and the branch alias. The previous checkpoint `36ddd17` has a successful Pages deployment; a new push must be checked independently.

## Validate and push

```sh
npm ci
npm test
npm run check:resolution
npm run build
npm run build:preview
npm run check:preview
git push origin preview/lithophane
```

The Pages preview build uses `npm run build:preview` and `dist-preview`. Node 22.12+ or 24+ is required. Preview mode forces root asset paths, noindex metadata and headers, disallow-all robots, no canonical production URL and no sitemap, even if SITE_URL is set. Production remains `npm run build` / `dist`, with the `/lithophane/` asset base.

`npm run preview:pages` serves the preview locally on port 4175. Vite preview does not apply Cloudflare response headers, so verify the deployed headers separately. After a successful GitHub check, verify the hosted page, assets, worker export, robots and X-Robots-Tag. See [QUALITY_VALIDATION.md](QUALITY_VALIDATION.md) for the resolution regression procedure and results.

## Release boundaries

This change authorizes a branch preview only. Do not change the production branch, production auto-deployments, imgdrop.app DNS, routes, domain attachment or root robots policy. Public previews remain reachable unless separately protected by Cloudflare Access; noindex is not access control. Subpath production integration and physical frame/print validation remain separate work.

The old Direct Upload project proposal and credential setup notes are obsolete. GitHub's read-only check API is sufficient to inspect deployment results; no Cloudflare token is needed.

## Mechanical clicker prototypes

Added `/clickers/` with Pocket Pebble, Name Bar, Symbol Strip, Number Pad and Cloud Cluster layouts. Create 1–5 independently mounted full-height MX-style switches, round/rounded-square/heart keycaps, one letter/number or a heart/star/cloud/flower/plus per button, 12 local fonts and illustrative colours. The base is an open-bottom shell; each keycap is a separate printable part with a female cross-stem socket and 0.8 mm raised marking. STL ZIP and multipart millimetre 3MF downloads include the base, all keycaps, a switch-plate coupon and a blank socket-fit keycap; the ZIP also includes the assembly guide. The on-screen grey switch blocks and press animation are illustrative and are never exported.

Starting assumptions: 14.1 mm switch opening, 1.5 mm top plate, 16 mm cavity, 2.4 mm walls, 23 mm button pitch, 5.8 mm connector width, 4 mm insertion and a cross socket of 4.15 × 1.25 mm. Controls adjust these dimensions. This is an untested full-height MX-style fit based on the selected switch photograph, not an identified manufacturer drawing or compatibility certification. Boxed-stem and housing clearance, retention, 4 mm free travel, strength and printed fit need physical testing. Print both coupons first and inspect the slicer; base prints top-face down and caps need underside supports with the cross sockets kept clear. Switches are separately supplied.

Validation covers closed, consistently oriented positive-volume meshes for all five layouts and three keycap shapes; 1–5 opening/cap counts and spacing; real socket-clearance changes; named STL/3MF parts and fit coupons; invalid inputs; and the existing generators and samples. Browser checks cover all presets/cap shapes, button counts and markings, fit controls, all downloads, colours/parts view, cancellation, reset, touch and widths of 320/390/1280 px. Run `CHROMIUM_PATH=/usr/bin/chromium npm run test:clickers` against `npm run preview:pages`, or use the Playwright-installed Chromium. The original `npm run test:browser` continues to cover keyrings/nameplates and existing routes. Production/preview SEO and CSP include the sixth page. Deploy only through `preview/lithophane`; physical testing and production release remain separate.
