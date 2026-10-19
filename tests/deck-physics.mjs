import assert from 'node:assert/strict';
import {createDeckPhysics} from '../deck-physics.js';
function run(speed,fps){const p=createDeckPhysics({count:4,position:1});p.beginDrag();p.dragTo(1.3);p.release(speed);const path=[];for(let i=0;i<fps*5;i++){p.advance(1/fps);path.push(p.position);}return {p,path};}
const slow=run(0,60),fling=run(3,60);
assert.equal(slow.p.position,1);assert.equal(fling.p.position,2);assert.ok(fling.path[5]>1.5,'Release momentum must move farther after pointer stops');
for(const fps of [30,60,144]){const r=run(3,fps);assert.equal(r.p.position,2);assert.equal(r.p.mode,'idle');assert.ok(r.path.every(Number.isFinite));}
const edge=createDeckPhysics({count:4,position:0});edge.beginDrag();edge.dragTo(-4);assert.ok(edge.position<0&&edge.position>-.34,'Dragging beyond boundary must be elastic and bounded');edge.release(-4);for(let i=0;i<300;i++)edge.advance(1/60);assert.equal(edge.position,0);assert.equal(edge.mode,'idle');
const pause=createDeckPhysics({count:4,position:1});pause.beginDrag();pause.dragTo(1.3);pause.release(0);for(let i=0;i<180;i++)pause.advance(1/60);assert.equal(pause.position,1);
const interrupted=createDeckPhysics({count:4,position:1});interrupted.beginDrag();interrupted.release(3);interrupted.advance(.05);const grabbedAt=interrupted.position;interrupted.beginDrag();assert.equal(interrupted.position,grabbedAt);assert.equal(interrupted.velocity,0);interrupted.dragTo(2.25);assert.equal(interrupted.position,2.25);assert.equal(interrupted.mode,'drag');interrupted.select(0,true);assert.equal(interrupted.position,0);
console.log('PASS: release inertia, elastic boundary, settling at 30/60/144 fps, paused release and interruption.');
