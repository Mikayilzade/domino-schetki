'use strict';
// Reproduce after placing this file in the repository's qosha-research/simulator/ directory:
// node qosha-research/simulator/public-pass-history-tournament.js test
// node qosha-research/simulator/public-pass-history-tournament.js 2022000 1000
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver'),init=require('./initializer');
const {chooseBy}=require('./strategy-runner'),{pass}=require('./joint-pass-exact');
const {publicPlayed,publicChoices,choosePublic}=require('./public-pass-tournament');
const DECK=e.createDoubleSixDeck();
const ARMS=[['public-history-pass','public-next-pass','closed-branch-control'],['public-history-pass','public-next-pass','min-hand-pips']];
const key=a=>[a.type,a.side||'',a.to??'',(a.numbers||[]).join(','),e.tileKey(a.tile||[0,0])].join(':');
const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
const median=a=>{const b=[...a].sort((x,y)=>x-y),n=b.length;return n%2?b[(n-1)/2]:(b[n/2-1]+b[n/2])/2;};
function recordPass(s,forbidden){
 if(s.stock.length)throw Error('history inference requires exhausted stock');
 const p=s.currentPlayer,f=forbidden[p];
 for(const tile of DECK)if(d.actionsForHand(s.branchState,s.openingState,[tile]).length)f.add(e.tileKey(tile));
}
function posteriorRows(opts,s,played,forbidden){
 if(s.stock.length)throw Error('stock not empty');
 const n=(s.currentPlayer+1)%3,t=(s.currentPlayer+2)%3;
 const own=new Set(opts.hand.map(e.tileKey));
 const pool=DECK.filter(tile=>!played.has(e.tileKey(tile))&&!own.has(e.tileKey(tile)));
 if(pool.length!==s.hands[n].length+s.hands[t].length)throw Error('public unknown pool mismatch');
 const nextForced=[],flexible=[],thirdForced=[];
 for(const tile of pool){
  const k=e.tileKey(tile),noN=forbidden[n].has(k),noT=forbidden[t].has(k);
  if(noN&&noT)throw Error('inconsistent pass evidence for '+k);
  if(noT)nextForced.push(tile);else if(noN)thirdForced.push(tile);else flexible.push(tile);
 }
 const k=s.hands[n].length-nextForced.length;
 if(k<0||k>flexible.length)throw Error('inconsistent forced counts');
 const rows=publicChoices(opts,s,played).map(x=>{
  const tr=d.applyTurn(s.branchState,s.openingState,opts.hand,opts.stock,x.action);
  const playable=tile=>d.actionsForHand(tr.branchState,tr.openingState,[tile]).length>0;
  const m=flexible.filter(playable).length;
  return {...x,uniformPass:x.prob,prob:nextForced.some(playable)?0:pass(flexible.length,m,k)};
 });
 return{rows,evidence:nextForced.length+thirdForced.length,historyEvents:forbidden[n].size+forbidden[t].size};
}
function blank(){return{appearances:0,finishFirst:0,finalPips:[],minus:{'-10':0,'-20':0,'-30':0,'-40':0},
 actions:0,choices:0,changedVsUniform:0,evidenceChoices:0,historyChoices:0,
 byHistory:{none:{decisions:0,changed:0},some:{decisions:0,changed:0}},startingDoubles:0,endingDoubles:0};}
