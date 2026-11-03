import {cylinderSettings,cylinderStands,cylinderSpec as S} from './cylinder-settings.js';
import {assertPrintSize} from './printer-settings.js';
import {productKernel} from './product-kernel.js';

export function makeCylinder(input,tones,cols,rows){
 const p=cylinderSettings(input);
 if(!Number.isInteger(cols)||!Number.isInteger(rows)||cols<16||rows<2||cols>1200||rows>600||tones.length!==cols*rows||tones.some(t=>!Number.isFinite(t)||t<0||t>255))throw Error('Invalid cylinder image grid.');
 const levels=[...new Set([0,3,5.4,p.height-2.4,p.height,...Array.from({length:rows},(_,y)=>p.height*y/(rows-1))])].sort((a,b)=>a-b),meshRows=levels.length;
 const count=cols*meshRows,v=new Float32Array(count*6),faces=[];
 for(let y=0;y<meshRows;y++)for(let x=0;x<cols;x++){
  const z=levels[y],a=2*Math.PI*x/cols;
  // Rotate the complete texture around the cylinder; never crop its edges.
  const tx=(x+Math.round(p.rotation/360*cols))%cols,t=tones[Math.round((1-z/p.height)*(rows-1))*cols+tx],thickness=p.min+(1-t/255)*(p.max-p.min);
  const ramp=Math.min(1,Math.max(0,(z-3)/2.4),Math.max(0,(p.height-z)/2.4));
  const radius=S.outerDiameter/2*(1-ramp)+(S.innerDiameter/2+thickness)*ramp;
  const i=y*cols+x;v.set([radius*Math.cos(a),radius*Math.sin(a),z],i*3);v.set([42*Math.cos(a),42*Math.sin(a),z],(count+i)*3);
 }
 for(let y=0;y<meshRows-1;y++)for(let x=0;x<cols;x++){
  const a=y*cols+x,b=y*cols+(x+1)%cols,c=a+cols,d=b+cols;
  faces.push(a,b,d,a,d,c,a+count,d+count,b+count,a+count,c+count,d+count);
 }
 for(let x=0;x<cols;x++){
  const a=x,b=(x+1)%cols,c=(meshRows-1)*cols+x,d=(meshRows-1)*cols+(x+1)%cols;
  faces.push(a,a+count,b+count,a,b+count,b,c,d,d+count,c,d+count,c+count);
 }
 const mesh={vertices:v,faces:new Uint32Array(faces)};assertPrintSize([90,90,p.height],p);return mesh;
}

export function generateCylinderStand(module,input,test=false){
 const p=cylinderSettings(input),stand=cylinderStands.find(s=>s.id===p.stand);
 if(!test&&stand.style==='tripod')return generateTripod(module,p);
 const K=productKernel(module,p),{C,M,own,cyl,add}=K;
 const union=solids=>own(M.union(solids)),sub=(a,b)=>own(a.subtract(b));
 const revolve=points=>own(own(new C([points],'NonZero')).revolve(160));
 try{
  if(test){
   const part=add('tealight-fit-'+p.fitDiameter.toFixed(1)+'mm','tealight-fit',sub(cyl(p.fitDiameter/2+3,5),cyl(p.fitDiameter/2,4,0,0,2)));
   part.colour='#e9dfcc';return K.finish({fit:{diameter:p.fitDiameter,depth:3},note:'Print this small cup first. The 38 × 19 mm LED tealight should drop in and lift out easily.',printPlates:true});
  }
  const H=stand.height;
  let body;
  if(stand.group==='Desktop')body=revolve([[0,0],[50,0],[51,1],[51,H-4],[49,H-2],[48,H],[0,H]]);
  else if(stand.style==='plinth')body=revolve([[0,0],[62.5,0],[62.5,10],[57.5,15],[57.5,25],[52.5,30],[52.5,42],[48,47],[48,H],[0,H]]);
  else{
   body=revolve([[0,0],[62.5,0],[62.5,3],[59,7],[46,12],[34,19],[27,28],[23,40],[23,H-30],[30,H-22],[38,H-14],[46,H-6],[48,H-3],[48,H],[0,H]]);
   if(stand.style==='woodland'){
    body=own(body.warp(v=>{const r=Math.hypot(v[0],v[1]);if(v[2]>18&&v[2]<H-16&&r>15){const a=Math.atan2(v[1],v[0]),d=.6*Math.sin(24*a+v[2]*.12);v[0]*=(r+d)/r;v[1]*=(r+d)/r;}}));
   }
  }
  // Shallow embossed side decoration stays below the mating deck.
  const motifs=[];
  if(['christmas','autumn','spring'].includes(stand.style)){
   for(let j=0;j<12;j++){
    const r=50.4,z=H/2;
    if(stand.style==='spring'){
     for(let k=0;k<5;k++){const b=k*2*Math.PI/5;motifs.push(own(M.sphere(1.8,12).scale([1.1,.6,1.1]).translate([r+2*Math.cos(b),0,z+2*Math.sin(b)]).rotate([0,0,j*30])));}
    }else if(stand.style==='autumn'){
     motifs.push(own(M.sphere(1,16).scale([1.2,4,3]).rotate([25,0,0]).translate([r,0,z]).rotate([0,0,j*30])));
    }else{
     for(let k=0;k<3;k++){const dz=2-k*2;motifs.push(own(own(new C([[[0,dz+3],[-(k+1)*1.2,dz],[(k+1)*1.2,dz]]],'NonZero')).extrude(1.4).rotate([90,0,90]).translate([r-.4,0,z]).rotate([0,0,j*30])));}
    }
   }
  }
  if(motifs.length)body=union([body,...motifs]);
  const recess=cyl(p.fitDiameter/2,4,0,0,H-3),lip=sub(cyl(47.3,2,0,0,H),cyl(S.seatDiameter/2,2.2,0,0,H-.1));
  body=union([sub(body,recess),lip]);const part=add(stand.id,'stand',body,[0,0,0],stand.colour);part.printKind='cylinder-stand';
  return K.finish({seatZ:H,fit:{diameter:p.fitDiameter,depth:3,seatDiameter:S.seatDiameter},printPlates:true,note:'Place the LED tealight in the centre recess, then lower the open-bottom cylinder into the outer locating lip. Lift the cylinder off to reach the switch.'});
 }finally{K.dispose();}
}

