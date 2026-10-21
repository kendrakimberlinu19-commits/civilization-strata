export function createThemeStory({copy,cards,esc,onCard,onVideo,onBack,onNext,onAll,emit}) {
 const selected=copy.cardIds.map(id=>cards.find(c=>c.id===id)).filter(Boolean);
 const contact=copy.contactCardIds.map(id=>selected.find(c=>c.id===id)).filter(Boolean);
 const material=copy.materialCardIds.map(id=>selected.find(c=>c.id===id)).filter(Boolean);
 const page=document.createElement('section');
 page.className='tools-story';page.hidden=true;page.tabIndex=-1;
 page.setAttribute('aria-label',`${copy.name}主题长卷`);
 page.dataset.category=copy.id;
 const arrow='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';
 page.innerHTML=`
  <header class="story-top"><button class="story-back" aria-label="返回石质档案展台"><span aria-hidden="true">←</span> 返回档案展台</button><span>文明地层 / STRATUM ${esc(copy.number)}</span><button class="story-menu-toggle" aria-expanded="false" aria-controls="story-menu">目录 <span aria-hidden="true">＋</span></button></header>
  <nav class="story-menu" id="story-menu" aria-label="内页目录" hidden><button data-jump="story-entry">地层入口</button><button data-jump="story-records">遗存档案</button><button data-jump="story-material">材料阅读</button><button data-story-all>全部地层档案</button><button data-story-video>本层短片</button></nav>
  <div class="story-reader-progress" aria-hidden="true"><span></span></div>
  <section class="story-hero" id="story-entry" aria-labelledby="tools-page-title">
   <div class="story-hero-pin">
    <div class="story-hero-media"><img src="${esc(copy.heroImage)}" alt="${esc(copy.name)}主题场景" fetchpriority="high"><div class="story-hero-shade"></div></div>
    <h1 id="tools-page-title"><span class="story-word-first"><span class="story-hero-word-text">${esc(copy.title[0])}</span></span><span class="story-word-second"><span class="story-hero-word-text">${esc(copy.title[1])}</span></span></h1>
    <nav class="story-hero-nav" aria-label="主题章节"><button data-jump="story-intro">进入主题 ${arrow}</button><button data-jump="story-records">遗存档案</button><button data-jump="story-material">材料阅读</button><span>${esc(copy.en)}</span></nav>
    <div class="story-hero-bottom"><span>${esc(copy.location)}</span><button data-jump="story-intro">向下阅读 <span aria-hidden="true">↓</span></button></div>
   </div>
  </section>
  <section class="story-intro story-section" id="story-intro" aria-labelledby="story-intro-title">
   <h2 id="story-intro-title">${esc(copy.subtitle).replace('，','，<br>')}</h2>
   <div class="story-intro-copy"><p>${esc(copy.introduction)}</p><p class="story-note">${esc(copy.note)}</p></div>
   <div class="story-contact-sheet">${contact.map((c,i)=>`<figure><button class="story-contact-image" data-story-card="${esc(c.id)}" aria-label="阅读${esc(c.name)}详情"><img src="${esc(c.imagePath)}" alt="${esc(c.name)}" loading="lazy" decoding="async"><span class="story-hover-label"><span class="story-hover-name">${esc(c.name)}</span><small>${esc(c.id)} · 阅读档案 ${arrow}</small></span></button><figcaption><span>${esc(c.id)}</span><span>${esc(c.tags[0])}</span></figcaption></figure>`).join('')}</div>
  </section>
  <section class="story-records story-section" id="story-records" aria-labelledby="story-records-title">
   <div class="story-section-heading"><h2 id="story-records-title">遗存档案</h2><p>${String(selected.length).padStart(2,'0')} 份档案 / 点击图像阅读证据与解读</p></div>
   <div class="story-timeline"><div class="story-axis" aria-hidden="true"><span></span></div>${selected.map((c,i)=>`<article class="story-record" data-story-record="${esc(c.id)}"><div class="story-record-marker"><span>${esc(c.id)}</span><i aria-hidden="true"></i></div><button class="story-record-image" data-story-card="${esc(c.id)}" aria-label="阅读${esc(c.name)}详情"><span class="story-record-reveal"><img src="${esc(c.imagePath)}" alt="${esc(c.name)}" loading="lazy" decoding="async"></span><span class="story-hover-label" aria-hidden="true"><span class="story-hover-name">${esc(c.name)}</span><small>${esc(c.id)} · 阅读档案 ${arrow}</small></span></button><div class="story-record-copy"><p>${esc(c.tags.join(' / '))}</p><h3><button data-story-card="${esc(c.id)}">${esc(c.name)} ${arrow}</button></h3><p>${esc(c.summary)}</p><span class="story-note">${esc(c.basicInfo)}</span></div></article>`).join('')}</div>
  </section>
  <section class="story-material story-section" id="story-material" aria-labelledby="story-material-title">
   <div class="story-material-heading"><h2 id="story-material-title">${copy.materialTitle.map(t=>esc(t).replace('，','，<br>')).join('<br>')}</h2><p>${esc(copy.materialText)}</p></div>
   <div class="story-stack diagram-stack"><div class="story-stack-pin"><figure class="story-stack-layer"><img src="${esc(copy.diagramImage)}" alt="${esc(copy.name)}关系与方法图解" loading="lazy" decoding="async"><figcaption><span>关系与方法</span><span>图解辅助阅读 · 不按比例</span></figcaption></figure><div class="story-stack-label" aria-hidden="true">MATERIAL STUDIES <span>01 / 01</span></div></div></div>
  </section>
  <section class="story-film story-section" id="story-film"><p class="eyebrow">STRATUM ${esc(copy.number)} / FILM</p><h2>${esc(copy.videoTitle)}</h2><p>${esc(copy.description)}</p><video controls playsinline preload="none" poster="${esc(copy.heroImage)}" src="${esc(copy.videoPath)}" aria-label="${esc(copy.videoTitle)}"></video></section><section class="story-closing-image"><img src="${esc(copy.endingImage)}" alt="${esc(copy.name)}尾章" loading="lazy" decoding="async"></section><section class="story-outro story-section"><p>${esc(copy.closing)}</p><div class="story-outro-links"><button data-story-video>本层短片 <span>${esc(copy.videoTitle)}</span> ${arrow}</button><button data-story-next>下一地层 · ${esc(copy.nextName)} ${arrow}</button></div><footer><span>文明地层 · 资料与解读</span><button data-jump="story-entry">返回顶部 ↑</button></footer><div class="story-end-word" aria-hidden="true" style="background-image:url('${esc(copy.endingImage)}')">${copy.title.map(esc).join('')}</div></section>`.replace(/(id|aria-labelledby|aria-controls)="([^"]+)"/g,(_,attr,id)=>`${attr}="${copy.id}-${id}"`);
 document.body.append(page);
 page.querySelector('.story-stack').style.height='100svh';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const heroSection=page.querySelector('.story-hero'),records=[...page.querySelectorAll('.story-record')],timeline=page.querySelector('.story-timeline'),stack=page.querySelector('.story-stack'),layers=[...page.querySelectorAll('.story-stack-layer')];
 const menu=page.querySelector('.story-menu'),menuToggle=page.querySelector('.story-menu-toggle');
 layers.forEach((layer,index)=>{layer.style.zIndex=String(layers.length-index)});
 let frame=0,active='',opener=null,measuredWidth=0;
 const revealTargets=[...page.querySelectorAll('.story-intro h2,.story-intro-copy p,.story-section-heading h2,.story-section-heading p,.story-record-copy>p,.story-record-copy h3 button,.story-material-heading h2,.story-material-heading>p,.story-outro>p')];
 const originalText=new Map(revealTargets.map(el=>[el,[...el.childNodes].map(n=>n.cloneNode(true))]));
 const textVisibility=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('text-is-visible');textVisibility.unobserve(entry.target)}},{root:page,threshold:.12});
 function prepareText(){
  measuredWidth=page.clientWidth;
  for(const el of revealTargets){
   textVisibility.unobserve(el);el.replaceChildren(...originalText.get(el).map(n=>n.cloneNode(true)));
   el.classList.add('story-text-reveal');el.classList.remove('text-is-visible');
   if(reduced.matches){el.classList.add('text-is-visible');continue}
   const icons=[...el.children].filter(n=>n.tagName.toLowerCase()==='svg');icons.forEach(n=>n.remove());
   const text=[...el.childNodes].map(n=>n.nodeName==='BR'?'\n':n.textContent).join('');
   el.replaceChildren();
   const chars=Array.from(text).map(char=>{const node=document.createElement(char==='\n'?'br':'span');if(char!=='\n')node.textContent=char;el.append(node);return {node,char}});
   const lines=[];let lastTop=null;
   for(const {node,char} of chars){if(char==='\n'){lastTop=null;lines.push('');continue}const y=node.getBoundingClientRect().top;if(lastTop===null||Math.abs(y-lastTop)>3){if(!lines.length||lines.at(-1)!=='')lines.push('');lastTop=y}lines[lines.length-1]+=char}
   el.replaceChildren();
   for(const [i,line] of lines.filter(l=>l.trim()).entries()){const mask=document.createElement('span'),inner=document.createElement('span');mask.className='story-line-mask';inner.className='story-line-text';inner.textContent=line;inner.style.setProperty('--line-delay',`${Math.min(i*65,325)}ms`);mask.append(inner);el.append(mask)}
   el.append(...icons);textVisibility.observe(el);
  }
 }
 const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,v));
 function update(){
  frame=0;if(page.hidden)return;
  if(measuredWidth!==page.clientWidth)prepareText();
  const h=page.clientHeight,top=page.scrollTop,heroProgress=clamp(top/Math.max(1,heroSection.offsetHeight-h));
  page.style.setProperty('--read-progress',top/Math.max(1,page.scrollHeight-h));
  page.classList.toggle('story-scrolled',top>h*.65);
  heroSection.style.setProperty('--hero-progress',reduced.matches?0:heroProgress);
  const tr=timeline.getBoundingClientRect();timeline.style.setProperty('--axis-progress',clamp((h*.55-tr.top)/tr.height));
  for(const record of records){
   const r=record.getBoundingClientRect(),progress=clamp((h-r.top)/(h*.8));
   record.style.setProperty('--reveal',reduced.matches?1:progress);
   record.classList.toggle('is-near',r.top<h*.7&&r.bottom>h*.3);
  }
  const sr=stack.getBoundingClientRect(),sp=clamp(-sr.top/Math.max(1,stack.offsetHeight-h));
  for(let i=0;i<layers.length;i++){
   const local=clamp(sp*(layers.length-1)-i);
   layers[i].style.clipPath=i===layers.length-1?'none':`inset(0 0 ${reduced.matches?(local>.5?100:0):local*100}% 0)`;
   layers[i].style.setProperty('--stack-shift',reduced.matches?'0%':`${-local*9}%`);
  }
  page.querySelector('.story-stack-label span').textContent=`${String(Math.min(layers.length,Math.round(sp*(layers.length-1))+1)).padStart(2,'0')} / ${String(layers.length).padStart(2,'0')}`;
  const section=top<heroSection.offsetHeight?'入口':tr.top>h*.4?'材料序言':sr.top>h*.4?'遗存档案':'材料阅读';
  if(section!==active){active=section;emit('story-section',{categoryId:copy.id,section})}
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(update)}
 // Re-measure revealed lines once the local web fonts replace the fallback.
 document.fonts.ready.then(()=>{if(!page.hidden){measuredWidth=0;schedule()}});
 page.addEventListener('play',e=>{if(e.target.tagName==='VIDEO')document.querySelectorAll('video').forEach(v=>{if(v!==e.target)v.pause()})},true);
 page.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);reduced.addEventListener('change',schedule);
 function toggleMenu(open){menu.hidden=!open;menuToggle.setAttribute('aria-expanded',String(open));menuToggle.querySelector('span').textContent=open?'−':'＋'}
 menuToggle.onclick=()=>toggleMenu(menu.hidden);
 page.addEventListener('click',e=>{
  const jump=e.target.closest('[data-jump]');if(jump){toggleMenu(false);const target=page.querySelector(`#${copy.id}-${jump.dataset.jump}`);page.scrollTo({top:Math.max(0,target.offsetTop-88),behavior:reduced.matches?'instant':'smooth'});return}
  const card=e.target.closest('[data-story-card]');if(card){onCard(card.dataset.storyCard);return}
  if(e.target.closest('[data-story-all]')){toggleMenu(false);onAll();return}
  if(e.target.closest('[data-story-video]')){toggleMenu(false);onVideo(copy.id);return}
  if(e.target.closest('[data-story-next]')){onNext(copy.nextCategory);return}
  if(e.target.closest('.story-back'))onBack();
 });
 page.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.querySelector('dialog[open]')){if(!menu.hidden){toggleMenu(false);menuToggle.focus()}else onBack()}});
 const visibility=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('is-visible',entry.isIntersecting)),{root:page,threshold:.05});
 page.querySelectorAll('.story-intro, .story-material-heading').forEach(el=>visibility.observe(el));
 return {
  get element(){return page},
  get isOpen(){return !page.hidden},
  open(){opener=document.activeElement;page.hidden=false;document.body.classList.add('tools-reading');document.querySelector('.museum-header').inert=true;document.querySelector('#main').inert=true;page.scrollTop=0;measuredWidth=0;page.focus({preventScroll:true});update();emit('category-enter',{categoryId:copy.id,presentation:'editorial-scroll'})},
  close(){page.querySelectorAll('video').forEach(v=>v.pause());page.hidden=true;textVisibility.disconnect();toggleMenu(false);document.body.classList.remove('tools-reading');document.querySelector('.museum-header').inert=false;document.querySelector('#main').inert=false;if(frame)cancelAnimationFrame(frame);frame=0;if(opener?.isConnected)opener.focus({preventScroll:true})}
 };
}
