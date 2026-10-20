'use strict';
// Reproduce: node qosha-research/runs/2026-10-20-2254-geometry-symmetry-audit.js 1307600 240
// Audit only: side-label symmetry in the 3x9 provisional four-branch engine.
// A "duplicate" means identical remaining hand, multiset of active branch ends,
// and opened numbers after the action. This is model equivalence, not an
// assertion that physical table direction never matters to human players.
const e=require('../simulator/engine');
const d=require('../simulator/turn-dispatcher');
const r=require('../simulator/round-driver');
const init=require('../simulator/initializer');
const {chooseBy}=require('../simulator/strategy-runner');
const policies=['min-hand-pips','closed-branch-control'];
function actionKey(a){return[a.type,a.side||'',(a.numbers||[]).join(','),e.tileKey(a.tile||[0,0])].join('|');}
function signature(s,a){
 const t=d.applyTurn(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock,a);
 return JSON.stringify([
  t.hand.map(e.tileKey).sort(),
  e.SIDES.map(x=>[+t.branchState.branches[x].active,t.branchState.branches[x].end])
    .sort((a,b)=>a[0]-b[0]||a[1]-b[1]),
  [...t.openingState.openedNumbers].sort((a,b)=>a-b)
 ]);
}
function continuation(s,a,policy){
 let first=true;
 return r.runRound(s,(opts,state)=>{
  if(first){
   first=false;
   const hit=opts.actions.find(x=>actionKey(x)===actionKey(a));
   if(!hit)throw Error('forced action disappeared');
   return hit;
  }
  return chooseBy(policy,opts,{seed:0,turns:state.turns,player:state.currentPlayer});
 },{maxTurns:200});
}
function run(start=1307600,count=240){
 if(!Number.isInteger(start)||!Number.isInteger(count)||count<1)throw Error('invalid seeds');
 const out={schema:'qosa-geometry-symmetry-audit/v1',engine:'qosa-research-0.5.3',
  rules:'qosa-1.0.0',mode:'3x9',seedStart:start,seedEndExclusive:start+count,
  scanned:0,positions:0,positionsWithEquivalence:0,rawActions:0,
  uniqueCanonicalActions:0,pairedPositions:0,continuations:0,unresolved:0,
  policies:{},examples:[]};
 for(const p of policies)out.policies[p]={comparisons:0,finishFirstMismatch:0,
  remainderMismatch:0,outcomeMismatch:0,minusMismatch:0,meanAbsPipDifference:0};
 for(let seed=start;seed<start+count;seed++){
  out.scanned++;
  let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(s.kind!=='ready')throw Error('initializer unresolved');
  let selected=null;
  while(!s.outcome&&s.turns<120){
   const opts=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
   if(opts.phase==='play'&&opts.actions.length>=2){
    const groups=new Map();
    for(const a of opts.actions){
     const sig=signature(s,a),arr=groups.get(sig)||[];
     arr.push(a);groups.set(sig,arr);
    }
    out.positions++;out.rawActions+=opts.actions.length;
    out.uniqueCanonicalActions+=groups.size;
    const group=[...groups.values()].find(arr=>arr.filter(a=>a.type==='single').length>=2);
    if(group){
     const pair=group.filter(a=>a.type==='single').slice(0,2);
     if(pair[0].side===pair[1].side||e.tileKey(pair[0].tile)!==e.tileKey(pair[1].tile))
      throw Error('expected same tile on distinct sides');
     out.positionsWithEquivalence++;
     selected={state:r.cloneRoundState(s),pair};break;
    }
   }
   s=r.stepRound(s,opts=>chooseBy('min-hand-pips',opts,{seed,turns:s.turns,player:s.currentPlayer}));
  }
  if(!selected)continue;
  out.pairedPositions++;
  for(const policy of policies){
   const [a,b]=selected.pair.map(x=>continuation(selected.state,x,policy));
   out.continuations+=2;
   const x=out.policies[policy];x.comparisons++;
   if(a.outcome.kind==='unresolved'||b.outcome.kind==='unresolved')out.unresolved++;
   const f=selected.state.currentPlayer;
   const aw=+(a.outcome.kind==='finish'&&a.outcome.playerIndex===f);
   const bw=+(b.outcome.kind==='finish'&&b.outcome.playerIndex===f);
   const ap=e.pipSum(a.hands[f]),bp=e.pipSum(b.hands[f]);
   x.finishFirstMismatch+=+(aw!==bw);
   x.remainderMismatch+=+(ap!==bp);
   x.outcomeMismatch+=+(JSON.stringify(a.outcome)!==JSON.stringify(b.outcome));
   x.minusMismatch+=+((a.outcome.minus||0)!==(b.outcome.minus||0));
   x.meanAbsPipDifference+=Math.abs(ap-bp);
   if(out.examples.length<12&&(aw!==bw||ap!==bp))
    out.examples.push({seed,turn:selected.state.turns,policy,
     actions:selected.pair.map(actionKey),focalFinish:[aw,bw],focalPips:[ap,bp],
     endTypes:[a.outcome.kind,b.outcome.kind]});
  }
 }
 for(const p of policies)out.policies[p].meanAbsPipDifference/=Math.max(1,out.policies[p].comparisons);
 out.duplicateActionFraction=out.rawActions?1-out.uniqueCanonicalActions/out.rawActions:null;
 return out;
}
function test(){
 const x=run(1307600,3);
 if(x.scanned!==3||x.positions!==3||x.positionsWithEquivalence!==3||x.unresolved!==0)
  throw Error('symmetry fixture regression');
 return {passed:true,seeds:'1307600..1307602',pairedPositions:x.pairedPositions};
}
if(require.main===module){
 if(process.argv[2]==='test')console.log(JSON.stringify(test()));
 else console.log(JSON.stringify(run(Number(process.argv[2]||1307600),Number(process.argv[3]||240)),null,2));
}
module.exports={run,test,signature};

