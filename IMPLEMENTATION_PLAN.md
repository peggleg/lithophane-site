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

Conversational project copy, compact navigation (Menu dropdown on desktop and mobile, without chevrons), and a remembered Light/Dark toggle. Light is the default. Nameplates and keyrings offer 12 locally bundled Noto/Nunito font faces. Keyrings support heart, star and cloud outlines plus up to eight heart, star, cloud, flower or plus symbols. The top-down symbol editor supports pointer/touch dragging, arrow-key positioning (Shift for larger steps), resizing and removal. Geometry validates placement inside the outline with 3 mm edge/hole clearance. Existing generators, exports and sample collections remain available. Physical print quality still requires testing.

### Keyring outline correction
Shape selection now starts with suitable dimensions: rounded/capsule 70 × 25, circle 50 × 50, heart 60 × 55, star 60 × 60 and cloud 70 × 45 mm. The previous shape selection retained the thin rectangular dimensions, squashing the heart and preventing other outlines from fitting the default text. Regression coverage now selects every outline directly from a fresh page with unchanged EXPLORE text, adds a symbol and downloads both STL and 3MF. Individual top-view screenshots support visual review.

### Top ring holes and shared symbol editor
Ring holes have 3 mm of surrounding material: left-side holes for rounded rectangles and capsules, top holes for circles, hearts, stars and clouds. Top holes are centred where possible; the heart uses an upper lobe so it clears the notch. Lettering and symbols avoid the actual two-dimensional hole position. Both keyrings and nameplates have a symbol dropdown (heart, star, cloud, flower, plus), with mouse/touch dragging, arrow-key positioning, resizing and removal. Nameplates have edge clearance without a ring-hole exclusion. Tests cover each actual top through-hole, all motifs in raised/recessed nameplates with and without stands, and both browser export formats.

Updated the home-page keyring illustration to show top holes; removed the misplaced decorative metal ring. The illustration remains separate from generated models.

### Shape-specific ring-hole placement
Rounded rectangles and capsules use a left-side ring hole. Circles, hearts, stars and clouds retain a top hole. Text fitting, draggable symbol clearance, the editor, model exports and home-page rectangle illustrations use the same placement rule. Regression checks verify the actual through-hole position and desktop/mobile editor position for every shape.

## Mechanical clickers


Seven presets offer up to 12 buttons, 12 fonts and ten symbol collections with twelve choices each, including Christmas. Each download contains only one closed base and one cap per button, plus a text guide. There are no separate decks, inserts or fit-test models.

The default base is 15.8 mm high with a 1.8 mm floor, 9 mm blind square pockets and 5 mm upper wells. Dry-fit switches first. Glue the fixed lower housing sides to the pocket walls, or its stationary flange to the surrounding ledge. Keep adhesive off moving stems, seams, contacts and caps. Let it cure before adding the caps. Actual switch fit needs physical verification.

Caps taper from 21.5 mm to 18.8 mm with rounded corners and hollow skirts. Automated tests check closed meshes, switch-pocket floors and glue ledges, cap taper and coverage, nominal 4 mm travel, every symbol and export part counts. `npm run test:clickers` checks the complete browser flow, downloads, all presets, touch and responsive layouts.


Letter Charms support 1–12 buttons; Number Pad 1–9; Daisy Chain exactly 5; Pocket Pebble exactly 1. Pocket Arcade, Christmas Clicks and Cloud Cluster support 1–5. Pocket Pebble batch downloads support 1–64 characters, including an A–Z preset. All lettering accepts printable punctuation such as !"£$%. Removed Name Bar and Symbol Strip presets are unavailable.

## Resizable Japandi desk collection

`/desk/` generates storage drawers, pen pots and sorting trays locally. Width, depth, height, wall/floor thickness, compartments, drawer count (1–4) and per-side drawer clearance are adjustable. Smooth, Soft Fluted and Slatted finishes change the exported solids; Ivory/Sand, Sage/Cream and Charcoal/Wood palettes affect the preview only.

Each finished part is measured in its supplied printing orientation and must remain within 170 × 170 × 170 mm for the A1 mini’s 180 mm build volume. Invalid or oversized settings block generation and downloads. Brims, supports and slicer exclusions still need checking. Parts may require multiple plates; 3MF is not printer-bed packing.

