# Printable games

Games: Dots and Boxes, Peg Solitaire, Tic-tac-toe, Four in a Row and a configurable marble run. Reversi is excluded.

All playing-board lids flip to close with the smooth back facing outward. Loose parts store in the board box. Corners and exposed edges are rounded. Each box/lid pair has four internal corner pockets per face: nominal Ø6 × 2 mm magnets, modelled as 6.2 mm diameter × 2 mm deep pockets for fit/adhesive. Check polarity with the lid flipped closed before gluing.

Every generator defaults to A1 mini, retaining the existing 170 mm per-part design allowance on its 180 mm bed. Optional Bambu A1 game boards stop at 250 mm. Print settings remain 8% gyroid, 2 walls and 3 top/bottom layers through the shared profile source.

## Slim storage

Automatic height finds the smallest whole-millimetre height accepted by the packing checks, using actual mesh bounds, side rotations and several deterministic packing orders. It does not scale height in proportion to board width. Custom taller heights remain available, subject to mechanical and packing constraints.

Default 150 × 150 mm configurations:

| Game | Box body | Closed with 6 mm lid |
| --- | --- | --- |
| Dots and Boxes | 12 mm | 18 mm |
| Tic-tac-toe | 10 mm | 16 mm |
| Peg Solitaire, pumpkin pegs | 15 mm | 21 mm |
| Four in a Row | 28 mm | 34 mm |
| Marble run, one layer per board | 25 mm | 31 mm |

Packing checks reserve the 3 mm floor, lid clearance and space beneath the inward-facing fixed dots. Pegs and long marble-run parts may lie on their sides in storage while retaining their original printing orientations. Heights recalculate when footprint, seasonal style, spare quantities, track pieces or storage layers change. These are practical layouts of non-overlapping rectangular envelopes, not a claim of globally optimal irregular-shape packing.

## Dots and Boxes

150 mm defaults to 36 boxes (6 × 6) and 49 short dots integrated into the board. Only 84 notched bars and 36 claim tiles are loose. Total export: 122 parts including board and box. Dots stand 3.8 mm above the playing face. Bar end notches allow adjacent connectors without overlap. Whole-cell counts follow board size with a minimum 21 mm pitch and 12 mm border.

## Seasonal Peg Solitaire

Classic English 33-hole cross with an empty centre and 32 pegs, plus optional spares. Five single-colour one-piece peg styles: tulip, strawberry, pumpkin, snowman and fir tree, all with the same fitting stems. Decorative heads stay clear of adjacent positions. Complete-kit and pegs-only replacement exports are available. Pegs print stem-down and pack on their sides.

## Tic-tac-toe

3 × 3 recessed board, five chunky X pieces and four O pieces. All nine symbols store flat inside the reversible board box.

## Four in a Row: counter release

Seven columns and six rows. The two channel shells print outer-face-down and join with four user-supplied M3 × 10 mm countersunk screws and standard 2.4 mm-high M3 hex nuts. Forty-two counters print flat. Printed hinge pins are captured between the two bolted grid halves; removable stops support the upright grid. Place the pins in the base ears first, then bring the two grid shells around them and seat the heads in their retaining pockets before fitting the bolts.

A flat shutter slides through integrated C-shaped bottom guides. Its rounded central pull tab projects toward the front of the box. Pull it straight toward you until the shutter comes free: every column outlet opens and the counters drop into the base. A shallow forward slope below the grid directs the falling counters away from the outlets. Side shoulders establish the closed insertion position when the shutter is pushed back home. The preview includes open/closed release states while the grid is upright.

The window centres match the actual stacked counter diameter. The minimum working depth also gives each counter enough room to fully clear its outlet before hitting the catch ramp: 28 mm at 120/150 mm footprints, 31 mm at 170 mm, and 42 mm at 250 mm. This functional clearance replaces proportional height scaling. Functional channel and shutter-slot cuts have explicit clearance without bevels narrowing their mouths. Guide additions preserve the hinge bores. Remove the shutter and upright stops, pack them flat with the counters, then fold the empty grid and close the lid. The countersunk-head half faces upward when folded; the nuts and screw tips face into the case and have at least 1.2 mm clearance above packed parts. Heads and nuts are preview-only reference meshes, excluded from print files and filament estimates. Use the specified standard hardware rather than raised heads or taller locknuts. The hinge sits 5 mm below the box rim to avoid unused space above the folded grid. Minimum height checks include separate low/front and raised/rear storage zones, keeping pieces clear of the catch ramp, hinge mounts, folded grid and lid.

## Expandable marble run

Up to 3 × 3 connecting board modules; default two boards side by side. The slim default is one storage layer per board. Users can add matching storage layers and individually select straight, curved, ramp, T-junction and funnel track pieces, risers and cross-braces. Automatic layer height follows the selected kit. Expansion-only exports omit boards/boxes while retaining them as preview context.

Module pitch follows board size and marble diameter. Match those settings when printing expansion packs. Height supports use separate connector studs and cross-braces. The play preview places an automatic serpentine route from available pieces; unused parts remain packed inside.

Printable marbles use two equator-down hemispheres plus a separate printed alignment pin. Glue both halves and smooth the equator seam. All parts, including marbles, pack inside the selected boxes/layers.

## Verification

Geometry checks cover fixed-dot connectivity and bar clearance; packing envelopes and rotations; floors, ramps and lid clearance; all seasonal head/stem connections; folded Four in a Row and hinge clearance; closed shutter retention in all seven columns; open outlet clearance; stop shoulders; counter/channel clearance; native printer limits and shared print-profile coverage.

Browser checks cover actual ZIP/3MF/guide downloads on both printers, minimum heights, custom/automatic controls, packed views, release preview, quantities, invalid/stale exports, reset and mobile overflow. Native Bambu project import and slicing check supplied printing orientations and skipped-object counts. Artifacts and logs are stored under ignored artifacts directories.

Desktop GUI Open/Save remains unavailable: the official extracted Bambu Studio executable requests WebKit helpers from a hard-coded /usr/lib path unavailable in this non-root runtime. Native CLI import does not cover desktop preset inheritance. The broad default test invocation previously encountered an unrelated clicker-test worker failure and was stopped during an unrelated long-running geometry test; targeted sequential game regressions are used here.

Useful commands: npm run test:games, test:games-browser, test:games-native, test:compact-games-browser and test:slim-games-browser. Native checks require BAMBU_STUDIO_PATH; browser checks use the local preview at port 4175 and create the native fixtures.

Current native slice audits passed with no skipped objects: Dots and Boxes 122 parts / 3 plates; Tic-tac-toe 11 / 3; Peg Solitaire 34 / 3; Four in a Row 51 / 4; Marble Run 86 / 6. Both selected printer projects preserve the agreed process settings. Final Four in a Row browser fixtures include the countersunk hardware reference meshes, captured pins, open release view, 28 mm default and 42 mm working depth at 250 mm width. Geometry regressions additionally verify all seven outlets, counter/hardware clearance at fit offsets, axial pin retention, hardware/lid clearance and full-counter drop envelopes across both printer sizes.
