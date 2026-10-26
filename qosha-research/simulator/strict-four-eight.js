'use strict';
// Controlled EXACT 4-vs-8 candidate comparison plus separate side-choice sensitivity.
// Run: node qosha-research/simulator/strict-four-eight.js test
//      node qosha-research/simulator/strict-four-eight.js 1570340 1000 24 24
// Four-side number locking remains PROVISIONAL. Finish-first != 101-match victory.
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),h=require('./mobility-hybrid-holdout');
const u=require('./hidden-world-mobility'),p=require('./pass-two-sided-ablation');
const w=require('./pass-aware-widechoice');
const MIXES=[['min-hand-pips','min-hand-pips'],['tempo-hybrid','min-hand-pips']];
const POLICIES=['closed-branch-control','min-hand-pips','mobility-hybrid','tempo-hybrid'];
const key=a=>[a.type,a.side||'',a.to??'',(a.numbers||[]).join(','),e.tileKey(a.tile||[0,0])].join(':');
const ok=(x,m)=>{if(!x)throw Error('strict-four-eight: '+m);};
const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const med=a=>{if(!a.length)return null;const b=[...a].sort((x,y)=>x-y),n=b.length;return n%2?b[(n-1)/2]:(b[n/2-1]+b[n/2])/2;};
function ci(rows,field){
 const by=new Map();for(const x of rows){if(!by.has(x.seed))by.set(x.seed,[]);by.get(x.seed).push(x[field]);}
 const vals=[...by.values()].map(avg),mean=avg(vals);
 return{positions:rows.length,dealClusters:vals.length,mean,halfWidth95:vals.length>1?1.96*Math.sqrt(vals.reduce((z,x)=>z+(x-mean)**2,0)/(vals.length-1)/vals.length):null};
}
function sidePair(actions){
 const singles=actions.filter(a=>a.type==='single').sort((a,b)=>key(a).localeCompare(key(b)));
 let same=null;
 for(let i=0;i<singles.length;i++)for(let j=i+1;j<singles.length;j++){
  const a=singles[i],b=singles[j];
  if(e.tileKey(a.tile)!==e.tileKey(b.tile)||a.side===b.side)continue;
  const pair={a,b,kind:a.to===b.to?'same-end':'different-end'};
  if(pair.kind==='different-end')return pair;
  if(!same)same=pair;
 }
 return same;
}
function summary(rows){
 return{positions:rows.length,dealClusters:new Set(rows.map(x=>x.seed)).size,
  exact4Vs8PP:ci(rows,'deltaPP'),pipsChange:ci(rows,'deltaPips'),
  uniform4Vs8PP:ci(rows,'uniformDeltaPP'),pass8VsUniform8PP:ci(rows,'passEffectPP'),
  changeCount:rows.filter(x=>x.key4!==x.key8).length,
  changedTile:rows.filter(x=>x.key4!==x.key8&&x.actionCategory==='different-tile').length,
  changedSide:rows.filter(x=>x.key4!==x.key8&&x.actionCategory==='same-tile-different-side').length,
  regret4PP:ci(rows,'regret4PP'),regret8PP:ci(rows,'regret8PP')};
}
function actionCategory(a,b){
 if(a===b)return 'unchanged';
 const x=String(a).split(':'),y=String(b).split(':');
 if(x[0]!==y[0])return 'single-vs-other';
 if(x[0]==='single')return x[4]!==y[4]?'different-tile':x[1]!==y[1]?'same-tile-different-side':'same-tile-other';
 return 'double-sequence-change';
}
function run(start=1570340,count=1000,train=24,evalCount=24){
 ok([start,count,train,evalCount].every(Number.isInteger)&&count>=2&&count%2===0&&count<=1000&&train>=2&&train<=64&&evalCount>=2&&evalCount<=64,'args');
 const strict=[],sides=[],focal=[],minus={'-10':0,'-20':0,'-30':0,'-40':0};
 let rounds=0,finishes=0,blocks=0,turns=0,forced=0,eligibleStrict=0,eligibleSide=0,passEvents=0;
 for(let seed=start;seed<start+count;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  ok(base.kind==='ready','initialization');
  let sideUsed=false;
  for(let seat=0;seat<3;seat++)for(let mi=0;mi<MIXES.length;mi++){
   const profiles=[];profiles[seat]='closed-branch-control';
   profiles[(seat+1)%3]=MIXES[mi][0];profiles[(seat+2)%3]=MIXES[mi][1];
   const mem=[new Set(),new Set(),new Set()];
   let s=r.cloneRoundState(base),strictUsed=false,openingCount=0;
   if(base.openingPassed){p.rememberPass(mem,s,base.starter);passEvents++;}
   while(!s.outcome&&s.turns<200){
    const opts=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
    if(opts.phase==='pass'&&s.stock.length===0){p.rememberPass(mem,s);passEvents++;}
    if(s.currentPlayer===seat&&opts.phase==='play'&&s.stock.length===0&&(!strictUsed||(!sideUsed&&(seed-start)%5===0))){
     const n=(seat+1)%3,o=(seat+2)%3,vis=u.visibleFromState(s,seat);
     const known=new Set([...vis.focalHand,...vis.played].map(e.tileKey));
     const unseen=e.createDoubleSixDeck().filter(t=>!known.has(e.tileKey(t)));
     const fn=unseen.filter(t=>mem[n].has(e.tileKey(t))).length;
     const fo=unseen.filter(t=>mem[o].has(e.tileKey(t))).length;
     if(fn>0&&fo>0){
      const salt=(seed^Math.imul(seat+1,0x85ebca6b)^Math.imul(mi+1,0xc2b2ae35)^Math.imul(s.turns+1,0x27d4eb2d))>>>0;
      if(!strictUsed&&opts.actions.length>=8){
       eligibleStrict++;const cs=w.candidates(opts,s,seed,seat);
       if(cs.length===8){
        strictUsed=true;const snapshot=JSON.stringify(s),four=cs.slice(0,4);
        ok(new Set(cs.map(c=>c.key)).size===8&&cs.every(c=>opts.actions.some(a=>key(a)===c.key)),'exact eight legal');
        const tc=w.scores(s,seat,mem,profiles,seed,cs,salt^0x42a8bd31,train,'both');
        const tu=w.scores(s,seat,mem,profiles,seed,cs,salt^0x42a8bd31,train,'uniform');
        const ev=w.scores(s,seat,mem,profiles,seed,cs,salt^0x96e57c4d,evalCount,'both');
        ok(JSON.stringify(s)===snapshot,'state unchanged');
        const k4=w.rank(four,tc),k8=w.rank(cs,tc),u4=w.rank(four,tu),u8=w.rank(cs,tu),oracle=w.rank(cs,ev);
        strict.push({seed,seat,mix:mi,turn:s.turns,legalActions:opts.actions.length,
         candidates4:four.map(x=>x.key),candidates8:cs.map(x=>x.key),
         key4:k4,key8:k8,uniform4Key:u4,uniform8Key:u8,actionCategory:actionCategory(k4,k8),
         deltaPP:100*(ev[k8].first-ev[k4].first),deltaPips:ev[k8].pips-ev[k4].pips,
         uniformDeltaPP:100*(ev[u8].first-ev[u4].first),
         passEffectPP:100*(ev[k8].first-ev[u8].first),
         regret4PP:100*(ev[oracle].first-ev[k4].first),regret8PP:100*(ev[oracle].first-ev[k8].first),
         eval4:ev[k4],eval8:ev[k8],forbiddenNext:fn,forbiddenOther:fo});
        forced+=8*(2*train+evalCount);
       }
      }
      if(!sideUsed&&(seed-start)%5===0){
       const pair=sidePair(opts.actions);
       if(pair){
        sideUsed=true;eligibleSide++;
        const cs=[pair.a,pair.b].map(a=>({key:key(a),action:a}));
        ok(cs[0].key!==cs[1].key,'side actions unique');
        const tc=w.scores(s,seat,mem,profiles,seed,cs,salt^0x8f12ab39,train,'both');
        const ev=w.scores(s,seat,mem,profiles,seed,cs,salt^0x529ec7d1,evalCount,'both');
        const chosen=w.rank(cs,tc),oracle=w.rank(cs,ev),baseKey=cs[0].key;
        sides.push({seed,seat,mix:mi,turn:s.turns,kind:pair.kind,
         a:cs[0].key,b:cs[1].key,selected:chosen,changed:chosen!==baseKey,
         selectedMinusBaselinePP:100*(ev[chosen].first-ev[baseKey].first),
         selectedMinusBaselinePips:ev[chosen].pips-ev[baseKey].pips,
         absSideDifferencePP:100*Math.abs(ev[cs[0].key].first-ev[cs[1].key].first),
         oracleRegretPP:100*(ev[oracle].first-ev[chosen].first),
         forbiddenNext:fn,forbiddenOther:fo});
        forced+=2*(train+evalCount);
       }
      }
     }
    }
    s=r.stepRound(s,(op,st)=>{
     const a=h.choose(profiles[st.currentPlayer],op,st,seed,seat);
     if(st.currentPlayer===seat&&(a.type==='double-sequence'||a.type==='mixed-finish'))openingCount+=(a.numbers||[]).length;
     return a;
    });
   }
   ok(s.outcome&&s.outcome.kind!=='unresolved','round unresolved');
   rounds++;turns+=s.turns;
   if(s.outcome.kind==='finish'){finishes++;if(s.outcome.minus<0)minus[String(s.outcome.minus)]++;}
   else blocks++;
   focal.push({seed,seat,mix:mi,first:+(s.outcome.kind==='finish'&&s.outcome.playerIndex===seat),
    pips:e.pipSum(s.hands[seat]),startDoubles:base.hands[seat].filter(t=>t[0]===t[1]).map(t=>t[0]),
    endDoubles:s.hands[seat].filter(t=>t[0]===t[1]).length,openingCount});
  }
 }
 const half=start+count/2;
 const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';
 return{schema:'qosha-strict-four-eight/v1',timestampAsiaBaku:stamp,engine:'qosa-research-0.5.3',
  rules:'recovered qosa-1.0.0 3x9; four-side number-lock PROVISIONAL',
  seedStart:start,seedEnd:start+count-1,deals:count,trainWorlds:train,evalWorlds:evalCount,
  strategies:POLICIES,opponentMixes:MIXES,baselineRounds:rounds,finishes,blocks,unresolved:0,
  blockRate:blocks/rounds,meanRoundTurns:turns/rounds,minusFinishes:minus,passEvents,
  forcedHiddenWorldContinuations:forced,eligibleStrict,eligibleSide,
  baseline:{focalFinishFirst:avg(focal.map(x=>x.first)),meanRemainingPips:avg(focal.map(x=>x.pips)),
   medianRemainingPips:med(focal.map(x=>x.pips)),meanStartingDoubles:avg(focal.map(x=>x.startDoubles.length)),
   meanEndingDoubles:avg(focal.map(x=>x.endDoubles)),meanFocalDoubleOpenings:avg(focal.map(x=>x.openingCount)),
   byStartingDouble:Object.fromEntries(Array.from({length:7},(_,n)=>[String(n),{n:focal.filter(x=>x.startDoubles.includes(n)).length,
    finishFirst:avg(focal.filter(x=>x.startDoubles.includes(n)).map(x=>x.first))}]))},
  strict:{discovery:summary(strict.filter(x=>x.seed<half)),holdout:summary(strict.filter(x=>x.seed>=half)),combined:summary(strict)},
  side:{positions:sides.length,dealClusters:new Set(sides.map(x=>x.seed)).size,
   differentEnd:sides.filter(x=>x.kind==='different-end').length,sameEnd:sides.filter(x=>x.kind==='same-end').length,
   changedChoice:sides.filter(x=>x.changed).length,selectedDeltaPP:ci(sides,'selectedMinusBaselinePP'),
   absSideDifferencePP:ci(sides,'absSideDifferencePP'),regretPP:ci(sides,'oracleRegretPP')},
  strictRows:strict,sideRows:sides,
  design:'Strict arm EXACTLY 4 distinct legal actions vs EXACTLY 8 distinct legal actions (first four of the same ordered eight); identical train and held-out both-pass-compatible worlds. First eligible >=8 legal both-pass state per seat/mix. Separate side-only paired single-tile placements at first both-pass state per every fifth seed, max one per deal, two actions compared on identical worlds. No hidden hand leakage.',
  limitations:'Provisional four-side number-lock; block winner, loneZero, bust and 101-match scoring unvalidated. Selected states and small clusters; 4/8 candidate ordering nonrandom, not exhaustive 8+ legal. Fixed simple continuation bots, uniform conditional posterior ignores opponent choice likelihood; exploratory deal-cluster 95% normal intervals uncorrected. Same-end side differences may reflect tie-break/side-label artifacts. Evaluation oracle regret optimistic; finish-first != match victory.',
  nextAction:'Repeat strict 4-vs-8 with more independent eligible deal clusters, then stratify side alternatives by different-end vs same-end; authenticate branch locking and blocked-round winner.'};
}
function test(){
 const a={type:'single',side:'up',to:3,tile:[1,3]},b={type:'single',side:'left',to:1,tile:[1,3]},
  c={type:'single',side:'right',to:3,tile:[1,3]};
 ok(sidePair([a,b,c]).kind==='different-end','prefer different ends');
 ok(sidePair([a,c]).kind==='same-end','same end');
 ok(sidePair([a,{type:'single',side:'left',to:5,tile:[1,5]}])===null,'same tile required');
 const rows=[{seed:1,deltaPP:10,deltaPips:-1,uniformDeltaPP:0,passEffectPP:0,key4:'a',key8:'b',actionCategory:'different-tile',regret4PP:10,regret8PP:0},
 {seed:2,deltaPP:-10,deltaPips:1,uniformDeltaPP:0,passEffectPP:0,key4:'a',key8:'a',actionCategory:'unchanged',regret4PP:0,regret8PP:0}];
 ok(summary(rows).exact4Vs8PP.mean===0&&summary(rows).changeCount===1,'cluster summary');
 const x=run(1570340,2,2,2),y=run(1570340,2,2,2);
 delete x.timestampAsiaBaku;delete y.timestampAsiaBaku;
 ok(JSON.stringify(x)===JSON.stringify(y)&&x.baselineRounds===12,'replay');
 ok(x.strictRows.every(z=>z.candidates4.length===4&&z.candidates8.length===8),'strict arm');
 return{passed:true,checks:7,replayDeals:2};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1570340),+(a[1]||1000),+(a[2]||24),+(a[3]||24)),null,2));}
module.exports={run,test,sidePair,summary,actionCategory};