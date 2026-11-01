# Compatible replacement stands for Circa. All dimensions are millimetres.
src=open('/workspace/circa/printable/build.py').read()
exec(compile(src.split('# Serialize actual')[0],'circa_geometry','exec'))
def socket(body):
 boolean(body,cube('spine socket',(0,0,12),(14.5,6.5,12.2)),'DIFFERENCE')
def capsule(name,width,depth,height,z=0):
 straight=width-depth
 body=cube(name,(0,0,z+height/2),(straight,depth,height))
 for x in (-straight/2,straight/2):boolean(body,cyl('rounded end',depth/2,height,(x,0,z+height/2)))
 return body
# 01: two rounded tiers, recalling the original oval pedestal.
body=capsule('Oval pedestal',146,52,6)
boolean(body,capsule('Upper oval tier',138,46,12,6));socket(body)
parts['stand-oval']=[(body,1),(text('CIRCA',10,(0,-15,18)),2)]
# 02: broad twin feet connected by a narrow, support-free bridge.
body=cube('Twin-foot bridge',(0,0,6),(140,18,12))
for x in (-58,58):boolean(body,capsule('Foot',30,52,12)) if False else None
# Rounded rectangular feet run front to back, unlike the crosswise bridge.
for x in (-58,58):
 foot=capsule('Foot',52,26,12);foot.rotation_euler[2]=math.pi/2;foot.location.x=x;boolean(body,foot)
boolean(body,cube('Socket block',(0,0,9),(34,32,18)));socket(body)
parts['stand-twin-foot']=[(body,1),(text('CIRCA',7,(0,-12,18)),2)]
# 03: three crisp, inset tiers form a compact architectural plinth.
body=cube('Stepped plinth',(0,0,3),(146,52,6))
boolean(body,cube('Middle tier',(0,0,9),(126,44,6)))
boolean(body,cube('Upper tier',(0,0,15),(106,36,6)));socket(body)
parts['stand-stepped']=[(body,1),(text('CIRCA',10,(0,-12,18)),2)]
# Export
exec(compile(src[src.index('# Serialize actual'):src.index('for name in G:write')],'circa_export_helpers','exec'))
for name in ('stand-oval','stand-twin-foot','stand-stepped'):
 write(f'{OUT}/circa-{name}.3mf',[(name,5,5)])
print('Three compatible stands exported.')