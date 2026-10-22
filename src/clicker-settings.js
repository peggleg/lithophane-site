import {symbolNames} from './clicker-symbols.js';
export const clickerDefaults={kind:'clicker',design:'charm',count:3,capShape:'rounded',font:'rounded',palette:'candy',keyring:true,floor:1.8,pitch:24,cutout:14.1,cavity:9,wall:2.4,socketClearance:.15,stemWidth:5.8,stemHeight:4,keys:[...'JOY'].map(value=>({type:'text',value}))};
export const clickerPresets={
 christmas:{count:5,capShape:'rounded',palette:'christmas',keyring:true,keys:['tree','snowflake','present','bauble','gingerbread'].map(value=>({type:'symbol',value}))},
 charm:{count:3,capShape:'rounded',palette:'candy',keyring:true,keys:[...'JOY'].map(value=>({type:'text',value}))},
 gamepad:{count:4,capShape:'rounded',palette:'arcade',keyring:false,keys:[...'ABXY'].map(value=>({type:'text',value}))},
 bloom:{count:5,capShape:'rounded',palette:'pastel',keyring:true,keys:['flower','heart','star','cloud','plus'].map(value=>({type:'symbol',value}))},
 pebble:{palette:'candy',keyring:true,count:1,capShape:'rounded',keys:[{type:'symbol',value:'heart'}]},
 namebar:{palette:'forest',keyring:true,count:3,capShape:'rounded',keys:[...'SAM'].map(value=>({type:'text',value}))},
 symbols:{palette:'candy',keyring:true,count:5,capShape:'rounded',keys:['heart','star','cloud','flower','plus'].map(value=>({type:'symbol',value}))},
 numbers:{palette:'arcade',keyring:false,count:4,capShape:'rounded',keys:[...'1234'].map(value=>({type:'text',value}))},
 cloud:{palette:'pastel',keyring:false,count:4,capShape:'rounded',keys:[{type:'symbol',value:'heart'},{type:'symbol',value:'star'},{type:'text',value:'B'},{type:'text',value:'7'}]}
};
export function validateClickerSettings(input){
 const p={...clickerDefaults,...input};
 if(!Object.hasOwn(clickerPresets,p.design)||p.capShape!=='rounded'||!Number.isInteger(p.count)||p.count<1||p.count>5)throw Error('Choose a design, 1–5 buttons and square keycaps.');
 if(p.design==='pebble'&&p.count!==1)throw Error('Pocket Pebble has one button. Choose a bar or cluster for multiple buttons.');
 for(const [field,min,max]of [['floor',1.6,3.2],['pitch',24,28],['cutout',13.8,14.8],['cavity',8,20],['wall',2,4],['socketClearance',0,.4],['stemWidth',5.6,7],['stemHeight',3,5]])if(!Number.isFinite(p[field])||p[field]<min||p[field]>max)throw Error(`Use ${min}–${max} mm for ${field}.`);
 if(typeof p.keyring!=='boolean'||!['candy','pastel','arcade','forest','christmas','spooky','custom'].includes(p.palette))throw Error('Choose a valid palette and keyring option.');
 if(p.stemWidth-(4+p.socketClearance)<1.4)throw Error('The stem connector needs at least 0.7 mm of wall around its socket. Increase connector width or reduce socket clearance.');
 if(!Array.isArray(p.keys)||p.keys.length!==p.count)throw Error('Give each button a letter, number, symbol or blank face.');
 p.keys=p.keys.map(key=>{if(!key||!['text','symbol','blank'].includes(key.type))throw Error('Choose a valid button marking.');const value=String(key.value??'').normalize('NFC');if(key.type==='text'&&(!/^[\p{L}\p{N}]$/u.test(value)))throw Error('Use one letter or number on each button.');if(key.type==='symbol'&&!Object.hasOwn(symbolNames,value))throw Error('Choose a symbol from the list.');if(key.colour!==undefined&&!/^#[0-9a-f]{6}$/i.test(key.colour))throw Error('Choose a valid key colour.');return {type:key.type,value:key.type==='blank'?'':value,...(key.colour?{colour:key.colour}:{})};});
 return p;
}
export function clickerPositions(p){
 if(p.design==='bloom'&&p.count>=4){const ring=[[-p.pitch,0],[0,p.pitch],[p.pitch,0],[0,-p.pitch]];return p.count===5?[[0,0],...ring]:ring;}
 if(p.design==='cloud'&&p.count>=3){const bottom=Math.min(3,p.count-1),top=p.count-bottom;return [...Array.from({length:top},(_,i)=>[(i-(top-1)/2)*p.pitch,p.pitch/2]),...Array.from({length:bottom},(_,i)=>[(i-(bottom-1)/2)*p.pitch,-p.pitch/2])];}
 if(!['cloud','numbers','gamepad','bloom'].includes(p.design))return Array.from({length:p.count},(_,i)=>[(i-(p.count-1)/2)*p.pitch,0]);
 const cols=Math.ceil(Math.sqrt(p.count)),rows=Math.ceil(p.count/cols);
 return Array.from({length:p.count},(_,i)=>{const row=Math.floor(i/cols),inRow=Math.min(cols,p.count-row*cols);return [(i%cols-(inRow-1)/2)*p.pitch,((rows-1)/2-row)*p.pitch];});
}

export const clickerPalettes={
 christmas:{base:'#fff5e7',trim:'#fff5e7',caps:['#35795d','#c94c56','#ce9e43','#3b7c62','#b64350'],ink:'#fff7e8'},
 spooky:{base:'#332b44',trim:'#463657',caps:['#e49a44','#a88bdb','#7cab83','#bd90d6','#df9756'],ink:'#241f30'},
 candy:{base:'#fff4e7',trim:'#fff4e7',caps:['#ed7fa2','#a68bdf','#68b6e8','#6acba3','#efc95b'],ink:'#fffaf6'},
 pastel:{base:'#f9f3eb',trim:'#fffaf4',caps:['#c6a9e8','#edafc6','#a8cbb2','#a9cee9','#efd889'],ink:'#4b405d'},
 arcade:{base:'#29334d',trim:'#20263a',caps:['#ea6a87','#e8bf4f','#6fcba5','#7a9feb','#bb8ddd'],ink:'#fff9ec'},
 forest:{base:'#526c4b',trim:'#e7e3ce',caps:['#f4eddb'],ink:'#294832'}
};
