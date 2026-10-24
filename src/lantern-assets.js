import side from '../models/bambu-led-frames/exports/lantern_side_frame.stl?url&no-inline';
import retainer from '../models/bambu-led-frames/exports/lantern_top_retainer.stl?url&no-inline';
import base from '../models/bambu-led-frames/exports/lantern_base.stl?url&no-inline';
import ring from '../models/bambu-led-frames/exports/lantern_top_ring.stl?url&no-inline';
import {readSTL} from './lantern-model.js';
export async function loadLanternMeshes(){const entries=await Promise.all(Object.entries({side,retainer,base,ring}).map(async([key,url])=>{const r=await fetch(url);if(!r.ok)throw Error('Could not load the lantern frame. Please retry.');return [key,readSTL(await r.arrayBuffer())];}));return Object.fromEntries(entries);}
