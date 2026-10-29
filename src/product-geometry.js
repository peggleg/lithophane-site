import {makePegboard}from './pegboard-products.js';
import {validateProduct} from './product-settings.js';
import {productKernel} from './product-kernel.js';
import {makeMount} from './mount-products.js';
export function generateProduct(module,input){const p=validateProduct(input),K=productKernel(module,p);try{const info=p.kind==='pegboard-panel'?makePegboard(K,p):makeMount(K,p);return K.finish({productFit:info.fit,note:info.note,guide:info.guide,previewDirection:info.previewDirection});}finally{K.dispose();}}
