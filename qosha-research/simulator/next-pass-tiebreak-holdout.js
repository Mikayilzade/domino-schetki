'use strict';
// Matched 3x9 holdout: can exact uniform-hidden next-pass probability improve
// a same-stone branch-placement tie-break? Only qosha-research files.
// Usage: node qosha-research/simulator/next-pass-tiebreak-holdout.js test
//        node qosha-research/simulator/next-pass-tiebreak-holdout.js 1370940 300
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),{chooseBy}=require('./strategy-runner');
const deck=e.createDoubleSixDeck(),profiles=['min-hand-pips','closed-branch-control'];
const tileKey=e.tileKey;
function passProbability(n,m,k){
  if(k>n-m)return 0;
  let p=1;for(let j=0;j<k;j++)p*=(n-m-j)/(n-j);return p;
}
function actionTiles(a){return a.type==='single'?[a.tile]:(a.tiles||[]);}
function pick(opts,state,known,enhanced,stats){
  const f=state.currentPlayer,baseline=chooseBy('min-hand-pips',opts,{seed:0,turns:state.turns,player:f});
  if(!enhanced||baseline.type!=='single'||state.stock.length)return baseline;
  const alternatives=opts.actions.filter(a=>a.type==='single'&&tileKey(a.tile)===tileKey(baseline.tile)&&a.from!==baseline.from);
  if(!alternatives.length)return baseline;
  const n=(f+1)%3,k=state.hands[n].length;
  const used=new Set([...known,...state.hands[f].map(tileKey)]);
  const unseen=deck.filter(t=>!used.has(tileKey(t)));
  if(unseen.length!==state.hands[n].length+state.hands[(f+2)%3].length)throw Error('hidden pool size mismatch');
  function probability(a){
    const branch=e.applySinglePlacement(state.branchState,a);
    const m=unseen.filter(t=>d.actionsForHand(branch,state.openingState,[t]).length>0).length;
    return passProbability(unseen.length,m,k);
  }
  const original=probability(baseline);
  let best=baseline,bestP=original;
  for(const a of alternatives){const p=probability(a);if(p>bestP+1e-12){best=a;bestP=p;}}
  stats.opportunities++;
  if(best!==baseline){
    stats.changes++;stats.predictedPassGain+=bestP-original;
    const actual=a=>{const branch=e.applySinglePlacement(state.branchState,a);
      return +!d.actionsForHand(branch,state.openingState,state.hands[n]).length;};
    stats.observedPassGain+=actual(best)-actual(baseline);
  }
  return best;
}
function play(base,seat,profile,enhanced){
  let state=r.cloneRoundState(base);
  const known=new Set(['1-1']);
  if(base.openingFollowup)known.add(tileKey(base.openingFollowup.tile));
  const stats={opportunities:0,changes:0,predictedPassGain:0,observedPassGain:0};
  while(!state.outcome&&state.turns<200){
    const f=state.currentPlayer,opts=d.turnOptions(state.branchState,state.openingState,state.hands[f],state.stock);
    let action=null;
    if(opts.phase==='play')action=f===seat?pick(opts,state,known,enhanced,stats):
      chooseBy(profile,opts,{seed:0,turns:state.turns,player:f});
    state=r.stepRound(state,()=>action);
    if(action)for(const tile of actionTiles(action)){
      const key=tileKey(tile);if(known.has(key))throw Error('played tile duplicate');known.add(key);
    }
  }
  if(!state.outcome||state.outcome.kind==='unresolved')throw Error('round unresolved');
  const o=state.outcome;
  return {win:+(o.kind==='finish'&&o.playerIndex===seat),pips:e.pipSum(state.hands[seat]),
    minus:o.kind==='finish'&&o.playerIndex===seat?o.minus:0,
    block:+(o.kind==='block'),turns:state.turns,...stats};
}
function mean(a){return a.length?a.reduce((x,y)=>x+y,0)/a.length:null;}
function halfWidth(a){if(a.length<2)return null;const m=mean(a);
  return 1.96*Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)/a.length);}
