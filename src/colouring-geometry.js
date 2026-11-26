import {productKernel} from './product-kernel.js';
export function colouringGeometry(module, artwork, {printer='a1-mini', ams=true, base=2.4, lineExpansion=.15}={}) {
 if(![1.6,1.8,2,2.2,2.4].includes(base))throw Error('Choose a supported base thickness.');
 if(!artwork || ![105,148].includes(artwork.width)||![105,148].includes(artwork.height)||artwork.width===artwork.height||!Array.isArray(artwork.paths)||!artwork.paths.length)throw Error('Invalid postcard artwork.');
 const p={kind:'colouring-postcard',printer},K=productKernel(module,p),{C,own}=K;
 try {
  const plate=own(C.square([artwork.width,artwork.height]));
  const source=own(new C(artwork.paths,'EvenOdd'));
  const detail=own(own(source.offset(lineExpansion,'Round',2,16)).intersect(plate));
  if(detail.isEmpty())throw Error('The artwork has no printable lines.');
  const white=own(plate.extrude(base)),black=own(detail.extrude(.6).translate([0,0,base])),complete=own(white.add(black));
  if(complete.decompose().length!==1)throw Error('The image is not joined to the base.');
  const body=K.add('white-postcard','base',white,[0,0,0],'#ffffff');
  const ink=K.add('black-outlines','details',black,[0,0,0],'#111111');
  for(let i=2;i<ink.mesh.vertices.length;i+=3)ink.mesh.vertices[i]+=base;
  ink.bounds.min[2]+=base;ink.bounds.max[2]+=base;ink.assembly=[0,0,0];
  if(ams){body.colourGroup=ink.colourGroup='colouring-postcard';body.extruder=1;ink.extruder=2;}
  const model=K.finish({printPlates:false,filamentColours:['#ffffff','#111111'],productFit:{whiteBase:base,raisedDetail:.6,width:artwork.width,height:artwork.height}});
  const bed=printer==='256'?256:180;for(const part of model.parts){part.x=(bed-artwork.width)/2;part.y=(bed-artwork.height)/2;}
  if(!ams){const mesh=complete.getMesh(),vertices=new Float32Array(mesh.vertProperties.length/mesh.numProp*3);for(let i=0;i<vertices.length/3;i++)for(let a=0;a<3;a++)vertices[i*3+a]=mesh.vertProperties[i*mesh.numProp+a];model.parts=[{...body,name:'colouring-postcard',mesh:{vertices,faces:new Uint32Array(mesh.triVerts)},bounds:{min:[0,0,0],max:[artwork.width,artwork.height,base+.6]},printSize:[artwork.width,artwork.height,base+.6]}];model.filamentColours=['#ffffff'];}
  return model;
 } finally {K.dispose();}
}
