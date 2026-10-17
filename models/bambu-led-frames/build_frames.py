"""Prototype A6 lithophane frames. Run with FreeCAD's bundled Python.
All dimensions in millimetres. Generated STL parts use print orientations;
FCStd and STEP assemblies show assembled positions. No physical validation.
"""
import json, math, pathlib, zipfile
import FreeCAD as App
import Part, MeshPart

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE / 'exports'
OUT.mkdir(exist_ok=True)
PW, PH = 105.0, 148.0
BORDER, OVERLAP = 11.0, 2.0
PANEL_GAP, FIT = 3.4, 0.25
W, H = PW + .4 + 2*(BORDER-OVERLAP), PH + .4 + 2*(BORDER-OVERLAP)
FRONT, LIP = 3.0, 2.4
T = FRONT + PANEL_GAP + LIP
LED_D, LED_H = 59.0, 8.0
RECESS_D, RECESS_H = LED_D+.6, LED_H+.4
records = []
V = App.Vector

def box(x,y,z,a,b,c): return Part.makeBox(a,b,c,V(x,y,z))
def union(*parts):
    result=parts[0]
    for p in parts[1:]: result=result.fuse(p)
    return result.removeSplitter()
def move(s,x=0,y=0,z=0):
    t=s.copy();t.translate(V(x,y,z));return t

def panel_frame():
    # Front mask plus U-shaped walls and rear retaining lips. Open at the top.
    front=box(0,0,0,W,H,FRONT).cut(box(BORDER,BORDER,-1,W-2*BORDER,H-2*BORDER,FRONT+2))
    walls=union(box(0,0,FRONT,9,H,T-FRONT),box(W-9,0,FRONT,9,H,T-FRONT),box(0,0,FRONT,W,9,T-FRONT))
    lips=union(box(0,0,FRONT+PANEL_GAP,12,H,LIP),box(W-12,0,FRONT+PANEL_GAP,12,H,LIP),box(0,0,FRONT+PANEL_GAP,W,12,LIP))
    return union(front,walls,lips)

def keeper():
    # Loose sliding top stop. Top ring (lantern) or hood (postcard) captures it.
    return union(box(0,0,0,PW,8.8,3),box(3,0,3,PW-6,8.8,2.4))

def led_base(width,depth,thickness,ledx,ledy,top):
    shape=box(0,0,0,width,depth,thickness)
    floor=top-RECESS_H
    shape=shape.cut(Part.makeCylinder(RECESS_D/2,RECESS_H+3,V(ledx,ledy,floor)))
    # Open cable escape; no trapped or pinched cable and no forced kit retention.
    shape=shape.cut(box(ledx-2.5,ledy,floor,5,depth-ledy+1,thickness-floor+1))
    # Finger access at the front edge of the LED recess.
    shape=shape.cut(Part.makeCylinder(5,RECESS_H+3,V(ledx,ledy-RECESS_D/2,floor)))
    for x in [ledx-39,ledx+39]:
        for y in [ledy-22,ledy+22]:
            if 3<x<width-3 and 3<y<depth-3:
                shape=shape.cut(Part.makeCylinder(2,thickness+2,V(x,y,-1)))
    return shape.removeSplitter()

frame=panel_frame()
cap=keeper()
# Frame 1: rear sleeve surrounds the panel frame; 80 mm lightwell behind it.
# Two perpendicular 64 mm light ports permit portrait/landscape rotation.
HW, HH, DEPTH = W+4.5,H+4.5,88.8
hood=box(-2.25,-2.25,0,HW,HH,DEPTH)
hood=hood.cut(box(.75,.75,-1,W-1.5,H-1.5,DEPTH-1))
hood=hood.cut(box(-FIT,-FIT,-1,W+2*FIT,H+2*FIT,10.2))
hood=hood.cut(box(W/2-32,-3,18,64,5,64))
hood=hood.cut(box(-3,H/2-32,18,5,64,64))
for y in [12,H-15]:
    for x in [W/2-32,W/2+8]:
        hood=hood.cut(box(x,y,DEPTH-3,24,3,5))
hood=hood.removeSplitter()
# One plug closes the unused side/bottom light port. Print flat flange down.
port_cover=union(box(0,0,0,70,70,1.5),box(3.2,3.2,1.5,63.6,63.6,2.8))
# Shallow locating tray supports the entire lightwell; spacers centre portrait use.
BASE_W,BASE_D=180,105
tray_w=HH+.6
tray_d=DEPTH+.6
tray_x=(BASE_W-tray_w)/2
tray_y=7.7
base1=led_base(BASE_W,BASE_D,12,90,57.7,10.5)
base1=base1.cut(box(tray_x,tray_y,10.5,tray_w,tray_d,3)).removeSplitter()
spacer=box(0,0,0,(HH-HW)/2-.3,DEPTH,1.4)

