// Signed tetrahedra measure enclosed plastic, including cavities and holes.
// Translate to a mesh vertex first to limit cancellation far from the origin.
export const filamentAssumptions='Solid PLA at 1.24 g/cm³ (100% infill). Lower infill can reduce usage. Excludes supports, brim, purge and waste; confirm the final requirement in your slicer.';
export function meshVolume(mesh){
 const v=mesh.vertices,f=mesh.faces;if(!v.length)return 0;const [ox,oy,oz]=v;let volume=0;
 for(let i=0;i<f.length;i+=3){const a=f[i]*3,b=f[i+1]*3,c=f[i+2]*3,ax=v[a]-ox,ay=v[a+1]-oy,az=v[a+2]-oz,bx=v[b]-ox,by=v[b+1]-oy,bz=v[b+2]-oz,cx=v[c]-ox,cy=v[c+1]-oy,cz=v[c+2]-oz;volume+=(ax*(by*cz-bz*cy)+ay*(bz*cx-bx*cz)+az*(bx*cy-by*cx))/6;}
 return Math.abs(volume);
}
export const filamentParts=parts=>parts.map(p=>({name:p.name,grams:meshVolume(p.mesh)*1.24/1000}));
export const gramsText=grams=>grams>0&&grams<.1?'<0.1 g':`${grams.toFixed(1)} g`;
export function filamentReport(parts){return filamentReportFromWeights(filamentParts(parts));}
export function filamentReportFromWeights(weights){return `ESTIMATED FILAMENT\nTotal: ${gramsText(weights.reduce((sum,p)=>sum+p.grams,0))}\n${weights.map(p=>`${p.name}: ${gramsText(p.grams)}`).join('\n')}\n${filamentAssumptions}\n`;}
