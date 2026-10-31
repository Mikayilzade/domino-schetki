'use strict';
// Reachable-state property audit for multi-double and mixed-finish transitions.
// This is engine validation, not a strategy/outcome study.
const assert=require('node:assert/strict');
const e=require('./engine'),init=require('./initializer'),d=require('./turn-dispatcher'),rd=require('./round-driver');
const DECK=e.createDoubleSixDeck().map(e.tileKey).sort();
const START=3406220,COUNT=500,LIMIT=200;
function stamp(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date())+' +04';}
function rng(seed){let s=e.mixSeed32(seed);if(!s)s=0x9e3779b9;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/0x100000000;};}
function keys(xs){return xs.map(e.tileKey);}
function multiset(xs){return keys(xs).sort();}
function removeTiles(hand,tiles){let out=hand.map(x=>[...x]);for(const tile of tiles){const key=e.tileKey(tile),i=out.findIndex(x=>e.tileKey(x)===key);assert.notEqual(i,-1,'played tile absent from pre-turn hand: '+key);out=out.filter((_,j)=>j!==i);}return out;}
function conserve(hands,stock,played,label){const all=[...hands.flat(),...stock,...played].map(e.tileKey);assert.equal(all.length,28,label+' total tile count');assert.equal(new Set(all).size,28,label+' duplicate tile');assert.deepStrictEqual(all.sort(),DECK,label+' deck conservation');}
function allocation(deal){return deal.hands.map(h=>keys(h).sort().join(',')).join('|')+'#'+e.tileKey(deal.stock[0]);}
function actionTiles(a){return a.type==='single'?[a.tile]:a.tiles;}
function expectedBranch(before,a){if(a.type==='double-sequence')return e.cloneBranchState(before);return e.applySinglePlacement(before,a);}
function expectedOpened(before,a){const next=e.cloneOpeningState(before);for(const n of (a.numbers||[]))next.openedNumbers.add(n);return next;}
function checkAction(state,opts,action,seed,turn){
  const label='seed '+seed+' turn '+turn+' '+action.type;
  const tiles=actionTiles(action);
  assert(tiles.length>0,label+' nonempty play');
  const tr=d.applyTurn(state.branchState,state.openingState,state.hands[state.currentPlayer],state.stock,action);
  assert.equal(tr.passed,false,label+' not pass');
  assert.deepStrictEqual(multiset(tr.playedTiles),multiset(tiles),label+' played tile set');
  assert.deepStrictEqual(multiset(tr.hand),multiset(removeTiles(opts.hand,tiles)),label+' exact remainder');
  assert.deepStrictEqual(multiset(tr.stock),multiset(opts.stock),label+' stock unchanged after options');
  assert.deepStrictEqual(tr.branchState,expectedBranch(state.branchState,action),label+' branch transition');
  assert.deepStrictEqual([...tr.openingState.openedNumbers].sort((a,b)=>a-b),[...expectedOpened(state.openingState,action).openedNumbers].sort((a,b)=>a-b),label+' opened-number transition');
  const doubleTiles=tiles.filter(x=>x[0]===x[1]);
  if(action.type==='single'){
    assert.equal(doubleTiles.length,0,label+' ordinary action has no double');
    assert.equal(tr.finishDoubles.length,0,label+' ordinary finish carries no minus');
  } else {
    assert(doubleTiles.length>0,label+' double action includes doubles');
    if(action.type==='double-sequence'){
      assert.equal(doubleTiles.length,tiles.length,label+' double sequence contains only doubles');
      assert.equal(action.sequence.length,action.tiles.length,label+' sequence/tile count');
      assert.deepStrictEqual(action.sequence.map(x=>x.number),action.numbers,label+' sequence numbers');
      assert(action.sequence.every(x=>x.tile[0]===x.tile[1]),label+' sequence only doubles');
      assert.deepStrictEqual(multiset(tr.finishDoubles),multiset(action.tiles),label+' double finish markers');
    } else {
      assert.equal(action.type,'mixed-finish');
      assert.equal(doubleTiles.length,action.finishDoubles.length,label+' mixed double count');
      assert.equal(action.tiles.length,action.finishDoubles.length+1,label+' mixed tile accounting');
      assert(action.tiles[0][0]!==action.tiles[0][1],label+' mixed begins with ordinary tile');
      assert(action.finishDoubles.every(x=>x[0]===x[1]),label+' mixed finish remainder all doubles');
      assert.deepStrictEqual(multiset(tr.finishDoubles),multiset(action.finishDoubles),label+' mixed minus markers');
      assert.equal(tr.hand.length,0,label+' mixed-finish empties hand');
    }
  }
  if(tr.hand.length===0){
    const out=d.roundOutcome({hands:state.hands.map((h,i)=>i===state.currentPlayer?tr.hand:h),stock:tr.stock,consecutivePasses:0,lastPlayerIndex:state.currentPlayer,lastTurnResult:tr,players:state.hands.length});
    assert.equal(out.kind,'finish',label+' terminal is finish');
    assert.equal(out.minus,e.finishMinus(tr.finishDoubles),label+' minus classification');
    if(out.minus<0)assert(out.minus===-10||out.minus===-20||out.minus===-30||out.minus===-40,label+' minus in configured range');
  }
  const candidateHands=state.hands.map((h,i)=>i===state.currentPlayer?tr.hand:h);
  conserve(candidateHands,tr.stock,[...state.played,...tr.playedTiles],label+' conservation');
  return tr;
}
function one(seed,stats){
  const deal=e.dealThreeByNine(seed);
  const state0=init.initializeThreePlayerRoundFromDeal({...deal,isFirstRound:false,previousWinnerIndex:seed%3});
  assert.equal(state0.kind,'ready','initializer '+seed);
  const played=[[1,1]];if(state0.openingFollowup)played.push([...state0.openingFollowup.tile]);
  let state={...state0,played};
  const random=rng((seed^0x6d756c74)>>>0);
  while(!state.outcome&&state.turns<LIMIT){
    const p=state.currentPlayer;
    const opts=d.turnOptions(state.branchState,state.openingState,state.hands[p],state.stock);
    conserve(state.hands.map((h,i)=>i===p?opts.hand:h),opts.stock,state.played,'seed '+seed+' turn '+state.turns+' pre');
    if(opts.phase==='pass'){
      const tr=d.applyTurn(state.branchState,state.openingState,state.hands[p],state.stock,null);
      assert.equal(tr.passed,true,'seed '+seed+' pass');
      const next=rd.stepRound(state,()=>null);
      next.played=state.played;
      conserve(next.hands,next.stock,next.played,'seed '+seed+' pass successor');
      state=next;stats.passes++;continue;
    }
    assert(opts.actions.length>0);
    stats.reachablePositions++;
    for(const action of opts.actions){
      stats.candidateActions++;
      if(action.type==='double-sequence'){
        stats.doubleSequenceCandidates++;
        stats.maxDoubleSequenceLength=Math.max(stats.maxDoubleSequenceLength,action.tiles.length);
        if(action.tiles.length>=2)stats.multiDoubleCandidates++;
        const allDoubles=opts.hand.length>0&&opts.hand.every(x=>x[0]===x[1]);
        const fullAvailable=allDoubles&&opts.actions.some(a=>a.type==='double-sequence'&&a.tiles.length===opts.hand.length);
        if(fullAvailable)assert.equal(action.tiles.length,opts.hand.length,'seed '+seed+' turn '+state.turns+' full-double forced sequence');
        if(action.tiles.length===opts.hand.length&&allDoubles){
          stats.fullDoubleFinishCandidates[action.tiles.length]++;
          const tr=checkAction(state,opts,action,seed,state.turns);
          assert.equal(tr.hand.length,0,'seed '+seed+' full double finish empties hand');
          assert.equal(e.finishMinus(tr.finishDoubles),-10*action.tiles.length,'seed '+seed+' full double minus');
        } else checkAction(state,opts,action,seed,state.turns);
      } else if(action.type==='mixed-finish'){
        stats.mixedFinishCandidates++;
        stats.mixedFinishByDoubleCount[action.finishDoubles.length]++;
        assert.equal(action.tiles.length,opts.hand.length,'seed '+seed+' turn '+state.turns+' mixed action covers whole hand');
        const ordinaryCount=opts.hand.filter(x=>x[0]!==x[1]).length;
        assert.equal(ordinaryCount,1,'seed '+seed+' turn '+state.turns+' mixed hand has one ordinary');
        const tr=checkAction(state,opts,action,seed,state.turns);
        assert.equal(tr.hand.length,0,'seed '+seed+' mixed finish empties hand');
        assert.equal(e.finishMinus(tr.finishDoubles),-10*action.finishDoubles.length,'seed '+seed+' mixed minus');
      } else checkAction(state,opts,action,seed,state.turns);
    }
    // Event-directed coverage selection is explicitly for validation only: if a
    // mixed finish exists, take one; otherwise use seeded uniform legal choice.
    const chosen=opts.actions.find(a=>a.type==='mixed-finish')||opts.actions[Math.floor(random()*opts.actions.length)];
    const tr=d.applyTurn(state.branchState,state.openingState,state.hands[p],state.stock,chosen);
    const next=rd.stepRound(state,()=>chosen);next.played=[...state.played,...tr.playedTiles.map(x=>[...x])];
    stats.actualPlays++;
    if(chosen.type==='double-sequence'&&chosen.tiles.length>1)stats.actualMultiDoublePlays++;
    if(chosen.type==='mixed-finish')stats.actualMixedFinishes++;
    if(next.outcome&&next.outcome.kind==='finish')stats.finishMinus[String(next.outcome.minus)]++;
    conserve(next.hands,next.stock,next.played,'seed '+seed+' turn '+state.turns+' actual successor');
    state=next;
  }
  assert(state.outcome,'seed '+seed+' turn limit');
  assert.notEqual(state.outcome.kind,'unresolved','seed '+seed+' unresolved');
  stats.trajectories++;
  return allocation(deal);
}
function run(start=START,count=COUNT){
  assert(Number.isInteger(start)&&start>=0&&Number.isInteger(count)&&count>0&&count<=10000);
  const stats={trajectories:0,reachablePositions:0,candidateActions:0,doubleSequenceCandidates:0,multiDoubleCandidates:0,maxDoubleSequenceLength:0,mixedFinishCandidates:0,mixedFinishByDoubleCount:{1:0,2:0,3:0,4:0},fullDoubleFinishCandidates:{1:0,2:0,3:0,4:0},actualPlays:0,actualMultiDoublePlays:0,actualMixedFinishes:0,passes:0,finishMinus:{'0':0,'-10':0,'-20':0,'-30':0,'-40':0}};
  const allocations=new Set();let duplicateAllocations=0;
  for(let seed=start;seed<start+count;seed++){const a=one(seed,stats);if(allocations.has(a))duplicateAllocations++;allocations.add(a);}
  // Direct minus contract covers all configured magnitudes independently of sample prevalence.
  const minusContract=[];
  for(let n=1;n<=4;n++){const doubles=Array.from({length:n},(_,i)=>[i,i]);const minus=e.finishMinus(doubles);assert.equal(minus,-10*n);minusContract.push({doubleCount:n,minus});}
  assert(stats.multiDoubleCandidates>0,'must exercise reachable multi-double candidate');
  assert(stats.mixedFinishCandidates>0,'must exercise reachable mixed-finish candidate');
  return{schema:'qosha-multi-double-finish-property-audit/v1',timestampAsiaBaku:stamp(),engine:'qosa-research-0.5.3; 3x9 recovered qosa-1.0.0; branch/block rules remain provisional',seedRange:{start,end:start+count-1,draws:count,uniqueAllocations:allocations.size,duplicateAllocations},trajectoryPolicy:'seeded legal-path explorer; event-directed selection of mixed-finish when available; validation only, not strategy data',stats,minusContract,strategyDeals:0,strategyComparisons:0,hiddenWorlds:0,finding:'The reachable dispatcher produced and applied multi-double and mixed-finish candidates without transition/conservation mismatches. This validates implementation consistency only; it does not authenticate the physical branch rule or establish strategy strength.',confidence:'High for internal invariants in the tested seeded reachable-state cohort; no external-rule validation.',nextAction:'Add targeted four-branch locked/open and late-arrival regression properties; keep strategy rankings blocked pending physical branch-reopening and blocked-tie confirmation.',limitations:['Reachability is with respect to the current provisional research kernel, not external physical-rule authentication.','Event-directed path selection intentionally enriches mixed-finish coverage; outcome counts are not population estimates.','No strategy ranking, win-rate claim, or hidden-world sampling was performed.']};
}
if(require.main===module){const a=process.argv.slice(2).map(Number);console.log(JSON.stringify(run(Number.isFinite(a[0])?a[0]:START,Number.isFinite(a[1])?a[1]:COUNT),null,2));}
module.exports={run,one,checkAction};
