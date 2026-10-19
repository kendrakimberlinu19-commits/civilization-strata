// A small, bounded canvas effect. Particles are procedural rock chips, not image assets.
export function createStoneDust(deck,reduced){
 const canvas=document.createElement('canvas');canvas.className='stone-dust';canvas.setAttribute('aria-hidden','true');deck.append(canvas);
 const ctx=canvas.getContext('2d');let source=null,particles=[],frame=0,last=0,budget=0,width=0,height=0;
 function measure(){width=deck.clientWidth;height=deck.clientHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
 function spawn(){
  const r=source.querySelector('.stone-object').getBoundingClientRect(),base=deck.getBoundingClientRect();
  const side=Math.random()<.5?-1:1;
  const x=r.left-base.left+r.width*(side<0?.08:.92),y=r.top-base.top+r.height*(.15+Math.random()*.65);
  particles.push({x,y,vx:side*(8+Math.random()*12),vy:-12-Math.random()*20,size:1.1+Math.random()*2.4,angle:Math.random()*Math.PI,spin:(Math.random()-.5)*.8,life:0,ttl:2.8+Math.random()*1.8,color:['#a99a7b','#81735e','#b2a287','#605d52'][Math.floor(Math.random()*4)]});
 }
 function tick(time){
  frame=0;const dt=Math.min(.05,(time-(last||time))/1000);last=time;
  const paused=document.body.classList.contains('reading')||document.hidden;
  const emitting=source&&!source.closest('.surface').inert&&!paused&&!reduced.matches;
  if(emitting){budget+=dt*5;while(budget>=1&&particles.length<36){spawn();budget--}}
  else budget=0;
  ctx.clearRect(0,0,width,height);
  if(reduced.matches||paused)particles=[];
  particles=particles.filter(p=>p.life<p.ttl);
  for(const p of particles){p.life+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=5*dt;p.angle+=p.spin*dt;
   ctx.save();ctx.globalAlpha=Math.sin(Math.min(1,p.life/.35)*Math.PI/2)*Math.max(0,1-p.life/p.ttl)*.65;ctx.translate(p.x,p.y);ctx.rotate(p.angle);ctx.fillStyle=p.color;
   ctx.beginPath();ctx.moveTo(-p.size,-p.size*.35);ctx.lineTo(p.size*.25,-p.size);ctx.lineTo(p.size,p.size*.2);ctx.lineTo(p.size*.4,p.size*.7);ctx.lineTo(-p.size*.65,p.size);ctx.closePath();ctx.fill();ctx.restore();
  }
  canvas.dataset.particles=String(particles.length);canvas.dataset.emitting=String(!!emitting);
  if(emitting||particles.length)frame=requestAnimationFrame(tick);else last=0;
 }
 function start(){if(!frame)frame=requestAnimationFrame(tick)}
 window.addEventListener('resize',measure);measure();
 return {hover(folder){source=folder;start()},leave(folder){if(source===folder)source=null;start()}};
}
