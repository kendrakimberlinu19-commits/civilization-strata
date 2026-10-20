import {createGestureInterpreter,describeHand} from './gesture-logic.js?v=20261020-gesture-scroll';
export function createGestureControl({context,onAction}){
 const panel=document.createElement('aside');panel.className='gesture-control';panel.setAttribute('aria-label','摄像头手势探索');
 panel.innerHTML=`<button class="gesture-launch" aria-expanded="false" aria-controls="gesture-panel">✋ 手势探索</button><section id="gesture-panel" class="gesture-panel" hidden><header><h2>手势探索</h2><button class="gesture-close" aria-label="关闭手势模式">×</button></header><p class="gesture-privacy">摄像头画面仅在本机处理，不录制、不上传。</p><div class="gesture-preview" hidden><video muted playsinline aria-label="镜像摄像头预览"></video><span class="gesture-point" hidden></span></div><p class="gesture-status" role="status" aria-live="polite">开启后，请将一只手放在镜头前。</p><div class="gesture-meter" role="progressbar" aria-label="手势确认进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div><ul><li>左右挥手：切换档案袋</li><li>拇指与食指捏合片刻：开启档案</li><li>内页向上挥手：向下阅读；向下挥手：向上回看</li><li>张开手掌停留：返回上一层</li></ul><p class="gesture-hint">伸出至少两指上下挥动，每次滚动约半屏；手掌稳定停留才会返回。</p><button class="gesture-start">开启摄像头</button><button class="gesture-stop" hidden>停止摄像头</button></section>`;
 document.body.append(panel);
 const $=s=>panel.querySelector(s),launch=$('.gesture-launch'),body=$('.gesture-panel'),start=$('.gesture-start'),stop=$('.gesture-stop'),video=$('video'),preview=$('.gesture-preview'),point=$('.gesture-point'),status=$('.gesture-status'),meter=$('.gesture-meter');
 const logic=createGestureInterpreter();let stream=null,model=null,running=false,generation=0,frame=0,last=0,lastVideo=-1,loading=false;
 function report(label,progress=0){if(status.textContent!==label)status.textContent=label;meter.style.setProperty('--gesture-progress',progress);meter.setAttribute('aria-valuenow',String(Math.round(progress*100)))}
 function halt(message='摄像头已停止。'){
  generation++;running=false;loading=false;cancelAnimationFrame(frame);stream?.getTracks().forEach(t=>t.stop());stream=null;video.srcObject=null;preview.hidden=true;point.hidden=true;
  model?.close();model=null;logic.reset();last=0;lastVideo=-1;start.disabled=false;start.hidden=false;start.textContent='开启摄像头';stop.hidden=true;report(message);
 }
 function close(){halt();body.hidden=true;launch.setAttribute('aria-expanded','false');launch.focus({preventScroll:true})}
 launch.onclick=()=>{if(!body.hidden){close();return}body.hidden=false;launch.setAttribute('aria-expanded','true');start.focus({preventScroll:true})};$('.gesture-close').onclick=close;stop.onclick=()=>halt();
 panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();close()}});
 async function tick(now){
  if(!running)return;
  if(now-last>80&&video.readyState>=2&&video.currentTime!==lastVideo){
   last=now;lastVideo=video.currentTime;
   try{
    const hand=describeHand(model.detectForVideo(video,now).landmarks[0]);
    point.hidden=!hand;if(hand){point.style.left=`${hand.x*100}%`;point.style.top=`${hand.y*100}%`}
    const result=logic.update(hand,now,context());report(result.label,result.progress);if(result.action)onAction(result.action);
   }catch{halt('识别中断，请重新开启摄像头。');return}
  }
  frame=requestAnimationFrame(tick);
 }
 start.onclick=async()=>{
  if(loading||running)return;
  if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){report('请使用 HTTPS 线上地址或本机 localhost 开启摄像头。');return}
  loading=true;const id=++generation;start.disabled=true;stop.hidden=false;report('正在等待摄像头授权…');
  try{
   const acquired=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:640},height:{ideal:480}},audio:false});
   if(id!==generation){acquired.getTracks().forEach(t=>t.stop());return}
   stream=acquired;video.srcObject=stream;await video.play();if(id!==generation)return;preview.hidden=false;report('正在加载本地手部识别模型…');
   const {HandLandmarker,FilesetResolver}=await import('./assets/gesture/vision_bundle.mjs');
   const files=await FilesetResolver.forVisionTasks(new URL('./assets/gesture/wasm/',import.meta.url).href);
   if(id!==generation)return;
   const detector=await HandLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:new URL('./assets/gesture/hand_landmarker.task',import.meta.url).href,delegate:'CPU'},runningMode:'VIDEO',numHands:1,minHandDetectionConfidence:.65,minHandPresenceConfidence:.65,minTrackingConfidence:.65});
   if(id!==generation){detector.close();return}model=detector;running=true;loading=false;start.hidden=true;
   stream.getVideoTracks()[0].addEventListener('ended',()=>{if(running)halt('摄像头已断开，请检查设备后重试。')},{once:true});
   report('将一只手放入画面');frame=requestAnimationFrame(tick);
  }catch(error){if(id!==generation)return;halt(({NotAllowedError:'摄像头权限未开启。请在浏览器中允许后重试。',NotFoundError:'没有找到摄像头，请连接设备后重试。',NotReadableError:'摄像头正被占用，请关闭其他使用摄像头的程序。'})[error.name]||'摄像头或识别模型加载失败，请检查设备与网络后重试。')}
 };
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&(running||loading))halt('页面已离开，摄像头已停止。')});
 window.addEventListener('pagehide',()=>halt());
 return {stop:halt,mount(host=document.body){host.append(panel)}};
}
