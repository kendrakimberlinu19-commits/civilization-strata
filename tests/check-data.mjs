import assert from 'node:assert/strict';
import {access,stat} from 'node:fs/promises';
import {categories,cards,featureVideo} from '../data/archive.js';
import {exhibit} from '../data/exhibit.js';
import {themeStories} from '../data/theme-stories.js';
assert.equal(new Set(cards.map(c=>c.id)).size,cards.length);
assert.equal(categories.length,4);
for(const category of categories){
 const own=cards.filter(c=>c.category===category.id);assert.equal(own.length,6);
 const story=themeStories[category.id];assert.equal(story.cardIds.length,6);assert.equal(story.number,category.number);
 for(const id of story.cardIds)assert(own.some(c=>c.id===id));
 for(const file of [story.heroImage,story.endingImage])await access(new URL('../'+file,import.meta.url));
 assert(themeStories[story.nextCategory]);
}
for(const card of cards){assert(categories.some(c=>c.id===card.category));assert(card.tags.length&&card.interpretation.length===2&&card.source&&card.ai.generated);assert('videoPath' in card);await access(new URL('../'+card.imagePath,import.meta.url));assert((await stat(new URL('../'+card.imagePath,import.meta.url))).size<2*1024*1024)}
assert.equal(featureVideo.videoPath,'');
assert.equal(new Set(exhibit.sleeves.map(s=>s.categoryId)).size,categories.length);
for(const c of categories){const s=exhibit.sleeves.find(x=>x.categoryId===c.id);assert(s?.source&&s.aiLabel);await access(new URL('../'+s.imagePath,import.meta.url));}
await access(new URL('../'+exhibit.backImage,import.meta.url));
assert.equal(cards.length,24);
assert.equal(cards.find(c=>c.id==='A-002').name,'简牍文书');
assert(cards.find(c=>c.id==='A-006').imagePath.endsWith('-textile.webp'));
console.log('PASS: 4 consistent narratives, 24 unique complete records, optimized images, editorial corrections and empty video state.');
