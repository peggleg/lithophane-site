import bpy, bmesh, math, json, os, zipfile, xml.etree.ElementTree as E
from mathutils import Matrix
OUT='/workspace/circa/printable'
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
parts={}
def mesh(name,vs,fs):
 me=bpy.data.meshes.new(name);me.from_pydata(vs,[],fs);me.update();o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);return o
def ring(name,ro,ri,h,z=0,n=256):
 vs=[(r*math.cos(i*2*math.pi/n),r*math.sin(i*2*math.pi/n),zz) for zz in (z,z+h) for r in (ro,ri) for i in range(n)];fs=[]
 for i in range(n):
  j=(i+1)%n;fs += [(j,i,n+i,n+j),(2*n+i,2*n+j,3*n+j,3*n+i),(i,j,2*n+j,2*n+i),(n+j,n+i,3*n+i,3*n+j)]
 return mesh(name,vs,fs)
def cube(name,loc,dims):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=dims;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);return o
def cyl(name,r,h,loc):
 bpy.ops.mesh.primitive_cylinder_add(vertices=96,radius=r,depth=h,location=loc);o=bpy.context.object;o.name=name;return o
def boolean(a,b,op='UNION'):
 bpy.context.view_layer.objects.active=a;mod=a.modifiers.new(op,'BOOLEAN');mod.operation=op;mod.solver='EXACT';mod.object=b;bpy.ops.object.modifier_apply(modifier=mod.name);bpy.data.objects.remove(b,do_unlink=True)
def text(s,size,loc,angle=0):
 c=bpy.data.curves.new(s,'FONT');c.body=s;c.align_x='CENTER';c.align_y='CENTER';c.size=size;c.extrude=.3;c.resolution_u=8;o=bpy.data.objects.new(s,c);bpy.context.collection.objects.link(o);o.location=loc;o.rotation_euler[2]=angle;bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o.select_set(False);return o
# Each wheel prints face up. Three 2mm spokes, a 4mm hub and ring share a flat bottom.
for name,ro,ri,seq,sel,size in [('date',84,70,list(map(str,range(1,32))),15,5.1),('month',65,51,['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'],0,5),('weekday',46,31,['MON','TUE','WED','THU','FRI','SAT','SUN'],0,5)]:
 body=ring(name,ro,ri,4)
 boolean(body,ring('hub',10,4.3,4))
 for a in (0,2*math.pi/3,4*math.pi/3):
  spoke=cube('spoke',((ri+6)/2*math.cos(a),(ri+6)/2*math.sin(a),1),(ri-6+2,4,2));spoke.rotation_euler[2]=a;boolean(body,spoke)
 labels=[]
 for i,s in enumerate(seq):
  a=(i-sel)*2*math.pi/len(seq);labels.append(text(s,size,((ro+ri)/2*math.sin(a),(ro+ri)/2*math.cos(a),4),-a))
 parts[name]=[(body,2 if name=='date' else 4 if name=='month' else 3)]+[(o,1 if name=='date' else 2) for o in labels]
# Spine prints flat: bottom tongue fits 14.5 x 6.5 x 12mm base socket.
spine=cube('spine',(0,34,3),(14,176,6)) # y -54..126, axle at y36: wheel bottom -48
boolean(spine,cyl('axle',4,16,(0,44,14.0))) # axle starts z6; 0.7mm gaps between wheels
# Small shoulder gives the first wheel 0.6mm separation from spine.
boolean(spine,cyl('shoulder',7,0.6,(0,44,6.3)))
parts['spine']=[(spine,1)]
base=cube('base',(0,0,9),(146,48,18));socket=cube('socket',(0,0,12),(14.5,6.5,12.2));boolean(base,socket,'DIFFERENCE')
# Base plaque is on the upper face for reliable face-up printing.
parts['base']=[(base,1),(text('CIRCA',11,(0,-15,18)),2)]
cap=cyl('cap',9,3,(0,0,1.5));boolean(cap,cyl('socket',3.95,2.3,(0,0,1.0)),'DIFFERENCE');parts['cap']=[(cap,1)]
# Pointer mounts over top of spine with a rectangular socket. Triangle projects forward.
pointer=mesh('pointer',[(-9,0,11),(9,0,11),(0,-21,11),(-9,0,15),(9,0,15),(0,-21,15)],[(2,1,0),(3,4,5),(0,1,4,3),(1,2,5,4),(2,0,3,5)])
# Socket block behind triangle, printed flat; slid over spine from above.
block=cube('pointer saddle',(0,4,7.5),(19,12,15));boolean(pointer,block);boolean(pointer,cube('slot',(0,4,3.1),(14.5,12.2,6.4)),'DIFFERENCE');# 9 mm square window centred over the selected date at wheel y=77 + axle y=44.
boolean(pointer,cube('date viewing window',(0,-1,7.5),(9,9,20)),'DIFFERENCE');parts['pointer']=[(pointer,3)]
# Two loose spacers prevent adjacent hub faces rubbing.
parts['spacer']=[(ring('spacer',7,4.3,.6),1)]
# Serialize actual evaluated, triangulated geometry in mm.
def geometry(o):
 deps=bpy.context.evaluated_depsgraph_get();obj=o.evaluated_get(deps);me=obj.to_mesh();bm=bmesh.new();bm.from_mesh(me);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=0.00001);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(me);bm.free();me.calc_loop_triangles();vs=[tuple(o.matrix_world@v.co) for v in me.vertices];fs=[tuple(t.vertices) for t in me.loop_triangles];obj.to_mesh_clear();return vs,fs
