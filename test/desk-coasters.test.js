import {monsteraSections} from '../src/monstera.js';
import test from 'node:test';import assert from 'node:assert/strict';import init from 'manifold-3d/manifold';import {generateDeskModel} from '../src/desk-geometry.js';import {deskDefaults,deskPresets} from '../src/desk-settings.js';import {coasterOutline} from '../src/desk-coasters.js';import {printProfile} from '../src/print-profile.js';import {deskGuide} from '../src/desk-export.js';
const m=await init();m.setup();const build=p=>generateDeskModel(m,{...deskDefaults,...deskPresets[p.kind||'coaster'],kind:'coaster',...p});const restore=p=>new m.Manifold(new m.Mesh({numProp:3,vertProperties:p.mesh.vertices,triVerts:p.mesh.faces}));
function check(model){for(const p of model.parts){const s=restore(p);assert.equal(s.status(),'NoError');const pieces=s.decompose();assert.equal(pieces.length,1,`${model.settings.coasterShape} ${model.settings.leafBacking} ${p.name}`);pieces.forEach(x=>x.delete());assert.ok(s.volume()>0);assert.ok(p.printSize.every(v=>v<=170.001));s.delete();}}
test('all coaster shapes, surfaces, leaf backings and 4–6 counts produce connected closed A1 mini parts',()=>{
 for(const coasterShape of ['round','square','hexagon','monstera'])for(const coasterSurface of ['flat','recessed'])for(const leafBacking of coasterShape==='monstera'?['backed','open']:['backed'])for(const coasterCount of [4,5,6]){const model=build({coasterShape,coasterSurface,leafBacking,coasterCount});assert.equal(model.parts.length,coasterCount);check(model);assert.equal(printProfile(model.settings.kind).top_shell_layers,'5');assert.match(deskGuide(model),/5 top \/ 5 bottom/);}
});
test('solid backing retains every leaf opening over a continuous base; cut-through version deliberately drains',()=>{
 const backed=build({coasterShape:'monstera',leafBacking:'backed'}),open=build({coasterShape:'monstera',leafBacking:'open'}),a=restore(backed.parts[0]),b=restore(open.parts[0]),base=a.slice(1),holes=b.slice(1);assert.ok(base.area()>holes.area()+50);const own=[];const profile=coasterOutline(m,o=>(own.push(o),o),backed.settings),edgeAllowance=profile.offset(-.002),sections=monsteraSections(m,o=>(own.push(o),o),backed.settings.width,backed.settings.depth),blade=edgeAllowance.subtract(sections.hangingHole),missing=blade.subtract(base);assert.ok(missing.area()<.001,'entire backing is solid');[a,b,base,holes,edgeAllowance,blade,missing,...own].forEach(x=>x.delete());
});
test('stacking holders clear matching coaster outlines through the full insertion path in every shape and backing',()=>{
 for(const coasterShape of ['round','square','hexagon','monstera'])for(const leafBacking of ['open','backed'])for(const clearance of [.2,.8]){const settings={coasterShape,leafBacking,clearance,coasterCount:6},coasters=build(settings),holder=build({...settings,kind:'coaster-tray'});check(holder);const h=restore(holder.parts[0]),c=restore(coasters.parts[0]);for(const dz of [0,1,10,30]){const placed=c.translate([0,0,holder.settings.wall+dz]),hit=placed.intersect(h);assert.ok(hit.volume()<.001,'coaster clears holder');placed.delete();hit.delete();}h.delete();c.delete();assert.equal(printProfile(holder.settings.kind).top_shell_layers,'3');}
});
test('upright rack slots use total coaster thickness and all shapes insert without catching',()=>{
 for(const coasterShape of ['round','square','hexagon','monstera'])for(const coasterCount of [4,5,6])for(const height of [4.4,8]){const settings={coasterShape,coasterCount,height},coasters=build(settings),rack=build({...settings,kind:'coaster-rack'});check(rack);const h=restore(rack.parts[0]),c=restore(coasters.parts[0]);for(const y of rack.coasterFit.slotCentres)for(const lift of [0,10,30]){const placed=c.rotate([90,0,0]).translate([0,y+height/2,coasters.depth/2+rack.settings.wall+lift]),hit=h.intersect(placed);assert.ok(hit.volume()<.001,`${coasterShape} ${coasterCount} ${height}: rack collision`);placed.delete();hit.delete();}h.delete();c.delete();}
});
test('holders implement all six styles, retain size checks, and reject invalid coaster settings',()=>{
 for(const kind of ['coaster-tray','coaster-rack'])for(const finish of ['smooth','fluted','slatted','ribbed','scalloped','wave'])check(build({kind,finish,coasterShape:'hexagon'}));
 for(const width of [60,160])for(const coasterShape of ['round','square','hexagon','monstera'])check(build({width,depth:width,coasterShape,kind:'coaster-tray'}));
 for(const settings of [{coasterCount:3},{coasterCount:7},{height:3,coasterSurface:'recessed'},{width:161},{coasterRim:3},{coasterShape:'cloud'}])assert.throws(()=>build(settings));
});

