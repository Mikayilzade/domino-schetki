'use strict';
// Deterministic 3x9 geometry matched holdout. Run:
// node qosha-research/simulator/geometry-paired-runner.js 800000 850000 120 25
const e=require('./engine'),d=require('./turn-dispatcher');
const {collect}=require('./two-opponent-conditional-holdout');
const {actionKey,evaluateDecisionInWorld}=require('./decision-regret');
const {sampleWorld}=require('./hidden-world');
const P=['closed-branch-control','min-hand-pips','fast-doubles'];
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
function stats(a){if(!a.length)return null;const m=mean(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0;return{n:a.length,mean:m,ci95:a.length>1?[m-1.96*sd/Math.sqrt(a.length),m+1.96*sd/Math.sqrt(a.length)]:null};}
function decorate(p){
 const s=p.state,o=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
 const map=new Map(o.actions.map(a=>[actionKey(a),a])),a=map.get(p.pair.connector),b=map.get(p.pair.other);
 if(!a||!b||a.type!=='single'||b.type!=='single'||e.pipSum([a.tile])!==e.pipSum([b.tile]))throw Error('illegal pair');
 return {...p,geometry:[a.side,b.side,a.from,b.from],focalSize:s.hands[s.currentPlayer].length,
  handSizes:s.hands.map(h=>h.length),ends:e.SIDES.map(side=>s.branchState.branches[side].end)};
}
function pairs(rows,strict){
 const groups=new Map();
 for(const p of rows){const key=[...p.geometry,...(strict?[p.focalSize]:[])].join('|');
  const g=groups.get(key)||{zero:[],nonzero:[]};g[p.x===0?'zero':'nonzero'].push(p);groups.set(key,g);}
 const out=[];for(const [key,g] of groups)for(let i=0;i<Math.min(g.zero.length,g.nonzero.length);i++)out.push({key,zero:g.zero[i],nonzero:g.nonzero[i]});
 return out;
}
function analyze(p,worlds){
 const s=p.state,f=s.currentPlayer,spec={focalPlayer:f,focalHand:s.hands[f],knownTiles:p.known,
  hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
 const snap=JSON.stringify(s),vals=Object.fromEntries(P.map(k=>[k,[]]));let continuations=0;
 for(let j=0;j<worlds;j++){const seed=51000000+1000*p.seed+j,w=sampleWorld(spec,seed);
  for(const policy of P){const ev=evaluateDecisionInWorld(w,{focalPlayer:f,continuationStrategy:policy,seed,maxTurns:200});
   if(ev.kind!=='paired-world')throw Error('not a choice');continuations+=ev.candidates.length;
   const map=new Map(ev.candidates.map(a=>[a.actionKey,a])),a=map.get(p.pair.connector),b=map.get(p.pair.other);
   if(!a||!b||a.outcome==='unresolved'||b.outcome==='unresolved')throw Error('unresolved');
   vals[policy].push({finish:+a.focalFinishedFirst- +b.focalFinishedFirst,
    pips:a.focalRemainder-b.focalRemainder,minus:+(a.focalMinus<0)- +(b.focalMinus<0),
    block:+(a.outcome==='block')- +(b.outcome==='block')});
  }
 }
 if(JSON.stringify(s)!==snap)throw Error('source mutation');
 return{seed:p.seed,turn:p.turn,x:p.x,geometry:p.geometry,focalSize:p.focalSize,
  handSizes:p.handSizes,ends:p.ends,worldSeedStart:51000000+1000*p.seed,worlds,continuations,
  connectorMinusUnrelated:Object.fromEntries(P.map(k=>[k,Object.fromEntries(
   ['finish','pips','minus','block'].map(m=>[m,mean(vals[k].map(v=>v[m]))]))]))};
}
function summarize(ps,by){
 const out={n:ps.length};
 for(const policy of P){out[policy]={};for(const metric of ['finish','pips','minus','block']){
  const zero=ps.map(p=>by.get(p.zero.seed).connectorMinusUnrelated[policy][metric]);
  const nonzero=ps.map(p=>by.get(p.nonzero.seed).connectorMinusUnrelated[policy][metric]);
  out[policy][metric]={zero:stats(zero),nonzero:stats(nonzero),zeroMinusNonzero:stats(zero.map((v,i)=>v-nonzero[i]))};
 }}return out;
}
function run(start=800000,end=850000,limit=120,worlds=25){
 const found=collect(start,end,limit),rows=found.out.map(decorate);
 const strict=pairs(rows,true),relaxed=pairs(rows,false),selected=new Map();
 for(const pair of [...strict,...relaxed])for(const p of [pair.zero,pair.nonzero])selected.set(p.seed,p);
 const analyzed=[...selected.values()].map(p=>analyze(p,worlds)),by=new Map(analyzed.map(p=>[p.seed,p]));
 const format=ps=>({pairs:ps.map(p=>({geometry:p.key,zero:p.zero.seed,nonzero:p.nonzero.seed,
  sizes:[p.zero.focalSize,p.nonzero.focalSize]})),summary:summarize(ps,by)});
 return{schema:'qosa-geometry-paired/v1',timestampAsiaBaku:new Date(Date.now()+14400000).toISOString().slice(0,19)+' +04:00',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',start,end,limit,scannedDeals:found.scanned,
  eligiblePositions:rows.length,zero:rows.filter(p=>p.x===0).length,nonzero:rows.filter(p=>p.x!==0).length,
  worldsPerPosition:worlds,analyzedPositions:analyzed.length,hiddenWorldDraws:analyzed.length*worlds,
  candidateContinuations:analyzed.reduce((n,p)=>n+p.continuations,0),newFullRounds:0,
  seedFormula:'51000000+1000*dealSeed+worldIndex',discovery:'min-hand-pips',policies:P,
  comparison:'within-state equal-pip connector minus unrelated, then X=0 minus X>0 by action side/from geometry',
  strict:format(strict),relaxed:format(relaxed),rows:analyzed,
  limitations:'post-action ends differ; relaxed matching ignores hand size; both groups differ in full branch state and tile history; first eligible state; one discovery bot; uniform hidden worlds; branch opening assumption; block winner unassigned; exploratory intervals, not causal human-play advice'};
}
function selfTest(){const a=collect(800000,801000,5).out.map(decorate);
 if(a.length!==5||pairs(a,true).length>pairs(a,false).length)throw Error('fixture');
 return{passed:true,positions:a.length};}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?selfTest():run(+(a[0]||800000),+(a[1]||850000),+(a[2]||120),+(a[3]||25)),null,2));}
module.exports={decorate,pairs,analyze,summarize,run,selfTest};
