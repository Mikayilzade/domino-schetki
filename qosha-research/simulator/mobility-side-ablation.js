'use strict';
// Reproduce: node qosha-research/simulator/mobility-side-ablation.js test
// Reproduce: node qosha-research/simulator/mobility-side-ablation.js 1357140 1000
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),choose=require('./strategy-runner').chooseBy;
const broad=require('./mobility-broad-full').mobilityChoice;
const bots=['min-hand-pips','closed-branch-control'],variants=['base','same','all','sameNoPair'];
function features(s,a){
 const t=d.applyTurn(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock,a);
 const playable=t.hand.filter(x=>d.actionsForHand(t.branchState,t.openingState,[x]).length).length;
 let pairs=0;for(const [n,m] of t.hand)if(n===m)pairs+=t.hand.filter(x=>x[0]!==x[1]&&x.includes(n)).length;
 return{playable,pairs};
}
function choice(o,s,c,mode){
 if(mode==='all')return broad(o,s,c);
 const base=choose('min-hand-pips',o);if(base.type!=='single')return base;
 const b=features(s,base);let best=null;
 for(const a of o.actions){
  if(a.type!=='single'||a.side!==base.side||e.tileKey(a.tile)===e.tileKey(base.tile))continue;
  const cost=e.pipSum([base.tile])-e.pipSum([a.tile]);if(cost>4)continue;
  const f=features(s,a),gain=f.playable-b.playable,pairGain=f.pairs-b.pairs;
  if(mode==='same'&&(!f.pairs||gain<0||!(gain>0||pairGain>0)))continue;
  if(mode==='sameNoPair'&&gain<=0)continue;
  c.opportunities++;
  const score=mode==='same'?3*gain+1.5*pairGain-.15*Math.max(0,cost):3*gain-.15*Math.max(0,cost);
  if(score>0&&(!best||score>best.score))best={a,score};
 }
 if(best){c.overrides++;c.sameSide++;return best.a;}return base;
}
function simulate(base,seat,bot,mode){
 const c={overrides:0,opportunities:0,sameSide:0,crossSide:0,returnCount:0,returnPasses:0,returnActions:0,returnPlayable:0,postOverrideReturnCount:0,postOverridePasses:0,postOverrideActions:0,postOverridePlayable:0};
 let s=r.cloneRoundState(base),seen=false,pending=false;
 while(!s.outcome&&s.turns<200){
  if(s.currentPlayer===seat){
   const o=d.turnOptions(s.branchState,s.openingState,s.hands[seat],s.stock);
   const legal=o.actions.length,playable=o.hand.filter(x=>d.actionsForHand(s.branchState,s.openingState,[x]).length).length;
   if(seen){c.returnCount++;c.returnPasses+=+(o.phase==='pass');c.returnActions+=legal;c.returnPlayable+=playable;}
   if(pending){c.postOverrideReturnCount++;c.postOverridePasses+=+(o.phase==='pass');c.postOverrideActions+=legal;c.postOverridePlayable+=playable;pending=false;}
   seen=true;
  }
  s=r.stepRound(s,(o,state)=>{
   if(state.currentPlayer!==seat)return choose(bot,o);
   if(mode==='base')return choose('min-hand-pips',o);
   const before=c.overrides,a=choice(o,state,c,mode);
   if(c.overrides>before)pending=true;return a;
  });
 }
 if(!s.outcome||s.outcome.kind==='unresolved')throw Error('unresolved');
 return{win:+(s.outcome.kind==='finish'&&s.outcome.playerIndex===seat),pips:e.pipSum(s.hands[seat]),minus:s.outcome.minus||0,block:+(s.outcome.kind==='block'),turns:s.turns,remainingDoubles:s.hands[seat].filter(t=>t[0]===t[1]).length,censoredOverrides:c.overrides-c.postOverrideReturnCount,...c};
}
function median(a){a=[...a].sort((x,y)=>x-y);return a.length%2?a[(a.length-1)/2]:(a[a.length/2-1]+a[a.length/2])/2;}
function run(start=1357140,count=1000){
 const rows=[];
 for(let seed=start;seed<start+count;seed++){
  const deal=e.dealThreeByNine(seed),keys=[...deal.hands.flat(),...deal.stock].map(e.tileKey);
  if(keys.length!==28||new Set(keys).size!==28)throw Error('deck');
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(base.kind!=='ready')throw Error('init');
  for(const bot of bots)for(let seat=0;seat<3;seat++){
   const row={seed,bot,seat};
   for(const v of variants)row[v]=simulate(base,seat,bot,v);
   rows.push(row);
  }
 }
 const summary={};
 for(const bot of bots){
  const a=rows.filter(x=>x.bot===bot),n=a.length,avg=f=>a.reduce((s,x)=>s+f(x),0)/n,sum=f=>a.reduce((s,x)=>s+f(x),0);
  const policies={};
  for(const v of variants){
   const total=k=>sum(x=>x[v][k]);
   policies[v]={finishFirst:avg(x=>x[v].win),meanRemainder:avg(x=>x[v].pips),medianRemainder:median(a.map(x=>x[v].pips)),blockRate:avg(x=>x[v].block),meanTurns:avg(x=>x[v].turns),meanEndingDoubles:avg(x=>x[v].remainingDoubles),changedSeatRounds:a.filter(x=>x[v].overrides>0).length,overrides:total('overrides'),sameSide:total('sameSide'),crossSide:total('crossSide'),returnCount:total('returnCount'),returnPassRate:total('returnPasses')/Math.max(1,total('returnCount')),meanReturnLegalActions:total('returnActions')/Math.max(1,total('returnCount')),meanReturnPlayableTiles:total('returnPlayable')/Math.max(1,total('returnCount')),postOverrideReturnCount:total('postOverrideReturnCount'),postOverridePassRate:total('postOverridePasses')/Math.max(1,total('postOverrideReturnCount')),meanPostOverrideLegalActions:total('postOverrideActions')/Math.max(1,total('postOverrideReturnCount')),meanPostOverridePlayableTiles:total('postOverridePlayable')/Math.max(1,total('postOverrideReturnCount')),censoredOverrides:total('censoredOverrides'),minusFinish:Object.fromEntries([-10,-20,-30,-40].map(k=>[k,a.filter(x=>x[v].win&&x[v].minus===k).length]))};
  }
  const contrasts={};
  for(const [v,w] of [['same','base'],['all','base'],['all','same'],['sameNoPair','base'],['same','sameNoPair']]){
   const diffs=[];for(let seed=start;seed<start+count;seed++)diffs.push(a.filter(x=>x.seed===seed).reduce((s,x)=>s+x[v].win-x[w].win,0)/3);
   const m=diffs.reduce((s,x)=>s+x,0)/count,se=Math.sqrt(diffs.reduce((s,x)=>s+(x-m)**2,0)/(count*(count-1)));
   contrasts[v+'-minus-'+w]={winDeltaPP:100*m,exploratory3SEPP:[100*(m-3*se),100*(m+3*se)],remainderDelta:avg(x=>x[v].pips-x[w].pips),changedOutcomeSeats:a.filter(x=>x[v].win!==x[w].win).length};
  }
  summary[bot]={seats:n,variants:policies,contrasts};
 }
 return{engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',seedStart:start,seedEnd:start+count-1,deals:count,continuations:rows.length*variants.length,bots,variants,summary};
}
function test(){
 const a=run(1357140,12),b=run(1357140,12);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.continuations!==288)throw Error('replay');
 for(const bot of bots)for(const v of ['same','sameNoPair'])if(a.summary[bot].variants[v].crossSide)throw Error('cross-side leak');
 const old=require('./mobility-broad-full').run(1355140,12),now=run(1355140,12);
 for(const bot of bots)if(Math.abs(old.summary[bot].mobilityWin-now.summary[bot].variants.all.finishFirst)>1e-12||Math.abs(old.summary[bot].baselineWin-now.summary[bot].variants.base.finishFirst)>1e-12)throw Error('prior runner drift');
 return{passed:true};
}
if(require.main===module){const x=process.argv.slice(2);console.log(JSON.stringify(x[0]==='test'?test():run(+(x[0]||1357140),+(x[1]||1000)),null,2));}
module.exports={run,test};
