import opentype from 'opentype.js';
import {flattenPath} from './text-geometry.js';
import {makeClickerSymbol} from './clicker-symbols.js';
import {outline} from './symbols.js';
import {fonts} from './font-catalogue.js';
import {validateClickerSettings,clickerPositions} from './clicker-settings.js';
export function generateClickerModel(module,fontBuffer,input){
 const p=validateClickerSettings(input);if(!Object.hasOwn(fonts,p.font))throw Error('Choose an available font.');
 const font=opentype.parse(fontBuffer),{CrossSection:C}=module,owned=[];const own=value=>{owned.push(value);return value;};
 const rounded=(width,height,r=4)=>own(own(C.square([width-2*r,height-2*r],true)).offset(r,'Round',2,48));
 const mesh=solid=>{if(solid.isEmpty()||solid.status()!=='NoError'||solid.volume()<=0)throw Error('Could not generate a closed clicker part. Adjust the fit settings.');const m=solid.getMesh(),vertices=new Float32Array(m.vertProperties.length/m.numProp*3);for(let i=0;i<vertices.length/3;i++)for(let j=0;j<3;j++)vertices[i*3+j]=m.vertProperties[i*m.numProp+j];return {vertices,faces:new Uint32Array(m.triVerts)};};
 try{
 const positions=clickerPositions(p),xs=positions.map(v=>v[0]),ys=positions.map(v=>v[1]),spanX=Math.max(...xs)-Math.min(...xs),spanY=Math.max(...ys)-Math.min(...ys),seat=p.floor+p.cavity,deckTop=seat+p.plate,rimHeight=7,height=deckTop+rimHeight;
 const capFoot=own(rounded(20.5,20.5,2.5).offset(.6));
 const roof=8.5;
 let width=spanX+30,depth=spanY+30,region=null;
 for(let attempt=0;attempt<20;attempt++){
  if(p.design==='cloud')region=own(new C([outline('cloud',width,depth)],'EvenOdd'));
  else if(['charm','christmas'].includes(p.design))region=own(C.union(positions.map(([x,y])=>own(rounded(p.pitch+3+(width-spanX-30),28+(depth-spanY-30),7).translate([x,y])))));
  else if(p.design==='bloom')region=own(C.union([own(C.circle(16+(width-spanX-30)/2,96)),...positions.map(([x,y])=>own(C.circle(16+(width-spanX-30)/2,96).translate([x,y])))]));
  else if(p.design==='gamepad')region=own(C.union([rounded(width,depth,10),...[-1,1].map(side=>own(C.circle(14,64).translate([side*width*.3,-depth*.25])))]));
  else region=rounded(width,depth);
  const inside=own(region.offset(-p.wall-1)),well=own(region.offset(-p.wall+.8)),safe=positions.every(([x,y])=>own(own(C.square([p.cutout,p.cutout],true).translate([x,y])).subtract(inside)).area()<1e-6&&own(own(capFoot.translate([x,y])).subtract(well)).area()<1e-6);
  if(safe)break;if(attempt===19)throw Error('The switch layout needs more room.');width*=1.08;depth*=1.08;
 }
 const housing=(profile,holes)=>{
  const inner=own(profile.offset(-p.wall)),opening=own(profile.offset(-p.wall+.8)),body=own(profile.extrude(height));
  const lower=own(inner.extrude(p.cavity+.01).translate([0,0,p.floor])),upper=own(opening.extrude(p.plate+rimHeight+.02).translate([0,0,seat]));
  const tray=own(own(body.subtract(lower)).subtract(upper));
  let deck=own(own(opening.offset(-p.deckClearance)).extrude(p.plate));
  for(const [x,y]of holes)deck=own(deck.subtract(own(C.square([p.cutout,p.cutout],true).extrude(p.plate+.02).translate([x,y,-.01]))));
  return {tray,deck};
 };
 const main=housing(region,positions);let base=main.tray,eyelet=null;
 if(p.keyring){const b=region.bounds(),x=b.min[0]-3;eyelet={x,y:0,diameter:4.5};const outer=own(C.union([own(C.circle(5,64).translate([x,0])),own(C.square([12,8],true).translate([b.min[0]+1,0]))])),loop=own(outer.subtract(own(C.circle(2.25,64).translate([x,0]))));base=own(base.add(own(loop.extrude(p.floor+1.6))));}
 const parts=[],addPart=(name,role,solid,assembly,key)=>{const bounds=solid.boundingBox();parts.push({name,role,mesh:mesh(solid),x:0,assembly,...(key!==undefined?{key}:{}),bounds});};
 addPart('clicker-base','base',base,[0,0,0]);addPart('switch-deck','deck',main.deck,[0,0,seat]);
 const makeCap=(key)=>{
  const face=rounded(20.5,20.5,2.5),inside=rounded(17.5,17.5,.6);
  // A continuous hollow skirt encloses the square switch body. Its lower edge
  // stays above the deck through 4 mm travel; the case rim hides the lower body.
  const skirt=own(own(face.extrude(roof+.02)).subtract(own(inside.extrude(roof+.04).translate([0,0,-.01]))));
  const shoulder=own(face.extrude(2).translate([0,0,roof])),top=own(own(face.offset(-.7)).extrude(1.62).translate([0,0,roof+1.98])),cap=own(own(shoulder.add(top)).add(skirt));
  const connector=own(C.square([p.stemWidth,p.stemWidth],true).extrude(p.stemHeight+.02).translate([0,0,roof-p.stemHeight]));
  const length=4+p.socketClearance,thickness=1.1+p.socketClearance,cross=own(C.union([own(C.square([length,thickness],true)),own(C.square([thickness,length],true))]));
  const socket=own(cross.extrude(p.stemHeight+.1).translate([0,0,roof-p.stemHeight-.01]));let solid=own(own(cap.add(connector)).subtract(socket));
  if(key.type!=='blank'){
   let marking;
   if(key.type==='symbol')marking=makeClickerSymbol(C,own,key.value);
   else{
    if(!font.charToGlyphIndex(key.value))throw Error(`This font does not support ${key.value}. Choose another letter or font.`);
    const contours=flattenPath(font.charToGlyph(key.value).getPath(0,0,11).commands),points=contours.flat(),xs=points.map(v=>v[0]),ys=points.map(v=>v[1]);
    if(!points.length)throw Error('Choose a printable letter or number.');
    marking=own(own(new C(contours,'NonZero')).translate([-(Math.min(...xs)+Math.max(...xs))/2,-(Math.min(...ys)+Math.max(...ys))/2]));
   }
   const safe=own(face.offset(-2));let fitted=null;
   for(let scale=1;scale>.3;scale*=.94){const candidate=own(marking.scale(scale));if(own(candidate.subtract(safe)).area()<1e-6){fitted=candidate;break;}}
   if(!fitted)throw Error('This marking does not fit this keycap.');
   solid=own(solid.add(own(fitted.extrude(.82).translate([0,0,roof+3.58]))));
  }
  return own(solid.simplify(.0001));
 };
 p.keys.forEach((key,i)=>addPart(`keycap-${i+1}-${key.type==='symbol'?key.value:key.type==='blank'?'blank':'letter'}`,'cap',makeCap(key,p.capShape),[...positions[i],deckTop+4.5],i));
 const test=housing(rounded(32,32,5),[[0,0]]);
 addPart('closed-tray-fit-test','test',test.tray,null);
 addPart('switch-plate-fit-test','test',test.deck,null);
 addPart('keycap-socket-fit-test','test',makeCap({type:'blank',value:''},'rounded'),null);
 let nextX=parts[0].bounds.max[0]+8;for(const part of parts.slice(1)){part.x=nextX-part.bounds.min[0];nextX+=part.bounds.max[0]-part.bounds.min[0]+8;}
 const bounds=base.boundingBox();
 return {parts,settings:p,width:+(bounds.max[0]-bounds.min[0]).toFixed(2),height:+(bounds.max[1]-bounds.min[1]).toFixed(2),baseHeight:height,rimHeight,deckSeat:seat,deckTop,positions,eyelet,floorThickness:p.floor,construction:'closed-tray',capShoulderTop:roof+2,capTop:roof+3.6,capRoof:roof,capInterior:17.5,capWidth:20.5,capRest:4.5,pressTravel:4,prototype:true};

 }finally{for(let i=owned.length-1;i>=0;i--)owned[i].delete();}
}
