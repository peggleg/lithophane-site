import {productKernel} from './product-kernel.js';
import art1 from './ornament-artwork/snoopy/1.json' with {type:'json'};
import art2 from './ornament-artwork/snoopy/2.json' with {type:'json'};
import art3 from './ornament-artwork/snoopy/3.json' with {type:'json'};
import art4 from './ornament-artwork/snoopy/4.json' with {type:'json'};
import art5 from './ornament-artwork/snoopy/5.json' with {type:'json'};
import art6 from './ornament-artwork/snoopy/6.json' with {type:'json'};
import art7 from './ornament-artwork/snoopy/7.json' with {type:'json'};
import art8 from './ornament-artwork/snoopy/8.json' with {type:'json'};
import art9 from './ornament-artwork/snoopy/9.json' with {type:'json'};
import art10 from './ornament-artwork/snoopy/10.json' with {type:'json'};
import art11 from './ornament-artwork/snoopy/11.json' with {type:'json'};
import art12 from './ornament-artwork/snoopy/12.json' with {type:'json'};
import art13 from './ornament-artwork/snoopy/13.json' with {type:'json'};
import art14 from './ornament-artwork/snoopy/14.json' with {type:'json'};
import art15 from './ornament-artwork/snoopy/15.json' with {type:'json'};
import art16 from './ornament-artwork/snoopy/16.json' with {type:'json'};
const sheets=[art1,art2,art3,art4,art5,art6,art7,art8,art9,art10,art11,art12,art13,art14,art15,art16];
export function generateSnoopy(module,p){
 const source=sheets[Number(p.design.slice(7))-1];if(!source)throw Error('Snoopy artwork not found.');
 const K=productKernel(module,p),{C,own}=K;
 try{
  const base=own(new C(source.base,'EvenOdd').scale([p.diameter/100,p.diameter/100]));
  const detail=own(own(new C(source.detail,'EvenOdd').scale([p.diameter/100,p.diameter/100])).intersect(base));
  const baseSolid=own(base.extrude(p.thickness)),black=own(detail.extrude(.6).translate([0,0,p.thickness]));
  const complete=own(baseSolid.add(black));const components=complete.decompose().map(own);if(components.length!==1)throw Error('Ornament artwork is not connected.');
  const body=K.add('snoopy-white-base','ornament-body',baseSolid,[0,0,0],'#ffffff');
  const ink=K.add('snoopy-black-detail','ornament-lettering',black,[0,0,0],'#111111');
  for(let i=2;i<ink.mesh.vertices.length;i+=3)ink.mesh.vertices[i]+=p.thickness;
  ink.bounds.min[2]+=p.thickness;ink.bounds.max[2]+=p.thickness;ink.assembly=[0,0,0];
  if(p.ams)for(const [part,extruder]of [[body,1],[ink,2]]){part.colourGroup='snoopy-ornament';part.extruder=extruder;}
  const model=K.finish({previewDirection:[0,-.15,1],printPlates:true,filamentColours:['#ffffff','#111111'],productFit:{connected:true,whiteBase:p.thickness,raisedDetail:.6},note:`White base ${p.thickness.toFixed(1)} mm; raised black details 0.6 mm (three 0.2 mm layers). Print face up.`,guide:`Print face up at 0.2 mm layer height. The white base is ${p.thickness.toFixed(1)} mm thick. Change from white to black at the first layer above ${p.thickness.toFixed(1)} mm, then print three black layers. ${p.ams?'The 3MF assigns white to filament 1 and black to filament 2.':'Set the colour change in your slicer; it is not embedded in the STL.'}`});
  for(const part of model.parts){part.x=model.parts[0].x;part.y=model.parts[0].y;}
  const mesh=complete.getMesh(),vertices=new Float32Array(mesh.vertProperties.length/mesh.numProp*3);for(let i=0;i<vertices.length/3;i++)for(let a=0;a<3;a++)vertices[i*3+a]=mesh.vertProperties[i*mesh.numProp+a];model.singleColourMesh={vertices,faces:new Uint32Array(mesh.triVerts)};return model;
 }finally{K.dispose();}
}
