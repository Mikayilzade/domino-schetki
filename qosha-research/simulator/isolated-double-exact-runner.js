'use strict';
// Exact isolated X-X late-game holdout; no X-Y connector in focal hand.
// node qosha-research/simulator/isolated-double-exact-runner.js [90000] [93000] [30]
// node qosha-research/simulator/isolated-double-exact-runner.js test
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver'),init=require('./initializer');
const {chooseBy}=require('./strategy-runner'),{actionKey,evaluateDecisionInWorld}=require('./decision-regret');
const {exactWorlds}=require('./exact-late-double-runner'),{threat}=require('./late-double-threat-runner');
const policies=['closed-branch-control','min-hand-pips','fast-doubles'],mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
function eligible(s){
 const f=s.currentPlayer,next=(f+1)%3,hand=s.hands[f];
 if(hand.length<3||hand.length>5||s.stock.length||s.hands[next].length>2)return null;
 const o=d.turnOptions(s.branchState,s.openingState,hand,s.stock);
 if(o.phase!=='play'||o.drawn)return null;
 for(let x=0;x<=6;x++){
  if(!hand.some(t=>t[0]===x&&t[1]===x)||hand.some(t=>t[0]!==t[1]&&t.includes(x)))continue;
  const open=o.actions.filter(a=>a.type==='double-sequence'&&a.tiles.length===1&&a.numbers[0]===x).map(actionKey);
  const keep=o.actions.filter(a=>a.type==='single'&&a.tile[0]!==a.tile[1]).map(actionKey);
  if(open.length&&keep.length)return{x,open,keep,targetEndCount:e.sidesEndingIn(s.branchState,x).length};
 }return null;
}
function collect(start=90000,end=93000,limit=30){
 const positions=[];let scanned=0;
 for(let seed=start;seed<end&&positions.length<limit;seed++){
  let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(s.kind!=='ready')continue;scanned++;
  while(!s.outcome&&s.turns<100){
   const group=eligible(s);
   if(group){const hidden=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
    positions.push({seed,turn:s.turns,focal:s.currentPlayer,next:(s.currentPlayer+1)%3,state:r.cloneRoundState(s),
      known:e.createDoubleSixDeck().filter(t=>!hidden.has(e.tileKey(t))),group});break;}
   s=r.stepRound(s,(o,st)=>chooseBy('closed-branch-control',o,{seed,turns:st.turns,player:st.currentPlayer}));
  }
 }return{positions,scanned};
}
function analyze(p){
 const before=JSON.stringify(p.state),worlds=exactWorlds(p),o=d.turnOptions(p.state.branchState,p.state.openingState,p.state.hands[p.focal],p.state.stock);
 const actions=new Map(o.actions.map(a=>[actionKey(a),a])),open=p.group.open,keep=p.group.keep,keys=[...new Set([...open,...keep])];
 if(keys.some(k=>!actions.has(k)))throw Error('candidate mismatch');
 const samples=Object.fromEntries(policies.map(k=>[k,[]])),threats=[];let continuations=0;
 const avg=(map,ks,fn)=>mean(ks.map(k=>{const v=map.get(k);if(!v)throw Error('missing key '+k);return fn(v);}));
 for(let i=0;i<worlds.length;i++){
  const w=worlds[i],t=new Map(keys.map(k=>[k,threat(w,actions.get(k),p.next)]));
  threats.push(avg(t,open,v=>v.finish)-avg(t,keep,v=>v.finish));
  for(const policy of policies){
   const ev=evaluateDecisionInWorld(w,{focalPlayer:p.focal,continuationStrategy:policy,seed:23000000+1000*p.seed+i,maxTurns:200});
   if(ev.kind!=='paired-world')throw Error('not paired');
   const m=new Map(ev.candidates.map(c=>[c.actionKey,c]));continuations+=ev.candidates.length;
   if([...m.values()].some(v=>v.outcome==='unresolved'))throw Error('unresolved');
   samples[policy].push({finish:avg(m,keep,v=>+v.focalFinishedFirst)-avg(m,open,v=>+v.focalFinishedFirst),
    pips:avg(m,keep,v=>v.focalRemainder)-avg(m,open,v=>v.focalRemainder),
    minus:avg(m,keep,v=>+(v.focalMinus<0))-avg(m,open,v=>+(v.focalMinus<0))});
  }
 }
 if(JSON.stringify(p.state)!==before)throw Error('source mutated');
 return{seed:p.seed,turn:p.turn,x:p.group.x,focal:p.focal,next:p.next,hand:p.state.hands[p.focal].map(e.tileKey),
  handSizes:p.state.hands.map(h=>h.length),ends:e.SIDES.map(side=>p.state.branchState.branches[side].end),
  targetEndCount:p.group.targetEndCount,opened:[...p.state.openingState.openedNumbers].sort(),
  open,keep,exactAllocations:worlds.length,continuations,immediateOpenMinusKeepFinish:mean(threats),
  preserveMinusOpen:Object.fromEntries(policies.map(policy=>[policy,
   Object.fromEntries(['finish','pips','minus'].map(m=>[m,mean(samples[policy].map(z=>z[m]))]))]))};
}
function stats(rows,policy){
 const a=rows.map(r=>r.preserveMinusOpen[policy].finish);
 if(!a.length)return null;const m=mean(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0;
 return{n:a.length,mean:m,exploratoryCI95:[m-1.96*sd/Math.sqrt(a.length),m+1.96*sd/Math.sqrt(a.length)],
  positive:a.filter(v=>v>1e-9).length,negative:a.filter(v=>v< -1e-9).length,ties:a.filter(v=>Math.abs(v)<=1e-9).length,
  meanPips:mean(rows.map(r=>r.preserveMinusOpen[policy].pips)),meanMinus:mean(rows.map(r=>r.preserveMinusOpen[policy].minus))};
}
function run({start=90000,end=93000,limit=30}={}){
 const {positions,scanned}=collect(start,end,limit),rows=positions.map(analyze);
 const cells={all:rows,end1:rows.filter(r=>r.targetEndCount===1),end2plus:rows.filter(r=>r.targetEndCount>=2),
  next1:rows.filter(r=>r.handSizes[r.next]===1),next2:rows.filter(r=>r.handSizes[r.next]===2)};
 return{schema:'qosa-isolated-double-exact/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  start,end,limit,discovery:'closed-branch-control',scannedDeals:scanned,positions:rows.length,
  exactHiddenAllocations:rows.reduce((n,r)=>n+r.exactAllocations,0),
  candidateContinuations:rows.reduce((n,r)=>n+r.continuations,0),newFullStrategyRounds:0,
  continuationSeedFormula:'23000000+1000*dealSeed+lexicographicAllocationIndex',
  selection:'first eligible/deal; next opponent 1-2, focal 3-5, stock empty, isolated X-X and ordinary single legal',
  comparison:'preserve isolated X-X with ordinary single versus opening X-X; equal class, allocation, position weights',
  policies,summary:Object.fromEntries(Object.entries(cells).map(([k,rs])=>[k,Object.fromEntries(policies.map(p=>[p,stats(rs,p)]))])),
  rows,limitations:'uniform hidden worlds ignore opponent history; assumed branch rules; bot policies; block winner unassigned; first-eligible sampling'};
}
function selfTest(){const {positions}=collect(90000,90200,2);if(positions.length!==2)throw Error('missing fixtures');
 for(const p of positions){if(p.state.hands[p.focal].some(t=>t[0]!==t[1]&&t.includes(p.group.x)))throw Error('not isolated');
  if(JSON.stringify(analyze(p))!==JSON.stringify(analyze(p)))throw Error('nondeterministic');}
 return{passed:true,seeds:positions.map(p=>p.seed)};}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?selfTest():run({start:+(a[0]||90000),end:+(a[1]||93000),limit:+(a[2]||30)}),null,2));}
module.exports={eligible,collect,analyze,run,selfTest};
