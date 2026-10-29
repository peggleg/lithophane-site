import {makePegboardAccessory}from './pegboard-accessories.js';
import {makePegboard}from './pegboard-products.js';
import {validateProduct} from './product-settings.js';
import {productKernel} from './product-kernel.js';
import {makeMount} from './mount-products.js';
export function generateProduct(module,input){const p=validateProduct(input),K=productKernel(module,p);try{const info=p.kind==='pegboard-panel'?makePegboard(K,p):p.kind.startsWith('pegboard-')?makePegboardAccessory(K,p):makeMount(K,p);if(p.kind.startsWith('pegboard-')&&!['pegboard-panel','pegboard-adapter','pegboard-quick-adapter'].includes(p.kind))info.note=(p.mountType==='quick'?'Quick-move option: leave the holder clipped to its lift-off mount and move the pair without tools. Download the matching lift-off mount separately. ':'Screw-fixed option: download the matching shared adapter separately. ')+info.note;return K.finish({productFit:info.fit,note:info.note,guide:info.guide,previewDirection:info.previewDirection});}finally{K.dispose();}}
