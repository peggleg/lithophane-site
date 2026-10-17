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
    # Lantern sliding top stop; the top ring captures it.
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
# Frame 1 revision: open slim frame, no hood or roof.
BASE_W, BASE_D = 110, 90
frame1=frame.common(box(-1,-1,-1,W+2,H-2,T+2))
# Rear-only M3 x 6 mm access. Keep 2.4 mm of uninterrupted front skin.
SCREW_LENGTH=6.0
FRONT_SKIN=2.4
for x in [1.5,W-7.5]:
    frame1=frame1.cut(box(x,H-12,3.2,6,H,4.0))
    frame1=frame1.cut(Part.makeCylinder(1.6,3,V(x+3,H-8,7.0)))
    frame1=frame1.cut(Part.makeCylinder(1.3,T-FRONT_SKIN+1,V(x+3,H-8,FRONT_SKIN)))
# Easier-removal top-rail tabs: 0.4 mm clearance per side in the existing
# 6 mm pockets, plus a 1 mm tapered lead. Screw centres remain unchanged.
TAB_WIDTH,TAB_DEPTH,TAB_LENGTH=5.2,3.4,8.5
def rail_tab(centre):
    def outline(y,width,depth):
        x=centre-width/2;z=5.1-depth/2
        points=[V(x,y,z),V(x+width,y,z),V(x+width,y,z+depth),V(x,y,z+depth),V(x,y,z)]
        return Part.makePolygon(points)
    lead=Part.makeLoft([outline(H-3-TAB_LENGTH,TAB_WIDTH-.6,TAB_DEPTH-.6),outline(H-2-TAB_LENGTH,TAB_WIDTH,TAB_DEPTH)],True)
    return union(lead,box(centre-TAB_WIDTH/2,H-2-TAB_LENGTH,5.1-TAB_DEPTH/2,TAB_WIDTH,TAB_LENGTH-1,TAB_DEPTH))
cap1=union(box(0,H-3,0,W,3,T),
           box(9.2,157.4,3.2,PW,6,3),
           box(12.2,157.4,6.2,PW-6,6,2.4),
           rail_tab(4.5),rail_tab(W-4.5))
for x in [4.5,W-4.5]:cap1=cap1.cut(Part.makeCylinder(1.3,T-FRONT_SKIN+1,V(x,H-8,FRONT_SKIN)))
frame1=frame1.removeSplitter();cap1=cap1.removeSplitter()
# LED faces forward and 30 degrees upward from a raised rear cradle.
def tilted(shape):
    s=shape.copy();s.rotate(V(0,0,0),V(1,0,0),60)
    s.translate(V(BASE_W/2,65,44));return s
cradle=Part.makeCylinder(33,12)
cradle=cradle.cut(Part.makeCylinder(RECESS_D/2,10,V(0,0,3.6)))
cradle=cradle.cut(box(-2.5,-35,3.6,5,35,10))
# Two-piece stand: keyed holder presses down after the wire is laid in the groove.
stand=box(0,0,0,BASE_W,BASE_D,8)
stand=stand.cut(box(-1,8,2.8,BASE_W+2,T+.4,6))
stand=stand.cut(box(45.85,63.85,3.0,18.3,13.3,6))
wire_route=box(BASE_W/2-2.9,32,4.8,5.8,BASE_D-31,3.8)
stand=stand.cut(wire_route).removeSplitter()
key=box(46,64,3.2,18,13,4.8)
# Holder relief must break through the underside of the key. The base keeps
# its cable-groove floor, but the removable part must not form a closed eyelet.
holder_wire_relief=box(BASE_W/2-2.9,32,3.0,5.8,BASE_D-31,5.6)
holder_core=union(box(BASE_W/2-10,63,8,20,15,38),tilted(cradle),key).cut(holder_wire_relief).removeSplitter()
# Four shallow sacrificial ribs provide 0.05 mm nominal interference per side.
# The plain lower key enters first; only the ribs should grip the socket.
ribs=[]
for x in [46.2,63.8]:
    for y in [67,74]:
        ribs.append(union(Part.makeCone(.2,.4,.6,V(x,y,4.2)),Part.makeCylinder(.4,2.6,V(x,y,4.8))))
