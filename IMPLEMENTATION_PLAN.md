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

The postcard prototype now uses an 8.8 mm open frame with 11 mm borders and a removable 110 × 90 mm stand with a raised, angled LED cradle. The deep hood and roof are superseded. A top-loading panel channel and removable rail use two M3 × 6 mm screws for retention in either orientation. Updated STL/STEP/FreeCAD files and insertion renders are in models/bambu-led-frames/. Digital checks cover panel insertion and assembly clearances; physical fit and illumination remain pending. The lantern geometry is unchanged.


The postcard stand is now split into a base plate and keyed press-in LED holder. Route the cable in the open-bottom central bypass before pressing the holder into the socket. Joint fit-test pieces and CAD cable-clearance/insertion checks are included. Lantern assembly renders are supplied without changing lantern geometry.


## Direct crop dragging

Drag the image directly in the preview to choose the crop. Mouse and pointer/touch input use bounded crop positions, synchronised with the sliders and worker export. Arrow keys provide keyboard positioning. At 100% the panel stays filled; optional enlargement up to 400% creates more movement room. Shrinking below the fill size has been removed so dragging cannot create blank strips. Fit whole photo remains an explicit mode with margins when aspect ratios differ.

All 19 Node tests pass, including drag direction, edge clamping, no movement on a fitted axis and no blank source edges. Chromium checks verify actual pointer dragging (50/50 to 16/25), release outside the canvas clamping to 100/100, arrow-key movement, STL download, reset to 100%, and mouse drag at a 390 × 844 responsive viewport without page overflow. Touch-event handlers are implemented; a physical phone has not been tested. Production/preview builds and preview-policy checks pass.


Physical-fit adjustment: postcard top-rail tabs are now 5.2 × 3.4 × 8.5 mm with tapered tips, giving 0.4 mm width clearance per side in the unchanged frame pockets. Reprint only the rail or try its small fit coupon first. Rear screw positions are unchanged.

Frame V2: separate screwless rear-sliding top rail, with dovetail end stops and small fit coupons. Validate the image-channel region against the V1 solid and preserve the base/LED holder byte-for-byte. Source and files: models/bambu-led-frames/frame-v2/.


Frame V2 print orientation: the frame is exported display-face down and its rail exposed-rear-face down. The rail keeper is flush with that print face, with 959.32 mm² of verified plate contact. Image channel, dovetail clearance, base and LED fitting remain unchanged.


V2 loose-rail adjustment: only the top rail female dovetails now use 0.1 mm side/top clearance. The main-frame STL/STEP and frame coupon files are hash-verified unchanged; reprint only the rail or its short fit coupon.

## Design Studio redesign

Conversational project copy, compact navigation (mobile Menu button without chevrons), and a remembered Light/Dark toggle. Light is the default. Nameplates and keyrings offer 12 locally bundled Noto/Nunito font faces. Keyrings support heart, star and cloud outlines plus up to eight heart, star, cloud, flower or plus symbols. The top-down symbol editor supports pointer/touch dragging, arrow-key positioning (Shift for larger steps), resizing and removal. Geometry validates placement inside the outline with 3 mm edge/hole clearance. Existing generators, exports and sample collections remain available. Physical print quality still requires testing.

### Keyring outline correction
Shape selection now starts with suitable dimensions: rounded/capsule 70 × 25, circle 50 × 50, heart 60 × 55, star 60 × 60 and cloud 70 × 45 mm. The previous shape selection retained the thin rectangular dimensions, squashing the heart and preventing other outlines from fitting the default text. Regression coverage now selects every outline directly from a fresh page with unchanged EXPLORE text, adds a symbol and downloads both STL and 3MF. Individual top-view screenshots support visual review.
