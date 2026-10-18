'use strict';
// Matched focal-seat mirror: one public pass-aware bot versus two identical opponents.
// Same deal, focal seat and opponent policy in both counterfactual games.
// Reproduce: node qosha-research/simulator/public-pass-strong-mirror.js test
// node qosha-research/simulator/public-pass-strong-mirror.js 1063000 250 closed-branch-control
const e=require('./engine');
const r=require('./round-driver');
const init=require('./initializer');
const pub=require('./public-pass-tournament');
const {chooseBy}=require('./strategy-runner');
const mean=xs=>xs.reduce((a,b)=>a+b,0)/xs.length;
const median=xs=>{const a=[...xs].sort((a,b)=>a-b);return a.length%2?a[(a.length-1)/2]:(a[a.length/2-1]+a[a.length/2])/2;};

function play(base,seat,kind,opponent,seed){
  let s=r.cloneRoundState(base),choices=0,divergences=0;
  while(!s.outcome&&s.turns<200){
    const p=s.currentPlayer,played=pub.publicPlayed(s);
    s=r.stepRound(s,(opts,st)=>{
      if(p!==seat)return chooseBy(opponent,opts,{seed,turns:st.turns,player:p});
      const rows=pub.publicChoices(opts,st,played);
      const chosen=pub.choosePublic(rows,kind==='pass');
      if(rows.length>1){
        choices++;
        if(pub.choosePublic(rows,true).action!==pub.choosePublic(rows,false).action)divergences++;
      }
      return chosen.action;
    });
  }
  return {
    finish:+(s.outcome?.kind==='finish'&&s.outcome.playerIndex===seat),
    pips:e.pipSum(s.hands[seat]),
    minus:s.outcome?.kind==='finish'&&s.outcome.playerIndex===seat?s.outcome.minus:0,
    block:+(s.outcome?.kind==='block'),unresolved:+(!s.outcome),turns:s.turns,
    choices,divergences,endingDoubles:s.hands[seat].filter(t=>t[0]===t[1]).length
  };
}
function run(start=1063000,count=250,opponent='closed-branch-control'){
  if(!Number.isInteger(start)||!Number.isInteger(count)||count<2)throw Error('invalid seed range');
  if(!['closed-branch-control','moderate-double-hold'].includes(opponent))throw Error('unsupported opponent');
  const paired=[],raw={pass:[],control:[]};
  for(let seed=start;seed<start+count;seed++){
    const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
    if(base.kind!=='ready')throw Error('initializer '+seed);
    const bySeat=[];
    for(let seat=0;seat<3;seat++){
      const a=play(base,seat,'pass',opponent,seed);
      const b=play(base,seat,'control',opponent,seed);
      if(a.unresolved||b.unresolved)throw Error('unresolved '+seed);
      raw.pass.push(a);raw.control.push(b);bySeat.push(a.finish-b.finish);
    }
    paired.push(mean(bySeat));
  }
  const summary={};
  for(const k of ['pass','control']){
    const a=raw[k];
    summary[k]={
      finishFirst:mean(a.map(x=>x.finish)),
      meanPips:mean(a.map(x=>x.pips)),medianPips:median(a.map(x=>x.pips)),
      blocks:mean(a.map(x=>x.block)),meanTurns:mean(a.map(x=>x.turns)),
      meanEndingDoubles:mean(a.map(x=>x.endingDoubles)),
      minus:Object.fromEntries([-10,-20,-30,-40].map(n=>[n,a.filter(x=>x.minus===n).length])),
      choices:a.reduce((s,x)=>s+x.choices,0),
      divergences:a.reduce((s,x)=>s+x.divergences,0)
    };
  }
  const diff=mean(paired);
  const se=Math.sqrt(paired.reduce((s,x)=>s+(x-diff)**2,0)/(count-1)/count);
  return {
    schema:'qosa-public-pass-strong-mirror/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
    seedRange:[start,start+count-1],deals:count,rounds:count*6,
    opponent,policies:['public-next-pass','public-no-pass'],
    pairedUnit:'seed, averaging 3 focal seats',finishDelta:diff,
    ci95:[diff-1.96*se,diff+1.96*se],summary,
    assumptions:'3x9 later round; fixed initializer followup; uniform hidden pool; opponent histories ignored; branch rules provisional; block winner unassigned',
    limitation:'CI exploratory, independent seed units not independent games; finish-first not match win; bot opponents; no Node test unless executed separately'
  };
}
function test(){
  const a=run(1063000,4),b=run(1063000,4);
  if(JSON.stringify(a)!==JSON.stringify(b)||a.rounds!==24)throw Error('replay');
  return {passed:true,rounds:a.rounds};
}
if(require.main===module){
  const args=process.argv.slice(2);
  console.log(JSON.stringify(args[0]==='test'?test():run(+(args[0]||1063000),+(args[1]||250),args[2]||'closed-branch-control'),null,2));
}
module.exports={run,test,play};
