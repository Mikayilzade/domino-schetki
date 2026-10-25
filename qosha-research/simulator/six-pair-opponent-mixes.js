'use strict';
// Deterministic policy-swap experiment on matched 3x9 deals and seats.
// Each focal policy faces the SAME two fixed opponent profiles on the same deal.
// Number-lock / four-branch semantics are provisional.
// node qosha-research/simulator/six-pair-opponent-mixes.js test
// node qosha-research/simulator/six-pair-opponent-mixes.js 1556140 800
const e=require('./engine'),r=require('./round-driver'),init=require('./initializer');
const hold=require('./connector-six-late-policy-enrichment');
const mixes=[
 {name:'closed+closed',opponents:['closed-branch-control','closed-branch-control']},
 {name:'min+min',opponents:['min-hand-pips','min-hand-pips']},
 {name:'closed+min',opponents:['closed-branch-control','min-hand-pips']}
];
const arms=['six-pair-hold','closed-branch-control'];
const metrics=['win','pips','minus','block','turns'];
function ci(xs){if(!xs.length)return{n:0,mean:null,halfWidth95:null};
 const mean=xs.reduce((a,b)=>a+b,0)/xs.length;
 const v=xs.length>1?xs.reduce((a,x)=>a+(x-mean)**2,0)/(xs.length-1):0;
 return{n:xs.length,mean,halfWidth95:xs.length>1?1.96*Math.sqrt(v/xs.length):null};}
function seedCluster(rows,field){const by=new Map();
 for(const row of rows){const a=by.get(row.seed)||[];a.push(row[field]);by.set(row.seed,a);}
 return ci([...by.values()].map(a=>a.reduce((x,y)=>x+y,0)/a.length));}
function category(hand){const has=hand.some(t=>t[0]===6&&t[1]===6);
 if(!has)return'no-6-6';const n=hand.filter(t=>t[0]!==t[1]&&t.includes(6)).length;
 return n===0?'6-6/no-connector':n===1?'6-6/one-connector':'6-6/two-plus-connectors';}
function summary(rows){const out={};const categories=['all','no-6-6','6-6/no-connector','6-6/one-connector','6-6/two-plus-connectors'];
 for(const mix of mixes){out[mix.name]={};
  for(const cat of categories){const sub=rows.filter(x=>x.mix===mix.name&&(cat==='all'||x.category===cat));
   out[mix.name][cat]={observations:sub.length,distinctDeals:new Set(sub.map(x=>x.seed)).size,
    holdFinishFirstRate:sub.length?sub.reduce((a,x)=>a+x.hold.win,0)/sub.length:null,
    controlFinishFirstRate:sub.length?sub.reduce((a,x)=>a+x.control.win,0)/sub.length:null,
    holdMeanPips:sub.length?sub.reduce((a,x)=>a+x.hold.pips,0)/sub.length:null,
    controlMeanPips:sub.length?sub.reduce((a,x)=>a+x.control.pips,0)/sub.length:null,
    finishFirstDeltaPP:seedCluster(sub,'winDeltaPP'),finalPipsDelta:seedCluster(sub,'pipsDelta'),
    minusFinishDeltaPP:seedCluster(sub,'minusDeltaPP'),blockDeltaPP:seedCluster(sub,'blockDeltaPP'),
    turnDelta:seedCluster(sub,'turnDelta')};
  }
 }
 return out;
}
function run(start=1556140,count=800){
 if(!Number.isInteger(start)||!Number.isInteger(count)||count<1||count>20000)throw Error('seed/count');
 const rows=[];let rounds=0,finishes=0,blocks=0,unresolved=0,minusFinishes={'-10':0,'-20':0,'-30':0,'-40':0};
 for(let seed=start;seed<start+count;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(base.kind!=='ready')throw Error('initializer '+seed);
  for(let seat=0;seat<3;seat++){
   const cat=category(base.hands[seat]);
   for(const mix of mixes){
    const pair={};
    for(const arm of arms){
     const seatPolicies=[null,null,null];
     seatPolicies[seat]=arm;seatPolicies[(seat+1)%3]=mix.opponents[0];seatPolicies[(seat+2)%3]=mix.opponents[1];
     const out=r.runRound(base,(opts,state)=>hold.chooseDiscovery(seatPolicies[state.currentPlayer],opts,
      {seed,seat,turns:state.turns,player:state.currentPlayer}),{maxTurns:200});
     rounds++;
     if(out.outcome.kind==='finish'){finishes++;if(out.outcome.minus<0)minusFinishes[String(out.outcome.minus)]++;}
     else if(out.outcome.kind==='block')blocks++;
     else {unresolved++;throw Error('unresolved '+seed);}
     pair[arm]={win:+(out.outcome.kind==='finish'&&out.outcome.playerIndex===seat),
      pips:e.pipSum(out.hands[seat]),minus:+(out.outcome.kind==='finish'&&out.outcome.playerIndex===seat&&out.outcome.minus<0),
      block:+(out.outcome.kind==='block'),turns:out.turns};
    }
    const a=pair[arms[0]],b=pair[arms[1]];
    rows.push({seed,seat,mix:mix.name,category:cat,
     hold:a,control:b,winDeltaPP:100*(a.win-b.win),pipsDelta:a.pips-b.pips,
     minusDeltaPP:100*(a.minus-b.minus),blockDeltaPP:100*(a.block-b.block),turnDelta:a.turns-b.turns});
   }
  }
 }
 return{schema:'qosha-six-pair-policy-swap-v1',engine:'qosa-research-0.5.3',
  rules:'recovered qosa-1.0.0 3x9; four-branch number-lock PROVISIONAL',
  seedStart:start,seedEnd:start+count-1,uniqueDeals:count,
  fullRoundContinuations:rounds,finishes,blocks,unresolved,minusFinishes,
  focalArms:arms,opponentMixes:mixes,summary:summary(rows),rows,
  design:'Same seeded initialized 3x9 round, focal seat and two opponent policies; only focal policy swapped between six-pair-hold and closed-branch-control. Three focal seat rotations and three fixed opponent mixes. One row per deal/seat/mix; 18 complete rounds per deal. Deal-cluster exploratory uncorrected 95% normal intervals. Categories defined by focal INITIAL hand after opening initialization; not conditioning on subsequent holding behavior.',
  limitations:'Policy contrast is randomized by assignment, not a pure 6-6 move intervention. Initial-hand subgroup is descriptive and does not isolate late hold benefit. The experimental six-pair-hold avoids 6-containing actions while >3 stones if other legal moves exist. Simple deterministic opponent policies; matched seed/seat outcomes are correlated. Number-lock/four-branch geometry PROVISIONAL; block winner, loneZero, bust, and 101 match scoring not validated. Finish-first is not 101-match victory.',
  nextAction:'Check 6-6 connector subgroups and repeat any apparent advantage on fresh disjoint seeds; independently validate authentic branch-open and block-winner fixtures before tactical recommendations.'};
}
function test(){const a=run(1556140,12),b=run(1556140,12);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.fullRoundContinuations!==216||a.unresolved||a.rows.length!==108)throw Error('deterministic swap replay');
 if(a.rows.some(x=>!['no-6-6','6-6/no-connector','6-6/one-connector','6-6/two-plus-connectors'].includes(x.category)))throw Error('strata');
 return{passed:true,deals:12,rounds:216,rows:108};}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1556140),+(a[1]||800)),null,2));}
module.exports={run,test,summary,category,mixes};