G={name:[(geometry(o),col) for o,col in arr] for name,arr in parts.items()}
NS='http://schemas.microsoft.com/3dmanufacturing/core/2015/02';E.register_namespace('',NS)
def tag(s):return '{'+NS+'}'+s
def write(path,items):
 root=E.Element(tag('model'),{'unit':'millimeter','{http://www.w3.org/XML/1998/namespace}lang':'en-US'});E.SubElement(root,tag('metadata'),{'name':'Title'}).text='Circa — prototype geometry';res=E.SubElement(root,tag('resources'));materials=E.SubElement(res,tag('basematerials'),{'id':'1'})
 for name,c in [('Charcoal','#303737FF'),('Ivory','#E7DCC5FF'),('Orange','#C96A31FF'),('Sage','#7F8B68FF')]: E.SubElement(materials,tag('base'),{'name':name,'displaycolor':c})
 build=E.SubElement(root,tag('build'));settings=E.Element('config');oid=2
 for name,dx,dy in items:
  gs=G[name];allvs=[v for (vs,fs),col in gs for v in vs];minx=min(v[0] for v in allvs);miny=min(v[1] for v in allvs);minz=min(v[2] for v in allvs);children=[]
  for (vs,fs),col in gs:
   child=oid;oid+=1;children.append((child,col));obj=E.SubElement(res,tag('object'),{'id':str(child),'type':'model','pid':'1','pindex':str(col-1)});me=E.SubElement(obj,tag('mesh'));verts=E.SubElement(me,tag('vertices'));tris=E.SubElement(me,tag('triangles'))
   for v in vs:E.SubElement(verts,tag('vertex'),{k:format(val,'.7g') for k,val in zip(('x','y','z'),(v[0]-minx,v[1]-miny,v[2]-minz))})
   for f in fs:E.SubElement(tris,tag('triangle'),{k:str(val) for k,val in zip(('v1','v2','v3'),f)})
  parent=oid;oid+=1;ob=E.SubElement(res,tag('object'),{'id':str(parent),'type':'model','name':name});cs=E.SubElement(ob,tag('components'))
  for child,col in children:E.SubElement(cs,tag('component'),{'objectid':str(child)})
  E.SubElement(build,tag('item'),{'objectid':str(parent),'transform':f'1 0 0 0 1 0 0 0 1 {dx} {dy} 0'})
  cfg=E.SubElement(settings,'object',{'id':str(parent)});E.SubElement(cfg,'metadata',{'key':'name','value':name});E.SubElement(cfg,'metadata',{'key':'extruder','value':str(children[0][1])})
  for child,col in children:
   pt=E.SubElement(cfg,'part',{'id':str(child),'subtype':'normal_part'});E.SubElement(pt,'metadata',{'key':'name','value':name});E.SubElement(pt,'metadata',{'key':'extruder','value':str(col)})
 types='<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>'
 rels='<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>'
 with zipfile.ZipFile(path,'w',zipfile.ZIP_DEFLATED) as z:
  z.writestr('[Content_Types].xml',types);z.writestr('_rels/.rels',rels);z.writestr('3D/3dmodel.model',E.tostring(root,encoding='utf-8',xml_declaration=True));z.writestr('Metadata/model_settings.config',E.tostring(settings,encoding='utf-8',xml_declaration=True))
for name in G:write(f'{OUT}/circa-{name}.3mf',[(name,5,5)])
# The full set is unarranged across a wide virtual workspace; arrange onto plates in Studio.
write(f'{OUT}/Circa-complete.3mf',[(name,i*190+5,5) for i,name in enumerate(G)]+[('spacer',1530,5)])
bpy.ops.wm.save_as_mainfile(filepath=f'{OUT}/circa-source.blend')
json.dump({'parts':list(G),'date_sequence':list(range(1,32)),'axle_diameter_mm':8,'hub_bore_mm':8.6,'wheel_thickness_mm':4,'spacer_mm':.6,'max_part_mm':176,'pointer_window_mm':[9,9],'filaments':['Charcoal','Ivory','Orange','Sage']},open(f'{OUT}/dimensions.json','w'),indent=2)
print('Exported 3MF files')