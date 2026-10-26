import {cupboardCaps,connectorAxes} from './cupboard-settings.js';
export const cupboardOptionsDefaults={shelfMode:'none',shelfLayout:'half',shelfHeights:'',shelfDividers:0,dividerHeight:60,cupboardCable:'none',cableDiameter:8,cupboardVent:'none',ventFaces:'back',ventSize:8,cupboardLabels:'none',cupboardLabelTexts:'',drawerLabels:'none',drawerLabelTexts:''};
export function cupboardLevels(p){
 const H=p.height,total=H*p.cupboardRows,caps=Array.from({length:p.cupboardRows},(_,row)=>{const c=cupboardCaps(p,row);return [...(c.floor?[{bottom:row*H,top:row*H+p.wall,type:'floor'}]:[]),...(c.top?[{bottom:(row+1)*H-p.wall,top:(row+1)*H,type:'top'}]:[])];}).flat(),axes=connectorAxes(p.cupboardPorts),ports=[];
 for(let row=0;row<p.cupboardRows;row++){if(axes.vertical||row>0)ports.push(row*H+8);if(axes.vertical||row<p.cupboardRows-1)ports.push((row+1)*H-8);if(axes.sides||p.cupboardColumns>1)ports.push(row*H+H*.25,row*H+H*.75);}
 const cables=p.cupboardCable==='none'?[]:Array.from({length:p.cupboardCable==='each'?p.cupboardRows:1},(_,row)=>row*H+20),fits=(z,others=[])=>{
  if(!Number.isFinite(z)||z<p.wall+14||z+p.wall>total-p.wall-14)return false;
  if(caps.some(c=>z<c.top+14&&z+p.wall>c.bottom-14))return false;
  if(others.some(h=>Math.abs(z-h)<p.wall+16))return false;
  if(ports.some(h=>Math.abs(z-h)<7.5))return false;
  if(cables.some(h=>Math.abs(z-h)<p.cableDiameter/2+p.wall+4))return false;
  return true;
 };
 let shelves=[];
 if(p.shelfMode!=='none'){
  if(p.shelfLayout==='custom'){
   const raw=String(p.shelfHeights??'').trim();if(!raw)throw Error('Enter shelf heights in millimetres, e.g. 100, 220.');
   shelves=raw.split(/[\s,;]+/).map(Number).sort((a,b)=>a-b);if(shelves.length>6)throw Error('Use at most six shelf heights.');
   const kept=[];for(const h of shelves){if(!fits(h,kept))throw Error(`Shelf at ${h} mm is too close to a floor, top, other shelf, connector or cable exit. Leave 14 mm around faces, 16 mm between shelves and 7.5 mm from connector centres.`);kept.push(h);}
  }else{
   const targets=p.shelfLayout==='thirds'?[total/3,total*2/3]:[total/2];
   for(const target of targets){let found;for(let offset=0;offset<total&&found===undefined;offset++)for(const sign of offset?[1,-1]:[1]){const z=Math.round(target)+offset*sign;if(fits(z,shelves)){found=z;break;}}if(found===undefined)throw Error('There is not enough clear height for this shelf layout. Use custom heights or fewer shelves.');shelves.push(found);}
   shelves.sort((a,b)=>a-b);
  }
 }
 const bases=[...caps.filter(c=>c.type==='floor').map(c=>({height:c.top,kind:'floor',base:c.bottom})),...shelves.map(height=>({height:height+p.wall,base:height,kind:p.shelfMode}))].sort((a,b)=>a.height-b.height);
 const barriers=[...caps.map(c=>c.bottom),...shelves,total];
 const platforms=bases.map(b=>{const clearHeight=Math.min(...barriers.filter(z=>z>b.height+.01))-b.height;return {...b,clearHeight,finHeight:Math.min(p.dividerHeight,clearHeight-1.2)};});
 return {shelves,caps,ports,cables,total,platforms};
}
export function validateStorageOptions(p){
 for(const id of ['cupboardLabels','drawerLabels'])if(!['none','engraved','holder'].includes(p[id]))throw Error('Choose no label, engraved text, or a recessed label holder.');
 for(const id of ['cupboardLabelTexts','drawerLabelTexts']){p[id]=String(p[id]??'');if((id==='cupboardLabelTexts'?p.kind==='cupboard'&&p.cupboardLabels!=='none':p.kind==='drawers'&&p.drawerLabels!=='none')&&(p[id].length>500||/[\u0000-\u0008\u000b-\u001f<>]/.test(p[id])||p[id].split('\n').some(s=>s.trim().length>20)))throw Error('Use up to 20 printable characters per label, one label per line.');}
 const labelMode=p.kind==='cupboard'?p.cupboardLabels:p.kind==='drawers'?p.drawerLabels:'none',text=p.kind==='cupboard'?p.cupboardLabelTexts:p.drawerLabelTexts;
 if(labelMode==='engraved'&&!text.trim())throw Error('Enter at least one label, or choose a blank recessed holder.');
 if(p.kind==='drawers'&&labelMode!=='none'){const h=(p.height-1.2-(p.drawers+1)*p.wall)/p.drawers-2*p.clearance;if(h<p.wall+22)throw Error('Labelled drawer fronts need more height. Increase unit height or reduce drawer rows.');}
 if(p.kind!=='cupboard')return;
 if(!['none','fixed','removable'].includes(p.shelfMode)||!['half','thirds','custom'].includes(p.shelfLayout))throw Error('Choose a shelf type and suggested or custom layout.');
 if(!Number.isInteger(p.shelfDividers)||p.shelfDividers<0||p.shelfDividers>2||p.shelfDividers&&(!Number.isFinite(p.dividerHeight)||p.dividerHeight<20||p.dividerHeight>120))throw Error('Choose 0–2 dividers per platform and a height of 20–120 mm.');
 if(!['none','bottom','each'].includes(p.cupboardCable)||p.cupboardCable!=='none'&&(!Number.isFinite(p.cableDiameter)||p.cableDiameter<6||p.cableDiameter>16))throw Error('Cable exits use a 6–16 mm diameter.');
 if(!['none','slots','honeycomb','diamond'].includes(p.cupboardVent)||!['back','sides','back-sides'].includes(p.ventFaces)||p.cupboardVent!=='none'&&(!Number.isFinite(p.ventSize)||p.ventSize<6||p.ventSize>12))throw Error('Choose a ventilation pattern, placement and 6–12 mm opening size.');
 if(!p.shelfDividers)p.dividerHeight=60;if(p.cupboardCable==='none')p.cableDiameter=8;if(p.cupboardVent==='none')p.ventSize=8;
 const levels=cupboardLevels(p);if(p.shelfDividers&&(!levels.platforms.length||levels.platforms.some(b=>b.finHeight<14)))throw Error('Dividers need a floor or shelf and at least 14 mm of clear space above it.');
}
export const labelLines=(p,kind)=>String(kind==='cupboard'?p.cupboardLabelTexts:p.drawerLabelTexts).split('\n').map(s=>s.trim());
export const labelAt=(p,kind,index)=>{const a=labelLines(p,kind);return a.length===1?a[0]:a[index]||'';};
export const needsLabelFont=p=>['cupboard','drawers'].includes(p.kind)&&(p.kind==='cupboard'?p.cupboardLabels:p.drawerLabels)!=='none'&&String(p.kind==='cupboard'?p.cupboardLabelTexts:p.drawerLabelTexts).trim().length>0;
