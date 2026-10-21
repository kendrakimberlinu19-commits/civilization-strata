import {categories,cards,featureVideo} from './data/archive.js';
import {exhibit} from './data/exhibit.js?v=20261020-dial';
import {createFloatingDeck} from './floating-deck.js?v=20261020-dial-spin';
import {createAmbientSound} from './ambient-sound.js';
import {createGestureControl} from './gesture-control.js?v=20261020-gesture-responsive';
import {createLandingEntry} from './landing-entry.js?v=20261021-coins';
import {createThemeStory} from './tools-story.js?v=20261020-photo-reveal';
import {themeStories} from './data/theme-stories.js';
import {createArchiveEntry} from './archive-entry.js?v=20261020-photo-reveal';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const emit=(name,payload)=>window.dispatchEvent(new CustomEvent(`strata:${name}`,{detail:payload}));
const main=document.querySelector('#main'),detail=document.querySelector('#detail'),archive=document.querySelector('#archive-dialog'),project=document.querySelector('#project-dialog'),video=document.querySelector('#video-dialog');
const dialogs=[detail,archive,project,video],origins=new WeakMap();
let gestureControl,landingEntry;const modalOrder=[];
main.innerHTML=`<section class="exhibit surface" aria-label="文明地层斜向档案展台"><aside class="exhibit-info" aria-label="当前档案信息"><h1 class="info-theme-heading" aria-label="当前主题"><span class="info-title-line"><span id="info-title-first"></span></span><span class="info-title-line"><span id="info-title-second"></span></span></h1><dl><div><dt>当前主题</dt><dd id="info-theme"></dd></div><div><dt>档案编号</dt><dd id="info-id"></dd></div><div><dt>收录档案</dt><dd id="info-count"></dd></div></dl><p>CIVILIZATION STRATA · AI 演绎</p></aside><div id="floating-stage"></div><div class="active-caption"><h1><span id="theme-number"></span><i>/</i><span id="theme-title"></span></h1><button class="open-active">开启档案 ↗</button></div><div class="exhibit-bottom archive-dial"><img class="dial-texture" src="${esc(exhibit.navigationDial.imagePath)}" alt="" aria-hidden="true"><nav class="theme-progress" aria-label="主题轮盘"><svg class="dial-orbit" viewBox="0 0 240 240" aria-hidden="true"><circle class="dial-track" cx="120" cy="120" r="88"/><circle class="dial-progress" cx="120" cy="120" r="88" pathLength="100"/></svg>${categories.map((c,i)=>`<button data-theme="${esc(c.id)}" style="--dial-index:${i}" aria-label="${c.number} ${esc(c.name)}"><b>${c.number}</b><span>${esc(c.name)}</span></button>`).join('')}</nav><div class="dial-centre"><span class="dial-kicker">地层索引</span><span id="dial-theme"></span><span id="theme-fraction"></span></div><div class="switch-controls"><button class="previous-theme" aria-label="上一份地层档案"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 4-8 8 8 8"/></svg></button><button class="next-theme" aria-label="下一份地层档案"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 4 8 8-8 8"/></svg></button></div></div></section>`;
function updateTheme(c,index){document.querySelector('#dial-theme').textContent=c.name;document.querySelector('#info-title-first').textContent=c.name.slice(0,2);document.querySelector('#info-title-second').textContent=c.name.slice(2);document.querySelector('.info-theme-heading').setAttribute('aria-label',c.name);document.querySelector('#info-theme').textContent=c.name;document.querySelector('#info-id').textContent=`STRATUM ${c.number}`;document.querySelector('#info-count').textContent=`${String(cards.filter(x=>x.category===c.id).length).padStart(2,'0')} 份`;document.querySelector('#theme-number').textContent=c.number;document.querySelector('#theme-title').textContent=c.name;document.querySelector('#theme-fraction').textContent=`${c.number} / ${String(categories.length).padStart(2,'0')}`;document.querySelectorAll('[data-theme]').forEach(b=>{if(b.dataset.theme===c.id)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});document.querySelector('.previous-theme').disabled=index===0;document.querySelector('.next-theme').disabled=index===categories.length-1;}
const deck=createFloatingDeck({container:document.querySelector('#floating-stage'),categories,esc,onChange:updateTheme,onEnter:openCategory,emit});
const pages=new Map();let currentPage=null;
const archiveEntry=createArchiveEntry({emit});
function openTheme(id,{animate=true,updateHistory=true}={}){
 const copy=themeStories[id];if(!copy||archiveEntry.running)return;
 if(landingEntry?.isOpen)landingEntry.dismiss();
 if(currentPage?.isOpen&&currentPage.element.dataset.category===id)return;
 if(currentPage?.isOpen)currentPage.close();
 if(!pages.has(id))pages.set(id,createThemeStory({copy,cards,esc,onCard:openCard,onVideo:openVideo,onBack:closeTheme,onAll:openAll,onNext:next=>{closeTheme();deck.select(next,true);openTheme(next,{animate:false})},emit}));
 const page=pages.get(id);currentPage=page;
 const prepare=()=>{deck.select(id,true);deck.freeze();page.open();setNav('archive');if(updateHistory&&location.hash!==`#archive/${id}`)history.pushState({strata:id},'',`#archive/${id}`)};
 if(animate)archiveEntry.run({source:document.querySelector(`[data-folder="${id}"]`),categoryId:id,label:copy.name,prepare,target:()=>page.element}).catch(error=>{console.error('Archive entry:',error);if(!page.isOpen)prepare()});else prepare();
}
function closeTheme(){currentPage?.close();currentPage=null;setNav('archive');if(location.hash.startsWith('#archive/'))history.replaceState(null,'',location.pathname+location.search+'#exhibit');}
function setNav(value){document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===value))}
function show(dialog,nav){origins.set(dialog,document.activeElement);deck.freeze();document.body.classList.add('reading');if(!dialog.open){dialog.showModal();modalOrder.push(dialog)}gestureControl?.mount(dialog);setNav(nav);}
function restore(dialog){const index=modalOrder.indexOf(dialog);if(index>=0)modalOrder.splice(index,1);gestureControl?.mount(modalOrder.at(-1)||document.body);if(!dialogs.some(d=>d.open)){document.body.classList.remove('reading');setNav(currentPage?.isOpen?'archive':'home')}origins.get(dialog)?.focus({preventScroll:true});}
function closeButton(dialog,label){return `<button class="dialog-close" aria-label="${label}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19"/></svg></button>`}
function bindClose(dialog){dialog.querySelector('.dialog-close').onclick=()=>dialog.close();}
function cardMarkup(x){return `<button class="archive-card" data-card="${esc(x.id)}"><div class="card-image"><img src="${esc(x.imagePath)}" alt="${esc(x.name)} · ${esc(x.ai.label)}" loading="lazy" decoding="async"><span class="ai-badge">${esc(x.ai.label)}</span><span class="card-open">↗</span></div><div class="card-copy"><p class="card-id">${esc(x.id)}</p><h3>${esc(x.name)}</h3><p>${esc(x.summary)}</p><div class="tags">${x.tags.map(t=>`<span>${esc(t)}</span>`).join('')}</div></div></button>`}
function openCategory(id){openTheme(id)}
function openAll(){archive.innerHTML=`${closeButton(archive,'关闭地层档案')}<div class="archive-directory"><p class="eyebrow">THE COMPLETE DEMO ARCHIVE</p><h2 id="archive-title">全部地层档案</h2>${categories.map(c=>`<section><h3>${c.number} / ${esc(c.name)}</h3><div class="directory-grid">${cards.filter(x=>x.category===c.id).map(cardMarkup).join('')}</div></section>`).join('')}</div>`;bindClose(archive);show(archive,'archive');}
function openCard(id){const x=cards.find(c=>c.id===id);if(!x)return;const category=categories.find(c=>c.id===x.category);detail.dataset.cardId=id;detail.innerHTML=`${closeButton(detail,'关闭详情')}<div class="detail-layout"><figure><img src="${esc(x.imagePath)}" alt="${esc(x.name)} AI 演绎大图"><figcaption>${esc(x.ai.label)} / ${esc(x.ai.platform)}</figcaption></figure><article><p class="eyebrow">${esc(x.id)} / ${esc(category.name)}</p><h2 id="detail-title">${esc(x.name)}</h2><p class="detail-summary">${esc(x.summary)}</p><div class="tags">${x.tags.map(t=>`<span>${esc(t)}</span>`).join('')}</div>${x.interpretation.map(p=>`<section class="interpretation"><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></section>`).join('')}<div class="source"><span>AI 概念演绎 · 非实物照片</span><p>来源：${esc(x.source)}</p><p>图像：${esc(x.ai.platform)}。${x.ai.generated?'AI 生成，不作为真实文物或遗址的证据。':'非 AI 素材。'}</p></div>${x.videoPath?`<video controls playsinline preload="metadata" src="${esc(x.videoPath)}"></video>`:''}</article></div>`;bindClose(detail);show(detail,'archive');emit('card-select',{cardId:id,categoryId:x.category});}
archive.addEventListener('click',e=>{const b=e.target.closest('[data-card]');if(b)openCard(b.dataset.card)});
function openProject(){project.innerHTML=`${closeButton(project,'关闭项目说明')}<article class="project-copy"><p class="eyebrow">ABOUT CIVILIZATION STRATA</p><h2 id="project-title">把文明的碎片，<br>归入时间的纹理。</h2><p>《文明地层 · 遗迹档案站》以石质档案套组织四个主题，让器物、信仰、聚落与表达成为阅读文明的入口。</p><section><h3>如何探索</h3><p>左右拖动，或使用箭头及底部主题进度切换。点击档案套开启主题档案，再选择遗存阅读大图和二级解读。关闭详情后回到原来的浏览位置。</p></section><section><h3>资料与图像</h3><p>当前 ${cards.length} 份档案来自用户提供的四组主题文案与 AI 素材。页面列出的遗址、器物仅作为参考案例，不意味着图像准确对应实物或现场。原始石质档案袋由用户提供，经过 ChatGPT Image 透明背景处理；图像为概念演绎。主题次序不代表真实年代或地下深度。</p></section><section><h3>声音与影像</h3><p>声音开关播放轻微合成环境音，默认关闭。专题影像《地层回响》保留独立入口。</p><button class="video-trigger">▷ 地层回响 · 待添加</button></section></article>`;bindClose(project);project.querySelector('.video-trigger').onclick=openVideo;show(project,'project');}
function openVideo(){video.innerHTML=`${closeButton(video,'关闭视频面板')}<div class="video-content"><p class="eyebrow">AN ECHO THROUGH TIME</p><h2 id="video-title">地层回响</h2>${featureVideo.videoPath?`<video controls playsinline preload="metadata" poster="${esc(featureVideo.poster)}" src="${esc(featureVideo.videoPath)}"></video>`:`<div class="video-empty"><span>▷</span><h3>专题视频待添加</h3><p>目前尚未提供视频文件。</p></div>`}</div>`;bindClose(video);show(video,'project');emit('video-open',{available:!!featureVideo.videoPath});}
for(const d of dialogs){d.addEventListener('close',()=>{d.querySelector('video')?.pause();restore(d);if(d===detail)emit('detail-close',{cardId:d.dataset.cardId})});d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}});}
document.querySelector('.previous-theme').onclick=()=>deck.step(-1);document.querySelector('.next-theme').onclick=()=>deck.step(1);document.querySelector('.open-active').onclick=()=>deck.open();document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>deck.select(b.dataset.theme));
document.querySelector('[data-nav="home"]').onclick=()=>{dialogs.forEach(d=>d.open&&d.close());currentPage?.close();currentPage=null;if(location.hash)history.pushState(null,'',location.pathname+location.search);setNav('home');landingEntry.open()};document.querySelector('[data-nav="archive"]').onclick=()=>openCategory(deck.categoryId);document.querySelector('[data-nav="project"]').onclick=openProject;
document.querySelector('.brand').onclick=e=>{e.preventDefault();document.querySelector('[data-nav="home"]').click()};
createAmbientSound(document.querySelector('.sound-toggle'),document.querySelector('.sound-volume'));emit('home-enter',{});