Print the drawer case on its closed back, open front upwards, so its shelves print vertically. Print drawers, pots and trays bottom-down and open-side-up. STL ZIP and millimetre 3MF contain separate named parts; the guide lists their print sizes and orientation. The assembled preview includes an open-drawer view and a view of printing orientations. Physical fit, strength and surface quality are untested.

Validation: 73 unit tests pass, including eight desk geometry tests for connected/closed/oriented meshes, actual part sizes at the 170 mm limit, resized geometry, dividers, floors, finish changes, assembly dimensions and case/drawer collision checks at 0.2 mm clearance. `npm run test:desk` covers all three items and finishes, resizing, all downloads, invalid settings, palettes, reset/cancellation, mobile and touch. `npm run test:navigation` checks all seven pages at desktop/tablet/mobile sizes in both themes. Production and preview builds plus seven-page CSP/indexing checks pass.

Sorting trays now default to removable inner boxes in a 2 × 2 layout. Rows (1–3), columns (1–4) and per-side clearance (0.2–0.8 mm) are adjustable; fixed dividers and open trays remain optional. Every lift-out box has a separate solid floor and walls, a smooth interior, and a top 0.8 mm below the tray rim. Profiles are clipped to the rounded tray interior with physical clearance. Preview, print-size checks, ZIP and 3MF include each numbered box as an independent part. Digital tests cover all finishes, corner and neighbor collisions, closed floors and export counts; physical fit remains untested.

The sorting tray also offers “Full-width pen box + smaller boxes”. One lift-out pen box spans the tray width and defaults to 50% of its interior depth (adjustable 25–65%). Columns and rows apply to the remaining area. All insert dimensions derive from tray size, finish, wall thickness and clearance; internal spans are listed in the UI and print guide. Selecting this layout starts with one row of smaller boxes. Dimensions that cannot provide the minimum usable space are rejected. Geometry checks cover auto-sizing, part-size limits, collision clearance and separate pen-box STL/3MF exports.

Stackable drawer units: both top variants include four integral 1.2 mm feet with chamfered leading/trailing edges. “Locating pockets” adds matching 1.4 mm recesses with 0.3 mm side clearance; “Smooth top” is the final unit option. Stack only units with matching width and depth. Total height includes the feet, and each additional unit seats 1.2 mm into the one beneath. Drawer cases require at least 2.4 mm walls, preserving roughly 1 mm of roof under the recesses. Files include a pockets/smooth suffix, and the preview has an underside view. Digital tests verify four feet/recesses, solid final tops, closed roof skins, aligned seating, lateral obstruction and the 170 mm part limit. These are nonlocking locating features; physical fit and stack stability remain untested.


Desk bins and round pen pots: square/round bins export three parts (closed body, removable bearing rim, flat flush swing lid). Integral 2 mm pivot pins seat on raised body pads; the rim encloses them. Glue the stationary rim/body joint only. Bearing clearance is 0.25 mm radial and lid gap 0.6 mm per side. Round pots use one diameter and real radial fluted/slatted detailing. All finished parts remain within 170 mm per print axis. Collision checks cover ±90° lid travel; physical fit, glue durability and balance still require print testing. Inspect pin supports in the slicer.


QR keyrings: optional locally encoded link/text (up to 120 UTF-8 bytes), error correction M, raised modules at least 0.8 mm wide and a four-module quiet border. Layout is fitted inside the actual outline with a 3 mm edge/ring-hole exclusion. QR mode reserves the face, without front lettering or symbols. A light base and dark modules require a slicer colour change; exported geometry does not assign filament. Validate the scan on a physical print. Automated tests decode QR patterns recovered from the exported mesh (including UTF-8), and from the actual rendered preview, and reject undersized/dense layouts.

Desk drawers support 1–4 independent columns and 1–4 rows (up to 16 drawers), with integral vertical dividers and shelves. Drawer widths, positions and compartment validation derive from the selected grid. Back-down case printing is retained; all parts remain within the 170 mm A1 mini limit. Collision tests cover neighboring drawers and the case at closed/partly-open positions across all finishes. Existing stacking feet and top options are preserved. `npm run test:qr-drawers` covers responsive UI, validation, reset and downloads for both additions. Physical drawer fit remains unvalidated.
