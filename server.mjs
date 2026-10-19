import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {networkInterfaces} from 'node:os';
const root=path.dirname(fileURLToPath(import.meta.url)),port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.mp4':'video/mp4','.webm':'video/webm'};
const publicFiles=new Set(['index.html','styles.css','floating-exhibit.css','exhibit-polish.css','tools-story.css','tools-story.js','archive-entry.js','archive-entry.css','data/tools-story.js','data/theme-stories.js','floating-app.js','floating-deck.js','ambient-sound.js','data/exhibit.js','exploration.css','archive-deck.css','app.js','archive-deck.js','stone-deck.js','stone-dust.js','deck-physics.js','stone-deck.css','data/sleeves.js','scroll-scene.js','data/archive.js','data/exploration.js']);
const handler=async(req,res)=>{try{
 const url=new URL(req.url,'http://localhost');
 const relative=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'index.html';
 const file=path.resolve(root,relative);
 const media=/^assets\/(images|videos)\/[\w\-./\u4e00-\u9fff ]+\.(webp|png|jpe?g|mp4|webm)$/i.test(relative);
 if(!file.startsWith(root+path.sep)||(!publicFiles.has(relative)&&!media)){res.writeHead(403);return res.end('Forbidden')}
 const bytes=await readFile(file);
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(bytes);
}catch{res.writeHead(404);res.end('File not found')}};
const hosts=['127.0.0.1'];
if(process.argv.includes('--lan')){
 const addresses=Object.values(networkInterfaces()).flat().filter(a=>a.family==='IPv4'&&!a.internal&&/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(a.address));
 const lanHost=process.env.STRATA_LAN_HOST||addresses[0]?.address;
 if(lanHost)hosts.push(lanHost);else console.warn('LAN unavailable; local preview remains available.');
}
for(const host of hosts){
 const server=http.createServer(handler);
 server.on('error',error=>{console.error(`Cannot listen on ${host}:${port}: ${error.message}`);process.exit(1)});
 server.listen(port,host,()=>console.log(`${host==='127.0.0.1'?'Local':'LAN'}: http://${host}:${port}`));
}

