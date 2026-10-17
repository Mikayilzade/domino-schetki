'use strict';
// Equal-primary-score, different-tile first-disagreement counterfactual.
// Replays both alternatives from the same complete-information state,
// then follows the same canonical policy. Not a hidden-world estimate.
const e=require('./engine'),init=require('./initializer'),round=require('./round-driver');
const dispatch=require('./turn-dispatcher'),prior=require('./tiebreak-priority-holdout');
const canonical=require('./canonical-multiset-holdout'),POLICIES=prior.POLICIES;
function tile(a){return a.type==='single'?e.tileKey(a.tile):null;}
function policy(seed,rotation){return (opts,s)=>canonical.choose(POLICIES[(s.currentPlayer+rotation)%3],opts,s,'canonical-multiset',{seed,rotation,turns:s.turns,player:s.currentPlayer});}
function firstDisagreement(base,seed,rotation){
 let s=round.cloneRoundState(base);
 while(!s.outcome&&s.turns<200){
  const opts=dispatch.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
  if(opts.phase==='play'){
   const name=POLICIES[(s.currentPlayer+rotation)%3],ctx={seed,rotation,turns:s.turns,player:s.currentPlayer};
   const a=prior.choose(name,opts,ctx,'legacy'),b=prior.choose(name,opts,ctx,'tile-first');
   if(prior.cmpPrimary(name,a,b)!==0)throw Error('primary mismatch');
   if(a.type==='single'&&b.type==='single'&&tile(a)!==tile(b))return {state:s,legacy:a,tileFirst:b,policy:name,seed,rotation,turn:s.turns};
  }
  s=round.stepRound(s,policy(seed,rotation));
 }
 if(!s.outcome)throw Error('discovery turn limit '+seed);
 return null;
}
function mobility(s){
 if(s.outcome)return null;
 const o=dispatch.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
 return {actions:o.actions.length,pass:o.phase==='pass'};
}
function forced(f,a){
 const next=round.stepRound(f.state,()=>a),immediate=mobility(next);
 const out=next.outcome?next:round.runRound(next,policy(f.seed,f.rotation),{maxTurns:200});
 if(out.outcome.kind==='unresolved')throw Error('unresolved '+f.seed);
 const p=f.state.currentPlayer;
 return {outcome:out.outcome.kind,finishFirst:out.outcome.kind==='finish'&&out.outcome.playerIndex===p,minus:out.outcome.kind==='finish'&&out.outcome.playerIndex===p?out.outcome.minus:0,remainder:e.pipSum(out.hands[p]),turns:out.turns-f.turn,immediate};
}
function run({startSeed=821000,count=1000}={}){
 const summary={schema:'qosa-first-tile-disagreement/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',seedRange:startSeed+'..'+(startSeed+count-1),deals:count,rotations:3,scanned:0,eligible:0,continuations:0,byPolicy:Object.fromEntries(POLICIES.map(x=>[x,0])),legacy:{blocks:0,finishFirst:0,minusFinishes:0,remainder:0,turns:0},tileFirst:{blocks:0,finishFirst:0,minusFinishes:0,remainder:0,turns:0},paired:{legacyOnlyBlock:0,tileFirstOnlyBlock:0,bothBlock:0,neitherBlock:0,legacyOnlyFirst:0,tileFirstOnlyFirst:0,changedTerminal:0,legacyMoreNextActions:0,tileFirstMoreNextActions:0,sameNextActions:0},examples:[]};
 let actionDiff=0,actionN=0;
 for(let seed=startSeed;seed<startSeed+count;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(base.kind!=='ready')throw Error('init '+seed);
  for(let rotation=0;rotation<3;rotation++){
   summary.scanned++;
   const f=firstDisagreement(base,seed,rotation);if(!f)continue;
   summary.eligible++;summary.byPolicy[f.policy]++;
   const a=forced(f,f.legacy),b=forced(f,f.tileFirst);summary.continuations+=2;
   for(const [name,x] of [['legacy',a],['tileFirst',b]]){
    const z=summary[name];z.blocks+=Number(x.outcome==='block');z.finishFirst+=Number(x.finishFirst);z.minusFinishes+=Number(x.minus<0);z.remainder+=x.remainder;z.turns+=x.turns;
   }
   const p=summary.paired;
   if(a.outcome==='block'&&b.outcome==='block')p.bothBlock++;
   else if(a.outcome==='block')p.legacyOnlyBlock++;
   else if(b.outcome==='block')p.tileFirstOnlyBlock++;
   else p.neitherBlock++;
   if(a.finishFirst&&!b.finishFirst)p.legacyOnlyFirst++;
   if(b.finishFirst&&!a.finishFirst)p.tileFirstOnlyFirst++;
   if(a.outcome!==b.outcome)p.changedTerminal++;
   if(a.immediate&&b.immediate){
    const d=b.immediate.actions-a.immediate.actions;actionDiff+=d;actionN++;
    if(d>0)p.tileFirstMoreNextActions++;else if(d<0)p.legacyMoreNextActions++;else p.sameNextActions++;
   }
   if(summary.examples.length<8&&a.outcome!==b.outcome)summary.examples.push({seed,rotation,policy:f.policy,turn:f.turn,legacyTile:tile(f.legacy),tileFirstTile:tile(f.tileFirst),legacy:a,tileFirst:b});
  }
 }
 if(!summary.eligible)throw Error('no eligible positions');
 for(const name of ['legacy','tileFirst']){
  const z=summary[name];z.blockRate=z.blocks/summary.eligible;z.finishFirstRate=z.finishFirst/summary.eligible;z.minusFinishRate=z.minusFinishes/summary.eligible;z.meanRemainder=z.remainder/summary.eligible;z.meanContinuationTurns=z.turns/summary.eligible;delete z.remainder;delete z.turns;
 }
 summary.paired.meanNextActionsDiffTileMinusLegacy=actionN?actionDiff/actionN:null;
 return summary;
}
function test(){
 const a=run({startSeed:859000,count:16}),b=run({startSeed:859000,count:16});
 if(JSON.stringify(a)!==JSON.stringify(b))throw Error('nondeterministic');
 const p=a.paired;
 if(a.continuations!==2*a.eligible||p.legacyOnlyBlock+p.tileFirstOnlyBlock+p.bothBlock+p.neitherBlock!==a.eligible)throw Error('pair accounting');
 return {passed:true,seeds:a.seedRange,eligible:a.eligible,continuations:a.continuations};
}
if(require.main===module){
 const m=process.argv[2]||'test';
 console.log(JSON.stringify(m==='test'?test():run({startSeed:Number(process.argv[3]||821000),count:Number(process.argv[4]||1000)}),null,2));
}
module.exports={firstDisagreement,forced,run,test};
