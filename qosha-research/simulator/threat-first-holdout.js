'use strict';
// Out-of-sample threat-first override for the SAME X-Y stone on different open ends.
// CLI: node qosha-research/simulator/threat-first-holdout.js [quota=12] [trainWorlds=25] [testWorlds=25]
// Every decision uses ONLY sampled hidden worlds in the training split, never the evaluation worlds.
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver'),init=require('./initializer');
const {chooseBy}=require('./strategy-runner'),{sampleWorld}=require('./hidden-world');
const {actionKey}=require('./decision-regret'),{neutralChoose}=require('./side-equivariance-audit');
const {choice}=require('./different-end-choice');
const SCANS=[['closed-branch-control',210000,216000],['min-hand-pips',216000,222000]];
const POLICIES=['closed-branch-control','min-hand-pips','random-legal'];
function mean(a){return a.reduce((s,x)=>s+x,0)/a.length;}
function stat(a){if(!a.length)return null;const m=mean(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0,h=1.96*sd/Math.sqrt(a.length);return{n:a.length,mean:m,ci95NormalApprox:[m-h,m+h]};}
function collect(policy,start,end,quota){
 const groups={lowMore:[],highMore:[]};let eligible=0;
 for(let seed=start;seed<end;seed++){
  let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(s.kind!=='ready')continue;
  while(!s.outcome&&s.turns<100){
   const c=choice(s),f=s.currentPlayer;
   if(c&&c.lowMob!==c.highMob&&s.hands[(f+1)%3].length===1&&s.hands[(f+2)%3].length>=2){
    eligible++;const hidden=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
    const group=c.lowMob>c.highMob?'lowMore':'highMore';
    groups[group].push({seed,policy,group,focal:f,state:r.cloneRoundState(s),choice:c,
      known:e.createDoubleSixDeck().filter(t=>!hidden.has(e.tileKey(t)))});
    break;
   }
   s=r.stepRound(s,(opts,st)=>chooseBy(policy,opts,{seed,turns:st.turns,player:st.currentPlayer}));
  }
 }
 const available=Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,v.length]));
 const positions=[];
 for(const [group,rows] of Object.entries(groups)){
  if(rows.length<quota)throw Error('insufficient '+policy+'/'+group+': '+rows.length);
  rows.sort((a,b)=>e.mixSeed32(a.seed^0x51cc77)-e.mixSeed32(b.seed^0x51cc77)||a.seed-b.seed);
  positions.push(...rows.slice(0,quota));
 }
 return{positions,eligible,available,seedRange:[start,end-1]};
}
function forced(world,key){
 return r.stepRound(world,opts=>{
  const a=opts.actions.find(x=>actionKey(x)===key);
  if(!a)throw Error('candidate absent: '+key);
  return a;
 });
}
function immediateThreat(state,next){
 if(state.outcome)return 0;
 if(state.currentPlayer!==next||state.hands[next].length!==1||state.stock.length)throw Error('next one-tile opponent invariant');
 return +(d.turnOptions(state.branchState,state.openingState,state.hands[next],state.stock).phase==='play');
}
function finish(state,policy,seed){
 while(!state.outcome&&state.turns<200)state=r.stepRound(state,(opts,s)=>neutralChoose(policy,opts,{seed,turns:s.turns,player:s.currentPlayer}));
 if(!state.outcome||state.outcome.kind==='unresolved')throw Error('unresolved');
 return state;
}
function metrics(state,focal){
 const o=state.outcome;return{first:+(o.kind==='finish'&&o.playerIndex===focal),pips:e.pipSum(state.hands[focal]),
  minus:+(o.kind==='finish'&&o.playerIndex===focal&&o.minus<0),block:+(o.kind==='block'),turns:state.turns};
}
function analyze(p,trainWorlds,testWorlds){
 const s=p.state,before=JSON.stringify(s),f=p.focal,c=p.choice,next=(f+1)%3;
 const spec={focalPlayer:f,focalHand:s.hands[f],knownTiles:p.known,hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
 const aligned=c.highMob>c.lowMob?0:1,alternative=1-aligned,keys=c.keys,base=14000000+1000*p.seed;
 const train=[0,0];
 for(let i=0;i<trainWorlds;i++){
  const w=sampleWorld(spec,base+i);
  for(let j=0;j<2;j++)train[j]+=immediateThreat(forced(w,keys[j]),next);
 }
 const trainRisk=train.map(x=>x/trainWorlds);
 const override=trainRisk[alternative]+0.12<=trainRisk[aligned];
 const selected=override?alternative:aligned;
 const sums={risk:[0,0],policy:Object.fromEntries(POLICIES.map(x=>[x,[[],[]]]))};
 for(let i=0;i<testWorlds;i++){
  const seed=base+trainWorlds+i,w=sampleWorld(spec,seed);
  const states=keys.map(k=>forced(w,k));
  for(let j=0;j<2;j++)sums.risk[j]+=immediateThreat(states[j],next);
  for(const policy of POLICIES)for(let j=0;j<2;j++)
   sums.policy[policy][j].push(metrics(finish(r.cloneRoundState(states[j]),policy,seed),f));
 }
 if(JSON.stringify(s)!==before)throw Error('source mutated');
 const rows={};
 for(const policy of POLICIES){
  const a=sums.policy[policy];
  rows[policy]=Object.fromEntries(['first','pips','minus','block','turns'].map(k=>[k,
   {aligned:mean(a[aligned].map(x=>x[k])),alternative:mean(a[alternative].map(x=>x[k])),
    threatFirst:mean(a[selected].map(x=>x[k])),overrideMinusMobility:mean(a[selected].map(x=>x[k]))-mean(a[aligned].map(x=>x[k]))}]));
 }
 return{seed:p.seed,discoveryPolicy:p.policy,group:p.group,focal:f,turn:s.turns,
  focalHand:s.hands[f].map(e.tileKey),nextOpponentHandSize:s.hands[next].length,otherOpponentHandSize:s.hands[(f+2)%3].length,
  branchEnds:Object.fromEntries(e.SIDES.map(k=>[k,s.branchState.branches[k].end])),tile:c.tile,lowMob:c.lowMob,highMob:c.highMob,
  keys,alignedIndex:aligned,chosenIndex:selected,override,trainRiskAligned:trainRisk[aligned],trainRiskAlternative:trainRisk[alternative],
  testRiskAligned:sums.risk[aligned]/testWorlds,testRiskAlternative:sums.risk[alternative]/testWorlds,
  testRiskThreatFirst:sums.risk[selected]/testWorlds,worldSeedStart:base,trainWorlds,testWorlds,policies:rows};
}
function aggregate(rows){
 const out={positionCount:rows.length,overrides:rows.filter(x=>x.override).length,
  riskAligned:stat(rows.map(x=>x.testRiskAligned)),riskAlternative:stat(rows.map(x=>x.testRiskAlternative)),
  riskThreatFirst:stat(rows.map(x=>x.testRiskThreatFirst)),
  riskImprovement:stat(rows.map(x=>x.testRiskThreatFirst-x.testRiskAligned)),
  policies:{}};
 for(const policy of POLICIES){
  const all=rows,over=rows.filter(x=>x.override);
  out.policies[policy]={};
  for(const [label,group] of [['all',all],['overrideOnly',over]]){
   out.policies[policy][label]=Object.fromEntries(['first','pips','minus','block','turns'].map(k=>
    [k,stat(group.map(x=>x.policies[policy][k].overrideMinusMobility))]));
  }
 }
 return out;
}
function run(quota=12,trainWorlds=25,testWorlds=25){
 if(![quota,trainWorlds,testWorlds].every(x=>Number.isInteger(x)&&x>0&&x<=100))throw Error('bad parameters');
 const scans=SCANS.map(([policy,a,b])=>({policy,...collect(policy,a,b,quota)}));
 const positions=scans.flatMap(x=>x.positions);
 if(new Set(positions.map(x=>x.seed)).size!==positions.length)throw Error('duplicate selected seeds');
 const rows=positions.map(p=>analyze(p,trainWorlds,testWorlds));
 return{schema:'qosa-threat-first-out-of-sample/v1',timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'})+' +04:00',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',scans:scans.map(x=>({policy:x.policy,seedRange:x.seedRange,eligible:x.eligible,available:x.available})),
  selectedSeeds:rows.map(x=>x.seed),positionCount:rows.length,trainWorlds,testWorlds,
  uniqueHiddenWorlds:rows.length*(trainWorlds+testWorlds),evaluationWorlds:rows.length*testWorlds,
  candidateContinuations:rows.length*testWorlds*2*POLICIES.length,fullStrategyRounds:0,
  worldSeedFormula:'14000000+1000*dealSeed+worldIndex (training 0..trainWorlds-1, evaluation trainWorlds..trainWorlds+testWorlds-1)',
  strategies:['mobility-aligned','threat-first (training Monte Carlo override >=12pp)','mobility-alternative'],
  continuationPolicies:POLICIES.map(x=>'side-neutral-'+x),
  selection:'First reachable same X-Y tile on distinct open X/Y ends, next opponent exactly one stone, other opponent >=2, unequal own endpoint mobility; stratified by discovery policy and mobility direction.',
  method:'Risk is chance the next opponent can finish immediately on its very next turn, estimated using only 25 training worlds. Override mobility-aligned choice when alternative reduces estimated immediate threat by at least 12 percentage points. Outcomes measured on disjoint 25 evaluation worlds per position; same evaluation worlds/policies for both forced moves.',
  ciMethod:'Unadjusted exploratory normal 95% intervals clustered by distinct selected deal-seed position; hidden worlds within position are NOT independent.',
  summary:aggregate(rows),rows,
  limitations:['Assumption-labelled branch locking/opening','Simple deterministic bots and no block winner','No conditioning hidden distributions on opponent pass history','First eligible per seed and quota balancing','Exploratory unadjusted CIs','Risk model considers next opponent only; other opponent not immediate','V8 CommonJS evaluation, not Node CLI'],
  exactNextAction:'Independently replicate on disjoint seed ranges, test threshold sensitivity without reusing evaluation worlds, then evaluate both opponents at one tile.'};
}
function selfTest(){
 const p=collect('closed-branch-control',210000,211000,1).positions[0];
 const a=analyze(p,3,4),b=analyze(p,3,4);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.nextOpponentHandSize!==1)throw Error('determinism/invariant');
 if(a.trainWorlds!==3||a.testWorlds!==4)throw Error('split');
 return{passed:true,seed:p.seed};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?selfTest():run(Number(a[0]||12),Number(a[1]||25),Number(a[2]||25)),null,2));}
module.exports={collect,immediateThreat,analyze,aggregate,run,selfTest};
