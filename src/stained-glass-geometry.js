import {productKernel} from './product-kernel.js';
// Colour regions are traced from the sampled image, then inset so the black
// framework follows their contours. Bridges connect enclosed outline islands.
export function stainedGlassGeometry(module,seg,{orientation='landscape',mode='assembly',printer='a1-mini'}={}){
 if(!['portrait','landscape'].includes(orientation)||!['assembly','ams'].includes(mode)||!['a1-mini','256'].includes(printer)||!seg||seg.labels.length!==seg.width*seg.height||seg.palette.length>7)throw Error('Invalid stained-glass design.');
 const width=orientation==='landscape'?148:105,height=orientation==='landscape'?105:148,cols=seg.width,rows=seg.height,border=2,web=.9,clearance=mode==='assembly'?.18:0,thickness=2,cw=(width-2*border)/cols,ch=(height-2*border)/rows;
 const K=productKernel(module,{kind:'stained-glass',printer}),{C,own}=K;
 try{
  const runs=seg.palette.map(()=>[]);for(let y=0;y<rows;y++)for(let x=0;x<cols;){const colour=seg.labels[y*cols+x],start=x;while(x<cols&&seg.labels[y*cols+x]===colour)x++;runs[colour].push(own(C.square([(x-start)*cw,ch]).translate([border+start*cw,border+(rows-1-y)*ch])));}
  const card=own(C.square([width,height])),regions=runs.map(parts=>parts.length?own(C.union(parts)):null),openings=regions.map(region=>region?own(region.offset(-web/2)):null).filter(x=>x&&!x.isEmpty());if(!openings.length)throw Error('No printable colour pieces. Try another image.');
  let frame=own(card.subtract(own(C.union(openings))));const components=frame.decompose().map(own);
  if(components.length>1){const bridges=[];for(const component of components){const b=component.bounds();if(b.min[0]<.01)continue;const polys=component.toPolygons();if(!polys.length||!polys[0].length)continue;const [x,y]=polys[0][0];bridges.push(own(C.square([Math.max(.1,x+web),web]).translate([0,y-web/2])));}if(bridges.length)frame=own(C.union([frame,...bridges]));}
  if(frame.decompose().length!==1)throw Error('Could not connect all outlines. Try fewer colours or another image.');const preview=[{colour:'#111111',paths:frame.toPolygons()}];const body=K.add('black-framework','framework',own(frame.extrude(thickness)),[0,0,0],'#111111');body.extruder=1;
  for(let c=0;c<regions.length;c++){if(!regions[c])continue;let piece=own(own(regions[c].offset(-web/2)).subtract(frame));if(clearance)piece=own(piece.offset(-clearance/2));if(piece.isEmpty())continue;preview.push({colour:`#${seg.palette[c].map(v=>v.toString(16).padStart(2,'0')).join('')}`,paths:piece.toPolygons()});const part=K.add(`colour-${c+1}`,'inlay',own(piece.extrude(thickness)),[0,0,0],`#${seg.palette[c].map(v=>v.toString(16).padStart(2,'0')).join('')}`);part.extruder=c+2;}
  const model=K.finish({printPlates:false,filamentColours:['#111111',...seg.palette.map(c=>`#${c.map(v=>v.toString(16).padStart(2,'0')).join('')}`)],productFit:{width,height,web,clearance,thickness,cols,rows},note:'Connected black outlines with separate colour regions.',preview});for(const part of model.parts){const bed=printer==='256'?256:180;part.x=(bed-width)/2;part.y=(bed-height)/2;if(mode==='ams')part.colourGroup='stained-glass';}return model;
 }finally{K.dispose();}
}
