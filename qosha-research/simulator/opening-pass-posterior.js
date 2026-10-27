'use strict';
// Confirmed first-round 3x9 subset only: 1-1 played, starter took stock,
// starter has no 1-X and passed. Condition on first opponent also passing
// while all four untouched ends remain 1. Not a general midgame pass model.
// Run: node qosha-research/simulator/opening-pass-posterior.js test
// Run: node qosha-research/simulator/opening-pass-posterior.js 2002940 2003000 5000
function allTiles(){const a=[];for(let i=0;i<=6;i++)for(let j=i;j<=6;j++)a.push([i,j]);return a;}
function mixSeed(seed){let x=Number(seed)>>>0;x=(x+0x9e3779b9)>>>0;x=Math.imul(x^(x>>>16),0x21f0aaad)>>>0;x=Math.imul(x^(x>>>15),0x735a2d97)>>>0;return(x^(x>>>15))>>>0;}
function connectorCount(h){return h.filter(t=>t[0]===1||t[1]===1).length;}
function hasBridge(hand){const s=new Set(hand.map(t=>t[0]+'-'+t[1]));for(let x=0;x<=6;x++)if(s.has(x+'-'+x))for(let y=x+1;y<=6;y++)if(s.has(y+'-'+y)&&s.has(x+'-'+y))return true;return false;}
const key=t=>[Math.min(t[0],t[1]),Math.max(t[0],t[1])].join('-');
const connector=t=>t[0]===1||t[1]===1;
const choose=(n,k)=>{if(k<0||k>n)return 0;let x=1;for(let i=1;i<=k;i++)x=x*(n-i+1)/i;return Math.round(x);};
function validateFocal(focal){
 if(!Array.isArray(focal)||focal.length!==9)throw Error('focal hand must contain 9 tiles');
 const deck=new Set(allTiles().map(key)),ks=focal.map(key);
 if(ks.some(k=>!deck.has(k))||new Set(ks).size!==9||ks.includes('1-1'))throw Error('invalid focal hand');
 if(focal.some(connector))throw Error('starter cannot pass with a 1-X connector');
}
function rng(seed){let x=mixSeed(seed)||0x9e3779b9;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function pick(pool,k,r){const a=pool.slice();for(let i=0;i<k;i++){const j=i+Math.floor(r()*(a.length-i));[a[i],a[j]]=[a[j],a[i]];}return a.slice(0,k);}
function sampleFocal(seed){return pick(allTiles().filter(t=>!connector(t)&&key(t)!=='1-1'),9,rng(seed));}
function poolFor(focal){validateFocal(focal);const known=new Set(['1-1',...focal.map(key)]);return allTiles().filter(t=>!known.has(key(t)));}
function world(focal,seed,passSeat=1){
 if(passSeat!==1&&passSeat!==2&&passSeat!==null)throw Error('passSeat must be 1, 2, or null');
 const pool=poolFor(focal),eligible=passSeat===null?pool:pool.filter(t=>!connector(t));
 if(eligible.length<9)throw Error('pass impossible for this known focal hand');
 const selected=pick(eligible,9,rng(seed)),sel=new Set(selected.map(key));
 const other=pool.filter(t=>!sel.has(key(t)));
 const hands=passSeat===2?[focal.map(t=>t.slice()),other,selected]:[focal.map(t=>t.slice()),selected,other];
 const all=[[1,1],...hands.flat()];
 if(all.length!==28||new Set(all.map(key)).size!==28||hands.some(h=>h.length!==9))throw Error('conservation');
 if(passSeat!==null&&hands[passSeat].some(connector))throw Error('pass constraint');
 return{played:[[1,1]],hands,stock:[],passSeat,seed};
}
function exact(focal,passSeat=1){
 if(passSeat!==1&&passSeat!==2)throw Error('passSeat must be 1 or 2');
 const pool=poolFor(focal),n=pool.length;if(n!==18)throw Error('remaining pool must have 18 tiles');
 const counts={unconditional:0,pass:0,passBridge:0,otherBridge:0,unconditionalBridge:0};
 const chosen=[];
 function visit(start){
  if(chosen.length===9){
   const selected=chosen.map(i=>pool[i]),chosenSet=new Set(chosen),other=pool.filter((_,i)=>!chosenSet.has(i));
   const passing=passSeat===1?selected:other,nonPassing=passSeat===1?other:selected;
   counts.unconditional++;
   if(hasBridge(passing))counts.unconditionalBridge++;
   if(passing.every(t=>!connector(t))){counts.pass++;counts.passBridge+=+hasBridge(passing);counts.otherBridge+=+hasBridge(nonPassing);}
   return;
  }
  for(let i=start;i<=n-(9-chosen.length);i++){chosen.push(i);visit(i+1);chosen.pop();}
 }
 visit(0);
 if(counts.unconditional!==choose(18,9)||counts.pass!==choose(12,9))throw Error('exact combinatorial mismatch');
 return{...counts,passProbability:counts.pass/counts.unconditional,
  passBridgeRate:counts.passBridge/counts.pass,otherBridgeRate:counts.otherBridge/counts.pass,
  unconditionalBridgeRate:counts.unconditionalBridge/counts.unconditional,
  otherConnectorsAfterPass:6};
}
function test(){
 const f=sampleFocal(2002940);
 validateFocal(f);
 const a=world(f,2003000,1),b=world(f,2003000,1),c=world(f,2003001,1);
 if(JSON.stringify(a)!==JSON.stringify(b)||JSON.stringify(a)===JSON.stringify(c))throw Error('seed replay/diversity');
 if(a.hands[1].some(connector)||connectorCount(a.hands[2])!==6)throw Error('pass information not enforced');
 const reversed=world(f,2003000,2);
 if(reversed.hands[2].some(connector)||connectorCount(reversed.hands[1])!==6)throw Error('seat 2 pass');
 const z=exact(f,1),z2=exact(f,2);
 if(z.pass!==220||z.unconditional!==48620||z2.pass!==220||z.passBridge!==z2.passBridge||z.otherBridge!==z2.otherBridge)throw Error('exact seat symmetry');
 for(const bad of [[...f.slice(0,8),f[0]],[[1,1],...f.slice(0,8)],[[1,2],...f.slice(0,8)]]){
  let failed=false;try{world(bad,2003000,1);}catch(e){failed=true;}if(!failed)throw Error('invalid known hand accepted');
 }
 return{passed:true,exactPartitions:48620,validPassPartitions:220,passProbability:z.passProbability,
  sixConnectorsForcedToOther:true,seedReplay:true,knownHandGuards:true};
}
function run(discoverySeed=2002940,startSeed=2003000,samplesPerFixture=5000){
 if(![discoverySeed,startSeed,samplesPerFixture].every(Number.isInteger)||samplesPerFixture<100||discoverySeed<0||startSeed<0)throw Error('invalid arguments');
 const fixtures=[];let maxAbsZ=0;
 for(let j=0;j<3;j++){
  const focal=sampleFocal(discoverySeed+j);
  const target=exact(focal,1);let passBridge=0,otherBridge=0;
  for(let i=0;i<samplesPerFixture;i++){
   const w=world(focal,startSeed+j*samplesPerFixture+i,1);
   passBridge+=+hasBridge(w.hands[1]);otherBridge+=+hasBridge(w.hands[2]);
  }
  const rates=[{name:'passingOpponentBridge',hits:passBridge,p:target.passBridgeRate},
   {name:'otherOpponentBridge',hits:otherBridge,p:target.otherBridgeRate}].map(({name,hits,p})=>{
    const observed=hits/samplesPerFixture;
    const z=p>0&&p<1?(observed-p)/Math.sqrt(p*(1-p)/samplesPerFixture):observed===p?0:Infinity;
    maxAbsZ=Math.max(maxAbsZ,Math.abs(z));return{name,hits,observed,exact:p,z};
   });
  fixtures.push({discoverySeed:discoverySeed+j,focalHand:focal.map(key),exact:target,
   sampleSeedStart:startSeed+j*samplesPerFixture,sampleSeedEnd:startSeed+(j+1)*samplesPerFixture-1,
   sampleWorlds:samplesPerFixture,rates});
 }
 if(maxAbsZ>5)throw Error('calibration failed: max z '+maxAbsZ);
 const passProb=choose(12,9)/choose(18,9);
 const starterPassProb=choose(21,9)/choose(27,9);
 return{schema:'qosha-opening-pass-posterior/v1',engine:'qosa-research-0.5.3 + opening-pass-posterior-1.0',
  rules:'recovered qosa-1.0.0; confirmed first-round 3x9 1-1+draw, starter forced pass, then first clockwise opponent forced pass on four 1-ends',
  discoverySeeds:[discoverySeed,discoverySeed+2],sampleSeedRange:[startSeed,startSeed+3*samplesPerFixture-1],
  deals:0,modelRounds:0,forcedContinuationRollouts:0,hiddenWorlds:3*samplesPerFixture,
  strategies:'none; exact 18-choose-9 posterior and uniform conditional hidden allocation',
  exactFirstOpponentPassGivenStarterPass:passProb,exactStarterPass:starterPassProb,
  exactJointOpeningTwoPassProbability:passProb*starterPassProb,
  inference:'If starter has no 1-X and passes, and first clockwise opponent also passes before any other tile is played, the remaining opponent must hold all six 1-X connectors.',
  fixtures,maxAbsCalibrationZ:maxAbsZ,
  confidence:'Exact enumeration over all 48,620 hidden partitions for each fixed known starter hand, cross-checked against 15,000 seeded conditional allocations; sampling z gate 5',
  limitations:['Very rare conditional opening event; not an ordinary midgame pass','The first clockwise opponent has not drawn any tile: stock was taken by starter','No opponent policy, branch history beyond untouched 1 ends, blocked winner or full-match scoring',
   'Conditional sampling is uniform over hidden allocations and does not model human choice biases','No real-game strategy win rate or minus-frequency claim'],
  nextAction:'Extend to a known midgame public tile history and pass-compatible hidden hand sizes; validate branch-lock semantics from authentic records before tactical ranking'};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||2002940),+(a[1]||2003000),+(a[2]||5000)),null,2));}
module.exports={world,exact,test,run};
