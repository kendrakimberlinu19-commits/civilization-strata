// Position is measured in archive spacings; velocity is spacings per second.
// This model is independent of frame rate, DOM geometry, and pointer devices.
export function createDeckPhysics({count,position=0}){
 const max=Math.max(0,count-1),bound=x=>Math.max(0,Math.min(max,x));
 let x=bound(position),v=0,goal=null,mode='idle';
 const friction=4.2;
 function spring(target,dt,stiffness=90,damping=18){
  const steps=Math.ceil(dt*120),h=dt/Math.max(1,steps);
  for(let i=0;i<steps;i++){v+=(-stiffness*(x-target)-damping*v)*h;x+=v*h;}
 }
 return {
  get position(){return x},get velocity(){return v},get target(){return goal},get mode(){return mode},
  get moving(){return mode==='coast'||mode==='snap'},
  beginDrag(){mode='drag';v=0;goal=null;},
  dragTo(raw){
   // Resistance approaches a finite extension instead of hitting a hard boundary.
   const edge=bound(raw),distance=raw-edge;
   x=edge+Math.sign(distance)*.34*(1-Math.exp(-Math.abs(distance)/.34));
  },
  release(speed=0){v=Math.max(-6,Math.min(6,speed));goal=null;mode='coast';if(Math.abs(v)<.15){goal=Math.round(bound(x));mode='snap';}},
  select(index,instant=false){goal=Math.round(bound(index));v=0;mode='snap';if(instant){x=goal;v=0;mode='idle';}},
  halt(){x=bound(x);v=0;goal=null;mode='idle';},
  advance(seconds){
   const dt=Math.min(.05,Math.max(0,seconds));if(!dt||!this.moving)return;
   if(mode==='coast'){
    if(x<0||x>max){spring(bound(x),dt,105,17);}
    else {const decay=Math.exp(-friction*dt);x+=v*(1-decay)/friction;v*=decay;}
    if(Math.abs(v)<.28&&x>-.025&&x<max+.025){goal=Math.round(bound(x));mode='snap';}
   }
   if(mode==='snap'){
    spring(goal,dt);
    if(Math.abs(x-goal)<.0015&&Math.abs(v)<.015){x=goal;v=0;mode='idle';}
   }
  },
 };
}
