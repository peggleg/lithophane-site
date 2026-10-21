import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
export function createTextPreview(canvas){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setClearColor('#e5ddcf');renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,5000);camera.up.set(0,0,1);
 const controls=new OrbitControls(camera,canvas);controls.enableDamping=false;controls.enablePan=false;controls.minDistance=15;controls.maxDistance=1000;
 scene.add(new THREE.HemisphereLight('#ffffff','#80715d',2.6));const light=new THREE.DirectionalLight('#ffffff',3);light.position.set(-80,-100,200);scene.add(light);const fill=new THREE.DirectionalLight('#fff2d6',1.3);fill.position.set(100,80,80);scene.add(fill);
 let group=new THREE.Group(),model=null,showParts=false,colours={base:'#77916c',text:'#f4eddb'},extent=160;scene.add(group);
 const render=()=>renderer.render(scene,camera);controls.addEventListener('change',render);
 function disposeGroup(){for(const child of group.children){child.geometry.dispose();child.material.dispose();}scene.remove(group);group=new THREE.Group();scene.add(group);}
 function reset(top=false){group.rotation.set(0,0,0);controls.target.set(0,0,0);camera.position.set(top?0:extent*.2,top?-.001:-extent*.95,top?extent*2:extent*1.35);camera.lookAt(0,0,0);controls.update();render();}
 function paint(){
  if(!model)return;disposeGroup();extent=Math.max(model.width,model.height)*1.15;
  for(const [i,part]of model.parts.entries()){
   if(i>0&&!showParts)continue;
   const indexed=new THREE.BufferGeometry();indexed.setAttribute('position',new THREE.BufferAttribute(part.mesh.vertices,3));indexed.setIndex(new THREE.BufferAttribute(part.mesh.faces,1));const geometry=indexed.toNonIndexed();indexed.dispose();geometry.computeVertexNormals();
   const positions=geometry.getAttribute('position'),rgb=new Float32Array(positions.count*3),base=new THREE.Color(i>0?'#a49c8d':colours.base),text=new THREE.Color(colours.text),s=model.settings;
   for(let j=0;j<positions.count;j+=3){const zs=[0,1,2].map(k=>positions.getZ(j+k));const lettering=i===0&&(s.mode==='raised'?zs.some(z=>z>s.base+.001):zs.every(z=>Math.abs(z-(s.base-s.relief))<.001));const c=lettering?text:base;for(let k=0;k<3;k++)rgb.set([c.r,c.g,c.b],(j+k)*3);}
   geometry.setAttribute('color',new THREE.BufferAttribute(rgb,3));const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.75,metalness:0}));mesh.position.x=showParts?part.x||0:0;group.add(mesh);
  }
  if(showParts){const box=new THREE.Box3().setFromObject(group),centre=box.getCenter(new THREE.Vector3());group.position.copy(centre.multiplyScalar(-1));extent=Math.max(box.max.x-box.min.x,box.max.y-box.min.y)*1.1;}
  reset();
 }
 const observer=new ResizeObserver(()=>{const {width,height}=canvas.parentElement.getBoundingClientRect();renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();render();});observer.observe(canvas.parentElement);
 canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();if(e.key==='Home')reset();else if(e.key==='ArrowLeft'||e.key==='ArrowRight')group.rotation.z+=(e.key==='ArrowLeft'?-1:1)*.12;else group.rotation.x+=(e.key==='ArrowUp'?-1:1)*.12;render();});reset();
 return {setModel(value){model=value;if(!value){disposeGroup();render();}else paint();},setColours(value){colours=value;paint();},setParts(value){showParts=value;paint();},reset,dispose(){observer.disconnect();controls.dispose();disposeGroup();renderer.dispose();}};
}
