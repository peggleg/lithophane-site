import a1Pla from './profiles/a1-pla.json' with {type:'json'};
import {printerKey,printerSpec} from './printer-settings.js';
import a1MiniPla from './profiles/a1-mini-pla.json' with {type:'json'};
import presetLicense from './profiles/license.json' with {type:'json'};
import {strToU8} from './zip.js';
export const printDefaults=Object.freeze({sparse_infill_pattern:'gyroid',sparse_infill_density:'8%',wall_loops:'2',top_shell_layers:'3',bottom_shell_layers:'3',top_shell_thickness:'0',bottom_shell_thickness:'0'});
// Lightweight organisers retain the original policy. Static mounted loads use
// a separately reviewed, more conservative starting profile; no load rating is
// inferred from these process values.
export const loadBearingKinds=Object.freeze(['desk-clamp','cup-holder','headphone-hook','controller-cradle','remote-pocket','cable-guide']);
export const isLoadBearingPrint=kind=>loadBearingKinds.includes(kind)||typeof kind==='string'&&kind.startsWith('pegboard-');
export const usesDirectPegs=(kind,p)=>kind?.startsWith('pegboard-')&&!['pegboard-panel','pegboard-adapter','pegboard-quick-adapter'].includes(kind)&&p?.mountType==='direct';
export function printProfile(kind,settings){const structural=isLoadBearingPrint(kind),layers=structural||kind==='coaster'?'5':['lithophane','fan'].includes(kind)?'4':['keyring','nameplate'].includes(kind)?'2':'3';return {...printDefaults,...(structural?{sparse_infill_density:'30%',wall_loops:'4'}:{}),top_shell_layers:layers,bottom_shell_layers:layers,...(kind==='pegboard-quick-adapter'||usesDirectPegs(kind,settings)?{enable_support:'1',support_type:'normal(auto)'}:{})};}
export const profileSummary=kind=>{const p=printProfile(kind);return `Default starting settings: ${p.sparse_infill_density} ${p.sparse_infill_pattern} sparse infill, ${p.wall_loops} wall loops, ${p.top_shell_layers} top and ${p.bottom_shell_layers} bottom layers. Confirm settings and toolpaths in your slicer.`;};
export const profileFileTag=kind=>isLoadBearingPrint(kind)?'-30pct-4walls-5skins':'';
export const printProfileSummary=profileSummary();
export const printerProfileImport=printer=>'3MF is a Bambu Studio project for '+printerSpec(printer).name+' with a 0.4 mm nozzle, 0.2 mm layers, Generic PLA and a textured PEI plate. Open it as a project, not geometry only, to load the settings. Keep the supplied printing orientations and plate layout; arrange any unplaced parts before slicing. Select your actual filament and build plate, then confirm the process values; changing presets can reset them. '+(printer?.kind==='pegboard-quick-adapter'||usesDirectPegs(printer?.kind,printer)?'Automatic supports start on for the integral pegboard hooks; brim starts off.':'Supports and brim start off: enable them where needed after inspecting toolpaths.')+' Preview colours do not assign colour changes. STL cannot store slicing settings.';
export const printProfileImport=printerProfileImport();
// Bambu Studio only reads project_settings.config for its recognised project format.
// The compatibility marker is required by its importer; Generator identifies our authoring app.
export const projectMetadata='<metadata name="Application">BambuStudio-02.08.02.61</metadata><metadata name="BambuStudio:3mfVersion">1</metadata><metadata name="Generator">Design Studio</metadata><metadata name="Designer">Design Studio</metadata>';
// The desktop preset loader restores inherited defaults for keys absent from this delta list.
// CLI export-settings does not exercise that step. Keep every intentional process override here.
export const projectProfile=(kind,printer)=>({...((printerKey(printer)==='256')?a1Pla:a1MiniPla),...printProfile(kind,printer),different_settings_to_system:[
 [...Object.keys(printProfile(kind,printer)),'layer_height','initial_layer_print_height','brim_type','enable_support'].join(';'),'',''
]});
export const profileFiles=(kind,printer)=>({'Metadata/project_settings.config':strToU8(JSON.stringify(projectProfile(kind,printer),null,2)),'Metadata/PROFILE-LICENSE.txt':strToU8(presetLicense.notice+'\n\n'+presetLicense.license)});
export const profileSidecar=(kind,settings)=>strToU8(JSON.stringify(printProfile(kind,settings),null,2));

export const printerFiles=printer=>{const p=printerSpec(printer);return {'PRINTER-SETTINGS.json':strToU8(JSON.stringify({printer:printerKey(printer),printer_settings_id:p.machine,bed:[p.bed,p.bed,p.bed],designLimit:[p.limit,p.limit,p.limit]},null,2))};};
