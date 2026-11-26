# 2026-11-26 21:50 Asia/Baku — opening double vs connectivity paired pilot

Rules qosa-1.0.0; engine qosa-research-0.5.3; 3×9+1. Connector source modules executed directly in V8 CommonJS adapter (not native full validation gate). README/RULES/EXPERIMENTS/STATUS read; RESULTS.md raw fetch rejected as oversized. No historical samples merged. Branch unlocking, block allocation, loneZero remain provisional. Blocks count as no first finisher, no block winner assigned.

Seeds 26112600..26114099; first-round stock 1-1 skipped; at least two legal follow-ups required. A prioritizes ownership of matching double, then number of remaining ordinary connectors, then larger target pip. C prioritizes connectors, then ownership, then larger target pip. Only discordant choices replayed. Both continuations use identical deterministic policy for all seats; same deal and starter. Two policy environments, not independent samples. Results (raw sums, divide by n for rates/means):

```json
{
  "start": 26112600,
  "count": 1500,
  "eligible": 974,
  "disagree": 203,
  "stats": {
    "min-hand-pips": {
      "n": 203,
      "a": 105,
      "c": 101,
      "onlyA": 42,
      "onlyC": 38,
      "pipsA": 441,
      "pipsC": 508,
      "minusA": 15,
      "minusC": 18,
      "blocksA": 9,
      "blocksC": 7,
      "turnA": 4833,
      "turnC": 4848,
      "medianA": 0,
      "medianC": 1
    },
    "moderate-double-hold": {
      "n": 203,
      "a": 102,
      "c": 101,
      "onlyA": 44,
      "onlyC": 43,
      "pipsA": 577,
      "pipsC": 515,
      "minusA": 14,
      "minusC": 18,
      "blocksA": 7,
      "blocksC": 7,
      "turnA": 4921,
      "turnC": 4921,
      "medianA": 0,
      "medianC": 1
    }
  }
}
```

Reproduction: load engine, initializer, turn-kernel, turn-dispatcher, round-driver, strategy-runner from simulator; use following runner body (e,i,r,s are respective exports):

```js
()=>{const stats={};let eligible=0,disagree=0;const start=26112600,count=1500;for(let seed=start;seed<start+count;seed++){const deal=e.dealThreeByNine(seed);if(e.tileKey(deal.stock[0])==="1-1")continue;const base=i.initializeThreePlayerRoundFromDeal({...deal,isFirstRound:true});const p=base.starter;const hand=deal.hands[p].filter(t=>e.tileKey(t)!=="1-1").concat(deal.stock);const choices=hand.filter(t=>t[0]!==t[1]&&t.includes(1));if(choices.length<2)continue;eligible++;const x=t=>t[0]===1?t[1]:t[0];const owned=t=>+hand.some(h=>h[0]===x(t)&&h[1]===x(t));const links=t=>hand.filter(h=>h!==t&&h[0]!==h[1]&&h.includes(x(t))).length;const a=[...choices].sort((a,b)=>owned(b)-owned(a)||links(b)-links(a)||x(b)-x(a))[0];const c=[...choices].sort((a,b)=>links(b)-links(a)||owned(b)-owned(a)||x(b)-x(a))[0];if(e.tileKey(a)===e.tileKey(c))continue;disagree++;for(const policy of ["min-hand-pips","moderate-double-hold"]){const k=stats[policy]??={n:0,a:0,c:0,onlyA:0,onlyC:0,pipsA:0,pipsC:0,minusA:0,minusC:0,blocksA:0,blocksC:0,turnA:0,turnC:0,remA:[],remC:[]};const outs=[a,c].map(tile=>r.runRound(i.initializeThreePlayerRoundFromDeal({...deal,isFirstRound:true,chooseFollowup:opts=>opts.find(o=>e.tileKey(o.tile)===e.tileKey(tile))}),(opts,state)=>s.chooseBy(policy,opts,{seed,turns:state.turns,player:state.currentPlayer})));const wins=outs.map(o=>+(o.outcome.kind==="finish"&&o.outcome.playerIndex===p));k.n++;k.a+=wins[0];k.c+=wins[1];k.onlyA+=+(wins[0]&&!wins[1]);k.onlyC+=+(wins[1]&&!wins[0]);for(let j=0;j<2;j++){const z=j?"C":"A",o=outs[j],pip=e.pipSum(o.hands[p]);k["pips"+z]+=pip;k["rem"+z].push(pip);k["minus"+z]+=+(wins[j]&&o.outcome.minus<0);k["blocks"+z]+=+(o.outcome.kind==="block");k["turn"+z]+=o.turns;}}}for(const k of Object.values(stats)){for(const z of ["A","C"]){let a=k["rem"+z].sort((a,b)=>a-b);k["median"+z]=(a[Math.floor((a.length-1)/2)]+a[Math.floor(a.length/2)])/2;delete k["rem"+z]}}return {start,count,eligible,disagree,stats}}
```

Exploratory conditional pilot, no strategy promotion until native validation and independent seed holdout. Next: repeat discordant comparison on disjoint seeds with randomized symmetric tie-break and deal-level paired intervals; track minus magnitude and specific target numbers. Historical 180000 separate; this run 812 full round executions, 203 distinct discordant deals.
