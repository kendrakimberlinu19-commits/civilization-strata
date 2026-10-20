// A24 reference: withdraw the collection, carry the selected object across,
// then compose the destination. No automatic rotation outside this click sequence.
export function createArchiveEntry({emit}) {
 let running=false;
 return {
  get running(){return running},
  async run({source,categoryId,label,prepare,target}) {
   if(running)return;
   if(!source||matchMedia('(prefers-reduced-motion: reduce)').matches||!Element.prototype.animate){prepare();return}
   running=true;
   const active=document.activeElement,stage=document.createElement('div'),animations=[];
   stage.className='archive-entry';stage.tabIndex=-1;stage.setAttribute('role','status');
   stage.setAttribute('aria-label',`正在进入${label}，按 Escape 跳过动效`);
   const width=innerWidth,height=innerHeight;
   function removeIds(node){node.removeAttribute('id');node.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));node.setAttribute('aria-hidden','true');node.querySelectorAll('button,a,input').forEach(e=>e.tabIndex=-1)}
   const actors=[...document.querySelectorAll('.archive-deck > .archive-folder')].filter(f=>Number(getComputedStyle(f).opacity)>.05).map(f=>{
    const clone=f.cloneNode(true),style=getComputedStyle(f);
    removeIds(clone);clone.tabIndex=-1;clone.classList.remove('is-hovered');clone.classList.add('entry-actor');
    Object.assign(clone.style,{left:`${f.offsetLeft}px`,top:`${f.offsetTop}px`,width:`${f.offsetWidth}px`,height:`${f.offsetHeight}px`,transform:style.transform,opacity:style.opacity,pointerEvents:'none',visibility:'visible'});
    clone.querySelector('.stone-object').style.transform=getComputedStyle(f.querySelector('.stone-object')).transform;
    stage.append(clone);
    return {clone,selected:f===source,transform:style.transform,opacity:style.opacity,w:f.offsetWidth,h:f.offsetHeight,x:f.offsetLeft,y:f.offsetTop};
   });
   const ui=[...document.querySelectorAll('.museum-header,.exhibit-info,.active-caption,.exhibit-bottom')].map(el=>{
    const clone=el.cloneNode(true),r=el.getBoundingClientRect();removeIds(clone);
    Object.assign(clone.style,{position:'fixed',left:`${r.left}px`,top:`${r.top}px`,right:'auto',bottom:'auto',width:`${r.width}px`,height:`${r.height}px`,transform:'none',margin:'0',pointerEvents:'none'});
    clone.classList.add('entry-ui');stage.append(clone);return clone;
   });
   document.body.append(stage);document.body.classList.add('entry-busy');
   let destination;
   const play=(el,frames,options)=>{const a=el.animate(frames,{fill:'both',...options});animations.push(a);return a};
   const skip=e=>{if(e.type==='resize'||e.key==='Escape'){e.preventDefault?.();animations.forEach(a=>{try{a.finish()}catch{}})}};
   try {
    prepare();destination=target();destination.classList.add('story-arriving');destination.inert=true;
    stage.focus({preventScroll:true});
    emit('entry-transition-start',{categoryId,effect:'collection-withdraw'});
    ui.forEach((el,i)=>play(el,[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-20px)'}],{duration:260,delay:i*30,easing:'cubic-bezier(.4,0,.2,1)'}));
    for(const actor of actors){
     const {clone,w,h,x,y}=actor,cx=width/2-x-w/2,cy=height/2-y-h/2;
     if(actor.selected){
      clone.style.zIndex='10';
      play(clone,[
       {offset:0,transform:actor.transform,opacity:1},
       {offset:.35,transform:`translate3d(${cx}px,${cy}px,0) rotateY(-6deg) rotateZ(0deg) scale(.8)`,opacity:1,easing:'cubic-bezier(.4,0,.3,1)'},
       {offset:.72,transform:`translate3d(${cx}px,${cy}px,-100px) rotateY(100deg) rotateZ(-12deg) scale(.36)`,opacity:1,easing:'cubic-bezier(.4,0,.2,1)'},
       {offset:1,transform:`translate3d(${cx}px,${cy+12}px,-220px) rotateY(205deg) rotateZ(-24deg) scale(.025)`,opacity:0}
      ],{duration:1120,easing:'cubic-bezier(.4,0,.2,1)'});
     }else{
      const direction=clone.getBoundingClientRect().left<width/2?-1:1;
      play(clone,[{transform:actor.transform,opacity:actor.opacity},{transform:`translate3d(${cx+direction*width*.35}px,${cy}px,-300px) rotateY(${direction*45}deg) scale(.04)`,opacity:0}],{duration:720,delay:40,easing:'cubic-bezier(.55,0,.2,1)'});
     }
    }
    const media=destination.querySelector('.story-hero-media');
    play(media,[{opacity:0,clipPath:'inset(49.8% 0 49.8% 0)',transform:'scale(1.12)'},{opacity:1,clipPath:'inset(0% 0 0% 0)',transform:getComputedStyle(media).transform}],{duration:740,delay:700,easing:'cubic-bezier(.76,0,.24,1)'});
    destination.querySelectorAll('.story-hero-word-text').forEach((el,i)=>play(el,[{transform:'translateY(112%)'},{transform:'translateY(0)'}],{duration:460,delay:960+i*90,easing:'cubic-bezier(.16,1,.3,1)'}));
    play(destination.querySelector('.story-hero-nav'),[{opacity:0,clipPath:'inset(0 100% 0 0)'},{opacity:1,clipPath:'inset(0 0% 0 0)'}],{duration:500,delay:1050,easing:'cubic-bezier(.16,1,.3,1)'});
    for(const el of destination.querySelectorAll('.story-top,.story-hero-bottom'))play(el,[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:300,delay:1190,easing:'cubic-bezier(.16,1,.3,1)'});
    addEventListener('keydown',skip,true);addEventListener('resize',skip);
    await Promise.all(animations.map(a=>a.finished.catch(()=>{})));
   } finally {
    removeEventListener('keydown',skip,true);removeEventListener('resize',skip);
    destination?.classList.remove('story-arriving');if(destination)destination.inert=false;
    animations.forEach(a=>a.cancel());stage.remove();document.body.classList.remove('entry-busy');running=false;
    if(destination&&!destination.hidden)destination.focus({preventScroll:true});else active?.focus({preventScroll:true});
    emit('entry-transition-end',{categoryId});
   }
  }
 };
}
