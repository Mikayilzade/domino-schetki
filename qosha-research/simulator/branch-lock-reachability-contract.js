'use strict';
// Reachable four-branch lock/open contract under the recovered qosa-1.0.0 research kernel.
// Internal consistency audit only; not physical-rule authentication.
// node qosha-research/simulator/branch-lock-reachability-contract.js test
// node qosha-research/simulator/branch-lock-reachability-contract.js 3406720 500
const assert=require('node:assert/strict'),e=require('./engine'),init=require('./initializer'),d=require('./turn-dispatcher'),rd=require('./round-driver'),chronology=require('./branch-order-history-test');
const DECK=e.createDoubleSixDeck().map(e.tileKey).sort(),START=3406720,COUNT=500;
function sk(s){return [...s].sort((a,b)=>a-b).join(',');}
function sameSet(a,b,m){assert.deepStrictEqual(sk(a),sk(b),m);}
function openingDelta(a,b,ns,m){const x=new Set(a.openedNumbers);ns.forEach(n=>x.add(n));sameSet(x,b.openedNumbers,m);}
function branchDelta(a,b,side,m){for(const s of e.SIDES)if(s!==side)assert.deepStrictEqual(b.branches[s],a.branches[s],m+' unrelated side '+s);}
function checkAction(st,opts,a,played,seed){
 const p=st.currentPlayer,bs=st.branchState,os=st.openingState,tr=d.applyTurn(bs,os,st.hands[p],st.stock,a),tiles=a.type==='single'?[a.tile]:a.tiles;
 assert.equal(tr.playedTiles.length,tiles.length,'played count '+seed);
 assert.deepStrictEqual(tr.playedTiles.map(e.tileKey).sort(),tiles.map(e.tileKey).sort(),'played identity '+seed);
 assert.equal(tr.hand.length,opts.hand.length-tiles.length,'remainder '+seed);
 assert.equal(tr.stock.length,opts.stock.length,'stock '+seed);
 if(a.type==='single'){
  assert.ok(os.openedNumbers.has(a.from),'unopened single '+seed);
  assert.ok(d.openedSinglePlacements(bs,os,a.tile).some(x=>x.side===a.side&&x.to===a.to),'single eligibility '+seed);
  branchDelta(bs,tr.branchState,a.side,'single '+seed);openingDelta(os,tr.openingState,[],'single opens '+seed);
 }else if(a.type==='double-sequence'){
  assert.deepStrictEqual(tr.branchState,bs,'double geometry '+seed);
  const ns=a.sequence.map(x=>x.number);assert.equal(new Set(ns).size,ns.length,'duplicate double '+seed);
  for(const n of ns){assert.ok(!os.openedNumbers.has(n),'reopen '+seed);assert.ok(e.sidesEndingIn(bs,n).length>0,'unexposed double '+seed);}
  openingDelta(os,tr.openingState,ns,'double open '+seed);
 }else if(a.type==='mixed-finish'){
  assert.ok(os.openedNumbers.has(a.from),'mixed prefix locked '+seed);branchDelta(bs,tr.branchState,a.side,'mixed '+seed);
  // The ordinary prefix can extend a branch and expose a double; check after that prefix.
  const afterOrdinary=e.applySinglePlacement(bs,a),ns=a.sequence.map(x=>x.number);assert.equal(new Set(ns).size,ns.length,'duplicate mixed double '+seed);
  for(const n of ns){assert.ok(!os.openedNumbers.has(n),'mixed reopen '+seed);assert.ok(e.sidesEndingIn(afterOrdinary,n).length>0,'mixed double not exposed after prefix '+seed);}
  openingDelta(os,tr.openingState,ns,'mixed opens '+seed);
 }else throw Error('unknown action');
 const all=[...st.hands.filter((_,i)=>i!==p).flat(),...tr.hand,...tr.stock,...played,...tr.playedTiles].map(e.tileKey);
 assert.equal(all.length,28,'candidate count '+seed);assert.equal(new Set(all).size,28,'candidate duplicate '+seed);assert.deepStrictEqual(all.sort(),DECK,'candidate conservation '+seed);
}
function fixtures(){
 const s=e.createBranchState([1,1]),o=e.createOpeningState([1]),m=e.applySinglePlacement(s,{side:'up',tile:[1,2],to:2});
 assert.deepStrictEqual(e.SIDES.filter(x=>m.branches[x].end!==s.branches[x].end),['up']);assert.equal(d.actionsForHand(m,o,[[2,6]]).length,0);
 const a=d.actionsForHand(m,o,[[2,2]]).filter(x=>x.type==='double-sequence');assert.equal(a.length,1);const op=e.applyDoubleOpeningSequence(m,o,a[0].sequence);
 assert.ok(op.openingState.openedNumbers.has(2));assert.ok(d.actionsForHand(op.branchState,op.openingState,[[2,6]]).some(x=>x.side==='up'));
 const inactive=e.createBranchState([1,1],['up','left']);assert.ok(e.legalSinglePlacements(inactive,[1,4]).every(x=>['up','left'].includes(x.side)));
 let b=e.createBranchState([1,1]);for(const [side,to] of [['up',2],['left',3],['right',4],['down',5]])b=e.applySinglePlacement(b,{side,tile:[1,to],to});
 const h=[[2,2],[3,3],[4,4],[5,5]],opts=d.turnOptions(b,o,h,[]),seqs=opts.actions.filter(x=>x.type==='double-sequence'&&x.tiles.length===4);assert.equal(seqs.length,24);
 for(const x of seqs){const tr=d.applyTurn(b,o,h,[],x);assert.deepStrictEqual(tr.branchState,b);sameSet(tr.openingState.openedNumbers,[1,2,3,4,5]);assert.equal(tr.hand.length,0);}
 return{unopenedNumberLocked:true,inactiveSideRejected:true,fourDoubleOrders:24,lateArrival:chronology.test()};
}
function run(start=START,count=COUNT){
 const z={seedStart:start,seedEnd:start+count-1,seedDraws:count,uniqueAllocations:0,positions:0,actionCandidates:0,actionsApplied:0,byType:{single:0,'double-sequence':0,'mixed-finish':0},passes:0,draws:0,multiActionPositions:0,finish:0,block:0,maxTurns:0},seen=new Set();
 for(let seed=start;seed<start+count;seed++){
  const deal=e.dealThreeByNine(seed),fp=deal.hands.map(h=>h.map(e.tileKey).sort().join(',')).join('|')+'#'+deal.stock.map(e.tileKey).join(',');if(!seen.has(fp)){seen.add(fp);z.uniqueAllocations++;}
  const initial=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});assert.equal(initial.kind,'ready');
  let st=rd.cloneRoundState(initial),played=[[1,1]];if(initial.openingFollowup)played.push(initial.openingFollowup.tile);
  const conserved=()=>{const all=[...st.hands.flat(),...st.stock,...played].map(e.tileKey);assert.equal(all.length,28,'state count '+seed);assert.equal(new Set(all).size,28,'state duplicate '+seed);assert.deepStrictEqual(all.sort(),DECK,'state deck '+seed);};conserved();
  let turns=0;
  while(!st.outcome&&turns<200){
   const p=st.currentPlayer,opts=d.turnOptions(st.branchState,st.openingState,st.hands[p],st.stock);z.positions++;
   if(opts.phase==='pass'){z.passes++;const tr=d.applyTurn(st.branchState,st.openingState,st.hands[p],st.stock,null);assert.deepStrictEqual(tr.branchState,st.branchState);assert.deepStrictEqual(tr.openingState,st.openingState);assert.equal(tr.hand.length,opts.hand.length);assert.equal(tr.stock.length,opts.stock.length);}
   else{z.actionCandidates+=opts.actions.length;if(opts.actions.length>1)z.multiActionPositions++;for(const a of opts.actions){z.actionsApplied++;z.byType[a.type]++;checkAction(st,opts,a,played,seed);}}
   const choice=opts.phase==='play'?opts.actions[e.mixSeed32((seed^Math.imul(st.turns+1,0x9e3779b9)^Math.imul(p+1,0x85ebca6b))>>>0)%opts.actions.length]:null;
   const tr=d.applyTurn(st.branchState,st.openingState,st.hands[p],st.stock,choice);if(choice)played.push(...tr.playedTiles.map(x=>x.slice()));if(tr.drawn)z.draws++;
   st=rd.stepRound(st,()=>choice);conserved();turns++;
  }
  assert.ok(st.outcome,'turn cap '+seed);z[st.outcome.kind]=(z[st.outcome.kind]||0)+1;z.maxTurns=Math.max(z.maxTurns,turns);
 }
 z.duplicateAllocations=count-z.uniqueAllocations;z.fixtures=fixtures();return z;
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?run():run(Number(a[0]||START),Number(a[1]||COUNT)),null,2));}
module.exports={run};