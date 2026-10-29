"""Check actual browser 3MF/ZIP exports and Bambu desktop-saved object overrides."""
import json, zipfile, xml.etree.ElementTree as E
from pathlib import Path
keys={'sparse_infill_pattern':'gyroid','sparse_infill_density':'30%','wall_loops':'4','top_shell_layers':'5','bottom_shell_layers':'5','top_shell_thickness':'0','bottom_shell_thickness':'0'}
for kind in ['cupboard-hinge','cupboard']:
 root=Path('artifacts/products')/kind
 for printer in ['a1-mini','256']:
  stem=kind+'-'+printer
  expected=None
  for file in [root/(stem+'.3mf'),root/'desktop-m5-final'/(stem+'.3mf')]:
   with zipfile.ZipFile(file) as z:
    p=json.loads(z.read('Metadata/project_settings.config'))
    assert (p['sparse_infill_density'],p['wall_loops'],p['top_shell_layers'],p['bottom_shell_layers'])==('8%','2','3','3')
    xml=E.fromstring(z.read('Metadata/model_settings.config'))
    objects=[{v.get('key'):v.get('value') for v in o.findall('metadata')} for o in xml.findall('object')]
    overrides={v['name']:{k:v.get(k) for k in keys} for v in objects if 'sparse_infill_density' in v}
    assert overrides
    assert all('m5-' in name for name in overrides)
    assert all(v==keys for v in overrides.values()),overrides
    if expected is None:expected=overrides
    else:assert overrides==expected,stem
  with zipfile.ZipFile(root/(stem+'.zip')) as z:
   p=json.loads(z.read('PRINT-SETTINGS.json'));assert p['sparse_infill_density']=='8%'
   parts=json.loads(z.read('PART-PRINT-SETTINGS.json'));assert set(parts)==set(expected)
   assert all(all(p[k]==v for k,v in keys.items()) for p in parts.values())
  print(stem+': browser/ZIP/desktop retain reinforced hardware and lightweight case profiles')
