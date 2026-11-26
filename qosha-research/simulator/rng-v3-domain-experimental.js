// 2026-11-26 08:54 Asia/Baku. qosha-research-0.5.3 / recovered qosa-1.0.0.
// Executed equivalent function bodies in V8, not native Node gate. Result: {"N":50000,"start":31000000,"end":31049999,"duplicates":0,"stockMin":1701,"stockMax":1881,"stockChi":33.30864000000001,"serialPairChi":746.367867357345,"crossDomainChi":776.1363200000008,"legacyPairSeparated":true}
// 50000 primary allocations + 50000 second-domain shuffles; zero gameplay rounds/strategies/rollouts.
// Legacy 180000 matched rounds separate. RESULTS.md connector returned empty content (blob 8f7c3b421aca1f35284d8c8ee8ed7c54d6bdd633); do not overwrite it.
// Broad diagnostic thresholds, not calibrated independence tests; overlapping adjacent pairs and deterministic streams limit interpretation.
// Domain separation is distinct initial state, not disjoint infinite streams. No full shuffle support claim.
// Next: opt-in adapters returning canonical tiles and hidden-world allocations, validate exact marginals and replay, then full gates.
'use strict';
// Opt-in domain-separated experimental RNG v3. No changes to legacy replay.
// 64-bit SplitMix counter; distinct uint32 seed/domain pairs map to distinct initial states.
const MASK=(1n<<64n)-1n;
function mix(z){z=((z^(z>>30n))*0xbf58476d1ce4e5b9n)&MASK;z=((z^(z>>27n))*0x94d049bb133111ebn)&MASK;return (z^(z>>31n))&MASK;}
function rng(seed,domain=0){for(const x of [seed,domain])if(!Number.isInteger(x)||x<0||x>0xffffffff)throw Error('uint32 required');let s=mix((BigInt(domain)<<32n)|BigInt(seed));return ()=>{s=(s+0x9e3779b97f4a7c15n)&MASK;return Number(mix(s)>>32n);};}
function shuffle(xs,seed,domain=0){const a=xs.slice(),next=rng(seed,domain);for(let i=a.length-1;i>0;i--){const n=i+1,limit=4294967296-(4294967296%n);let x;do{x=next()}while(x>=limit);const j=x%n;[a[i],a[j]]=[a[j],a[i]];}return a;}
function deal(seed){const d=shuffle(Array.from({length:28},(_,i)=>i),seed,1);return d;}
function test(){const N=50000,start=31000000,counts=Array(28).fill(0),pairs=Array(784).fill(0),cross=Array(784).fill(0);let prev=-1,duplicates=0;const seen=new Set();for(let s=start;s<start+N;s++){const d=deal(s),b=shuffle(Array.from({length:28},(_,i)=>i),s,2);if(new Set(d).size!==28||d.join()!==deal(s).join())throw Error('replay/conservation');const k=[0,9,18].map(i=>d.slice(i,i+9).sort((a,b)=>a-b).join()).join(':')+':'+d[27];if(seen.has(k))duplicates++;seen.add(k);const x=d[27];counts[x]++;if(prev>=0)pairs[prev*28+x]++;cross[x*28+b[27]]++;prev=x;}const chi=(a,n)=>a.reduce((v,x)=>v+(x-n/a.length)**2/(n/a.length),0);const result={N,start,end:start+N-1,duplicates,stockMin:Math.min(...counts),stockMax:Math.max(...counts),stockChi:chi(counts,N),serialPairChi:chi(pairs,N-1),crossDomainChi:chi(cross,N),legacyPairSeparated:deal(1640531527).join()!==deal(937260827).join()};if(duplicates||!result.legacyPairSeparated||result.stockChi>65||result.serialPairChi>950||result.crossDomainChi>950)throw Error(JSON.stringify(result));return result;}
module.exports={rng,shuffle,deal,test};
if(require.main===module)console.log(JSON.stringify(test()));
