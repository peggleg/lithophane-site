import {strToU8} from './zip.js';
export const printDefaults=Object.freeze({sparse_infill_pattern:'gyroid',sparse_infill_density:'8%',wall_loops:'2',top_shell_layers:'4',bottom_shell_layers:'4'});
export const printProfileSummary='Default starting settings: 8% gyroid sparse infill, 2 wall loops, 4 top and 4 bottom layers. Confirm settings and toolpaths in your slicer; strength and print quality require physical testing.';
export const printProfileImport='3MF includes starting settings for compatible Bambu Studio/OrcaSlicer project imports. Confirm them after import; other slicers or geometry-only imports may ignore them. STL cannot store slicing settings. No printer, filament, supports or colour changes are assigned.';
export const profileFiles=()=>({'Metadata/project_settings.config':strToU8(JSON.stringify(printDefaults,null,2))});
export const profileSidecar=()=>strToU8(JSON.stringify(printDefaults,null,2));
