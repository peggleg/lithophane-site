"""Linux/X11 desktop regression check (python-xlib and Pillow required).
Run test:bambu-import first to generate fixtures. Start an isolated Bambu Studio
GUI with a test --datadir, complete setup and leave its Prepare view open.
This script opens/saves fixtures in that test instance; do not use a work session.
Unlike the CLI check, saving through the GUI exercises preset inheritance.
"""
import argparse
import json
import os
from pathlib import Path
import time
import zipfile
from Xlib import X, XK, display
from Xlib.ext import xtest
from PIL import Image

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--fixtures', default='artifacts/bambu-import')
parser.add_argument('--output', default='artifacts/bambu-desktop')
parser.add_argument('--kinds', nargs='+', default=['lithophane','fan','keyring','nameplate','clicker','desk','future-tool'])
args = parser.parse_args()
source, output = Path(args.fixtures).resolve(), Path(args.output).resolve()
output.mkdir(parents=True, exist_ok=True)
d = display.Display(os.environ.get('DISPLAY', ':99'))

def key(name, down=True):
    xtest.fake_input(d, X.KeyPress if down else X.KeyRelease,
                     d.keysym_to_keycode(XK.string_to_keysym(name)))
    d.sync()

def hotkey(*names):
    for name in names: key(name)
    for name in reversed(names): key(name, False)

def text(value):
    for char in str(value):
        assert ord(char) < 128, 'The X11 test driver requires ASCII artifact paths'
        code = d.keysym_to_keycode(ord(char))
        shifted = d.keycode_to_keysym(code, 0) != ord(char)
        if shifted: key('Shift_L')
        xtest.fake_input(d, X.KeyPress, code)
        xtest.fake_input(d, X.KeyRelease, code)
        if shifted: key('Shift_L', False)
    d.sync()

def focus_canvas():
    windows = [w for w in d.screen().root.query_tree().children
               if w.get_attributes().map_state == X.IsViewable]
    window = max(windows, key=lambda w: w.get_geometry().width)
    g = window.get_geometry()
    xtest.fake_input(d, X.MotionNotify, x=g.x + int(g.width * .7),
                     y=g.y + int(g.height * .25))
    xtest.fake_input(d, X.ButtonPress, 1)
    xtest.fake_input(d, X.ButtonRelease, 1)
    d.sync()

def wait_ready(title):
    deadline = time.monotonic() + 90
    stable = 0
    while time.monotonic() < deadline:
        windows = [w for w in d.screen().root.query_tree().children
                   if w.get_attributes().map_state == X.IsViewable]
        if len(windows) == 1 and windows[0].get_wm_name() == title:
            stable += 1
            if stable >= 5: return
        else:
            stable = 0
        time.sleep(.2)
    screenshot(output / 'not-ready.png')
    raise RuntimeError(f'Bambu did not finish opening {title}; inspect not-ready.png')

def screenshot(file):
    root = d.screen().root
    g = root.get_geometry()
    raw = root.get_image(0, 0, g.width, g.height, X.ZPixmap, 0xffffffff)
    Image.frombytes('RGB', (g.width, g.height), raw.data, 'raw', 'BGRX').save(file)

def settings(file):
    with zipfile.ZipFile(file) as archive:
        return json.loads(archive.read('Metadata/project_settings.config'))

keys = ['sparse_infill_density', 'sparse_infill_pattern', 'wall_loops',
        'top_shell_layers', 'bottom_shell_layers',
        'top_shell_thickness', 'bottom_shell_thickness']
report = []
for kind in args.kinds:
    incoming, saved = source / (kind + '.3mf'), output / (kind + '.3mf')
    expected = settings(incoming)
    saved.unlink(missing_ok=True)
    focus_canvas()
    hotkey('Control_L', 'o')
    time.sleep(.7)
    hotkey('Control_L', 'l')
    text(incoming)
    hotkey('Return')
    time.sleep(1)
    wait_ready(kind)
    screenshot(output / (kind + '-opened.png'))
    focus_canvas()
    hotkey('Control_L', 'Shift_L', 's')
    time.sleep(.7)
    hotkey('Control_L', 'a')
    text(saved)
    hotkey('Return')
    deadline = time.monotonic() + 15
    while True:
        try:
            actual = settings(saved)
            break
        except (FileNotFoundError, zipfile.BadZipFile):
            if time.monotonic() > deadline:
                screenshot(output / (kind + '-failed.png'))
                raise RuntimeError(f'{kind}: desktop did not save; inspect the screenshot for a dialog')
            time.sleep(.2)
    for field in keys:
        assert actual[field] == expected[field], f'{kind}: desktop restored {field}={actual[field]} (expected {expected[field]})'
    report.append({'kind': kind, 'desktop_settings': {k: actual[k] for k in keys}})
    print(f'{kind}: desktop Open Project / Save Project retained all agreed values', flush=True)
(output / 'results.json').write_text(json.dumps(report, indent=2) + '\n')
