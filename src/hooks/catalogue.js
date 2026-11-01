import * as pets from './categories/pets.js';
import * as woodland from './categories/woodland.js';
export const hookCategories=[pets,woodland];
export const hookDesigns=hookCategories.flatMap(module=>module.category.designs.map(([id,name])=>({id,name,category:module.category.id,draw:A=>{const art=module.draw(id,A);return{...art,scheme:art.scheme||module.palettes?.[module.category.designs.findIndex(([key])=>key===id)]};}})));
export const hookById=id=>hookDesigns.find(d=>d.id===id);
