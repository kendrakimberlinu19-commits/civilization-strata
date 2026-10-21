import assert from 'node:assert/strict';
import {access,stat} from 'node:fs/promises';
import {categories,cards,featureVideo,themeVideos,sourceLibrary} from '../data/archive.js';
import {exhibit} from '../data/exhibit.js';
import {themeStories} from '../data/theme-stories.js';
assert.equal(new Set(cards.map(c=>c.id)).size,cards.length);
assert.equal(categories.length,6);
assert.equal(themeVideos.length,6);
assert.equal(Object.keys(sourceLibrary).length,20);
for(const category of categories){
 const own=cards.filter(c=>c.category===category.id);assert.equal(own.length,4);
 const story=themeStories[category.id];assert.equal(story.cardIds.length,4);assert.equal(story.number,category.number);
 for(const id of story.cardIds)assert(own.some(c=>c.id===id));
 for(const file of [story.heroImage,story.endingImage,story.diagramImage,story.videoPath])await access(new URL('../'+file,import.meta.url));
 const video=themeVideos.find(v=>v.id===category.id);assert.equal(video.videoPath,story.videoPath);assert(video.duration>0&&story.videoTitle);
 assert(themeStories[story.nextCategory]);
}
for(const card of cards){assert(categories.some(c=>c.id===card.category));assert(card.tags.length&&card.interpretation.length===2&&card.source&&card.basicInfo&&card.caption&&card.observation&&card.limitation);assert('videoPath' in card);assert(card.sourceIds.every(id=>sourceLibrary[id]));assert.equal(card.sourceIds.length,card.sourceLinks.length);assert(!/AI/.test([card.caption,card.summary,card.observation,card.limitation,...card.interpretation.map(p=>p.text)].join(' ')));for(const file of card.gallery){await access(new URL('../'+file,import.meta.url));assert((await stat(new URL('../'+file,import.meta.url))).size<2*1024*1024)}}
assert.equal(featureVideo.videoPath,'');
assert.equal(new Set(exhibit.sleeves.map(s=>s.categoryId)).size,categories.length);
for(const c of categories){const s=exhibit.sleeves.find(x=>x.categoryId===c.id);assert(s?.source);await access(new URL('../'+s.imagePath,import.meta.url));await access(new URL('../'+s.photoPath,import.meta.url));}
await access(new URL('../'+exhibit.backImage,import.meta.url));
assert.equal(cards.length,24);
console.log('PASS: six themes, 24 sourced records, six local videos, 20 source entries and complete picture files.');
