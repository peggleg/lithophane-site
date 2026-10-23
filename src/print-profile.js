import {strToU8} from './zip.js';
export const printDefaults=Object.freeze({sparse_infill_pattern:'gyroid',sparse_infill_density:'8%',wall_loops:'2',top_shell_layers:'3',bottom_shell_layers:'3'});
// New generators inherit 3 layers; photo tools retain their existing profile.
export function printProfile(kind){const layers=['lithophane','fan'].includes(kind)?'4':['keyring','nameplate'].includes(kind)?'2':'3';return {...printDefaults,top_shell_layers:layers,bottom_shell_layers:layers};}
export const profileSummary=kind=>`Default starting settings: 8% gyroid sparse infill, 2 wall loops, ${printProfile(kind).top_shell_layers} top and ${printProfile(kind).bottom_shell_layers} bottom layers. Confirm settings and toolpaths in your slicer; strength and print quality require physical testing.`;
export const printProfileSummary=profileSummary();
export const printProfileImport='3MF includes starting settings for compatible Bambu Studio/OrcaSlicer project imports. Confirm them after import; other slicers or geometry-only imports may ignore them. STL cannot store slicing settings. No printer, filament, supports or colour changes are assigned.';
export const profileFiles=kind=>({'Metadata/project_settings.config':strToU8(JSON.stringify(printProfile(kind),null,2))});
export const profileSidecar=kind=>strToU8(JSON.stringify(printProfile(kind),null,2));
