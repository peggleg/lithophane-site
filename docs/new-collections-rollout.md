# Approved collection rollout

Publish each item to preview/lithophane and confirm Cloudflare before enabling the next item. Never publish to production. The concept boards are the appearance target; actual geometry previews must show the same rounded silhouettes, clear functional joints and muted palette. Do not replace printable geometry with generated render artwork.

Current state (29 October 2026): desk mounts and the pegboard range are deployed, including the cup/mug holder. Pegboards have quick-move lift-off mounts as well as screw-fixed adapters, sharing the desk-clamp rail. Cable guides now have automatically sized round seats and clip depth, adjustable radial clearance and a curved rear stop. The user removed prototype/untested disclaimers from public copy; keep internal checks and factual assembly guidance.

Active: crochet collection. Seed nursery, wick-fed reservoir, connecting two-cell grow rows and write-on label batches are all deployed to preview with Cloudflare success, ending at 7c823532292a7cbac78d648165aa05d6f530c4eb. The fluted yarn bowl with curved divided storage base is implemented and validated: four pieces (bowl, open-top case, separate support cover, drawer), finished bowl diameter is exact including flutes, storage height and drawer sections are adjustable, and the yarn path is rounded J-shaped. Geometry, mobile, native slicing, both desktop Open/Save, navigation/homepage and CSP checks passed. Publish the yarn bowl next. Continue with hook/notions cabinet and project pod, then hook rest/spool cradle where useful, followed by the approved board-game items. A cabinet draft is preserved outside the repo at /workspace/crochet-cabinet-draft.js; its placement uses existing ZYX support in desk-preview and the kernel's rotation order. Seeds/crochet use 8% gyroid, two walls and 3/3 skins. Dated notes below are history, not current status.

Order:
1. Desk mounts: padded removable clamp, headphone hook, controller cradle, remote pocket, cable guide. One standard removable accessory interface across all sizes. No holes or adhesive in the desk. Broad soft contact pads; make pad materials explicit.
2. Pegboards: connecting panels with appropriately distributed independent supports; hooks, cups, spool/tape accessories and reusable mounting accessories. Wall and desk-clamp supports must be distinguished.
3. Seed starters: removable-cell nursery, wick/reservoir starter, modular grow rows and labels.
4. Crochet: yarn bowl and storage base, hook/notions cabinet, project pod and removable tray; keep original hook rest and spool cradle concepts available where useful.
5. Board games: dice tower/tray, card/token station, manual card shuffler and compact variant. No linked game rail.

All item dimensions adjustable where mechanically appropriate. Standard interfaces, threads and gear relationships remain compatible. Defaults: A1 mini (170 mm design allowance); optional Bambu A1 256 mm. Print defaults: load-bearing mounts and future pegboards use 30% gyroid, 4 walls and 5/5 layers after the user requested a strength review. Other new non-load-bearing items retain 8% gyroid, 2 walls, 3/3 layers. Preserve all existing exceptions. Estimated grams, guides, STL and complete Bambu 3MF projects required. Cancel/stale export handling, mobile previews, native slicer and desktop project round trips required. Digital fit checks do not establish physical strength or surface protection.

Deployed: desk clamp (884109633096ac769261ed56e2b6e1abb3dd1d5c), Cloudflare success. Headphone hook completed with integral catch and optional PLA/PETG coupons; validated and ready for its preview deployment. Next: controller cradle, remote pocket, cable guide. User correction: NO loose locking pin. Use an integral broad release tab/catch; include an optional PLA/PETG connector test. Reuse the deployed clamp rail.

Current steering: strengthen existing mounted items before releasing the controller cradle. Controller work is preserved in /workspace/scratch/controller-before-strength-review.patch. Do not publish its catalogue entry until the strengthened existing mounts have deployed.

Strength review deployed at 055298c2054e9cc40c4d0892a9f9d3f74d5bbc8d; Cloudflare success. Controller cradle implementation resumed using the reinforced profile. Its centre relief has 45-degree transitions for the side printing orientation; rounded horns and the standard integral release latch remain.

Controller cradle validated with closed meshes at 70/160 mm A1 mini and 240 mm Bambu A1 widths, both fit clearances, positive catch engagement, mobile/download checks, native slicing and both desktop project round trips. Ready for its individual preview release; next remote pocket and cable guide.

Controller cradle deployed at ff6b0c51e6d7a99dda5d233bc18b53d7bf1bc7bb; Cloudflare success. Remote pocket in progress. Its upright orientation keeps the storage cavity support-free; the matching latch test must use the same orientation, and the guide explicitly flags layer-bond fatigue testing before use.

Remote pocket validated at 50/160 mm A1 mini and 240 mm A1 widths, 25/80 mm depths and 60/170/240 mm heights: connected shells, engagement and full release clearance, upright printing orientation, mobile/downloads, native slicing and both desktop project round trips. Interior spans are shown in the product note. Ready for individual preview release.

Remote pocket deployed at ea044fbe3ba9edafa6c7bc49800fe8e773f8d2db, Cloudflare success. Cable guide in progress: open round channels with full-depth cable paths and a self-supporting angled underside, using the common integral catch and strengthened print settings.

Cable guide validated for 2/6 channels, 2/8 mm wires and 15/30 mm depth, including full wire paths, positive retention, released removal clearance and both printer projects/native slices/desktop round trips. Ready for individual preview release. First mount category complete after this deployment; next modular pegboards.

Cable guide deployed at 5306ecc40709b2c9e06cb98cf7883a75dcaf0515; Cloudflare success. Mount category complete: clamp, headphone hook, controller cradle, remote pocket and cable guide. Pegboard panel kit in progress: front-accessible alignment keys, 4 independent mounting points per panel (6/8 on panels over 170 mm), soft outer edges and chamfered grid bores.

Pegboard hardware review before release: use true 90° countersinks sized for 4 mm screws with heads up to 9 mm, not a shallow cylindrical recess. Increase wall spacers to 10 mm so rear accessory fasteners can fit without touching the wall. Native fixtures and layout checks must use this final geometry.

Pegboard panel kit validated: closed/connected modules, front key clearances, automatic independent support counts, proper 90-degree screw seats, 10 mm wall spacers, native slicing, both printer desktop round trips and a real 2×2 layout desktop round trip. Navigation, homepage, mobile and indexing/CSP checks pass for the new page. Ready for individual preview release. Next universal accessory adapter and matching pegboard accessories, then seed starters, crochet storage and board games.
