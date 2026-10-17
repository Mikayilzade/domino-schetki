'use strict';
// Equivalent-side-only tie-break: preserve the legacy tile/action selection,
// changing only which physical branch receives an otherwise identical single.
const e=require('./engine');
const init=require('./initializer');
const round=require('./round-driver');
const strategies=require('./strategy-runner');
const POLICIES=['closed-branch-control','min-hand-pips','fast-doubles'];
const MODES=['legacy','equivalent-side-only','fully-side-free'];
function sameActionExceptSide(a,b){
 return a.type==='single'&&b.type==='single'&&e.tileKey(a.tile)===e.tileKey(b.tile)&&a.from===b.from&&a.to===b.to;
}
function equivalentSideOnly(legacy,actions){
 if(legacy.type!=='single')return legacy;
 const choices=actions.filter(a=>sameActionExceptSide(legacy,a));
 if(choices.length<2)return legacy;
 return [...choices].sort((a,b)=>e.SIDES.indexOf(a.side)-e.SIDES.indexOf(b.side))[0];
}
function choose(name,opts,ctx,mode){
 const original=strategies.chooseBy(name,opts,{...ctx,sideFree:false});
 if(mode==='legacy')return original;
 if(mode==='fully-side-free')return strategies.chooseBy(name,opts,{...ctx,sideFree:true});
 if(mode==='equivalent-side-only')return equivalentSideOnly(original,opts.actions);
 throw Error('unknown mode '+mode);
}
function test({startSeed=850000,count=100}={}){
 let choices=0,overrides=0,eligible=0;
 for(let seed=startSeed;seed<startSeed+count;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(base.kind!=='ready')throw Error('init '+seed);
  for(let rotation=0;rotation<3;rotation++){
   const result=round.runRound(base,(opts,state)=>{
    const name=POLICIES[(state.currentPlayer+rotation)%3];
    const ctx={seed,rotation,turns:state.turns,player:state.currentPlayer};
    const old=choose(name,opts,ctx,'legacy'),newer=choose(name,opts,ctx,'equivalent-side-only');
    choices++;
    if(old!==newer){
     overrides++;
     if(!sameActionExceptSide(old,newer))throw Error('changed tile/action at seed '+seed);
     const candidates=opts.actions.filter(a=>sameActionExceptSide(old,a));
     if(candidates.length<2)throw Error('changed side without equivalence');
     if(newer!==[...candidates].sort((a,b)=>e.SIDES.indexOf(a.side)-e.SIDES.indexOf(b.side))[0])throw Error('noncanonical side');
    }
    if(old.type==='single'&&opts.actions.filter(a=>sameActionExceptSide(old,a)).length>1)eligible++;
    return newer;
   },{maxTurns:200});
   if(result.outcome.kind==='unresolved')throw Error('unresolved '+seed);
  }
 }
 if(!overrides)throw Error('fixture failed to exercise equivalent-side choice');
 return {passed:true,seedRange:startSeed+'..'+(startSeed+count-1),choices,eligible,overrides};
}
function emptyMode(){
 const byStrategy={};
 for(const name of POLICIES)byStrategy[name]={appearances:0,finishWins:0,pips:[],minusWins:{'0':0,'-10':0,'-20':0,'-30':0,'-40':0}};
 return {rounds:0,finishes:0,blocks:0,unresolved:0,turnTotal:0,sideOverrides:0,eligibleSideChoices:0,byStrategy};
}
function resultKey(s){return s.outcome.kind==='finish'?'finish:'+s.outcome.playerIndex+':'+(s.outcome.minus||0):s.outcome.kind;}
function summarize(s){
 s.meanTurns=s.turnTotal/s.rounds;
 for(const name of POLICIES){
  const m=s.byStrategy[name],p=m.pips.sort((a,b)=>a-b),n=p.length;
  m.finishWinRate=m.finishWins/m.appearances;
  m.meanFinalPips=p.reduce((a,b)=>a+b,0)/n;
  m.medianFinalPips=n%2?p[(n-1)/2]:(p[n/2-1]+p[n/2])/2;
  delete m.pips;
 }
 delete s.turnTotal;
 return s;
}
function compare({startSeed,count}){
 const byMode=Object.fromEntries(MODES.map(m=>[m,emptyMode()]));
 const changed={legacyVsEquivalent:0,legacyVsSideFree:0,equivalentVsSideFree:0,legacyVsEquivalentBlockStatus:0};
 for(let seed=startSeed;seed<startSeed+count;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(base.kind!=='ready')throw Error('init '+seed);
  for(let rotation=0;rotation<3;rotation++){
   const outcomes={};
   for(const mode of MODES){
    const agg=byMode[mode];
    const out=round.runRound(base,(opts,state)=>{
     const name=POLICIES[(state.currentPlayer+rotation)%3],ctx={seed,rotation,turns:state.turns,player:state.currentPlayer};
     const a=choose(name,opts,ctx,mode);
     if(mode==='equivalent-side-only'){
      const old=choose(name,opts,ctx,'legacy');
      if(old!==a){
       if(!sameActionExceptSide(old,a))throw Error('non-side mutation '+seed);
       agg.sideOverrides++;
      }
      if(old.type==='single'&&opts.actions.filter(b=>sameActionExceptSide(old,b)).length>1)agg.eligibleSideChoices++;
     }
     return a;
    },{maxTurns:200});
    if(out.outcome.kind==='unresolved')throw Error('unresolved '+seed);
    agg.rounds++;agg.turnTotal+=out.turns;
    if(out.outcome.kind==='finish'){
     agg.finishes++;
     const name=POLICIES[(out.outcome.playerIndex+rotation)%3],m=agg.byStrategy[name];
     m.finishWins++;m.minusWins[String(out.outcome.minus||0)]++;
    }else if(out.outcome.kind==='block')agg.blocks++;
    for(let seat=0;seat<3;seat++){
     const m=agg.byStrategy[POLICIES[(seat+rotation)%3]];
     m.appearances++;m.pips.push(e.pipSum(out.hands[seat]));
    }
    outcomes[mode]=resultKey(out);
   }
   if(outcomes.legacy!==outcomes['equivalent-side-only'])changed.legacyVsEquivalent++;
   if(outcomes.legacy!==outcomes['fully-side-free'])changed.legacyVsSideFree++;
   if(outcomes['equivalent-side-only']!==outcomes['fully-side-free'])changed.equivalentVsSideFree++;
   if((outcomes.legacy==='block')!==(outcomes['equivalent-side-only']==='block'))changed.legacyVsEquivalentBlockStatus++;
  }
 }
 for(const mode of MODES)summarize(byMode[mode]);
 return {seedRange:startSeed+'..'+(startSeed+count-1),deals:count,roundsPerMode:count*3,byMode,pairedChangedOutcomes:changed};
}
if(require.main===module){
 const arg=process.argv[2]||'test';
 console.log(JSON.stringify(arg==='test'?test():compare({startSeed:Number(process.argv[3]||816000),count:Number(process.argv[4]||1000)}),null,2));
}
module.exports={POLICIES,MODES,sameActionExceptSide,equivalentSideOnly,choose,test,compare};
