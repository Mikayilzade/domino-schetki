'use strict';
// Exact next-player <=2 strict connector-vs-double matched-world experiment.
// Usage: node qosha-research/simulator/late-double-threat-runner.js [start=64000] [end=65000] [limit=40] [worlds=25]
// Test:  node qosha-research/simulator/late-double-threat-runner.js test
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver'),i=require('./initializer');
const {chooseBy}=require('./strategy-runner'),{actionKey}=require('./decision-regret');
const {sampleWorld,runHiddenWorlds}=require('./hidden-world');
const {comparableChoices}=require('./pattern-choice-classifier');
const policies=['closed-branch-control','min-hand-pips','fast-doubles'];
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
function stats(a){if(!a.length)return null;const m=mean(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0,h=1.96*sd/Math.sqrt(a.length);return{n:a.length,mean:m,ci95:[m-h,m+h],positive:a.filter(x=>x>0).length,negative:a.filter(x=>x<0).length,zero:a.filter(x=>x===0).length};}
function strict(s){
 const hand=s.hands[s.currentPlayer];if(hand.length<3||hand.length>5||s.stock.length)return [];
 const o=d.turnOptions(s.branchState,s.openingState,hand,s.stock);if(o.phase!=='play'||o.drawn)return [];
 return comparableChoices(hand,o.actions).map(g=>({
  x:g.number,
  open:g.spendDouble.filter(c=>c.action.type==='double-sequence'&&c.action.tiles.length===1).map(c=>actionKey(c.action)),
  keep:g.preservePair.filter(c=>c.action.type==='single'&&c.usesConnector&&c.keepsPair).map(c=>actionKey(c.action))
 })).filter(g=>g.open.length&&g.keep.length);
}
function collect(start=64000,end=65000,limit=40,discovery='closed-branch-control'){
 const positions=[];let scanned=0;
 for(let seed=start;seed<end&&positions.length<limit;seed++){
  let s=i.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});if(s.kind!=='ready')continue;scanned++;
  while(!s.outcome&&s.turns<100){
   const next=(s.currentPlayer+1)%3,g=s.hands[next].length<=2?strict(s):[];
   if(g.length){const hidden=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
    positions.push({seed,turn:s.turns,focal:s.currentPlayer,next,state:r.cloneRoundState(s),
     known:e.createDoubleSixDeck().filter(t=>!hidden.has(e.tileKey(t))),group:g[0]});break;}
   s=r.stepRound(s,(o,st)=>chooseBy(discovery,o,{seed,turns:st.turns,player:st.currentPlayer}));
  }
 }return{positions,scanned};
}
function threat(w,action,next){
 const p=w.currentPlayer,one=d.applyTurn(w.branchState,w.openingState,w.hands[p],w.stock,action);
 if(!one.hand.length)return{finish:0,minus10:0,anyMinus:0};
 const o=d.turnOptions(one.branchState,one.openingState,w.hands[next],one.stock);
 const res={finish:0,minus10:0,anyMinus:0};if(o.phase!=='play')return res;
 for(const a of o.actions){const two=d.applyTurn(one.branchState,one.openingState,w.hands[next],one.stock,a);
  if(!two.hand.length){res.finish=1;const minus=e.finishMinus(two.finishDoubles);
   if(minus===-10)res.minus10=1;if(minus<0)res.anyMinus=1;}
 }return res;
}
function analyze(p,worlds=25){
 const s=p.state,seedStart=14000000+1000*p.seed;
 const spec={focalPlayer:p.focal,focalHand:s.hands[p.focal],knownTiles:p.known,
  hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
 const o=d.turnOptions(s.branchState,s.openingState,s.hands[p.focal],s.stock),acts=new Map(o.actions.map(a=>[actionKey(a),a]));
 const open=p.group.open,keep=p.group.keep,all=[...open,...keep];
 for(const key of all)if(!acts.has(key))throw Error('invalid class action '+key);
 const avg=(map,ks,fn)=>mean(ks.map(k=>fn(map.get(k))));
 const immediate=[];
 for(let n=0;n<worlds;n++){const w=sampleWorld(spec,seedStart+n),map=new Map(all.map(k=>[k,threat(w,acts.get(k),p.next)]));
  immediate.push(Object.fromEntries(['finish','minus10','anyMinus'].map(k=>[k,avg(map,open,v=>v[k])-avg(map,keep,v=>v[k])])));
 }
 const results={};let continuations=0;
 for(const policy of policies){const out=runHiddenWorlds(spec,{count:worlds,startSeed:seedStart,continuationStrategy:policy,maxTurns:200}),deltas=[];
  for(const w of out.results){const map=new Map(w.candidates.map(c=>[c.actionKey,c]));
   for(const k of all)if(!map.has(k)||map.get(k).outcome==='unresolved')throw Error('missing/unresolved '+k);
   deltas.push({
    finish:avg(map,keep,v=>+v.focalFinishedFirst)-avg(map,open,v=>+v.focalFinishedFirst),
    pips:avg(map,keep,v=>v.focalRemainder)-avg(map,open,v=>v.focalRemainder),
    minus:avg(map,keep,v=>+(v.focalMinus<0))-avg(map,open,v=>+(v.focalMinus<0))
   });continuations+=w.candidates.length;
  }results[policy]=Object.fromEntries(['finish','pips','minus'].map(k=>[k,mean(deltas.map(v=>v[k]))]));
 }
 return{seed:p.seed,turn:p.turn,focal:p.focal,next:p.next,x:p.group.x,
  hand:s.hands[p.focal].map(e.tileKey),handSizes:s.hands.map(h=>h.length),
  opened:[...s.openingState.openedNumbers].sort(),ends:e.SIDES.map(side=>s.branchState.branches[side].end),
  open,keep,worldSeedStart:seedStart,worlds,continuations,
  immediateOpenMinusKeep:Object.fromEntries(['finish','minus10','anyMinus'].map(k=>[k,mean(immediate.map(x=>x[k]))])),
  preserveMinusOpen:results};
}
function run({start=64000,end=65000,limit=40,worlds=25,discovery='closed-branch-control'}={}){
 const {positions,scanned}=collect(start,end,limit,discovery),rows=positions.map(p=>analyze(p,worlds));
 const summary={};for(const policy of policies){summary[policy]={};
  for(const cell of ['all','next1','next2','hand3','hand4','hand5']){
   const sub=rows.filter(p=>cell==='all'||(cell.startsWith('next')?p.handSizes[p.next]===+cell.slice(4):p.handSizes[p.focal]===+cell.slice(4)));
   summary[policy][cell]=Object.fromEntries(['finish','pips','minus'].map(k=>[k,stats(sub.map(p=>p.preserveMinusOpen[policy][k]))]));
  }
 }
 return{schema:'qosa-strict-next-player-threat/v1',timestampAsiaBaku:'2026-10-10 10:48 +04:00',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  start,end,scannedDeals:scanned,positionCount:rows.length,worldsPerPosition:worlds,
  selectedSeeds:rows.map(p=>p.seed),uniqueHiddenWorlds:rows.length*worlds,
  policyWorldEvaluations:rows.length*worlds*policies.length,
  candidateContinuations:rows.reduce((n,p)=>n+p.continuations,0),newFullStrategyRounds:0,
  worldSeedFormula:'14000000+1000*dealSeed+worldIndex',discovery,policies,
  selection:'first strict reachable state per seed, focal 3..5 tiles, stock empty, NEXT clockwise opponent <=2 tiles; X-Y connector single must retain X-X and another X connector',
  comparison:'preserve connector minus open X-X; same visible state and hidden worlds, class-average then equal position weight',
  threatDefinition:'next clockwise opponent has any legal immediate finish (possible, not necessarily chosen); open minus preserve',
  immediateThreat:Object.fromEntries(['finish','minus10','anyMinus'].map(k=>[k,stats(rows.map(p=>p.immediateOpenMinusKeep[k]))])),
  summary,rows,limitations:'assumed branch opening, bot continuations, first-eligible selection, unassigned block winner, 25 worlds/position, exploratory uncorrected normal CIs, not universal human advice'};
}
function selfTest(){const c=collect(64000,64030,2);if(c.positions.length!==2)throw Error('fixture selection');
 for(const p of c.positions){if(p.next!==(p.focal+1)%3||p.state.hands[p.next].length>2)throw Error('next player');
  const o=d.turnOptions(p.state.branchState,p.state.openingState,p.state.hands[p.focal],p.state.stock);
  for(const k of p.group.keep){const a=o.actions.find(x=>actionKey(x)===k);
   if(!a||a.type!=='single'||!a.tile.includes(p.group.x))throw Error('unrelated single');}
  const before=JSON.stringify(p.state.hands);analyze(p,2);
  if(JSON.stringify(p.state.hands)!==before)throw Error('mutation');
 }return{passed:true,seeds:c.positions.map(p=>p.seed)};}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?selfTest():run({start:+(a[0]||64000),end:+(a[1]||65000),limit:+(a[2]||40),worlds:+(a[3]||25)}),null,2));}
module.exports={strict,collect,threat,analyze,run,selfTest};
