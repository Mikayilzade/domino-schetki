'use strict';
// Fixed-visible matched-world experiment. Node: test | run <startSeed> <count> <quota> <worlds>
const e=require('./engine'),init=require('./initializer'),r=require('./round-driver');
const first=require('./first-tile-disagreement'),link=require('./first-tile-link-strata');
const hw=require('./hidden-world'),dispatch=require('./turn-dispatcher');
const canon=require('./canonical-multiset-holdout'),prior=require('./tiebreak-priority-holdout');
const regret=require('./decision-regret');
const policies=['seat-mix','all-min-pips'];
function classify(f){
 const a=link.linkCount(link.afterHand(f.state,f.legacy)),b=link.linkCount(link.afterHand(f.state,f.tileFirst));
 const opp=f.state.hands[(f.state.currentPlayer+1)%3].length;
 if(a===b||opp<3)return null;
 return {stage:opp<=5?'opp3to5':'opp6plus',high:a>b?f.legacy:f.tileFirst,
 low:a>b?f.tileFirst:f.legacy,highLinks:Math.max(a,b),lowLinks:Math.min(a,b),opp};
}
function spec(f){
 const s=f.state,live=s.hands.flat().concat(s.stock),set=new Set(live.map(e.tileKey));
 if(set.size!==live.length)throw Error('duplicate live tile');
 const known=e.createDoubleSixDeck().filter(t=>!set.has(e.tileKey(t)));
 if(known.length+live.length!==28)throw Error('deck mismatch');
 return {visibleState:s,focalPlayer:s.currentPlayer,focalHand:s.hands[s.currentPlayer],
 knownTiles:known,hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length};
}
function continuation(policy,f){
 return (o,s)=>canon.choose(policy==='seat-mix'?prior.POLICIES[(s.currentPlayer+f.rotation)%3]:'min-hand-pips',
 o,s,'canonical-multiset',{seed:f.seed,rotation:f.rotation,turns:s.turns,player:s.currentPlayer});
}
function rollout(w,a,f,p){
 const n=r.stepRound(w,()=>a),next=n.outcome?0:dispatch.turnOptions(n.branchState,n.openingState,n.hands[n.currentPlayer],n.stock).actions.length;
 const x=n.outcome?n:r.runRound(n,continuation(p,f),{maxTurns:200});
 if(!x.outcome||x.outcome.kind==='unresolved')throw Error('unresolved '+f.seed);
 const k=w.currentPlayer,win=x.outcome.kind==='finish'&&x.outcome.playerIndex===k;
 return {win:Number(win),pips:e.pipSum(x.hands[k]),minus:Number(win&&x.outcome.minus<0),
 block:Number(x.outcome.kind==='block'),turns:x.turns-w.turns,next};
}
function avg(rows,k){return rows.reduce((s,x)=>s+x[k],0)/rows.length;}
function summarize(rows){
 if(!rows.length)return {n:0};
 const h=avg(rows,'winHigh'),l=avg(rows,'winLow'),ph=avg(rows,'pipsHigh'),pl=avg(rows,'pipsLow'),
 mh=avg(rows,'minusHigh'),ml=avg(rows,'minusLow'),d=avg(rows,'delta');
 const n=rows.length,se=n>1?Math.sqrt(rows.reduce((s,x)=>s+(x.delta-d)**2,0)/(n*(n-1))):null;
 return {n,finishHigh:h,finishLow:l,finishDelta:d,position95:se===null?null:[d-1.96*se,d+1.96*se],
 meanPipsHigh:ph,meanPipsLow:pl,minusHigh:mh,minusLow:ml,blocksHigh:avg(rows,'blockHigh'),
 blocksLow:avg(rows,'blockLow'),meanTurnsHigh:avg(rows,'turnsHigh'),meanTurnsLow:avg(rows,'turnsLow'),
 nextActionsHigh:avg(rows,'nextHigh'),nextActionsLow:avg(rows,'nextLow'),
 regret:{finishHigh:Math.max(h,l)-h,finishLow:Math.max(h,l)-l,
 pipsHigh:ph-Math.min(ph,pl),pipsLow:pl-Math.min(ph,pl),
 minusHigh:Math.max(mh,ml)-mh,minusLow:Math.max(mh,ml)-ml}};
}
function select(startSeed,count,quota){
 const bins={opp3to5:[],opp6plus:[]};let scanned=0,linked=0;
 for(let seed=startSeed;seed<startSeed+count;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(base.kind!=='ready')throw Error('init '+seed);
  for(let rotation=0;rotation<3;rotation++){
   scanned++;const f=first.firstDisagreement(base,seed,rotation);if(!f)continue;
   const c=classify(f);if(!c)continue;linked++;
   bins[c.stage].push({seed,rotation,rank:e.mixSeed32((seed^Math.imul(rotation+1,0x9e3779b9))>>>0)});
  }
 }
 const selected=[],used=new Set();
 for(const stage of ['opp3to5','opp6plus']){
  bins[stage].sort((a,b)=>a.rank-b.rank||a.seed-b.seed||a.rotation-b.rotation);
  let n=0;for(const x of bins[stage])if(n<quota&&!used.has(x.seed)){
   selected.push({...x,stage});used.add(x.seed);n++;
  }
 }
 return {scanned,linked,eligibleByStage:Object.fromEntries(Object.entries(bins).map(([k,v])=>[k,v.length])),selected};
}
function run({startSeed=832000,count=1000,quota=20,worlds=24,withBaseline=true}={}){
 const selected=select(startSeed,count,quota),rows=[],groups={};
 const meta={sourceMutations:0,candidateChanges:0,worldDuplicates:0,unresolved:0,pairedContinuations:0,hiddenWorlds:0,worldsNoIncrease:0};
 for(const item of selected.selected){
  const base=init.initializeThreePlayerRound({seed:item.seed,isFirstRound:false,previousWinnerIndex:item.seed%3});
  const f=first.firstDisagreement(base,item.seed,item.rotation),c=classify(f);
  if(!c||c.stage!==item.stage)throw Error('discovery mismatch');
  const original=JSON.stringify(f.state),visible=spec(f),keys=hw.candidateKeys(f.state);
  if(!keys.includes(regret.actionKey(c.high))||!keys.includes(regret.actionKey(c.low)))throw Error('candidate');
  const observations=Object.fromEntries(policies.map(p=>[p,{all:[],noIncrease:[]}]));
  const seen=new Set();
  for(let i=0;i<worlds;i++){
   const world=hw.sampleWorld(visible,item.seed*997+item.rotation*131+i);
   if(JSON.stringify(hw.candidateKeys(world))!==JSON.stringify(keys)){meta.candidateChanges++;throw Error('candidate drift');}
   const fingerprint=world.hands.map(h=>h.map(e.tileKey).sort().join(',')).join('|')+'|'+world.stock.map(e.tileKey).join(',');
   if(seen.has(fingerprint))meta.worldDuplicates++;seen.add(fingerprint);meta.hiddenWorlds++;
   for(const p of policies){
    const h=rollout(world,c.high,f,p),l=rollout(world,c.low,f,p);meta.pairedContinuations+=2;
    const row={delta:h.win-l.win,winHigh:h.win,winLow:l.win,pipsHigh:h.pips,pipsLow:l.pips,
     minusHigh:h.minus,minusLow:l.minus,blockHigh:h.block,blockLow:l.block,
     turnsHigh:h.turns,turnsLow:l.turns,nextHigh:h.next,nextLow:l.next};
    observations[p].all.push(row);
    if(h.next<=l.next){observations[p].noIncrease.push(row);meta.worldsNoIncrease++;}
   }
  }
  if(JSON.stringify(f.state)!==original)meta.sourceMutations++;
  const entry={seed:item.seed,rotation:item.rotation,stage:item.stage,policy:f.policy,turn:f.turn,
   opp:c.opp,own:f.state.hands[f.state.currentPlayer].length,highTile:e.tileKey(c.high.tile),
   lowTile:e.tileKey(c.low.tile),highLinks:c.highLinks,lowLinks:c.lowLinks,worlds,
   byPolicy:Object.fromEntries(policies.map(p=>[p,{all:summarize(observations[p].all),
    noIncrease:summarize(observations[p].noIncrease)}]))};
  rows.push(entry);
  for(const p of policies)for(const subset of ['all','noIncrease']){
   const key=item.stage+'|'+p+'|'+subset,z=entry.byPolicy[p][subset];
   if(!groups[key])groups[key]=[];
   if(z.n)groups[key].push({delta:z.finishDelta,winHigh:z.finishHigh,winLow:z.finishLow,
    pipsHigh:z.meanPipsHigh,pipsLow:z.meanPipsLow,minusHigh:z.minusHigh,minusLow:z.minusLow,
    blockHigh:z.blocksHigh,blockLow:z.blocksLow,turnsHigh:z.meanTurnsHigh,turnsLow:z.meanTurnsLow,
    nextHigh:z.nextActionsHigh,nextLow:z.nextActionsLow});
  }
 }
 if(meta.sourceMutations||meta.candidateChanges||meta.unresolved)throw Error('invariants');
 const out={schema:'qosa-fixed-visible-link-stage-mc/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
 mode:'3x9',seedRange:startSeed+'..'+(startSeed+count-1),deals:count,rotations:3,
 selection:{quota,scanned:selected.scanned,linked:selected.linked,eligibleByStage:selected.eligibleByStage,
 selected:selected.selected.length,distinctSeeds:new Set(selected.selected.map(x=>x.seed)).size},
 worldsPerPosition:worlds,policies,meta,
 groups:Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,summarize(v)])),positions:rows,
 limitations:'Uniform unseen allocations ignore prior pass/action history; full-info discovery selection; assumed branch rules; block winner unassigned; post-action mobility subgroup is exploratory; position intervals unadjusted for multiple testing.'};
 if(withBaseline){
  const b=canon.run({startSeed,count}).byMode['canonical-multiset'];
  if(b.rounds!==count*3||b.unresolved)throw Error('baseline');
  out.baseline={rounds:b.rounds,finishes:b.finishes,blocks:b.blocks,meanTurns:b.meanTurns,byStrategy:b.byStrategy};
 }
 return out;
}
function test(){
 const a=run({startSeed:859000,count:120,quota:2,worlds:4,withBaseline:false});
 const b=run({startSeed:859000,count:120,quota:2,worlds:4,withBaseline:false});
 if(JSON.stringify(a)!==JSON.stringify(b)||a.selection.selected<2||a.meta.hiddenWorlds!==a.selection.selected*4||
 a.meta.pairedContinuations!==a.meta.hiddenWorlds*4||a.meta.sourceMutations||a.meta.candidateChanges)throw Error('test failed');
 return {passed:true,seedRange:a.seedRange,positions:a.selection.selected,worlds:a.meta.hiddenWorlds,continuations:a.meta.pairedContinuations};
}
if(require.main===module){
 const a=process.argv;console.log(JSON.stringify(a[2]==='test'?test():run({startSeed:Number(a[3]||832000),
 count:Number(a[4]||1000),quota:Number(a[5]||20),worlds:Number(a[6]||24)}),null,2));
}
module.exports={classify,spec,select,run,test};
