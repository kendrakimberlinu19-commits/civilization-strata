// Geometric gestures use palm-relative distances, independent of camera resolution.
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function describeHand(points){
 if(!points||points.length!==21||points.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)))return null;
 const scale=distance(points[0],points[9]);if(scale<.035)return null;
 const extended=[8,12,16,20].filter(t=>distance(points[t],points[0])>distance(points[t-2],points[0])*1.22).length;
 return {scale,x:1-(points[0].x+points[5].x+points[17].x)/3,y:(points[0].y+points[5].y+points[17].y)/3,
  pinch:distance(points[4],points[8])/scale,open:extended===4&&distance(points[4],points[8])/scale>.65,extended};
}
export function createGestureInterpreter(){
 let history=[],pinchStart=null,palmStart=null,palmAnchor=null,locked=false,cooldown=0,mode='',lastSeen=0;
 function clear(){history=[];pinchStart=null;palmStart=null;palmAnchor=null}
 return {reset(){clear();locked=false;cooldown=0;mode='';lastSeen=0},
  update(hand,now,context='deck'){
   if(context!==mode){clear();locked=true;mode=context;cooldown=now+650}
   if(!hand){pinchStart=null;palmStart=null;palmAnchor=null;if(now-lastSeen>180)history=[];if(now-lastSeen>350)locked=false;return {label:'将一只手放入画面',progress:0}}
   lastSeen=now;
   if(hand.pinch>.55)locked=false;
   if(now<cooldown){clear();return {label:'动作已完成 · 稍停后继续',progress:0}}
   if(context==='deck'&&hand.pinch<.32&&!locked){
    history=[];palmStart=null;pinchStart??=now;
    const progress=Math.min(1,(now-pinchStart)/450);
    if(progress===1){locked=true;cooldown=now+1300;clear();return {action:'open',label:'开启当前档案',progress:1}}
    return {label:'保持捏合 · 开启档案',progress};
   }
   pinchStart=null;
   if((context==='story'||context==='dialog')&&hand.extended>=1&&hand.pinch>.38){
    history.push({x:hand.x,y:hand.y,time:now});history=history.filter(p=>now-p.time<1100);
    const start=history[0],dy=hand.y-start.y,dx=hand.x-start.x;
    const threshold=Math.max(.04,Math.min(.085,(hand.scale||.16)*.45));
    if(now-start.time>=80&&Math.abs(dy)>=threshold&&Math.abs(dy)>Math.abs(dx)*1.15){
     cooldown=now+450;clear();return {action:dy<0?'scroll-down':'scroll-up',label:dy<0?'向下阅读':'向上回看',progress:1};
    }
    if(Math.abs(dy)>.018&&Math.abs(dy)>Math.abs(dx)*1.15){
     palmStart=null;palmAnchor=null;
     return {label:dy<0?'继续向上挥动 · 向下阅读':'继续向下挥动 · 向上回看',progress:Math.min(.95,Math.abs(dy)/threshold)};
    }
   }else if(context!=='deck')history=[];
   if(context!=='deck'&&context!=='busy'&&hand.open){
    if(!palmAnchor||distance(hand,palmAnchor)>.07){palmAnchor=hand;palmStart=now}
    palmStart??=now;const progress=Math.min(1,(now-palmStart)/1400);
    if(progress===1){cooldown=now+1500;clear();return {action:'back',label:'返回上一层',progress:1}}
    return {label:'手掌停留 · 返回上一层',progress};
   }
   palmStart=null;palmAnchor=null;
   if(context==='deck'&&hand.extended>=2&&hand.pinch>.55){
    history.push({x:hand.x,y:hand.y,time:now});history=history.filter(p=>now-p.time<650);
    const start=history[0],dx=hand.x-start.x;
    if(now-start.time>=140&&Math.abs(dx)>.20&&Math.abs(hand.y-start.y)<.16){
     cooldown=now+1100;clear();return {action:dx<0?'next':'previous',label:dx<0?'下一份档案':'上一份档案',progress:1};
    }
   }else if(context==='deck')history=[];
   return {label:context==='deck'?'左右挥手切换 · 捏合开启':context==='busy'?'正在进入档案…':'上下挥手阅读 · 手掌停留返回',progress:0};
  }};
}
