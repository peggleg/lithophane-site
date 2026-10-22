import {filamentParts,gramsText,filamentAssumptions} from './filament.js';
export function createFilamentDisplay(anchor,id='filament-estimate'){
 const section=document.createElement('div');section.className='caption';section.id=id;section.setAttribute('aria-live','polite');anchor.after(section);
 function clear(){section.textContent='Estimated filament: —';}
 function weights(items){section.replaceChildren();const title=document.createElement('strong');title.textContent=`Estimated filament: ${gramsText(items.reduce((n,p)=>n+p.grams,0))} total`;const note=document.createElement('p');note.textContent=filamentAssumptions;section.append(title,note);if(items.length>1){const details=document.createElement('details'),summary=document.createElement('summary'),list=document.createElement('ul');summary.textContent=`Filament by part (${items.length})`;for(const p of items){const li=document.createElement('li');li.textContent=`${p.name}: ${gramsText(p.grams)}`;list.append(li);}details.append(summary,list);section.append(details);}}
 clear();return {clear,weights,update:parts=>weights(filamentParts(parts))};
}
