'use strict';
// Independent 2-vs-3-stone late-game side-choice holdout; opponent-size matched.
// Branch locking/opening provisional.
// node qosha-research/simulator/late-opponent-strata-holdout.js test
// node qosha-research/simulator/late-opponent-strata-holdout.js 1388040 2200 80 256
const base=require('./late-discordant-holdout'),late=require('./late-side-mc');
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const half=a=>a.length>1?1.96*Math.sqrt(a.reduce((s,x)=>s+(x-mean(a))**2,0)/(a.length-1)/a.length):null;
const id=p=>[p.profile,p.seed,p.seat,p.turn].join('/');
function run(start=1388040,count=2200,limit=80,worlds=256){
 const out=base.run(start,count,limit,worlds);
 const map=new Map(late.collect(start,count,320).positions.map(p=>[id(p),p]));
 for(const row of out.rows){
  const p=map.get(id(row));if(!p)throw Error('missing source position');
  row.nextHandSize=p.state.hands[(p.seat+1)%3].length;
  row.otherHandSize=p.state.hands[(p.seat+2)%3].length;
  row.openedNumberCount=p.state.openingState.openedNumbers.size;
  row.activeSideCount=Object.values(p.state.branchState.branches).filter(b=>b.active).length;
 }
 const profiles={},matchedStrata=[];
 for(const profile of out.profiles){
  const rows=out.rows.filter(x=>x.profile===profile),groups={};
  for(const row of rows){
   const k=[row.nextHandSize,row.otherHandSize,row.openedNumberCount].join('/');
   (groups[k]??=[]).push(row);
  }
  let weighted=0,effectivePairs=0,matchedPositions=0,numberStrata=0;
  for(const [k,group] of Object.entries(groups)){
   const a=group.filter(x=>x.handSize===2),b=group.filter(x=>x.handSize===3);
   if(!a.length||!b.length)continue;
   const weight=Math.min(a.length,b.length),delta=mean(a.map(x=>x.winDeltaPP))-mean(b.map(x=>x.winDeltaPP));
   weighted+=weight*delta;effectivePairs+=weight;matchedPositions+=a.length+b.length;numberStrata++;
   matchedStrata.push({profile,key:k,hand2:a.length,hand3:b.length,
    hand2WinDeltaPP:mean(a.map(x=>x.winDeltaPP)),hand3WinDeltaPP:mean(b.map(x=>x.winDeltaPP)),
    interactionPP:delta,weight});
  }
  const a=rows.filter(x=>x.handSize===2),b=rows.filter(x=>x.handSize===3);
  const countBy=field=>rows.reduce((o,x)=>(o[x[field]]=(o[x[field]]||0)+1,o),{});
  profiles[profile]={positions:rows.length,
   byHand:{two:{n:a.length,winDeltaPP:mean(a.map(x=>x.winDeltaPP)),halfWidthPP:half(a.map(x=>x.winDeltaPP))},
    three:{n:b.length,winDeltaPP:mean(b.map(x=>x.winDeltaPP)),halfWidthPP:half(b.map(x=>x.winDeltaPP))}},
   unadjustedInteractionPP:mean(a.map(x=>x.winDeltaPP))-mean(b.map(x=>x.winDeltaPP)),
   exactMatched:{strata:numberStrata,positions:matchedPositions,effectivePairs,
    weightedInteractionPP:effectivePairs?weighted/effectivePairs:null,
    confidence:'descriptive only: sparse cells, no corrected CI'},
   openedNumberCounts:countBy('openedNumberCount'),activeSideCounts:countBy('activeSideCount')};
 }
 out.schema='qosa-late-discordant-opponent-strata/v1';
 out.timestampBaku='2026-10-24 11:50 (+04)';
 out.stratification={
  hypothesis:'2 vs 3 stone own-mobility advantage, adjusting for BOTH opponent hand sizes and openedNumbers count',
  method:'Exact (nextHandSize, otherHandSize, openedNumberCount) strata; within-stratum mean(delta 2)-mean(delta 3), weighted by min(n2,n3); sparse-cell descriptive only',
  profiles,matchedStrata};
 out.next='Validate authentic locked/open four-branch fixture; enlarge sparse exact opponent-size strata on disjoint seeds; validate block winner.';
 return out;
}
function test(){
 const a=run(1388040,40,2,4),b=run(1388040,40,2,4);
 if(JSON.stringify(a)!==JSON.stringify(b))throw Error('non-deterministic');
 if(a.forcedContinuations!==2*a.positions*4)throw Error('count mismatch');
 for(const row of a.rows)if(row.nextHandSize<0||row.otherHandSize<0||row.openedNumberCount<0||row.activeSideCount>4)throw Error('bad geometry');
 return{passed:true,positions:a.positions,forcedContinuations:a.forcedContinuations};
}
if(require.main===module){
 const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1388040),+(a[1]||2200),+(a[2]||80),+(a[3]||256)),null,2));
}
module.exports={run,test};
