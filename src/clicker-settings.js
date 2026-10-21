export const clickerDefaults={kind:'clicker',design:'pebble',count:1,capShape:'circle',font:'sans',pitch:23,cutout:14.1,plate:1.5,cavity:16,wall:2.4,socketClearance:.15,stemWidth:5.8,stemHeight:4,keys:[{type:'symbol',value:'heart'}]};
export const clickerPresets={
 pebble:{count:1,capShape:'circle',keys:[{type:'symbol',value:'heart'}]},
 namebar:{count:3,capShape:'rounded',keys:[...'SAM'].map(value=>({type:'text',value}))},
 symbols:{count:5,capShape:'rounded',keys:['heart','star','cloud','flower','plus'].map(value=>({type:'symbol',value}))},
 numbers:{count:4,capShape:'rounded',keys:[...'1234'].map(value=>({type:'text',value}))},
 cloud:{count:4,capShape:'circle',keys:[{type:'symbol',value:'heart'},{type:'symbol',value:'star'},{type:'text',value:'B'},{type:'text',value:'7'}]}
};
export function validateClickerSettings(input){
 const p={...clickerDefaults,...input};
 if(!Object.hasOwn(clickerPresets,p.design)||!['rounded','circle','heart'].includes(p.capShape)||!Number.isInteger(p.count)||p.count<1||p.count>5)throw Error('Choose a design, 1–5 buttons and a valid keycap shape.');
 if(p.design==='pebble'&&p.count!==1)throw Error('Pocket Pebble has one button. Choose a bar or cluster for multiple buttons.');
 for(const [field,min,max]of [['pitch',22,28],['cutout',13.8,14.8],['plate',1.2,2.2],['cavity',14,20],['wall',2,4],['socketClearance',0,.4],['stemWidth',5.6,7],['stemHeight',3,5]])if(!Number.isFinite(p[field])||p[field]<min||p[field]>max)throw Error(`Use ${min}–${max} mm for ${field}.`);
 if(p.stemWidth-(4+p.socketClearance)<1.4)throw Error('The stem connector needs at least 0.7 mm of wall around its socket. Increase connector width or reduce socket clearance.');
 if(!Array.isArray(p.keys)||p.keys.length!==p.count)throw Error('Give each button a letter, number, symbol or blank face.');
 p.keys=p.keys.map(key=>{if(!key||!['text','symbol','blank'].includes(key.type))throw Error('Choose a valid button marking.');const value=String(key.value??'').normalize('NFC');if(key.type==='text'&&(!/^[\p{L}\p{N}]$/u.test(value)))throw Error('Use one letter or number on each button.');if(key.type==='symbol'&&!['heart','star','cloud','flower','plus'].includes(value))throw Error('Choose a symbol from the list.');return {type:key.type,value:key.type==='blank'?'':value};});
 return p;
}
export function clickerPositions(p){
 if(p.design==='cloud'&&p.count>=3){const bottom=Math.min(3,p.count-1),top=p.count-bottom;return [...Array.from({length:top},(_,i)=>[(i-(top-1)/2)*p.pitch,p.pitch/2]),...Array.from({length:bottom},(_,i)=>[(i-(bottom-1)/2)*p.pitch,-p.pitch/2])];}
 if(!['cloud','numbers'].includes(p.design))return Array.from({length:p.count},(_,i)=>[(i-(p.count-1)/2)*p.pitch,0]);
 const cols=Math.ceil(Math.sqrt(p.count)),rows=Math.ceil(p.count/cols);
 return Array.from({length:p.count},(_,i)=>{const row=Math.floor(i/cols),inRow=Math.min(cols,p.count-row*cols);return [(i%cols-(inRow-1)/2)*p.pitch,((rows-1)/2-row)*p.pitch];});
}
