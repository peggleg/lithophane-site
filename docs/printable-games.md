# Printable games implementation

Approved scope: Dots and Boxes, seasonal Peg Solitaire, Tic-tac-toe, folding Four in a Row and expandable marble run, in that delivery order. Commit each addition to preview/lithophane separately.

All boards double as storage-box lids. Close with the playing face inward and smooth back outward. Four internal nominal Ø6 × 2 mm magnet pockets per box and four matching lid pockets; generated diameter is 6.2 mm to allow adhesive/fit. Rounded corners and softened edges. A1 mini default retains the existing 170 mm per-part allowance; optional Bambu A1 boards stop at 250 mm. Ordinary game profiles stay 8% gyroid, 2 walls, 3/3 skin layers.

## Dots and Boxes

150 mm default, 6 × 6 boxes, 7 × 7 removable pegs, 84 bars and 36 claim tiles. Pegs are 20–25 mm high above board. Automatic whole-cell counts use a minimum 21 mm pitch and 12 mm border. Generated packed preview validates storage envelope; all pieces export individually in printing orientations and prepared plates. Box height default 60 mm accommodates long pegs and multiple layers of bars/tiles.

Validation: focused Manifold geometry, pocket depth, reversible lid/box collision, storage packing, automatic counts, both printer limits, profile coverage; browser downloads of STL ZIP / recognised Bambu 3MF / guide on both printers, mobile layout, invalid inputs, stale export disabling, reset. Native slicer/desktop validation tracked with generated artifacts.

## Remaining delivered games

Peg Solitaire: 33-hole English cross, 32 pegs plus optional spares, five monolithic seasonal styles (tulip, strawberry, pumpkin, snowman, fir tree), common fitting stems, complete-kit or pegs-only export.

Tic-tac-toe: 3 × 3 recessed board and five X/four O symbols, all stored inside the reversible board box.

Four in a Row: 7 × 6 twin-shell grid with open counter channels, 42 counters, base hinge ears, printed pins, detachable upright stops and sliding bottom release bar. Four M3 assembly bolts/nuts are supplied by the user. Folded-state tests bound the grid inside the storage base.

Marble run: up to 3 × 3 connecting board modules, 1–6 storage layers per module, independent quantities of straight/curve/ramp/T-junction/funnel tracks, risers and cross-braces. Module pitch and channel clearance follow marble diameter and board size. Expansion-only export omits boards/boxes while retaining them as preview context. Printable marbles comprise two equator-down hemispheres plus a separate printed alignment pin. All selected parts are digitally packed across the selected storage spaces; capacity errors request more storage. The play preview places an automatic serpentine route using available pieces and shows unused parts stored inside.

## Verification limits

Focused geometry/profile/printer/plate and existing game regression tests pass. Browser fixtures cover all five games, both printers, actual ZIP/3MF/guide downloads, mobile layout, reset and stale-export invalidation. Native Bambu project import preserves printer/process settings for all five games and both printers. Native slicing verifies supplied orientations and skipped-object counts; logs live in ignored artifacts/products directories.

Desktop GUI Open/Save could not run: the extracted official Bambu Studio executable launches WebKit helpers from a hard-coded /usr/lib path unavailable in this non-root runtime. Native CLI import is not a substitute for desktop preset-inheritance coverage. The broad default test invocation encountered a clicker-test worker failure and was stopped during an unrelated long-running geometry test; focused sequential game regressions were run instead.

Final native slice audits passed with no skipped objects: Dots and Boxes 171 parts / 4 plates; Peg Solitaire 34 / 3; Tic-tac-toe 11 / 3; Four in a Row 51 / 4; Marble Run 90 / 10. The larger marble slice exceeded the original four-minute test budget and passed with the configurable ten-minute budget. Seasonal peg necks were corrected after native slicing exposed an empty-layer gap; connected-component and continuous-neck regression checks now cover all five styles.

Final browser state checks passed for closed views, dynamic 170/250 mm game-board limits, stale exports, storage layer counts, expansion-only 3MF content, all seasonal styles and pegs-only exports. Use npm run test:games, test:games-browser and test:games-native to repeat the checks (native check requires BAMBU_STUDIO_PATH and browser/native fixtures).
