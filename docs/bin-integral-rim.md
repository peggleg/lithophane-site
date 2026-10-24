# Two-part desk bin revision

Square and round bins now export exactly two connected printable parts: `bin-body-integral-rim` and `flat-swing-lid`. This supersedes the separate rim, bearing pads and underside assembly described in the earlier fit audit and slicing benchmark. Old printed rims/lids are not interchangeable with these revised parts.

The lid plate is 2.5 mm thick with 2.5 mm diameter circular pins. The default 110 mm smooth bin has a 100.4 mm opening, 99.2 mm lid plate, 108.4 mm total pin span and 4.6 mm pin projection per side. The rim is at least 4.8 mm wide and 5 mm tall, with a 45-degree internal transition supporting its inward growth. Body walls and solid floor retain their existing dimensions.

The two blind bearing seats open upward. Lower the lid vertically from above, aligning both pins; no rim assembly, glue or flexing is required. The lid lifts out for cleaning rather than snapping into a captured hinge. The entries are 3.1 mm wide and the circular seats provide 0.3 mm radial allowance. The closed lid is nominally level with the bin top; printed tolerances and seating can alter this slightly. Inspect pin overhangs in the slicer and dry-fit before use. This revision still requires physical fit, wear and strength testing.

Digital regression covers vertical insertion, 180-degree swing and floor clearance, minimum-height rejection, connected closed meshes, real pin cross-sections, flush nominal lid height and A1 mini size limits across square/round bins and all six surface styles. Browser exports/guide/part counts are checked. The actual downloaded 3MF is imported through Bambu Studio 2.8.2.61 CLI and desktop Open Project / Save Project. Print profiles remain 8% gyroid, 2 wall loops and 3 top/3 bottom layers; no other generator's profile changes.

The final browser-downloaded 110 × 110 × 140 mm smooth square example sliced successfully in Bambu Studio 2.8.2.61 on two plates with those settings, no preset overrides and no supports/brim: body about 3.88 h / 146.0 g; lid about 0.55 h / 17.0 g. These are slicer estimates, not measured print results. The horizontal pins still need first-layer/overhang inspection and physical testing.
