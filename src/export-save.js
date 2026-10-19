export function exportFilename(name,panel,format){
 const base=String(name).replace(/\.(?:jpe?g|png|webp|stl|3mf|txt)$/i,'').normalize('NFKC').replace(/[<>:"/\\|?*\x00-\x1f]/g,'').trim().replace(/\s+/g,'-').replace(/[. ]+$/g,'').slice(0,100)||'My-lithophane';
 return `${base}-${panel.width}x${panel.height}x${panel.max}mm.${format}`;
}

// Invoke the picker from the export click, before worker/image awaits consume activation.
export async function chooseSaveTarget({name,panel,format,custom,picker,askName}){
 let filename=exportFilename(name,panel,format);
 if(!custom)return {filename,handle:null};
 if(picker){
  const handle=await picker({id:'lithophane-exports',startIn:'downloads',suggestedName:filename,types:[{description:format.toUpperCase()+' lithophane',accept:{'application/octet-stream':['.'+format]}}]});
  return {filename,handle};
 }
 const chosen=await askName(name);
 if(chosen===null)return null;
 return {filename:exportFilename(chosen,panel,format),handle:null};
}
