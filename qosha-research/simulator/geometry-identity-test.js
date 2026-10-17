'use strict';
// Exhaustive legal non-double placement geometry invariant.
// Run: node qosha-research/simulator/geometry-identity-test.js
const tiles=[];for(let a=0;a<=6;a++)for(let b=a+1;b<=6;b++)tiles.push([a,b]);
const sorted=x=>x.slice().sort((a,b)=>a-b).join(',');
let pairs=0,equalPips=0,collisions=0;
for(const [a,b] of tiles)for(const [c,d] of tiles){
 if(a===c&&b===d)continue;
 for(const [p,q] of [[a,b],[b,a]])for(const [r,s] of [[c,d],[d,c]]){
  pairs++;if(a+b===c+d)equalPips++;
  // Different sides: unchanged ends cancel from multiset comparison.
  if(sorted([q,r])===sorted([p,s]))collisions++;
  // Same side: requires same starting end and same resulting end.
  if(p===r&&q===s)collisions++;
 }
}
if(tiles.length!==21||pairs!==1680||equalPips!==104||collisions!==0)throw Error('geometry invariant');
const opened=new Set([1,2,4,5,6]);
const a=[3,2,3,0],b=[3,3,3,5];
const accessible=x=>x.filter(n=>opened.has(n)).length;
if(accessible(a)!==1||accessible(b)!==1||sorted(a)===sorted(b))throw Error('seed 715654');
console.log('geometry identity PASS', {tiles:21,pairs,equalPips,collisions});
