'use strict';
// Exact confirmed-opening tradeoff: next-opponent pass control vs immediate pip shedding.
// Run: node qosha-research/simulator/opening-pass-pip-frontier.js
// No unverified late-arrival or block-scoring rule used.
const study=function study(){
  'use strict';
  const assert=(v,m)=>{if(!v)throw Error('opening-pass-pip-frontier: '+m);};
  const C=(n,k)=>{if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v);};
  const pop=n=>{let k=0;while(n){n&=n-1;k++;}return k;};
  const numbers=[0,2,3,4,5,6], passDen=C(18,9);
  const totals={hands:0,mixed:0,aligned:0,conflict:0,penaltySum:0,weightedPassGap:0};
  const byConnectors=[],penaltyCounts=Array(7).fill(0),lookup=new Uint8Array(4096);
  for(let s=0;s<64;s++)for(let d=0;d<64;d++){
    const c=pop(s),w=C(15,9-c-pop(d));if(!w)continue;
    totals.hands+=w;
    const owned=[],unowned=[];
    for(let i=0;i<6;i++)if(s&(1<<i)){if(d&(1<<i))owned.push(numbers[i]);else unowned.push(numbers[i]);}
    if(!owned.length||!unowned.length)continue;
    const penalty=Math.max(0,Math.max(...unowned)-Math.max(...owned));
    lookup[s*64+d]=penalty+1;
    const gap=(C(18-(6-c),9)-C(18-(7-c),9))/passDen;
    const row=byConnectors[c]||(byConnectors[c]={connectors:c,mixedHands:0,alignedHands:0,conflictHands:0,penaltyPipsSum:0,passAdvantagePp:100*gap});
    totals.mixed+=w;totals.penaltySum+=w*penalty;totals.weightedPassGap+=w*gap;
    totals[penalty?'conflict':'aligned']+=w;penaltyCounts[penalty]+=w;
    row.mixedHands+=w;row[penalty?'conflictHands':'alignedHands']+=w;row.penaltyPipsSum+=w*penalty;
  }
  const deck=[];
  for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)if(!(a===1&&b===1)){
    const other=a===1?b:b===1?a:null;
    const cm=other===null?0:(1<<numbers.indexOf(other));
    const dm=a===b?(1<<numbers.indexOf(a)):0;
    deck.push({cm,dm});
  }
  assert(deck.length===27,'27 post-opening tile types');
  const brute={hands:0,mixed:0,aligned:0,conflict:0,penaltySum:0,penaltyCounts:Array(7).fill(0)};
  function visit(start,left,s,d){
    if(left===0){
      brute.hands++;
      const encoded=lookup[s*64+d];
      if(encoded){const p=encoded-1;brute.mixed++;brute.penaltySum+=p;brute[p?'conflict':'aligned']++;brute.penaltyCounts[p]++;}
      return;
    }
    for(let i=start;i<=deck.length-left;i++)visit(i+1,left-1,s|deck[i].cm,d|deck[i].dm);
  }
  visit(0,9,0,0);
  assert(totals.hands===C(27,9)&&totals.hands===4686825,'all hands');
  assert(totals.mixed===1749665,'mixed choice baseline');
  assert(totals.aligned===780190&&totals.conflict===969475&&totals.penaltySum===2614318,'expected frontier census');
  for(const k of ['hands','mixed','aligned','conflict','penaltySum'])assert(brute[k]===totals[k],'independent brute '+k);
  assert(brute.penaltyCounts.every((v,i)=>v===penaltyCounts[i]),'independent penalty distribution');
  assert(byConnectors.filter(Boolean).reduce((a,r)=>a+r.mixedHands,0)===totals.mixed,'connector strata');
  const rows=byConnectors.filter(Boolean).map(r=>({...r,conflictRate:r.conflictHands/r.mixedHands,meanPipSacrifice:r.penaltyPipsSum/r.mixedHands}));
  return {
    schema:'qosha-opening-pass-pip-frontier/v1',
    timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).replace(' ','T')+'+04:00',
    engine:'qosa-research-0.5.3 + opening-pass-pip-frontier-1.0',
    rules:'recovered qosa-1.0.0, confirmed first-round 3x9 opening: 1-1 played, starter stock drawn; four initially open 1 ends; new X end locked, X-X itself playable',
    seeds:null,newDeals:0,newCompleteRounds:0,newHiddenAllocations:0,newForcedContinuations:0,
    comparedActions:['choose 1-X whose X-X is owned (maximizes next-opponent forced-pass chance)','choose 1-X with largest X (maximizes immediate pips shed)'],
    exact:{
      totalPostDrawHands:totals.hands,mixedChoiceHands:totals.mixed,
      mixedChoiceRate:totals.mixed/totals.hands,
      bothObjectivesAlignedHands:totals.aligned,objectivesConflictHands:totals.conflict,
      conflictRateGivenMixed:totals.conflict/totals.mixed,
      pipSacrificeDistribution:penaltyCounts,
      meanPipsSacrificedGivenMixed:totals.penaltySum/totals.mixed,
      meanPipsSacrificedGivenConflict:totals.penaltySum/totals.conflict,
      meanImmediateNextOpponentPassAdvantagePpGivenMixed:100*totals.weightedPassGap/totals.mixed,
      byConnectors:rows
    },
    tests:{analyticMaskPairs:4096,independentExhaustiveHands:brute.hands,
      exactBruteAgreement:true,all28TileConservation:true,
      noLaterBranchOrBlockAssumption:true},
    finding:'Among 1,749,665 opening hands offering owned-X-X and unowned-Y-Y connector choices, maximizing immediate next-opponent pass probability conflicts with maximizing pips shed in 969,475 (55.41%); conflict sacrifices mean 2.70 immediate pips. This is a choice tradeoff, not a win-rate recommendation.',
    confidence:'Exact weighted 4096-mask census independently reproduced by exhaustive enumeration of all C(27,9)=4,686,825 starter hands; no sampling error',
    limitations:['Opening 1-X connector choice only, not whole-game policies','Next-opponent legal-move availability under uniform unseen hands, not an actual pass chosen by an opponent','Pip sacrifice is immediate stone pip difference, not final remainder or decision regret','Unverified late-arrival branch, block tie, loneZero and 101 scoring'],
    nextAction:'After authentic branch/tie validation, compare owned-X-X pass-control and maximum-pip opening choices on matched hidden-world continuations, stratifying by pip sacrifice 0/1-2/3+ and opponent policy.'
  };
};
if(typeof require!=='undefined' && require.main===module)console.log(JSON.stringify(study(),null,2));
if(typeof module!=='undefined')module.exports={study};
