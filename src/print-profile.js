import a1MiniPla from './profiles/a1-mini-pla.json' with {type:'json'};
import presetLicense from './profiles/license.json' with {type:'json'};
import {strToU8} from './zip.js';
export const printDefaults=Object.freeze({sparse_infill_pattern:'gyroid',sparse_infill_density:'8%',wall_loops:'2',top_shell_layers:'3',bottom_shell_layers:'3',top_shell_thickness:'0',bottom_shell_thickness:'0'});
// New generators inherit 3 layers; photo tools retain their existing profile.
export function printProfile(kind){const layers=['lithophane','fan'].includes(kind)?'4':['keyring','nameplate'].includes(kind)?'2':'3';return {...printDefaults,top_shell_layers:layers,bottom_shell_layers:layers};}
export const profileSummary=kind=>`Default starting settings: 8% gyroid sparse infill, 2 wall loops, ${printProfile(kind).top_shell_layers} top and ${printProfile(kind).bottom_shell_layers} bottom layers. Confirm settings and toolpaths in your slicer; strength and print quality require physical testing.`;
export const printProfileSummary=profileSummary();
export const printProfileImport='3MF is a Bambu Studio project for an A1 mini with a 0.4 mm nozzle, 0.2 mm layers, Generic PLA and a textured PEI plate. Open it as a project, not geometry only, to load the settings. Arrange all parts across plates before slicing. Select your actual filament and build plate, then confirm the process values; changing presets can reset them. Supports and brim start off: enable them where needed after inspecting toolpaths. Preview colours do not assign colour changes. STL cannot store slicing settings.';
// Bambu Studio only reads project_settings.config for its recognised project format.
// The compatibility marker is required by its importer; Generator identifies our authoring app.
export const projectMetadata='<metadata name="Application">BambuStudio-02.08.02.61</metadata><metadata name="BambuStudio:3mfVersion">1</metadata><metadata name="Generator">Design Studio</metadata><metadata name="Designer">Design Studio</metadata>';
export const projectProfile=kind=>({...a1MiniPla,...printProfile(kind)});
export const profileFiles=kind=>({'Metadata/project_settings.config':strToU8(JSON.stringify(projectProfile(kind),null,2)),'Metadata/PROFILE-LICENSE.txt':strToU8(presetLicense.notice+'\n\n'+presetLicense.license)});
export const profileSidecar=kind=>strToU8(JSON.stringify(printProfile(kind),null,2));
