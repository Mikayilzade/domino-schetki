'use strict';
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),choose=require('./strategy-runner').chooseBy;
const matches=require('./connector-other-matches').matches;
const key=require('./decision-regret').actionKey,runWorlds=require('./hidden-world').runHiddenWorlds;
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
function run(start=20000,end=35000,limit=15,n=20){
 const positions=[];
 for(let seed=start;seed<end&&positions.length<limit;seed++){
  let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(s.kind!=='ready')continue;
  while(!s.outcome&&s.turns<100){
   const found=matches(s);
   if(found.length){
    const pair=found[0].pairs[0],opts=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
    const acts=new Map(opts.actions.map(a=>[key(a),a])),a=acts.get(pair.connector),b=acts.get(pair.other);
    if(e.pipSum([a.tile])!==e.pipSum([b.tile]))throw Error('pip mismatch');
    const hidden=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
    positions.push({seed,turn:s.turns,s:r.cloneRoundState(s),pair,sameSide:a.side===b.side,
      known:e.createDoubleSixDeck().filter(t=>!hidden.has(e.tileKey(t)))});
    break;
   }
   s=r.stepRound(s,(opts,st)=>choose('closed-branch-control',opts,{seed,turns:st.turns,player:st.currentPlayer}));
  }
 }
 const rows={},summary={};let continuations=0,unresolved=0;
 for(const policy of ['closed-branch-control','min-hand-pips','fast-doubles']){
  rows[policy]=positions.map(p=>{
   const s=p.s,f=s.currentPlayer;
   const spec={focalPlayer:f,focalHand:s.hands[f],knownTiles:p.known,hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
   const worlds=runWorlds(spec,{count:n,startSeed:28000000+1000*p.seed,continuationStrategy:policy});
   const diff=worlds.results.map(w=>{
    continuations+=w.candidates.length;
    const by=new Map(w.candidates.map(x=>[x.actionKey,x])),a=by.get(p.pair.connector),b=by.get(p.pair.other);
    if(!a||!b)throw Error('missing candidate');
    if(a.outcome==='unresolved'||b.outcome==='unresolved')unresolved++;
    return{finish:+a.focalFinishedFirst- +b.focalFinishedFirst,pips:a.focalRemainder-b.focalRemainder,minus:+(a.focalMinus<0)- +(b.focalMinus<0)};
   });
   return{seed:p.seed,turn:p.turn,sameSide:p.sameSide,finish:mean(diff.map(x=>x.finish)),pips:mean(diff.map(x=>x.pips)),minus:mean(diff.map(x=>x.minus))};
  });
  summary[policy]=Object.fromEntries(['finish','pips','minus'].map(k=>[k,mean(rows[policy].map(x=>x[k]))]));
 }
 return{engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',seeds:[start,end],selectedSeeds:positions.map(p=>p.seed),
  positions:positions.length,worldsPerPosition:n,uniqueWorlds:positions.length*n,
  candidateContinuations:continuations,unresolved,sameSide:positions.filter(p=>p.sameSide).length,
  worldSeedFormula:'28000000+1000*dealSeed+worldIndex',summary,rows};
}
if(require.main===module)console.log(JSON.stringify(run(...process.argv.slice(2).map(Number)),null,2));
module.exports={run};
