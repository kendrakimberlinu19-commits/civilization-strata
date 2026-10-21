import {categories,cards,featureVideo,themeVideos} from './data/archive.js';
import {exhibit} from './data/exhibit.js?v=20261020-dial';
import {createFloatingDeck} from './floating-deck.js?v=20261020-dial-spin';
import {createAmbientSound} from './ambient-sound.js?v=20261022-book-sound';
import {createGestureControl} from './gesture-control.js?v=20261020-gesture-responsive';
import {createLandingEntry} from './landing-entry.js?v=20261021-coins';
import {createThemeStory} from './tools-story.js?v=20261020-photo-reveal';
import {themeStories} from './data/theme-stories.js';
import {createArchiveEntry} from './archive-entry.js?v=20261020-photo-reveal';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const emit=(name,payload)=>window.dispatchEvent(new CustomEvent(`strata:${name}`,{detail:payload}));
const main=document.querySelector('#main'),detail=document.querySelector('#detail'),archive=document.querySelector('#archive-dialog'),project=document.querySelector('#project-dialog'),video=document.querySelector('#video-dialog');
const dialogs=[detail,archive,project,video],origins=new WeakMap();
let gestureControl,landingEntry,audioControl;const modalOrder=[];
main.innerHTML=`<section class="exhibit surface" aria-label="文明地层斜向档案展台"><aside class="exhibit-info" aria-label="当前档案信息"><h1 class="info-theme-heading" aria-label="当前主题"><span class="info-title-line"><span id="info-title-first"></span></span><span class="info-title-line"><span id="info-title-second"></span></span></h1><dl><div><dt>当前主题</dt><dd id="info-theme"></dd></div><div><dt>档案编号</dt><dd id="info-id"></dd></div><div><dt>收录档案</dt><dd id="info-count"></dd></div></dl><p>CIVILIZATION STRATA · 六层线索</p></aside><div id="floating-stage"></div><div class="active-caption"><h1><span id="theme-number"></span><i>/</i><span id="theme-title"></span></h1><button class="open-active">开启档案 ↗</button></div><div class="exhibit-bottom archive-dial"><img class="dial-texture" src="${esc(exhibit.navigationDial.imagePath)}" alt="" aria-hidden="true"><nav class="theme-progress" aria-label="主题轮盘"><svg class="dial-orbit" viewBox="0 0 240 240" aria-hidden="true"><circle class="dial-track" cx="120" cy="120" r="88"/><circle class="dial-progress" cx="120" cy="120" r="88" pathLength="100"/></svg>${categories.map((c,i)=>`<button data-theme="${esc(c.id)}" style="--dial-index:${i};left:${50+37*Math.sin(i*2*Math.PI/categories.length)}%;top:${50-37*Math.cos(i*2*Math.PI/categories.length)}%" aria-label="${c.number} ${esc(c.name)}"><b>${c.number}</b><span>${esc(c.name)}</span></button>`).join('')}</nav><div class="dial-centre"><span class="dial-kicker">地层索引</span><span id="dial-theme"></span><span id="theme-fraction"></span></div><div class="switch-controls"><button class="previous-theme" aria-label="上一份地层档案"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 4-8 8 8 8"/></svg></button><button class="next-theme" aria-label="下一份地层档案"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 4 8 8-8 8"/></svg></button></div></div></section>`;
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
function closeTheme(){if(currentPage?.isOpen)emit('category-close',{categoryId:currentPage.element.dataset.category});currentPage?.close();currentPage=null;setNav('archive');if(location.hash.startsWith('#archive/'))history.replaceState(null,'',location.pathname+location.search+'#exhibit');}
function setNav(value){document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===value))}
function show(dialog,nav){document.querySelectorAll('video').forEach(v=>v.pause());origins.set(dialog,document.activeElement);deck.freeze();document.body.classList.add('reading');if(!dialog.open){dialog.showModal();modalOrder.push(dialog);emit('dialog-open',{id:dialog.id})}gestureControl?.mount(dialog);audioControl?.mount(dialog);setNav(nav);}
function restore(dialog){const index=modalOrder.indexOf(dialog);if(index>=0)modalOrder.splice(index,1);gestureControl?.mount(modalOrder.at(-1)||document.body);audioControl?.mount(modalOrder.at(-1)||document.body);emit('dialog-close',{id:dialog.id});if(!dialogs.some(d=>d.open)){document.body.classList.remove('reading');setNav(currentPage?.isOpen?'archive':'home')}origins.get(dialog)?.focus({preventScroll:true});}
function closeButton(dialog,label){return `<button class="dialog-close" aria-label="${label}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19"/></svg></button>`}
function bindClose(dialog){dialog.querySelector('.dialog-close').onclick=()=>dialog.close();}
function cardMarkup(x){return `<button class="archive-card" data-card="${esc(x.id)}"><div class="card-image"><img src="${esc(x.imagePath)}" alt="${esc(x.name)}" loading="lazy" decoding="async"><span class="card-open">↗</span></div><div class="card-copy"><p class="card-id">${esc(x.id)}</p><h3>${esc(x.name)}</h3><p>${esc(x.summary)}</p><div class="tags">${x.tags.map(t=>`<span>${esc(t)}</span>`).join('')}</div></div></button>`}
function openCategory(id){openTheme(id)}
function openAll(){archive.innerHTML=`${closeButton(archive,'关闭地层档案')}<div class="archive-directory"><p class="eyebrow">THE COMPLETE DEMO ARCHIVE</p><h2 id="archive-title">全部地层档案</h2>${categories.map(c=>`<section><h3>${c.number} / ${esc(c.name)}</h3><div class="directory-grid">${cards.filter(x=>x.category===c.id).map(cardMarkup).join('')}</div></section>`).join('')}</div>`;bindClose(archive);show(archive,'archive');}
function openCard(id){
 const x=cards.find(c=>c.id===id);if(!x)return;const category=categories.find(c=>c.id===x.category);detail.dataset.cardId=id;
 detail.innerHTML=`${closeButton(detail,'关闭详情')}<div class="detail-layout"><figure><img class="detail-main-image" src="${esc(x.imagePath)}" alt="${esc(x.name)}"><figcaption>${esc(x.caption||x.name)}</figcaption>${x.gallery?.length>1?`<nav class="detail-gallery" aria-label="${esc(x.name)}补充图片">${x.gallery.map((path,i)=>`<button data-image="${i}" aria-label="查看图片 ${i+1}" aria-pressed="${i===0}"><img src="${esc(path)}" alt="" loading="lazy"></button>`).join('')}</nav>`:''}</figure><article><p class="eyebrow">${esc(x.id)} / ${esc(category.name)}</p><h2 id="detail-title">${esc(x.name)}</h2><p class="detail-basic">${esc(x.basicInfo||'')}</p><p class="detail-summary">${esc(x.summary)}</p><div class="tags">${x.tags.map(t=>`<span>${esc(t)}</span>`).join('')}</div>${x.interpretation.map(p=>`<section class="interpretation"><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></section>`).join('')}<section class="interpretation"><h3>03 / 观察线索</h3><p>${esc(x.observation)}</p></section><section class="interpretation"><h3>04 / 理解边界</h3><p>${esc(x.limitation)}</p></section><details class="source"><summary>查看资料来源</summary><p>${esc(x.source)}</p>${(x.sourceLinks||[]).map(r=>`<p><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.id)} · ${esc(r.title)} ↗</a></p>`).join('')}<p>${esc(x.imageCredit||'')}</p></details></article></div>`;
 detail.querySelectorAll('[data-image]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.image);detail.querySelector('.detail-main-image').src=x.gallery[i];detail.querySelector('figcaption').textContent=i===0?x.caption:`${x.galleryCaptions?.[x.gallery[i]]||x.name} · ${i+1} / ${x.gallery.length}`;detail.querySelectorAll('[data-image]').forEach(t=>t.setAttribute('aria-pressed',String(t===b)))});
 bindClose(detail);show(detail,'archive');emit('card-select',{cardId:id,categoryId:x.category});
}
archive.addEventListener('click',e=>{const b=e.target.closest('[data-card]');if(b)openCard(b.dataset.card)});
function openProject(){project.innerHTML=`${closeButton(project,'关闭项目说明')}<article class="project-copy"><p class="eyebrow">ABOUT CIVILIZATION STRATA</p><h2 id="project-title">六层线索，<br>二十四份档案。</h2><p>沿着稻谷、城址、刻辞、陶范、壁画与码头，阅读过去的人如何生活、协作并与远方相遇。</p><section><h3>如何探索</h3><p>拖动档案袋，或使用左右箭头及主题轮盘切换。点击档案袋进入主题，向下阅读并打开遗存详情；关闭详情后回到原来的阅读位置。也可使用触摸、键盘和手势探索。</p></section><section><h3>资料与阅读</h3><p>六个主题各收录四份档案，事实说明与策展解读分开组织。主题顺序是一种阅读线索，不代表真实地层年代。图解用于理解关系与工艺，具体年代和地点以分件资料为准；资料来源可在详情中展开查看。</p></section><section><h3>声音与影像</h3><p>每层均设有独立短片，可在内页播放或集中浏览。声音默认开启，首次点击或按键后启动，可随时静音或调节音量。</p><button class="video-trigger">▷ 浏览六层短片</button></section></article>`;bindClose(project);project.querySelector('.video-trigger').onclick=()=>openVideo();show(project,'project');}

