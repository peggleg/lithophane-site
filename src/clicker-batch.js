import {pebbleBatchCharacters,validateClickerSettings} from './clicker-settings.js';
import {generateClickerModel} from './clicker-geometry.js';
export function generatePebbleBatch(module,fontBuffer,settings,text,onProgress=()=>{}){
 const characters=pebbleBatchCharacters(text),single=validateClickerSettings({...settings,design:'pebble',count:1,keys:[{type:'text',value:characters[0]}]}),parts=[],columns=Math.ceil(Math.sqrt(characters.length));
 let reference;
 characters.forEach((value,index)=>{
  const model=generateClickerModel(module,fontBuffer,{...single,keys:[{type:'text',value}]});reference??=model;
  const label=/^[\p{L}\p{N}]$/u.test(value)?value:`u${value.codePointAt(0).toString(16)}`,prefix=`pebble-${String(index+1).padStart(2,'0')}-${label}`;
  for(const part of model.parts){const x=(index%columns)*(model.width+model.capWidth+18),y=Math.floor(index/columns)*(model.height+10);parts.push({...part,name:`${prefix}/${part.role==='base'?'base':'cap'}`,x:x-part.bounds.min[0]+(part.role==='cap'?model.width+7:0),y:y-part.bounds.min[1]});}
  onProgress(Math.round((index+1)/characters.length*90));
 });
 return {...reference,parts,batchCharacters:characters,batchCount:characters.length};
}