function tournament(start,count,names){
 const stats=Object.fromEntries(names.map(n=>[n,blank()]));
 let rounds=0,finishes=0,blocks=0,unresolved=0,turns=0,passEvents=0;
 for(let seed=start;seed<start+count;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(base.kind!=='ready')throw Error('unready '+seed);
  const raw=e.dealThreeByNine(seed).hands;
  for(let rot=0;rot<3;rot++){
   const seats=[0,1,2].map(i=>names[(i+rot)%3]),forbidden=[new Set(),new Set(),new Set()];
   let s=r.cloneRoundState(base);
   while(!s.outcome&&s.turns<200){
    const p=s.currentPlayer,opts=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
    if(opts.phase==='pass'){recordPass(s,forbidden);passEvents++;}
    const played=publicPlayed(s),name=seats[p],m=stats[name];
    s=r.stepRound(s,(options,st)=>{
     m.actions++;if(options.actions.length>1)m.choices++;
     if(name!=='public-history-pass'&&name!=='public-next-pass')
       return chooseBy(name,options,{seed,rotation:rot,turns:st.turns,player:p});
     const {rows,evidence,historyEvents}=posteriorRows(options,st,played,forbidden);
     const uniform=choosePublic(rows.map(x=>({...x,prob:x.uniformPass})),true);
     const chosen=name==='public-history-pass'?choosePublic(rows,true):uniform;
     if(name==='public-history-pass'&&options.actions.length>1){
      const changed=key(chosen.action)!==key(uniform.action),bucket=evidence?'some':'none';
      m.byHistory[bucket].decisions++;if(changed)m.byHistory[bucket].changed++;
      if(evidence)m.evidenceChoices++;if(historyEvents)m.historyChoices++;
      if(changed)m.changedVsUniform++;
     }
     return chosen.action;
    });
   }
   if(!s.outcome)throw Error('turn limit '+seed);
   rounds++;turns+=s.turns;
   if(s.outcome.kind==='finish'){finishes++;const m=stats[seats[s.outcome.playerIndex]];m.finishFirst++;if(s.outcome.minus<0)m.minus[String(s.outcome.minus)]++;}
   else if(s.outcome.kind==='block')blocks++;else unresolved++;
   for(let p=0;p<3;p++){
    const m=stats[seats[p]];m.appearances++;m.finalPips.push(e.pipSum(s.hands[p]));
    m.startingDoubles+=raw[p].filter(x=>x[0]===x[1]).length;
    m.endingDoubles+=s.hands[p].filter(x=>x[0]===x[1]).length;
   }
  }
 }
 const byStrategy={};for(const name of names){
  const m=stats[name];byStrategy[name]={appearances:m.appearances,finishFirst:m.finishFirst,
   finishFirstRate:m.finishFirst/m.appearances,meanRemainder:mean(m.finalPips),medianRemainder:median(m.finalPips),
   minus:m.minus,actions:m.actions,choices:m.choices,changedVsUniform:m.changedVsUniform,
   evidenceChoices:m.evidenceChoices,historyChoices:m.historyChoices,byHistory:m.byHistory,
   meanStartingDoubles:m.startingDoubles/m.appearances,meanEndingDoubles:m.endingDoubles/m.appearances};
 }
 return{seedRange:[start,start+count-1],deals:count,rounds,finishes,blocks,unresolved,passEvents,meanTurns:turns/rounds,strategies:names,byStrategy};
}
function run(start=2022000,count=1000){
 return{schema:'qosa-public-pass-history-tournament/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9 later-round',
  seedRange:[start,start+count-1],uniqueDeals:count,
  assumption:'All post-opening passes occur with stock empty; every retained tile was present at each previous pass. Pass-only conditioning; no inference from voluntary move choices.',
  hiddenInformation:'Only own hand, publicly played tiles, opponent counts, and observed pass events. No opponent tile identity used for choice.',
  arms:ARMS.map(names=>tournament(start,count,names)),
  limitations:'Provisional branch opening; default opening follow-up; deterministic opponent bots; no block winner; seat rotations dependent; posterior excludes move-policy likelihood; no match-level 101 score.'};
}
function test(){
 const f=[new Set(),new Set(),new Set()];
 const base=init.initializeThreePlayerRound({seed:2022000,isFirstRound:false,previousWinnerIndex:0});
 if(base.kind!=='ready')throw Error('bad init');
 const p=base.currentPlayer,opts=d.turnOptions(base.branchState,base.openingState,base.hands[p],base.stock);
 if(opts.phase==='play'){
  const played=publicPlayed(base),a=posteriorRows(opts,base,played,f);
  if(a.rows.some(x=>Math.abs(x.prob-x.uniformPass)>1e-12))throw Error('no history identity');
  const copy=r.cloneRoundState(base),i=(p+1)%3,j=(p+2)%3;
  const tile=copy.hands[i][0];copy.hands[i][0]=copy.hands[j][0];copy.hands[j][0]=tile;
  const b=posteriorRows(opts,copy,publicPlayed(copy),f);
  if(JSON.stringify(a)!==JSON.stringify(b))throw Error('hidden-hand leakage');
 }
 const a=run(2022000,3),b=run(2022000,3);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.arms.some(x=>x.unresolved||x.rounds!==9))throw Error('determinism');
 return{passed:true,rounds:a.arms.reduce((n,x)=>n+x.rounds,0)};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||2022000),+(a[1]||1000)),null,2));}
module.exports={run,test,recordPass,posteriorRows};