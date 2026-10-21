// Shared, default-enabled Web Audio bus: restrained physical cues, no external audio files.
export function createAmbientSound(button,slider){
 const controls=button.closest('.sound-controls'),host=document.createElement('aside');host.className='site-audio';host.setAttribute('aria-label','网站声音');host.append(controls);document.body.append(host);
 let context=null,master=null,on=true,serial=0,noise=null,voices=0,lastStrong=-Infinity,unlocking=false,pendingCue=null;const recent=new Map(),active=new Set();
 const volume=()=>Math.max(0,Math.min(1,Number(slider.value)||0))*.45;
 function sync(){button.setAttribute('aria-pressed',String(on));button.setAttribute('aria-label',on?'关闭网站声音':'开启网站声音（环境音与交互音效）');button.title=on?'关闭网站声音':'开启网站声音 · 环境音与轻微交互音效';button.dataset.audioStatus=on?(context?.state==='running'?'playing':'pending'):'muted'}
 function buffer(){const b=context.createBuffer(1,context.sampleRate*2,context.sampleRate),data=b.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1);return b}
 function init(){
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error('当前浏览器不支持网站声音');context=new Audio();master=context.createGain();master.gain.value=0;master.connect(context.destination);noise=buffer();
  const source=context.createBufferSource();source.buffer=noise;source.loop=true;const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=150;const bed=context.createGain();bed.gain.value=.035;source.connect(filter);filter.connect(bed);bed.connect(master);source.start();
  const tone=context.createOscillator(),toneGain=context.createGain();tone.frequency.value=55;toneGain.gain.value=.012;tone.connect(toneGain);toneGain.connect(master);tone.start();
 }
 function envelope(node,level,duration,when=context.currentTime){node.gain.setValueAtTime(0,when);node.gain.linearRampToValueAtTime(level,when+Math.min(.025,duration*.16));node.gain.exponentialRampToValueAtTime(.0001,when+duration);}
 function bookOpen(){
  const time=context.currentTime;
  // Three soft, staggered paper folds: broad dry rustle, no metallic ringing.
  for(const [i,delay] of [0,.09,.23].entries()){
   const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();
   source.buffer=noise;source.playbackRate.value=.82+i*.12;filter.type='bandpass';filter.Q.value=.55;filter.frequency.setValueAtTime(1400+i*420,time+delay);filter.frequency.exponentialRampToValueAtTime(650+i*150,time+delay+.28);
   source.connect(filter);filter.connect(gain);gain.connect(master);envelope(gain,[.12,.085,.055][i],.29,time+delay);source.start(time+delay,.2+i*.36);source.stop(time+delay+.32);voices++;active.add(source);
   source.onended=()=>{voices--;active.delete(source);source.disconnect();filter.disconnect();gain.disconnect()};
  }
  const cover=context.createOscillator(),gain=context.createGain();cover.type='sine';cover.frequency.setValueAtTime(130,time);cover.frequency.exponentialRampToValueAtTime(65,time+.18);cover.connect(gain);gain.connect(master);envelope(gain,.045,.20,time);cover.start(time);cover.stop(time+.23);active.add(cover);cover.onended=()=>{active.delete(cover);cover.disconnect();gain.disconnect()};
 }
 function play(kind){
  if(!on||document.hidden||!volume())return;
  if(!context||context.state!=='running'){if(unlocking&&['book','open','close'].includes(kind))pendingCue=kind;return}if(voices>=6)return;
  const now=performance.now(),limits={book:800,hover:380,slide:500,scroll:750,tick:180,open:450,close:180,click:120};
  if(now-(recent.get(kind)??-Infinity)<limits[kind]||(!['book','open','close'].includes(kind)&&now-lastStrong<180))return;
  recent.set(kind,now);if(['book','open','close'].includes(kind))lastStrong=now;
  if(kind==='book'){bookOpen();host.dataset.lastCue=kind;host.dataset.cueCount=String(Number(host.dataset.cueCount||0)+1);return}
  const settings={hover:[.14,920,.035],click:[.09,680,.035],tick:[.11,520,.045],slide:[.28,360,.065],scroll:[.20,260,.05],open:[.5,420,.095],close:[.24,300,.06]},[duration,frequency,level]=settings[kind];
  const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();source.buffer=noise;filter.type='bandpass';filter.frequency.setValueAtTime(frequency,context.currentTime);filter.frequency.exponentialRampToValueAtTime(frequency*(kind==='open'?1.6:.65),context.currentTime+duration);filter.Q.value=kind==='hover'?1.8:.8;source.connect(filter);filter.connect(gain);gain.connect(master);envelope(gain,level,duration);source.start(0,(now/1000)%1);source.stop(context.currentTime+duration+.03);voices++;active.add(source);
  source.onended=()=>{voices--;active.delete(source);source.disconnect();filter.disconnect();gain.disconnect()};
  if(['hover','tick','open'].includes(kind)){
   const tone=context.createOscillator(),ring=context.createGain();tone.type='sine';tone.frequency.value=kind==='open'?220:kind==='hover'?1260:740;tone.connect(ring);ring.connect(master);envelope(ring,kind==='open'?.023:.012,duration*.85);tone.start();active.add(tone);tone.stop(context.currentTime+duration);tone.onended=()=>{active.delete(tone);tone.disconnect();ring.disconnect()};
  }
  host.dataset.lastCue=kind;host.dataset.cueCount=String(Number(host.dataset.cueCount||0)+1);
 }
 async function unlock(){
  if(!on||document.hidden||unlocking)return;unlocking=true;
  try{if(!context)init();await context.resume();if(!on)return;master.gain.setTargetAtTime(volume(),context.currentTime,.08);sync();if(pendingCue){const cue=pendingCue;pendingCue=null;play(cue)}}catch(error){button.title='声音等待浏览器允许：'+error.message;button.dataset.audioStatus='pending'}finally{unlocking=false}
 }
 async function toggle(){
  const id=++serial;on=!on;sync();
  if(on){await unlock();if(id===serial&&on)play('tick')}
  else if(context){master.gain.setTargetAtTime(0,context.currentTime,.035);active.forEach(source=>{try{source.stop(context.currentTime+.06)}catch{}});setTimeout(()=>{if(!on)context.suspend().catch(()=>{})},180)}
 }
 // Default enabled; the first real pointer/key gesture unlocks browser audio.
 document.addEventListener('pointerdown',e=>{if(!e.target.closest?.('.sound-toggle')&&(!context||context.state!=='running'))unlock()},{capture:true,passive:true});
 document.addEventListener('keydown',e=>{if(!e.repeat&&!e.target.closest?.('.sound-toggle')&&(!context||context.state!=='running'))unlock()},{capture:true});
 button.onclick=toggle;slider.setAttribute('aria-label','网站声音音量');slider.addEventListener('input',()=>{if(master&&on)master.gain.setTargetAtTime(volume(),context.currentTime,.06)});sync();
 const onEvent=(event,cue)=>window.addEventListener(`strata:${event}`,()=>play(cue));
 for(const [event,cue] of [['folder-select','tick'],['category-enter','book'],['category-close','close'],['landing-entry-start','open'],['landing-open','close'],['dialog-open','open'],['dialog-close','close']])onEvent(event,cue);
 const objects='.archive-folder,.archive-card,.story-record-image,.story-contact-image';
 document.addEventListener('pointerover',e=>{if(e.pointerType==='touch')return;const item=e.target.closest?.(objects);if(item&&!(e.relatedTarget instanceof Node&&item.contains(e.relatedTarget)))play('hover')},{passive:true});
 document.addEventListener('focusin',e=>{if(e.target.matches?.(objects))play('hover')});
 document.addEventListener('click',e=>{if(e.target.closest?.('button')&&!e.target.closest('.site-audio,.theme-progress,.switch-controls'))play('click')});
 let drag=null;
 document.addEventListener('pointerdown',e=>{if(e.target.closest?.('.archive-deck'))drag={id:e.pointerId,x:e.clientX,y:e.clientY}},{passive:true});
 document.addEventListener('pointermove',e=>{if(drag&&drag.id===e.pointerId&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>14)play('slide')},{passive:true});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])document.addEventListener(event,()=>{drag=null},{passive:true});
 const scrolls=new WeakMap();
 document.addEventListener('scroll',e=>{const el=e.target;if(!(el instanceof Element)||!el.matches('.tools-story,dialog,.landing-entry'))return;const now=performance.now(),before=scrolls.get(el);if(!before||Math.abs(el.scrollTop-before.top)>24&&now-before.time>750){scrolls.set(el,{top:el.scrollTop,time:now});if(el.scrollTop>0||before?.top>0)play('scroll')}},{capture:true,passive:true});
 document.addEventListener('visibilitychange',()=>{if(!context)return;if(document.hidden)context.suspend().catch(()=>{});else if(on)context.resume().catch(()=>{})});
 window.addEventListener('pagehide',()=>context?.suspend().catch(()=>{}));
 return {mount(parent=document.body){parent.append(host)},get enabled(){return on}};
}
