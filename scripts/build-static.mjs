import {mkdir,readFile,readdir,copyFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'dist');
const runtime=['model-gallery.js','model-gallery.css','data/models.js','coin-scene.js','data/landing-coins.js','sound-effects.css','scroll-dialog.css','typography.css','landing-entry.js','landing-entry.css','index.html','styles.css','floating-exhibit.css','exhibit-polish.css','tools-story.css','archive-entry.css','gesture-control.css','gesture-control.js','gesture-logic.js','floating-app.js','floating-deck.js','deck-physics.js','stone-dust.js','ambient-sound.js','tools-story.js','archive-entry.js','data/archive.js','data/exhibit.js','data/theme-stories.js'];
await mkdir(out,{recursive:true});
async function copy(relative){await mkdir(path.dirname(path.join(out,relative)),{recursive:true});await copyFile(path.join(root,relative),path.join(out,relative));}
for(const file of runtime)await copy(file);
async function media(dir){for(const f of await readdir(path.join(root,dir),{withFileTypes:true})){const relative=path.join(dir,f.name);if(f.isDirectory())await media(relative);else if(/\.(webp|mp4|webm)$/i.test(f.name))await copy(relative)}}
async function gestureAssets(dir){for(const f of await readdir(path.join(root,dir),{withFileTypes:true})){const relative=path.join(dir,f.name);if(f.isDirectory())await gestureAssets(relative);else await copy(relative)}}
await gestureAssets('assets/gesture');
await gestureAssets('assets/fonts');
await gestureAssets('assets/models');
await gestureAssets('assets/vendor');
await media('assets/images');
await copy('assets/images/coins/antique-pattern-atlas.png');
await copy('assets/images/coins/SOURCE.md');
await copy('assets/images/scroll/parchment-scroll.png');
await copy('assets/images/scroll/SOURCE.md');
await mkdir(path.join(out,'assets/videos'),{recursive:true});
await media('assets/videos');
await writeFile(path.join(out,'.nojekyll'),'');
await writeFile(path.join(out,'404.html'),await readFile(path.join(root,'index.html')));
console.log(`Static build ready: ${out}`);
