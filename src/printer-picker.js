import {defaultPrinter,printerKey,printerSizeText} from './printer-settings.js';
export function mountPrinterPicker(onChange){
 const host=document.querySelector('#studio .controls')||document.querySelector('.controls');if(!host)return;
 const field=document.createElement('fieldset');field.id='printer-settings';field.innerHTML='<legend>Your printer size</legend><label>Build volume<select id="printer-size"><option value="a1-mini">180 × 180 × 180 mm · Bambu A1 mini</option><option value="256">256 × 256 × 256 mm · Bambu A1</option></select></label><p id="printer-size-help" class="caption"></p>';host.prepend(field);
 const select=field.querySelector('select'),help=field.querySelector('p');function sync(value=defaultPrinter){select.value=printerKey(value);help.textContent=printerSizeText(value);}select.oninput=()=>{sync(select.value);onChange(select.value);};sync();return {get:()=>select.value,sync,reset:()=>sync(defaultPrinter)};
}
