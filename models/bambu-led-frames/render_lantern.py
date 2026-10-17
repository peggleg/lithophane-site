"""Assembly illustrations from the existing validated lantern CAD, not a redesign."""
import bpy,math
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parent;OUT=ROOT/'exports'
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def material(name,color):
 m=bpy.data.materials.new(name);m.use_nodes=True
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Roughness'].default_value=.6
 return m
frame=material('Printed frame',(.09,.20,.15));white=material('LED reference',(.88,.88,.85));gold=material('Assembly direction',(.85,.36,.04));floor=material('Background',(.79,.76,.69))
def artwork(axis,quadrant):
 m=material('Illustrative panel '+str(quadrant),(.8,.75,.6));n=m.node_tree.nodes;l=m.node_tree.links
 t=n.new('ShaderNodeTexImage');t.image=bpy.data.images.load(str(ROOT.parent.parent/'src/assets/seasonal-collection.webp'),check_existing=True)
 c=n.new('ShaderNodeTexCoord');s=n.new('ShaderNodeSeparateXYZ');l.new(c.outputs['Generated'],s.inputs[0]);out=n.new('ShaderNodeCombineXYZ')
 for source,target,offset in [(axis,'X',.5*(quadrant%2)),('Z','Y',.5 if quadrant<2 else 0)]:
  op=n.new('ShaderNodeMath');op.operation='MULTIPLY_ADD';op.inputs[1].default_value=.5;op.inputs[2].default_value=offset;l.new(s.outputs[source],op.inputs[0]);l.new(op.outputs[0],out.inputs[target])
 l.new(out.outputs[0],t.inputs['Vector']);l.new(t.outputs['Color'],n.get('Principled BSDF').inputs['Base Color']);return m
photos=[artwork('X' if i%2==0 else 'Y',q) for i,q in enumerate([1,0,2,3])]
parts={};original={};arrows=[]
def load(name,mat):
 bpy.ops.wm.stl_import(filepath=str(OUT/'preview_parts'/(name+'.stl')));o=bpy.context.object;o.data.materials.clear();o.data.materials.append(mat)
 o.scale=(.01,)*3;o.location=(-3.025,-.725,0);parts[name]=o;original[name]=o.location.copy();return o
load('LanternBase',frame);load('LanternTopRing',frame);load('Reference_LED_59x8_Lantern',white)
for i in range(1,5):
 load('LanternSide'+str(i),frame);load('LanternRetainer'+str(i),frame);load('Reference_Lantern_Panel'+str(i),photos[i-1])
def reset():
 for name,o in parts.items():o.hide_render=False;o.location=original[name].copy()
 for o in arrows:bpy.data.objects.remove(o,do_unlink=True)
 arrows.clear()
def down(x,y,z,length=.3):
 bpy.ops.mesh.primitive_cylinder_add(vertices=20,radius=.012,depth=length,location=(x,y,z+length/2));o=bpy.context.object;o.data.materials.append(gold);arrows.append(o)
 bpy.ops.mesh.primitive_cone_add(vertices=20,radius1=0,radius2=.05,depth=.10,location=(x,y,z-.05));o=bpy.context.object;o.data.materials.append(gold);arrows.append(o)
bpy.ops.mesh.primitive_plane_add(size=100,location=(0,0,-.01));bpy.context.object.data.materials.append(floor)
bpy.ops.object.camera_add();camera=bpy.context.object;camera.data.type='ORTHO';bpy.context.scene.camera=camera
for pos,power,size in [((0,-4,7),1300,4),((4,4,5),900,4)]:
 bpy.ops.object.light_add(type='AREA',location=pos);o=bpy.context.object;o.data.energy=power;o.data.size=size;o.rotation_euler=(Vector((0,0,1))-o.location).to_track_quat('-Z','Y').to_euler()
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=20;scene.world.color=(.3,.3,.3)
scene.render.resolution_x=1200;scene.render.resolution_y=1100;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG'
def render(name,pos,target,scale):
 camera.location=pos;camera.rotation_euler=(Vector(target)-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.ortho_scale=scale;scene.render.filepath=str(OUT/name);bpy.ops.render.render(write_still=True)
# 1: side frame loaded through its real top opening, small retainer lifted away.
for name,o in parts.items():o.hide_render=name not in ['LanternSide1','LanternRetainer1','Reference_Lantern_Panel1']
parts['Reference_Lantern_Panel1'].location.z+=.65;parts['LanternRetainer1'].location.z+=1.0
for x in [-.75,.75]:down(x,-.70,1.96)
render('lantern-1-panel-insertion.png',(2.5,-4.8,3.1),(0,-.65,1.40),3.3)
# 2: all four sides lift vertically from their corresponding slots; no lateral
# displacement is used, so the receiving-slot alignment remains accurate.
reset()
for name,o in parts.items():
 if name.startswith(('LanternSide','LanternRetainer','Reference_Lantern_Panel')):o.location.z+=.60
parts['Reference_LED_59x8_Lantern'].location.z+=.18
parts['LanternTopRing'].location.z+=1.70
for x,y in [(-.66,-.66),(.66,.66)]:down(x,y,.33,.22)
for x in [-.66,.66]:down(x,0,2.87,.30)
render('lantern-2-exploded-assembly.png',(4,-6,5.1),(0,0,1.65),4.5)
# 3: final assembled CAD, open top retained for ventilation.
reset();render('lantern-3-assembled.png',(3.6,-5.2,4),(0,0,.9),2.9)
