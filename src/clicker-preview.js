import {clickerPalettes} from './clicker-settings.js';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
export function createClickerPreview(canvas){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.setClearColor('#e5ddcf');renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,5000);camera.up.set(0,0,1);const controls=new OrbitControls(camera,canvas);controls.enablePan=false;
 scene.add(new THREE.HemisphereLight('#ffffff','#80715d',2.8));const light=new THREE.DirectionalLight('#ffffff',3);light.position.set(-60,-100,180);scene.add(light);
 let group=new THREE.Group(),model=null,partsView=false,openTray=false,colours={base:'#526c4b',cap:'#f4eddb',mark:'#294832'},extent=100,frame=new THREE.Vector3(50,35,30),lastView=false,selected=0;scene.add(group);
 const render=()=>renderer.render(scene,camera);
 function clear(){for(const child of group.children){child.geometry.dispose();child.material.dispose();}scene.remove(group);group=new THREE.Group();scene.add(group);}
 function reset(view=false){lastView=view;group.rotation.set(0,0,0);const top=view===true||view==='top',bottom=view==='bottom',aspect=Math.max(camera.aspect,.2),tan=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
  const projectedWidth=top||bottom?frame.x:frame.x*.99+frame.y*.18,projectedHeight=top||bottom?frame.y:frame.y*.75+frame.z*.66+frame.x*.1,distance=Math.max(projectedWidth/aspect,projectedHeight)/(2*tan)*1.2;
  controls.target.set(0,0,0);camera.position.copy(new THREE.Vector3(top||bottom?0:.18,top||bottom?-.0001:-.65,bottom?-1:top?1:.74).normalize().multiplyScalar(distance));camera.lookAt(0,0,0);controls.update();render();}

 function paint(){clear();if(!model){render();return;}
  for(const part of model.parts){if(!partsView&&(part.role==='test'||openTray&&part.role!=='base'))continue;const indexed=new THREE.BufferGeometry();indexed.setAttribute('position',new THREE.BufferAttribute(part.mesh.vertices,3));indexed.setIndex(new THREE.BufferAttribute(part.mesh.faces,1));const geometry=indexed.toNonIndexed();indexed.dispose();geometry.computeVertexNormals();
   const palette=clickerPalettes[colours.palette],base=palette?.base||colours.base,trim=palette?.trim||colours.cap,cap=colours.keyColours?.[part.key]||palette?.caps[(part.key||0)%palette.caps.length]||colours.cap,ink=palette?.ink||colours.mark;
   const pos=geometry.getAttribute('position'),rgb=new Float32Array(pos.count*3),normal=new THREE.Color(['base','deck'].includes(part.role)?base:part.role==='test'?'#a49c8d':trim),accent=new THREE.Color(cap),mark=new THREE.Color(ink);
   for(let i=0;i<pos.count;i+=3){const raised=part.role==='cap'&&[0,1,2].some(k=>pos.getZ(i+k)>model.capTop+.01),face=part.role==='cap'&&[0,1,2].some(k=>pos.getZ(i+k)>model.capShoulderTop+.01);const c=raised?mark:face?accent:normal;for(let j=0;j<3;j++)rgb.set([c.r,c.g,c.b],(i+j)*3);}
   geometry.setAttribute('color',new THREE.BufferAttribute(rgb,3));const object=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8}));object.position.fromArray(partsView?[part.x||0,0,0]:part.assembly||[0,0,0]);object.userData.key=part.key;group.add(object);
  }
  if(!partsView&&!openTray)for(const [x,y]of model.positions){const block=new THREE.Mesh(new THREE.BoxGeometry(16,16,6),new THREE.MeshStandardMaterial({color:'#74889a',roughness:.8}));block.position.set(x,y,model.deckTop+3);group.add(block);}
  const box=new THREE.Box3().setFromObject(group),centre=box.getCenter(new THREE.Vector3());group.position.copy(centre.multiplyScalar(-1));box.getSize(frame);extent=Math.max(box.max.x-box.min.x,box.max.y-box.min.y,40)*1.15;reset();
 }
 controls.addEventListener('change',render);const observer=new ResizeObserver(()=>{const {width,height}=canvas.parentElement.getBoundingClientRect();renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();reset(lastView);});observer.observe(canvas.parentElement);
 canvas.addEventListener('keydown',event=>{if(event.key==='Home'){event.preventDefault();reset();}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();if(event.key==='ArrowLeft'||event.key==='ArrowRight')group.rotation.z+=event.key==='ArrowLeft'?-.12:.12;else group.rotation.x+=event.key==='ArrowUp'?-.12:.12;render();}});
 reset();return {setModel(value){model=value;paint();},setParts(value){partsView=value;paint();},setOpen(value){openTray=value;paint();},setColours(value){colours=value;paint();},select(value){selected=value;},reset,press(down){if(partsView||openTray)return;for(const child of group.children)if(child.userData.key===selected){child.position.z=(model?.deckTop||0)+(model?.capRest||4.5)-(down?(model?.pressTravel||4):0);}render();},dispose(){observer.disconnect();controls.dispose();clear();renderer.dispose();}};
}
