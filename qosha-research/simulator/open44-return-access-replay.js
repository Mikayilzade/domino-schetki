'use strict';
// Return-access companion to the independently seeded 4-4 retest.
const base=require('./open44-exception-retest'),discover=require('./matched-k-outcome-runner').discover;
const e=require('./engine'),d=require('./turn-dispatcher'),rd=require('./round-driver'),h=require('./hidden-world');
const key=require('./decision-regret').actionKey,choose=require('./strategy-runner').chooseBy;
const seeds=[4401931,4407745,4402067,4405689],policies=base.POLICIES;
function returnActions(w,k,p,seed){
 let s=rd.cloneRoundState(w),first=true,ret=null;
 while(!s.outcome&&s.turns<200){
  const o=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
  if(!first&&s.currentPlayer===w.currentPlayer&&ret===null)ret=o.phase==='play'?o.actions.length:0;
  const a=o.phase==='play'?(first?o.actions.find(x=>key(x)===k):choose(p,o,{seed,turns:s.turns,player:s.currentPlayer})):null;
  if(o.phase==='play'&&!a)throw Error('missing move');
  s=rd.stepRound(s,()=>a);first=false;
 }
 if(!s.outcome||s.outcome.kind==='unresolved')throw Error('unresolved');
 return ret===null?0:ret;
}
function run(worlds=200,start=1200){
 const outcome=base.run({seeds,startWorldIndex:start,worlds}),rows=[];
 for(const seed of seeds){
  const pos=discover(seed,seed+1,1,'closed-branch-control').positions[0],s=pos.state;
  const used=new Set(s.hands.flat().concat(s.stock).map(e.tileKey));
  const spec={focalPlayer:pos.focal,focalHand:s.hands[pos.focal],knownTiles:e.createDoubleSixDeck().filter(t=>!used.has(e.tileKey(t))),hiddenHandSizes:s.hands.map(x=>x.length),stockSize:s.stock.length,visibleState:s};
  const totals=Object.fromEntries(policies.map(p=>[p,0]));
  for(let i=start;i<start+worlds;i++){
   const ws=(1500000000+Math.imul(seed,73)+i)>>>0,w=h.sampleWorld(spec,ws);
   for(const p of policies)totals[p]+=returnActions(w,pos.pair.single,p,ws)-returnActions(w,pos.pair.double,p,ws);
  }
  rows.push({seed,returnActionsSingleMinusDouble:Object.fromEntries(policies.map(p=>[p,totals[p]/worlds]))});
 }
 return {outcome,rows};
}
function test(){const a=run(2),b=run(2);if(JSON.stringify(a)!==JSON.stringify(b))throw Error('not deterministic');return {passed:true};}
module.exports={run,test};
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?test():run(Number(process.argv[2]||200),Number(process.argv[3]||1200)),null,2));
