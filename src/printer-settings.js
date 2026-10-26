export const defaultPrinter='a1-mini';
export const printers=Object.freeze({'a1-mini':{name:'A1 mini',limit:170,bed:180,machine:'Bambu Lab A1 mini 0.4 nozzle'},'256':{name:'256 mm · Bambu A1',limit:256,bed:256,machine:'Bambu Lab A1 0.4 nozzle'}});
export function printerKey(value){const key=typeof value==='object'?value?.printer:value;if(key===undefined)return defaultPrinter;if(!Object.hasOwn(printers,key))throw Error('Choose A1 mini or the 256 × 256 × 256 mm printer size.');return key;}
export const printerSpec=value=>printers[printerKey(value)];
export const printLimit=value=>printerSpec(value).limit;
export const printerSizeText=value=>{const p=printerSpec(value);return `${p.name}: ${p.limit} × ${p.limit} × ${p.limit} mm per printable part${p.bed===180?' (170 mm design allowance on the 180 mm bed)':''}. Allow room for brim, supports and slicer keep-out areas. Larger assemblies may use several parts and plates.`;};
export function assertPrintSize(size,value){const limit=printLimit(value);if(size.some(v=>!Number.isFinite(v)||v>limit+.001||v<=0))throw Error(`A finished part exceeds the ${limit} mm ${printerSpec(value).name} design limit. Reduce its dimensions or choose a larger printer size.`);}
export function meshSize(mesh){const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<mesh.vertices.length;i++){const a=i%3;min[a]=Math.min(min[a],mesh.vertices[i]);max[a]=Math.max(max[a],mesh.vertices[i]);}return max.map((v,a)=>v-min[a]);}
export const assertPartsFit=(parts,value)=>{for(const part of parts)assertPrintSize(meshSize(part.mesh),value);};
