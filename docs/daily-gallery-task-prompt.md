# Daily flat lithophane and cylinder artwork task

Replace the existing task prompt with the text below. Keep its existing schedule, timezone, enabled state and execution environment.

Add one new, original lithophane-ready picture to EACH existing holiday collection in BOTH the flat lithophane seasonal gallery and the lithophane cylinder gallery of peggleg/lithophane-site. This means one new flat picture AND one separate new cylinder panorama per holiday on each run; neither replaces the other. Never use people, faces or human silhouettes in any image.

Discover the current flat holiday collections from src/postcards.js and src/seasonal.js. Discover cylinder collections and entries from src/cylinder-catalogue.js, src/cylinder-additions.json and src/cylinder-artwork.js. There are currently eight holidays: Christmas, Easter, Halloween, Valentine’s Day, New Year, Mother’s Day, Father’s Day and Thanksgiving. Match the existing collection IDs and holiday names, including year-specific New Year labels.

FLAT LITHOPHANES: Randomize portrait and landscape orientation. Create varied, detailed artwork suited to backlit lithophanes, consistent with the existing gallery quality and postcard proportions. Avoid duplicating existing scenes. Append each new picture to its matching flat holiday collection so it can be selected and loaded in the lithophane studio.

CYLINDERS: Always create purpose-made LANDSCAPE panoramas, approximately 3:1 for each scene, designed to wrap continuously through 360 degrees. Never use portrait images or simply recrop/reuse a flat-gallery picture. Compose the left and right edges to match in horizon, sky luminance, terrain and vegetation; keep major subjects away from the join. Use the existing periodic texture pipeline, inspect both the full processed panorama and the actual wrapped 3D preview, and inspect the right-to-left join close-up. Matching edge pixels alone is insufficient: reject obvious discontinuities, ghosting or distorted focal subjects. Append each panorama as a new dated entry in src/cylinder-additions.json, using a new asset under src/assets/cylinders/ and the correct row/rows metadata. Do not add rows to, alter the row count of, or remap any existing atlas. Keep every previous panorama selectable and loadable.

Use the latest preview/lithophane branch, read repository instructions, and preserve other contributors’ changes. Use genuinely new assets with unique dated filenames and stable unique catalogue IDs. NEVER delete, replace, overwrite, recrop, remap or remove ANY existing picture, atlas, asset or catalogue entry from either gallery. Additions must accumulate. Capture and test preservation of all previous IDs, entries, asset bytes and crop/row mappings. Adapt fixed-count tests to verify additive growth without dropping their coverage.

Preserve existing lithophane/fan profiles, cylinder and stand geometry, the 38 mm diameter × 19 mm LED tealight specification, shared fit settings, all agreed printer/export settings, default A1 mini sizing, optional Bambu A1, complete Bambu 3MF downloads and flat postcard dimensions. This is a flat-and-cylinder artwork task, not an openwork ornament or stand-design task. Do not change unrelated products.

Run appropriate flat gallery, cylinder catalogue/asset and preservation tests plus the preview build/check. Inspect all new pictures and their actual flat crops or cylinder wraps. Commit and push additions to preview/lithophane only, never production. Verify that the preview deployment succeeds before reporting completion. If any asset cannot be generated or checks fail, preserve all previous pictures, report the blocker accurately, and do not claim an incomplete addition.

Report the new titles grouped by holiday and by flat picture versus cylinder panorama, the commit SHA, and both preview URLs:
https://preview-lithophane.lithophane-site.pages.dev/lithophane/
https://preview-lithophane.lithophane-site.pages.dev/cylinders/
