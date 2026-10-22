import {archiveModels} from './data/models.js';

let viewerLibrary;
async function loadViewerLibrary(){
 if(!viewerLibrary)viewerLibrary=import('./assets/vendor/model-viewer/model-viewer.min.js').then(()=>{
  const Viewer=customElements.get('model-viewer');
  Viewer.dracoDecoderLocation=new URL('./assets/vendor/model-viewer/draco/',import.meta.url).href;
  Viewer.modelCacheSize=2;
  return Viewer;
 }).catch(error=>{viewerLibrary=null;throw error});
 return viewerLibrary;
}
const icon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 9 8-4.5M12 12 4 7.5M12 12v9"/></svg>';
export function modelGalleryMarkup(copy,esc){
 const models=archiveModels.filter(m=>m.theme===copy.id);
 if(!models.length)return '';
 return `<section class="story-models story-section" id="story-models" aria-labelledby="story-models-title">
 <div class="model-section-heading"><h2 id="story-models-title">三维观察</h2><p>换一个角度，观察形状与细节。<br>点击载入后，可拖动旋转、滚轮或双指缩放。</p></div>
 <div class="model-pair">${models.map(m=>`<article class="model-study" data-model-key="${m.id}">
 <header><span class="model-index">${m.id.toUpperCase()}</span><h3>${esc(m.name)}</h3></header>
 <div class="model-stage" aria-busy="false">
 <img class="model-preview" src="${esc(m.poster)}" alt="${esc(m.name)}参考正视图" loading="lazy" decoding="async">
 <div class="model-surface"></div>
 <button class="model-load" aria-label="载入${esc(m.name)}">${icon}<span>载入模型</span></button>
 <div class="model-progress" role="status" aria-live="polite" hidden><span></span><p>正在准备模型…</p></div>
 </div>
 <div class="model-controls" aria-label="${esc(m.name)}视角控制" hidden>
 <div><button data-model-action="left" aria-label="向左旋转${esc(m.name)}">左转</button><button data-model-action="right" aria-label="向右旋转${esc(m.name)}">右转</button><button data-model-action="zoom-in" aria-label="放大${esc(m.name)}">放大</button><button data-model-action="zoom-out" aria-label="缩小${esc(m.name)}">缩小</button></div>
 <div><button data-model-action="reset">复位视角</button><button data-model-action="stop">结束查看</button></div>
 </div>
 <p class="model-description">${esc(m.description)}</p>
 <p class="model-help">模型载入后，聚焦画面可用方向键转动；也可使用视角按钮。</p>
 </article>`).join('')}</div></section>`;
}
export function mountModelGallery(page,copy,emit){
 const models=archiveModels.filter(m=>m.theme===copy.id);
 const states=models.map(model=>{
  const card=page.querySelector(`[data-model-key="${model.id}"]`);
  const stage=card.querySelector('.model-stage'),surface=card.querySelector('.model-surface'),button=card.querySelector('.model-load'),progress=card.querySelector('.model-progress'),controls=card.querySelector('.model-controls');
  const state={model,card,stage,surface,button,progress,controls,viewer:null,generation:0};
  function reset(){
   state.generation++;state.viewer?.remove();state.viewer=null;surface.replaceChildren();
   stage.classList.remove('is-loaded','is-loading','has-error');stage.setAttribute('aria-busy','false');
   button.hidden=false;button.disabled=false;button.querySelector('span').textContent='载入模型';progress.hidden=true;controls.hidden=true;
  }
  state.reset=reset;
  button.addEventListener('click',async()=>{
   const generation=++state.generation;button.disabled=true;stage.classList.remove('has-error');stage.classList.add('is-loading');stage.setAttribute('aria-busy','true');progress.hidden=false;progress.querySelector('p').textContent='正在准备模型…';
   try{
    await loadViewerLibrary();
    if(generation!==state.generation||page.hidden)return;
    const viewer=document.createElement('model-viewer');state.viewer=viewer;
    const attributes={alt:model.name+'三维模型，可拖动旋转或使用方向键',src:model.src,'camera-controls':'','disable-pan':'','disable-tap':'','touch-action':'none','interaction-prompt':'none',loading:'eager','camera-orbit':model.orbit,'min-camera-orbit':'auto 0deg 40%','max-camera-orbit':'auto 180deg 220%','field-of-view':'30deg','shadow-intensity':'0.8','shadow-softness':'1',exposure:'1','environment-image':'neutral','orbit-sensitivity':'0.65','zoom-sensitivity':'0.65','interpolation-decay':matchMedia('(prefers-reduced-motion: reduce)').matches?'0':'80',tabindex:'0'};
    for(const [name,value] of Object.entries(attributes))viewer.setAttribute(name,value);
    viewer.a11y={'interaction-prompt':'拖动或使用方向键旋转模型。','front':'正面','back':'背面','left':'左侧','right':'右侧','upper-front':'正面上方','lower-front':'正面下方','upper-back':'背面上方','lower-back':'背面下方','upper-left':'左上方','upper-right':'右上方','lower-left':'左下方','lower-right':'右下方'};
    viewer.addEventListener('progress',event=>{
     if(generation!==state.generation)return;
     const percent=Math.round((event.detail.totalProgress||0)*100);
     progress.querySelector('p').textContent=percent<100?`正在载入 · ${percent}%`:'正在呈现材质…';
    });
    viewer.addEventListener('load',()=>{
     if(generation!==state.generation)return;
     stage.classList.remove('is-loading');stage.classList.add('is-loaded');stage.setAttribute('aria-busy','false');progress.hidden=true;button.hidden=true;controls.hidden=false;
     controls.querySelector('button').focus({preventScroll:true});emit('model-load',{categoryId:copy.id,modelId:model.id});
    },{once:true});
    viewer.addEventListener('error',()=>fail(),{once:true});
    surface.append(viewer);
   }catch{fail()}
   function fail(){
    if(generation!==state.generation)return;
    state.viewer?.remove();state.viewer=null;stage.classList.remove('is-loading');stage.classList.add('has-error');stage.setAttribute('aria-busy','false');button.disabled=false;button.hidden=false;button.querySelector('span').textContent='重新载入';progress.hidden=false;progress.querySelector('p').textContent='模型未能载入，请检查网络后重试。';
   }
  });
  controls.addEventListener('click',event=>{
   const action=event.target.closest('[data-model-action]')?.dataset.modelAction,viewer=state.viewer;
   if(!action||!viewer?.loaded)return;
   if(action==='stop'){reset();button.focus({preventScroll:true});return}
   if(action==='reset'){viewer.cameraOrbit=model.orbit;viewer.fieldOfView='30deg';viewer.cameraTarget='auto auto auto'}
   else if(action==='zoom-in'||action==='zoom-out')viewer.zoom(action==='zoom-in'?2:-2);
   else {const orbit=viewer.getCameraOrbit();viewer.cameraOrbit=`${orbit.theta+(action==='left'?-.3:.3)}rad ${orbit.phi}rad ${orbit.radius}m`}
   if(matchMedia('(prefers-reduced-motion: reduce)').matches)viewer.jumpCameraToGoal();
   emit('model-interact',{categoryId:copy.id,modelId:model.id,action});
  });
  return state;
 });
 return {close(){states.forEach(state=>state.reset())}};
}

