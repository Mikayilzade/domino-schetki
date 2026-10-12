# Independent exact multi-choice pass-history holdout

- Timestamp Asia/Baku: 2026-10-12T18:59:41 +04:00; engine qosa-research-0.5.3; rules qosa-1.0.0; primary 3x9.
- 35 positions, discovery seeds 2910000..2910181, 354 exhaustive hidden allocations (271 history-compatible), 112 canonical single actions, 2595 paired candidate continuations; 0 unresolved; 0 new complete strategy rounds. Verified complete strategy rounds remain 180000; historical 4000 separate.
- Deterministic replay: seed 2910003 fixture passed; exact combinatorial next-pass probability matches exhaustive world enumeration for every candidate; original state unchanged. Executed V8 CommonJS, not Node CLI.
- Policies: closed-branch-control, min-hand-pips, fast-doubles. Continuation seed 90000000+1000*dealSeed+lexicographicCompatibleAllocationIndex; complete seeds/metrics in linked JSON.
- Mean next-pass Brier uniform 0.031335 vs history 0.028763; changed forecasts 3/35; strict preferred-action reversals 0/35.
- First-place history-minus-uniform delta: 0.000000. Pass-max minus max-immediate-pips win: 0.031429 under closed-branch; 0.031429 under fast-doubles. In-sample best-single regret: 0.022857.
- Finding: history improved pass forecast slightly but did not change the pass-max move in this independent cohort. Pass-max beat immediate pip discard in this selected model sample, but selection, geometry and hindsight oracle limit generalization; no reliable human strategy claim.
- Confidence/limitations: selected late-game states; exact uniform hidden allocations conditioned on target passes only; assumed branch opening; fixed bots; no block winner; canonical single actions only; not a causal human-play rule.
- Exact next hypothesis/action: Seek independent strict posterior action reversals; compare direct win/pips/minus regret with nested hidden-world holdouts and isolate geometry.
- Code: simulator/multichoice-pass-value-runner.js; full data: runs/2026-10-12-1856-multichoice-pass-value-2910000.json.
