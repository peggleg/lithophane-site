import {outline,fitSymbol,ringHole} from './symbols.js';
export function createSymbolEditor(read,change){
 const host=document.getElementById('symbol-editor'),size=document.getElementById('symbol-size');let symbols=[],selected=-1,drag=null;
 const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('aria-label','Position your symbols');host.append(svg);
 function node(tag,attributes){const n=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attributes))n.setAttribute(k,v);svg.append(n);return n;}
 function paint(){const focused=svg.contains(document.activeElement);const p=read();svg.setAttribute('viewBox',`${-p.width/2} ${-p.height/2} ${p.width} ${p.height}`);svg.replaceChildren();let points;
 if(['heart','star','cloud','circle'].includes(p.shape))points=outline(p.shape,p.width,p.height);else points=null;
 if(points)node('polygon',{points:points.map(([x,y])=>`${x},${-y}`).join(' '),fill:'#c59772'});else node('rect',{x:-p.width/2,y:-p.height/2,width:p.width,height:p.height,rx:p.shape==='capsule'?p.height/2:4,fill:'#c59772'});
 if(p.kind==='keyring')try{const hole=ringHole(p);node('circle',{cx:hole.x,cy:-hole.y,r:p.hole/2,fill:'#fffdf9'});}catch{}
 symbols.forEach((s,i)=>{const n=node('polygon',{points:outline(s.type,s.size,s.size).map(([x,y])=>`${x+s.x},${-y-s.y}`).join(' '),fill:'#fff3d5',stroke:i===selected?'#294832':'transparent','stroke-width':.5,tabindex:0,role:'button','aria-label':`${s.type} symbol ${i+1}. Arrow keys move; Shift moves faster.`});
 n.onfocus=()=>{selected=i;size.value=s.size;svg.querySelectorAll('[tabindex]').forEach((element,j)=>element.setAttribute('stroke',i===j?'#294832':'transparent'));};n.onpointerdown=e=>{e.preventDefault();selected=i;size.value=s.size;drag={id:e.pointerId,index:i};svg.setPointerCapture(e.pointerId);n.focus();};
 n.onkeydown=e=>{const steps={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1]};if(!steps[e.key])return;e.preventDefault();const [x,y]=steps[e.key],step=e.shiftKey?2:.5;move(i,{...s,x:s.x+x*step,y:s.y+y*step},true);};});
 if(focused&&selected>=0)svg.querySelectorAll('[tabindex]')[selected]?.focus();
 }
 function move(i,value,focus=false){try{symbols[i]=fitSymbol(value,read());paint();if(focus)svg.querySelectorAll('[tabindex]')[i]?.focus();change();}catch(e){document.getElementById('feedback').textContent=e.message;}}
 svg.onpointermove=e=>{if(!drag)return;const point=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());move(drag.index,{...symbols[drag.index],x:point.x,y:-point.y});};
 const end=()=>{drag=null;};svg.onpointerup=end;svg.onpointercancel=end;
 document.getElementById('add-symbol').onclick=()=>{if(symbols.length>=8)return;try{symbols.push(fitSymbol({type:document.getElementById('symbol-choice').value,size:8,x:read().width/4,y:0},read()));selected=symbols.length-1;paint();change();}catch(e){document.getElementById('feedback').textContent=e.message;}};
 size.oninput=()=>{if(selected>=0)move(selected,{...symbols[selected],size:Number(size.value)});};
 document.getElementById('remove-symbol').onclick=()=>{if(selected<0)return;symbols.splice(selected,1);selected=-1;paint();change();};
 return {get:()=>symbols.map(s=>({...s})),reset(){symbols=[];selected=-1;paint();},refresh(){const p=read();symbols=symbols.map(s=>fitSymbol(s,p));paint();}};
}
