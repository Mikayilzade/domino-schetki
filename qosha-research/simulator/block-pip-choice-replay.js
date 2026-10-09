'use strict';
// Reproduce: node qosha-research/simulator/block-pip-choice-replay.js [testWorlds=60]
// Exact held-out 2026-10-09 19:48 position seeds; training and test worlds disjoint.
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver'),init=require('./initializer');
const {chooseBy}=require('./strategy-runner'),{sampleWorld}=require('./hidden-world');
const {actionKey}=require('./decision-regret'),{neutralChoose}=require('./side-equivariance-audit');
const {blockRank}=require('./block-remainder-holdout');
const SETS={
 'closed-branch-control':[294004,294035,294054,294056,294066,294068,294079,294110,294170,294173,294175,294194],
 'min-hand-pips':[297008,297011,297013,297054,297063,297070,297097,297161,297194,297238,297263,297314]};
const POLICIES=['closed-branch-control','min-hand-pips','random-legal'];
function pick(s){
 const f=s.currentPlayer,h=s.hands[f];
 if(s.stock.length||h.length<2||h.length>7||Math.min(...s.hands.filter((_,i)=>i!==f).map(x=>x.length))>4)return null;
 const o=d.turnOptions(s.branchState,s.openingState,h,s.stock);
 if(o.phase!=='play'||o.drawn)return null;
 const by=new Map();
 for(const a of o.actions.filter(x=>x.type==='single')){const k=e.tileKey(a.tile),old=by.get(k);if(!old||actionKey(a)<actionKey(old))by.set(k,a);}
 const a=[...by.values()].sort((x,y)=>e.pipSum([x.tile])-e.pipSum([y.tile])||actionKey(x).localeCompare(actionKey(y)));
 if(a.length<2||e.pipSum([a[a.length-1].tile])-e.pipSum([a[0].tile])<3)return null;
 return{keys:[actionKey(a[0]),actionKey(a[a.length-1])],tiles:[e.tileKey(a[0].tile),e.tileKey(a[a.length-1].tile)]};
}
function position(seed,policy){
 let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
 if(s.kind!=='ready')throw Error('unready seed '+seed);
 while(!s.outcome&&s.turns<100){
  const c=pick(s);
  if(c){const f=s.currentPlayer,hidden=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
   return{seed,policy,turn:s.turns,focal:f,hand:s.hands[f].map(e.tileKey),
    opponentSizes:s.hands.filter((_,i)=>i!==f).map(h=>h.length),choice:c,
    state:r.cloneRoundState(s),known:e.createDoubleSixDeck().filter(t=>!hidden.has(e.tileKey(t)))};}
  s=r.stepRound(s,(o,t)=>chooseBy(policy,o,{seed,turns:t.turns,player:t.currentPlayer}));
 }
 throw Error('no eligible position for '+seed);
}
function forced(w,k){return r.stepRound(w,o=>{const a=o.actions.find(x=>actionKey(x)===k);if(!a)throw Error('candidate absent');return a;});}
function finish(s,policy,seed){
 s=r.cloneRoundState(s);
 while(!s.outcome&&s.turns<200)s=r.stepRound(s,(o,t)=>neutralChoose(policy,o,{seed,turns:t.turns,player:t.currentPlayer}));
 if(!s.outcome||s.outcome.kind==='unresolved')throw Error('unresolved');return s;
}
function stats(s,f){const o=s.outcome,b=blockRank(o,f);return{block:!!b,pips:e.pipSum(s.hands[f]),first:o.kind==='finish'&&o.playerIndex===f,
 strict:!!(b&&b.strictMin),minus:o.kind==='finish'&&o.playerIndex===f&&(o.minus||0)<0};}
function empty(){return{both:0,lowOnly:0,highOnly:0,neither:0,highLower:0,highHigher:0,equal:0,
 strictGain:0,strictLoss:0,strictLow:0,strictHigh:0,bothPipsDiff:0,firstDiff:0,blockDiff:0,pipsDiff:0,minusDiff:0};}
