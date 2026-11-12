import {printerKey,printLimit} from './printer-settings.js';
import {lanternSpec} from './lantern-model.js';

export const cylinderSpec=Object.freeze({outerDiameter:90,innerDiameter:84,seatDiameter:90.6,lipHeight:2,tealightDiameter:38,tealightHeight:19,recessDepth:3});
export const cylinderLightFits=Object.freeze({
 tealight:Object.freeze({name:'LED tealight',diameter:38,height:19,recessDiameter:39,recessDepth:3,minDiameter:38.2,maxDiameter:40,cableWidth:0}),
 bambu001:Object.freeze({name:'Bambu LED Kit 001',diameter:lanternSpec.ledDiameter,height:lanternSpec.ledHeight,recessDiameter:lanternSpec.recessDiameter,recessDepth:5,minDiameter:59.2,maxDiameter:60,cableWidth:5}),
});
export const tripodFitSpec=Object.freeze({socketWidth:10.4,socketDepth:4,pegDepth:3.8,leadIn:0.4});
export const cylinderStands=Object.freeze([
 {id:'desktop-plain',name:'Everyday pedestal',group:'Desktop',height:12,colour:'#e9dfcc',style:'plain'},
 {id:'desktop-christmas',name:'Christmas woodland',group:'Desktop',height:15,colour:'#e9dfcc',style:'christmas'},
 {id:'desktop-autumn',name:'Autumn leaves',group:'Desktop',height:15,colour:'#a75434',style:'autumn'},
 {id:'desktop-spring',name:'Spring blossom',group:'Desktop',height:15,colour:'#a6b49a',style:'spring'},
 {id:'tall-plinth',name:'Stepped plinth',group:'Elevated',height:55,colour:'#e9dfcc',style:'plinth'},
 {id:'tall-classic',name:'Classic pedestal',group:'Elevated',height:95,colour:'#e9dfcc',style:'classic'},
 {id:'tall-tripod',name:'Three-leg stand',group:'Elevated',height:85,colour:'#c5a37c',style:'tripod'},
 {id:'tall-woodland',name:'Winter woodland pedestal',group:'Elevated',height:85,colour:'#e9dfcc',style:'woodland'},
]);
export const cylinderDefaults=Object.freeze({kind:'cylinder',printer:'a1-mini',stand:'desktop-plain',lightSource:'tealight',height:94,min:.8,max:3,fitDiameter:39,tripodPegWidth:10.5,brightness:0,rotation:0});
export function cylinderSettings(input={}){
 const p={...cylinderDefaults,...input,kind:'cylinder'};p.printer=printerKey(p);
 if(!cylinderStands.some(s=>s.id===p.stand))throw Error('Choose one of the eight stands.');
 const fit=cylinderLightFits[p.lightSource];if(!fit)throw Error('Choose an LED light source.');
 if(input.fitDiameter===undefined)p.fitDiameter=fit.recessDiameter;
 if(![p.height,p.min,p.max,p.fitDiameter,p.brightness,p.rotation].every(Number.isFinite)||p.height<70||p.height>Math.min(150,printLimit(p))||p.min<.8||p.max>3||p.max<p.min||p.fitDiameter<fit.minDiameter||p.fitDiameter>fit.maxDiameter||Math.abs(p.brightness)>40||p.rotation<0||p.rotation>360)throw Error(`Use height 70–150 mm, wall thickness 0.8–3 mm and ${fit.name} clearance diameter ${fit.minDiameter}–${fit.maxDiameter} mm.`);
 if(p.stand==='tall-tripod'&&(!Number.isFinite(p.tripodPegWidth)||p.tripodPegWidth<10.2||p.tripodPegWidth>10.8))throw Error('Use a tripod peg width of 10.2–10.8 mm. Print the joint test to choose the fit.');
 return p;
}
