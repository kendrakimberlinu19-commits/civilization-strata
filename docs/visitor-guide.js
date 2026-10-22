import {visitorGuide as guide} from './data/visitor-guide.js';
export function guideMarkup({categories,cards,models,esc}){
 const table=t=>`<div class="guide-table-wrap"><table><thead><tr>${t.head.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${t.rows.map(row=>`<tr>${row.map((cell,i)=>`<${i?'td':'th scope="row"'}>${esc(cell)}</${i?'td':'th'}>`).join('')}</tr>`).join('')}</tbody></table></div>`;
 return `<article class="visitor-guide"><header class="guide-cover"><h2 id="guide-title">文明地层<span>参观手册</span></h2><p>${esc(guide.intro)}</p><p class="guide-collection">${categories.length} 个主题 · ${cards.length} 份档案 · ${categories.length} 段短片 · ${models.length} 个模型</p></header><div class="guide-layout"><nav class="guide-nav" aria-label="手册目录">${guide.sections.map(s=>`<button data-guide-jump="${s.id}">${esc(s.title.split('：')[0])}</button>`).join('')}</nav><div class="guide-body">${guide.sections.map(s=>`<section id="guide-${s.id}"><h3>${esc(s.title)}</h3>${(s.paragraphs||[]).map(p=>`<p>${esc(p)}</p>`).join('')}${s.type==='themes'?`<ol class="guide-themes">${categories.map(c=>`<li><span>${esc(c.number)}</span><strong>${esc(c.name)}</strong></li>`).join('')}</ol>`:''}${s.items?`<dl>${s.items.map(([title,body])=>`<div><dt>${esc(title)}</dt><dd>${esc(body)}</dd></div>`).join('')}</dl>`:''}${s.table?table(s.table):''}${(s.paragraphsAfter||[]).map(p=>`<p>${esc(p)}</p>`).join('')}${s.note?`<p class="guide-note">${esc(s.note)}</p>`:''}</section>`).join('')}<footer class="guide-ending"><p>从任何一层开始，寻找你感兴趣的线索。</p><button data-guide-close>收起卷轴，继续参观 <span aria-hidden="true">→</span></button></footer></div></div></article>`;
}
export function bindGuide(dialog){
 dialog.querySelectorAll('[data-guide-jump]').forEach(button=>button.onclick=()=>{
  const target=dialog.querySelector('#guide-'+button.dataset.guideJump);
  const top=target.getBoundingClientRect().top-dialog.getBoundingClientRect().top+dialog.scrollTop-64;
  dialog.scrollTo({top:Math.max(0,top),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 });
 dialog.querySelector('[data-guide-close]').onclick=()=>dialog.close();
}

