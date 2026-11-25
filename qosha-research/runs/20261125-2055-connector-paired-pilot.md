# 2026-11-25 20:55 Asia/Baku — connector-stratified paired pilot

Engine qosa-research-0.5.3, recovered qosa-1.0.0; 3x9+1. Executed repository CommonJS sources in V8 adapter, not native full checkout. Sources: strategy-runner.js, engine.js, round-driver.js, initializer.js, turn-dispatcher.js, turn-kernel.js. Full validation gate remains unverified; global branch unlock provisional, block winner unassigned, loneZero unresolved. No match-first-place claim.

Seeds 9252055..9252354; 300 initialized deals. For each seat with at least one non-1 double in initialized hand, classify by maximum count of ordinary connectors touching any such double (0,1,2+). Compare moderate-double-hold versus min-hand-pips with both opponents min-hand-pips, same initialized deal and seat. Finish wins only, raw terminal pips, negative finishes, blocks and turns. Counts below are paired seat exposures, not independent deals. No decision regret or median measured. Historical samples separate.

```json
{
  "0": {
    "n": 9,
    "holdWin": 2,
    "pipWin": 2,
    "holdPips": 42,
    "pipPips": 41,
    "holdMinus": 0,
    "pipMinus": 0,
    "holdBlock": 0,
    "pipBlock": 0,
    "holdTurns": 226,
    "pipTurns": 225,
    "holdOnly": 0,
    "pipOnly": 0
  },
  "1": {
    "n": 81,
    "holdWin": 29,
    "pipWin": 28,
    "holdPips": 273,
    "pipPips": 284,
    "holdMinus": 5,
    "pipMinus": 4,
    "holdBlock": 3,
    "pipBlock": 2,
    "holdTurns": 1964,
    "pipTurns": 1967,
    "holdOnly": 5,
    "pipOnly": 4
  },
  "2": {
    "n": 758,
    "holdWin": 269,
    "pipWin": 255,
    "holdPips": 2894,
    "pipPips": 3090,
    "holdMinus": 31,
    "pipMinus": 40,
    "holdBlock": 18,
    "pipBlock": 17,
    "holdTurns": 18396,
    "pipTurns": 18303,
    "holdOnly": 47,
    "pipOnly": 33
  }
}
```

Reproduce: initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3}); loop seats; classify base.hands[seat] as above; runRound(base, chooser, {maxTurns:200}); chooser calls strategy-runner.chooseBy with focal policy and min-hand-pips opponents, context {seed,rotation:seat,turns:state.turns,player:state.currentPlayer}. Next: disjoint larger seed cohort, deal-clustered intervals, stratify by specific double and connector count; complete native gates before promotion. This is a policy contrast, not causal effect of holding a particular double.
