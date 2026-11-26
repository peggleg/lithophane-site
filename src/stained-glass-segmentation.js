// Convert a sampled image to a small palette and connected, labelled regions.
// The caller is responsible for scaling/cropping the image to postcard ratio.
export function segmentStainedGlass(rgba,width,height,{colours=4,minRegion=6}={}){
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<2||height<2||rgba.length!==width*height*4||!Number.isInteger(colours)||colours<2||colours>8||!Number.isInteger(minRegion)||minRegion<1)throw Error('Invalid stained-glass image or settings.');
 const pixels=[];for(let i=0;i<width*height;i++){const a=rgba[i*4+3]/255;pixels.push([0,1,2].map(c=>Math.round(rgba[i*4+c]*a+255*(1-a))));}
 let boxes=[pixels.map((_,i)=>i)];
 while(boxes.length<colours){let best=-1,score=-1,axis=0;for(let j=0;j<boxes.length;j++){if(boxes[j].length<2)continue;for(let c=0;c<3;c++){let lo=255,hi=0;for(const i of boxes[j]){lo=Math.min(lo,pixels[i][c]);hi=Math.max(hi,pixels[i][c]);}const s=(hi-lo)*boxes[j].length;if(s>score){score=s;best=j;axis=c;}}}if(best<0||score===0)break;const box=boxes.splice(best,1)[0];box.sort((a,b)=>pixels[a][axis]-pixels[b][axis]||a-b);const m=Math.floor(box.length/2);boxes.push(box.slice(0,m),box.slice(m));}
 const palette=boxes.map(b=>[0,1,2].map(c=>Math.round(b.reduce((n,i)=>n+pixels[i][c],0)/b.length)));const labels=new Uint8Array(pixels.length);
 for(let i=0;i<pixels.length;i++){let best=Infinity;for(let k=0;k<palette.length;k++){const d=pixels[i].reduce((s,v,c)=>s+(v-palette[k][c])**2,0);if(d<best){best=d;labels[i]=k;}}}
 // Merge small connected islands into their most common adjacent colour.
 const seen=new Uint8Array(labels.length);for(let start=0;start<labels.length;start++){if(seen[start])continue;const target=labels[start],queue=[start],neighbours=new Map();seen[start]=1;for(let q=0;q<queue.length;q++){const i=queue[q],x=i%width,y=Math.floor(i/width);for(const n of [x?i-1:-1,x+1<width?i+1:-1,y?i-width:-1,y+1<height?i+width:-1]){if(n<0)continue;if(labels[n]===target){if(!seen[n]){seen[n]=1;queue.push(n);}}else neighbours.set(labels[n],(neighbours.get(labels[n])||0)+1);}}if(queue.length<minRegion&&neighbours.size){const replacement=[...neighbours].sort((a,b)=>b[1]-a[1]||a[0]-b[0])[0][0];for(const i of queue)labels[i]=replacement;}}
 return {width,height,palette,labels};
}
