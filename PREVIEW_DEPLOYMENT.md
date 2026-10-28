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

## Mechanical clickers


Seven presets offer up to 12 buttons, 12 fonts and ten symbol collections with twelve choices each, including Christmas. Each download contains only one closed base and one cap per button, plus a text guide. There are no separate decks, inserts or fit-test models.

The default base is 15.8 mm high with a 1.8 mm floor, 9 mm blind square pockets and 5 mm upper wells. Dry-fit switches first. Glue the fixed lower housing sides to the pocket walls, or its stationary flange to the surrounding ledge. Keep adhesive off moving stems, seams, contacts and caps. Let it cure before adding the caps. Actual switch fit needs physical verification.

Caps taper from 21.5 mm to 18.8 mm with rounded corners and hollow skirts. Automated tests check closed meshes, switch-pocket floors and glue ledges, cap taper and coverage, nominal 4 mm travel, every symbol and export part counts. `npm run test:clickers` checks the complete browser flow, downloads, all presets, touch and responsive layouts.


Letter Charms support 1–12 buttons; Number Pad 1–9; Daisy Chain exactly 5; Pocket Pebble exactly 1. Pocket Arcade, Christmas Clicks and Cloud Cluster support 1–5. Pocket Pebble batch downloads support 1–64 characters, including an A–Z preset. All lettering accepts printable punctuation such as !"£$%. Removed Name Bar and Symbol Strip presets are unavailable.

## Resizable desk collection

`/desk/` generates storage drawers, pen pots and sorting trays locally. Width, depth, height, wall/floor thickness, compartments, drawer count (1–4) and per-side drawer clearance are adjustable. Smooth, Soft Fluted and Slatted finishes change the exported solids; Ivory/Sand, Sage/Cream and Charcoal/Wood palettes affect the preview only.

Each finished part is measured in its supplied printing orientation and must remain within 170 × 170 × 170 mm for the A1 mini’s 180 mm build volume. Invalid or oversized settings block generation and downloads. Brims, supports and slicer exclusions still need checking. Parts may require multiple plates; 3MF is not printer-bed packing.

Print the drawer case on its closed back, open front upwards, so its shelves print vertically. Print drawers, pots and trays bottom-down and open-side-up. STL ZIP and millimetre 3MF contain separate named parts; the guide lists their print sizes and orientation. The assembled preview includes an open-drawer view and a view of printing orientations. Physical fit, strength and surface quality are untested.

Validation: 73 unit tests pass, including eight desk geometry tests for connected/closed/oriented meshes, actual part sizes at the 170 mm limit, resized geometry, dividers, floors, finish changes, assembly dimensions and case/drawer collision checks at 0.2 mm clearance. `npm run test:desk` covers all three items and finishes, resizing, all downloads, invalid settings, palettes, reset/cancellation, mobile and touch. `npm run test:navigation` checks all seven pages at desktop/tablet/mobile sizes in both themes. Production and preview builds plus seven-page CSP/indexing checks pass.

Sorting trays now default to removable inner boxes in a 2 × 2 layout. Rows (1–3), columns (1–4) and per-side clearance (0.2–0.8 mm) are adjustable; fixed dividers and open trays remain optional. Every lift-out box has a separate solid floor and walls, a smooth interior, and a top 0.8 mm below the tray rim. Profiles are clipped to the rounded tray interior with physical clearance. Preview, print-size checks, ZIP and 3MF include each numbered box as an independent part. Digital tests cover all finishes, corner and neighbor collisions, closed floors and export counts; physical fit remains untested.

The sorting tray also offers “Full-width pen box + smaller boxes”. One lift-out pen box spans the tray width and defaults to 50% of its interior depth (adjustable 25–65%). Columns and rows apply to the remaining area. All insert dimensions derive from tray size, finish, wall thickness and clearance; internal spans are listed in the UI and print guide. Selecting this layout starts with one row of smaller boxes. Dimensions that cannot provide the minimum usable space are rejected. Geometry checks cover auto-sizing, part-size limits, collision clearance and separate pen-box STL/3MF exports.

Stackable drawer units: both top variants include four integral 1.2 mm feet with chamfered leading/trailing edges. “Locating pockets” adds matching 1.4 mm recesses with 0.3 mm side clearance; “Smooth top” is the final unit option. Stack only units with matching width and depth. Total height includes the feet, and each additional unit seats 1.2 mm into the one beneath. Drawer cases require at least 2.4 mm walls, preserving roughly 1 mm of roof under the recesses. Files include a pockets/smooth suffix, and the preview has an underside view. Digital tests verify four feet/recesses, solid final tops, closed roof skins, aligned seating, lateral obstruction and the 170 mm part limit. These are nonlocking locating features; physical fit and stack stability remain untested.