press_ribs=union(*ribs)
holder=union(holder_core,press_ribs)
assert holder_core.common(stand).Volume<1e-6,'Key body has unintended interference'
press_overlap=press_ribs.common(stand).Volume
assert abs(holder.common(stand).Volume-press_overlap)<1e-6,'Interference outside intended press ribs'
cable_envelope=box(BASE_W/2-2.5,32,5.1,5,BASE_D-31,3)
assert union(stand,holder).common(cable_envelope).Volume<1e-6,'Cable channel is pinched'
open_bottom=box(BASE_W/2-2.8,63,2.0,5.6,15,6.5)
assert holder.common(open_bottom).Volume<1e-6,'Holder cable notch is closed underneath'
for lift in [1,3,5,10,20]:
    assert move(holder_core,0,0,lift).common(stand).Volume<1e-6,'Holder insertion obstructed'
led_postcard=tilted(Part.makeCylinder(LED_D/2,LED_H,V(0,0,3.8)))

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
 'postcard_frame':frame1,'postcard_top_retainer':cap1,'postcard_base':stand,'postcard_led_holder':holder,
 'lantern_side_frame':frame,'lantern_top_retainer':cap,'lantern_base':base2,'lantern_top_ring':ring,
 'fit_test_channel':frame1.common(box(0,H-25,-1,20,26,T+2)),
 'fit_test_retainer':cap1.common(box(-1,H-13,-1,21,14,T+2)),
 'fit_test_led_socket':led_base(70,70,10,35,35,10),
 'fit_test_stand_socket':stand.common(box(40,58,0,30,27,8)),
 'fit_test_stand_key':holder.common(box(42,61,0,26,19,14)),
}
counts={'lantern_side_frame':4,'lantern_top_retainer':4}
doc=App.newDocument('Bambu_LED_A6_Prototypes')

def feature(name,shape):
    obj=doc.addObject('PartDesign::Feature',name);obj.Shape=shape
    return obj

# Export parts in usable print orientations, with bounds normalised to the bed.
for name,shape in parts.items():
    assert shape.isValid() and len(shape.Solids)==1 and shape.Volume>0,name
    printed=shape.copy()
    if name in ['postcard_top_retainer','fit_test_retainer']:printed.rotate(V(0,0,0),V(1,0,0),-90)
    if name=='lantern_top_ring':printed.rotate(V(0,0,0),V(1,0,0),180)
    bb=printed.BoundBox;printed.translate(V(-bb.XMin,-bb.YMin,-bb.ZMin))
    mesh=MeshPart.meshFromShape(Shape=printed,LinearDeflection=.12,AngularDeflection=.15,Relative=False)
    assert mesh.isSolid(),name+' mesh is not closed'
    mesh.write(str(OUT/(name+'.stl')))
    printed.exportStep(str(OUT/(name+'.step')))
    bb=printed.BoundBox
    records.append({'part':name,'quantity':counts.get(name,1),'bounds_mm':[round(bb.XLength,3),round(bb.YLength,3),round(bb.ZLength,3)],'solid':True,'triangles':mesh.CountFacets})

# Assembled postcard frame: front faces -Y, open rear exposes the LED cradle.
def upright(shape,width=W):
    s=shape.copy();s.rotate(V(0,0,0),V(1,0,0),90)
    s.rotate(V(0,0,0),V(0,0,1),180)
    s.translate(V((BASE_W+width)/2,8.2,2.8));return s
postcard_objects=[feature('PostcardBase',stand),feature('PostcardHolder',holder),feature('PostcardFrame',upright(frame1)),
                  feature('PostcardRetainer',upright(cap1)),
                  feature('Reference_LED_59x8_Postcard',led_postcard),
                  feature('Reference_Postcard_Panel',upright(box(9.2,9.2,3.2,PW,PH,3)))]
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
# Same frame rotated 90 degrees, in the same removable base slot.
def landscape(shape):
    s=shape.copy();s.rotate(V(0,0,0),V(0,0,1),90);s.translate(V(H,0,0))
    return upright(s,H)
landscape_shapes=[stand,holder,landscape(frame1),landscape(cap1),led_postcard,
                  landscape(box(9.2,9.2,3.2,PW,PH,3))]
for i,a in enumerate(landscape_shapes):
    for b in landscape_shapes[i+1:]:
        allowed=press_overlap if i==0 and b.isSame(holder) else 0
        assert abs(a.common(b).Volume-allowed)<.001,'Landscape assembly interference'
Part.makeCompound(landscape_shapes).exportStep(str(OUT/'postcard_landscape_assembly.step'))
# Verify the panel insertion path with the top retainer removed.
for lift in [0,40,80,160]:
    assert frame1.common(box(9.2,9.2+lift,3.2,PW,PH,3)).Volume<.001,'Panel insertion interference'
