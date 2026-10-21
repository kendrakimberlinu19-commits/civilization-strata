import {landingCoins as art} from './data/landing-coins.js?v=20261021-coins';

// A closed, bevelled bronze ring with a square tunnel, not layered image planes.
export function createCoinMesh(segments=96){
 const vertices=[];
 const vertex=(p,n,kind)=>vertices.push(...p,...n,kind);
 const quad=(a,b,c,d,n,kind)=>{for(const p of [a,b,c,a,c,d])vertex(p,n,kind)};
 const outer=(t,r,z)=>[Math.cos(t)*r,Math.sin(t)*r,z];
 const inner=(t,h,z)=>{const c=Math.cos(t),s=Math.sin(t),r=h/Math.max(Math.abs(c),Math.abs(s));return [c*r,s*r,z]};
 for(let i=0;i<segments;i++){
  const a=i/segments*Math.PI*2,b=(i+1)/segments*Math.PI*2,mid=(a+b)/2;
  quad(inner(a,.20,.065),outer(a,.96,.065),outer(b,.96,.065),inner(b,.20,.065),[0,0,1],0);
  quad(inner(b,.20,-.065),outer(b,.96,-.065),outer(a,.96,-.065),inner(a,.20,-.065),[0,0,-1],1);
  for(const [r1,z1,r2,z2,nz] of [[.96,.065,1,.035,.65],[1,.035,1,-.035,0],[1,-.035,.96,-.065,-.65]])
   quad(outer(a,r1,z1),outer(a,r2,z2),outer(b,r2,z2),outer(b,r1,z1),[Math.cos(mid),Math.sin(mid),nz],2);
  const c=Math.cos(mid),s=Math.sin(mid),normal=Math.abs(c)>Math.abs(s)?[-Math.sign(c),0,0]:[0,-Math.sign(s),0];
  quad(inner(a,.20,.065),inner(b,.20,.065),inner(b,.18,.035),inner(a,.18,.035),[normal[0],normal[1],.6],2);
  quad(inner(a,.18,.035),inner(b,.18,.035),inner(b,.18,-.035),inner(a,.18,-.035),normal,2);
  quad(inner(a,.18,-.035),inner(b,.18,-.035),inner(b,.20,-.065),inner(a,.20,-.065),[normal[0],normal[1],-.6],2);
 }
 return new Float32Array(vertices);
}

function renderer(canvas){
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});if(!gl)return null;
 const vs=`attribute vec3 aPosition;attribute vec3 aNormal;attribute float aKind;uniform vec3 uAngles,uCenter;uniform float uRadius,uAspect;varying vec3 vNormal,vLocal;varying float vKind;
 mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}mat3 rz(float a){float c=cos(a),s=sin(a);return mat3(c,s,0.,-s,c,0.,0.,0.,1.);}
 void main(){mat3 r=rz(uAngles.z)*rx(uAngles.x)*ry(uAngles.y);vec3 p=r*aPosition*uRadius+uCenter;float perspective=7./(7.-p.z);gl_Position=vec4(p.x/(1.5*uAspect)*perspective,p.y/1.5*perspective,-p.z*.08,1.);vNormal=r*aNormal;vLocal=aPosition;vKind=aKind;}`;
 const fs=`precision mediump float;uniform sampler2D uTexture;uniform float uTile,uOpacity;varying vec3 vNormal,vLocal;varying float vKind;
 void main(){vec3 n=normalize(vNormal);vec3 light=normalize(vec3(-.5,.8,1.4));float diffuse=.38+.62*max(dot(n,light),0.);float shine=pow(max(dot(n,normalize(light+vec3(0.,0.,1.))),0.),28.);
 vec3 metal;if(vKind>1.5){float grain=sin(vLocal.x*170.+vLocal.y*103.+vLocal.z*35.)*.06;metal=vec3(.36,.25,.115)+grain;}else{float tile=uTile;vec2 xy=vec2(vKind>.5?-vLocal.x:vLocal.x,-vLocal.y);vec2 uv=(xy*.465+.5+vec2(mod(tile,3.),floor(tile/3.)))/3.;vec4 tex=texture2D(uTexture,uv);if(tex.a<.15)discard;metal=tex.rgb;}
 gl_FragColor=vec4(metal*diffuse+vec3(.34,.25,.12)*shine,uOpacity);}`;
 const shader=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s};
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Coin shader link failed');gl.useProgram(program);
 const mesh=createCoinMesh(),buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,mesh,gl.STATIC_DRAW);
 for(const [name,count,offset] of [['aPosition',3,0],['aNormal',3,12],['aKind',1,24]]){const a=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,count,gl.FLOAT,false,28,offset)}
 const locations=Object.fromEntries(['uAngles','uCenter','uRadius','uAspect','uTile','uOpacity'].map(n=>[n,gl.getUniformLocation(program,n)]));
 const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 gl.enable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
 return {upload(img){gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img)},draw(time,w,h){
  gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);gl.uniform1f(locations.uAspect,w/h);
  art.layout.forEach((coin,i)=>{const phase=(time*.012+coin.phase)%1,y=coin.y+.08-phase*.16,radius=coin.r*Math.min(w,h)/h*3;
   gl.uniform3f(locations.uCenter,(coin.x-.5)*3*w/h,(.5-y)*3,coin.z);
   gl.uniform3f(locations.uAngles,.15+Math.sin(time*.15+i)*.12,coin.yaw+time*.19*coin.speed,Math.sin(i*2)*.27+Math.sin(time*.1+i)*.05);
   gl.uniform1f(locations.uRadius,radius);gl.uniform1f(locations.uTile,i);gl.uniform1f(locations.uOpacity,Math.min(1,phase/.04,(1-phase)/.04));gl.drawArrays(gl.TRIANGLES,0,mesh.length/7);
  });
 },dispose(){gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program)}};
}

