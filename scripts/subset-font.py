"""Build the published glyph subset; run after changing Korean page copy.

Requires fonttools[woff]. The original font's reserved name is retained only
in copyright/license records; the modified font is named Sookie Sans.
"""
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parent.parent
source = root / 'node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2'
text = ''.join(p.read_text() for p in (root / 'src').rglob('*')
               if p.suffix in {'.tsx', '.ts', '.css', '.json'} and 'wasm' not in p.parts)
options = subset.Options()
options.flavor = 'woff2'
options.name_IDs = ['*']
font = TTFont(source)
worker = subset.Subsetter(options=options)
worker.populate(unicodes=sorted(set(map(ord, text)) | set(range(32, 127))))
worker.subset(font)
renames = {1:'Sookie Sans', 3:'Sookie Sans 2026', 4:'Sookie Sans',
           6:'SookieSans', 16:'Sookie Sans', 17:'Regular', 25:'SookieSans'}
for record in font['name'].names:
    if record.nameID in renames:
        record.string = renames[record.nameID].encode(record.getEncoding())
target = root / 'public/fonts/sookie-sans.woff2'
font.save(target)
print(f'Font subset: {target.stat().st_size:,} bytes')
