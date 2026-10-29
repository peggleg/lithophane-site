export function syncCupboardControls(p){
 const $=id=>document.getElementById(id);if(!$('cupboard-settings'))return;
 $('cupboard-settings').hidden=p.kind!=='cupboard';$('drawer-connectors-field').hidden=p.kind!=='drawers';
 for(const id of ['cupboardRows','cupboardColumns','hingeSide','cupboardFloor','cupboardTop','cupboardPorts','drawerConnectors'])$(id).value=p[id];
 $('cupboardHingeTest').checked=!!p.cupboardHingeTest;$('doorMagnets').checked=p.doorMagnets;$('hinge-side-field').hidden=false;
 if(p.kind==='cupboard'){p.openworkFaces='front';$('openworkFaces').value='front';$('height-label').textContent='Height of each module (mm)';$('height').min='80';$('wall').min='2.4';$('compartments').hidden=true;$('open-label').hidden=false;$('open-label').lastChild.textContent=' Open doors · about 110°';$('openworkFaces').disabled=true;}
 else{$('open-label').lastChild.textContent=' Pull drawers open';$('openworkFaces').disabled=false;}
}
export function wireCupboardControls(getState,sync,generate){
 const $=id=>document.getElementById(id);if(!$('cupboard-settings'))return;
 for(const id of ['cupboardRows','cupboardColumns','hingeSide','cupboardFloor','cupboardTop','cupboardPorts','drawerConnectors'])$(id).oninput=()=>{getState()[id]=['cupboardRows','cupboardColumns'].includes(id)?Number($(id).value):$(id).value;sync();generate();};
 $('cupboardHingeTest').oninput=()=>{getState().cupboardHingeTest=$('cupboardHingeTest').checked;sync();generate();};
 $('doorMagnets').oninput=()=>{getState().doorMagnets=$('doorMagnets').checked;generate();};
}
