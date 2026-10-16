# Implementation plan

## Product direction

- Selected design: **Option 03 — Crafted keepsakes**. Oat/paper backgrounds, forest-green accents, warm lighting, serif headings and a personal, handmade feel. The initial implementation used Option 01; it has now switched to Option 03.
- Production URL: https://imgdrop.app/lithophane/.
- Static Cloudflare-compatible app; visitor photos and exports remain on their device. No accounts, backend storage or paid compute required.
- Frame models are created by Peggleg and published on MakerWorld: https://makerworld.com/en/@peggleg.

## Implemented

- [x] Browser-local photo controls, custom panel dimensions and approximate backlit preview.
- [x] Cancellable STL/3MF geometry exports and print-summary download.
- [x] Edge overlap planning, fit coupon, material estimates, photo quality feedback and reset.
- [x] Print/safety/privacy/licensing guidance and frame catalogue with honest development status.
- [x] Subpath-aware SEO, sharing image, structured data, sitemap and root crawler-rule merge proposal.
- [x] Option 03 visual direction and matching social card/favicon.
- [x] Detailed seasonal collection: Moonlit Manor, Harvest Lanterns, Christmas Village and Winter Woodland. Replaced the earlier simple procedural silhouettes.
- [x] Seasonal artwork previews and one-click loading into the same adjustment/export workflow; no visitor content is uploaded or persisted. Curated AI-generated illustration artwork is bundled as a public static site asset.

## Next: physical frame and seasonal release work

- [ ] Design and prototype LED Tealight and Bambu Lab Light Kit frames, including seasonal variants or interchangeable seasonal panels.
- [ ] Confirm the exact Bambu kit, panel dimensions, slot/overlap, cable slit and battery access.
- [ ] Confirm whether 0.2 mm clearance means total or per side; currently the planning control defaults to total and supports either convention.
- [ ] Test fit, ventilation and temperatures. Mechanical clearance is not thermal spacing.
- [ ] Publish tested frame models on MakerWorld with real model URLs, hardware lists, assembly instructions and licences.
- [ ] Enable validated “fit this frame” presets and direct model links. Current seasonal exports are flat panels, not complete lights or guaranteed kit-compatible assemblies.
- [ ] Add creator-owned real print comparisons. Never retain visitor uploads for this purpose.

## Launch work

- [ ] Integrate the app under `/lithophane/` in the existing imgdrop.app deployment.
- [ ] Merge scoped security headers and root robots rules without replacing existing domain policies.
- [ ] Enable appropriate free Cloudflare bot controls and verify search crawler access.
- [ ] Submit the sitemap after launch and check canonical/social metadata on the live domain.
- [ ] Verify current Cloudflare plan limits. Source is pushed to `preview/lithophane`; nothing is deployed.

## Validation

Geometry and SEO automated tests pass; production build passes. Browser smoke checks cover photo controls, both exports, fit coupon, print summary, cancellation, invalid input, reset, mobile layout and no upload/external requests. Seasonal checks cover all four motifs, browser exports and narrow layouts. Physical compatibility remains untested until prototypes exist.

## Documentation rule

Update this plan, README and relevant Markdown documentation alongside every implementation change. Distinguish implemented software, pending physical design, tested behaviour and account/deployment steps.

### Render review

Fixed seasonal thumbnail canvas sizing to keep artwork inside its preview area and prevent overlap with card titles and descriptions. Rechecked the built page in desktop and mobile Chromium.


### Detailed seasonal artwork revision

- Replace flat icons with richly shaded grayscale scenes, using identical source artwork for catalogue previews and exported relief panels.
- Default seasonal designs to fine mesh sampling; retain the existing memory cap and explain that small details need print testing.
- Preserve browser-local privacy for visitor photos and output files; distinguish public catalogue artwork from visitor content.
- Digital illustrations are not evidence of physical print quality or lighting-kit compatibility. Test actual prints before release claims.

Detailed illustrations are bundled as a ~745 KB WebP sheet. Catalogue previews use a 6:5 area to show the complete scenes at useful size; all four artwork selections and STL exports passed desktop/mobile browser checks after replacement. Both STL and 3MF continue to use the same studio mesh pipeline.

## Pages preview preparation

- [x] Add separate root-based `build:preview` / `preview:pages` commands, retaining the production `/lithophane/` build.
- [x] Force preview noindex headers/metadata, disallow-all robots and no canonical/sitemap regardless of SITE_URL.
- [x] Document verified-branch deployment and protect the existing live domain.
- [ ] Authenticate to the intended Cloudflare account and identify/verify the Pages project's production branch.
- [ ] Deploy a non-production branch preview and validate its hosted behaviour. No Cloudflare credentials or project selection are available in this environment.

Preview validation completed: seven automated tests, production/preview builds, preview indexing/CSP/asset checks, and root-hosted seasonal browser/export/mobile checks passed. Generated and verified `artifacts/lithophane-pages-preview.zip` for upload. Cloudflare account/project selection and hosted deployment remain outstanding.

Source checkpoint: committed and pushed to `peggleg/lithophane-site`, branch `preview/lithophane`. No production branch, domain, DNS or Cloudflare deployment was changed.
