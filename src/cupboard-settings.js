export const cupboardDefaults={cupboardRows:2,cupboardColumns:1,doorMode:'single',hingeSide:'left',cupboardFloor:'auto',cupboardTop:'auto',doorMagnets:false,cupboardPorts:'both',drawerConnectors:'none'};
export const cupboardPreset={width:170,depth:130,height:170,wall:2.4,columns:1,rows:1,finish:'fluted'};
export function validateCupboard(p){
 for(const id of ['cupboardPorts','drawerConnectors'])if(!['none','vertical','sides','both'].includes(p[id]))throw Error('Choose no connectors, vertical, side-by-side, or both.');
 if(p.kind!=='cupboard')return;
 if(!Number.isInteger(p.cupboardRows)||p.cupboardRows<1||p.cupboardRows>3||!Number.isInteger(p.cupboardColumns)||p.cupboardColumns<1||p.cupboardColumns>2)throw Error('Choose 1–3 cupboard modules high and 1–2 across.');
 if(!['single','double'].includes(p.doorMode)||!['left','right'].includes(p.hingeSide))throw Error('Choose single or double doors and a hinge side.');
 for(const id of ['cupboardFloor','cupboardTop'])if(!['auto','each','none'].includes(p[id]))throw Error('Choose automatic, every module, or no floors/tops.');
 if(typeof p.doorMagnets!=='boolean')throw Error('Choose whether to include magnet pockets.');
 if(p.width/p.cupboardColumns<70||p.depth<60||p.height<80||p.wall<2.4)throw Error('Cupboards need 70 mm width per column, 60 mm depth, 80 mm module height and at least 2.4 mm walls. Total closed width stays within 170 mm.');
 p.columns=p.rows=1;
}
export const cupboardCaps=(p,row)=>({floor:p.cupboardFloor==='each'||p.cupboardFloor==='auto'&&row===0,top:p.cupboardTop==='each'||p.cupboardTop==='auto'&&row===p.cupboardRows-1});
export const connectorAxes=mode=>({vertical:['vertical','both'].includes(mode),sides:['sides','both'].includes(mode)});