/* VERIFIED RESEARCH CHECKPOINT (machine-readable; generated by executing run() in V8)
{
  "timestampAsiaBaku": "2026-10-20 22:54 +04:00",
  "engine": "qosa-research-0.5.3",
  "rules": "qosa-1.0.0",
  "test": {
    "passed": true,
    "seeds": "1307600..1307602",
    "pairedPositions": 3
  },
  "discovery": {
    "schema": "qosa-geometry-symmetry-audit/v1",
    "engine": "qosa-research-0.5.3",
    "rules": "qosa-1.0.0",
    "mode": "3x9",
    "seedStart": 1307600,
    "seedEndExclusive": 1307840,
    "scanned": 240,
    "positions": 240,
    "positionsWithEquivalence": 240,
    "rawActions": 1715,
    "uniqueCanonicalActions": 602,
    "pairedPositions": 240,
    "continuations": 960,
    "unresolved": 0,
    "policies": {
      "min-hand-pips": {
        "comparisons": 240,
        "finishFirstMismatch": 13,
        "remainderMismatch": 26,
        "outcomeMismatch": 51,
        "minusMismatch": 9,
        "meanAbsPipDifference": 0.6291666666666667
      },
      "closed-branch-control": {
        "comparisons": 240,
        "finishFirstMismatch": 5,
        "remainderMismatch": 12,
        "outcomeMismatch": 14,
        "minusMismatch": 4,
        "meanAbsPipDifference": 0.2833333333333333
      }
    },
    "examples": [
      {
        "seed": 1307607,
        "turn": 1,
        "policy": "closed-branch-control",
        "actions": [
          "single|left||1-3",
          "single|right||1-3"
        ],
        "focalFinish": [
          0,
          0
        ],
        "focalPips": [
          11,
          18
        ],
        "endTypes": [
          "finish",
          "finish"
        ]
      },
      {
        "seed": 1307608,
        "turn": 1,
        "policy": "min-hand-pips",
        "actions": [
          "single|left||1-3",
          "single|right||1-3"
        ],
        "focalFinish": [
          0,
          1
        ],
        "focalPips": [
          9,
          0
        ],
        "endTypes": [
          "finish",
          "finish"
        ]
      },
      {
        "seed": 1307613,
        "turn": 1,
        "policy": "closed-branch-control",
        "actions": [
          "single|left||1-6",
          "single|right||1-6"
        ],
        "focalFinish": [
          0,
          1
        ],
        "focalPips": [
          5,
          0
        ],
        "endTypes": [
          "finish",
          "finish"
        ]
      },
      {
        "seed": 1307635,
        "turn": 1,
        "policy": "min-hand-pips",
        "actions": [
          "single|left||1-6",
          "single|right||1-6"
        ],
        "focalFinish": [
          0,
          1
        ],
        "focalPips": [
          5,
          0
        ],
        "endTypes": [
          "finish",
          "finish"
        ]
      },
      {
        "seed": 1307637,
        "turn": 1,
        "policy": "min-hand-pips",
        "actions": [
          "single|left||1-5",
          "single|right||1-5"
        ],
        "focalFinish": [
          0,
          0
        ],
        "focalPips": [
          9,
          13
        ],
        "endTypes": [
          "finish",
          "finish"
        ]
      },
      {
        "seed": 1307643,
        "turn": 1,
        "policy": "min-hand-pips",
        "actions": [
          "single|left||1-5",
          "single|right||1-5"
        ],
        "focalFinish": [
          1,
          0
        ],
        "focalPips": [
          0,
          5
        ],
        "endTypes": [
          "finish",
          "finish"
        ]
      },
      {
        "seed": 1307656,
        "turn": 1,
        "policy": "closed-branch-control",
        "actions": [
          "single|left||1-6",
          "single|right||1-6"
        ],
        "focalFinish": [
          0,
          0
        ],
        "focalPips": [
          7,
          10
        ],
        "endTypes": [
          "finish",
          "finish"
        ]
      },
      {
        "seed": 1307657,
        "turn": 1,
        "policy": "min-hand-pips",
        "actions": [
          "single|left||1-6",
          "single|right||1-6"
        ],
        "focalFinish": [
          1,
          0
        ],
        "focalPips": [
          0,
          4
        ],
        "endTypes": [
          "finish",
          "finish"
        ]
      },
      {
        "seed": 1307659,
        "turn": 1,
        "policy": "min-hand-pips",
        "actions": [
          "single|left||1-6",
          "single|right||1-6"
        ],
        "focalFinish": [
          1,
          0
        ],
        "focalPips": [
          0,
          1
        ],
        "endTypes": [
          "finish",
          "finish"
        ]
      },
      {
        "seed": 1307668,
        "turn": 1,
        "policy": "min-hand-pips",
        "actions": [
          "single|left||1-4",
          "single|right||1-4"
        ],
        "focalFinish": [
          0,
          1
        ],
        "focalPips": [
          21,
          0
        ],
        "endTypes": [
          "finish",
          "finish"
        ]
      },
      {
        "seed": 1307669,
        "turn": 1,
        "policy": "min-hand-pips",
        "actions": [
          "single|left||1-6",
          "single|right||1-6"
        ],
        "focalFinish": [
          0,
          0
        ],
        "focalPips": [
          10,
          2
        ],
        "endTypes": [
          "finish",
          "finish"
        ]
      },
      {
        "seed": 1307681,
        "turn": 1,
        "policy": "min-hand-pips",
        "actions": [
          "single|left||0-1",
          "single|right||0-1"
        ],
        "focalFinish": [
          1,
          0
        ],
        "focalPips": [
          0,
          4
        ],
        "endTypes": [
          "finish",
          "block"
        ]
      }
    ],
    "duplicateActionFraction": 0.6489795918367347
  },
  "holdout": {
    "schema": "qosa-geometry-symmetry-audit/v1",
    "engine": "qosa-research-0.5.3",
    "rules": "qosa-1.0.0",
    "mode": "3x9",
    "seedStart": 1307840,
    "seedEndExclusive": 1308080,
    "scanned": 240,
    "positions": 240,
    "positionsWithEquivalence": 240,
    "rawActions": 1744,
    "uniqueCanonicalActions": 618,
    "pairedPositions": 240,
    "continuations": 960,
    "unresolved": 0,
    "policies": {
      "min-hand-pips": {
        "comparisons": 240,
        "finishFirstMismatch": 11,
        "remainderMismatch": 30,
        "outcomeMismatch": 44,
        "minusMismatch": 7,
        "meanAbsPipDifference": 0.5541666666666667
      },
      "closed-branch-control": {
        "comparisons": 240,
        "finishFirstMismatch": 11,
        "remainderMismatch": 19,
        "outcomeMismatch": 24,
        "minusMismatch": 5,
        "meanAbsPipDifference": 0.475
      }
    },
    "examples": [
      {
        "seed": 1307846,
        "turn": 1,
        "policy": "min-hand-pips",
        "actions": [
          "single|left||0-1",
          "single|right||0-1"
        ],
        "focalFinish": [
          0,
          0
        ],
        "focalPips": [
          9,
          4
        ],
        "endTypes": [
          "finish",
          "finish"
        ]
      },
      {
        "seed": 1307848,
        "turn": 1,
        "policy": "min-hand-pips",
        "actions": [
          "single|up||0-1",
          "single|left||0-1"
        ],
        "focalFinish": [
          1,
          0
        ],
        "focalPips": [
          0,
          4
        ],
        "endTypes": [
          "finish",
          "finish"
        ]
      },
      {
        "seed": 1307852,
        "turn": 1,
        "policy": "closed-branch-control",
        "actions": [
          "single|left||1-5",
          "single|right||1-5"
        ],
        "focalFinish": [
          1,
          0
        ],
        "focalPips": [
          0,
          3
        ],
        "endTypes": [
          "finish",
          "finish"
        ]
      },
      {
        "seed": 1307853,
        "turn": 1,
        "policy": "min-hand-pips",
        "actions": [
          "single|left||1-6",
          "single|right||1-6"
        ],
        "focalFinish": [
          0,
          0
        ],
        "focalPips": [
          6,
          5
        ],
        "endTypes": [
          "finish",
          "finish"
        ]
      },
      {
        "seed": 1307854,
        "turn": 1,
        "policy": "closed-branch-control",
        "actions": [
          "single|left||0-1",
          "single|right||0-1"
        ],
        "focalFinish": [
          1,
          0
        ],
        "focalPips": [
          0,
          2
        ],
        "endTypes": [
          "finish",
          "finish"
        ]
      },
      {
        "seed": 1307855,
        "turn": 1,
        "policy": "min-hand-pips",
        "actions": [
          "single|left||0-1",
          "single|right||0-1"
        ],
        "focalFinish": [
          0,
          0
        ],
        "focalPips": [
          9,
          5
        ],
        "endTypes": [
          "finish",
          "finish"
        ]
      },
      {
        "seed": 1307862,
        "turn": 1,
        "policy": "closed-branch-control",
        "actions": [
          "single|up||1-5",
          "single|left||1-5"
        ],
        "focalFinish": [
          0,
          1
        ],
        "focalPips": [
          3,
          0
        ],
        "endTypes": [
          "finish",
          "finish"
        ]
      },
      {
        "seed": 1307871,
        "turn": 1,
        "policy": "min-hand-pips",
        "actions": [
          "single|left||0-1",
          "single|right||0-1"
        ],
        "focalFinish": [
          0,
          0
        ],
        "focalPips": [
          11,
          9
        ],
        "endTypes": [
          "finish",
          "finish"
        ]
      },
      {
        "seed": 1307881,
        "turn": 1,
        "policy": "min-hand-pips",
        "actions": [
          "single|left||1-5",
          "single|right||1-5"
        ],
        "focalFinish": [
          0,
          0
        ],
        "focalPips": [
          4,
          5
        ],
        "endTypes": [
          "finish",
          "finish"
        ]
      },
      {
        "seed": 1307883,
        "turn": 1,
        "policy": "min-hand-pips",
        "actions": [
          "single|up||1-3",
          "single|left||1-3"
        ],
        "focalFinish": [
          0,
          1
        ],
        "focalPips": [
          2,
          0
        ],
        "endTypes": [
          "finish",
          "finish"
        ]
      },
      {
        "seed": 1307891,
        "turn": 2,
        "policy": "closed-branch-control",
        "actions": [
          "single|left||0-1",
          "single|right||0-1"
        ],
        "focalFinish": [
          0,
          0
        ],
        "focalPips": [
          7,
          2
        ],
        "endTypes": [
          "finish",
          "finish"
        ]
      },
      {
        "seed": 1307892,
        "turn": 1,
        "policy": "min-hand-pips",
        "actions": [
          "single|left||1-3",
          "single|right||1-3"
        ],
        "focalFinish": [
          0,
          1
        ],
        "focalPips": [
          3,
          0
        ],
        "endTypes": [
          "finish",
          "finish"
        ]
      }
    ],
    "duplicateActionFraction": 0.6456422018348624
  },
  "cumulativeScale": "264900 full strategy continuations + 134968 prior comparative continuations; this run adds 1920 forced symmetry continuations (480 matched seed positions x 2 policies x 2 forced choices). Keep classes separate.",
  "finding": "Many legal action labels collapse to the same canonical branch-end multiset, yet deterministic bot continuations sometimes differ by side-label tie-breaking. These are model-label artifacts, not demonstrated physical tactical value of left versus right.",
  "confidence": "Deterministic V8 CommonJS self-test and two independent 240-seed cohorts. Not Node CLI. Physical branch orientation and full game equivalence not proven; initial-turn-heavy cohort; branch rules provisional; no block winner.",
  "nextHypothesis": "Implement a permutation-equivariant canonical action tie-break and compare paired rollouts on identical deals/worlds; retest pass-history geometry regret after collapsing equivalent action labels."
}
*/
