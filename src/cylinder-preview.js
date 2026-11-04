import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {toCreasedNormals} from 'three/addons/utils/BufferGeometryUtils.js';
import {HorizontalBlurShader} from 'three/addons/shaders/HorizontalBlurShader.js';
import {VerticalBlurShader} from 'three/addons/shaders/VerticalBlurShader.js';

export function cylinderPreview(canvas,{thumbnail=false}={}){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=.9;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,5000);
 camera.up.set(0,0,1);
 const controls=new OrbitControls(camera,canvas);controls.enablePan=false;
 const environment=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer),environmentTarget=pmrem.fromScene(environment,.04);
 scene.environment=environmentTarget.texture;scene.environmentIntensity=.35;
 environment.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight('#ffffff','#c8bca8',.5));
 const key=new THREE.DirectionalLight('#fff4e6',1.8);key.position.set(-160,-200,260);
 scene.add(key);
 const fill=new THREE.DirectionalLight('#dce6ff',.6);fill.position.set(180,-70,140);scene.add(fill);
 const rim=new THREE.DirectionalLight('#ffffff',.8);rim.position.set(40,160,220);scene.add(rim);
 const contactTarget=new THREE.WebGLRenderTarget(512,512),blurTarget=new THREE.WebGLRenderTarget(512,512);
 const contactCamera=new THREE.OrthographicCamera(-100,100,100,-100,.1,200);
 const contactMaterial=new THREE.ShaderMaterial({
  vertexShader:'void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'void main(){float a=pow(1.0-gl_FragCoord.z,4.0)*0.32;gl_FragColor=vec4(0.0,0.0,0.0,a);}',
  side:THREE.DoubleSide,
 });
 const horizontal=new THREE.ShaderMaterial(HorizontalBlurShader),vertical=new THREE.ShaderMaterial(VerticalBlurShader);
 const blurScene=new THREE.Scene(),blurCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1),quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),horizontal);blurScene.add(quad);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:contactTarget.texture,transparent:true,depthWrite:false,side:THREE.DoubleSide}));scene.add(ground);
 let group=new THREE.Group(),model=null,parts=false,standOnly=thumbnail,lit=!thumbnail;scene.add(group);
 const render=()=>renderer.render(scene,camera);
 function contactShadow(){
  if(!ground.visible)return;
  const colour=renderer.getClearColor(new THREE.Color()),alpha=renderer.getClearAlpha(),target=renderer.getRenderTarget();
  ground.visible=false;scene.overrideMaterial=contactMaterial;
  renderer.setClearColor('#000000',0);renderer.setRenderTarget(contactTarget);renderer.clear();renderer.render(scene,contactCamera);
  scene.overrideMaterial=null;
  for(const radius of [3,2]){
   quad.material=horizontal;horizontal.uniforms.tDiffuse.value=contactTarget.texture;horizontal.uniforms.h.value=radius/512;
   renderer.setRenderTarget(blurTarget);renderer.clear();renderer.render(blurScene,blurCamera);
   quad.material=vertical;vertical.uniforms.tDiffuse.value=blurTarget.texture;vertical.uniforms.v.value=radius/512;
   renderer.setRenderTarget(contactTarget);renderer.clear();renderer.render(blurScene,blurCamera);
  }
  renderer.setRenderTarget(target);renderer.setClearColor(colour,alpha);ground.visible=true;
 }
 function fit(){
  const box=new THREE.Box3().setFromObject(group);
  if(box.isEmpty()){ground.visible=false;render();return;}
  const size=box.getSize(new THREE.Vector3()),centre=box.getCenter(new THREE.Vector3());
  group.position.sub(centre);ground.visible=true;ground.position.z=-size.z/2-.15;
  const contactExtent=Math.max(size.x,size.y)/2+16;
  ground.scale.set(-contactExtent*2,contactExtent*2,1);
  Object.assign(contactCamera,{left:-contactExtent,right:contactExtent,top:contactExtent,bottom:-contactExtent,far:Math.max(120,size.z+20)});
  contactCamera.position.set(0,0,ground.position.z-.1);contactCamera.lookAt(0,0,ground.position.z+1);contactCamera.updateProjectionMatrix();
  const direction=new THREE.Vector3(.8,-1.2,standOnly?.95:.72).normalize();
  const right=new THREE.Vector3(0,0,1).cross(direction).normalize(),up=direction.clone().cross(right).normalize();
  group.updateMatrixWorld(true);
  let halfWidth=0,halfHeight=0,depth=0;const point=new THREE.Vector3();
  for(const child of group.children){
   const positions=child.geometry?.attributes.position;if(!positions)continue;
   for(let i=0;i<positions.count;i++){
    point.fromBufferAttribute(positions,i).applyMatrix4(child.matrixWorld);
    halfWidth=Math.max(halfWidth,Math.abs(point.dot(right)));halfHeight=Math.max(halfHeight,Math.abs(point.dot(up)));depth=Math.max(depth,Math.abs(point.dot(direction)));
   }
  }
  const tan=Math.tan(camera.fov*Math.PI/360),distance=Math.max(halfWidth/(tan*camera.aspect),halfHeight/tan)*(thumbnail?1.16:1.12)+depth;
  controls.target.set(0,0,0);camera.position.copy(direction.multiplyScalar(distance));camera.lookAt(0,0,0);controls.update();contactShadow();render();
 }
 function clear(){for(const child of group.children){child.geometry?.dispose();child.material?.dispose();}scene.remove(group);group=new THREE.Group();scene.add(group);}
 function paint(){
  renderer.setClearColor(lit&&!standOnly&&!parts?'#302c29':'#f2eee7');
  clear();canvas.dataset.view=parts?(standOnly?'stand-parts':'parts'):standOnly?'stand':'assembly';
  if(!model){canvas.dataset.visibleParts='0';fit();return;}
  let offset=0,count=0;
  for(const part of model.parts){
   if(standOnly&&part.role==='cylinder')continue;
   const source=new THREE.BufferGeometry();source.setAttribute('position',new THREE.BufferAttribute(part.mesh.vertices,3));source.setIndex(new THREE.BufferAttribute(part.mesh.faces,1));
   let geometry,material;
   if(part.role==='cylinder'){
    geometry=source;geometry.computeVertexNormals();
    if(lit){
     const v=part.mesh.vertices,colours=new Float32Array(v.length),outerCount=v.length/6,p=model.settings;
     for(let i=0;i<v.length/3;i++){
      const radius=Math.hypot(v[i*3],v[i*3+1]),z=v[i*3+2],inside=i>=outerCount,tone=Math.max(0,Math.min(1,(p.max-(radius-42))/(p.max-p.min||1)));
      const b=inside?.12+.45*(1-z/p.height)+.05*(1+Math.sin(Math.atan2(v[i*3+1],v[i*3]))):z<3||z>p.height-1?.7:.23+.77*tone**.65;
      colours.set([b,b*.79,b*.49],i*3);
     }
     geometry.setAttribute('color',new THREE.BufferAttribute(colours,3));material=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,toneMapped:false});
    }else material=new THREE.MeshStandardMaterial({color:'#f5eddf',roughness:.65});
   }else{
    // Smooth curved surfaces while preserving real corners on the deck and legs.
    geometry=toCreasedNormals(source,Math.PI/3);source.dispose();
    material=new THREE.MeshStandardMaterial({color:part.colour||'#e9dfcc',roughness:.5,metalness:0});
   }
   const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=false;
   if(parts){mesh.position.set(offset-part.bounds.min[0],-part.bounds.min[1],0);offset+=part.printSize[0]+15;}
   else{mesh.position.fromArray(part.assembly);mesh.rotation.set(...part.rotation,part.rotationOrder||'XYZ');}
   group.add(mesh);count++;
  }
  canvas.dataset.visibleParts=String(count);
  if(!parts&&!standOnly&&model.seatZ){
   const tealight=new THREE.Mesh(new THREE.CylinderGeometry(19,19,19,48).rotateX(Math.PI/2),new THREE.MeshStandardMaterial({color:'#fff7e5',roughness:.6}));tealight.position.z=model.seatZ-3+9.5;tealight.castShadow=true;group.add(tealight);
   const flame=new THREE.Mesh(new THREE.SphereGeometry(3,16,12).scale(1,1,2),new THREE.MeshBasicMaterial({color:lit?'#ffdb83':'#fff4dc'}));flame.position.z=model.seatZ+21;group.add(flame);
  }
  fit();
 }
 controls.addEventListener('change',render);
 const observer=new ResizeObserver(()=>{const {width,height}=canvas.parentElement.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();fit();});observer.observe(canvas.parentElement);
 canvas.addEventListener('keydown',e=>{if(e.key==='Home'){e.preventDefault();group.rotation.set(0,0,0);fit();}else if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();group.rotation.z+=e.key==='ArrowLeft'?-.15:.15;contactShadow();render();}});
 return {
  setModel(value){model=value;paint();},setLit(value){if(lit!==value){lit=value;paint();}},setParts(value){if(parts!==value){parts=value;paint();}},
  setStandOnly(value){if(standOnly!==value){standOnly=value;paint();}},reset(){group.rotation.set(0,0,0);fit();},
  dispose(){observer.disconnect();controls.dispose();clear();ground.geometry.dispose();ground.material.dispose();environmentTarget.dispose();contactTarget.dispose();blurTarget.dispose();contactMaterial.dispose();horizontal.dispose();vertical.dispose();quad.geometry.dispose();renderer.dispose();},
 };
}
