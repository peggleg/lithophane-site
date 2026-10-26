import {makePanel,stlBytes,threeMfParts} from './geometry.js';
import {assertExportBudget} from './resolution.js';
import {drawPhoto,imageTones} from './image-processing.js';
self.onmessage=({data})=>{
 const {panel,format,image,adjustments,budget}=data;
 const progress=value=>self.postMessage({progress:value});
 try {
  assertExportBudget(panel,format,budget,image?image.width*image.height:0);
  progress(5);
  if(image){
   const sample=new OffscreenCanvas(panel.cols,panel.rows),ctx=sample.getContext('2d',{willReadFrequently:true});
   if(!ctx)throw Error('This browser could not create an export canvas.');
   drawPhoto(ctx,image,panel.cols,panel.rows,panel.width/panel.height,adjustments);
   panel.tones=imageTones(ctx.getImageData(0,0,panel.cols,panel.rows).data,adjustments);
   sample.width=1;sample.height=1;
  }
  image?.close();progress(25);
  const mesh=makePanel(panel);panel.tones=null;progress(55);
  const parts=format==='3mf'?threeMfParts(mesh,progress,panel.printer):[stlBytes(mesh)];
  progress(95);
  const blob=new Blob(parts,{type:format==='3mf'?'model/3mf':'model/stl'});
  self.postMessage({progress:100,blob});
 }catch(error){self.postMessage({error:error.message||'Not enough memory to export at the requested quality. No lower-resolution file was generated.'});}
 finally{image?.close();}
};
