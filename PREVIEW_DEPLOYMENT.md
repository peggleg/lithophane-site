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

## Resizable Japandi desk collection

`/desk/` generates storage drawers, pen pots and sorting trays locally. Width, depth, height, wall/floor thickness, compartments, drawer count (1–4) and per-side drawer clearance are adjustable. Smooth, Soft Fluted and Slatted finishes change the exported solids; Ivory/Sand, Sage/Cream and Charcoal/Wood palettes affect the preview only.

Each finished part is measured in its supplied printing orientation and must remain within 170 × 170 × 170 mm for the A1 mini’s 180 mm build volume. Invalid or oversized settings block generation and downloads. Brims, supports and slicer exclusions still need checking. Parts may require multiple plates; 3MF is not printer-bed packing.

Print the drawer case on its closed back, open front upwards, so its shelves print vertically. Print drawers, pots and trays bottom-down and open-side-up. STL ZIP and millimetre 3MF contain separate named parts; the guide lists their print sizes and orientation. The assembled preview includes an open-drawer view and a view of printing orientations. Physical fit, strength and surface quality are untested.

Validation: 73 unit tests pass, including eight desk geometry tests for connected/closed/oriented meshes, actual part sizes at the 170 mm limit, resized geometry, dividers, floors, finish changes, assembly dimensions and case/drawer collision checks at 0.2 mm clearance. `npm run test:desk` covers all three items and finishes, resizing, all downloads, invalid settings, palettes, reset/cancellation, mobile and touch. `npm run test:navigation` checks all seven pages at desktop/tablet/mobile sizes in both themes. Production and preview builds plus seven-page CSP/indexing checks pass.

Sorting trays now default to removable inner boxes in a 2 × 2 layout. Rows (1–3), columns (1–4) and per-side clearance (0.2–0.8 mm) are adjustable; fixed dividers and open trays remain optional. Every lift-out box has a separate solid floor and walls, a smooth interior, and a top 0.8 mm below the tray rim. Profiles are clipped to the rounded tray interior with physical clearance. Preview, print-size checks, ZIP and 3MF include each numbered box as an independent part. Digital tests cover all finishes, corner and neighbor collisions, closed floors and export counts; physical fit remains untested.

The sorting tray also offers “Full-width pen box + smaller boxes”. One lift-out pen box spans the tray width and defaults to 50% of its interior depth (adjustable 25–65%). Columns and rows apply to the remaining area. All insert dimensions derive from tray size, finish, wall thickness and clearance; internal spans are listed in the UI and print guide. Selecting this layout starts with one row of smaller boxes. Dimensions that cannot provide the minimum usable space are rejected. Geometry checks cover auto-sizing, part-size limits, collision clearance and separate pen-box STL/3MF exports.

Stackable drawer units: both top variants include four integral 1.2 mm feet with chamfered leading/trailing edges. “Locating pockets” adds matching 1.4 mm recesses with 0.3 mm side clearance; “Smooth top” is the final unit option. Stack only units with matching width and depth. Total height includes the feet, and each additional unit seats 1.2 mm into the one beneath. Drawer cases require at least 2.4 mm walls, preserving roughly 1 mm of roof under the recesses. Files include a pockets/smooth suffix, and the preview has an underside view. Digital tests verify four feet/recesses, solid final tops, closed roof skins, aligned seating, lateral obstruction and the 170 mm part limit. These are nonlocking locating features; physical fit and stack stability remain untested.

## Screw-top containers

The desk collection includes round screw-top containers with adjustable diameter and assembled height, all six surface styles and optional engraved lid text. Two named printable parts: bottom-down container and top-down lid. Lids share a height-independent thread specification (3.6 mm pitch, 1.75 turns); keep diameter, detail and clearance settings the same for interchangeability. The coarse thread has tapered flanks and radial/axial clearance of 0.2–0.8 mm. This is dry storage, not a liquid-tight or food-safe vessel. Digital collision tests cover closed and helical opening poses; physical thread fit still needs a short test print. The existing 8% gyroid, 2 walls and 3/3 skin-layer desk profile is unchanged.
