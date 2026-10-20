import assert from 'node:assert/strict';
import {createGestureInterpreter,describeHand} from '../gesture-logic.js';
const hand=(x=.5,patch={})=>({x,y:.5,pinch:1,open:true,extended:4,...patch});
function ready(context='deck'){const g=createGestureInterpreter();g.update(hand(),0,context);g.update(hand(),700,context);return g}
assert.equal(describeHand(null),null);assert.equal(describeHand(Array(21).fill({x:0,y:0})),null);
let g=ready();assert.equal(g.update(hand(.25),900).action,'next');
assert.equal(g.update(hand(.8),1000).action,undefined,'cooldown blocks repeated switching');
g=ready();assert.equal(g.update(hand(.75),900).action,'previous');
g=ready();assert.equal(g.update(hand(.5,{pinch:.2}),800).action,undefined);
assert.equal(g.update(hand(.5,{pinch:.2}),1300).action,'open');
assert.equal(g.update(hand(.5,{pinch:.2}),3000).action,undefined,'held pinch must not repeat');
g=ready();g.update(hand(.5,{pinch:.2}),800);g.update(null,1000);assert.equal(g.update(hand(.5,{pinch:.2}),1400).action,undefined,'lost tracking cancels hold');
g=ready('story');g.update(hand(),800,'story');assert.equal(g.update(hand(),2200,'story').action,'back');
g=ready('story');g.update(hand(),800,'story');g.update(hand(.7),1800,'story');assert.equal(g.update(hand(.7),2250,'story').action,undefined,'moving palm cancels return hold');
g=ready('story');assert.equal(g.update(hand(.8),950,'story').action,undefined,'swiping cannot switch while reading');
g=ready('busy');assert.equal(g.update(hand(.5,{pinch:.2}),3000,'busy').action,undefined);
g=ready();g.update(hand(.5,{pinch:.2}),800);assert.equal(g.update(hand(.5,{pinch:.2}),1300,'story').action,undefined,'route changes cancel pending action');
console.log('PASS: mirrored swipes, pinch hold/release, return hold, cooldown, tracking loss and reading/transition guards.');
