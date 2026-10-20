import {createDeckPhysics} from './deck-physics.js';
import {createStoneDust} from './stone-dust.js';
import {exhibit} from './data/exhibit.js';

export function createFloatingDeck({container,categories,esc,onChange,onEnter,emit}){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 // Two imperfect open rectangular outlines following the stone archive silhouette.
 const hoverRings=`<svg class="hover-rings" viewBox="0 0 500 700" preserveAspectRatio="none" aria-hidden="true"><path class="hover-ring ring-a" d="M154 676 L38 674 Q17 673 18 652 L20 49 Q20 28 41 29 L460 32 Q482 32 481 54 L478 651 Q478 674 456 675 L336 677"/><path class="hover-ring ring-b" d="M477 170 L476 65 Q476 43 454 42 L50 39 Q29 39 30 61 L32 638 Q32 660 54 661 L450 664 Q468 664 468 642 L473 278"/></svg>`;
 container.innerHTML=`<div id="background-effects" aria-hidden="true"></div><div class="archive-deck" role="group" aria-label="沿右上至左下拖动浏览石质档案">${categories.map(c=>{const asset=exhibit.sleeves.find(s=>s.categoryId===c.id);return `<button class="archive-folder" data-folder="${esc(c.id)}" aria-label="开启${esc(c.name)}档案详情"><span class="stone-object">${hoverRings}<span class="actor-front"><img src="${esc(asset.imagePath)}" alt="${esc(c.name)}石质档案套 · ${esc(asset.photoName)} · ${esc(asset.aiLabel)}" draggable="false"><span class="archive-photo" aria-hidden="true"><img src="${esc(asset.photoPath)}" alt="" draggable="false"><span class="photo-edge"></span></span><img class="archive-pocket" src="${esc(asset.imagePath)}" alt="" draggable="false" aria-hidden="true"><span class="actor-number">${c.number}</span><span class="actor-tab-number">${c.number}</span></span><span class="actor-back"><img src="${esc(exhibit.backImage)}" alt="" draggable="false"></span><span class="actor-edge edge-left"></span><span class="actor-edge edge-right"></span><span class="actor-edge edge-top"></span><span class="actor-edge edge-bottom"></span></span></button>`}).join('')}</div>`;
 const deck=container.querySelector('.archive-deck'),folders=[...deck.querySelectorAll('[data-folder]')];
 const motion=createDeckPhysics({count:categories.length,position:0}),dust=createStoneDust(deck,reduced);
 const bound=n=>Math.max(0,Math.min(categories.length-1,n));
 let frame=0,last=0,spacing=0,slope=.38,drag=null,suppressed=0,current=-1;
 function measure(){spacing=Math.min(folders[0].offsetWidth*1.1,container.clientWidth*.5);slope=container.clientWidth<=700?.3:.38;}
 const tilts=new Map(folders.map(f=>[f,{x:0,y:0,targetX:0,targetY:0}]));
 let tiltFrame=0,tiltTime=0;
 function tiltTick(time){
  tiltFrame=0;const dt=tiltTime?Math.min(.05,(time-tiltTime)/1000):1/60;tiltTime=time;
  const blend=1-Math.exp(-dt*14);let moving=false;
  for(const [f,t] of tilts){
   t.x+=(t.targetX-t.x)*blend;t.y+=(t.targetY-t.y)*blend;
   if(Math.abs(t.targetX-t.x)+Math.abs(t.targetY-t.y)<.002){t.x=t.targetX;t.y=t.targetY}else moving=true;
   f.style.setProperty('--pointer-x',`${-t.y*5}deg`);f.style.setProperty('--pointer-y',`${t.x*12}deg`);
   f.style.setProperty('--ring-roll',`${t.x*4+t.y*2}deg`);f.style.setProperty('--ring-offset',`${t.y*5}px`);
  }
  if(moving)tiltFrame=requestAnimationFrame(tiltTick);else tiltTime=0;
 }
 function trackTilt(f,x,y){const t=tilts.get(f);t.targetX=x;t.targetY=y;if(!tiltFrame)tiltFrame=requestAnimationFrame(tiltTick)}
 function reset(f){f.classList.remove('is-hovered');trackTilt(f,0,0);dust.leave(f)}
 function render(){
  const p=motion.position,index=Math.round(bound(p));deck.dataset.motion=motion.mode;deck.dataset.velocity=motion.velocity.toFixed(3);deck.style.setProperty('--deck-position',p);
  // Rotate the stone in step with the inertial track; labels remain upright.
  document.querySelector('.archive-dial').style.setProperty('--dial-turn',`${-p*90}deg`);
  for(let i=0;i<folders.length;i++){
   const f=folders[i],d=i-p,a=Math.abs(d),opacity=Math.max(.25,1-a*.16);
   // A continuous bowed track: every object follows its position and tangent,
   // including the fractions between themes. Extend the ends without folding back.
   const u=Math.max(-1.6,Math.min(1.6,d)),theta=u*.62,tail=d-u;
   const x=spacing*(Math.sin(theta)/.62+tail*Math.cos(theta));
   const bow=spacing*.65*((1-Math.cos(theta))/.62+tail*Math.sin(theta));
   const y=-slope*x+bow;
   const tangent=Math.atan(-slope+.65*Math.tan(theta))*180/Math.PI;
   const roll=Math.max(-46,Math.min(22,tangent+3));
   f.style.setProperty('--slide-x',`${x}px`);f.style.setProperty('--slide-y',`${y}px`);f.style.setProperty('--base-roll',`${roll}deg`);f.style.setProperty('--base-yaw',`${-16+Math.sin(theta)*12}deg`);f.style.setProperty('--scale',Math.max(.7,1+d*.055-a*.025));f.style.opacity=opacity;
   f.style.zIndex=String(10-Math.round(a*3));f.style.pointerEvents=opacity<.1?'none':'auto';f.inert=opacity<.1||a>1.7;f.classList.toggle('is-current',i===index);
  }
  const info=document.querySelector('.exhibit-info');
  const showing=motion.mode!=='drag'&&Math.abs(p-index)<.055&&Math.abs(motion.velocity)<.35;
  info.classList.toggle('is-travelling',!showing);
  const progress=Math.max(0,Math.min(1,(p+1)/categories.length));document.querySelector('.theme-progress').style.setProperty('--theme-progress',progress);
  if(index!==current){current=index;onChange(categories[index],index);emit('folder-select',{categoryId:categories[index].id,index,progress})}
 }
 function tick(time){frame=0;if(document.body.classList.contains('reading')){motion.halt();last=0;render();return;}motion.advance(last?(time-last)/1000:1/60);last=time;render();if(motion.moving)frame=requestAnimationFrame(tick);else last=0;}
 function schedule(){if(!frame)frame=requestAnimationFrame(tick)}
 function select(index,instant=false){motion.select(bound(index),instant||reduced.matches);folders.forEach(reset);last=0;schedule()}
 function enter(index){select(index,true);render();emit('folder-enter',{categoryId:categories[index].id});onEnter(categories[index].id)}
 function activate(index){if(index!==Math.round(bound(motion.position)))select(index);else enter(index)}
 deck.addEventListener('pointerdown',e=>{if(e.button!==0||drag||!e.isPrimary)return;motion.beginDrag();if(frame)cancelAnimationFrame(frame);frame=0;last=0;drag={id:e.pointerId,x:e.clientX,y:e.clientY,start:motion.position,lastPosition:motion.position,time:e.timeStamp,velocity:0,moved:false,folder:e.target.closest('[data-folder]')};deck.setPointerCapture(e.pointerId)});
 deck.addEventListener('pointermove',e=>{
  if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y,along=dx-slope*dy,across=dy+slope*dx;
  if(!drag.moved&&e.pointerType==='touch'&&Math.abs(across)>Math.abs(along)*1.6&&Math.abs(dy)>14){drag=null;suppressed=performance.now()+450;motion.release(0);deck.releasePointerCapture(e.pointerId);schedule();return}
  if(!drag.moved&&Math.abs(along)>7){drag.moved=true;deck.classList.add('is-dragging');folders.forEach(reset)}
  if(!drag.moved)return;motion.dragTo(drag.start-along/(spacing*(1+slope*slope)));const dt=Math.max(.001,(e.timeStamp-drag.time)/1000),v=(motion.position-drag.lastPosition)/dt;drag.velocity+=(v-drag.velocity)*(1-Math.exp(-dt/.045));drag.lastPosition=motion.position;drag.time=e.timeStamp;schedule();
 });
 function release(e,cancel=false){if(!drag||drag.id!==e.pointerId)return;const done=drag;drag=null;deck.classList.remove('is-dragging');suppressed=performance.now()+450;if(deck.hasPointerCapture(e.pointerId))deck.releasePointerCapture(e.pointerId);
  if(!cancel&&!done.moved&&done.folder){activate(folders.indexOf(done.folder));return}
  folders.forEach(reset);motion.release(cancel||e.timeStamp-done.time>100?0:done.velocity);if(reduced.matches)motion.select(Math.round(bound(motion.position)),true);last=0;schedule();
 }
 deck.addEventListener('pointerup',e=>release(e));deck.addEventListener('pointercancel',e=>release(e,true));deck.addEventListener('lostpointercapture',()=>{if(drag){drag=null;deck.classList.remove('is-dragging');select(Math.round(bound(motion.position)))}});
 folders.forEach((f,i)=>{
  f.addEventListener('click',e=>{if(e.detail===0||performance.now()>suppressed)activate(i)});
  f.addEventListener('pointerenter',e=>{if(drag||motion.moving||e.pointerType==='touch')return;f.classList.add('is-hovered');dust.hover(f)});
  f.addEventListener('pointermove',e=>{if(drag||motion.moving||reduced.matches||e.pointerType==='touch')return;if(!f.classList.contains('is-hovered')){f.classList.add('is-hovered');dust.hover(f)}const r=f.getBoundingClientRect(),x=Math.max(-1,Math.min(1,(e.clientX-r.left-r.width/2)/(r.width/2))),y=Math.max(-1,Math.min(1,(e.clientY-r.top-r.height/2)/(r.height/2)));trackTilt(f,x,y)});
  f.addEventListener('pointerleave',()=>reset(f));
 });
 deck.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();select(Math.round(bound(motion.position))+(e.key==='ArrowRight'?1:-1),true)}});
 window.addEventListener('resize',()=>{measure();render()});reduced.addEventListener('change',()=>select(Math.round(bound(motion.position)),true));
 measure();render();
 return {select(id,instant=false){const i=categories.findIndex(c=>c.id===id);if(i>=0)select(i,instant)},step(direction){select(Math.round(bound(motion.position))+direction)},open(){enter(Math.round(bound(motion.position)))},freeze(){motion.halt();if(frame)cancelAnimationFrame(frame);frame=0;last=0;folders.forEach(reset);render()},get categoryId(){return categories[Math.round(bound(motion.position))].id}};
}

