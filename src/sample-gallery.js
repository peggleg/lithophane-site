import {seasonalDesigns} from './postcards.js';

const descriptions={
 Christmas:'Snowy villages, woodland moments and festive traditions.',
 Easter:'Spring flowers, decorated eggs and garden visitors.',
 Halloween:'Moonlit cottages, glowing pumpkins and a little midnight magic.',
 'Valentine’s Day':'Lovebirds, roses and quiet moments together.',
 'New Year 2027':'Midnight wishes, sparkling celebrations and a bright start to 2027.',
 'Mother’s Day':'Flowers, garden moments and a little love for Mum.',
 'Father’s Day':'Woodland adventures, favourite pastimes and moments with Dad.',
 Thanksgiving:'Autumn harvests, welcoming homes and time to give thanks.'
};
export function sampleCollections(designs=seasonalDesigns){
 const names=[...new Set(designs.map(d=>d.season))];
 names.sort((a,b)=>a==='Christmas'?-1:b==='Christmas'?1:0);
 return names.map(name=>({name,description:descriptions[name]||`Explore the ${name} collection.`,designs:designs.filter(d=>d.season===name)}));
}
export const sampleOrientation=design=>design.orientation||'portrait';
export function collectionSamples(collection,orientation='all'){
 return collection.designs.filter(d=>orientation==='all'||sampleOrientation(d)===orientation);
}
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountSampleGallery(root,{drawArtwork,onUse,collections=sampleCollections()}){
 let active=collections[0],orientation='all';
 root.innerHTML=`<div class="holiday-buttons" role="group" aria-label="Choose a holiday">${collections.map((c,i)=>`<button type="button" data-holiday="${i}" aria-pressed="${i===0}" aria-controls="holiday-gallery">${escape(c.name)}</button>`).join('')}</div><label class="holiday-mobile">Choose a holiday<select id="holiday-select" aria-controls="holiday-gallery">${collections.map((c,i)=>`<option value="${i}">${escape(c.name)}</option>`).join('')}</select></label><div class="collection-heading"><div><h3 id="holiday-heading"></h3><p id="holiday-description"></p></div><p id="holiday-count" role="status" aria-live="polite" aria-atomic="true"></p></div><div class="sample-filters" role="group" aria-label="Sample orientation" hidden>${['all','portrait','landscape'].map(v=>`<button type="button" data-filter="${v}" aria-pressed="${v==='all'}" aria-controls="holiday-gallery">${v[0].toUpperCase()+v.slice(1)}</button>`).join('')}</div><div id="holiday-gallery" class="seasonal-grid" role="region" aria-labelledby="holiday-heading"></div>`;
 const find=s=>root.querySelector(s);
 function render(){
  const designs=collectionSamples(active,orientation);
  find('#holiday-heading').textContent=active.name;
  find('#holiday-description').textContent=active.description;
  find('#holiday-count').textContent=`${active.name} · ${designs.length} ${designs.length===1?'sample':'samples'}`;
  find('.sample-filters').hidden=!active.designs.some(d=>sampleOrientation(d)==='landscape');
  root.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===orientation)));
  find('#holiday-gallery').innerHTML=designs.map(d=>`<article class="seasonal-card"><div class="seasonal-art"><canvas data-seasonal-preview="${escape(d.id)}" role="img" aria-label="${escape(d.description)}"></canvas></div><span class="tag">${escape(active.name.toUpperCase())} · ${sampleOrientation(d)==='landscape'?'148 × 105':'105 × 148'} × 3 MM MAX</span><h3>${escape(d.name)}</h3><p>${escape(d.description)}</p><button type="button" data-seasonal="${escape(d.id)}">Use ${escape(d.name)} ↗</button></article>`).join('')||'<p>No samples in this orientation yet.</p>';
  root.querySelectorAll('[data-seasonal-preview]').forEach(canvas=>{
   drawArtwork(canvas,canvas.dataset.seasonalPreview).then(()=>{canvas.dataset.ready='true';}).catch(()=>{
    if(!canvas.isConnected)return;
    const message=document.createElement('p');message.textContent='Artwork preview unavailable. Please reload to retry.';canvas.parentElement.replaceChildren(message);
   });
  });
 }
 function select(index){
  active=collections[index];orientation='all';find('#holiday-select').value=String(index);
  root.querySelectorAll('[data-holiday]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.holiday)===index)));
  render();
 }
 root.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button||!root.contains(button))return;
  if(button.dataset.holiday!==undefined)select(Number(button.dataset.holiday));
  else if(button.dataset.filter){orientation=button.dataset.filter;render();}
  else if(button.dataset.seasonal)onUse(button);
 });
 find('#holiday-select').addEventListener('change',event=>select(Number(event.target.value)));
 render();
}