export function createCoinScene(root){
 const world=root.querySelector('.landing-objects'),canvas=document.createElement('canvas');canvas.className='coin-volume';canvas.hidden=true;world.append(canvas);
 const fallback=document.createElement('div');fallback.className='coin-fallbacks';fallback.innerHTML=art.layout.map((c,i)=>`<span class="coin-fallback" style="--coin-x:${c.x*100}%;--coin-y:${c.y*100}%;--coin-r:${c.r*200}%;background-position:${i%3*50}% ${Math.floor(i/3)*50}%"></span>`).join('');world.append(fallback);
 const atmosphere=document.createElement('canvas');atmosphere.className='landing-atmosphere';atmosphere.setAttribute('aria-hidden','true');root.querySelector('.landing-screen').prepend(atmosphere);const ctx=atmosphere.getContext('2d');
 let draw3d=null,ready=false,active=false,paused=false,frame=0,last=0,time=0,w=1,h=1,aw=1,ah=1,wx=0,wy=0,lastDust=0;
 try{draw3d=renderer(canvas)}catch{draw3d=null}
 const image=new Image();image.onload=()=>{if(draw3d){try{draw3d.upload(image);ready=true;fallback.hidden=true;canvas.hidden=false;root.dataset.coinRenderer='webgl'}catch{draw3d=null}}render();};image.src=art.imagePath;
 function resize(){const rect=world.getBoundingClientRect(),screen=root.querySelector('.landing-screen').getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.75);w=Math.max(1,rect.width);h=Math.max(1,rect.height);aw=Math.max(1,screen.width);ah=Math.max(1,screen.height);wx=rect.left-screen.left;wy=rect.top-screen.top;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);atmosphere.width=Math.round(aw*dpr);atmosphere.height=Math.round(ah*dpr);ctx?.setTransform(dpr,0,0,dpr,0,0);paintAtmosphere();render()}
 const dust=Array.from({length:120},(_,i)=>({x:(Math.sin(i*127.1)*43758.5)%1,y:(Math.sin(i*311.7)*23421.6)%1,r:i%5===0?1.6:.65}));
 function paintAtmosphere(){
  if(!ctx)return;ctx.clearRect(0,0,aw,ah);ctx.strokeStyle='#b18b46';ctx.lineWidth=.7;
  // Abstract seal-like strokes only: no asserted historical script or inscriptions.
  for(let i=0;i<44;i++){
   const x=((i*211.7+time*(6+i%5))%(aw+160))-80,y=((i*139.3-time*(3+i%3)+ah*30)%(ah+80))-40;
   const size=9+i%4*5;ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(time*.035+i)*.2);ctx.globalAlpha=x<aw*.43?.035:.07;
   ctx.beginPath();ctx.moveTo(-size,-size*.5);ctx.lineTo(size*.5,-size*.5);ctx.lineTo(size*.5,size*.6);ctx.moveTo(-size*.3,-size);ctx.lineTo(-size*.3,size);ctx.moveTo(-size*.7,size*.3);ctx.lineTo(size,size*.3);
   if(i%3===0){ctx.moveTo(-size,-size);ctx.lineTo(size,size)}else if(i%3===1){ctx.moveTo(size,0);ctx.arc(0,0,size,0,Math.PI*1.5)}ctx.stroke();ctx.restore();
  }
  for(let i=0;i<dust.length;i++){const p=dust[i],x=(((p.x+1)*aw+Math.sin(time*.15+i)*22)%aw),y=(((p.y+1)*ah-time*(3+i%7)+ah*100)%ah);ctx.globalAlpha=(x<aw*.43?.045:.16)*( .6+.4*Math.sin(time*.7+i));ctx.fillStyle=i%6===0?'#e7c98a':'#ac8744';ctx.beginPath();ctx.arc(x,y,p.r,0,Math.PI*2);ctx.fill()}
  art.layout.forEach((coin,i)=>{
   const phase=(time*.012+coin.phase)%1,perspective=7/(7-coin.z),x=wx+w/2+(coin.x-.5)*w*perspective,y=wy+h/2+(coin.y+.08-phase*.16-.5)*h*perspective,r=coin.r*Math.min(w,h)*perspective;
   for(let j=0;j<6;j++){const angle=j*2.399+i*.7+time*.055,drift=(time*.12+j*.17)%1;ctx.globalAlpha=(1-drift)*.24;ctx.fillStyle='#d5b36c';ctx.beginPath();ctx.arc(x+Math.cos(angle)*(r+5+drift*22),y+Math.sin(angle)*(r+6)-drift*32,.5+j%3*.35,0,Math.PI*2);ctx.fill()}
  });
  ctx.globalAlpha=1;
 }
 function render(){if(ready&&draw3d)draw3d.draw(time,w,h)}
 function tick(now){frame=0;if(!active||paused||document.hidden)return;time+=last?Math.min(.05,(now-last)/1000):0;last=now;render();if(now-lastDust>33){paintAtmosphere();lastDust=now}frame=requestAnimationFrame(tick)}
 function schedule(){if(active&&!paused&&!document.hidden&&!frame){last=0;frame=requestAnimationFrame(tick)}}
 function stop(){cancelAnimationFrame(frame);frame=0;last=0}
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();ready=false;canvas.hidden=true;fallback.hidden=false;root.dataset.coinRenderer='fallback'});
 window.addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else schedule()});
 return {start(){active=true;resize();schedule()},stop(){active=false;stop()},pause(value){paused=value;if(value)stop();else schedule()},get renderer(){return ready?'webgl':'fallback'}};
}
