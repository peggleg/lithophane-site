import bpy, math
from pathlib import Path
from mathutils import Vector
root=Path(r'C:/Users/peggleg/Documents/ChatGPT/lithophane-site/models/bambu-led-frames/exports')
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def mat(name,color):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);return m
frame=mat('Forest green prototype',(.12,.24,.19));panel=mat('Placeholder panel',(.82,.72,.49));led=mat('LED reference',(.85,.85,.85));floor=mat('Background',(.84,.82,.77))
for path in (root/'preview_parts').glob('*.stl'):
 bpy.ops.wm.stl_import(filepath=str(path));obj=bpy.context.object
 obj.data.materials.append(led if 'LED' in path.name else panel if 'Panel' in path.name else frame)
 obj.scale=(.01,.01,.01)
bpy.ops.mesh.primitive_plane_add(size=200,location=(2,0,-.01));bpy.context.object.data.materials.append(floor)
bpy.ops.object.camera_add(location=(7,-9,6));camera=bpy.context.object
camera.rotation_euler=(Vector((2.6,.6,.85))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=5.7;bpy.context.scene.camera=camera
for pos,power,size in [((1,-3,7),1800,5),((5,4,5),1000,4)]:
 bpy.ops.object.light_add(type='AREA',location=pos);light=bpy.context.object;light.data.energy=power;light.data.shape='DISK';light.data.size=size;light.rotation_euler=(Vector((2,.5,0))-light.location).to_track_quat('-Z','Y').to_euler()
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24
scene.render.resolution_x=1400;scene.render.resolution_y=850;scene.render.resolution_percentage=100
scene.world.color=(.5,.5,.5);scene.render.image_settings.file_format='PNG';scene.render.filepath=str(root/'frame-prototypes.png')
bpy.ops.wm.save_as_mainfile(filepath=str(root/'frame-prototypes.blend'));bpy.ops.render.render(write_still=True)
