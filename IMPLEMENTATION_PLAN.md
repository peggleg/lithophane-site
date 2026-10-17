# Implementation plan

## Implemented

- Option 03 — Crafted keepsakes: oat/paper backgrounds, forest-green accents, serif headings and warm artwork.
- Static browser-local photo controls, custom flat-panel dimensions, crop/fill, brightness, contrast and inversion.
- Cancellable STL and millimetre 3MF exports, print-summary download, fit coupon, frame overlap planning and approximate material estimates.
- Seasonal artwork: Moonlit Manor, Harvest Lanterns, Christmas Village and Winter Woodland; public bundled illustrations, no visitor uploads or persistence.
- Production subpath SEO and a separate root-hosted, noindex Pages preview build.
- Git-connected Cloudflare Pages preview on `preview/lithophane`; see [PREVIEW_DEPLOYMENT.md](PREVIEW_DEPLOYMENT.md).

## Resolution correction — October 2026

- [x] Separate full-source screen rendering from physical export sampling.
- [x] Remove the 241-sample cap. Add exact 0.2 mm (default) and 0.1 mm options, retaining 0.5 and 1 mm.
- [x] Show actual spacing, sample grid, triangle count and output-size estimates before export.
- [x] Refuse oversized allocations explicitly without changing requested quality.
- [x] Sample images inside the cancellable worker; share crop/tone processing with preview.
- [x] Keep fractional luminance and all sampled front vertices; use preallocated mesh arrays and a planar back fan.
- [x] Encode 3MF in bounded chunks, avoiding huge XML strings and archive copies.
- [x] Block downloads during image replacement; invalidate stale exports on edits, reset and cancellation.
- [x] Preserve selected mesh spacing when loading seasonal artwork and warn about limited source resolution.
- [x] Fix narrow-screen lightbox overflow.
- [x] Add crop zoom and reset, explain/disable axes without crop room, and use identical crop framing in preview and exports.
- [x] Validate full 120 × 100 mm exports and Bambu Studio imports; document evidence in [QUALITY_VALIDATION.md](QUALITY_VALIDATION.md).

## Remaining product and physical work

- [ ] Calibrated thickness-aware lighting, original/adjusted comparisons and a 3D mesh view. Current backlight remains illustrative.
- [ ] Finalise the Bambu kit and LED tealight envelope, frame opening, overlap, slot depth, ventilation, cable slit and battery access.
- [ ] Confirm whether 0.2 mm mechanical clearance means total or per side, then prototype and test fit and temperatures.
- [ ] Publish tested frame models, assembly instructions and licences on MakerWorld. Current exports are flat panels, not complete lamps or validated compatible assemblies.
- [ ] Print representative panels and compare source, preview, toolpaths and illuminated result. No physical print-quality claim follows from digital validation.
- [ ] Add repeatable cross-browser/device UI coverage and CI. Node regression checks are committed; interactive browser checks currently require the documented procedure.
- [ ] Consider the additional features in [PRODUCT_REVIEW.md](PRODUCT_REVIEW.md) separately from this correction.

## Production launch remains separate

- [ ] Integrate under `/lithophane/` in the existing imgdrop.app deployment.
- [ ] Merge scoped headers and root robots rules without replacing existing policies.
- [ ] Verify account-specific bot controls, current plan limits and search crawler access.
- [ ] Validate live canonical/social metadata and submit the sitemap after launch.

Update README, this plan and relevant Markdown documentation with implementation changes. Distinguish implemented software, measured digital results, pending physical tests and deployment state.

## Bambu LED mechanical prototype checkpoint

- [x] Create A6 105 × 148 mm postcard frame for portrait/landscape placement, base LED pocket, reflector hood and sliding panel retainer.
- [x] Create four-sided lantern from identical side frames, a slotted base and removable slotted top ring.
- [x] Use 11 mm front borders, Ø59.6 × 8.4 mm LED pockets and open cable exits.
- [x] Supply STL/STEP/FreeCAD files, small fit-test pieces and CAD assembly interference checks.
- [ ] Test actual prints, brightness distribution, retention, cable fit and operating temperatures before publishing compatibility claims.

See models/bambu-led-frames/README.md. These prototypes do not enable website frame presets or replace the remaining physical validation tasks.


## Slim postcard frame revision

The postcard prototype now uses an 8.8 mm open frame with 11 mm borders and a removable 110 × 90 mm stand with a raised, angled LED cradle. The deep hood and roof are superseded. A top-loading panel channel and removable rail use two M3 × 8 mm screws for retention in either orientation. Updated STL/STEP/FreeCAD files and insertion renders are in models/bambu-led-frames/. Digital checks cover panel insertion and assembly clearances; physical fit and illumination remain pending. The lantern geometry is unchanged.