# Frame 2: four identical A6 sides. Adjacent ends meet at square corners;
# the base and top ring locate each side independently, avoiding printed hinges.
SIDE=W+2*T+4
CENTRE=SIDE/2
OFFSET=(W+T)/2
slot_clearance=.4

def slots(shape,z,depth):
    for direction in [-1,1]:
        shape=shape.cut(box(CENTRE-W/2-.2,CENTRE+direction*OFFSET-T/2-.2,z,W+.4,T+.4,depth))
        shape=shape.cut(box(CENTRE+direction*OFFSET-T/2-.2,CENTRE-W/2-.2,z,T+.4,W+.4,depth))
    return shape.removeSplitter()
base2=led_base(SIDE,SIDE,12,CENTRE,CENTRE,12)
base2=slots(base2,6.8,6.2)
ring=box(0,0,0,SIDE,SIDE,10)
ring=ring.cut(box(11,11,-1,SIDE-22,SIDE-22,12))
ring=slots(ring,-1,6.4)
# Long open slots at the top are filled by side channels; leave a vented centre.

parts={
 'postcard_frame':frame,'postcard_top_retainer':cap,'postcard_reflector_hood':hood,
 'postcard_base':base1,'postcard_unused_port_cover':port_cover,'postcard_portrait_spacer':spacer,
 'lantern_side_frame':frame,'lantern_top_retainer':cap,'lantern_base':base2,'lantern_top_ring':ring,
 'fit_test_channel':frame.common(box(0,H-25,-1,20,26,T+2)),
 'fit_test_retainer':cap.common(box(-1,-1,-1,21,11,8)),
 'fit_test_led_socket':led_base(70,70,10,35,35,10),
}
counts={'postcard_portrait_spacer':2,'lantern_side_frame':4,'lantern_top_retainer':4}
doc=App.newDocument('Bambu_LED_A6_Prototypes')

def feature(name,shape):
    obj=doc.addObject('PartDesign::Feature',name);obj.Shape=shape
    return obj

# Export parts in usable print orientations, with bounds normalised to the bed.
for name,shape in parts.items():
    assert shape.isValid() and len(shape.Solids)==1 and shape.Volume>0,name
    printed=shape.copy()
    # Hood prints rear face down; its side ports require supports.
    if name=='postcard_reflector_hood':printed.rotate(V(0,0,0),V(1,0,0),180)
    if name=='lantern_top_ring':printed.rotate(V(0,0,0),V(1,0,0),180)
    bb=printed.BoundBox;printed.translate(V(-bb.XMin,-bb.YMin,-bb.ZMin))
    mesh=MeshPart.meshFromShape(Shape=printed,LinearDeflection=.12,AngularDeflection=.15,Relative=False)
    assert mesh.isSolid(),name+' mesh is not closed'
    mesh.write(str(OUT/(name+'.stl')))
    printed.exportStep(str(OUT/(name+'.step')))
    bb=printed.BoundBox
    records.append({'part':name,'quantity':counts.get(name,1),'bounds_mm':[round(bb.XLength,3),round(bb.YLength,3),round(bb.ZLength,3)],'solid':True,'triangles':mesh.CountFacets})

# Assembled portrait frame: image plane X/Z, lightwell behind it in Y.
def upright(shape, width=W):
    s=shape.copy();s.rotate(V(0,0,0),V(1,0,0),90)
    # Model depth Z becomes -Y; front face points towards viewer (+Y).
    s.rotate(V(0,0,0),V(0,0,1),180)
    s.translate(V((BASE_W+width)/2,tray_y+.3,12.75))
    return s
postcard_objects=[feature('PostcardBase',base1),feature('PostcardFrame',upright(frame)),feature('PostcardHood',upright(hood)),feature('PostcardRetainer',upright(move(cap,9.2,PH+9.2,3.2)))]
# A nominal kit envelope for clearance illustration, not a printable LED model.
led1=feature('Reference_LED_59x8_Postcard',Part.makeCylinder(LED_D/2,LED_H,V(90,57.7,2.1)))
led1.addProperty('App::PropertyString','Note');led1.Note='REFERENCE ONLY — do not print. Physical kit not included.'
postcard_objects.append(led1)
cover=port_cover.copy();cover.rotate(V(0,0,0),V(0,1,0),90);cover.translate(V(-3.75,H/2-35,85))
postcard_objects.append(feature('PostcardUnusedPortCover',upright(cover)))
for x in [tray_x+.2,BASE_W-tray_x-.2-spacer.BoundBox.XLength]:
    postcard_objects.append(feature('PortraitSpacer',move(spacer,x,tray_y+.3,10.5)))
postcard_objects.append(feature('Reference_Postcard_Panel',upright(box(9.2,9.2,3.2,PW,PH,3))))
Part.export(postcard_objects,str(OUT/'postcard_assembly.step'))

