# 2026-11-26 22:52 Asia/Baku — opening connectivity holdout

Recovered qosa-1.0.0 / qosa-research-0.5.3, 3×9+1. Disjoint seed holdout from 21:50 pilot; source modules executed in V8 CommonJS adapter, not native full gate. README, RULES, EXPERIMENTS, STATUS and gate inspected; RESULTS.md range fetch returned empty, so cumulative history not verified. Branch unlock, block allocation and loneZero provisional. No block winner assigned. Same deal and continuation policy for both candidate moves; root tie uses seeded target-pip hash rather than highest pip. Continuation retains existing stable-key tie-break (not branch-symmetric). Paired normal intervals descriptive, no multiplicity adjustment. Strata by connector-count advantage of C. No strategy promotion. A=double ownership first; C=ordinary connectors first.

Source blob hashes:
```json
{
  "engine": "82e5bd544a57683d5b4f7812beb2d4abf80da894",
  "initializer": "2fad29e516454580ec9a06115354e9866f3096e6",
  "turn-kernel": "94657896e1f8e471ceb2e9a65d1842b6102dff18",
  "turn-dispatcher": "55b0bcf3f1653c64b4e06bc95d7e917a480562a0",
  "round-driver": "fbaad78865adbddde1ea6651e6a501dc0bde3203",
  "strategy-runner": "b7078942bc8f5dac6a8b07494ae8aaeadbdb1f5f"
}
```

Results:
```json
{
  "start": 26115000,
  "count": 4000,
  "eligible": 2633,
  "disagree": 548,
  "stats": {
    "min-hand-pips": {
      "n": 548,
      "a": 272,
      "c": 233,
      "onlyA": 130,
      "onlyC": 91,
      "pipsA": 1316,
      "pipsC": 1508,
      "minusA": {
        "0": 241,
        "-10": 31
      },
      "minusC": {
        "0": 193,
        "-10": 39,
        "-20": 1
      },
      "blocksA": 16,
      "blocksC": 21,
      "turnA": 13029,
      "turnC": 13202,
      "strata": {
        "1": {
          "n": 351,
          "a": 170,
          "c": 138
        },
        "2": {
          "n": 158,
          "a": 87,
          "c": 86
        },
        "3": {
          "n": 39,
          "a": 15,
          "c": 9
        }
      },
      "medianA": 1,
      "medianC": 2,
      "delta": 0.07116788321167883,
      "ci95": [
        0.01828393938043006,
        0.1240518270429276
      ]
    },
    "moderate-double-hold": {
      "n": 548,
      "a": 268,
      "c": 225,
      "onlyA": 131,
      "onlyC": 88,
      "pipsA": 1436,
      "pipsC": 1609,
      "minusA": {
        "0": 221,
        "-10": 46,
        "-20": 1
      },
      "minusC": {
        "0": 186,
        "-10": 38,
        "-20": 1
      },
      "blocksA": 8,
      "blocksC": 18,
      "turnA": 13190,
      "turnC": 13365,
      "strata": {
        "1": {
          "n": 351,
          "a": 166,
          "c": 139
        },
        "2": {
          "n": 158,
          "a": 83,
          "c": 73
        },
        "3": {
          "n": 39,
          "a": 19,
          "c": 13
        }
      },
      "medianA": 1,
      "medianC": 2,
      "delta": 0.07846715328467153,
      "ci95": [
        0.025899014107406575,
        0.1310352924619365
      ]
    }
  }
}
```

Full executions 2192; distinct discordant deals 548; prior pilot 812 executions separate; historical 180000 separate. Next: validate native gates and branch-symmetric continuation; test connector-gap interaction on fresh seeds. Reproduce with engine e, initializer i, round-driver r, strategy-runner s:
```js
()=>{const stats={};let eligible=0,disagree=0;const start=26115000,count=4000;for(let seed=start;seed<start+count;seed++){const deal=e.dealThreeByNine(seed);if(e.tileKey(deal.stock[0])==="1-1")continue;const base=i.initializeThreePlayerRoundFromDeal({...deal,isFirstRound:true});const p=base.starter;const hand=deal.hands[p].filter(t=>e.tileKey(t)!=="1-1").concat(deal.stock);const choices=hand.filter(t=>t[0]!==t[1]&&t.includes(1));if(choices.length<2)continue;eligible++;const x=t=>t[0]===1?t[1]:t[0];const owned=t=>+hand.some(h=>h[0]===x(t)&&h[1]===x(t));const links=t=>hand.filter(h=>h!==t&&h[0]!==h[1]&&h.includes(x(t))).length;const tie=t=>e.mixSeed32(seed^Math.imul(x(t)+1,0x9e3779b9));const a=[...choices].sort((a,b)=>owned(b)-owned(a)||links(b)-links(a)||tie(b)-tie(a))[0];const c=[...choices].sort((a,b)=>links(b)-links(a)||owned(b)-owned(a)||tie(b)-tie(a))[0];if(e.tileKey(a)===e.tileKey(c))continue;disagree++;for(const policy of ["min-hand-pips","moderate-double-hold"]){const k=stats[policy]??={n:0,a:0,c:0,onlyA:0,onlyC:0,pipsA:0,pipsC:0,minusA:{},minusC:{},blocksA:0,blocksC:0,turnA:0,turnC:0,remA:[],remC:[],strata:{}};const outs=[a,c].map(tile=>r.runRound(i.initializeThreePlayerRoundFromDeal({...deal,isFirstRound:true,chooseFollowup:opts=>opts.find(o=>e.tileKey(o.tile)===e.tileKey(tile))}),(opts,state)=>s.chooseBy(policy,opts,{seed,turns:state.turns,player:state.currentPlayer})));const wins=outs.map(o=>+(o.outcome.kind==="finish"&&o.outcome.playerIndex===p));k.n++;k.a+=wins[0];k.c+=wins[1];k.onlyA+=+(wins[0]&&!wins[1]);k.onlyC+=+(wins[1]&&!wins[0]);const gap=links(c)-links(a);const q=k.strata[gap]??={n:0,a:0,c:0};q.n++;q.a+=wins[0];q.c+=wins[1];for(let j=0;j<2;j++){const z=j?"C":"A",o=outs[j],pip=e.pipSum(o.hands[p]);k["pips"+z]+=pip;k["rem"+z].push(pip);if(wins[j]){const m=String(o.outcome.minus||0);k["minus"+z][m]=(k["minus"+z][m]||0)+1;}k["blocks"+z]+=+(o.outcome.kind==="block");k["turn"+z]+=o.turns;}}}for(const k of Object.values(stats)){for(const z of ["A","C"]){let a=k["rem"+z].sort((a,b)=>a-b);k["median"+z]=(a[Math.floor((a.length-1)/2)]+a[Math.floor(a.length/2)])/2;delete k["rem"+z]}const d=(k.onlyA-k.onlyC)/k.n,se=Math.sqrt(((k.onlyA+k.onlyC)/k.n-d*d)/(k.n-1));k.delta=d;k.ci95=[d-1.96*se,d+1.96*se]}return {start,count,eligible,disagree,stats}}
```
