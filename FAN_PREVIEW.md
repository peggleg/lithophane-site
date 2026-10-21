# Folding fan preview

The isolated generator is at `folding-fan/`. The existing lithophane page changes only by one navigation link. Fan styles import the shared theme but are loaded only by the new page. Vite builds both HTML entrypoints; relative navigation works under `/` and `/lithophane/`.

Default: 11 white PLA blades, 155 mm pivot-to-tip, 150° opening. Frames are 1.2 mm and image relief is 0.6–1.2 mm. Nominal stack is 13.2 mm of blades + 1 mm movement allowance + two 0.4 mm guards = 15 mm. Pin head, washers and retaining nut protrude beyond that stack. Thirteen blades exceed the target and show a warning.

Downloads include numbered STL files, printable coarse-thread pivot hardware, optional two-piece passive stand and assembly instructions. The test ZIP contains the actual full-length pivot and three 1.2 mm eyelet coupons. Ribbon and adhesive are supplied separately. Multipart 3MF places blades in open assembly coordinates and hardware alongside; arrange in the slicer before printing. Preview is an illustrative 2D projection, not a collision or light-transmission simulation. Neither thread fit nor folding durability is physically validated.

Verification: 32 automated tests, preview and production builds, preview indexing checks and existing 0.2/0.1 mm resolution regression pass. Chromium checks cover fan views, sample and photo input, crop adjustments, all three downloads, cancel, reset, invalid sizes and 390px layout; current panel sample STL/3MF exports and reset also pass. ZIP integrity and 19-object millimetre 3MF were parsed independently. Physical three-blade and pivot prototypes remain required.

Push only to `preview/lithophane`; the existing Cloudflare Pages Git integration handles deployment. Do not invoke the obsolete Direct Upload scripts. The branch alias is https://preview-lithophane.lithophane-site.pages.dev/folding-fan/ . Confirm a successful check for the current commit before treating it as deployed.
