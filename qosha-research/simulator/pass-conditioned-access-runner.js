'use strict';
// Pass-conditioned versus uniform visible next-opponent access, same-tile branch choice.
// node qosha-research/simulator/pass-conditioned-access-runner.js test
// node qosha-research/simulator/pass-conditioned-access-runner.js 1318140 650 60 48
const e=require('./engine'),d=require('./turn-dispatcher');
const g=require('./same-tile-geometry-runner'),v=require('./visible-access-holdout');
const {posterior}=require('./joint-pass-memory-runner'),{actionKey}=require('./decision-regret');
const deck=e.createDoubleSixDeck(),profiles=['min-hand-pips','closed-branch-control'];
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function risks(pos){
  const s=pos.state,f=pos.seat,n=(f+1)%3,o=(f+2)%3;
  const known=new Set([...pos.known,...s.hands[f]].map(e.tileKey));
  const unseen=deck.filter(t=>!known.has(e.tileKey(t)));
  if(unseen.length!==s.hands[n].length+s.hands[o].length||s.stock.length)throw Error('hidden pool mismatch');
  const fn=new Set(pos.forbidden[n]),fo=new Set(pos.forbidden[o]);
  for(const t of unseen){const k=e.tileKey(t);if(fn.has(k)&&fo.has(k))throw Error('impossible unseen two-pass posterior');}
  const opts=d.turnOptions(s.branchState,s.openingState,s.hands[f],s.stock);
  const find=k=>opts.actions.find(a=>actionKey(a)===k);
  const high=find(pos.high),low=find(pos.low);
  if(!high||!low||high.type!=='single'||low.type!=='single'||e.tileKey(high.tile)!==e.tileKey(low.tile))throw Error('same-tile candidate mismatch');
  const baseline=v.visibleRisk(pos);
  function canPlay(a){
    const br=e.applySinglePlacement(s.branchState,a);
    const legal=new Set(deck.filter(t=>d.actionsForHand(br,s.openingState,[t]).length>0).map(e.tileKey));
    const pass=posterior(unseen,s.hands[n].length,fn,fo,legal,'joint');
    if(pass< -1e-12||pass>1+1e-12)throw Error('invalid pass probability');
    return 1-pass;
  }
  const jointDelta=canPlay(high)-canPlay(low),uniformDelta=baseline.predictedOpponentCanPlayDelta;
  if(!fn.size&&!fo.size&&Math.abs(jointDelta-uniformDelta)>1e-12)throw Error('no-history joint != uniform');
  return {uniformDelta,jointDelta,nextPassHistory:fn.size>0,otherPassHistory:fo.size>0,
    nextForbidden:fn.size,otherForbidden:fo.size,uniformHigh:uniformDelta<=1e-12,
    jointHigh:jointDelta<=1e-12};
}
function summary(rows){
  const n=rows.length;if(!n)return {n:0};
  const avg=k=>mean(rows.map(x=>x[k]));
  const mu=avg('memoryWinGain'),sd=n>1?Math.sqrt(rows.reduce((s,x)=>s+(x.memoryWinGain-mu)**2,0)/(n-1)):null;
  return {n,changedChoice:rows.filter(x=>x.changed).length,
    uniformHigh:rows.filter(x=>x.uniformHigh).length,jointHigh:rows.filter(x=>x.jointHigh).length,
    jointMinusUniformFinishFirstPP:100*mu,
    exploratoryPosition95HalfWidthPP:sd===null?null:100*1.96*sd/Math.sqrt(n),
    jointMinusUniformRemainderPips:avg('memoryPipsGain'),
    uniformPassDeltaMAE:avg('uniformPassError'),jointPassDeltaMAE:avg('jointPassError'),
    highMinusLowFinishFirstPP:100*avg('winDelta'),
    passConstrainedPositions:rows.filter(x=>x.nextPassHistory||x.otherPassHistory).length};
}
function run(start=1318140,count=650,limit=60,worlds=48){
  if(![start,count,limit,worlds].every(Number.isInteger)||count<1||limit<1||worlds<1)throw Error('bad arguments');
  const disc=g.collect(start,count,limit),raw=g.run(start,count,limit,worlds);
  if(disc.positions.length!==raw.positions)throw Error('position replay count');
  const rows=raw.rows.map((r,i)=>{
    const p=disc.positions[i];
    if(r.profile!==p.profile||r.seed!==p.seed||r.seat!==p.seat||r.turn!==p.turn||r.high!==p.high||r.low!==p.low)throw Error('position replay identity');
    const original=JSON.stringify(p.state),z=risks(p);
    if(original!==JSON.stringify(p.state))throw Error('visible state mutation');
    const changed=z.uniformHigh!==z.jointHigh,direction=Number(z.jointHigh)-Number(z.uniformHigh);
    return {profile:r.profile,seed:r.seed,seat:r.seat,turn:r.turn,tile:r.tile,
      high:r.high,low:r.low,ownMobilityGap:r.ownMobilityGap,
      focalHandSize:r.focalHandSize,opponentSizes:r.opponentSizes,
      winDelta:r.winDelta,pipsDelta:r.pipsDelta,minusDelta:r.minusDelta,
      nextPassDelta:r.nextPassDelta,nextPlayableDelta:r.nextPlayableDelta,...z,changed,
      memoryWinGain:direction*r.winDelta,memoryPipsGain:direction*r.pipsDelta,
      uniformPassError:Math.abs(-z.uniformDelta-r.nextPassDelta),
      jointPassError:Math.abs(-z.jointDelta-r.nextPassDelta)};
  });
  const groups={};
  for(const profile of profiles){
    const a=rows.filter(x=>x.profile===profile);
    groups[profile]={all:summary(a),
      anyHistory:summary(a.filter(x=>x.nextPassHistory||x.otherPassHistory)),
      noHistory:summary(a.filter(x=>!x.nextPassHistory&&!x.otherPassHistory)),
      nextHistory:summary(a.filter(x=>x.nextPassHistory)),
      otherHistory:summary(a.filter(x=>x.otherPassHistory)),
      bothHistory:summary(a.filter(x=>x.nextPassHistory&&x.otherPassHistory)),
      changed:summary(a.filter(x=>x.changed))};
  }
  return {schema:'qosa-pass-conditioned-visible-access/v1',
    engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0; branch semantics provisional',
    mode:'3x9',seedRange:[start,start+count-1],scanned:raw.scanned,
    positions:rows.length,worldsPerPosition:worlds,hiddenAllocations:rows.length*worlds,
    pairedContinuations:2*rows.length*worlds,profiles,
    decision:'For same non-double stone on two legal branches, choose high own-mobility placement unless predicted clockwise opponent can-play probability rises; compare uniform unseen posterior to joint posterior constrained by BOTH opponents observed no-stock passes. Ties choose high.',
    estimator:'Uniform next-pass = hypergeometric from all unseen stones. Joint pass = exact conditional uniform allocation: tiles forbidden to OTHER mandatory NEXT; forbidden to NEXT mandatory OTHER; remaining flexible tiles hypergeometric. No hidden hands inspected in either prediction.',
    rollout:'Identical hidden worlds, identical continuation bot and deterministic world seeds per forced placement. Outcomes measured as focal finish-first, remaining pips, minus finish and next-opponent pass.',
    limitations:'Branch opening semantics provisional; pass constraints exact only under stated rules; earlier policy-choice likelihood ignored; deterministic bots, first eligible geometry position, no block winner; finish-first != match win; exploratory uncorrected position intervals.',
    groups,rows};
}
function test(){
  const unseen=[[0,0],[0,1],[0,2],[0,3]],legal=new Set(['0-3']);
  const fn=new Set(['0-0']),fo=new Set(['0-3']);
  if(posterior(unseen,2,fn,fo,legal,'joint')!==0||
     Math.abs(posterior(unseen,2,fn,fo,legal,'plain')-0.5)>1e-12)throw Error('posterior fixture');
  const a=run(1318140,25,2,3),b=run(1318140,25,2,3);
  if(JSON.stringify(a)!==JSON.stringify(b)||a.positions!==4||a.pairedContinuations!==24)throw Error('replay');
  return {passed:true,positions:a.positions,pairedContinuations:a.pairedContinuations};
}
if(require.main===module){
  const a=process.argv.slice(2);
  console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1318140),+(a[1]||650),+(a[2]||60),+(a[3]||48)),null,2));
}
module.exports={risks,summary,run,test};