## Screw-top containers

The desk collection includes round screw-top containers with adjustable diameter and assembled height, all six surface styles and optional engraved lid text. Two named printable parts: bottom-down container and top-down lid. Lids share a height-independent thread specification (3.6 mm pitch, 1.75 turns); keep diameter, detail and clearance settings the same for interchangeability. The coarse thread has tapered flanks and radial/axial clearance of 0.2–0.8 mm. This is dry storage, not a liquid-tight or food-safe vessel. Digital collision tests cover closed and helical opening poses; physical thread fit still needs a short test print. The existing 8% gyroid, 2 walls and 3/3 skin-layer desk profile is unchanged.

## Compartment storage

Fixed-divider boxes and outer trays with removable pots are separate desk options, each with an optional lift-off lid. Rows (1–3), columns (1–4), exterior dimensions and per-row/per-column shares are adjustable. Empty shares mean equal sizes; `2,1,1` makes one column twice as wide. Pots derive from the actual tray cavity, clearances and selected finish, with solid individual floors and numbered positions. Lift-off lids print top-down with an integral 3 mm locating lip. Lids leave clearance above dividers/pots and do not seal individual cells. Requested height includes the closed lid. Digital tests check connected solids, size limits, lid/insert collisions and vertical removal across all six finishes. Physical fit requires printing. Existing desk 8% gyroid, 2 walls and 3/3 layer profiles remain unchanged.

## Coasters and matching holders

The desk collection includes repeated sets of 4–6 round, rounded-square, hexagonal or monstera coasters. Width/depth (60–160 mm) and total thickness (3–8 mm) are adjustable. Round coasters keep equal width/depth. Flat and recessed/raised-rim surfaces are available; recessed floors retain at least 2.4 mm of model thickness. Monstera can use deliberate cut-through openings or a continuous backing; the backed recessed version keeps its perimeter rim intact. A continuous model surface does not guarantee a watertight print.

Stacking holders follow the selected outline, with a solid floor and top-open finger windows. Upright racks size their slots from the full coaster thickness including any rim. Both holders auto-size to quantity and clearance. Switching between a coaster set and its holder preserves all coaster dimensions/settings. Download the set and holder separately so each has the correct project-wide profile: coasters use 8% gyroid, 2 walls and **5 top / 5 bottom layers**, while holders retain **3/3**. Other profiles are unchanged. UI estimates, guides, 3MF projects and ZIP sidecars use the selected item's profile. All parts are checked against the 170 mm design limit. Larger/deeper surface detail may require smaller coaster dimensions to leave room for the holder walls.

Digital checks cover connected solids, backing coverage, all outlines, surfaces and counts, holder insertion paths, upright slot clearance and all six holder styles. Real Bambu Studio 2.8.2.61 CLI imports and desktop Open Project / Save Project round trips confirm 5/5 for actual coaster geometry and 3/3 for both actual holder projects. Physical fit and moisture resistance require print testing.

## Coaster page and site naming

Coasters and their two holder types now live at `/coasters/`, with their own homepage card, menu link, page metadata and reset defaults. `/desk/` lists storage and desk items only. Both pages reuse the same geometry/export engine; print profiles are unchanged (coasters 5/5, holders and desk items 3/3). All eight pages include one shared note about A1 mini starting designs, custom-size checks and splitting larger sets across plates. The former decorative collection name has been removed from page copy, metadata and filenames.

## Four-postcard lantern

The lithophane Fit menu now includes a four-photo lantern using the existing postcard frame CAD. Each 105 × 148 mm panel has its own image and crop. The assembled preview shows frame geometry and photo placement; the grey LED is reference-only. Frame-only and complete STL/3MF ZIP downloads include assembly guidance and material estimates. Extract the ZIP before opening each 3MF as a separate project: panels retain 4/4 layers; frame parts retain 3/3. Both retain 8% gyroid and 2 walls. Actual downloaded projects passed Bambu Studio 2.8.2.61 CLI import and desktop Open/Save round trips. See `docs/lantern-studio.md` for geometry, profile and browser verification. Physical LED/panel fit and thermal/light testing remain required.

