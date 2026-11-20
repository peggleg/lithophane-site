// Narrow overlap for new panoramas whose edges were composed to meet.
// Existing catalogue entries retain their original processing.
export function narrowPeriodicTones(source,width,height,brightness=0){
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<8||height<2||source.length!==width*height||!Number.isFinite(brightness))throw Error('Invalid cylinder panorama.');
 const out=new Uint8Array(source.length),band=Math.max(3,Math.round(width*.025)),period=width-band;
 for(let y=0;y<height;y++){
  const start=y*width;
  const sample=x=>{const a=Math.floor(x),t=x-a;return source[start+a]*(1-t)+source[start+Math.min(width-1,a+1)]*t;};
  for(let x=0;x<width;x++){
   const at=(x/(width-1)*period+band/2)%period,u=Math.min(1,at/band),blend=u*u*(3-2*u);
   const tone=at<band?sample(period+at)*(1-blend)+sample(at)*blend:sample(at);
   out[start+x]=Math.round(Math.max(0,Math.min(255,tone+brightness*2.55)));
  }
 }
 return out;
}
