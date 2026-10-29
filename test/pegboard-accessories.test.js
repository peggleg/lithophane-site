import {printLimit} from '../src/printer-settings.js';
import test from 'node:test';import assert from 'node:assert/strict';import init from 'manifold-3d/manifold';
import {generateProduct} from '../src/product-geometry.js';import {productKernel} from '../src/product-kernel.js';import {pegboardAdapterSolid,pegboardRailFrame} from '../src/pegboard-accessories.js';import {mountShoe} from '../src/mount-products.js';import {printProfile} from '../src/print-profile.js';
const m=await init();m.setup();
function posed(part){const a=new m.Manifold(new m.Mesh({numProp:3,vertProperties:part.mesh.vertices,triVerts:part.mesh.faces})),b=a.rotate(part.rotation.map(v=>v*180/Math.PI)),c=b.translate(part.assembly);a.delete();b.delete();return c;}
function hit(a,b){const c=a.intersect(b),v=c.volume();c.delete();return v;}
export function checkParts(g){for(const p of g.parts){const a=posed(p),pieces=a.decompose();assert.equal(a.status(),'NoError');assert.equal(pieces.length,1,p.name);pieces.forEach(x=>x.delete());a.delete();assert.ok(p.printSize.every(x=>x<=printLimit(g.settings)));}assert.equal(printProfile(g.settings.kind).sparse_infill_density,'30%');}
test('pegboard adapter fits panel and standard latch, and M4 hardware clears the wall',()=>{
 for(const boardThickness of [5,8])for(const adapterWidth of [58,90]){
  const g=generateProduct(m,{kind:'pegboard-adapter',boardThickness,adapterWidth});checkParts(g);assert.equal(g.parts.length,1);
  const K=productKernel(m,g.settings);try{const adapter=pegboardAdapterSolid(K,g.settings),f=pegboardRailFrame,shoe=mountShoe(K,g.settings,f,28);assert.ok(hit(adapter,shoe.body)<.003);assert.ok(hit(adapter,K.own(shoe.body.translate([0,0,1])))>.05);const released=mountShoe(K,g.settings,f,28,{release:1.5});for(const dz of [0,1,45,70])assert.ok(hit(adapter,K.own(released.body.translate([0,0,dz])))<.003);
   for(const x of [-20,20]){const shank=K.own(K.M.cylinder(20,2,2,40).rotate([-90,0,0]).translate([x,-6.78,0])),head=K.own(K.M.cylinder(2.48,2,4.48,40).rotate([90,0,0]).translate([x,-4.3,0]));assert.ok(hit(adapter,shank)<.003);assert.ok(hit(adapter,head)<.003);assert.ok(-6.78+20<boardThickness+10,'bolt tip clears wall');assert.ok(-6.78+20>boardThickness+.8+3.2,'bolt reaches through washer and nut');}
  }finally{K.dispose();}
 }
});

test('short and long rounded hooks remain connected and clear adapter during release',()=>{
 for(const [kind,reaches]of [['pegboard-short-hook',[20,40]],['pegboard-long-hook',[35,80]]])for(const width of [28,50])for(const outreach of reaches){
  const g=generateProduct(m,{kind,width,outreach});checkParts(g);const part=posed(g.parts[0]),adapter=posed(g.references.find(p=>p.name==='context-universal-adapter'));assert.ok(hit(part,adapter)<.003);const blocked=part.translate([0,0,1]);assert.ok(hit(blocked,adapter)>.05);blocked.delete();part.delete();adapter.delete();
 }
});

test('round tool cups are connected, hollow, clear the board and retain the latch release',()=>{
 for(const diameter of [50,120])for(const height of [60,150]){
  const g=generateProduct(m,{kind:'pegboard-cup',diameter,height});checkParts(g);const part=posed(g.parts[0]),adapter=posed(g.references.find(p=>p.name==='context-universal-adapter'));assert.ok(hit(part,adapter)<.003);
  const K=productKernel(m,g.settings);try{const f=pegboardRailFrame,shoe=mountShoe(K,g.settings,f,28),released=mountShoe(K,g.settings,f,28,{release:1.5}),fixed=K.own(part.subtract(shoe.tongue)),open=K.own(fixed.add(released.tongue));for(const dz of [0,1,45,70])assert.ok(hit(K.own(open.translate([0,0,dz])),adapter)<.003);const free=K.own(released.tongue.intersect(K.box(60,100,80,0,-25,f.railZ-9.5,1)));assert.ok(hit(fixed,free)<.003);const interior=K.cyl(diameter/2-5,height-4,0,shoe.front-diameter/2+3.2,shoe.bottom+44-height+4);assert.ok(hit(part,interior)<.003,'interior is open to the top');}finally{K.dispose();}part.delete();adapter.delete();
 }
});

test('raised-edge shelves have a clear tray floor, remain connected and release from adapter',()=>{
 for(const width of [70,170])for(const depth of [35,110])for(const rimHeight of [6,20]){
  const g=generateProduct(m,{kind:'pegboard-shelf',width,depth,rimHeight});checkParts(g);const part=posed(g.parts[0]),adapter=posed(g.references.find(p=>p.name==='context-universal-adapter'));assert.ok(hit(part,adapter)<.003);const K=productKernel(m,g.settings);try{const f=pegboardRailFrame,shoe=mountShoe(K,g.settings,f,28),released=mountShoe(K,g.settings,f,28,{release:1.5}),fixed=K.own(part.subtract(shoe.tongue)),open=K.own(fixed.add(released.tongue));for(const dz of [0,1,45,70])assert.ok(hit(K.own(open.translate([0,0,dz])),adapter)<.003);const floor=K.box(width-16,depth-16,2,0,shoe.front-depth/2+3.2,shoe.bottom+1,2);assert.ok(hit(part,floor)>floor.volume()*.99);const free=K.own(released.tongue.intersect(K.box(60,100,80,0,-25,f.railZ-9.5,1)));assert.ok(hit(fixed,free)<.003);}finally{K.dispose();}part.delete();adapter.delete();
 }
 checkParts(generateProduct(m,{kind:'pegboard-shelf',printer:'256',width:240}));
});

test('lift-off storage bins keep the shared interface clear at size extremes',()=>{
 for(const width of [50,170])for(const depth of [25,80]){
  const g=generateProduct(m,{kind:'pegboard-bin',width,depth,height:150});checkParts(g);const part=posed(g.parts[0]),adapter=posed(g.references.find(p=>p.name==='context-universal-adapter'));assert.ok(hit(part,adapter)<.003);const K=productKernel(m,g.settings);try{const shoe=mountShoe(K,g.settings,pegboardRailFrame,width),release=mountShoe(K,g.settings,pegboardRailFrame,width,{release:1.5}),fixed=K.own(part.subtract(shoe.tongue)),open=K.own(fixed.add(release.tongue));for(const dz of [0,1,45,70])assert.ok(hit(K.own(open.translate([0,0,dz])),adapter)<.003);const free=K.own(release.tongue.intersect(K.box(width+10,100,80,0,-25,-9.5,1)));assert.ok(hit(fixed,free)<.003);}finally{K.dispose();}part.delete();adapter.delete();
 }
 checkParts(generateProduct(m,{kind:'pegboard-bin',printer:'256',width:240}));
});
