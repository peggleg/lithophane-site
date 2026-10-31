// Shared reversible board lid and magnet-pocket storage base, dimensions in mm.
export const gameColours={board:'#8c9b81',ivory:'#eee5d3',red:'#b76649'};
export function gameBoardLayout(p){const size=p.boardSize,margin=12,n=Math.max(2,Math.floor((size-2*margin)/21)),pitch=(size-2*margin)/n;return {size,margin,boxes:n,points:n+1,pitch,origin:-(size-2*margin)/2};}
export function boardBoxSolids(K,p,{height=p.storageHeight||40}={}){const {own,M}=K,s=p.boardSize,c=p.clearance,t=6,corner=s/2-7,centres=[[-corner,-corner],[corner,-corner],[corner,corner],[-corner,corner]],magnetRadius=3.1;
 let base=own(K.box(s,s,height,0,0,0,7).subtract(K.box(s-6,s-6,height,0,0,3,4)));
 for(const [x,y]of centres)base=own(base.add(K.cyl(5,height-3,x,y,3)));
 const holes=(z)=>centres.map(([x,y])=>K.cyl(magnetRadius,2.01,x,y,z));
 base=own(base.subtract(own(M.union(holes(height-2)))));
 // Two shallow, matching grooves accept the box's wall rim in either lid orientation.
 const rimOuter=K.round(s-1.4,s-1.4,6.3),rimInner=K.round(s-6.6,s-6.6,3.7),ring=own(rimOuter.subtract(rimInner));
 let lid=K.box(s,s,t,0,0,0,7);
 for(const z of [-.01,t-1.1])lid=own(lid.subtract(own(ring.extrude(1.12).translate([0,0,z]))));
 lid=own(lid.subtract(own(M.union(holes(t-2)))));
 return {base,lid,height,thickness:t,centres,magnetRadius,clearance:c};
}
export function placeGamePart(part,position,rotation=[0,0,0]){part.assembly=position;part.rotation=rotation;return part;}
export function gamePart(K,name,role,solid,position=[0,0,0],colour=gameColours.ivory){return placeGamePart(K.add(name,role,solid,[0,0,0],colour),position);}
export function repeatGamePart(K,template,name,position,colour=template.colour){return K.copy(name,template,position,colour);}
export function addBoardBox(K,p,solids,board=solids.lid){const {height:h,thickness:t}=solids,closed=p.boardView==='closed',open=p.boardView==='open';gamePart(K,'magnetic-storage-box','game-box',solids.base,[0,0,0],gameColours.board);const lid=gamePart(K,'reversible-playing-board','game-board',board,[0,open?p.boardSize+12:0,h-(closed?-t:0)],gameColours.board);if(closed)lid.rotation=[Math.PI,0,0];return {closed,boardZ:h,boardY:open?p.boardSize+12:0,top:h+t};}
// Uniform packed rows, all pieces below the inward-facing lid in the closed view.
export function packGamePieces(p,items,{floor=3,ceiling=(p.storageHeight||40)-7}={}){const edge=p.boardSize-26,gap=1.2;let x=-edge/2,y=-edge/2,row=0,z=floor,layerHeight=0;for(const item of items){const [w,d,h]=item.size;if(w>edge||d>edge||h>ceiling-floor)throw Error('Increase the box size or storage height to store the selected pieces.');if(x+w>edge/2){x=-edge/2;y+=row+gap;row=0;}if(y+d>edge/2){x=-edge/2;y=-edge/2;z+=layerHeight+gap;row=0;layerHeight=0;}if(z+h>ceiling)throw Error('Increase storage height or reduce the piece quantities so everything fits inside.');item.part.assembly=[x+w/2,y+d/2,z];item.part.rotation=[0,0,0];x+=w+gap;row=Math.max(row,d);layerHeight=Math.max(layerHeight,h);}return items;}
export const boardBoxGuide=`The playing board is also the lid. Remove every loose piece, pack them inside the base, then FLIP the board so the playing face points inward and the smooth back faces outward. Internal corner pockets are 6.2 mm diameter × 2 mm deep for nominal Ø6 × 2 mm magnets; eight magnets per box/lid pair. Glue magnets flush after checking polarity with the lid flipped CLOSED. Keep magnets captive with suitable adhesive. Print the base floor-down and board smooth-back-down. The corner pockets open on the playing face and the box rim; no exterior pocket is exposed when closed. Small parts and magnets are not suitable for young children.`;
