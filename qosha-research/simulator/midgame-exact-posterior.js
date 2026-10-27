'use strict';
// Exact, uniform 3-player conditional hidden-world allocator.
// Pass masks are caller-supplied legal-tile sets from OBSERVED no-stock passes.
// A past pass remains informative only if that player acquired no tiles afterward.
// Branch geometry is deliberately NOT inferred here.
// node qosha-research/simulator/midgame-exact-posterior.js test
// node qosha-research/simulator/midgame-exact-posterior.js 2018000 12000
const key=t=>{if(!Array.isArray(t)||t.length!==2||t.some(x=>!Number.isInteger(x)||x<0||x>6))throw Error('invalid tile');return [Math.min(...t),Math.max(...t)].join('-');};
const deck=()=>{const a=[];for(let i=0;i<=6;i++)for(let j=i;j<=6;j++)a.push([i,j]);return a;};
const copy=a=>a.map(t=>t.slice());
function fixture(stock=false){
 const played=[[1,1],[0,0],[0,1],[0,2],[0,3],[0,4]];
 const focal=[[1,2],[1,3],[1,4],[1,5],[2,6]];
 const touching=n=>deck().filter(t=>t.includes(n));
 return {focalHand:focal,playedTiles:stock?played.slice(0,5):played,
  knownOpponentTiles:stock?{1:[[2,2]],2:[]}:{1:[],2:[]},
  handSizes:[5,9,8],stockSize:stock?1:0,
  passObservations:[
   {player:1,forbiddenTiles:touching(6),noInterveningDraw:true,source:'hypothetical no-stock pass with legal number 6'},
   {player:2,forbiddenTiles:touching(2),noInterveningDraw:true,source:'hypothetical no-stock pass with legal number 2'}]};
}
function prepare(spec){
 if(!spec||!Array.isArray(spec.focalHand)||!Array.isArray(spec.playedTiles)||!Array.isArray(spec.handSizes)||spec.handSizes.length!==3)throw Error('missing public history/hand sizes');
 const hs=spec.handSizes,stock=spec.stockSize;
 if(hs.some(x=>!Number.isInteger(x)||x<0)||!Number.isInteger(stock)||stock<0||hs[0]!==spec.focalHand.length)throw Error('invalid capacities');
 const fixed=spec.knownOpponentTiles||{1:[],2:[]},a=fixed[1]||[],b=fixed[2]||[];
 if(!Array.isArray(a)||!Array.isArray(b)||a.length>hs[1]||b.length>hs[2])throw Error('invalid known opponent tiles');
 const known=[...spec.playedTiles,...spec.focalHand,...a,...b].map(key);
 if(new Set(known).size!==known.length)throw Error('duplicate known tile');
 const universe=new Set(deck().map(key));
 if(known.some(k=>!universe.has(k)))throw Error('tile outside deck');
 const used=new Set(known),pool=deck().filter(t=>!used.has(key(t)));
 const caps=[hs[1]-a.length,hs[2]-b.length,stock];
 if(caps.reduce((x,y)=>x+y,0)!==pool.length)throw Error('unknown pool/slot mismatch');
 const forbidden=[new Set(),new Set()];
 for(const obs of spec.passObservations||[]){
  if(!obs||![1,2].includes(obs.player)||obs.noInterveningDraw!==true||!Array.isArray(obs.forbiddenTiles)||!obs.source)throw Error('pass must document seat, legal set, and no subsequent draw');
  for(const t of obs.forbiddenTiles)forbidden[obs.player-1].add(key(t));
 }
 if(a.some(t=>forbidden[0].has(key(t)))||b.some(t=>forbidden[1].has(key(t))))throw Error('known opponent tile contradicts pass');
 const allow=pool.map(t=>[!forbidden[0].has(key(t)),!forbidden[1].has(key(t)),true]);
 const memo=new Map();
 function ways(i,x,y,z){
  if(x<0||y<0||z<0)return 0n;
  if(i===pool.length)return x===0&&y===0&&z===0?1n:0n;
  const k=i+':'+x+':'+y+':'+z;
  if(memo.has(k))return memo.get(k);
  const c=[x,y,z];let n=0n;
  for(let seat=0;seat<3;seat++)if(allow[i][seat]&&c[seat]>0){c[seat]--;n+=ways(i+1,...c);c[seat]++;}
  memo.set(k,n);return n;
 }
 const total=ways(0,...caps);
 if(!total)throw Error('no allocations satisfy the public history and pass masks');
 return {spec,pool,caps,allow,ways,total,known:[copy(a),copy(b)]};
}
function rng(seed){
 let x=(Number(seed)>>>0)+0x9e3779b9>>>0;
 x=Math.imul(x^(x>>>16),0x21f0aaad)>>>0;
 x=Math.imul(x^(x>>>15),0x735a2d97)>>>0;
 x=(x^(x>>>15))>>>0||0x9e3779b9;
 return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;};
}
function below(n,r){
 if(n<=1n)return 0n;
 const bits=n.toString(2).length,chunks=Math.ceil(bits/32),mask=(1n<<BigInt(bits))-1n;
 for(;;){let x=0n;for(let i=0;i<chunks;i++)x=(x<<32n)|BigInt(r());x&=mask;if(x<n)return x;}
}
function samplePrepared(p,seed){
 const r=rng(seed),remaining=p.caps.slice(),assigned=[[],[],[]];
 for(let i=0;i<p.pool.length;i++){
  const choices=[];let total=0n;
  for(let seat=0;seat<3;seat++)if(p.allow[i][seat]&&remaining[seat]){
   remaining[seat]--;const n=p.ways(i+1,...remaining);remaining[seat]++;
   if(n){choices.push([seat,n]);total+=n;}
  }
  if(!total)throw Error('broken conditional allocation');
  let u=below(total,r),chosen=-1;
  for(const [seat,n] of choices){if(u<n){chosen=seat;break;}u-=n;}
  if(chosen<0)throw Error('weighted choice failed');
  assigned[chosen].push(p.pool[i].slice());remaining[chosen]--;
 }
 if(remaining.some(Boolean))throw Error('capacities not exhausted');
 return {played:copy(p.spec.playedTiles),hands:[copy(p.spec.focalHand),p.known[0].concat(assigned[0]),p.known[1].concat(assigned[1])],stock:assigned[2],seed};
}
function assertWorld(p,w){
 if(w.hands.some((h,i)=>h.length!==p.spec.handSizes[i])||w.stock.length!==p.spec.stockSize)throw Error('world sizes');
 const ks=[...w.played,...w.hands.flat(),...w.stock].map(key);
 if(ks.length!==28||new Set(ks).size!==28)throw Error('28-tile conservation');
 if(w.hands[1].some(t=>p.spec.passObservations.filter(x=>x.player===1).some(x=>x.forbiddenTiles.some(z=>key(z)===key(t))))||
    w.hands[2].some(t=>p.spec.passObservations.filter(x=>x.player===2).some(x=>x.forbiddenTiles.some(z=>key(z)===key(t)))))throw Error('pass incompatibility');
}
function exactBruteNoStock(p){
 if(p.caps[2]!==0||p.known.some(x=>x.length))throw Error('brute fixture only');
 const n=p.pool.length,k=p.caps[0],chosen=[],out={valid:0,marginalSeat1:0,partitions:0};
 function rec(start){
  if(chosen.length===k){
   out.partitions++;
   const s=new Set(chosen);
   if(p.pool.some((_,i)=>!(s.has(i)?p.allow[i][0]:p.allow[i][1])))return;
   out.valid++;
   if(chosen.some(i=>key(p.pool[i])==='3-4'))out.marginalSeat1++;
   return;
  }
  for(let i=start;i<=n-(k-chosen.length);i++){chosen.push(i);rec(i+1);chosen.pop();}
 }
 rec(0);return out;
}
function test(){
 const p=prepare(fixture()),e=exactBruteNoStock(p);
 if(p.total!==21n||e.valid!==21||e.partitions!==24310||e.marginalSeat1!==15)throw Error('independent exact enumeration disagrees');
 for(let i=0;i<200;i++){
  const a=samplePrepared(p,2018000+i),b=samplePrepared(p,2018000+i);
  assertWorld(p,a);
  if(JSON.stringify(a)!==JSON.stringify(b))throw Error('seed replay');
 }
 const s=prepare(fixture(true));
 for(let i=0;i<200;i++)assertWorld(s,samplePrepared(s,2020000+i));
 let rejected=0;
 const bad=fixture();bad.passObservations[0].noInterveningDraw=false;
 try{prepare(bad);}catch(e){rejected++;}
 const dup=fixture();dup.playedTiles.push(dup.focalHand[0]);
 try{prepare(dup);}catch(e){rejected++;}
 const contradiction=fixture();contradiction.passObservations[0].forbiddenTiles=deck();
 try{prepare(contradiction);}catch(e){rejected++;}
 if(rejected!==3)throw Error('negative guards failed');
 return {passed:true,exactPartitions:e.partitions,validConditional:e.valid,flexibleTileSeat1Exact:e.marginalSeat1+'/'+e.valid,stockAndFixedOpponentFixture:true,replaySeeds:200,rejectedInvalidSpecs:3};
}
function run(start=2018000,count=12000){
 if(!Number.isInteger(start)||start<0||!Number.isInteger(count)||count<100)throw Error('bad seed range');
 const p=prepare(fixture()),exact=exactBruteNoStock(p),observed={seat1Flex34:0,distinct:new Set()};
 for(let i=0;i<count;i++){
  const w=samplePrepared(p,start+i);assertWorld(p,w);
  observed.seat1Flex34+=+w.hands[1].some(t=>key(t)==='3-4');
  observed.distinct.add(w.hands[1].map(key).sort().join(','));
 }
 const target=exact.marginalSeat1/exact.valid,rate=observed.seat1Flex34/count,z=(rate-target)/Math.sqrt(target*(1-target)/count);
 if(Math.abs(z)>5||observed.distinct.size!==21)throw Error('conditional uniform calibration failed');
 return {schema:'qosha-midgame-exact-posterior/v1',timestampBaku:new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',dateStyle:'short',timeStyle:'medium'}).format(new Date())+' +04:00',
  engine:'qosa-research-0.5.3 + midgame-exact-posterior-1.0',rules:'recovered qosa-1.0.0; tile conservation only; hypothetical documented no-stock pass masks, no geometry inference',
  seedRange:[start,start+count-1],deals:0,modelRounds:0,forcedContinuations:0,hiddenWorldAllocations:count,strategies:'none; exact uniform conditional allocation',
  publicFixture:{played:fixture().playedTiles.map(key),focal:fixture().focalHand.map(key),handSizes:[5,9,8],stockSize:0,passSeat1:'all 6-X forbidden',passSeat2:'all 2-X forbidden',assumption:'both passes were genuine no-stock passes; no intervening draw or acquisition'},
  exact:{unconstrainedPartitions:exact.partitions,passCompatiblePartitions:exact.valid,conditionalFraction:exact.valid/exact.partitions,
    flexible34Seat1:exact.marginalSeat1+'/'+exact.valid,distinctWorlds:21},
  sampled:{seedCount:count,distinctWorlds:observed.distinct.size,seat1Has34:observed.seat1Flex34,rate,expected:target,z},
  tests:test(),confidence:'Exact independent 17-choose-9 enumeration plus seeded calibration; no authentic game-state validation',
  limitations:['Synthetic legal-tile masks, not an observed authentic match','Pass constraints require no subsequent tile acquisition','Opponent choice policy ignored; conditional allocations uniform','Branch unlock and block-tie scoring still unresolved','Not a winning strategy or naturally occurring position frequency'],
  nextAction:'Wire posterior to public played-tile histories and pass-time legal masks in a validated branch model; verify authentic late-arrival rule before tactical rollouts'};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||2018000),+(a[1]||12000)),null,2));}
module.exports={fixture,prepare,samplePrepared,assertWorld,exactBruteNoStock,test,run};
