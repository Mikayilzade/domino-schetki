'use strict';
// Reproduce: node qosha-research/simulator/double-connector-urgency-holdout.js 406000 466000 8 24
// Compare X-X opening now with spending X-Y connector on opened Y end; no official block winner.
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver'),init=require('./initializer');
const {chooseBy}=require('./strategy-runner'),{actionKey}=require('./decision-regret'),{sampleWorld}=require('./hidden-world');
const POLICIES=['closed-branch-control','min-hand-pips','fast-doubles'],TARGETS=[0,2,4];
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function ci(a){if(!a.length)return null;const m=mean(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0,h=1.96*sd/Math.sqrt(a.length);return{n:a.length,mean:m,ci95PositionNormalApprox:[m-h,m+h]};}
function signature(a){return JSON.stringify([a.type,(a.tiles||[a.tile].filter(Boolean)).map(e.tileKey).sort(),a.from??null,a.to??null,(a.numbers||[]).slice().sort((x,y)=>x-y)]);}
function neutralChoose(policy,opts){
 const groups=new Map();for(const a of opts.actions){const k=signature(a);if(!groups.has(k))groups.set(k,a);}
 const rows=[...groups].map(([key,a])=>({key,a,finish:a.type==='mixed-finish'?1:0,pips:e.pipSum(a.tiles||[a.tile].filter(Boolean)),doubles:(a.tiles||[a.tile].filter(Boolean)).filter(t=>t[0]===t[1]).length,opened:a.type==='double-sequence'?(a.numbers||[]).length:0}));
 rows.sort((a,b)=>b.finish-a.finish||(policy==='closed-branch-control'?a.opened-b.opened:0)||(policy==='fast-doubles'?b.doubles-a.doubles:0)||b.pips-a.pips||a.key.localeCompare(b.key));return rows[0].a;
}
function eligible(s){
 const f=s.currentPlayer,h=s.hands[f],opp=s.hands.filter((_,j)=>j!==f).map(x=>x.length),minOpp=Math.min(...opp);
 if(s.stock.length||h.length<3||h.length>5||minOpp>4)return[];
 const opts=d.turnOptions(s.branchState,s.openingState,h,s.stock);if(opts.phase!=='play'||opts.drawn)return[];
 const found=[];
 for(const x of TARGETS){
  if(e.isNumberOpened(s.openingState,x)||h.filter(t=>t.includes(x)).length<3||!h.some(t=>t[0]===x&&t[1]===x))continue;
  const doubles=opts.actions.filter(a=>a.type==='double-sequence'&&a.numbers.length===1&&a.numbers[0]===x);
  const connectors=opts.actions.filter(a=>a.type==='single'&&a.to===x&&a.from!==x&&a.tile.includes(x)).sort((a,b)=>actionKey(a).localeCompare(actionKey(b)));
  if(doubles.length&&connectors.length)found.push({x,doubleKey:actionKey(doubles[0]),connectorKey:actionKey(connectors[0]),connector:e.tileKey(connectors[0].tile),opponentSizes:opp,handSize:h.length,minOpp});
 }
 return found;
}
function collect(start,end,quota){
 const groups={urgent:Object.fromEntries(TARGETS.map(x=>[x,[]])),near:Object.fromEntries(TARGETS.map(x=>[x,[]]))},seen={urgent:0,near:0};
 for(let seed=start;seed<end;seed++){
  if(seed%17!==0)continue;
  let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});if(s.kind!=='ready')continue;
  while(!s.outcome&&s.turns<100){
   const cs=eligible(s);
   if(cs.length){
    const group=cs[0].minOpp<=2?'urgent':'near';seen[group]++;
    const c=cs.find(z=>groups[group][z.x].length<quota);
    if(c){const hidden=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
     groups[group][c.x].push({seed,group,focal:s.currentPlayer,state:r.cloneRoundState(s),known:e.createDoubleSixDeck().filter(t=>!hidden.has(e.tileKey(t))),choice:c});}
    break;
   }
   s=r.stepRound(s,(opts,st)=>chooseBy('closed-branch-control',opts,{seed,turns:st.turns,player:st.currentPlayer}));
  }
  if(['urgent','near'].every(g=>TARGETS.every(x=>groups[g][x].length>=quota)))break;
 }
 const positions=Object.values(groups).flatMap(g=>TARGETS.flatMap(x=>g[x]));
 if(positions.length!==2*TARGETS.length*quota)throw Error('insufficient strata');
 if(new Set(positions.map(p=>p.seed)).size!==positions.length)throw Error('duplicate seed');
 return{positions,seen,selectedByGroup:Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,Object.fromEntries(TARGETS.map(x=>[x,v[x].map(p=>p.seed)]))]))};
}
function forced(world,key){return r.stepRound(world,o=>{const a=o.actions.find(x=>actionKey(x)===key);if(!a)throw Error('missing forced action');return a;});}
function immediateThreat(s){
 if(s.outcome)return{finish:0,minus:0};
 const h=s.hands[s.currentPlayer],o=d.turnOptions(s.branchState,s.openingState,h,s.stock);if(o.phase!=='play')return{finish:0,minus:0};
 let finish=0,minus=0;for(const a of o.actions){const tiles=a.tiles||[a.tile].filter(Boolean);
  if(tiles.length===h.length){finish=1;if(e.finishMinus(a.type==='mixed-finish'?a.finishDoubles:a.type==='double-sequence'?a.tiles:[])<0)minus=1;}}
 return{finish,minus};
}
function finish(s,policy){const out=r.runRound(s,opts=>neutralChoose(policy,opts),{maxTurns:200});if(!out.outcome||out.outcome.kind==='unresolved')throw Error('unresolved');return out;}
function metrics(s,f){const o=s.outcome;return{first:+(o.kind==='finish'&&o.playerIndex===f),pips:e.pipSum(s.hands[f]),minus:+(o.kind==='finish'&&o.playerIndex===f&&o.minus<0),block:+(o.kind==='block'),turns:s.turns};}
function analyze(p,worlds){
 const s=p.state,f=p.focal,c=p.choice,before=JSON.stringify(s),spec={focalPlayer:f,focalHand:s.hands[f],knownTiles:p.known,hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s},base=22000000+1000*p.seed;
 const diffs=Object.fromEntries(POLICIES.map(policy=>[policy,[]])),threat=[],allocs=new Set(),offsets=[];
 const sizes=s.hands.filter((_,i)=>i!==f).map(h=>h.length),poolN=sizes[0]+sizes[1]+s.stock.length;
 const choose=(n,k)=>{let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v);};
 const maxAlloc=choose(poolN,sizes[0])*choose(poolN-sizes[0],sizes[1]),target=Math.min(worlds,maxAlloc);
 for(let j=0;j<2000&&allocs.size<target;j++){
  const seed=base+j,w=sampleWorld(spec,seed),fingerprint=JSON.stringify(w.hands.filter((_,i)=>i!==f).map(h=>h.map(e.tileKey).sort()).concat([w.stock.map(e.tileKey).sort()]));
  if(allocs.has(fingerprint))continue;allocs.add(fingerprint);offsets.push(j);
  const a=forced(w,c.doubleKey),b=forced(w,c.connectorKey),ta=immediateThreat(a),tb=immediateThreat(b);
  threat.push({finish:ta.finish-tb.finish,minus:ta.minus-tb.minus});
  for(const policy of POLICIES){const x=metrics(finish(a,policy),f),y=metrics(finish(b,policy),f);
   diffs[policy].push(Object.fromEntries(['first','pips','minus','block','turns'].map(k=>[k,x[k]-y[k]])));}
 }
 if(allocs.size!==target)throw Error('insufficient distinct allocations '+p.seed+' '+allocs.size+'/'+target);
 if(JSON.stringify(s)!==before)throw Error('source mutated');
 return{seed:p.seed,group:p.group,target:c.x,hand:s.hands[f].map(e.tileKey),connector:c.connector,handSize:c.handSize,opponentSizes:c.opponentSizes,branchEnds:e.SIDES.map(k=>s.branchState.branches[k].end),openedNumbers:[...s.openingState.openedNumbers].sort((a,b)=>a-b),turn:s.turns,worldSeedStart:base,worlds:allocs.size,maxDistinctAllocations:maxAlloc,worldSeedOffsets:offsets,immediateNextOpponentFinishDiff:mean(threat.map(x=>x.finish)),immediateNextOpponentMinusDiff:mean(threat.map(x=>x.minus)),policyDiff:Object.fromEntries(POLICIES.map(policy=>[policy,Object.fromEntries(['first','pips','minus','block','turns'].map(k=>[k,mean(diffs[policy].map(x=>x[k]))]))]))};
}
function aggregate(rows){
 const policies={};for(const policy of POLICIES){policies[policy]={};for(const group of ['urgent','near']){
  const sub=rows.filter(z=>z.group===group);policies[policy][group]={n:sub.length,byTarget:Object.fromEntries(TARGETS.map(x=>[x,{n:sub.filter(z=>z.target===x).length,finishFirst:ci(sub.filter(z=>z.target===x).map(z=>z.policyDiff[policy].first))}])),...Object.fromEntries(['first','pips','minus','block','turns'].map(k=>[k,ci(sub.map(z=>z.policyDiff[policy][k]))]))};}}
 return{policies,immediateNextOpponentFinish:Object.fromEntries(['urgent','near'].map(g=>[g,ci(rows.filter(z=>z.group===g).map(z=>z.immediateNextOpponentFinishDiff))])),immediateNextOpponentMinus:Object.fromEntries(['urgent','near'].map(g=>[g,ci(rows.filter(z=>z.group===g).map(z=>z.immediateNextOpponentMinusDiff))]))};
}
function selfTest(){const ps=collect(406000,466000,1).positions;if(ps.length!==6)throw Error('test positions');for(const z of ps){const o=d.turnOptions(z.state.branchState,z.state.openingState,z.state.hands[z.focal],z.state.stock),a=o.actions.find(a=>actionKey(a)===z.choice.doubleKey),b=o.actions.find(a=>actionKey(a)===z.choice.connectorKey);if(!a||!b||a.type!=='double-sequence'||b.type!=='single'||b.to!==z.choice.x||e.isNumberOpened(z.state.openingState,z.choice.x))throw Error('choice invariant');}return{passed:true,cases:ps.length};}
function run(start=406000,end=466000,quota=8,worlds=24){
 if(![start,end,quota,worlds].every(Number.isInteger)||quota<1||worlds<2||end<=start)throw Error('bad parameters');selfTest();
 const col=collect(start,end,quota),rows=col.positions.map(p=>analyze(p,worlds));
 return{schema:'qosa-double-connector-urgency/v1',timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'})+' +04:00',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',start,end,seedFilter:'seed%17===0',quotaPerTargetAndUrgency:quota,worldsPerPosition:worlds,selectedSeeds:rows.map(z=>z.seed),selectedByGroup:col.selectedByGroup,observedEligible:col.seen,positionCount:rows.length,newHiddenWorlds:rows.reduce((s,z)=>s+z.worlds,0),pairedCandidateContinuations:rows.reduce((s,z)=>s+z.worlds,0)*POLICIES.length*2,newFullStrategyRounds:0,worldSeedFormula:'22000000+1000*dealSeed+attemptOffset; unique allocation rejection, offsets saved per position',policies:POLICIES.map(p=>'side-neutral-'+p),comparison:'open X-X now minus spend X-Y connector from opened Y end to expose unopened X, same position/worlds',summary:aggregate(rows),rows,limitations:['Assumed locked/open branch semantics; 5-player/loneZero not tested','Urgency groups differ in round stage; between-group difference is not causal','Seed%17 first eligible selection; targets 0/2/4 only','Unique allocations sampled without replacement up to min(24, combinatorial maximum); different positions have different world counts','Simple deterministic bots; unadjusted position-level normal CIs','Block winner unassigned; finish-first excludes blocks','V8 CommonJS execution, independent Node CLI pending'],exactNextAction:'Disjoint-seed holdout matched by target X and focal hand size, emphasizing opponent <=2 and minus finish frequency.'};
}
if(require.main===module){const [a,b,c,w]=process.argv.slice(2).map(Number);console.log(JSON.stringify(run(a??406000,b??466000,c??8,w??24),null,2));}
module.exports={eligible,collect,immediateThreat,analyze,aggregate,selfTest,run};
