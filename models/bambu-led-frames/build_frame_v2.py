"""Separate Frame V2. Does not regenerate or modify the base, holder or V1."""
from pathlib import Path
import hashlib,json,zipfile
import FreeCAD as A,Part,MeshPart
R=Path(__file__).resolve().parent;O=R/'frame-v2';O.mkdir(exist_ok=True)
V=A.Vector;W,H,T=123.4,166.4,8.8
protected_files=[R/'exports'/n for n in ['postcard_base.stl','postcard_base.step','postcard_led_holder.stl','postcard_led_holder.step']]
before={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in protected_files}
def box(x,y,z,w,h,d):return Part.makeBox(w,h,d,V(x,y,z))
def fuse(*parts):
 s=parts[0]
 for p in parts[1:]:s=s.fuse(p)
 return s.removeSplitter()
# The original mask, U channel and rear lips are copied dimension-for-dimension.
front=box(0,0,0,W,H-3,3).cut(box(11,11,-1,W-22,H-22,5))
body=fuse(front,box(0,0,3,9,H-3,5.8),box(W-9,0,3,9,H-3,5.8),box(0,0,3,W,9,5.8),box(0,0,6.4,12,H-3,2.4),box(W-12,0,6.4,12,H-3,2.4),box(0,0,6.4,W,12,2.4))
def prism(points,z,length):
 wire=Part.makePolygon([V(x,y,z) for x,y in points]+[V(*points[0],z)])
 return Part.Face(wire).extrude(V(0,0,length))
rails=[];grooves=[]
for c in [4.5,W-4.5]:
 rails.append(prism([(c-1.8,H-3),(c+1.8,H-3),(c+2.6,H-1.4),(c-2.6,H-1.4)],1.4,6.0))
 grooves.append(prism([(c-2.1,H-3.2),(c+2.1,H-3.2),(c+2.1,H-3),(c+2.9,H-1.4),(c+2.9,H-1.1),(c-2.9,H-1.1),(c-2.9,H-1.4),(c-2.1,H-3)],-1,8.4))
frame=fuse(body,box(0,H-3,0,W,3,1.2),*rails)
# Keeper contacts the panel at exactly the original Y=157.4 stop plane. It
# remains between the rear lips, allowing the cap to slide in from the rear.
cap=fuse(box(0,H-2.8,0,W,2.8,T),box(12.2,157.4,3.2,99,6.2,5.6))
for g in grooves:cap=cap.cut(g)
cap=cap.common(box(-1,0,1.4,W+2,H+1,T)).removeSplitter()
# Compare the actual V1 solid, not only a copied dimension list.
old_doc=A.openDocument(str(R/'exports/bambu_led_frames.FCStd'))
old=old_doc.getObject('PostcardFrame').Shape.copy()
old.translate(V(-(110+W)/2,-8.2,-2.8));old.rotate(V(0,0,0),V(0,0,1),180);old.rotate(V(0,0,0),V(1,0,0),-90)
channel=box(8.9,8.9,2.9,105.6,H-7.9,3.6)
a=old.common(channel);b=frame.common(channel)
assert a.cut(b).Volume<1e-6 and b.cut(a).Volume<1e-6,'Image channel changed'
front_skin=box(0,0,0,W,H,1.1).cut(box(11,11,-1,W-22,H-22,4))
assert front_skin.cut(frame).Volume<1e-6,'Front display face is pierced'
panel=box(9.2,9.2,3.2,105,148,3)
assert frame.common(panel).Volume<1e-6 and cap.common(panel).Volume<1e-6
for lift in [0,20,70,160]:assert frame.common(box(9.2,9.2+lift,3.2,105,148,3)).Volume<1e-6,'Panel insertion obstructed'
for shift in [0,.1,1,3,6,10,20]:
 s=cap.copy();s.translate(V(0,0,shift));assert frame.common(s).Volume<1e-6,'Rail sliding path obstructed'
# Dovetail must resist lifting vertically; removal is along the rearward axis.
s=cap.copy();s.translate(V(0,1.0,0));assert frame.common(s).Volume>.1,'Rail is not mechanically captured'
parts={'postcard_frame_v2':frame,'postcard_top_rail_v2':cap,'fit_test_frame_v2':frame.common(box(0,H-14,0,9,15,T)),'fit_test_rail_v2':cap.common(box(0,H-14,0,9,15,T))}
meta=[];doc=A.newDocument('Postcard_Frame_V2')
def upright(s):
 s=s.copy();s.rotate(V(0,0,0),V(1,0,0),90);s.rotate(V(0,0,0),V(0,0,1),180);s.translate(V((110+W)/2,8.2,2.8));return s
for name,shape in parts.items():
 assert shape.isValid() and len(shape.Solids)==1,name
 p=shape.copy()
 # Frame display face is Z=0; rail exposed rear is Z=T. Both print flat.
 if 'rail' in name:p.rotate(V(0,0,0),V(1,0,0),180)
 bb=p.BoundBox;p.translate(V(-bb.XMin,-bb.YMin,-bb.ZMin))
 m=MeshPart.meshFromShape(Shape=p,LinearDeflection=.1,AngularDeflection=.15,Relative=False);assert m.isSolid(),name
 m.write(str(O/(name+'.stl')));p.exportStep(str(O/(name+'.step')))
 obj=doc.addObject('PartDesign::Feature',name);obj.Shape=shape
 bb=p.BoundBox
 bed_faces=[f for f in p.Faces if f.BoundBox.ZLength<1e-7 and abs(f.BoundBox.ZMin)<1e-7]
 contact=sum(f.Area for f in bed_faces)
 assert contact>10,'No flat build-plate face'
 if name=='postcard_top_rail_v2':
  assert abs(contact-(123.4*2.8+99*6.2))<1e-5,'Keeper not flush with rail print face'
 meta.append({'part':name,'bounds_mm':[bb.XLength,bb.YLength,bb.ZLength],'closed':True,'print_face':'exposed rear down' if 'rail' in name else 'display front down','bed_contact_mm2':contact})
for name,s in [('FrameV2',upright(frame)),('RailV2',upright(cap)),('RailV2_Removed',upright(cap))]:
 if name.endswith('Removed'):s.translate(V(0,35,0))
 MeshPart.meshFromShape(Shape=s,LinearDeflection=.1,AngularDeflection=.15,Relative=False).write(str(O/(name+'_preview.stl')))
doc.recompute();doc.saveAs(str(O/'postcard_frame_v2.FCStd'))
Part.makeCompound([frame,cap]).exportStep(str(O/'postcard_frame_v2_assembly.step'))
assert before=={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in protected_files},'Base or LED fitting changed'
(O/'validation.json').write_text(json.dumps({'image_channel_identical_to_v1':True,'panel_stop_y_mm':157.4,'base_and_led_files_unchanged':True,'rail_slide_direction':'from rear, towards front','lateral_clearance_mm_per_side':.3,'both_parts_face_down':True,'slide_and_panel_paths_checked':True,'lift_capture_checked':True,'parts':meta},indent=2))
with zipfile.ZipFile(O/'postcard-frame-v2.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in O.iterdir():
  if p.suffix.lower() in ['.stl','.step','.fcstd','.json'] and '_preview' not in p.name:z.write(p,p.name)
 z.write(O/'README.md','README.md')
print('Frame V2: closed meshes, unchanged image channel, clear insertion paths, captured rail; base/LED hashes unchanged.')
