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

`/clickers/` now offers nine designs: Letter Charms, Pocket Arcade, Daisy Chain, Christmas Clicks, Pocket Pebble, Name Bar, Symbol Strip, Number Pad and Cloud Cluster. Create 1–5 independently mounted full-height MX-style buttons with round, rounded-square or heart caps. Six collections provide 30 original symbols: everyday, cute/cosmic, sports, fruit, Halloween and Christmas. Christmas includes a tree, snowflake, present, bauble and gingerbread figure. There are 12 local lettering fonts, themed palettes, per-button preview colours and an optional 4.5 mm keychain eyelet.

Every housing has an integral solid floor and a separately printed press-in switch deck, replacing the first open-bottom prototype. Default floor thickness is 2 mm; the adjustable deck fit defaults to -0.05 mm per side (slight interference). A 0.8 mm perimeter ledge seats the deck, and a 7 mm upper rim encloses the switch housing. Cap footprints have at least 0.6 mm lateral clearance within the wells so caps can enter during a nominal press. Tray, deck and cap geometry is shared by preview, STL ZIP and multipart millimetre 3MF. All exports include a closed-tray fit coupon, matching deck coupon and socket-fit keycap. Print trays bottom-down and decks flat; caps still need underside supports that exclude the cross sockets. The preview offers underside, open-tray and separate-parts views. Grey switch proxies and preview colours are not exported as geometry/filament assignments.

Switch assumptions remain provisional: 14.1 mm opening, 1.5 mm plate, 16 mm internal depth, 2.4 mm lower walls, 23 mm pitch, 5.8 mm connector width, 4 mm insertion and 4.15 × 1.25 mm cross socket. Controls adjust fit dimensions. Test tray/deck retention, boxed-stem clearance, pin enclosure, full travel and eyelet strength on actual prints. The nominal digital cap/housing clearance checks do not establish compatibility with the photographed switch. Switches and chain are supplied separately; physical fit, feel and durability remain untested.

Automated checks inspect the serialized STL floor under every switch as well as closed, oriented positive-volume meshes, all preset/count combinations, all 30 motifs in three cap shapes, fit changes, named parts and nominal 4 mm cap travel. Browser validation covers presets, collections including Christmas, colours, controls, downloads, reset/cancellation, touch and 320/390/1280 px layouts. Use `npm run test:clickers` against `npm run preview:pages`, and `npm run test:browser` for the existing studio regression suite. Deploy only to `preview/lithophane`; production release and physical testing remain separate.
