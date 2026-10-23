'use strict';
// Targeted pass-conditioned geometry-choice regret. No game-rule changes.
// node qosha-research/simulator/pass-changed-geometry-runner.js test
// node qosha-research/simulator/pass-changed-geometry-runner.js 1319440 2500 220 128 12
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const g=require('./same-tile-geometry-runner'),p=require('./pass-conditioned-access-runner');
const {conditionalWorld}=require('./pass-choice-regret-runner');
const {chooseBy}=require('./strategy-runner'),{actionKey}=require('./decision-regret');
const profiles=['min-hand-pips','closed-branch-control'];
const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function rollout(world,key,profile,seed,seat){
  const opts=d.turnOptions(world.branchState,world.openingState,world.hands[seat],world.stock);
  const choice=opts.actions.find(a=>actionKey(a)===key);
  if(!choice||choice.type!=='single')throw Error('candidate mismatch');
  const after=r.stepRound(world,()=>choice);
  const nextPass=after.outcome?null:+(d.turnOptions(after.branchState,after.openingState,after.hands[after.currentPlayer],after.stock).phase==='pass');
  const end=after.outcome?after:r.runRound(after,(o,s)=>chooseBy(profile,o,{seed,turns:s.turns,player:s.currentPlayer}),{maxTurns:200});
  if(!end.outcome||end.outcome.kind==='unresolved')throw Error('rollout unresolved');
  return {win:+(end.outcome.kind==='finish'&&end.outcome.playerIndex===seat),
    pips:e.pipSum(end.hands[seat]),minus:+(end.outcome.kind==='finish'&&end.outcome.playerIndex===seat&&end.outcome.minus<0),
    block:+(end.outcome.kind==='block'),nextPass};
}
function summarize(rows){
  const n=rows.length;if(!n)return {positions:0};
  const mean=k=>avg(rows.map(x=>x[k]));
  const ci=k=>{if(n<2)return null;const m=mean(k);return 1.96*Math.sqrt(rows.reduce((s,x)=>s+(x[k]-m)**2,0)/(n-1)/n);};
  return {positions:n,finishFirstGainPP:100*mean('winGain'),
    exploratoryPosition95HalfWidthPP:ci('winGain')===null?null:100*ci('winGain'),
    remainderGainPips:mean('pipsGain'),minusFinishGainPP:100*mean('minusGain'),
    blockGainPP:100*mean('blockGain'),nextPassGainPP:100*mean('nextPassGain'),
    jointBetter:rows.filter(x=>x.winGain>1e-12).length,
    uniformBetter:rows.filter(x=>x.winGain< -1e-12).length,
    tied:rows.filter(x=>Math.abs(x.winGain)<=1e-12).length};
}
function run(start=1319440,count=2500,discoveryLimit=220,worlds=128,maxChanged=12){
  if(![start,count,discoveryLimit,worlds,maxChanged].every(Number.isInteger)||
    count<1||discoveryLimit<1||worlds<1||maxChanged<1)throw Error('bad arguments');
  const disc=g.collect(start,count,discoveryLimit),selected=[],eligible={};
  for(const profile of profiles)eligible[profile]=0;
  for(const pos of disc.positions){
    eligible[pos.profile]++;
    const risk=p.risks(pos);
    if(risk.uniformHigh===risk.jointHigh)continue;
    if(selected.filter(x=>x.pos.profile===pos.profile).length>=maxChanged)continue;
    selected.push({pos,risk});
  }
  const rows=[];
  for(const {pos,risk} of selected){
    const before=JSON.stringify(pos.state),sums={win:0,pips:0,minus:0,block:0,nextPass:0};
    const uniformKey=risk.uniformHigh?pos.high:pos.low,jointKey=risk.jointHigh?pos.high:pos.low;
    for(let i=0;i<worlds;i++){
      const seed=e.mixSeed32((pos.seed^Math.imul(pos.turn+1,0x9e3779b9)^Math.imul(pos.seat+1,0x85ebca6b)^Math.imul(i+1,0xc2b2ae35))>>>0);
      const world=conditionalWorld(pos,seed);
      const a=rollout(world,uniformKey,pos.profile,seed,pos.seat);
      const b=rollout(world,jointKey,pos.profile,seed,pos.seat);
      for(const k of Object.keys(sums))sums[k]+=(b[k]-a[k])/worlds;
    }
    if(JSON.stringify(pos.state)!==before)throw Error('source state mutated');
    rows.push({profile:pos.profile,seed:pos.seed,seat:pos.seat,turn:pos.turn,tile:pos.tile,
      uniformKey,jointKey,uniformDelta:risk.uniformDelta,jointDelta:risk.jointDelta,
      nextPassHistory:risk.nextPassHistory,otherPassHistory:risk.otherPassHistory,
      nextForbidden:risk.nextForbidden,otherForbidden:risk.otherForbidden,
      focalHandSize:pos.state.hands[pos.seat].length,
      opponentHandSizes:pos.state.hands.map(h=>h.length),
      ...Object.fromEntries(Object.entries(sums).map(([k,v])=>[k+'Gain',v]))});
  }
  return {schema:'qosa-pass-changed-geometry-regret/v1',engine:'qosa-research-0.5.3',
    rules:'recovered qosa-1.0.0; branch semantics provisional',mode:'3x9',
    seedRange:[start,start+count-1],scanned:disc.scanned,eligible,
    selection:'First eligible same-tile differing-geometry position per focal trajectory; select only positions where joint and uniform visible access recommend different placements, up to maxChanged per profile.',
    positions:rows.length,worldsPerPosition:worlds,hiddenAllocations:rows.length*worlds,
    pairedContinuations:2*rows.length*worlds,profiles,
    worldSeedFormula:'mixSeed32(seed xor imul(turn+1,0x9e3779b9) xor imul(seat+1,0x85ebca6b) xor imul(worldIndex+1,0xc2b2ae35))',
    comparison:'Joint pass-conditioned choice minus uniform unseen-tile choice, forced on identical hidden allocations and continuation policy; win=finish first, not match win.',
    assumptions:'Uniform conditional allocation of hidden tiles consistent with both observed no-stock pass sets. Earlier opponent action likelihood ignored. Block winner unassigned.',
    limitations:'Targeted rare changed-choice sample, first-eligible selection, exploratory position-cluster intervals uncorrected, correlated worlds, deterministic bots, provisional branch rules.',
    summaries:Object.fromEntries(profiles.map(profile=>[profile,{
      all:summarize(rows.filter(x=>x.profile===profile)),
      nextHistory:summarize(rows.filter(x=>x.profile===profile&&x.nextPassHistory)),
      otherOnly:summarize(rows.filter(x=>x.profile===profile&&!x.nextPassHistory&&x.otherPassHistory))
    }])),rows};
}
function test(){
  const a=run(1319440,45,5,3,2),b=run(1319440,45,5,3,2);
  if(JSON.stringify(a)!==JSON.stringify(b)||a.pairedContinuations!==a.positions*6)throw Error('deterministic replay');
  return {passed:true,positions:a.positions,pairedContinuations:a.pairedContinuations};
}
if(require.main===module){
  const args=process.argv.slice(2);
  console.log(JSON.stringify(args[0]==='test'?test():
    run(+(args[0]||1319440),+(args[1]||2500),+(args[2]||220),+(args[3]||128),+(args[4]||12)),null,2));
}
module.exports={run,test,summarize};