'use strict';
// Paired same-tile choice between DIFFERENT open branch-end values X and Y.
// Run: node qosha-research/simulator/different-end-choice-replication.js 8 25
// No scoreboard imports. Fixed-visible hidden worlds, side-neutral continuation.
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver'),init=require('./initializer');
const {chooseBy}=require('./strategy-runner'),{sampleWorld}=require('./hidden-world');
const {actionKey}=require('./decision-regret'),{neutralChoose}=require('./side-equivariance-audit');
const DISCOVERY=[['closed-branch-control',178000,182000],['min-hand-pips',186000,190000]];
const POLICIES=['closed-branch-control','min-hand-pips','random-legal'];
const MOBILITY=['low-more','high-more','equal'],URGENCY=['late','early'];
function choice(s){
 const hand=s.hands[s.currentPlayer];
 if(s.stock.length||hand.length<2||hand.length>7)return null;
 const o=d.turnOptions(s.branchState,s.openingState,hand,s.stock);
 if(o.phase!=='play'||o.drawn)return null;
 const by={};
 for(const a of o.actions)if(a.type==='single'&&a.from!==a.to&&e.isNumberOpened(s.openingState,a.from))
  (by[e.tileKey(a.tile)]||(by[e.tileKey(a.tile)]=[])).push(a);
 for(const tile of Object.keys(by).sort()){
  const [low,high]=tile.split('-').map(Number),actions=by[tile];
  const onLow=actions.find(a=>a.from===low&&a.to===high);
  const onHigh=actions.find(a=>a.from===high&&a.to===low);
  if(!onLow||!onHigh||onLow.side===onHigh.side)continue;
  const lowMob=hand.filter(t=>e.tileKey(t)!==tile&&t.includes(low)).length;
  const highMob=hand.filter(t=>e.tileKey(t)!==tile&&t.includes(high)).length;
  return {tile,low,high,lowMob,highMob,onLowSide:onLow.side,onHighSide:onHigh.side,
   keys:[actionKey(onLow),actionKey(onHigh)]};
 }
 return null;
}
function groupOf(s,c){
 const focal=s.currentPlayer,opponents=s.hands.filter((_,i)=>i!==focal).map(h=>h.length);
 return {urgency:Math.min(...opponents)<=2?'late':'early',
  mobility:c.lowMob>c.highMob?'low-more':c.lowMob<c.highMob?'high-more':'equal',opponents};
}
function scan(policy,start,end,quota){
 const groups=Object.fromEntries(URGENCY.flatMap(u=>MOBILITY.map(m=>[u+':'+m,[]])));
 let eligible=0;
 for(let seed=start;seed<end;seed++){
  let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(s.kind!=='ready')continue;
  while(!s.outcome&&s.turns<100){
   const c=choice(s);
   if(c){
    eligible++;const g=groupOf(s,c),key=g.urgency+':'+g.mobility;
    const hidden=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
    groups[key].push({seed,discoveryPolicy:policy,group:key,opponents:g.opponents,
     focal:s.currentPlayer,state:r.cloneRoundState(s),
     known:e.createDoubleSixDeck().filter(t=>!hidden.has(e.tileKey(t))),choice:c});
    break;
   }
   s=r.stepRound(s,(opts,st)=>chooseBy(policy,opts,{seed,turns:st.turns,player:st.currentPlayer}));
  }
 }
 const available=Object.fromEntries(Object.entries(groups).map(([k,a])=>[k,a.length]));
 const selected=[];
 for(const [key,rows] of Object.entries(groups)){
  if(rows.length<quota)throw Error('insufficient '+policy+'/'+key+': '+rows.length);
  rows.sort((a,b)=>e.mixSeed32(a.seed^0x0bcd2311)-e.mixSeed32(b.seed^0x0bcd2311)||a.seed-b.seed);
  selected.push(...rows.slice(0,quota));
 }
 return {selected,available,eligible,range:[start,end-1]};
}
function forced(s,key){
 return r.stepRound(s,opts=>{
  const a=opts.actions.find(x=>actionKey(x)===key);
  if(!a)throw Error('forced action missing: '+key);
  return a;
 });
}
function finish(s,policy,seed){
 let state=s;
 while(!state.outcome&&state.turns<200){
  state=r.stepRound(state,(opts,st)=>neutralChoose(policy,opts,{seed,turns:st.turns,player:st.currentPlayer}));
 }
 if(!state.outcome||state.outcome.kind==='unresolved')throw Error('unresolved continuation');
 return state;
}
function metrics(end,focal){
 const o=end.outcome;
 return {first:+(o.kind==='finish'&&o.playerIndex===focal),pips:e.pipSum(end.hands[focal]),
  minus:+(o.kind==='finish'&&o.playerIndex===focal&&(o.minus||0)<0),
  minusValue:o.kind==='finish'&&o.playerIndex===focal?(o.minus||0):0,
  block:+(o.kind==='block'),turns:end.turns};
}
function mean(xs){return xs.reduce((a,b)=>a+b,0)/xs.length;}
function median(xs){const a=xs.slice().sort((x,y)=>x-y),n=a.length;return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2;}
function stat(xs){
 if(!xs.length)return null;const n=xs.length,m=mean(xs);
 const sd=n>1?Math.sqrt(xs.reduce((s,x)=>s+(x-m)**2,0)/(n-1)):0;
 const h=1.96*sd/Math.sqrt(n);
 return {n,mean:m,ci95NormalApprox:[m-h,m+h]};
}
function analyze(p,worlds,policy){
 const s=p.state,c=p.choice,before=JSON.stringify(s);
 const spec={focalPlayer:p.focal,focalHand:s.hands[p.focal],knownTiles:p.known,
  hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
 const data={onLow:[],onHigh:[],aligned:[],hindsightRegret:[]},counts={onLow:{'-10':0,'-20':0,'-30':0,'-40':0},onHigh:{'-10':0,'-20':0,'-30':0,'-40':0}};
 for(let i=0;i<worlds;i++){
  const seed=9900000+1000*p.seed+i,world=sampleWorld(spec,seed);
  const a=metrics(finish(forced(world,c.keys[0]),policy,seed),p.focal);
  const b=metrics(finish(forced(world,c.keys[1]),policy,seed),p.focal);
  data.onLow.push(a);data.onHigh.push(b);
  if(a.minusValue<0)counts.onLow[String(a.minusValue)]++;
  if(b.minusValue<0)counts.onHigh[String(b.minusValue)]++;
  const sign=Math.sign(c.highMob-c.lowMob);
  if(sign!==0){
   data.aligned.push(Object.fromEntries(['first','pips','minus','block','turns'].map(k=>[k,sign*(a[k]-b[k])])));
   data.hindsightRegret.push(Math.max(a.first,b.first)-(sign>0?a.first:b.first));
  }
 }
 if(JSON.stringify(s)!==before)throw Error('source-state mutation');
 const summary={};
 for(const k of ['onLow','onHigh'])summary[k]={
  ...Object.fromEntries(['first','pips','minus','block','turns'].map(m=>[m,mean(data[k].map(x=>x[m]))])),
  medianPips:median(data[k].map(x=>x.pips)),minusCounts:counts[k]};
 summary.onLowMinusOnHigh=Object.fromEntries(['first','pips','minus','block','turns'].map(k=>[k,summary.onLow[k]-summary.onHigh[k]]));
 summary.mobilityAligned=data.aligned.length?Object.fromEntries(['first','pips','minus','block','turns'].map(k=>[k,mean(data.aligned.map(x=>x[k]))])):null;
 summary.hindsightRegret=data.hindsightRegret.length?mean(data.hindsightRegret):null;
 return summary;
}
function aggregate(rows){
 const out={};
 for(const policy of POLICIES){
  out[policy]={};
  for(const key of ['all','mobility-unequal',...URGENCY,...MOBILITY,...URGENCY.flatMap(u=>MOBILITY.map(m=>u+':'+m))]){
   const selected=rows.filter(x=>key==='all'||key==='mobility-unequal'&&x.mobility!=='equal'||
    key===x.urgency||key===x.mobility||key===x.group);
   out[policy][key]={
    alignedFinish:stat(selected.filter(x=>x.mobility!=='equal').map(x=>x.policies[policy].mobilityAligned.first)),
    alignedPips:stat(selected.filter(x=>x.mobility!=='equal').map(x=>x.policies[policy].mobilityAligned.pips)),
    alignedMinus:stat(selected.filter(x=>x.mobility!=='equal').map(x=>x.policies[policy].mobilityAligned.minus)),
    alignedHindsightRegret:stat(selected.filter(x=>x.mobility!=='equal').map(x=>x.policies[policy].hindsightRegret)),
    onLowMinusOnHighFinish:stat(selected.map(x=>x.policies[policy].onLowMinusOnHigh.first))
   };
  }
 }
 return out;
}
function run(quota=8,worlds=25){
 if(!Number.isInteger(quota)||quota<1||!Number.isInteger(worlds)||worlds<1||worlds>1000)throw Error('bad quota/worlds');
 const scans=DISCOVERY.map(([p,a,b])=>({policy:p,...scan(p,a,b,quota)}));
 const positions=scans.flatMap(x=>x.selected);
 if(new Set(positions.map(x=>x.seed)).size!==positions.length)throw Error('duplicate selected seed');
 const rows=positions.map(p=>({seed:p.seed,discoveryPolicy:p.discoveryPolicy,group:p.group,
  urgency:p.group.split(':')[0],mobility:p.group.split(':')[1],focal:p.focal,
  turn:p.state.turns,hand:p.state.hands[p.focal].map(e.tileKey),opponents:p.opponents,
  branchEnds:Object.fromEntries(e.SIDES.map(k=>[k,p.state.branchState.branches[k].end])),
  tile:p.choice.tile,low:p.choice.low,high:p.choice.high,lowMob:p.choice.lowMob,highMob:p.choice.highMob,
  onLowSide:p.choice.onLowSide,onHighSide:p.choice.onHighSide,
  candidateKeys:p.choice.keys,worldSeedStart:9900000+1000*p.seed,policies:{}}));
 for(let k=0;k<positions.length;k++)for(const policy of POLICIES)
  rows[k].policies[policy]=analyze(positions[k],worlds,policy);
 return {schema:'qosa-different-end-same-tile/v1',
  timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'})+' +04:00',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  seedRanges:DISCOVERY.map(([,a,b])=>[a,b-1]),selectedSeeds:rows.map(x=>x.seed),
  quotaPerDiscoveryUrgencyMobilityCell:quota,worldsPerPosition:worlds,
  positionCount:rows.length,newHiddenWorlds:rows.length*worlds,
  policyWorldEvaluations:rows.length*worlds*POLICIES.length,
  candidateContinuations:rows.length*worlds*POLICIES.length*2,
  newFullStrategyRounds:0,cumulativeFullStrategyRounds:180000,
  previousHiddenWorlds:68210,cumulativeHiddenWorlds:68210+rows.length*worlds,
  worldSeedFormula:'9900000+1000*dealSeed+worldIndex',
  selection:'First reachable 2..7-tile hand with one X-Y ordinary tile playable on two distinct open sides ending in X and Y; no stock; stratify opponent minimum <=2 vs >=3 and own remaining connector mobility X>Y, Y>X or equal.',
  comparison:'onLow = place X-Y on X and expose Y; onHigh = place X-Y on Y and expose X. Aligned difference chooses the newly exposed endpoint with more OTHER own matching stones. Both candidates forced in identical hidden worlds.',
  continuationPolicies:POLICIES.map(p=>'side-neutral-'+p),
  ciMethod:'Unadjusted 95% normal CI over distinct selected deal-seed positions (not correlated worlds); exploratory multiple strata.',
  scanAudit:scans.map(s=>({policy:s.policy,range:s.range,eligible:s.eligible,available:s.available})),
  summary:aggregate(rows),rows,
  limitations:['Assumption-labelled opening/locking semantics','Bots are handcrafted','First eligible per seed and stratified sampling','No block winner assigned','No geometry/history beyond branch ends','Unadjusted exploratory CIs and multiple subgroup tests'],
  exactNextAction:'Analyze holdout counterexamples and verify urgency-specific effects with a preregistered 2x2 stratification on fresh seeds.'};
}
function selfTest(){
 const s=scan('closed-branch-control',174000,174500,1).selected[0];
 if(!s)throw Error('missing fixture');
 const c=s.choice;
 if(c.low===c.high||c.keys[0]===c.keys[1])throw Error('invalid different-end choice');
 const before=JSON.stringify(s.state),a=analyze(s,2,'closed-branch-control'),b=analyze(s,2,'closed-branch-control');
 if(JSON.stringify(a)!==JSON.stringify(b)||JSON.stringify(s.state)!==before)throw Error('nondeterminism/mutation');
 const ends=key=>e.SIDES.map(side=>forced(s.state,key).branchState.branches[side].end).sort((x,y)=>x-y).join(',');
 if(ends(c.keys[0])===ends(c.keys[1]))throw Error('candidate endpoints must structurally differ');
 return {passed:true,seed:s.seed,choice:c,worlds:2};
}
if(require.main===module){
 const args=process.argv.slice(2);
 console.log(JSON.stringify(args[0]==='test'?selfTest():run(Number(args[0]||8),Number(args[1]||25)),null,2));
}
module.exports={choice,groupOf,scan,analyze,aggregate,run,selfTest};