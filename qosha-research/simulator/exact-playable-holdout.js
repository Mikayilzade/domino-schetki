'use strict';
// Qoşa exact-playable holdout; node qosha-research/simulator/exact-playable-holdout.js test
// node qosha-research/simulator/exact-playable-holdout.js 500
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),audit=require('./exact-playable-audit');
const hidden=require('./hidden-world'),reg=require('./decision-regret');
const choose=require('./strategy-runner').chooseBy;
const policies=['closed-branch-control','min-hand-pips','fast-doubles'];
function fixture(){
 const seed=3603084;
 let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
 if(s.kind!=='ready')throw Error('fixture init');
 while(s.turns<9&&!s.outcome)s=r.stepRound(s,(opts,t)=>choose('closed-branch-control',opts,{seed,turns:t.turns,player:t.currentPlayer}));
 if(s.outcome||s.turns!==9||s.stock.length)throw Error('fixture state');
 const options=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
 const pool=s.hands.flatMap((h,i)=>i===s.currentPlayer?[]:h).concat(s.stock);
 const rows=options.actions.map(a=>{
  const after=d.applyTurn(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock,a);
  return {a,key:reg.actionKey(a),pips:e.pipSum(a.tiles||[a.tile]),n:after.hand.length,
   doubles:after.hand.filter(t=>t[0]===t[1]).length,playable:audit.playableKeys(after,pool).join(',')};
 });
 const pairs=[];
 for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){
  let a=rows[i],b=rows[j];
  if(a.a.type===b.a.type||a.pips!==b.pips||a.n!==b.n||a.doubles===b.doubles||a.playable!==b.playable)continue;
  if(a.a.type!=='single'){const t=a;a=b;b=t;}
  pairs.push({single:a.key,double:b.key,playable:a.playable});
 }
 if(pairs.length!==2||pairs.some(x=>!x.single.includes('2-4')||!x.double.includes('3-3')))throw Error('pair fixture');
 const used=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
 const knownTiles=e.createDoubleSixDeck().filter(t=>!used.has(e.tileKey(t)));
 const spec={focalPlayer:s.currentPlayer,focalHand:s.hands[s.currentPlayer],knownTiles,
  hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
 return {s,pairs,spec};
}
function stats(xs){
 const n=xs.length,m=xs.reduce((a,b)=>a+b,0)/n;
 const sd=n>1?Math.sqrt(xs.reduce((a,b)=>a+(b-m)**2,0)/(n-1)):0;
 return {n,mean:m,exploratoryCI95:[m-1.96*sd/Math.sqrt(n),m+1.96*sd/Math.sqrt(n)]};
}
function canReply(world,key){
 const after=r.stepRound(world,opts=>opts.actions.find(a=>reg.actionKey(a)===key));
 if(after.outcome)return null;
 const next=(world.currentPlayer+1)%3;
 if(after.currentPlayer!==next)throw Error('next turn mismatch');
 return d.turnOptions(after.branchState,after.openingState,after.hands[next],after.stock).phase==='play';
}
function run(count=500){
 if(!Number.isInteger(count)||count<1||count>5000)throw Error('invalid count');
 const {s,pairs,spec}=fixture(),before=JSON.stringify(s),seen=new Set();
 const values=Object.fromEntries(policies.map(p=>[p,pairs.map(()=>({finish:[],pips:[],minus:[],block:[]}))]));
 const passFlips=pairs.map(()=>0);let continuations=0;
 const expected=JSON.stringify(hidden.candidateKeys(s));
 for(let i=0;i<count;i++){
  const seed=99000000+i,w=hidden.sampleWorld(spec,seed);
  seen.add(JSON.stringify(w.hands.map(h=>h.map(e.tileKey).sort())));
  if(JSON.stringify(hidden.candidateKeys(w))!==expected)throw Error('candidate keys changed');
  for(let j=0;j<pairs.length;j++)if(canReply(w,pairs[j].single)!==canReply(w,pairs[j].double))passFlips[j]++;
  for(const p of policies){
   const ev=reg.evaluateDecisionInWorld(w,{focalPlayer:s.currentPlayer,continuationStrategy:p,seed,maxTurns:200});
   if(ev.kind!=='paired-world')throw Error('not paired');
   continuations+=ev.candidates.length;
   const m=new Map(ev.candidates.map(z=>[z.actionKey,z]));
   for(let j=0;j<pairs.length;j++){
    const a=m.get(pairs[j].single),b=m.get(pairs[j].double);
    if(!a||!b||a.outcome==='unresolved'||b.outcome==='unresolved')throw Error('unresolved');
    const x=values[p][j];
    x.finish.push(+a.focalFinishedFirst- +b.focalFinishedFirst);
    x.pips.push(a.focalRemainder-b.focalRemainder);
    x.minus.push(+(a.focalMinus<0)- +(b.focalMinus<0));
    x.block.push(+(a.outcome==='block')- +(b.outcome==='block'));
   }
  }
 }
 if(JSON.stringify(s)!==before)throw Error('state mutated');
 return {schema:'qosa-exact-playable-holdout/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  seed:3603084,turn:9,focal:s.currentPlayer,hand:s.hands[s.currentPlayer].map(e.tileKey),
  pairs,worldSeedRange:[99000000,99000000+count-1],hiddenWorlds:count,
  uniqueHiddenAllocations:seen.size,candidateContinuations:continuations,
  nextOpponentPlayPassFlips:passFlips,policies,
  comparison:'single 2-4 minus double 3-3; same playable unknown tiles but different branch/open state',
  metrics:Object.fromEntries(policies.map(p=>[p,values[p].map(row=>
   Object.fromEntries(Object.entries(row).map(([k,v])=>[k,stats(v)])))])),
  newFullTournamentRounds:0,verifiedPreviousFullTournamentRounds:180000,
  limitations:'One selected position; hidden worlds sampled uniformly with replacement and without prior-decision conditioning; assumed branch rules; no causal isolation of double retention; no block winner.'};
}
function test(){const a=run(5),b=run(5);if(JSON.stringify(a)!==JSON.stringify(b))throw Error('replay');if(a.nextOpponentPlayPassFlips.some(Boolean))throw Error('pass flip');return {passed:true,worlds:5,pairs:a.pairs.length};}
if(require.main===module){const arg=process.argv[2];console.log(JSON.stringify(arg==='test'?test():run(arg===undefined?500:Number(arg)),null,2));}
module.exports={fixture,run,test};