## Integral bin rim and thinner swing lid

Bins now have two printable parts: the body with a built-in rim and the lid. The 2.5 mm lid carries longer 2.5 mm round pins, with upward-open blind seats for drop-in assembly and removal. An internal 45-degree ramp supports the rim transition. No separate rim or glue is needed. See `docs/bin-integral-rim.md`; this replaces the earlier three-part bin assembly. Existing print settings remain unchanged.

## Monstera plant holder

Monstera coasters now have engraved branching veins and a suggested elongated leaf proportion. A plant-display holder joins the stacking tray and upright rack on `/coasters/`, with a styled pot, keyed socket plate and removable stems for 4, 6, 8 or 10 leaves. Reference leaves appear only in the assembled preview; download the matching coaster set separately. Every part retains the A1 mini limit. Coasters keep 5/5 skins, holders keep 3/3, and both retain 8% gyroid with two walls. See `docs/monstera-coasters.md` for fit, assembly and physical validation limits.

## Optional drawer colour sheets

Openwork drawers can now include top-loading guides and separate 1 mm printable colour sheets. Plain cutouts remain the default, without guides or slots, and match the previous meshes exactly. Front/front-and-sides selection controls which sheets are supplied; every sheet follows its drawer's dimensions and is printed flat. Preview colour is independent of the existing body palette. Desk profiles remain 8% gyroid, two walls and 3/3 layers; thin sheets become solid through skin overlap. See `docs/drawer-colour-sheets.md` for assembly and validation details.

Drawer colour sheets now sit just 0.2 mm behind the inner perforated wall. A continuous 1.2 mm-high bottom retaining lip forms the drop-in channel; side/end guides and divider clearances retain vertical insertion and removal. Plain cutout geometry and print profiles remain unchanged.

## Captured bin hinge and branching coaster plant

The bin retains two printable parts. Integral 2.5 mm lid pins clip into enclosed bearings by flexing the rim; stop tabs limit opening to about 90 degrees from closed in either direction. The 2.5 mm main lid panel prints top-down, with local hinge/stop features underneath. This replaces the open pivot seats.

The plant holder now uses one segmented central trunk with branch hubs and flat-printing removable branches. Leaves hang downward by reinforced stem holes on upward-facing pegs, rather than sitting on individual posts in the pot. The new hanging-hole option must be enabled for matching leaf coasters. Existing stacking and rack holders remain available. Every part keeps the A1 mini size check and its existing profile (3/3 holder/bin, 5/5 coasters, 8% gyroid, two walls). See the bin and monstera design notes for assembly and physical validation limits.

Validation: all 139 geometry/unit tests passed, plus targeted hanging-leaf balance and capture checks. Bin, coaster and plant browser checks passed. Actual Bambu Studio CLI imports and desktop Open/Save round trips retained the agreed profiles; production and preview builds passed. Physical clip force, wear and plant stability still require printed samples.

## Kitchen and bathroom collections

Separate `/kitchen/` and `/bathroom/` generators join Desk and Coasters under Home & Living in the compact menu. Both pages share existing trays, pots, containers and bins rather than forking their geometry. New items: a modular threaded kitchen-roll holder with optional ballast chamber, refillable cocktail-stick dispenser, draining sink caddy, spoon rest, removable-platform soap dish, draining toothbrush holder, vanity tray/pot set and cotton-pad dispenser. All support the six shared surface styles and resizing with 170 mm per-part checks. Roll shaft sections include their connectors within 70–150 mm. Wet items offer independent floor drainage, patterned walls/platform and solid removable catch trays. Every new item retains 8% gyroid, two walls and 3/3 layers, with gram estimates and matching guides/ZIP sidecars/complete Bambu projects. No existing profile exceptions change.

Validation includes connected meshes and assembled interference across all styles and resized extremes, full roll-thread unscrewing travel, drainage cross-sections and tray lift-out paths. Browser checks cover all collection items, all styles, downloads, drainage controls, sizing errors, mobile layouts and navigation across ten pages. All eight actual downloaded new-item 3MFs retain the A1 mini profile and agreed process values after both Bambu Studio CLI import and desktop Open/Save round trips. Physical thread fit, dispensing, drainage and stability still need printed samples. See `docs/home-collections.md`.

Release checks: all 147 tests passed, as did the collection browser checks, ten-page navigation check, production/preview builds and preview CSP/indexing checks. Actual desktop and CLI profile checks passed for all eight new accessory types.

