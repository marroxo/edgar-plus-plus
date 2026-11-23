from argparse import ArgumentParser
from io import BytesIO
from pathlib import Path
from PIL import Image, ImageDraw
import json
import zipfile

root = Path(__file__).resolve().parent
source = root / 'firefox'
manifest = json.loads((source / 'manifest.json').read_text(encoding='utf-8-sig'))
parser = ArgumentParser()
parser.add_argument('--version', default=manifest['version'])
args = parser.parse_args()
manifest['version'] = args.version
manifest['manifest_version'] = 3
manifest['minimum_chrome_version'] = '122'
manifest.pop('browser_specific_settings')
manifest['action'] = manifest.pop('browser_action')
manifest['icons'] = {size: f'icon-{size}.png' for size in (16, 32, 48, 128)}
manifest['action']['default_icon'] = {size: manifest['icons'][size] for size in (16, 32)}
manifest['background'] = {'service_worker': 'background.js'}
manifest['host_permissions'] = [p for p in manifest['permissions'] if '://' in p]
manifest['permissions'] = [p for p in manifest['permissions'] if '://' not in p]
manifest['web_accessible_resources'] = [{
    'resources': manifest['web_accessible_resources'],
    'matches': ['https://edgar.fer.hr/*'],
}]
# Chrome's asynchronous message reply uses sendResponse explicitly.
background = (source / 'background.js').read_text(encoding='utf-8')
background = background.replace(
    'browser.runtime.onMessage.addListener(async (msg, sender) => {',
    'async function handleMessage(msg, sender) {',
    1,
)
boundary = '\n});\nbrowser.storage.onChanged'
if boundary not in background:
    raise ValueError('Cannot locate background message listener')
background = background.replace(boundary, '''
}
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse, error => {
    sendResponse({ok:false, message:error.message});
  });
  return true;
});
browser.storage.onChanged''', 1)

def icon_png(size):
    scale = 8
    icon = Image.new('RGBA', (48 * scale, 48 * scale))
    draw = ImageDraw.Draw(icon)
    draw.rounded_rectangle((scale, scale, 47 * scale, 47 * scale), 11 * scale, fill='#392430')
    for paths, color, width in [
        ([(16, 12, 8, 19, 16, 26), (32, 12, 40, 19, 32, 26), (27, 10, 21, 28)], '#f7cedd', 24),
        ([(12, 36, 22, 36), (17, 31, 17, 41), (26, 36, 36, 36), (31, 31, 31, 41)], '#e897b3', 21),
    ]:
        for coords in paths:
            draw.line(tuple(n * scale for n in coords), fill=color, width=width, joint='curve')
    data = BytesIO()
    icon.resize((size, size), Image.Resampling.LANCZOS).save(data, format='PNG')
    return data.getvalue()


out = root / 'edgar-plus-plus-chrome.zip'
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as bundle:
    for file in sorted(source.iterdir()):
        if not file.is_file() or file.name == 'manifest.json':
            continue
        if file.name in {'content.js', 'background.js', 'popup.js'}:
            script = background if file.name == 'background.js' else file.read_text(encoding='utf-8-sig')
            bundle.writestr(file.name, 'const browser = chrome;\n' + script)
        else:
            bundle.write(file, file.name)
    for size, name in manifest['icons'].items():
        bundle.writestr(name, icon_png(size))
    bundle.writestr('manifest.json', json.dumps(manifest, indent=2))
print(out)
