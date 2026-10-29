export const isCableGuide=kind=>['cable-guide','pegboard-cables'].includes(kind);
// Scale the circular seat with the cable. Keep a fixed rear allowance for
// the separate flexing arms, their backbone and the shared release-tab space.
export function cableDimensions(p){const clearance=p.cableClearance??.3,seatDiameter=p.cableDiameter+2*clearance,armThickness=1.2,pitch=seatDiameter+2*armThickness+1.2;return {clearance,seatDiameter,radius:seatDiameter/2,mouthWidth:p.cableDiameter-.6,armThickness,pitch,depth:+(seatDiameter+2*armThickness+3).toFixed(2),width:Math.max(28,(p.channels-1)*pitch+seatDiameter+2*armThickness+4)};}