## Modular cupboards, drawer connectors, mixed finishes and soap retaining sides

Desk adds single/double-door cupboards, selectable left/right single hinges, integral barrels with separate printed pins, and joined door panels moving as one tall leaf. Automatic floors/tops give a 340 mm cupboard from two 170 mm modules without intermediate floors; manual face overrides and vertical/side-by-side rear locking clips are available. Closed total width remains at most 170 mm. Adjacent inner doors in side-by-side double-door layouts use 90° stops and slim pulls; ordinary doors open about 110°. Replaceable pins remain removable in the shortest stacks. Printed catches/pulls are included, with optional 6 × 2 mm magnet pockets.

Drawer units can also use rear locking clips; drawers reserve 2.4 mm behind their backs for stud heads. Mixed drawer styles allow each drawer to choose its own finish while retaining aligned fronts and matching colour sheets. Soap platforms add independently adjustable 0–20 mm retaining sides (5 mm default), without changing their solid catch trays or lift-out fit. All agreed print profiles remain unchanged. See the modular-cupboard, mixed-drawer and home-collection design notes for assembly and physical-test limits.

Release validation: 156 regression tests passed. The final cupboard geometry also passed all seven focused assembly/style/openwork/connector/hinge-removal tests after printability refinements. Cupboard and Home browser checks passed, including mixed drawer controls and soap-side heights. Actual downloaded cupboard/grid, mixed-drawer and soap 3MFs retained the agreed profiles through Bambu CLI import and desktop Open/Save checks. Final single/double cases, a door panel and a locking clip were sliced by Bambu Studio with no cantilever warnings; sliced projects contain toolpaths and unchanged 8% gyroid / 2 wall / 3+3 settings. Production/preview builds and preview policy checks passed. Double-door cases use a 6 mm centre divider; single-door cases retain full open width. Physical snap retention, hinge wear, fit and stack stability remain for first printed samples. The monstera pot revision is paused and is not included.

Final retaining-part checks: connector barbs use a split profile that compresses within the round port, with long in-plane spring arms. Pulls use rigid quarter-turn T-studs rather than short snap stems. All 11 focused cupboard/connector/pull/soap/mixed-drawer tests passed on the final geometry. Final browser-exported projects for cupboards, grids, mixed drawers and soap dishes passed Bambu desktop Open/Save checks. The final door, connector and pull also sliced without warnings and retained the agreed settings in their sliced projects.

## Homepage collection refresh

The homepage now separates personal projects from Home & Living, features modular cupboards, and includes full Kitchen and Bathroom cards alongside Desk and Coasters. New images are captured from the actual generators, including raised soap sides. Copy highlights mixed drawer finishes, connectors and the current collections. The cupboard call-to-action opens `/desk/?item=cupboard#studio` directly; reset retains that entry selection and unrecognised item queries fall back to drawers. Generator geometry and print profiles are unchanged.

Validation: homepage images, ten cards, desktop/tablet/mobile Light/Dark layouts, direct cupboard selection/reset and unknown-query fallback passed in the browser. SEO tests, production/preview builds and preview CSP/indexing checks passed.

## Single-door cupboards only

Cupboards now offer only left- or right-hinged single doors. The double-door selector, centre-divider geometry and associated public copy are removed. Legacy double-door settings normalize to a single door. Side-by-side columns and vertically linked panels remain available. Single-door mesh buffers and assembly transforms match the previous release across left/right and one/two-column configurations; print profiles are unchanged. All ten cupboard tests and the cupboard browser/export/mobile checks passed.

### Monstera guide outline and AMS veins

- Reworked the leaf silhouette, curved splits, fenestrations and lobe-following vein network against the supplied guide. Matching shaped holders share the same botanical-v3 outline.
- Added optional flush AMS veins, selectable colour and 2/3-layer inlay depth. Plant preset uses AMS; matching coaster sets retain the choice. Leaf pairs export as aligned multipart objects, decorated face on the bed.
- Geometry checks cover both backings, extreme dimensions, holder fit and 4/6/8/10-leaf plant assembly/removal/balance. Browser checks cover previews, both printers, downloads and mobile.
- Native Bambu Studio slicing confirms the vein filament only at 0.2/0.4 mm or 0.2/0.4/0.6 mm. Desktop Open/Save retains both filament assignments and the existing profiles: 8% gyroid, 2 walls, coaster 5/5 and holder 3/3.
