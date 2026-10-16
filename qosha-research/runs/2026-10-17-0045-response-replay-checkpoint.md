# 2026-10-17 00:45 Asia/Baku — connector response replay and equal-accessible holdout

Engine qosa-research-0.5.3; rules recovered qosa-1.0.0; primary 3 players x 9 stones. V8 CommonJS deterministic 2-world replay passed; Node CLI was not executed. No engine changes.

Replayed previous min-hand-pips first-eligible cohort on 24 exact seeds:
650140,650218,650730,651314,652154,652428,652688,652861,653021,653053,653058,653707,653873,654059,654288,654322,654760,655263,655970,656061,656378,656583,656741,656956.
25 hidden allocations/position; worldSeed=67000000+1000*dealSeed+worldIndex (0..24); 600 hidden worlds, 3600 forced candidate continuations; no unresolved. Same legal equal-pip connector versus unrelated single, retaining X-X and another X connector. Policies: closed-branch-control, min-hand-pips, fast-doubles.
Paired connector-minus-unrelated first-finish differences: -19.17, -20.00, +1.50 percentage points. Remainder differences: +2.180, +2.158, +0.347 pips. Minus-finish differences: -17.83, -19.50, 0.00 percentage points. Next clockwise opponent immediate pass difference: -6.00 percentage points. The 2026-10-16 23:45 summary was exactly reproduced. All 24 positions had fewer accessible branch ends after connector action, zero had equal ends.

Fresh independent search: seeds 690000..714999 (25000 scanned, 128 eligible positions); only three first-eligible positions had equal accessible branch-end count after both alternatives: 703612, 704026, 709028. 25 hidden allocations per position; worldSeed=71000000+1000*dealSeed+worldIndex (0..24); 75 hidden worlds, 450 forced continuations; no unresolved. Same policies/order. First-finish differences: 0.00, -4.00, 0.00 percentage points; remainder differences: -0.347, -1.720, +0.773 pips; immediate next-opponent pass difference -13.33 percentage points. Only 3 position clusters: too small for a reliable strategic conclusion. Equal accessible count does NOT mean equal four-end/opened-number geometry.

Total this run: 675 sampled hidden worlds, 4050 forced continuations; 0 new complete strategy rounds. Confirmed prior complete-round baseline: 186000; historical 4000 separate.

Confidence: high for deterministic replay and exact seed accounting; low for equal-accessible strategic effect due to n=3, first-eligible selection, deterministic bots, unconditioned uniform hidden allocations, provisional branch opening semantics and unassigned block winner. No universal human-play rule. Source runner and raw per-world JSON were computed in-memory but the multi-file GitHub write was blocked; this is a summary-only checkpoint, not full raw-data reproducibility.

Next action: persist standalone min-pips response replay runner and full per-position world JSON; execute Node CLI tests; seek larger independent equal-accessible cohort and full four-end/locked/open matched controls, especially fast-doubles counterexamples.