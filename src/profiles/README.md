# Bambu Studio project preset

`a1-mini-pla.json` is a resolved Bambu Studio 02.08.02.61 project configuration: Bambu Lab A1 mini with 0.4 mm nozzle, 0.20mm Standard @BBL A1M and Generic PLA @BBL A1M. Source: https://github.com/bambulab/BambuStudio/tree/v02.08.02.61/resources/profiles/BBL (Bambu Lab; AGPL-3.0, accompanying LICENSE-BambuStudio.txt). Resolved with the official CLI, then changed to the site's print policy, textured PEI plate, no brim, no supports and neutral preview colour. These are starting settings; users must select their actual material and plate and inspect toolpaths. No G-code is exported by the site.

The complete configuration is intentional. A partial JSON file is not a self-contained Bambu project; missing printer fields can give generic machine defaults. The model Application compatibility marker is required by Bambu Studio's project importer; Designer/Generator metadata identifies Design Studio as the actual author. Tested against the official 02.08.02.61 CLI.

Desktop loading also merges the installed system preset. `projectProfile(kind)` supplies `different_settings_to_system` for every intentional process override; an empty list silently resets the values to the inherited Standard preset even when CLI imports read the JSON correctly. Verify through the GUI round-trip driver as well as the CLI.
