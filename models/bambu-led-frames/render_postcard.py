import bpy, math, sys
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parent
OUT=ROOT/'exports'
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def material(name,color):
 m=bpy.data.materials.new(name);m.use_nodes=True
 m.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(*color,1)
 m.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=.6
 return m
frame=material('Green printed frame',(.09,.20,.15));led=material('LED housing reference',(.8,.81,.78));gold=material('Assembly arrows',(.85,.38,.05));ground=material('Warm background',(.79,.76,.69))
photo=material('Illustrative lithophane artwork',(.8,.75,.6))
n=photo.node_tree.nodes;l=photo.node_tree.links
tex=n.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(ROOT.parent.parent/'src/assets/seasonal-collection.webp'))
coord=n.new('ShaderNodeTexCoord');split=n.new('ShaderNodeSeparateXYZ');l.new(coord.outputs['Generated'],split.inputs[0])
combine=n.new('ShaderNodeCombineXYZ')
for axis in ['X','Z']:
 mathnode=n.new('ShaderNodeMath');mathnode.operation='MULTIPLY_ADD';mathnode.inputs[1].default_value=.5;mathnode.inputs[2].default_value=.5
 l.new(split.outputs[axis],mathnode.inputs[0]);l.new(mathnode.outputs[0],combine.inputs['X' if axis=='X' else 'Y'])
l.new(combine.outputs[0],tex.inputs['Vector']);l.new(tex.outputs['Color'],n.get('Principled BSDF').inputs['Base Color'])
objects=[]
def load(name,mat):
 bpy.ops.wm.stl_import(filepath=str(OUT/'preview_parts'/(name+'.stl')))
 o=bpy.context.object;o.data.materials.clear();o.data.materials.append(mat);o.scale=(.01,)*3;objects.append(o);return o
for name,mat in [('PostcardBase',frame),('PostcardHolder',frame),('PostcardFrame',frame),('PostcardRetainer',frame),('Reference_Postcard_Panel',photo),('Reference_LED_59x8_Postcard',led)]:load(name,mat)
bpy.ops.mesh.primitive_plane_add(size=100,location=(0,0,-.01));bpy.context.object.data.materials.append(ground)
bpy.ops.object.camera_add();camera=bpy.context.object;camera.data.type='ORTHO';bpy.context.scene.camera=camera
for pos,power,size in [((0,-4,6),1100,4),((3,3,5),700,3)]:
 bpy.ops.object.light_add(type='AREA',location=pos);o=bpy.context.object;o.data.energy=power;o.data.size=size;o.rotation_euler=(Vector((.6,.4,1))-o.location).to_track_quat('-Z','Y').to_euler()
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=20
scene.render.resolution_x=1200;scene.render.resolution_y=1000;scene.render.resolution_percentage=100;scene.world.color=(.3,.3,.3)
scene.render.image_settings.file_format='PNG'
def render(name,pos,target,scale):
 camera.location=pos;camera.rotation_euler=(Vector(target)-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.ortho_scale=scale
 scene.render.filepath=str(OUT/name);bpy.ops.render.render(write_still=True)
if '--split-only' not in sys.argv:render('postcard-slim-assembled.png',(3.2,-4,2.8),(.55,.35,.9),2.65)
for o in objects:bpy.data.objects.remove(o,do_unlink=True)
objects=[]
for name,mat in [('Insert_Base',frame),('Insert_Frame',frame),('Insert_Holder',frame),('Insert_Retainer',frame),('Insert_Panel',photo),('Insert_LED',led)]:load(name,mat)
# Two arrows next to the exposed panel show its downward insertion direction.
for x in [-.13,1.22]:
 bpy.ops.mesh.primitive_cylinder_add(vertices=24,radius=.012,depth=.40,location=(x,.13,2.02));bpy.context.object.data.materials.append(gold)
 bpy.ops.mesh.primitive_cone_add(vertices=24,radius1=0,radius2=.055,depth=.12,location=(x,.13,1.76));bpy.context.object.data.materials.append(gold)
if '--split-only' not in sys.argv:render('postcard-panel-insertion.png',(3.0,-4.4,3.1),(.55,.25,1.36),3.35)
# A rear view exposes the receiving channels and raised LED cradle.
if '--split-only' not in sys.argv:render('postcard-panel-insertion-rear.png',(3.2,4.8,3.0),(.55,.35,1.35),3.4)

# Base/holder exploded close-up. Load the cable first, then press vertically down.
for o in objects:bpy.data.objects.remove(o,do_unlink=True)
objects=[]
for o in list(bpy.data.objects):
 if o.type=='MESH' and o.name.startswith(('Cylinder','Cone')):bpy.data.objects.remove(o,do_unlink=True)
load('PostcardBase',frame)
held=load('PostcardHolder',frame);held.location.z+=.30
kit=load('Reference_LED_59x8_Postcard',led);kit.location.z+=.30
# Cable shown resting in the open rear groove, outside the press-fit contact ribs.
cablemat=material('Cable route illustration',(.025,.025,.025))
curve=bpy.data.curves.new('Cable laid before pressing holder','CURVE');curve.dimensions='3D';curve.bevel_depth=.014;curve.bevel_resolution=4
path=curve.splines.new('BEZIER');points=[(.55,.468,.501),(.55,.37,.27),(.55,.37,.066),(.55,.64,.066),(.55,.95,.066)];path.bezier_points.add(len(points)-1)
for point,coordinate in zip(path.bezier_points,points):point.co=coordinate;point.handle_left_type='AUTO';point.handle_right_type='AUTO'
cable=bpy.data.objects.new('Illustrative cable path',curve);bpy.context.collection.objects.link(cable);curve.materials.append(cablemat)
for x in [.37,.73]:
 bpy.ops.mesh.primitive_cylinder_add(vertices=24,radius=.008,depth=.12,location=(x,.70,.19));bpy.context.object.data.materials.append(gold)
 bpy.ops.mesh.primitive_cone_add(vertices=24,radius1=0,radius2=.035,depth=.07,location=(x,.70,.095));bpy.context.object.data.materials.append(gold)
render('postcard-stand-two-piece.png',(2.5,3.6,2.3),(.55,.53,.45),1.85)

render('postcard-holder-open-notch.png',(1.45,2.1,.85),(.55,.70,.22),1.0)
