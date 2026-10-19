"""Read supplied documents and optimize their images without changing the originals."""
from pathlib import Path
import json,re,zipfile,sys,xml.etree.ElementTree as ET
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
SOURCE=Path(sys.argv[1]) if len(sys.argv)>1 else Path.home()/'Desktop'/'wenjian'
NS={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
themes=[('tools','工具与造物',['工具','造物'],'MAKING & INVENTION'),('ritual','信仰与仪式',['信仰','仪式'],'BELIEF & RITUAL'),('cities','城市与聚落',['城市','聚落'],'CITIES & SETTLEMENTS'),('arts','艺术与表达',['艺术','表达'],'ART & EXPRESSION')]
prefixes=['T','R','C','A']
cards=[];stories={};manifest=[]
ritual_names=['远古祭祀','石窟造像','墓葬壁画','图腾石刻','礼器遗存','神庙遗迹']
introductions=[
 '材料被改变，生活也随之改变。从铸造、织造到航海、水利与观测，沿着器物留下的线索，阅读创造如何发生。',
 '石坛、造像与古老的壁画，留下人类面对天地、生死与未知的追问。在共同举行的仪式中，人们寄托愿望、纪念祖先，也寻找彼此相连的精神归属。',
 '城墙划定边界，街巷连接日常，水道与驿站让生活继续运转。以六种空间线索，阅读聚落如何组织人与人的关系。',
 '色彩、文字、声音与纹样，是记忆留下的不同形态。从残片出发，观察表达如何依附于材料，又如何跨越时间。']
subtitles=['文明因创造而开始。','文明寻找精神归属。','文明因聚落而延续。','文明因表达而留存。']
closings=['创造留下痕迹，问题仍在延续。','仪式留下痕迹，追问仍在延续。','城市的轮廓里，仍有生活的回声。','表达留下痕迹，记忆仍在生长。']
material_titles=[['观看表面，','追问过程。'],['凝视形象，','理解寄托。'],['循着边界，','重读日常。'],['从残片中，','辨认表达。']]
material_texts=[
 '接缝、纤维、船板与窑壁，让不同工艺进入同一个观察视野。概念图提出问题；真实的尺寸、检测与出土记录，才是解释的依据。',
 '空间、造像与纹饰，让无形的观念留下可见线索。观看时保留不确定性，不把今天的想象直接当作古人的信念。',
 '从地面建筑到地下管道，聚落的秩序来自多个系统的联系。完整场景是 AI 演绎，真实布局需要遗址测绘和考古资料来印证。',
 '墨迹、刻痕、音律与经纬，都是不同材料上的表达。图中纹样和文字不用于释读或断代，真实解释需要原件与研究记录的支持。']

def optimize(source,destination):
 destination.parent.mkdir(parents=True,exist_ok=True)
 if destination.exists() and destination.stat().st_mtime>=source.stat().st_mtime:return
 with Image.open(source) as im:
  im=im.convert('RGB');im.thumbnail((1920,1920))
  im.save(destination,'WEBP',quality=87,method=6)

for number,(theme,name,title,en) in enumerate(themes,1):
 folder=SOURCE/str(number);doc=next(folder.rglob('*.docx'))
 with zipfile.ZipFile(doc) as z:
  xml=ET.fromstring(z.read('word/document.xml'))
 lines=[''.join(t.text or '' for t in p.findall('.//w:t',NS)).strip() for p in xml.findall('.//w:p',NS)]
 starts=[i for i,line in enumerate(lines) if re.match(r'^\d{2}\s*/',line)]
 if len(starts)!=6:raise ValueError(f'{theme}: expected six records, got {len(starts)}')
 images=sorted(folder.rglob('*.png'));ids=[]
 for i,start in enumerate(starts):
  chunk=lines[start:starts[i+1] if i+1<len(starts) else len(lines)]
  tags=[s.strip() for s in chunk[0].split('/')[1:]]
  record_name=chunk[1]
  if record_name=='竹简文书':record_name='简牍文书'
  ai_line=next((line for line in chunk if line.startswith('AI')),'')
  end=chunk.index(ai_line)
  body=''.join(line for line in chunk[2:end] if line and not line.startswith('参考案例'))
  reference=ai_line.split('参考',1)[-1].strip()
  source_image=next(p for p in images if (p.stem.startswith(f'{i+1:02}') if number!=2 else p.stem==ritual_names[i]))
  generated=number==4 and i==5 and (ROOT/'assets/source/arts-06-textile.png').exists()
  if generated:source_image=ROOT/'assets/source/arts-06-textile.png'
  path=f'assets/images/content/{theme}-{i+1:02}'+('-textile' if generated else '')+'.webp'
  optimize(source_image,ROOT/path)
  record_id=f'{prefixes[number-1]}-{i+1:03}';ids.append(record_id)
  if record_id=='A-002':body=body.replace('竹简','简牍').replace('真实片段','研究线索')
  card={
   'id':record_id,'category':theme,'name':record_name,'tags':tags,
   'summary':body.split('。')[0]+'。',
   'interpretation':[
    {'title':'01 / 主题解读','text':body},
    {'title':'02 / 图像与证据','text':f'本图是围绕“{reference}”这一参考主题的 AI 概念演绎，不是该遗址或文物的现场照片，也不是依据完整考古数据制作的复原。图中结构、纹样及文字不可作为形制、释读或断代的证据；进一步阅读应对照真实资料。'}],
   'imagePath':path,'videoPath':'','reference':reference,
   'source':f'用户提供的《{doc.stem}》及配套概念图；参考主题：{reference}（原文提供，非图像实物对应关系）',
   'ai':{'generated':True,'platform':'ChatGPT Image（本轮补绘）' if generated else '用户提供的 AI 概念素材','label':'AI 概念演绎 · 非实物照片'}
  }
  cards.append(card);manifest.append({'theme':theme,'id':record_id,'file':source_image.name,'output':path,'document':doc.name})
 hero=next(p for p in images if p.stem==('首' if number==2 else '开头横图'))
 ending=next(p for p in images if p.stem==('尾' if number==2 else '结尾横图'))
 hero_path=f'assets/images/content/{theme}-hero.webp';ending_path=f'assets/images/content/{theme}-ending.webp'
 optimize(hero,ROOT/hero_path);optimize(ending,ROOT/ending_path)
 stories[theme]={'id':theme,'number':f'{number:02}','name':name,'title':title,'en':en,'subtitle':subtitles[number-1],'introduction':introductions[number-1],
  'note':'图像为 AI 概念演绎，非真实遗存照片；参考案例与画面不构成实物对应关系。主题顺序和档案编号不代表真实年代。',
  'cardIds':ids,'contactCardIds':[ids[0],ids[1]],'materialCardIds':[ids[0],ids[2],ids[5]],'heroImage':hero_path,'endingImage':ending_path,
  'materialTitle':material_titles[number-1],'materialText':material_texts[number-1],'closing':closings[number-1],
  'nextCategory':themes[number%4][0],'nextName':themes[number%4][1]}

categories=[{'id':theme,'number':f'{i+1:02}','name':name,'en':en,'subtitle':subtitles[i],'description':introductions[i]} for i,(theme,name,title,en) in enumerate(themes)]
feature={'title':'地层回响','videoPath':'','poster':stories['tools']['heroImage'],'source':'专题视频待添加','aiLabel':'视频素材待添加'}
def js(value):return json.dumps(value,ensure_ascii=False,indent=2)
(ROOT/'data/archive.js').write_text('// All themes and records. Reference cases do not identify the AI images.\nexport const categories = '+js(categories)+';\nexport const cards = '+js(cards)+';\nexport const featureVideo = '+js(feature)+';\n',encoding='utf-8')
(ROOT/'data/theme-stories.js').write_text('// Editable per-theme narrative configuration.\nexport const themeStories = '+js(stories)+';\n',encoding='utf-8')
(ROOT/'qa/content-manifest.json').write_text(js(manifest),encoding='utf-8')
print('Imported four themes, 24 records, 8 editorial images. Original files unchanged.')
