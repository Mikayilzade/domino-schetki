'use strict';
// Metamorphic audit for the four-branch research model. Action generation and
// applyTurn must commute with branch-label permutations. Policy tie-break
// sensitivity is diagnostic only; physical branch rules remain provisional.
// node qosha-research/simulator/branch-label-transition-equivariance.js test
// node qosha-research/simulator/branch-label-transition-equivariance.js [start=3404360] [count=40] [maxTurns=45] [sampleEvery=3]
const assert=require('node:assert/strict');
const e=require('./engine'),d=require('./turn-dispatcher'),init=require('./initializer'),r=require('./round-driver'),policy=require('./strategy-runner');
const POLICY_NAMES=['min-hand-pips','fast-doubles','moderate-double-hold','closed-branch-control','random-legal'];
const IDENTITY=[0,1,2,3];
function permutations(a=[0,1,2,3],i=0,out=[]){
  if(i===a.length){out.push(a.slice());return out;}
  for(let j=i;j<a.length;j++){[a[i],a[j]]=[a[j],a[i]];permutations(a,i+1,out);[a[i],a[j]]=[a[j],a[i]];}
  return out;
}
function mapSide(side,p){if(side==null)return null;const i=e.SIDES.indexOf(side);if(i<0)throw Error('unknown side '+side);return e.SIDES[p[i]];}
function relabelBranchState(s,p){const branches={};e.SIDES.forEach((old,i)=>{branches[e.SIDES[p[i]]]={...s.branches[old]};});return{center:s.center.slice(),branches};}
function branchSig(s){return e.SIDES.map(side=>[side,+s.branches[side].active,s.branches[side].end]);}
function actionSig(a,p=null){return JSON.stringify({type:a.type,handIndex:a.handIndex??null,side:p?mapSide(a.side,p):(a.side??null),from:a.from??null,to:a.to??null,tile:a.tile?e.tileKey(a.tile):null,tiles:a.tiles?a.tiles.map(e.tileKey):null,numbers:a.numbers||[],finishDoubles:a.finishDoubles?a.finishDoubles.map(e.tileKey):null});}
function optionsStateSig(o){return{phase:o.phase,drawn:o.drawn,drawnTile:o.drawnTile?e.tileKey(o.drawnTile):null,hand:o.hand.map(e.tileKey).sort(),stock:o.stock.map(e.tileKey)};}
function resultSig(x,p){const bs=relabelBranchState(x.branchState,p);return{branch:branchSig(bs),opened:[...x.openingState.openedNumbers].sort((a,b)=>a-b),hand:x.hand.map(e.tileKey).sort(),stock:x.stock.map(e.tileKey),passed:x.passed,drawn:x.drawn,drawnTile:x.drawnTile?e.tileKey(x.drawnTile):null,played:x.playedTiles.map(e.tileKey),finish:x.finishDoubles.map(e.tileKey)};}
function dealKey(deal,previousWinner){return deal.hands.map(h=>h.map(e.tileKey).sort().join(',')).join('|')+'|stock='+e.tileKey(deal.stock[0])+'|previousWinner='+previousWinner;}
function run(startSeed=3404360,count=40,maxTurns=45,sampleEvery=3){
  assert.ok(Number.isSafeInteger(startSeed)&&startSeed>=0,'invalid start seed');
  assert.ok(Number.isInteger(count)&&count>0&&count<=500,'invalid count');
  assert.ok(Number.isInteger(maxTurns)&&maxTurns>0&&maxTurns<=200,'invalid maxTurns');
  assert.ok(Number.isInteger(sampleEvery)&&sampleEvery>0,'invalid sampleEvery');
  const perms=permutations();assert.equal(perms.length,24);
  const seen=new Map(),duplicates=[],stats=Object.fromEntries(POLICY_NAMES.map(n=>[n,{checks:0,mismatches:0}]));
  let positions=0,permutationChecks=0,actionChecks=0,passChecks=0,resolved=0,finishes=0,blocks=0,unresolved=0,turnTotal=0;
  for(let seed=startSeed;seed<startSeed+count;seed++){
    const deal=e.dealThreeByNine(seed),previousWinner=seed%3,key=dealKey(deal,previousWinner);
    if(seen.has(key)){duplicates.push({seed,duplicateOfSeed:seen.get(key)});continue;}seen.set(key,seed);
    const initial=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:previousWinner});
    assert.equal(initial.kind,'ready','initializer did not resolve deal');
    let state=r.cloneRoundState(initial);
    while(!state.outcome&&state.turns<maxTurns){
      if(state.turns%sampleEvery===0)for(let seat=0;seat<3;seat++){
        const opts=d.turnOptions(state.branchState,state.openingState,state.hands[seat],state.stock);positions++;
        for(const p of perms){
          const rb=relabelBranchState(state.branchState,p),ro=d.turnOptions(rb,state.openingState,state.hands[seat],state.stock);
          assert.deepEqual(optionsStateSig(opts),optionsStateSig(ro),'draw/pass state changed under relabeling');
          assert.deepEqual(opts.actions.map(a=>actionSig(a,p)).sort(),ro.actions.map(a=>actionSig(a)).sort(),'legal action set not equivariant');
          permutationChecks++;
          if(opts.phase==='pass'){
            const x=d.applyTurn(state.branchState,state.openingState,state.hands[seat],state.stock,null);
            const y=d.applyTurn(rb,state.openingState,state.hands[seat],state.stock,null);
            assert.deepEqual(resultSig(x,p),resultSig(y,IDENTITY),'pass transition not equivariant');passChecks++;
          }else{
            const byKey=new Map(ro.actions.map(a=>[actionSig(a),a]));assert.equal(byKey.size,ro.actions.length,'duplicate action signature');
            for(const a of opts.actions){
              const hit=byKey.get(actionSig(a,p));assert.ok(hit,'mapped action absent');
              const x=d.applyTurn(state.branchState,state.openingState,state.hands[seat],state.stock,a);
              const y=d.applyTurn(rb,state.openingState,state.hands[seat],state.stock,hit);
              assert.deepEqual(resultSig(x,p),resultSig(y,IDENTITY),'action transition not equivariant');actionChecks++;
            }
            for(const name of POLICY_NAMES){
              const x=policy.chooseBy(name,opts,{seed,rotation:0,turns:state.turns,player:seat});
              const y=policy.chooseBy(name,ro,{seed,rotation:0,turns:state.turns,player:seat});
              stats[name].checks++;if(actionSig(x,p)!==actionSig(y))stats[name].mismatches++;
            }
          }
        }
      }
      state=r.stepRound(state,(opts,current)=>{
        const h=e.mixSeed32((seed^Math.imul(current.turns+1,0x9e3779b9)^Math.imul(current.currentPlayer+1,0x85ebca6b))>>>0);
        return opts.actions[h%opts.actions.length];
      });
    }
    if(state.outcome&&state.outcome.kind!=='unresolved'){
      resolved++;turnTotal+=state.turns;
      if(state.outcome.kind==='finish')finishes++;else if(state.outcome.kind==='block')blocks++;else throw Error('unexpected outcome');
    }else unresolved++;
  }
  const policyChoiceMismatches={};
  for(const name of POLICY_NAMES){const z=stats[name];policyChoiceMismatches[name]={checks:z.checks,mismatches:z.mismatches,mismatchRate:z.checks?z.mismatches/z.checks:null};}
  assert.equal(permutationChecks,positions*perms.length,'permutation accounting');
  assert.equal(seen.size+duplicates.length,count,'seed accounting');
  return{
    schema:'qosha-branch-label-transition-equivariance/v1',
    engine:'qosa-research-0.5.3 + branch-label-transition-equivariance/v1',
    rules:'recovered qosa-1.0.0 3×9; four branch labels treated as interchangeable for metamorphic testing; physical branch reopening PROVISIONAL',
    seedStart:startSeed,seedEnd:startSeed+count-1,seedDraws:count,uniqueDealAllocations:seen.size,duplicateDealPairs:duplicates,
    trajectoryPolicy:'deterministic seeded action-index chooser, used only to generate reachable validation positions',
    maxTurns,sampleEveryTurns:sampleEvery,resolvedRounds:resolved,finishRounds:finishes,blockRounds:blocks,unresolvedRounds:unresolved,meanResolvedTurns:resolved?turnTotal/resolved:null,
    sampledPositions:positions,branchLabelPermutations:perms.length,permutationChecks,legalActionTransitionChecks:actionChecks,passTransitionChecks:passChecks,policyChoiceMismatches,
    newOpeningDealsForStrategyStudy:0,newHiddenWorldAllocations:0,newStrategyComparisonRounds:0,
    finding:'Legal action generation and every mapped legal action transition commute with all four-branch label permutations in the tested reachable positions. Existing deterministic strategy tie-breaks choose a different mapped action in a measurable minority of permutation comparisons.',
    limitations:'Metamorphic/model audit only. Four labels are assumed interchangeable; this does not authenticate physical branch-lock/reopening rules or blocked-tie scoring. Validation trajectories are not a strategy tournament. Policy-choice mismatch is a tie-break diagnostic, not a win-rate or tactic metric.',
    nextAction:'Add a symmetric tie-break ablation to matched-seed full-round policy comparisons; keep branch-sensitive results provisional until physical branch and block rules are authenticated.',
    nextSeed:startSeed+count
  };
}
function test(){
  const a=run(3404360,4,15,3),b=run(3404360,4,15,3);
  assert.deepEqual(a,b,'seeded replay differs');assert.equal(a.branchLabelPermutations,24);
  assert.equal(a.permutationChecks,a.sampledPositions*24);assert.ok(a.legalActionTransitionChecks>0,'no action transitions');
  assert.ok(a.passTransitionChecks>0,'no pass transitions');assert.equal(a.uniqueDealAllocations+a.duplicateDealPairs.length,4);
  return{passed:true,replayDeals:4,sampledPositions:a.sampledPositions,permutationChecks:a.permutationChecks,legalActionTransitionChecks:a.legalActionTransitionChecks,passTransitionChecks:a.passTransitionChecks};
}
if(require.main===module){const a=process.argv.slice(2),out=a[0]==='test'?test():run(Number(a[0]||3404360),Number(a[1]||40),Number(a[2]||45),Number(a[3]||3));console.log(JSON.stringify(out,null,2));}
module.exports={run,test,permutations,relabelBranchState,actionSig};