function replay(p,test){
 const s=p.state,original=JSON.stringify(s),f=p.focal,base=22000000+1000*p.seed;
 const spec={focalPlayer:f,focalHand:s.hands[f],knownTiles:p.known,hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
 let trainHits=0;const out=Object.fromEntries(POLICIES.map(x=>[x,empty()]));
 for(let i=0;i<4+test;i++){
  const seed=base+i,w=sampleWorld(spec,seed),after=p.choice.keys.map(k=>forced(w,k));
  if(i<4){const a=finish(after[0],POLICIES[0],seed),b=finish(after[1],POLICIES[0],seed);trainHits+=+(a.outcome.kind==='block'&&b.outcome.kind==='block');continue;}
  for(const policy of POLICIES){
   const a=stats(finish(after[0],policy,seed),f),b=stats(finish(after[1],policy,seed),f),x=out[policy];
   x.firstDiff+=+b.first-+a.first;x.blockDiff+=+b.block-+a.block;x.pipsDiff+=b.pips-a.pips;x.minusDiff+=+b.minus-+a.minus;
   if(a.block&&b.block){x.both++;x.highLower+=+(b.pips<a.pips);x.highHigher+=+(b.pips>a.pips);x.equal+=+(b.pips===a.pips);
    x.strictGain+=+(!a.strict&&b.strict);x.strictLoss+=+(a.strict&&!b.strict);
    x.strictLow+=+a.strict;x.strictHigh+=+b.strict;x.bothPipsDiff+=b.pips-a.pips;
   }else if(a.block)x.lowOnly++;else if(b.block)x.highOnly++;else x.neither++;
  }
 }
 if(trainHits===0||JSON.stringify(s)!==original)throw Error('training selection/source mutation '+p.seed);
 for(const x of Object.values(out))if(x.both+x.lowOnly+x.highOnly+x.neither!==test||x.highLower+x.highHigher+x.equal!==x.both)throw Error('partition');
 return{seed:p.seed,policy:p.policy,turn:p.turn,focal:f,hand:p.hand,opponentSizes:p.opponentSizes,
 tiles:p.choice.tiles,keys:p.choice.keys,trainHits,worldSeedStart:base,policies:out};
}
function stat(xs){if(!xs.length)return null;const n=xs.length,m=xs.reduce((a,b)=>a+b,0)/n,sd=n>1?Math.sqrt(xs.reduce((s,x)=>s+(x-m)**2,0)/(n-1)):0,h=1.96*sd/Math.sqrt(n);return{n,mean:m,ci95:[m-h,m+h]};}
function summarize(rows,test){const result={positions:rows.length,policies:{}};
 for(const policy of POLICIES){const ds=rows.map(x=>x.policies[policy]),sum=k=>ds.reduce((s,x)=>s+x[k],0),both=sum('both'),nonzero=ds.filter(x=>x.both);
  result.policies[policy]={worlds:rows.length*test,bothBlockWorlds:both,positionsWithBothBlock:nonzero.length,
   lowOnly:sum('lowOnly'),highOnly:sum('highOnly'),neither:sum('neither'),highLower:sum('highLower'),highHigher:sum('highHigher'),equal:sum('equal'),
   strictGain:sum('strictGain'),strictLoss:sum('strictLoss'),meanPipsDeltaBoth:both?sum('bothPipsDiff')/both:null,
   positionPipsDeltaBoth:stat(nonzero.map(x=>x.bothPipsDiff/x.both)),
   positionStrictDeltaBoth:stat(nonzero.map(x=>(x.strictHigh-x.strictLow)/x.both)),
   positionFirstDelta:stat(ds.map(x=>x.firstDiff/test)),
   positionBlockDelta:stat(ds.map(x=>x.blockDiff/test))};
 }return result;
}
function selfTest(){const s={branchState:e.createBranchState([1,1]),openingState:e.createOpeningState([1]),
 hands:[[[1,2],[1,6],[2,4]],[[0,0]],[[3,3]]],stock:[],currentPlayer:0};
 const c=pick(s);if(!c||c.tiles.join(',')!=='1-2,1-6')throw Error('choice fixture');
 if(!blockRank({kind:'block',remainders:[4,5,6]},0).strictMin)throw Error('block fixture');return{passed:true,cases:2};}
function run(test=60){if(!Number.isInteger(test)||test<1||test>500)throw Error('invalid worlds');selfTest();
 const positions=Object.entries(SETS).flatMap(([policy,seeds])=>seeds.map(seed=>position(seed,policy)));
 const rows=positions.map(p=>replay(p,test));
 return{schema:'qosa-block-pip-choice-replay/v1',timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}),
 engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',seedSets:SETS,
 worldSeedFormula:'22000000+1000*dealSeed+worldIndex, train 0..3, test 4..(3+test)',trainWorlds:4,testWorlds:test,
 selectedPositions:rows.length,selectedHiddenWorlds:rows.length*(4+test),pairedContinuations:rows.length*test*2*POLICIES.length,
 strategies:['low-pip ordinary single','high-pip ordinary single'],continuationPolicies:POLICIES,
 summary:summarize(rows,test),rows,fullStrategyRounds:0,
 limitations:['Training selection of block-prone states','No official block winner','Assumed branch semantics','No opponent pass-history conditioning','Handcrafted bots','Exploratory position CIs'],
 exactNextAction:'Independent replication on disjoint deal seeds; analyze connector and opponent-size counterconditions.'};
}
if(require.main===module){console.log(JSON.stringify(process.argv[2]==='test'?selfTest():run(Number(process.argv[2]||60)),null,2));}
module.exports={pick,position,replay,run,selfTest};