import {createCoinScene} from './coin-scene.js?v=20261021-coins';
// Opening scene: nine AI concept coins with volumetric edges and flowing gold atmosphere.
export function createLandingEntry({categories,cards,esc,onPrepare,onEntered,onOpen,emit}){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),main=document.querySelector('#main'),header=document.querySelector('.museum-header');
 const root=document.createElement('section');root.id='landing-entry';root.className='landing-entry';root.hidden=true;root.setAttribute('aria-labelledby','landing-title');
 root.innerHTML=`<div class="landing-screen"><header class="landing-top"><a href="#" class="landing-wordmark" aria-label="文明地层地表入口">文明地层<span>CIVILIZATION STRATA</span></a><button class="landing-pause" aria-pressed="false">暂停动效 <span aria-hidden="true">Ⅱ</span></button></header><div class="landing-copy"><p class="landing-kicker">一次向文明深处的探索</p><h1 id="landing-title">文明地层<span>遗迹档案站</span></h1><p class="landing-introduction">从一件造物、一处遗址，走近人类留下的文明痕迹。打开档案，让沉默的碎片再次被看见。</p><button class="landing-enter"><span>进入文明地层</span><i aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></i></button><p class="landing-count">${categories.length} 个主题<span>·</span>${cards.length} 份示范档案</p></div><div class="landing-world" aria-hidden="true"><div class="landing-air"></div><div class="landing-objects"></div></div><div class="landing-bed" aria-hidden="true"></div><footer class="landing-footer"><p>${categories.map(c=>`<span>${esc(c.name)}</span>`).join('')}</p><span>钱币为 AI 概念纹样 · 非真实文物</span></footer></div>`;
 document.body.append(root);
 const button=root.querySelector('.landing-enter'),pause=root.querySelector('.landing-pause');
 const scene=createCoinScene(root);
 let running=false,serial=0,animations=[],paused=false;
 const stopAnimations=()=>{animations.forEach(a=>a.cancel());animations=[]};
 function syncMotion(){scene.pause(paused||reduced.matches);root.classList.toggle('landing-still',paused||reduced.matches);pause.hidden=reduced.matches;pause.setAttribute('aria-pressed',String(paused));pause.innerHTML=paused?'继续动效 <span aria-hidden="true">▷</span>':'暂停动效 <span aria-hidden="true">Ⅱ</span>'}
 pause.onclick=()=>{paused=!paused;syncMotion()};reduced.addEventListener('change',syncMotion);syncMotion();
 function dismiss(){scene.stop();serial++;stopAnimations();running=false;root.hidden=true;root.inert=false;root.classList.remove('landing-leaving');button.disabled=false;button.removeAttribute('aria-busy');document.body.classList.remove('landing-open','landing-pending');main.inert=false;header.inert=false;}
 function open(){
  if(!root.hidden&&!running)return;
  serial++;stopAnimations();running=false;button.disabled=false;button.removeAttribute('aria-busy');root.inert=false;root.hidden=false;root.classList.remove('landing-leaving');
  document.body.classList.remove('landing-pending');document.body.classList.add('landing-open');main.inert=true;header.inert=true;onOpen();scene.start();syncMotion();
  button.focus({preventScroll:true});emit('landing-open',{});
 }
 async function enter(){
  if(running||root.hidden)return;running=true;const id=++serial;button.disabled=true;button.setAttribute('aria-busy','true');onPrepare();
  emit('landing-entry-start',{});root.classList.add('landing-leaving');scene.pause(true);
  const play=(el,frames,options)=>{const animation=el.animate(frames,{fill:'both',...options});animations.push(animation);return animation};
  const skip=e=>{if(e.key==='Escape'||e.type==='resize'){e.preventDefault?.();animations.forEach(a=>{try{a.finish()}catch{}})}};
  window.addEventListener('keydown',skip);window.addEventListener('resize',skip);
  try{
   if(!reduced.matches&&Element.prototype.animate){
    const copy=root.querySelector('.landing-copy'),base=getComputedStyle(copy).transform;
    play(copy,[{opacity:1,transform:base},{opacity:0,transform:`${base==='none'?'':base} translateY(-36px)`}],{duration:380,easing:'cubic-bezier(.4,0,.2,1)'});
    play(root.querySelector('.landing-world'),[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-100px)'}],{duration:720,easing:'cubic-bezier(.4,0,.2,1)'});
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
