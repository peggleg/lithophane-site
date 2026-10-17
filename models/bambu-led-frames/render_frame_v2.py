from pathlib import Path
import bpy
from mathutils import Vector
ROOT=Path(__file__).resolve().parent;OUT=ROOT/'frame-v2'
# Reuse the existing material setup and artwork mapping only.
setup=(ROOT/'render_postcard.py').read_text(encoding='utf-8-sig').split("for name,mat in [('PostcardBase'")[0]
exec(compile(setup,str(ROOT/'render_postcard.py'),'exec'))
V2=ROOT/'frame-v2';OLD=ROOT/'exports'
def model(path,mat):
 bpy.ops.wm.stl_import(filepath=str(path));o=bpy.context.object;o.data.materials.clear();o.data.materials.append(mat);o.scale=(.01,)*3;return o
for name,mat in [('PostcardBase',frame),('PostcardHolder',frame),('Reference_LED_59x8_Postcard',led),('Reference_Postcard_Panel',photo)]:model(OLD/'preview_parts'/(name+'.stl'),mat)
model(V2/'FrameV2_preview.stl',frame);rail=model(V2/'RailV2_preview.stl',frame)
bpy.ops.mesh.primitive_plane_add(size=100,location=(0,0,-.01));bpy.context.object.data.materials.append(ground)
bpy.ops.object.camera_add();camera=bpy.context.object;camera.data.type='ORTHO';bpy.context.scene.camera=camera
for pos,power in [((0,-4,6),1100),((3,3,5),700)]:
 bpy.ops.object.light_add(type='AREA',location=pos);o=bpy.context.object;o.data.energy=power;o.data.size=4;o.rotation_euler=(Vector((.55,.4,1))-o.location).to_track_quat('-Z','Y').to_euler()
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=20;scene.world.color=(.3,.3,.3);scene.render.resolution_x=1200;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
def render(name,pos,target,scale):
 camera.location=pos;camera.rotation_euler=(Vector(target)-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.ortho_scale=scale;scene.render.filepath=str(V2/name);bpy.ops.render.render(write_still=True)
render('frame-v2-assembled.png',(3.2,-4,2.8),(.55,.35,.9),2.65)
rail.location.y+=.35
# Forward-pointing arrow shows the actual rail insertion direction.
bpy.ops.mesh.primitive_cylinder_add(vertices=24,radius=.009,depth=.20,location=(1.24,.35,1.73),rotation=(1.570796,0,0));bpy.context.object.data.materials.append(gold)
bpy.ops.mesh.primitive_cone_add(vertices=24,radius1=0,radius2=.035,depth=.07,location=(1.24,.215,1.73),rotation=(-1.570796,0,0));bpy.context.object.data.materials.append(gold)
render('frame-v2-sliding-rail.png',(2.5,3.5,3.2),(.55,.25,1.25),2.55)
