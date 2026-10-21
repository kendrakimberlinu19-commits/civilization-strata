// Opening scene: existing stone sleeves, six decorative actors, one clear entry.
export function createLandingEntry({categories,cards,esc,onPrepare,onEntered,onOpen,emit}){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),main=document.querySelector('#main'),header=document.querySelector('.museum-header');
 const root=document.createElement('section');root.id='landing-entry';root.className='landing-entry';root.hidden=true;root.setAttribute('aria-labelledby','landing-title');
 root.innerHTML=`<div class="landing-screen"><header class="landing-top"><a href="#" class="landing-wordmark" aria-label="文明地层地表入口">文明地层<span>CIVILIZATION STRATA</span></a><button class="landing-pause" aria-pressed="false">暂停动效 <span aria-hidden="true">Ⅱ</span></button></header><div class="landing-copy"><p class="landing-kicker">一次向文明深处的探索</p><h1 id="landing-title">文明地层<span>遗迹档案站</span></h1><p class="landing-introduction">从一件造物、一处遗址，走近人类留下的文明痕迹。打开档案，让沉默的碎片再次被看见。</p><button class="landing-enter"><span>进入文明地层</span><i aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></i></button><p class="landing-count">${categories.length} 个主题<span>·</span>${cards.length} 份示范档案</p></div><div class="landing-world" aria-hidden="true"><div class="landing-air"></div><div class="landing-objects"></div></div><div class="landing-bed" aria-hidden="true"></div><footer class="landing-footer"><p>${categories.map(c=>`<span>${esc(c.name)}</span>`).join('')}</p><span>AI 概念演绎 · 非实物照片</span></footer></div>`;
 document.body.append(root);
 const objects=root.querySelector('.landing-objects'),button=root.querySelector('.landing-enter'),pause=root.querySelector('.landing-pause');
 // Six visual actors reuse four themes. They do not introduce two fictional layers.
 const layout=[
  {theme:0,x:36,y:8,w:12,roll:-16,start:35,phase:-4,duration:21},
  {theme:1,x:77,y:20,w:13,roll:14,start:165,phase:-11,duration:25},
  {theme:2,x:17,y:48,w:20,roll:-18,start:8,phase:-8,duration:23},
  {theme:3,x:65,y:49,w:11,roll:19,start:215,phase:-15,duration:20},
  {theme:0,x:48,y:78,w:24,roll:12,start:6,phase:-6,duration:27},
  {theme:2,x:97,y:83,w:16,roll:-14,start:140,phase:-17,duration:24},
 ];
 for(const [i,slot] of layout.entries()){
  const source=document.querySelector(`[data-folder="${categories[slot.theme].id}"] .stone-object`);
  if(!source)continue;
  const actor=document.createElement('div');actor.className='landing-object';actor.dataset.actor=String(i);
  actor.style.cssText=`--x:${slot.x}%;--y:${slot.y}%;--w:${slot.w}vw;--roll:${slot.roll}deg;--start:${slot.start}deg;--phase:${slot.phase}s;--duration:${slot.duration}s`;
  const rise=document.createElement('div');rise.className='landing-rise';const spin=document.createElement('div');spin.className='landing-spin';
  const stone=source.cloneNode(true);stone.querySelectorAll('.hover-rings').forEach(n=>n.remove());stone.querySelectorAll('img').forEach(img=>{img.alt='';img.draggable=false});
  spin.append(stone);rise.append(spin);actor.append(rise);objects.append(actor);
 }
 let running=false,serial=0,animations=[],paused=false;
 const stopAnimations=()=>{animations.forEach(a=>a.cancel());animations=[]};
 function syncMotion(){root.classList.toggle('landing-still',paused||reduced.matches);pause.hidden=reduced.matches;pause.setAttribute('aria-pressed',String(paused));pause.innerHTML=paused?'继续动效 <span aria-hidden="true">▷</span>':'暂停动效 <span aria-hidden="true">Ⅱ</span>'}
 pause.onclick=()=>{paused=!paused;syncMotion()};reduced.addEventListener('change',syncMotion);syncMotion();
 function dismiss(){serial++;stopAnimations();running=false;root.hidden=true;root.inert=false;root.classList.remove('landing-leaving');button.disabled=false;button.removeAttribute('aria-busy');document.body.classList.remove('landing-open','landing-pending');main.inert=false;header.inert=false;}
 function open(){
  if(!root.hidden&&!running)return;
  serial++;stopAnimations();running=false;button.disabled=false;button.removeAttribute('aria-busy');root.inert=false;root.hidden=false;root.classList.remove('landing-leaving');
  document.body.classList.remove('landing-pending');document.body.classList.add('landing-open');main.inert=true;header.inert=true;onOpen();syncMotion();
  button.focus({preventScroll:true});emit('landing-open',{});
 }
 async function enter(){
  if(running||root.hidden)return;running=true;const id=++serial;button.disabled=true;button.setAttribute('aria-busy','true');onPrepare();
  emit('landing-entry-start',{});root.classList.add('landing-leaving');
  const play=(el,frames,options)=>{const animation=el.animate(frames,{fill:'both',...options});animations.push(animation);return animation};
  const skip=e=>{if(e.key==='Escape'||e.type==='resize'){e.preventDefault?.();animations.forEach(a=>{try{a.finish()}catch{}})}};
  window.addEventListener('keydown',skip);window.addEventListener('resize',skip);
  try{
   if(!reduced.matches&&Element.prototype.animate){
    const copy=root.querySelector('.landing-copy'),base=getComputedStyle(copy).transform;
    play(copy,[{opacity:1,transform:base},{opacity:0,transform:`${base==='none'?'':base} translateY(-36px)`}],{duration:380,easing:'cubic-bezier(.4,0,.2,1)'});
    root.querySelectorAll('.landing-object').forEach((actor,i)=>{const transform=getComputedStyle(actor).transform;play(actor,[{transform,opacity:1},{transform:`${transform} translateY(-130px) scale(.88)`,opacity:0}],{duration:650,delay:i*32,easing:'cubic-bezier(.4,0,.2,1)'})});
    play(root,[{opacity:1},{opacity:0}],{duration:460,delay:420,easing:'ease-in'});
    play(main,[{opacity:0,transform:'translateY(90px) scale(1.025)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:880,delay:180,easing:'cubic-bezier(.16,1,.3,1)'});
    play(header,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:400,delay:620,easing:'ease-out'});
    await Promise.allSettled(animations.map(a=>a.finished));
   }
  }finally{
   window.removeEventListener('keydown',skip);window.removeEventListener('resize',skip);
   if(id===serial){dismiss();onEntered();document.querySelector('.open-active').focus({preventScroll:true});emit('landing-entry-complete',{});}
  }
 }
 button.onclick=enter;root.querySelector('.landing-wordmark').onclick=e=>{e.preventDefault();button.focus()};
 return {open,dismiss,enter,get isOpen(){return !root.hidden},get running(){return running}};
}
