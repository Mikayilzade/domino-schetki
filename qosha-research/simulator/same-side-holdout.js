'use strict';
// node qosha-research/simulator/same-side-holdout.js 24000 27000 15 30
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver'),i=require('./initializer'),{chooseBy}=require('./strategy-runner'),{actionKey}=require('./decision-regret'),{runHiddenWorlds}=require('./hidden-world');
const policies=['closed-branch-control','min-hand-pips','fast-doubles'];
const mean=a=>a.reduce((x,y)=>x+y,0)/a.length;
function stats(a){if(!a.length)return null;const m=mean(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0,h=1.96*sd/Math.sqrt(a.length);return{n:a.length,mean:m,ci95:[m-h,m+h]};}
function eligible(s){
 const hand=s.hands[s.currentPlayer],o=d.turnOptions(s.branchState,s.openingState,hand,s.stock);
 if(s.stock.length||hand.length<3||hand.length>8||o.phase!=='play'||o.drawn)return null;
 for(const side of e.SIDES){
  const b=s.branchState.branches[side],x=b.end;
  if(!b.active||!e.isNumberOpened(s.openingState,x))continue;
  const cs=hand.filter(t=>t[0]!==t[1]&&t.includes(x)).map(t=>({tile:t,to:t[0]===x?t[1]:t[0]})).sort((a,b)=>a.to-b.to);
  if(cs.length!==2||cs[0].to===cs[1].to)continue;
  const acts=cs.map(c=>o.actions.filter(a=>a.type==='single'&&a.side===side&&a.from===x&&a.to===c.to&&e.tileKey(a.tile)===e.tileKey(c.tile)));
  if(acts.some(a=>a.length!==1))continue;
  const opened=cs.map(c=>e.isNumberOpened(s.openingState,c.to));
  return{side,x,low:cs[0].to,high:cs[1].to,lowOpen:opened[0],highOpen:opened[1],stratum:opened.every(Boolean)?'bothOpen':opened.some(Boolean)?'oneOpen':'bothClosed',spendLow:actionKey(acts[0][0]),spendHigh:actionKey(acts[1][0])};
 }return null;
}
function collect(start,end,quota){
 const out=[],counts={bothOpen:0,oneOpen:0,bothClosed:0},observed={bothOpen:0,oneOpen:0,bothClosed:0};
 for(let seed=start;seed<end;seed++){
  let s=i.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(s.kind!=='ready')continue;
  while(!s.outcome&&s.turns<100){
   const c=eligible(s);
   if(c){observed[c.stratum]++;if(counts[c.stratum]<quota){
    const hidden=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
    out.push({seed,focal:s.currentPlayer,state:r.cloneRoundState(s),known:e.createDoubleSixDeck().filter(t=>!hidden.has(e.tileKey(t))),choice:c});counts[c.stratum]++;}break;}
   s=r.stepRound(s,(o,st)=>chooseBy('closed-branch-control',o,{seed,turns:st.turns,player:st.currentPlayer}));
  }
 }return{out,counts,observed};
}
function analyze(p,n,policy){
 const s=p.state,c=p.choice,startSeed=4100000+1000*p.seed;
 const spec={focalPlayer:p.focal,focalHand:s.hands[p.focal],knownTiles:p.known,hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
 const data=runHiddenWorlds(spec,{count:n,startSeed,continuationStrategy:policy,maxTurns:200});
 const delta=data.results.map(w=>{
  const m=new Map(w.candidates.map(x=>[x.actionKey,x])),lo=m.get(c.spendLow),hi=m.get(c.spendHigh);
  if(!lo||!hi||lo.outcome==='unresolved'||hi.outcome==='unresolved')throw Error('missing candidate');
  return{finish:(+lo.focalFinishedFirst)-(+hi.focalFinishedFirst),pips:lo.focalRemainder-hi.focalRemainder,minus:(+(lo.focalMinus<0))-(+(hi.focalMinus<0))};
 });
 return{seed:p.seed,stratum:c.stratum,side:c.side,x:c.x,low:c.low,high:c.high,handSize:s.hands[p.focal].length,opponentMinHand:Math.min(...s.hands.filter((h,j)=>j!==p.focal).map(h=>h.length)),turn:s.turns,worldSeedStart:startSeed,continuations:data.results.reduce((n,w)=>n+w.candidates.length,0),keepHighMinusLow:Object.fromEntries(['finish','pips','minus'].map(k=>[k,mean(delta.map(x=>x[k]))]))};
}
function run(start=24000,end=27000,quota=15,worlds=30){
 const {out,counts,observed}=collect(start,end,quota),rows={},summary={};let continuations=0;
 for(const policy of policies){rows[policy]=out.map(p=>analyze(p,worlds,policy));continuations+=rows[policy].reduce((a,b)=>a+b.continuations,0);summary[policy]={};
  for(const group of ['bothOpen','oneOpen','bothClosed']){const a=rows[policy].filter(x=>x.stratum===group);
   summary[policy][group]=Object.fromEntries(['finish','pips','minus'].map(k=>[k,stats(a.map(x=>x.keepHighMinusLow[k]))]));
   if(group==='bothOpen')summary[policy][group].opponentMinHand=Object.fromEntries(['upTo3','fourPlus'].map(label=>[label,stats(a.filter(x=>label==='upTo3'?x.opponentMinHand<=3:x.opponentMinHand>=4).map(x=>x.keepHighMinusLow.finish))]));
  }
 }
 return{schema:'qosa-same-side-holdout/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',start,end,quota,worlds,policies,counts,observed,selectedSeeds:out.map(x=>x.seed),newWorlds:out.length*worlds,continuations,worldSeedFormula:'4100000+1000*dealSeed+worldIndex',comparison:'spend low => keep high, versus spend high => keep low, same side/from X, same hidden worlds',limitations:'assumed locked/open semantics; quota-selected first eligible under branch-control; block winner unassigned; exploratory position-level normal CI',summary,rows};
}
function selfTest(){const a=collect(24000,24100,2).out;if(!a.length)throw Error('no fixtures');for(const p of a){const c=p.choice,o=d.turnOptions(p.state.branchState,p.state.openingState,p.state.hands[p.focal],p.state.stock),x=o.actions.find(a=>actionKey(a)===c.spendLow),y=o.actions.find(a=>actionKey(a)===c.spendHigh);if(!x||!y||x.side!==y.side||x.from!==y.from||x.to!==c.low||y.to!==c.high)throw Error('same-side invariant');}return{passed:true,seeds:a.map(p=>p.seed)};}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?selfTest():run(...a.map(Number)),null,2));}
module.exports={eligible,collect,analyze,run,selfTest};
