import {profileSummary,printProfile} from './print-profile.js';
// Signed tetrahedra measure enclosed model volume, including cavities and holes.
// Surface projections budget profile-specific walls and skins, then apply the selected infill to the
// remaining core. Capping at model volume keeps thin parts fully filled. This
// conservative approximation is not a slicer or an offset-solid calculation.
// Translate to a mesh vertex first to limit cancellation far from the origin.
export const filamentAssumptionsFor=kind=>`${profileSummary(kind)} Approximate PLA weight at 1.24 g/cm³, using a 0.4 mm nozzle/line width and 0.2 mm layers. Shells are estimated from surface area; ${printProfile(kind).sparse_infill_density} infill applies only to the remaining core. Thin features may be solid. Excludes supports, brim, purge and waste; confirm the final requirement in your slicer.`;
export const filamentAssumptions=filamentAssumptionsFor();
export function meshMaterial(mesh,kind){
 const profile=printProfile(kind),skinDepth=Number(profile.top_shell_layers)*.2,wallDepth=Number(profile.wall_loops)*.4,density=parseFloat(profile.sparse_infill_density)/100;
 const v=mesh.vertices,f=mesh.faces;if(!v.length)return {volume:0,plastic:0};const [ox,oy,oz]=v;let volume=0,shell=0;
 for(let i=0;i<f.length;i+=3){const a=f[i]*3,b=f[i+1]*3,c=f[i+2]*3,ax=v[a]-ox,ay=v[a+1]-oy,az=v[a+2]-oz,bx=v[b]-ox,by=v[b+1]-oy,bz=v[b+2]-oz,cx=v[c]-ox,cy=v[c+1]-oy,cz=v[c+2]-oz;volume+=(ax*(by*cz-bz*cy)+ay*(bz*cx-bx*cz)+az*(bx*cy-by*cx))/6;const ux=bx-ax,uy=by-ay,uz=bz-az,vx=cx-ax,vy=cy-ay,vz=cz-az,nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx; shell+=(wallDepth*Math.hypot(nx,ny)+skinDepth*Math.abs(nz))/2;}
 volume=Math.abs(volume);return {volume,plastic:plasticVolume(volume,shell,density)};
}
export const plasticVolume=(volume,shell,density=.08)=>{const skin=Math.min(volume,Math.max(0,shell));return skin+density*(volume-skin);};
export const meshVolume=mesh=>meshMaterial(mesh).volume;
export function panelGrams(width,height,thickness){const volume=width*height*thickness,shell=1.6*(width*height+width*thickness+height*thickness);return plasticVolume(volume,shell)*1.24/1000;}
export const filamentParts=(parts,kind)=>parts.map(p=>{const m=meshMaterial(p.mesh,kind);return {name:p.name,grams:m.plastic*1.24/1000,solidGrams:m.volume*1.24/1000};});
export const gramsText=grams=>grams>0&&grams<.1?'<0.1 g':`${grams.toFixed(1)} g`;
export function filamentReport(parts,kind){return filamentReportFromWeights(filamentParts(parts,kind),kind);}
export function filamentReportFromWeights(weights,kind){return `ESTIMATED FILAMENT\nTotal: ${gramsText(weights.reduce((sum,p)=>sum+p.grams,0))}\n${weights.map(p=>`${p.name}: ${gramsText(p.grams)}`).join('\n')}\n${filamentAssumptionsFor(kind)}\n`;}
