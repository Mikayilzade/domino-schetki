'use strict';
// Side-label metamorphic audit; independent of scoreboard. Run: node qosha-research/simulator/side-equivariance-audit.js 10 25
const e=require('./engine'),r=require('./round-driver'),{scan}=require('./same-tile-side-holdout');
const {sampleWorld}=require('./hidden-world'),{actionKey}=require('./decision-regret');
const POLICIES=['closed-branch-control','min-hand-pips','random-legal'];
const DISCOVERY=[['closed-branch-control',158000,166000],['min-hand-pips',166000,174000]];
function canonical(s){
 return JSON.stringify({branches:e.SIDES.map(k=>s.branchState.branches[k]).map(x=>[+x.active,x.end]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]),center:s.branchState.center,
 opened:[...s.openingState.openedNumbers].sort((a,b)=>a-b),hands:s.hands.map(h=>h.map(e.tileKey).sort()),stock:s.stock.map(e.tileKey),
 currentPlayer:s.currentPlayer,consecutivePasses:s.consecutivePasses,turns:s.turns,outcome:s.outcome});
}
function signature(a){return JSON.stringify([a.type,(a.tiles||[a.tile].filter(Boolean)).map(e.tileKey).sort(),a.from??null,a.to??null,(a.numbers||[]).slice().sort((x,y)=>x-y)]);}
function neutralChoose(policy,opts,ctx){
 const groups=new Map();for(const a of opts.actions){const k=signature(a);if(!groups.has(k))groups.set(k,a);}
 const unique=[...groups].sort(([a],[b])=>a.localeCompare(b));
 if(policy==='random-legal'){
  const hash=e.mixSeed32((ctx.seed ^ Math.imul(ctx.turns+1,0x85ebca6b) ^ Math.imul(ctx.player+1,0xc2b2ae35))>>>0);
  return unique[hash%unique.length][1];
 }
 const rows=unique.map(([key,a])=>({key,a,finish:a.type==='mixed-finish'?1:0,
  pips:e.pipSum(a.tiles||[a.tile].filter(Boolean)),doubles:(a.tiles||[a.tile].filter(Boolean)).filter(t=>t[0]===t[1]).length,
  opened:a.type==='double-sequence'?(a.numbers||[]).length:0}));
 rows.sort((a,b)=>b.finish-a.finish||(policy==='closed-branch-control'?a.opened-b.opened:0)||
  (policy==='fast-doubles'?b.doubles-a.doubles:0)||b.pips-a.pips||a.key.localeCompare(b.key));
 return rows[0].a;
}
function forced(s,key){return r.stepRound(s,opts=>{const a=opts.actions.find(x=>actionKey(x)===key);if(!a)throw Error('missing forced candidate');return a;});}
function compare(world,keys,policy,seed){
 let a=forced(world,keys[0]),b=forced(world,keys[1]);if(canonical(a)!==canonical(b))throw Error('immediate state not isomorphic');
 let turns=1;
 while(!a.outcome&&!b.outcome&&a.turns<200&&b.turns<200){
  const chooser=(opts,s)=>neutralChoose(policy,opts,{seed,turns:s.turns,player:s.currentPlayer});
  a=r.stepRound(a,chooser);b=r.stepRound(b,chooser);turns++;
  if(canonical(a)!==canonical(b))throw Error('policy violates side equivariance at turn '+a.turns);
 }
 if(!a.outcome||!b.outcome)throw Error('unresolved continuation');
 return {turns,kind:a.outcome.kind,minus:a.outcome.minus||0};
}
function run(quota=10,worlds=25){
 if(!Number.isInteger(quota)||quota<1||!Number.isInteger(worlds)||worlds<1||worlds>1000)throw Error('bad quota/worlds');
 const selected=DISCOVERY.map(([policy,start,end])=>({policy,range:[start,end-1],...scan(policy,start,end,quota)}));
 const positions=selected.flatMap(x=>x.positions);
 if(new Set(positions.map(x=>x.seed)).size!==positions.length)throw Error('duplicate seeds');
 const summary=Object.fromEntries(POLICIES.map(p=>[p,{worlds:0,exactStateAndOutcomeAgreements:0,finishes:0,blocks:0,meanTurns:0,minusCounts:{'-10':0,'-20':0,'-30':0,'-40':0}}]));
 for(const p of positions){
  const s=p.state,before=canonical(s),spec={focalPlayer:p.focal,focalHand:s.hands[p.focal],knownTiles:p.known,
   hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
  for(let i=0;i<worlds;i++){
   const seed=8500000+1000*p.seed+i,w=sampleWorld(spec,seed);
   for(const policy of POLICIES){
    const out=compare(w,p.choice.keys,policy,seed),t=summary[policy];t.worlds++;t.exactStateAndOutcomeAgreements++;
    if(out.kind==='finish')t.finishes++;else if(out.kind==='block')t.blocks++;
    t.meanTurns+=out.turns;if(out.minus<0)t.minusCounts[String(out.minus)]++;
   }
  }
  if(canonical(s)!==before)throw Error('visible source state mutated');
 }
 for(const t of Object.values(summary))t.meanTurns/=t.worlds;
 const total=positions.length*worlds;
 return {schema:'qosa-side-equivariance-audit/v1',timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'})+' +04:00',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',seedRanges:DISCOVERY.map(([,a,b])=>[a,b-1]),
  selectedSeeds:positions.map(p=>p.seed),quotaPerDiscoveryAndGroup:quota,worldsPerPosition:worlds,
  worldSeedFormula:'8500000+1000*dealSeed+worldIndex',positionCount:positions.length,newHiddenWorlds:total,
  policyWorldEvaluations:total*POLICIES.length,pairedContinuations:total*POLICIES.length*2,
  newFullStrategyRounds:0,cumulativeFullStrategyRounds:180000,previousHiddenWorlds:64810,cumulativeHiddenWorlds:64810+total,
  policies:POLICIES,summary,validation:'At every turn, the two continuations have identical canonical multiset of branch ends, opened numbers, hands, stock, turn and outcome. Source state unchanged.',
  finding:'For identical tile X-Y played from identical X ends onto two distinct sides, the geometry-free engine has no intrinsic side advantage. Nonzero differences with the previous side-sensitive policies are tie-breaking/order artifacts.',
  confidence:'Exact engine-state isomorphism for these actions and side-neutral policies, not an assertion about physical board geometry.',
  limitations:['Assumed branch locking','Side labels have no geometry/history in engine','Reachable-position selection','No assigned block winner'],
  exactNextAction:'Probe choices on sides with different end numbers and add explicit branch-history/locking effects only after rules are confirmed.'};
}
function selfTest(){return run(1,2);}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?selfTest():run(Number(a[0]||10),Number(a[1]||25)),null,2));}
module.exports={canonical,signature,neutralChoose,compare,run,selfTest};