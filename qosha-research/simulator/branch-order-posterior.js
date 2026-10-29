'use strict';
// Same-model chronology-conditioned posterior for two indistinguishable board snapshots.
// Neither branch-unlocking model is authenticated by physical play.
// node qosha-research/simulator/branch-order-posterior.js test
// node qosha-research/simulator/branch-order-posterior.js 2815592 2048
const e=require('./engine'),hist=require('./branch-order-history-test'),post=require('./midgame-exact-posterior');
const key=e.tileKey,check=(x,m)=>{if(!x)throw Error('branch-order-posterior: '+m);};
const FOCAL=[[0,1],[1,4],[0,2],[2,5],[0,0],[0,3],[3,4]];
function prepare(name){
 check(name==='early'||name==='late','unknown chronology');
 const state=hist.replay(hist[name]);
 const passMask=e.createDoubleSixDeck().filter(t=>state.canPlace(t,'all-current-only'));
 const spec={playedTiles:[...state.played].map(k=>k.split('-').map(Number)),
  focalHand:FOCAL.map(t=>t.slice()),knownOpponentTiles:{1:[],2:[]},
  handSizes:[7,7,7],stockSize:0,
  passObservations:[{player:2,forbiddenTiles:passMask,noInterveningDraw:true,
   source:'synthetic no-stock seat-2 pass; all-current-only PROVISIONAL'}]};
 return {state,passMask,posterior:post.prepare(spec)};
}
function independentBrute(p){
 check(p.pool.length===14&&p.caps.join(',')==='7,7,0','unexpected combinatorial fixture');
 const chosen=[],out={unrestricted:0,compatible:0,seat1Has26:0};
 function visit(from){
  if(chosen.length===7){
   out.unrestricted++;
   const owned=new Set(chosen);
   if(p.pool.some((_,i)=>!(owned.has(i)?p.allow[i][0]:p.allow[i][1])))return;
   out.compatible++;
   if(chosen.some(i=>key(p.pool[i])==='2-6'))out.seat1Has26++;
   return;
  }
  for(let i=from;i<=p.pool.length-(7-chosen.length);i++){
   chosen.push(i);visit(i+1);chosen.pop();
  }
 }
 visit(0);return out;
}
function test(){
 const original=hist.test();
 check(original.passed,'chronological regression');
 const early=prepare('early'),late=prepare('late');
 const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
 check(same(early.state.ends,late.state.ends),'final branch ends differ');
 check(same([...early.state.played].sort(),[...late.state.played].sort()),'played sets differ');
 const eb=independentBrute(early.posterior),lb=independentBrute(late.posterior);
 check(eb.unrestricted===3432&&lb.unrestricted===3432,'unrestricted partitions');
 check(eb.compatible===120&&lb.compatible===330,'chronological pass posterior');
 check(early.posterior.total===120n&&late.posterior.total===330n,'DP != brute');
 check(eb.seat1Has26===120&&lb.seat1Has26===120,'marginal 2-6');
 check(early.passMask.length===8&&late.passMask.length===5,'legal mask sizes');
 for(const x of [early,late])for(let i=0;i<100;i++){
  const seed=2815592+i,a=post.samplePrepared(x.posterior,seed),b=post.samplePrepared(x.posterior,seed);
  post.assertWorld(x.posterior,a);
  check(same(a,b),'seed replay');
 }
 const invalid=early.posterior.spec;
 const bad={...invalid,passObservations:[{...invalid.passObservations[0],noInterveningDraw:false}]};
 let rejected=false;try{post.prepare(bad);}catch(_){rejected=true;}
 check(rejected,'invalid pass provenance accepted');
 return {passed:true,independentBrute:{early:eb,late:lb},
  deterministicReplaysPerHistory:100,invalidPassRejected:true};
}
function run(start=2815592,count=2048){
 check(Number.isInteger(start)&&start>=0&&Number.isInteger(count)&&count>=100,'seed inputs');
 const tests=test(),out={};
 for(const name of ['early','late']){
  const f=prepare(name),p=f.posterior,exact=name==='early'?1:4/11;
  let has26=0;const distinct=new Set();
  for(let i=0;i<count;i++){
   const w=post.samplePrepared(p,start+i);post.assertWorld(p,w);
   has26+=+w.hands[1].some(t=>key(t)==='2-6');
   distinct.add(w.hands[1].map(key).sort().join(','));
  }
  const rate=has26/count,z=exact===1?null:(rate-exact)/Math.sqrt(exact*(1-exact)/count);
  check(exact===1?has26===count:Math.abs(z)<5,'posterior calibration');
  out[name]={compatibleExact:p.total.toString(),passMask:f.passMask.map(key).sort(),
   seat1Has26Exact:name==='early'?'120/120':'120/330',
   allocations:count,seat1Has26:has26,rate,exactRate:exact,z,distinctHands:distinct.size};
 }
 return {schema:'qosha-branch-order-posterior/v1',
  timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).replace(' ','T')+'+04:00',
  engine:'qosa-research-0.5.3+branch-order-posterior-1.0',
  rules:'recovered qosa-1.0.0 3x9; all-current-only PROVISIONAL',
  seeds:[start,start+count-1],newDeals:0,newCompleteRounds:0,newForcedContinuations:0,
  newHiddenAllocations:count*2,strategies:'none; exact conditional uniform posterior',
  histories:2,unrestrictedPartitionsPerHistory:3432,
  identicalPlayedAndEnds:true,passSeat:2,stockAtPass:0,
  models:{early:out.early,late:out.late},
  posteriorSeat1Has26DifferencePp:100*(1-4/11),
  tests,confidence:'Exact 3432-way independent enumeration for each synthetic chronology; seeded posterior calibrated',
  limitations:['Physical all-current-only branch rule not confirmed','Synthetic chronologies and pass, not real match',
   'Uniform hidden-world assignments do not model opponent choice','No validated win/minus/block/tie scoring'],
  finding:'Even fixing one provisional branch rule, two legal chronological histories with identical played tiles and ends imply 100% versus 36.36% ownership of 2-6 after a seat-2 pass.',
  nextAction:'Authenticate late-arrival extension in physical Qoşa; collect real blocked-tie trace before full-game strategy claims'};
}
if(require.main===module){const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||2815592),+(a[1]||2048)),null,2));}
module.exports={FOCAL,prepare,independentBrute,test,run};