function openVideo(id){
 const chosen=themeVideos.find(v=>v.id===id)||themeVideos[0];
 video.querySelectorAll('video').forEach(v=>v.pause());
 video.innerHTML=`${closeButton(video,'关闭视频面板')}<div class="video-content"><p class="eyebrow">STRATUM ${esc(chosen.number)} / ${esc(categories.find(c=>c.id===chosen.id).name)}</p><h2 id="video-title">${esc(chosen.title)}</h2><p>${esc(chosen.description)}</p><video controls playsinline preload="metadata" poster="${esc(chosen.poster)}" src="${esc(chosen.videoPath)}"></video><nav class="video-theme-list" aria-label="选择主题短片">${themeVideos.map(v=>`<button data-video-theme="${v.id}" aria-pressed="${chosen.id===v.id}">${v.number} ${esc(v.title)}</button>`).join('')}</nav></div>`;
 video.querySelectorAll('[data-video-theme]').forEach(b=>b.onclick=()=>openVideo(b.dataset.videoTheme));bindClose(video);if(!video.open)show(video,'project');emit('video-open',{available:true,categoryId:chosen.id});
}
for(const d of dialogs){d.addEventListener('close',()=>{d.querySelector('video')?.pause();restore(d);if(d===detail)emit('detail-close',{cardId:d.dataset.cardId})});d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}});}
document.querySelector('.previous-theme').onclick=()=>deck.step(-1);document.querySelector('.next-theme').onclick=()=>deck.step(1);document.querySelector('.open-active').onclick=()=>deck.open();document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>deck.select(b.dataset.theme));
document.querySelector('[data-nav="home"]').onclick=()=>{dialogs.forEach(d=>d.open&&d.close());currentPage?.close();currentPage=null;if(location.hash)history.pushState(null,'',location.pathname+location.search);setNav('home');landingEntry.open()};document.querySelector('[data-nav="archive"]').onclick=()=>openCategory(deck.categoryId);document.querySelector('[data-nav="project"]').onclick=openProject;
document.querySelector('.brand').onclick=e=>{e.preventDefault();document.querySelector('[data-nav="home"]').click()};
audioControl=createAmbientSound(document.querySelector('.sound-toggle'),document.querySelector('.sound-volume'));emit('home-enter',{});


function applyRoute(){document.body.classList.remove('landing-pending');const candidate=location.hash.match(/^#archive\/([a-z-]+)$/)?.[1];const id=categories.some(c=>c.id===candidate)?candidate:null;if(id){if(landingEntry?.isOpen)landingEntry.dismiss();openTheme(id,{animate:false,updateHistory:false});return}if(currentPage?.isOpen){currentPage.close();currentPage=null}if(location.hash==='#exhibit'){landingEntry?.dismiss();setNav('archive')}else{landingEntry?.open();setNav('home')}}
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
