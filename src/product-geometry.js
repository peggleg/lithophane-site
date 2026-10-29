import {makeShuffler}from './game-shuffler.js';
import {makeTokenCups}from './game-tokens.js';
import {makeCardHolder}from './game-cards.js';
import {makeDiceTower}from './game-dice.js';
import {makeProjectPod}from './crochet-pod.js';
import {makeCrochetCabinet}from './crochet-cabinet.js';
import {makeCrochetYarn}from './crochet-yarn.js';
import {makeSeedLabels}from './seed-labels.js';
import {makeGrowRows}from './seed-grow-row.js';
import {makeSeedReservoir}from './seed-reservoir.js';
import {makeSeedProduct}from './seed-products.js';
import {makePegboardAccessory}from './pegboard-accessories.js';
import {makePegboard}from './pegboard-products.js';
import {validateProduct} from './product-settings.js';
import {productKernel} from './product-kernel.js';
import {makeMount} from './mount-products.js';
export function generateProduct(module,input){const p=validateProduct(input),K=productKernel(module,p);try{const info=p.kind.startsWith('game-shuffler')?makeShuffler(K,p):p.kind==='game-tokens'?makeTokenCups(K,p):p.kind==='game-cards'?makeCardHolder(K,p):p.kind==='game-dice'?makeDiceTower(K,p):p.kind==='pegboard-panel'?makePegboard(K,p):p.kind.startsWith('pegboard-')?makePegboardAccessory(K,p):p.kind==='seed-labels'?makeSeedLabels(K,p):p.kind==='seed-grow-row'?makeGrowRows(K,p):p.kind==='seed-reservoir'?makeSeedReservoir(K,p):p.kind.startsWith('seed-')?makeSeedProduct(K,p):p.kind==='crochet-pod'?makeProjectPod(K,p):p.kind==='crochet-cabinet'?makeCrochetCabinet(K,p):p.kind==='crochet-yarn'?makeCrochetYarn(K,p):makeMount(K,p);if(p.kind.startsWith('pegboard-')&&!['pegboard-panel','pegboard-adapter','pegboard-quick-adapter'].includes(p.kind))info.note=(p.mountType==='direct'?'Direct peg-in option: integral hooks and pegs, no slide adapter. ':p.mountType==='quick'?'Quick-move option: leave the holder clipped to its lift-off mount and move the pair without tools. Download the matching lift-off mount separately. ':'Screw-fixed option: download the matching shared adapter separately. ')+info.note;return K.finish({printPlates:p.kind.startsWith('game-')||['crochet-cabinet','crochet-pod'].includes(p.kind),productFit:info.fit,note:info.note,guide:info.guide,previewDirection:info.previewDirection});}finally{K.dispose();}}
