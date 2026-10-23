import {encodeKeyringQR} from './qr-code.js';
import {fonts} from './font-catalogue.js';
import {fitSymbol} from './symbols.js';
export const textDefaults={nameplate:{kind:'nameplate',line1:'MAKE IT YOURS',line2:'A little imagination',font:'sans',width:160,height:50,base:3,relief:.8,size:18,mode:'raised',align:'center',shape:'rounded',hole:5,stand:true},keyring:{kind:'keyring',qrEnabled:false,qrText:'https://example.com',line1:'EXPLORE',line2:'',font:'rounded',width:70,height:25,base:3,relief:.8,size:10,mode:'raised',align:'center',shape:'rounded',hole:5,stand:false}};
export function validateTextSettings(input){
 const p={...input,line1:String(input.line1??'').normalize('NFC').trim(),line2:String(input.line2??'').normalize('NFC').trim()};
 if(!['nameplate','keyring'].includes(p.kind)||!Object.hasOwn(fonts,p.font)||!['raised','recessed'].includes(p.mode)||!['left','center','right'].includes(p.align)||!['rounded','capsule','circle','heart','star','cloud'].includes(p.shape))throw Error('Choose valid text and shape options.');
 p.qrEnabled=p.kind==='keyring'&&input.qrEnabled===true;
 if(p.qrEnabled){p.qrText=encodeKeyringQR(input.qrText).text;p.mode='raised';p.line1='';p.line2='';}
 if(!p.qrEnabled&&!p.line1&&!p.line2&&!input.symbols?.length)throw Error('Enter at least one line of text.');
 if([...p.line1,...p.line2].length>60||/[\r\n\t]/.test(p.line1+p.line2))throw Error('Use up to 60 characters across the two lines, without tabs or line breaks.');
 const key=p.kind==='keyring';
 for(const field of ['width','height','base','relief','size','hole'])if(!Number.isFinite(p[field]))throw Error('Enter finite dimensions.');
 if(p.width<(key?35:60)||p.width>(key?100:240)||p.height<(key?20:25)||p.height>(key?65:120)||p.base<1.6||p.base>8||p.relief<.4||p.relief>2||p.size<5||p.size>40)throw Error(key?'Use 35–100 mm width, 20–65 mm height, 1.6–8 mm base, 0.4–2 mm relief and 5–40 mm font size.':'Use 60–240 mm width, 25–120 mm height, 1.6–8 mm base, 0.4–2 mm relief and 5–40 mm font size.');
 if(key&&(p.hole<3||p.hole>8))throw Error('Choose a ring hole diameter of 3–8 mm.');
 if(p.shape==='circle'&&key){if(p.width>65)throw Error('Circular tags must be 35–65 mm in diameter.');p.height=p.width;}
 if(p.mode==='recessed'&&p.base-p.relief<1.2-1e-6)throw Error('Recessed text must leave at least 1.2 mm of solid base.');
 if(!Array.isArray(input.symbols||[])||(input.symbols||[]).length>8)throw Error('Use up to eight symbols.');
 p.symbols=(p.qrEnabled?[]:input.symbols||[]).map(symbol=>fitSymbol(symbol,p));
 return p;
}

export const keyringShapeSizes={rounded:[70,25],capsule:[70,25],circle:[50,50],heart:[60,55],star:[60,60],cloud:[70,45]};
