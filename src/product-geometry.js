import {validateProduct} from './product-settings.js';
import {productKernel} from './product-kernel.js';
import {makeMount} from './mount-products.js';
export function generateProduct(module,input){const p=validateProduct(input),K=productKernel(module,p);try{const info=makeMount(K,p);return K.finish({productFit:info.fit,note:info.note,guide:info.guide});}finally{K.dispose();}}
