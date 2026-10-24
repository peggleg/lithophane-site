import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {deskPalettes} from './desk-settings.js';
export function createDeskPreview(canvas){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setClearColor('#e5ddcf');renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,5000),controls=new OrbitControls(camera,canvas);camera.up.set(0,0,1);controls.enablePan=false;
 scene.add(new THREE.HemisphereLight('#ffffff','#9b8872',2.5));const light=new THREE.DirectionalLight('#ffffff',3);light.position.set(-100,-150,230);scene.add(light);
 let group=new THREE.Group(),model=null,parts=false,open=false,lidOpen=false,view='angle';scene.add(group);
 const render=()=>renderer.render(scene,camera);
 function fit(){const box=new THREE.Box3().setFromObject(group);if(box.isEmpty())return;const size=box.getSize(new THREE.Vector3()),centre=box.getCenter(new THREE.Vector3());group.position.sub(centre);const distance=Math.max(size.x/Math.max(camera.aspect,.2),size.y,size.z)*2.6;controls.target.set(0,0,0);camera.position.copy(new THREE.Vector3(['top','bottom'].includes(view)?0:.85,['top','bottom'].includes(view)?-.0001:-1.4,view==='bottom'?-1:1).normalize().multiplyScalar(distance));camera.lookAt(0,0,0);controls.update();render();}
 function paint(){for(const child of group.children){child.geometry.dispose();child.material.dispose();}scene.remove(group);group=new THREE.Group();scene.add(group);if(!model){render();return;}
  const palette=deskPalettes[model.settings.palette];for(const part of model.parts){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(part.mesh.vertices,3));g.setIndex(new THREE.BufferAttribute(part.mesh.faces,1));const geometry=g.toNonIndexed();g.dispose();geometry.computeVertexNormals();const object=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:['drawer','inner-box','lid','screw-lid'].includes(part.role)?palette.detail:palette.body,roughness:.85}));
   if(parts)object.position.set(part.x,part.y||0,0);else{object.position.fromArray(part.assembly);object.rotation.set(...part.rotation);if(lidOpen&&part.role==='screw-lid')object.position.z+=20;if(lidOpen&&part.role==='lid'){const angle=Math.PI/3,pivot=part.pivot[2];object.rotation.x=angle;object.position.y+=pivot*Math.sin(angle);object.position.z+=pivot*(1-Math.cos(angle));}if(open&&part.role==='drawer')object.position.y-=model.depth*.4;}
   group.add(object);
  }fit();
 }
 controls.addEventListener('change',render);const observer=new ResizeObserver(()=>{const r=canvas.parentElement.getBoundingClientRect();if(r.width<=0||r.height<=0)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();fit();});observer.observe(canvas.parentElement);
 canvas.addEventListener('keydown',event=>{if(event.key==='Home'){event.preventDefault();view='angle';fit();}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();if(event.key==='ArrowLeft'||event.key==='ArrowRight')group.rotation.z+=event.key==='ArrowLeft'?-.12:.12;else group.rotation.x+=event.key==='ArrowUp'?-.12:.12;render();}});
 return {setModel(value){model=value;paint();},setParts(value){parts=value;paint();},setLidOpen(value){lidOpen=value;paint();},setOpen(value){open=value;paint();},setPalette(value){if(model){model.settings.palette=value;paint();}},reset(value='angle'){view=value;group.rotation.set(0,0,0);fit();},dispose(){observer.disconnect();controls.dispose();for(const c of group.children){c.geometry.dispose();c.material.dispose();}renderer.dispose();}};
}
