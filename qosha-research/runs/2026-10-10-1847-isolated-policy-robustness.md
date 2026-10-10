# Isolated-double fourth exact holdout — 2026-10-10 18:47 Asia/Baku

Engine/rules: qosa-research-0.5.3 / qosa-1.0.0; primary 3×9.

Fresh seeds 93000..109999: 3348 scanned deals, 70 selected positions, 772 exhaustive hidden allocations, 6978 candidate continuations; 0 new complete strategy rounds. Selection: first eligible state per deal, isolated X-X with legal single alternative, next player <=2, stock empty. Matched policies: closed-branch-control, min-hand-pips, fast-doubles.

Preserve-minus-open finish-first advantage: +23.24 / +21.77 / +22.92 percentage points respectively; closed-branch 43 positive, 26 ties, 1 negative. Mean remainder difference -1.39 pips.

Opening-favorable seed 94284, X=0, hand [0-0,2-5,1-2], ends [2,3,0,6], 15 exact hidden worlds: opening +6.67 pp under each of the three deterministic policies.

Robustness control: on the same exact hidden allocations, 100 deterministic random-legal continuation salts. Seed 91314, X=2, hand [0-3,2-2,0-5], 5 worlds: opening advantage +4.6 pp versus +20 pp with the deterministic policies. Seed 94284: the sign REVERSED; preserving is +5.9 pp on random-legal average. This control adds 2000 world/salt evaluations and 5500 candidate continuations. Salts are not independent worlds.

Most useful finding: an opening-favorable exception under three correlated bot policies can reverse under another policy. No general rule promoted.

Validation: deterministic in-memory V8 CommonJS test passed for both seeds, 4 salts, 20 exact worlds, 220 candidate continuations. Reproduce holdout using simulator/isolated-double-exact-runner.js seeds 93000..109999, quota 70. New robustness runner tested but not yet on main.

Limitations: uniform hidden allocations not conditioned on earlier opponent decisions; branch opening assumption; bot behavior; first-eligible selection; block winner unassigned. Historical baseline separate. Cumulative validated full rounds remain 180000; exact allocations separate.

Next: persist new policy-robustness runner and run data; on fresh seeds >=110000, stratify the risk that an ordinary single unlocks an opponent's connecting path; compare against opening a double with random-legal and deterministic policies.
