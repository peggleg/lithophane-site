"""Check actual Bambu-sliced flush label layers and saved multipart assignments."""
import re,sys,zipfile,xml.etree.ElementTree as ET
from pathlib import Path
root=Path(sys.argv[1] if len(sys.argv)>1 else 'artifacts/pill-colour')
z=zipfile.ZipFile(root/'test-sliced.3mf')
gcode=z.read(next(n for n in z.namelist() if n.endswith('.gcode'))).decode()
tool=None;layer=0;label_layers=set()
for line in gcode.splitlines():
    m=re.match(r'M620 S([01])A',line)
    if m: tool=int(m[1])
    m=re.match(r'; layer num/total_layer_count: (\d+)/',line)
    if m: layer=int(m[1])
    if layer and tool==1 and line in ['; FEATURE: Outer wall','; FEATURE: Inner wall','; FEATURE: Gap infill']:
        label_layers.add(layer)
assert label_layers=={1,2,3},label_layers
print('Native toolpaths print contrasting lettering on exactly layers 1, 2 and 3.')
files=list((root/'desktop-final').glob('*.3mf'))
assert len(files)==2, 'Run desktop checks for both printer sizes first.'
for file in files:
    config=ET.fromstring(zipfile.ZipFile(file).read('Metadata/model_settings.config'))
    labels=[p for p in config.findall('.//part') if any(m.get('key')=='name' and m.get('value','').endswith('-lettering') for m in p.findall('metadata'))]
    assert labels,file
    for label in labels:
        assert any(m.get('key')=='extruder' and m.get('value')=='2' for m in label.findall('metadata')),file
    print(file.name+': desktop retained lettering on filament 2 within the lid object.')
