import {connectorAxes} from './cupboard-settings.js';
// Flat bridge with two split snap studs. The 45-degree lead enters the back
// holes; the shoulder seats behind the wall. Removal needs access from inside.
export function connectorFit(p){const shaft=2,hole=2+p.clearance,head=Math.max(2.8,hole+.5),rise=Math.max(.9,head-shaft);return {spacing:16,shaft,hole,head,rise,cap:2.4,wall:p.wall,neck:p.wall+.4,headHeight:rise+.7};}
export function snapBridge(module,own,p,{horizontal=false}={}){
 const {CrossSection:C,Manifold:M}=module,f=connectorFit(p),base=own(own(C.square([5,22],true)).offset(2,'Round',2,24).extrude(f.cap)),studs=[];
 for(const y of [-8,8]){
  const stem=own(C.circle(f.shaft,40).extrude(f.neck+.02).translate([0,y,f.cap-.01]));
  const shoulder=own(M.cylinder(f.rise,f.shaft,f.head,40).scale([1,1.4/f.head,1]).translate([0,y,f.cap+f.neck-.01])),lead=own(M.cylinder(.7,f.head,1.6,40).scale([1,1.4/f.head,1]).translate([0,y,f.cap+f.neck+f.rise-.02]));
  studs.push(own(M.union([stem,shoulder,lead])));
 }
 let joined=own(base.add(own(M.union(studs))));
 // Split heads and long in-plane spring arms provide enough compression
 // travel; a short unsprung stud cannot pass the smaller retaining hole.
 const cuts=[];
 for(const sign of [-1,1]){
  const y=sign*6.45;
  cuts.push(own(C.square([1.4,10.9],true).extrude(f.cap+f.neck+f.headHeight+.3).translate([0,y,-.1])));
  for(const x of [-2.45,2.45])cuts.push(own(C.square([.9,10.9],true).extrude(f.cap+.2).translate([x,y,-.1])));
  cuts.push(own(C.square([5.8,.8],true).extrude(f.cap+.2).translate([0,sign*12,-.1])));
 }
 joined=own(joined.subtract(own(M.union(cuts))));
 return horizontal?own(joined.rotate([0,0,90])):joined;
}

export function rearHole(module,own,p,x,z,back){return own(module.CrossSection.circle(connectorFit(p).hole,48).extrude(p.wall+.2).rotate([90,0,0]).translate([x,back+.1,z]));}
export function drawerConnectorSites(p,bodyHeight){
 const a=connectorAxes(p.drawerConnectors),sites=[],slot=(bodyHeight-(p.drawers+1)*p.wall)/p.drawers;
 if(a.vertical)for(const x of [-1,1])for(const y of [-1,1])sites.push([x*(p.width/2-12),y*(bodyHeight/2-8)]);
 if(a.sides)for(const x of [-1,1])for(const row of [0,p.drawers-1]){const y=p.drawers===1?(row===0&&sites.some(s=>Math.abs(s[0]-x*(p.width/2-8))<.01)?slot*.22:-slot*.22):-bodyHeight/2+p.wall+slot/2+row*(slot+p.wall);if(!sites.some(s=>Math.abs(s[0]-x*(p.width/2-8))<.01&&Math.abs(s[1]-y)<.01))sites.push([x*(p.width/2-8),y]);}
 return sites;
}
export function connectDrawerCase(module,own,p,shell,bodyHeight){
 const {CrossSection:C,Manifold:M}=module,holes=drawerConnectorSites(p,bodyHeight).map(([x,y])=>own(C.circle(connectorFit(p).hole,48).extrude(p.wall+.2).translate([x,y,-.1])));
 return holes.length?own(shell.subtract(own(M.union(holes)))):shell;
}
export function addDrawerKeys(module,own,p,add){const a=connectorAxes(p.drawerConnectors);for(const [axis,on]of Object.entries(a))if(on)for(let i=1;i<=2;i++){add(`drawer-${axis}-locking-key-${i}`,'connector-key',snapBridge(module,own,p,{horizontal:axis==='sides'}),[0,0,0]);add.hidden();}}
