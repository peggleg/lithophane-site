import * as pets from './categories/pets.js';
import * as woodland from './categories/woodland.js';
import * as ocean from './categories/ocean.js';
export const hookCategories=[pets,woodland,ocean];
export const hookDesigns=hookCategories.flatMap(module=>module.category.designs.map(([id,name],index)=>({id,name,category:module.category.id,colours:module.designColours?.[index]||module.category.colours,draw:A=>{const art=module.draw(id,A);return{...art,faceStyle:art.faceStyle||module.category.faceStyle,scheme:art.scheme||module.palettes?.[index]};}})));
export const hookById=id=>hookDesigns.find(d=>d.id===id);
