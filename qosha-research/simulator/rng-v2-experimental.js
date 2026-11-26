// Run 2026-11-26 07:53 Asia/Baku; qosha-research-0.5.3 / qosa-1.0.0; opt-in RNG v2.
// V8 equivalent function bodies executed, not native Node checkout. Seeds 0..99999 + legacy pair.
// Result: {"seeds":100000,"firstWordCollisions":0,"duplicateAllocations":0,"stockMin":3387,"stockMax":3705,"legacyPairSeparated":true}
// Zero gameplay rounds, strategies or rollouts; legacy 180000 matched rounds separate.
// Odd multiplier and xor-shifts are bijections; first word is injective over uint32 seeds.
// Rejection removes modulo mapping bias for uniform words, not proof of independent shuffles.
// Adjacent seeds share shifted streams; do not claim independent samples or full shuffle support.
// Next: use domain-separated seed derivation and test serial correlation before integrating
// opt-in deal/hidden-world adapters; preserve legacy replay and execute formal gates.
'use strict';
// Opt-in research RNG v2. Legacy engine/hidden-world streams remain unchanged.
// A bijective 32-bit mixer over a Weyl counter, including zero.
function mix32(z){z>>>=0;z=Math.imul(z^(z>>>16),0x21f0aaad);z=Math.imul(z^(z>>>15),0x735a2d97);return (z^(z>>>15))>>>0;}
function rng(seed){if(!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff)throw new Error('invalid uint32 seed');let state=seed;return ()=>{state=(state+0x9e3779b9)>>>0;return mix32(state);};}
function shuffle(xs,seed){const a=xs.slice(),next=rng(seed);for(let i=a.length-1;i>0;i--){const n=i+1,limit=4294967296-(4294967296%n);let x;do{x=next();}while(x>=limit);const j=x%n;[a[i],a[j]]=[a[j],a[i]];}return a;}
function test(){const seen=new Set(),deals=new Set(),stock=Array(28).fill(0);let duplicates=0;const deck=Array.from({length:28},(_,i)=>i);for(let s=0;s<100000;s++){const x=rng(s)();if(seen.has(x))throw Error('first word collision');seen.add(x);const d=shuffle(deck,s);if(new Set(d).size!==28||d.join()!==shuffle(deck,s).join())throw Error('conservation/replay');const key=d.slice(0,9).sort((a,b)=>a-b).join()+':'+d.slice(9,18).sort((a,b)=>a-b).join()+':'+d.slice(18,27).sort((a,b)=>a-b).join()+':'+d[27];if(deals.has(key))duplicates++;deals.add(key);stock[d[27]]++;}const a=1640531527,b=937260827;if(rng(a)()===rng(b)()||shuffle(deck,a).join()===shuffle(deck,b).join())throw Error('legacy collision persists');return {seeds:100000,firstWordCollisions:0,duplicateAllocations:duplicates,stockMin:Math.min(...stock),stockMax:Math.max(...stock),legacyPairSeparated:true};}
module.exports={mix32,rng,shuffle,test};
if(require.main===module)console.log(JSON.stringify(test()));
