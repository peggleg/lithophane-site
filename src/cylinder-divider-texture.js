// Comic panels already carry dividers. Remove only the uniform outer gutter,
// then join the artwork with a two-sample blend rather than a second broad bar.
// The original asset stays intact; previews, downloads and mesh use this raster.
export function dividerTones(source,width,height,brightness=0){
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<8||height<2||source.length!==width*height||!Number.isFinite(brightness))throw Error('Invalid cylinder panorama.');
 const darkColumn=x=>{for(let y=0;y<height;y++)if(source[y*width+x]>60)return false;return true;};
 const limit=Math.floor(width*.04);let left=0,right=width-1;
 while(left<limit&&darkColumn(left))left++;
 while(right>=width-limit&&darkColumn(right))right--;
 const span=right-left,band=2,period=span-band,out=new Uint8Array(source.length);
 for(let y=0;y<height;y++){
  const sample=x=>{const a=Math.floor(x),t=x-a;return source[y*width+a]*(1-t)+source[y*width+Math.min(width-1,a+1)]*t;};
  for(let x=0;x<width;x++){
   const at=(x/(width-1)*period+band/2)%period,u=Math.min(1,at/band),blend=u*u*(3-2*u);
   const tone=at<band?sample(left+period+at)*(1-blend)+sample(left+at)*blend:sample(left+at);
   out[y*width+x]=Math.round(Math.max(0,Math.min(255,tone+brightness*2.55)));
  }
 }
 return out;
}
