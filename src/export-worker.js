import {makePanel,stlBytes,threeMfBytes} from './geometry.js';
self.onmessage=({data})=>{
  try {
    self.postMessage({progress:15});
    const mesh=makePanel(data.panel);
    self.postMessage({progress:55});
    const bytes=data.format==='3mf'?threeMfBytes(mesh):stlBytes(mesh);
    self.postMessage({progress:100,bytes},[bytes.buffer]);
  }catch(error){self.postMessage({error:error.message});}
};
