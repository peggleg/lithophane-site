import {printerKey,printLimit,printerSpec} from './printer-settings.js';
export const releasedOrnamentCollections=['christmas','pets','birthday'];
export const ornamentCollections={
 christmas:{name:'Christmas',nameExample:'Lucas',wording:[['Merry','Christmas'],['Merry','Xmas'],['Let It','Snow'],['Joy to','the World']],designs:[['bells','Bells & pine'],['bow','Bow & holly'],['forest','Winter forest'],['poinsettia','Poinsettia wreath'],['reindeer','Reindeer & stars'],['snowflake','Snowflake branches']]},
 pets:{name:'Pets',nameExample:'Buddy',wording:[['Pawsome',''],['Best','Friend'],['Cat','Lover'],['Forever','Loved']],designs:[['dog','Dog & leaves'],['bone','Bone & paw prints'],['cat','Cat & moon'],['memorial','Memorial heart']]},
 birthday:{name:'Happy Birthday',nameExample:'Sophie',wording:[['Happy','Birthday'],['Make','a Wish'],['Birthday','Wishes'],['Celebrate','Today']],designs:[['cake','Birthday cake'],['balloons','Balloons & ribbons'],['present','Birthday present'],['crown','Birthday crown'],['badge','Birthday star'],['confetti','Celebration wreath']]},
 baby:{name:'New Baby',nameExample:'Oliver',wording:[['Hello','World'],['Welcome','Little One'],['Oh','Baby'],['Sweet','Dreams']],designs:[['moon','Moon & clouds'],['teddy','Teddy & leaves'],['feet','Tiny footprints'],['stork','Stork & clouds']]},
 wedding:{name:'Weddings & Anniversaries',nameExample:'Emma & Jack',wording:[['Just','Married'],['Mr &','Mrs'],['Happy','Anniversary'],['Forever','Together']],designs:[['rings','Rings & roses'],['hearts','Linked hearts'],['roses','Anniversary flowers'],['wedding-bells','Wedding bells']]},
 easter:{name:'Easter',nameExample:'Lily',wording:[['Happy','Easter'],['Hello','Spring'],['Easter','Wishes'],['Some Bunny','Loves You']],designs:[['bunny','Bunny & tulips'],['eggs','Decorated eggs'],['chick','Chick & flowers'],['butterfly','Butterfly & blossom']]},
 halloween:{name:'Halloween',nameExample:'Oscar',wording:[['Happy','Halloween'],['Trick or','Treat'],['Boo',''],['Stay','Spooky']],designs:[['pumpkin','Pumpkin & vines'],['ghost','Friendly ghost'],['bat','Bat & crescent'],['house','Haunted cottage']]}
};
export const ornamentDefaults={kind:'ornament',printer:'a1-mini',collection:'christmas',design:'bells',diameter:100,thickness:3,line1:'Lucas',line2:'',wording:'name',ams:false,inlayLayers:3,frameColour:'#eee2c9',textColour:'#8a3b2b',palette:'ivory'};
export const ornamentDiameterLimit=p=>Math.min(246,p.ams?printerSpec(p).bed-60:printLimit(p)-10);
export function validateOrnament(input={}){
 const p={...ornamentDefaults,...input};p.printer=printerKey(p);
 if(!releasedOrnamentCollections.includes(p.collection))throw Error('Choose an available ornament collection.');
 if(!ornamentCollections[p.collection].designs.some(([id])=>id===p.design))throw Error('Choose a design in this collection.');
 if(!Number.isFinite(p.diameter)||p.diameter<80||p.diameter>ornamentDiameterLimit(p))throw Error(`Ornament diameter: choose 80–${ornamentDiameterLimit(p)} mm, leaving room for ${p.ams?'the AMS purge tower and hanging eyelet':'the hanging eyelet'}.`);
 if(!Number.isFinite(p.thickness)||p.thickness<2.4||p.thickness>5||Math.abs(p.thickness/.2-Math.round(p.thickness/.2))>.001)throw Error('Thickness: choose 2.4–5 mm in 0.2 mm steps.');
 for(const k of ['line1','line2']){if(typeof p[k]!=='string'||p[k].includes('\n')||p[k].includes('\r')||[...p[k]].length>24)throw Error('Use at most two lines, with up to 24 characters per line.');p[k]=p[k].trim();}
 if(!p.line1)throw Error('Enter a name or standard wording on the first line.');
 if(typeof p.ams!=='boolean'||![2,3].includes(p.inlayLayers))throw Error('Choose single colour or AMS with two or three inlay layers.');
 for(const key of ['frameColour','textColour'])if(!/^#[0-9a-f]{6}$/i.test(p[key]))throw Error('Choose valid filament colours.');
 return p;
}
