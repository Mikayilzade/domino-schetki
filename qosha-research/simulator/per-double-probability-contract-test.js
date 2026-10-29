'use strict';
// Independent probability oracle for the provisional multi-double response kernel.
// Run: node qosha-research/simulator/per-double-probability-contract-test.js
// Kernel-only validation: does NOT authenticate real-table branch unlocking or blocked ties.
const {DECK, shuffled, key, actions, choose, apply} = require('./opening-double-followup-new-hands');
const {response, evaluate} = require('./multi-double-per-double-stop');
function check(x, m) { if (!x) throw Error(m); }
function turnWorlds(board, hand, policy, model, p) {
  const first = choose(actions(board, hand), policy);
  if (!first) return [{board, hand, count:0, weight:1}];
  function walk(b, h, move, count, weight, chain) {
    const nextBoard = apply(b, move, model);
    const nextHand = h.filter((_,i) => i !== move.i);
    const nextCount = count + 1;
    const nextDouble = chain && nextCount < 4
      ? choose(actions(nextBoard, nextHand).filter(a => a.dbl), policy) : null;
    if (!nextDouble) return [{board:nextBoard, hand:nextHand, count:nextCount, weight}];
    return [
      {board:nextBoard, hand:nextHand, count:nextCount, weight:weight*(1-p)},
      ...walk(nextBoard, nextHand, nextDouble, nextCount, weight*p, true)
    ];
  }
  return walk(board, hand, first, 0, 1, first.dbl);
}
function independentExpected(board, h1, h2, move, policy, model, p) {
  let expected=0, probability=0;
  for (const first of turnWorlds(apply(board,move,model),h1,policy,model,p)) {
    for (const second of turnWorlds(first.board,h2,policy,model,p)) {
      const w=first.weight*second.weight;
      expected += w*(first.count+second.count);
      probability += w;
      check(first.count===h1.length-first.hand.length,'first-hand tile count');
      check(second.count===h2.length-second.hand.length,'second-hand tile count');
    }
  }
  check(Math.abs(probability-1)<1e-10,'probability mass '+probability);
  return expected;
}
function test() {
  const fixtures=[
    {board:{ends:[2,3,4,5],locks:[true,true,true,true],opened:[1]},
     move:{i:0,side:0,t:[2,2],dbl:true,to:2},used:['1-1','1-2','1-3','1-4','1-5','2-2']},
    {board:{ends:[2,3,4,5],locks:[false,false,false,false],opened:[1,2,3,4,5]},
     move:{i:0,side:0,t:[2,3],dbl:false,to:3},used:['1-1','1-2','1-3','1-4','1-5','2-3']},
    {board:{ends:[2,3,4,5],locks:[false,false,false,false],opened:[1,2,3,4,5]},
     move:{i:0,side:0,t:[2,6],dbl:false,to:6},used:['1-1','1-2','1-3','1-4','1-5','2-6']}
  ];
  let comparisons=0, nonlinearCases=0, chainCases=0;
  for(let fi=0;fi<fixtures.length;fi++) {
    const f=fixtures[fi], pool=DECK.filter(t=>!f.used.includes(key(t)));
    check(pool.length===22,'fixture pool size');
    for(let seed=0;seed<64;seed++) {
      const dealt=shuffled(seed+fi*64,pool),h1=dealt.slice(0,9),h2=dealt.slice(9,18);
      check(new Set([...f.used,...h1.map(key),...h2.map(key)]).size===24,'fixture tile conservation');
      for(const policy of ['high','low']) for(const model of ['global','current']) {
        const poly=response(f.board,h1,h2,f.move,policy,model);
        if(poly.some((v,i)=>i>=2&&v))nonlinearCases++;
        if(turnWorlds(apply(f.board,f.move,model),h1,policy,model,0.5).some(x=>x.count>1))chainCases++;
        for(const p of [0,0.25,0.5,0.75,1]) {
          const exact=independentExpected(f.board,h1,h2,f.move,policy,model,p);
          const symbolic=evaluate(poly,p);
          check(Math.abs(exact-symbolic)<1e-9,'oracle mismatch '+[fi,seed,policy,model,p]);
          comparisons++;
        }
      }
    }
  }
  // This synthetic late-arrival case proves the two provisional branch models
  // are NOT globally interchangeable, even if some selected cohorts agree.
  const b={ends:[2,4,5,6],locks:[false,true,true,true],opened:[1,2,3,4,5,6]};
  const move={i:0,side:0,t:[2,3],dbl:false,to:3};
  const h1=[[0,3],[1,3]],h2=[[0,0],[3,3]];
  const global=evaluate(response(b,h1,h2,move,'high','global'),0.5);
  const current=evaluate(response(b,h1,h2,move,'high','current'),0.5);
  check(global===1&&current===0,'late-arrival model divergence');
  // Four-double optional stopping: E[count] at p=0.5 is 1+0.5+0.25+0.125.
  const four={ends:[2,3,4,5],locks:[true,true,true,true],opened:[1]};
  const hand=[[2,2],[3,3],[4,4],[5,5]];
  const dist=turnWorlds(four,hand,'high','global',0.5);
  const mass=dist.reduce((s,x)=>s+x.weight,0);
  const expected=dist.reduce((s,x)=>s+x.weight*x.count,0);
  check(Math.abs(mass-1)<1e-12&&Math.abs(expected-1.875)<1e-12,'four-double stop distribution');
  return {passed:true,comparisons,syntheticFixtures:3,fixtureSeedsPerCase:64,
    nonlinearCases,chainCases,branchCounterexample:{global,current},
    fourDoubleHalfContinueExpected:expected,
    scope:'independent short-window probability oracle; physical branch and block rules provisional'};
}
if(require.main===module) console.log(JSON.stringify(test(),null,2));
module.exports={test,turnWorlds,independentExpected};
