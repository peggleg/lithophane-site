import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

export function cylinderPreview(canvas){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setClearColor('#e5ddcf');renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,5000),controls=new OrbitControls(camera,canvas);camera.up.set(0,0,1);controls.enablePan=false;
 scene.add(new THREE.HemisphereLight('#ffffff','#8b7760',2));const light=new THREE.DirectionalLight('#ffffff',3);light.position.set(-150,-200,300);scene.add(light);
 let group=new THREE.Group(),model=null,parts=false,lit=true;scene.add(group);
 const render=()=>renderer.render(scene,camera);
 function fit(){const box=new THREE.Box3().setFromObject(group);if(box.isEmpty()){render();return;}const size=box.getSize(new THREE.Vector3()),centre=box.getCenter(new THREE.Vector3());group.position.sub(centre);const d=Math.max(size.x/camera.aspect,size.y,size.z)*2.3;controls.target.set(0,0,0);camera.position.set(d*.8,-d,d*.65);camera.lookAt(0,0,0);controls.update();render();}
 function paint(){
  renderer.setClearColor(lit?'#302c29':'#e5ddcf');
  for(const child of group.children){child.geometry?.dispose();child.material?.dispose();}scene.remove(group);group=new THREE.Group();scene.add(group);if(!model){render();return;}
  let offset=0;
  for(const part of model.parts){
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(part.mesh.vertices,3));g.setIndex(new THREE.BufferAttribute(part.mesh.faces,1));g.computeVertexNormals();
   let material;
   if(part.role==='cylinder'&&lit){
    const v=part.mesh.vertices,colours=new Float32Array(v.length),count=v.length/6,p=model.settings;
    for(let i=0;i<v.length/3;i++){
     const radius=Math.hypot(v[i*3],v[i*3+1]),z=v[i*3+2],tone=i>=count?.65:Math.max(0,Math.min(1,(p.max-(radius-42))/(p.max-p.min||1)));
     const b=z<3||z>p.height-1?.7:.23+.77*tone**.65;colours.set([b,b*.79,b*.49],i*3);
    }
    g.setAttribute('color',new THREE.BufferAttribute(colours,3));material=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide});
   }else material=new THREE.MeshStandardMaterial({color:part.colour||'#e9dfcc',roughness:.86,side:THREE.DoubleSide});
   const mesh=new THREE.Mesh(g,material);
   if(parts){mesh.position.set(offset-part.bounds.min[0],-part.bounds.min[1],0);offset+=part.printSize[0]+15;}
   else {mesh.position.fromArray(part.assembly);mesh.rotation.set(...part.rotation,part.rotationOrder||'XYZ');}
   group.add(mesh);
  }
  if(!parts&&model.seatZ){
   const tealight=new THREE.Mesh(new THREE.CylinderGeometry(19,19,19,48).rotateX(Math.PI/2),new THREE.MeshStandardMaterial({color:'#fff7e5'}));tealight.position.z=model.seatZ-3+9.5;group.add(tealight);
   const flame=new THREE.Mesh(new THREE.SphereGeometry(3,16,12).scale(1,1,2),new THREE.MeshBasicMaterial({color:lit?'#ffdb83':'#fff4dc'}));flame.position.z=model.seatZ+21;group.add(flame);
  }
  fit();
 }
 controls.addEventListener('change',render);
 const observer=new ResizeObserver(()=>{const {width,height}=canvas.parentElement.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();fit();});observer.observe(canvas.parentElement);
 canvas.addEventListener('keydown',e=>{if(e.key==='Home'){e.preventDefault();group.rotation.set(0,0,0);fit();}else if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();group.rotation.z+=e.key==='ArrowLeft'?-.15:.15;render();}});
 return {setModel(value){model=value;paint();},setLit(value){lit=value;paint();},setParts(value){parts=value;paint();},reset(){group.rotation.set(0,0,0);fit();},dispose(){observer.disconnect();controls.dispose();for(const c of group.children){c.geometry?.dispose();c.material?.dispose();}renderer.dispose();}};
}
