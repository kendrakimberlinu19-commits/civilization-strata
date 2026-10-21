"""Build local WOFF2 subsets; requires fonttools[woff] and brotli at build time only.

Official full masters live in qa/font-masters and qa/font-sans, not the release.
Rebuild after adding substantial Chinese copy. Uncovered glyphs use the CSS fallback.
"""
from pathlib import Path
import sys,json,hashlib,shutil
root=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root/'qa/font-build-lib'))
from fontTools.ttLib import TTFont
from fontTools import subset

files=list(root.glob('*.js'))+list((root/'data').glob('*.js'))+[root/'index.html']
chars=set(''.join(p.read_text(encoding='utf-8-sig') for p in files))
codes={ord(c) for c in chars}|set(range(32,256))|set(range(0x3000,0x3040))|set(range(0xff00,0xfff0))
out=root/'assets/fonts';out.mkdir(exist_ok=True)
report=[]
for role,path,license in [('serif','qa/font-masters/serif.woff2','qa/font-masters/serif-LICENSE.txt'),('sans','qa/font-sans/sans.woff2','qa/font-sans/LICENSE.txt')]:
    font=TTFont(root/path)
    supported=set().union(*(t.cmap.keys() for t in font['cmap'].tables if t.isUnicode()))
    options=subset.Options();options.flavor='woff2';options.name_IDs=['*'];options.name_languages=['*']
    sub=subset.Subsetter(options=options);sub.populate(unicodes=codes&supported);sub.subset(font)
    family='Strata Exhibition '+role.title()
    # Source is reserved under OFL; give this subset its own derivative font name.
    for name in font['name'].names:
        if name.nameID in [1,3,4,6,16,18,20,21,25] or name.nameID>=256:
            original=name.toUnicode()
            if name.nameID in [1,4,16]:new=family
            elif name.nameID==6:new='StrataExhibition'+role.title()+'VF'
            elif 'Source' in original:new=original.replace('Source','Strata')
            else:continue
            name.string=new.encode(name.getEncoding(),errors='replace')
    dest=out/f'strata-{role}-vf.woff2';font.flavor='woff2';font.save(dest)
    shutil.copy2(root/license,out/f'{role}-OFL.txt')
    report.append({'font':dest.name,'bytes':dest.stat().st_size,'glyphCoverage':len(codes&supported),'masterSha256':hashlib.sha256((root/path).read_bytes()).hexdigest()})
(root/'qa/font-subsets.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report))