lantern_objects=[feature('LanternBase',move(base2,230))]
for side in range(4):
    s=frame.copy();s.rotate(V(0,0,0),V(1,0,0),90)
    s.rotate(V(0,0,0),V(0,0,1),180);s.translate(V(W/2,-OFFSET-T/2,6.8))
    s.rotate(V(0,0,0),V(0,0,1),90*side);s.translate(V(230+CENTRE,CENTRE,0))
    lantern_objects.append(feature('LanternSide'+str(side+1),s))
    k=move(cap,9.2,PH+9.2,3.2);k.rotate(V(0,0,0),V(1,0,0),90)
    k.rotate(V(0,0,0),V(0,0,1),180);k.translate(V(W/2,-OFFSET-T/2,6.8));k.rotate(V(0,0,0),V(0,0,1),90*side);k.translate(V(230+CENTRE,CENTRE,0))
    lantern_objects.append(feature('LanternRetainer'+str(side+1),k))
    panel=box(9.2,9.2,3.2,PW,PH,3);panel.rotate(V(0,0,0),V(1,0,0),90)
    panel.rotate(V(0,0,0),V(0,0,1),180);panel.translate(V(W/2,-OFFSET-T/2,6.8));panel.rotate(V(0,0,0),V(0,0,1),90*side);panel.translate(V(230+CENTRE,CENTRE,0))
    lantern_objects.append(feature('Reference_Lantern_Panel'+str(side+1),panel))
lantern_objects.append(feature('LanternTopRing',move(ring,230,0,6.8+H-5.4)))
led2=feature('Reference_LED_59x8_Lantern',Part.makeCylinder(LED_D/2,LED_H,V(230+CENTRE,CENTRE,3.6)))
led2.addProperty('App::PropertyString','Note');led2.Note='REFERENCE ONLY — do not print.'
lantern_objects.append(led2)
Part.export(lantern_objects,str(OUT/'lantern_assembly.step'))
# Landscape rotates the same frame and hood; the cover moves to the other port.
def landscape(shape):
    s=shape.copy();s.rotate(V(0,0,0),V(0,0,1),90);s.translate(V(H,0,0))
    return upright(s,H)
landscape_cover=port_cover.copy();landscape_cover.rotate(V(0,0,0),V(1,0,0),-90)
landscape_cover.translate(V(W/2-35,-3.75,85))
landscape_shapes=[base1,landscape(frame),landscape(hood),landscape(move(cap,9.2,PH+9.2,3.2)),landscape(landscape_cover)]
for i,a in enumerate(landscape_shapes):
    for b in landscape_shapes[i+1:]:assert a.common(b).Volume<.001,'Landscape assembly interference'
Part.makeCompound(landscape_shapes).exportStep(str(OUT/'postcard_landscape_assembly.step'))
# Check actual assembled fits, not just whether each isolated part is a solid.
for group in [postcard_objects,lantern_objects]:
    for i,a in enumerate(group):
        for b in group[i+1:]:
            overlap=a.Shape.common(b.Shape).Volume
            assert overlap<.001, 'Assembly interference: %s / %s: %f mm3'%(a.Name,b.Name,overlap)
for label,group in [('postcard',postcard_objects),('lantern',lantern_objects)]:
    mesh=MeshPart.meshFromShape(Shape=Part.makeCompound([o.Shape for o in group]),LinearDeflection=.15,AngularDeflection=.2,Relative=False)
    mesh.write(str(OUT/(label+'_assembly_preview.stl')))
preview_dir=OUT/'preview_parts'
preview_dir.mkdir(exist_ok=True)
for obj in postcard_objects+lantern_objects:
    mesh=MeshPart.meshFromShape(Shape=obj.Shape,LinearDeflection=.15,AngularDeflection=.2,Relative=False)
    mesh.write(str(preview_dir/(obj.Name+'.stl')))
doc.recompute();doc.saveAs(str(OUT/'bambu_led_frames.FCStd'))
(OUT/'dimensions.json').write_text(json.dumps({'panel_mm':[PW,PH],'visible_window_mm':[W-22,H-22],'border_mm':BORDER,'panel_slot_mm':PANEL_GAP,'led_recess_mm':[RECESS_D,RECESS_H],'slide_clearance_mm':slot_clearance,'parts':records},indent=2))
with zipfile.ZipFile(OUT/'bambu-led-a6-frame-prototypes.zip','w',zipfile.ZIP_DEFLATED) as archive:
    for p in OUT.iterdir():
        if p.suffix.lower() in ['.stl','.step','.fcstd','.json'] and '_assembly_preview' not in p.name:archive.write(p,p.name)
    archive.write(HERE/'README.md','README.md')
print(json.dumps({'output':str(OUT),'parts':len(records),'all_parts_valid_closed_solids':True,'dimensions':records},indent=2))
