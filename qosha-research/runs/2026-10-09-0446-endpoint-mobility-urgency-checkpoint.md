# Endpoint mobility urgency checkpoint — 2026-10-09 04:46 Asia/Baku

Engine qosa-research-0.5.3; recovered rules qosa-1.0.0; primary 3x9.
Independent seed ranges 150000..151999 and 152000..153999; 80 reachable positions; 25 fixed-visible worlds each; 2000 new worlds; 47125 continuations. Full strategy rounds this run: 0.
Cumulative verified: 180000 full rounds plus 60810 fixed-visible hidden worlds; historical 4000 separate.
Strategies: closed-branch-control, min-hand-pips, fast-doubles, moderate-double-hold, random-legal.
Aligned endpoint mobility finish-first advantages: +8.10, +7.75, +3.90, +7.70, +4.95 percentage points, respectively. Position-level exploratory 95% intervals: [4.20,12.00], [4.22,11.28], [0.98,6.82], [4.11,11.29], [2.11,7.79].
New finding: provisional support for choosing the branch endpoint with more other matching own tiles; under opponent minimum 1-2 stones the advantage was weaker numerically, but urgency interaction confidence intervals all cross zero. Not a proven universal rule.
Confidence/limits: exploratory unadjusted position-level intervals; nonrandom hand composition; first-eligible/quota selection; assumption-labelled branch semantics; correlated worlds; simple bots; block winner unassigned. Determinism and immutability self-test passed in V8 harness (not Node).
Reproduce: simulator/endpoint-mobility-urgency-holdout.js 10 25. Paired world seed = 6100000+1000*dealSeed+worldIndex. Detailed data: runs/2026-10-09-0446-endpoint-mobility-urgency-holdout.json.
Exact next action: independent seeds 154000..157999; larger quotas; isolate opponent exactly one tile and compare alternative branch sides/regret.