# Tab envelope must remain a clearance fit in the existing printed frame.
assert (6-TAB_WIDTH)/2>=.399999,'Tab width clearance too small'
assert TAB_DEPTH<=3.4 and TAB_LENGTH<=8.5,'Tab dimensions regressed'
for centre in [4.5,W-4.5]:
    pocket=box(centre-3,H-12,3.2,6,9,4.0)
    tab=rail_tab(centre)
    assert tab.cut(pocket).Volume<1e-6,'Tab exceeds existing pocket'
# Regression checks for the display face and rear-only fastener access.
expected_skin=frame.common(box(-1,-1,0,W+2,H-2,FRONT_SKIN-.01))
assert expected_skin.cut(frame1).Volume<1e-6,'Front mask was pierced'
assert box(0,H-3,0,W,3,FRONT_SKIN-.01).cut(cap1).Volume<1e-6,'Top rail front was pierced'
assert T-SCREW_LENGTH>FRONT_SKIN,'Screw tip would exceed blind-hole depth'
for x in [4.5,W-4.5]:
    axis=Part.makeCylinder(1.2,T-FRONT_SKIN+1,V(x,H-8,FRONT_SKIN+.001))
    assert union(frame1,cap1).common(axis).Volume<1e-6,'Rear screw path obstructed'
    driver=Part.makeCylinder(3,70,V(x,H-8,T+.001))
    for transform in [upright,landscape]:
        access=transform(driver)
        for obstacle in [stand,holder,led_postcard,transform(frame1),transform(cap1)]:
            assert access.common(obstacle).Volume<1e-6,'Rear screwdriver access obstructed'
# Check actual assembled fits, not just whether each isolated part is a solid.
for group in [postcard_objects,lantern_objects]:
    for i,a in enumerate(group):
        for b in group[i+1:]:
            overlap_shape=a.Shape.common(b.Shape)
            allowed=press_overlap if {a.Name,b.Name}=={'PostcardBase','PostcardHolder'} else 0
            overlap=abs(overlap_shape.Volume-allowed)
            assert overlap<.001, 'Assembly interference: %s / %s: %f mm3'%(a.Name,b.Name,overlap)
for label,group in [('postcard',postcard_objects),('lantern',lantern_objects)]:
    mesh=MeshPart.meshFromShape(Shape=Part.makeCompound([o.Shape for o in group]),LinearDeflection=.15,AngularDeflection=.2,Relative=False)
    mesh.write(str(OUT/(label+'_assembly_preview.stl')))
preview_dir=OUT/'preview_parts'
preview_dir.mkdir(exist_ok=True)
for obj in postcard_objects+lantern_objects:
    mesh=MeshPart.meshFromShape(Shape=obj.Shape,LinearDeflection=.15,AngularDeflection=.2,Relative=False)
    mesh.write(str(preview_dir/(obj.Name+'.stl')))
# Partial insertion view: panel slides vertically down the open side channels.
for name,shape in [('Insert_Frame',upright(frame1)),('Insert_Base',stand),('Insert_Holder',holder),
                   ('Insert_Panel',upright(box(9.2,74.2,3.2,PW,PH,3))),
                   ('Insert_Retainer',upright(move(cap1,0,100,0))),
                   ('Insert_LED',led_postcard)]:
    MeshPart.meshFromShape(Shape=shape,LinearDeflection=.15,AngularDeflection=.2,Relative=False).write(str(preview_dir/(name+'.stl')))
doc.recompute();doc.saveAs(str(OUT/'bambu_led_frames.FCStd'))
(OUT/'dimensions.json').write_text(json.dumps({'panel_mm':[PW,PH],'visible_window_mm':[W-22,H-22],'border_mm':BORDER,'panel_slot_mm':PANEL_GAP,'led_recess_mm':[RECESS_D,RECESS_H],'slide_clearance_mm':slot_clearance,'parts':records},indent=2))
with zipfile.ZipFile(OUT/'bambu-led-a6-frame-prototypes.zip','w',zipfile.ZIP_DEFLATED) as archive:
    for p in OUT.iterdir():
        if (p.stem in parts and p.suffix.lower() in ['.stl','.step']) or p.name in ['bambu_led_frames.FCStd','dimensions.json','postcard_assembly.step','postcard_landscape_assembly.step','lantern_assembly.step']:archive.write(p,p.name)
    archive.write(HERE/'README.md','README.md')
print(json.dumps({'output':str(OUT),'parts':len(records),'all_parts_valid_closed_solids':True,'dimensions':records},indent=2))
