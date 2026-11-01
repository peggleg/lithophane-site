import json,bpy,bmesh
exec(compile(open('/workspace/circa/printable/stand-options.py').read().split('# Export')[0],'circa-original','exec'))
def geometry(o):
 me=o.to_mesh();bm=bmesh.new();bm.from_mesh(me);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.00001);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(me);bm.free();me.calc_loop_triangles()
 result={'vertices':[round(c,6) for v in me.vertices for c in o.matrix_world@v.co],'faces':[i for t in me.loop_triangles for i in t.vertices]};o.to_mesh_clear();return result
result={name:[dict(geometry(o),extruder=c) for o,c in values] for name,values in parts.items()}
json.dump(result,open('/workspace/lithophane-site/src/calendar/circa-geometry.json','w'),separators=(',',':'))
print('Original calendar meshes exported for site.')
