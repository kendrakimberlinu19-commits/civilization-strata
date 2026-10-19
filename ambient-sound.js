// Quiet synthesized ambience; starts only from the visitor's sound button.
export function createAmbientSound(button,slider){
 let context=null,gain=null,on=false;
 async function toggle(){
  try{
   if(!context){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw new Error('当前浏览器不支持环境音');context=new Audio();gain=context.createGain();gain.gain.value=0;gain.connect(context.destination);
    const noise=context.createBuffer(1,context.sampleRate*3,context.sampleRate),data=noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.25;
    const source=context.createBufferSource();source.buffer=noise;source.loop=true;const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=160;source.connect(filter);filter.connect(gain);source.start();
    const tone=context.createOscillator();tone.type='sine';tone.frequency.value=55;const toneGain=context.createGain();toneGain.gain.value=.02;tone.connect(toneGain);toneGain.connect(gain);tone.start();
   }
   on=!on;await context.resume();gain.gain.setTargetAtTime(on?Number(slider.value)*.12:0,context.currentTime,.12);
   button.setAttribute('aria-pressed',String(on));button.setAttribute('aria-label',on?'关闭环境声音':'开启环境声音');button.dataset.audioStatus=on?'playing':'muted';button.title=on?'关闭环境声音':'开启环境声音';
  }catch(error){button.title=error.message;button.dataset.audioStatus='unavailable';button.setAttribute('aria-label',error.message)}
 }
 button.onclick=toggle;slider.addEventListener('input',()=>{if(gain&&on)gain.gain.setTargetAtTime(Number(slider.value)*.12,context.currentTime,.08)});
}