function applyRoute(){document.body.classList.remove('landing-pending');const id=location.hash.match(/^#archive\/(tools|ritual|cities|arts)$/)?.[1];if(id){if(landingEntry?.isOpen)landingEntry.dismiss();openTheme(id,{animate:false,updateHistory:false});return}if(currentPage?.isOpen){currentPage.close();currentPage=null}if(location.hash==='#exhibit'){landingEntry?.dismiss();setNav('archive')}else{landingEntry?.open();setNav('home')}}
window.addEventListener('popstate',applyRoute);
gestureControl=createGestureControl({context:()=>archiveEntry.running||landingEntry?.isOpen?'busy':dialogs.some(d=>d.open)?'dialog':currentPage?.isOpen?'story':'deck',onAction:action=>{
 if(archiveEntry.running||landingEntry?.isOpen)return;
 if(action==='back'){const top=modalOrder.at(-1);if(top)top.close();else if(currentPage?.isOpen)closeTheme();return}
 if(action==='scroll-down'||action==='scroll-up'){
  const reader=modalOrder.at(-1)||(currentPage?.isOpen?currentPage.element:null);
  if(reader)reader.scrollBy({top:(action==='scroll-down'?1:-1)*reader.clientHeight*.65,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  return;
 }
 if(currentPage?.isOpen||dialogs.some(d=>d.open))return;
 if(action==='open')deck.open();else if(action==='next')deck.step(1);else if(action==='previous')deck.step(-1);
}});
landingEntry=createLandingEntry({categories,cards,esc,emit,onOpen(){deck.freeze();gestureControl.stop();},onPrepare(){deck.freeze();},onEntered(){if(location.hash!=='#exhibit')history.pushState(null,'',location.pathname+location.search+'#exhibit');setNav('archive')}});
applyRoute();
