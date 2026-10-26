import {printerKey,assertPrintSize} from './printer-settings.js';
import {exportEstimate,MIB} from './resolution.js';
export const lanternFaces=['Front','Right','Back','Left'];
export const lanternSpec=Object.freeze({width:145,depth:145,height:177.8,panelWidth:105,panelHeight:148,panelMax:3,ledDiameter:59,ledHeight:8,recessDiameter:59.6,recessHeight:8.4});
export function readSTL(buffer){
 const view=new DataView(buffer),count=view.getUint32(80,true);if(buffer.byteLength!==84+count*50||count>100000)throw Error('Could not read the lantern frame mesh.');
 const points=[],faces=[],indices=new Map();
 for(let t=0;t<count;t++)for(let v=0;v<3;v++){const p=Array.from({length:3},(_,a)=>view.getFloat32(84+t*50+12+v*12+a*4,true));if(p.some(x=>!Number.isFinite(x)))throw Error('Invalid lantern mesh.');const key=p.map(x=>x.toFixed(5)).join(',');if(!indices.has(key)){indices.set(key,points.length/3);points.push(...p);}faces.push(indices.get(key));}
 return {vertices:new Float32Array(points),faces:new Uint32Array(faces)};
}
export function meshBounds(mesh){const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<mesh.vertices.length;i++) {const a=i%3;min[a]=Math.min(min[a],mesh.vertices[i]);max[a]=Math.max(max[a],mesh.vertices[i]);}return {min,max,size:max.map((x,i)=>x-min[i])};}
export function frameModel(meshes,printer){
 const parts=[];let x=0;
 for(const [role,count]of [['side',4],['retainer',4],['base',1],['ring',1]])for(let i=0;i<count;i++){
  const mesh=meshes[role];if(!mesh)throw Error('Lantern frame files are not ready. Retry loading the lantern.');const bounds=meshBounds(mesh);assertPrintSize(bounds.size,printer);
  parts.push({name:`lantern-${role}${count>1?'-'+lanternFaces[i].toLowerCase():''}`,role,side:i,mesh,printSize:bounds.size.map(x=>+x.toFixed(2)),x:x-bounds.min[0],y:-bounds.min[1]});x+=bounds.size[0]+10;
 }
 return {settings:{kind:'lantern',printer:printerKey(printer)},parts};
}
export function lanternPose([x,y,z],role,side=0){
 if(role==='base')return [x-72.5,y-72.5,z];
 if(role==='ring')return [x-72.5,72.5-y,177.8-z];
 if(role==='retainer'){x+=9.2;y+=157.2;z+=3.2;}
 let px,py,pz;
 if(role==='panel'){px=x-52.5;py=-64.3-z;pz=y+16;}
 else {px=61.7-x;py=z-70.5;pz=y+6.8;}
 const a=side*Math.PI/2;return [px*Math.cos(a)-py*Math.sin(a),px*Math.sin(a)+py*Math.cos(a),pz];
}
export function validateLanternPanel(p){if(p.width!==105||p.height!==148||!Number.isFinite(p.min)||p.min<.6||p.min>3||!Number.isFinite(p.max)||p.max<p.min||p.max>3)throw Error('Lantern panels must be 105 × 148 mm with 0.6–3 mm thickness.');}
export function lanternBudget(panel,format,budget,pixels){
 validateLanternPanel(panel);if(pixels.length!==4||pixels.some(x=>!Number.isFinite(x)||x<=0))throw Error('Load all four lantern photos before exporting the kit.');
 const estimate=exportEstimate(panel,format,0),working=estimate.workingBytes+3*estimate.outputBytes+pixels.reduce((a,b)=>a+b,0)*8;
 if(working>budget||4*estimate.outputBytes>=0xffffffff)throw Error(`This four-panel ${format.toUpperCase()} kit needs approximately ${Math.ceil(working/MIB)} MiB; this browser's budget is ${Math.floor(budget/MIB)} MiB. Choose a wider mesh spacing, smaller source photos or a device with more memory. Photo sampling has not been reduced.`);
 return working;
}