function run(start=1370940,count=300){
  if(!Number.isInteger(start)||!Number.isInteger(count)||count<2)throw Error('bad args');
  const summaries={};let rounds=0;
  for(const profile of profiles){
    const rows=[],seedWin=[];
    for(let seed=start;seed<start+count;seed++){
      const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
      if(base.kind!=='ready')throw Error('initializer unresolved');
      let w=0;
      for(let seat=0;seat<3;seat++){
        const plain=play(base,seat,profile,false),smart=play(base,seat,profile,true);
        rounds+=2;w+=smart.win-plain.win;
        rows.push({seed,seat,winDelta:smart.win-plain.win,pipsDelta:smart.pips-plain.pips,
          turnsDelta:smart.turns-plain.turns,blockDelta:smart.block-plain.block,
          minusPlain:plain.minus,minusSmart:smart.minus,changes:smart.changes,
          opportunities:smart.opportunities,predictedPassGain:smart.predictedPassGain,
          observedPassGain:smart.observedPassGain,plainWin:plain.win,smartWin:smart.win,
          plainPips:plain.pips,smartPips:smart.pips});
      }
      seedWin.push(w/3);
    }
    const sum=k=>rows.reduce((a,x)=>a+x[k],0);
    const minusCounts=k=>Object.fromEntries([0,-10,-20,-30,-40].map(v=>[v,rows.filter(x=>x[k]===v).length]));
    summaries[profile]={deals:count,pairedSeats:rows.length,plainFinishFirstRate:mean(rows.map(x=>x.plainWin)),
      smartFinishFirstRate:mean(rows.map(x=>x.smartWin)),smartMinusPlainFinishFirstPP:100*mean(rows.map(x=>x.winDelta)),
      exploratorySeedCluster95HalfWidthPP:100*halfWidth(seedWin),
      smartMinusPlainPips:mean(rows.map(x=>x.pipsDelta)),smartMinusPlainTurns:mean(rows.map(x=>x.turnsDelta)),
      smartMinusPlainBlockPP:100*mean(rows.map(x=>x.blockDelta)),
      meanPlainPips:mean(rows.map(x=>x.plainPips)),meanSmartPips:mean(rows.map(x=>x.smartPips)),
      branchTieOpportunities:sum('opportunities'),changedPlacements:sum('changes'),
      changedTrajectories:rows.filter(x=>x.changes>0).length,
      meanPredictedNextPassGainPPPerChange:sum('changes')?100*sum('predictedPassGain')/sum('changes'):null,
      observedNextPassGainPPPerChange:sum('changes')?100*sum('observedPassGain')/sum('changes'):null,
      minusPlain:minusCounts('minusPlain'),minusSmart:minusCounts('minusSmart')};
  }
  return {schema:'qosa-next-pass-same-tile-tiebreak/v1',engine:'qosa-research-0.5.3',
    rules:'recovered qosa-1.0.0; branch opening provisional',mode:'3x9',
    timestampBaku:'2026-10-23 23:47 (+04)',seedRange:[start,start+count-1],
    deals:count,fullContinuations:rounds,matchedSeats:count*3*profiles.length,
    profiles,strategies:'Focal min-hand-pips versus same-tile alternative with maximum exact hypergeometric P(clockwise next player passes), other players use profile. No knowledge of opponent tile identities used in choice.',
    seedProtocol:'same initializer/deal and focal seat for both policies; clockwise previous winner seed % 3; deterministic choices.',
    assumptions:'Uniform unknown tile allocation without conditioning on prior passes or earlier action likelihood; provisional branch locking; no block winner; finish-first not match victory.',
    findingRule:'Do not promote if seed-cluster uncertainty includes zero or sign changes across profiles.',
    next:'Retest any apparent advantage on disjoint seeds and check locked/open branch rules against a real-game fixture; if inconclusive, test next-pass only as secondary tie-break after own mobility.',
    summaries};
}
function test(){
  if(Math.abs(passProbability(7,2,2)-10/21)>1e-12||passProbability(7,6,2)!==0)throw Error('hypergeom');
  const a=run(1370940,3),b=run(1370940,3);
  if(JSON.stringify(a)!==JSON.stringify(b)||a.fullContinuations!==36)throw Error('deterministic replay');
  return {passed:true,rounds:a.fullContinuations};
}
if(require.main===module){const a=process.argv.slice(2);
  console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1370940),+(a[1]||300)),null,2));}
module.exports={passProbability,pick,play,run,test};