function generateTripod(module,p){
 const K=productKernel(module,p),{C,own,cyl,add}=K,H=85;
 try{
  let deck=own(cyl(48,8,0,0,H-8).subtract(cyl(p.fitDiameter/2,4,0,0,H-3)));
  const lip=own(cyl(47.3,2,0,0,H).subtract(cyl(S.seatDiameter/2,2.2,0,0,H-.1)));deck=own(deck.add(lip));
  for(let j=0;j<3;j++){
   const a=j*120,rad=a*Math.PI/180,x=36*Math.cos(rad),y=36*Math.sin(rad);
   deck=own(deck.subtract(own(own(C.square([10.4,10.4],true)).extrude(4.1).rotate([0,0,a]).translate([x,y,H-8-.1]))));
   const profile=own(new C([[[43,0],[53,0],[41,77],[41,81],[31,81],[31,77]]],'NonZero'));
   const leg=own(profile.extrude(10).rotate([90,0,0]).translate([0,5,0]));
   const part=add('tripod-leg-'+(j+1),'stand-leg',leg,[90,0,0],'#c5a37c');part.printKind='cylinder-stand';
   const [ax,ay]=part.assembly;part.assembly[0]=ax*Math.cos(rad)-ay*Math.sin(rad);part.assembly[1]=ax*Math.sin(rad)+ay*Math.cos(rad);part.rotation[2]=rad;part.rotationOrder='ZYX';
  }
  const part=add('tripod-deck','stand-deck',deck,[0,0,0],'#c5a37c');part.printKind='cylinder-stand';
  return K.finish({seatZ:H,fit:{diameter:p.fitDiameter,depth:3,seatDiameter:S.seatDiameter},printPlates:true,note:'Print the deck flat underside down and the three legs on their supplied broad sides. Push the square leg ends fully into the underside sockets; use a small amount of PLA-compatible glue to secure them. Place the LED tealight in the recess and lower the cylinder into the locating lip.'});
 }finally{K.dispose();}
}

export function buildCylinderModel(module,input,tones,cols,rows,{test=false,standOnly=false}={}){
 const p=cylinderSettings(input),model=generateCylinderStand(module,p,test);if(test||standOnly)return model;
 const mesh=makeCylinder(p,tones,cols,rows),bounds={min:[-45,-45,0],max:[45,45,p.height]};
 model.parts.unshift({name:'lithophane-cylinder',role:'cylinder',printKind:'lithophane',mesh,bounds,printSize:[90,90,p.height],assembly:[0,0,model.seatZ],rotation:[0,0,0],x:45,y:45,colour:'#fff4dd'});
 model.height=model.seatZ+p.height;return model;
}
