import {minimumStorageHeight,storageItems}from './game-storage.js';
import {makeMarble}from './game-marble.js';
import {makeFour}from './game-four.js';
import {makeTicTacToe}from './game-tictactoe.js';
import {makeSolitaire}from './game-solitaire.js';
import {makeDots}from './game-dots.js';
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
function buildProduct(module,p){const K=productKernel(module,p);try{const info=p.kind==='game-marble'?makeMarble(K,p):p.kind==='game-four'?makeFour(K,p):p.kind==='game-tictactoe'?makeTicTacToe(K,p):p.kind==='game-solitaire'?makeSolitaire(K,p):p.kind==='game-dots'?makeDots(K,p):p.kind.startsWith('game-shuffler')?makeShuffler(K,p):p.kind==='game-tokens'?makeTokenCups(K,p):p.kind==='game-cards'?makeCardHolder(K,p):p.kind==='game-dice'?makeDiceTower(K,p):p.kind==='pegboard-panel'?makePegboard(K,p):p.kind.startsWith('pegboard-')?makePegboardAccessory(K,p):p.kind==='seed-labels'?makeSeedLabels(K,p):p.kind==='seed-grow-row'?makeGrowRows(K,p):p.kind==='seed-reservoir'?makeSeedReservoir(K,p):p.kind.startsWith('seed-')?makeSeedProduct(K,p):p.kind==='crochet-pod'?makeProjectPod(K,p):p.kind==='crochet-cabinet'?makeCrochetCabinet(K,p):p.kind==='crochet-yarn'?makeCrochetYarn(K,p):makeMount(K,p);if(p.kind.startsWith('pegboard-')&&!['pegboard-panel','pegboard-adapter','pegboard-quick-adapter'].includes(p.kind))info.note=(p.mountType==='direct'?'Direct peg-in option: integral hooks and pegs, no slide adapter. ':p.mountType==='quick'?'Quick-move option: leave the holder clipped to its lift-off mount and move the pair without tools. Download the matching lift-off mount separately. ':'Screw-fixed option: download the matching shared adapter separately. ')+info.note;const model=K.finish({printPlates:p.kind.startsWith('game-')||['crochet-cabinet','crochet-pod'].includes(p.kind),productFit:info.fit,note:info.note,guide:info.guide,previewDirection:info.previewDirection});if(p.kind==='game-marble'&&p.exportSet==='pieces'){const context=model.parts.filter(part=>['game-box','game-board','marble-board-key'].includes(part.role));model.references.push(...context);model.parts=model.parts.filter(part=>!context.includes(part));if(!model.parts.length)throw Error('Select at least one track, support, brace or marble for an expansion pack.');model.note+=' Expansion export: only selected pieces; boards and boxes are preview context.';model.guide+='\nEXPANSION PACK: board modules, storage trays, lids and board-joining keys shown in the preview are excluded from this export. Match the board size, marble diameter, riser height and clearance to your existing kit.';}return model;}finally{K.dispose();}}

function generateCompleteProduct(module,input){const p=validateProduct(input),slim=['game-dots','game-solitaire','game-tictactoe','game-marble'].includes(p.kind);if(slim&&p.heightMode==='auto'){const probe=buildProduct(module,{...p,storageHeight:90,boardView:'closed'}),items=storageItems([...probe.parts,...probe.references]),count=p.kind==='game-marble'?p.boardColumns*p.boardRows*p.storageLayers:1,reserve=p.kind==='game-dots'?5:1.2,height=minimumStorageHeight(items,{size:p.boardSize,count,reserve});p.storageHeight=height;const model=buildProduct(module,p);model.productFit.minimumStorageHeight=height;model.note+=` Slim-fit box height: ${height} mm${p.kind==='game-marble'?' per layer':''}; ${p.kind==='game-marble'?height*p.storageLayers+6:height+6} mm closed with lid.`;model.guide+=`\nSTORAGE HEIGHT: ${height} mm${p.kind==='game-marble'?' per layer':''}. Automatic height is calculated from the packed pieces and lid clearance, not proportional scaling.`;return model;}return buildProduct(module,p);}

export function generateProduct(module,input){const model=generateCompleteProduct(module,input),p=model.settings;let roles,label;
 if(p.kind==='game-dots'&&p.exportSet!=='complete'){roles=p.exportSet==='bars'?['game-bar']:p.exportSet==='tiles'?['game-tile']:['game-bar','game-tile'];label=p.exportSet==='bars'?'Connecting bars only':p.exportSet==='tiles'?'Claim tiles only':'Bars and claim tiles only';}
 if(p.kind==='game-four'&&p.exportSet==='discs'){roles=['game-counter'];label='Discs only';}
 if(roles){const context=model.parts.filter(part=>!roles.includes(part.role));model.references.push(...context);model.parts=model.parts.filter(part=>roles.includes(part.role));model.note=`${label}: ${model.parts.length} printable pieces. Board, box and mechanism are preview context and are excluded from downloads. Match board size and fit clearance to your existing game.`;model.guide=`PARTS-ONLY EXPORT — ${label.toUpperCase()}\n${model.parts.length} selected pieces. Board, lid, box and mechanism shown in the preview are not included. Use the same board size and clearance as the original game. Each piece is supplied separately in the STL ZIP; 3MF contains only the selected pieces in their printing orientations. Preview colours do not assign filament.\n\nFULL GAME REFERENCE\n${model.guide}`;}
 return model;}
