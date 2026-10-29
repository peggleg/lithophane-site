import {printerKey,printLimit} from './printer-settings.js';
export const productCollections={mounts:{title:'Desk clamps & accessories',intro:'Move your setup around. A padded desk-edge clamp and one shared connection for interchangeable accessories.'}};
export const productItems={
 'desk-clamp':{collection:'mounts',name:'Repositionable desk clamp',description:'A rounded C-frame, hand-turn screw and separate swivel pressure foot. Soft contact pads protect the desk.',fields:[['deskThickness','Desk thickness (mm)',10,70,1,25],['reach','Clamp reach (mm)',35,80,1,50],['clampWidth','Clamp width (mm)',32,60,1,38]]}
};
export const productDefaults={printer:'a1-mini',kind:'desk-clamp',palette:'sage',clearance:.35,deskThickness:25,reach:50,clampWidth:38};
export function validateProduct(input){const p={...productDefaults,...input};p.printer=printerKey(p);const item=productItems[p.kind];if(!item)throw Error('Choose an available item.');for(const [key,label,min,max]of item.fields){if(!Number.isFinite(p[key])||p[key]<min||p[key]>Math.min(max,printLimit(p)))throw Error(`${label}: choose ${min}–${Math.min(max,printLimit(p))}.`);}if(!Number.isFinite(p.clearance)||p.clearance<.25||p.clearance>.6)throw Error('Choose 0.25–0.6 mm clearance.');if(!['sage','ivory','charcoal','sand','walnut'].includes(p.palette))throw Error('Choose a palette.');return p;}