test('natural leaf keeps seven enclosed fenestrations, exact dimensions and a printable connected core at narrow sizes',()=>{
 for(const [width,depth] of [[60,60],[60,160],[160,60],[100,100],[160,160]]){
  const owned=[],own=o=>(owned.push(o),o),leaf=monsteraSections(m,own,width,depth),bounds=leaf.outline.bounds();
  assert.ok(Math.abs(bounds.max[0]-bounds.min[0]-width)<.001);assert.ok(Math.abs(bounds.max[1]-bounds.min[1]-depth)<.001);
  const apertures=leaf.holes.decompose();assert.equal(apertures.length,7);apertures.forEach(p=>p.delete());
  const outside=own(leaf.holes.subtract(leaf.outline));assert.ok(outside.area()<.001,'every inner hole stays inside the leaf');
  const open=own(leaf.outline.subtract(leaf.holes)),core=own(open.offset(-.8)),pieces=core.decompose();assert.equal(pieces.length,1,'two-line inset leaves a connected spine, lobes and stem');pieces.forEach(p=>p.delete());
  for(const kind of ['coaster','coaster-tray','coaster-rack'])check(build({kind,width,depth,coasterShape:'monstera'}));
  owned.reverse().forEach(o=>o.delete());
 }
 for(const finish of ['smooth','fluted','slatted','ribbed','scalloped','wave'])check(build({kind:'coaster-tray',finish,coasterShape:'monstera'}));
});

test('leaf veins engrave the actual mesh without reducing the moisture backing below 2.4 mm',()=>{
 for(const coasterSurface of ['flat','recessed'])for(const [width,depth]of [[60,160],[100,125],[160,60]]){
  const model=build({coasterShape:'monstera',coasterSurface,width,depth}),owned=[],own=o=>(owned.push(o),o),leaf=monsteraSections(m,own,width,depth),solid=own(restore(model.parts[0])),floor=model.coasterFit.floor;
  assert.equal(model.coasterFit.veinDepth,.4);assert.ok(leaf.veins.area()>20);const low=own(solid.slice(2.39)),high=own(solid.slice(floor-.2)),unengraved=own(leaf.outline.subtract(leaf.holes)),grooves=own(unengraved.subtract(high)),veinHit=own(grooves.intersect(leaf.veins));assert.ok(veinHit.area()>10,'vein grooves exist in exported geometry');assert.ok(own(own(leaf.veins.subtract(leaf.hangingHole)).subtract(low)).area()<.001,'continuous backing below every vein');owned.reverse().forEach(o=>o.delete());
 }
 const thin=build({coasterShape:'monstera',height:3.6,coasterRim:1.2});assert.ok(thin.coasterFit.veinDepth<.001);check(thin);
});

test('plant hanging hole has a printable reinforced stem and can be omitted for ordinary coasters',()=>{
 for(const [width,depth]of [[60,60],[100,125],[160,60]]){const owned=[],own=o=>(owned.push(o),o),leaf=monsteraSections(m,own,width,depth),hole=own(m.CrossSection.circle(1.55,48).translate([leaf.hanger.x,leaf.hanger.y]));for(const leafHanger of [true,false]){const model=build({coasterShape:'monstera',width,depth,leafHanger}),solid=own(restore(model.parts[0])),section=own(solid.slice(1)),intersection=own(section.intersect(hole));if(leafHanger)assert.ok(intersection.area()<.001);else assert.ok(intersection.area()>7);check(model);}owned.reverse().forEach(o=>o.delete());}
});

test('eight and ten coasters can be downloaded with matching stacking trays and racks',()=>{for(const coasterCount of [8,10])for(const kind of ['coaster','coaster-tray','coaster-rack']){const m=build({kind,coasterCount});check(m);assert.equal(m.coasterFit.count,coasterCount);if(kind==='coaster')assert.equal(m.parts.length,coasterCount);}assert.throws(()=>build({kind:'coaster-plant',coasterShape:'monstera',coasterCount:5}),/4, 6, 8 or 10/);});
