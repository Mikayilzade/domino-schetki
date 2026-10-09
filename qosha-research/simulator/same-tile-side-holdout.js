'use strict';
// Same-tile, two-open-sides paired holdout. No scoreboard changes.
// Reproduce: node qosha-research/simulator/same-tile-side-holdout.js 10 25
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),{chooseBy}=require('./strategy-runner');
const {actionKey}=require('./decision-regret'),{runHiddenWorlds}=require('./hidden-world');
const DISCOVERY=[['closed-branch-control',158000,166000],['min-hand-pips',166000,174000]];
const POLICIES=['closed-branch-control','min-hand-pips','random-legal'];
const GROUPS=['opponent-one','opponents-three-plus'];
function choice(s){
 const hand=s.hands[s.currentPlayer];
 if(s.stock.length||hand.length<2||hand.length>6)return null;
 const o=d.turnOptions(s.branchState,s.openingState,hand,s.stock);
 if(o.phase!=='play'||o.drawn)return null;
 const by={};
 for(const a of o.actions){
  if(a.type!=='single'||!e.isNumberOpened(s.openingState,a.from))continue;
  const key=[e.tileKey(a.tile),a.from,a.to].join(':');
  (by[key]||(by[key]=[])).push(a);
 }
 for(const key of Object.keys(by).sort()){
  const actions=by[key].sort((a,b)=>e.SIDES.indexOf(a.side)-e.SIDES.indexOf(b.side));
  if(actions.length<2||actions[0].side===actions[1].side)continue;
  const [a,b]=actions;
  if(e.tileKey(a.tile)!==e.tileKey(b.tile)||a.from!==b.from||a.to!==b.to)throw Error('same-tile invariant');
  return {tile:e.tileKey(a.tile),from:a.from,to:a.to,sides:[a.side,b.side],keys:[actionKey(a),actionKey(b)]};
 }
 return null;
}
function scan(policy,start,end,quota){
 const cells=Object.fromEntries(GROUPS.map(k=>[k,[]]));
 let scanned=0,eligible=0;
 for(let seed=start;seed<end;seed++){
  scanned++;
  let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(s.kind!=='ready')continue;
  while(!s.outcome&&s.turns<100){
   const c=choice(s);
   if(c){
    eligible++;
    const focal=s.currentPlayer,opps=s.hands.map((h,i)=>i===focal?null:h.length).filter(x=>x!==null);
    const min=Math.min(...opps),group=min===1?'opponent-one':min>=3?'opponents-three-plus':null;
    if(group&&cells[group].length<quota){
     const hidden=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
     cells[group].push({seed,discoveryPolicy:policy,group,focal,opponents:opps,
      state:r.cloneRoundState(s),known:e.createDoubleSixDeck().filter(t=>!hidden.has(e.tileKey(t))),choice:c});
    }
    break;
   }
   s=r.stepRound(s,(opts,st)=>chooseBy(policy,opts,{seed,turns:st.turns,player:st.currentPlayer}));
  }
  if(GROUPS.every(k=>cells[k].length===quota))break;
 }
 if(GROUPS.some(k=>cells[k].length!==quota))throw Error('insufficient positions '+policy+' '+JSON.stringify(Object.fromEntries(GROUPS.map(k=>[k,cells[k].length]))));
 return {positions:GROUPS.flatMap(k=>cells[k]),scanned,eligible,counts:Object.fromEntries(GROUPS.map(k=>[k,cells[k].length]))};
}
function stat(xs){
 if(!xs.length)return null;
 const n=xs.length,m=xs.reduce((a,b)=>a+b,0)/n;
 const sd=n>1?Math.sqrt(xs.reduce((a,b)=>a+(b-m)**2,0)/(n-1)):0;
 const h=1.96*sd/Math.sqrt(n);
 return {n,mean:m,ci95NormalApprox:[m-h,m+h]};
}
function analyze(p,count,policy){
 const s=p.state;
 const spec={focalPlayer:p.focal,focalHand:s.hands[p.focal],knownTiles:p.known,
  hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
 const before=JSON.stringify(s);
 const worlds=runHiddenWorlds(spec,{count,startSeed:8500000+1000*p.seed,
  continuationStrategy:policy,maxTurns:200});
 if(JSON.stringify(s)!==before)throw Error('source-state mutation');
 const diffs={finish:[],pips:[],minus:[],outcomeDisagreement:[],absPips:[]};
 let continuations=0;
 for(const w of worlds.results){
  const by=new Map(w.candidates.map(x=>[x.actionKey,x]));
  const a=by.get(p.choice.keys[0]),b=by.get(p.choice.keys[1]);
  if(!a||!b||a.outcome==='unresolved'||b.outcome==='unresolved')throw Error('missing/unresolved paired action '+p.seed);
  const f=(+a.focalFinishedFirst)-(+b.focalFinishedFirst),pips=a.focalRemainder-b.focalRemainder;
  diffs.finish.push(f);diffs.pips.push(pips);
  diffs.minus.push(+(a.focalMinus<0)-+(b.focalMinus<0));
  diffs.outcomeDisagreement.push(+(f!==0));diffs.absPips.push(Math.abs(pips));
  continuations+=w.candidates.length;
 }
 return {deltas:Object.fromEntries(Object.entries(diffs).map(([k,v])=>[k,stat(v).mean])),continuations};
}
function summarize(rows){
 const out={};
 for(const policy of POLICIES){
  out[policy]={};
  for(const group of ['all',...GROUPS]){
   const subset=rows.filter(x=>group==='all'||x.group===group);
   out[policy][group]=Object.fromEntries(['finish','pips','minus','outcomeDisagreement','absPips'].map(k=>[k,stat(subset.map(x=>x.policies[policy].deltas[k]))]));
  }
 }
 return out;
}
function run(quota=10,worlds=25){
 if(!Number.isInteger(quota)||quota<1||!Number.isInteger(worlds)||worlds<1||worlds>1000)throw Error('bad quota/worlds');
 const selected=DISCOVERY.map(([p,a,b])=>({policy:p,range:[a,b-1],...scan(p,a,b,quota)}));
 const positions=selected.flatMap(x=>x.positions);
 if(new Set(positions.map(x=>x.seed)).size!==positions.length)throw Error('duplicate seeds');
 const rows=positions.map(p=>({seed:p.seed,group:p.group,discoveryPolicy:p.discoveryPolicy,turn:p.state.turns,
  focal:p.focal,opponents:p.opponents,hand:p.state.hands[p.focal].map(e.tileKey),
  tile:p.choice.tile,from:p.choice.from,to:p.choice.to,sides:p.choice.sides,
  candidateKeys:p.choice.keys,worldStart:8500000+1000*p.seed,policies:{}}));
 let continuations=0;
 for(const policy of POLICIES)for(let k=0;k<positions.length;k++){
  const result=analyze(positions[k],worlds,policy);
  rows[k].policies[policy]=result;
  continuations+=result.continuations;
 }
 return {schema:'qosa-same-tile-two-sides/v1',
  timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'})+' +04:00',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  seedRanges:DISCOVERY.map(([,a,b])=>[a,b-1]),selectedSeeds:rows.map(x=>x.seed),
  worldSeedFormula:'8500000+1000*dealSeed+worldIndex',quotaPerDiscoveryAndGroup:quota,
  selection:'First reachable same ordinary tile X-Y playable on two distinct open sides with identical starting end X and resulting end Y; focal hand 2..6; stock empty; opponent minimum exactly 1 or >=3.',
  comparison:'Side A minus side B for the SAME tile and identical immediate pip reduction, same hidden worlds and continuation policy. Side order is canonical up,left,right,down.',
  positionCount:rows.length,worldsPerPosition:worlds,newHiddenWorlds:rows.length*worlds,
  policyWorldEvaluations:rows.length*worlds*POLICIES.length,candidateContinuations:continuations,
  newFullStrategyRounds:0,cumulativeFullStrategyRounds:180000,historicalRoundsSeparate:4000,
  previousHiddenWorlds:63810,cumulativeHiddenWorlds:63810+rows.length*worlds,
  policies:POLICIES,scanAudit:selected.map(x=>({policy:x.policy,range:x.range,scanned:x.scanned,eligible:x.eligible,counts:x.counts})),
  summary:summarize(rows),limitations:['Branch ends/locking assumption-labelled','Sides are labels with no geometry in current engine','Position-selection bias','Unadjusted position-level normal CIs','Correlated hidden worlds','Handcrafted bots','Block winner not assigned'],
  exactNextAction:'Swap side labels under a side-equivariant continuation policy to isolate side-tie-break artifacts; replicate on disjoint deal seeds and test when opponent has one tile.',
  rows};
}
function selfTest(){
 const p=scan('min-hand-pips',166000,167000,1).positions[0];
 const before=JSON.stringify(p.state),a=analyze(p,2,'min-hand-pips'),b=analyze(p,2,'min-hand-pips');
 if(JSON.stringify(a)!==JSON.stringify(b)||before!==JSON.stringify(p.state))throw Error('determinism/immutability');
 return {passed:true,seed:p.seed,choice:p.choice,pairedWorlds:2};
}
if(require.main===module){
 const args=process.argv.slice(2);
 console.log(JSON.stringify(args[0]==='test'?selfTest():run(Number(args[0]||10),Number(args[1]||25)),null,2));
}
module.exports={choice,scan,analyze,run,selfTest};
