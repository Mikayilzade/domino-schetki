# Known-draw and retrospective pass integrity — 2026-10-28 03:52:56 +04:00

- **Engine/rules:** `qosa-research-0.5.3 + public-history-replay-1.1` / recovered `qosa-1.0.0` 3×9; **global-ever-open provisional**.
- **New guards:** a known focal final hand cannot contradict an earlier no-acquisition pass; an explicitly known unplayed stock draw must remain with its owner and is injected into the fixed opponent hand in the exact posterior. Contradictory owner assignments and missing focal draws are rejected. A draw with unspecified tile identity creates **no** tile-ownership inference.
- **Fresh seeds:** **2054000..2065999**, **12,000 deterministic conditional hidden-world allocations**; **0** new complete model rounds/deals and **0** new forced strategic continuations; no strategy comparison.
- **Exact fixture:** synthetic seat 2 opens 1-1, draws a **known** 3-6, plays 1-2; seat 0 opens 2-2; seat 1 passes. The earlier posterior had **5,005** compatible partitions. Fixing the actually known draw to seat 2 leaves **2,002** partitions. Exact seat-1 ownership of 0-6 changes from **60%** to **9/14 = 64.2857%**.
- **Sample:** seat 1 held 0-6 in **7,738/12,000 = 64.4833%**, z=**+0.452** versus exact 64.2857%; **1,996** distinct seat-1 allocations; 28-tile conservation and known draw owner checked every sample.
- **Validation:** V8 CommonJS-compatible regression passed with **13** negative guards (including 3 new retrospective/ownership cases), 100 deterministic replay seeds, mixed/multi-double and late-arrival diagnostics. Node CLI **not** executed.
- **Finding:** known private draw identities must condition the hidden-world posterior; otherwise the uncertainty and move probabilities are biased. This is a correctness fix, **not a confirmed gameplay advantage**.
- **Limitations:** synthetic trace only; a public draw does not reveal the drawn tile; provisional branch unlock and blocked winner/tie, loneZero, bust and 101-match scoring remain unresolved. No human-game winning tactic.
- **Cumulative:** **1,380,975** full model-rounds across incompatible branch assumptions, **1,898,856** forced hidden-world continuations (both unchanged); **403,000** separate hidden-world allocations (391,000 + 12,000). Historical 4,000 excluded.
- **Reproduce:** `node qosha-research/simulator/public-history-replay.js test`; exact known-draw fixture in `test()`; raw results `runs/2026-10-28-0352-known-draw-audit-2054000-2065999.json`. New seeded audit was executed in a V8 CommonJS harness; Node CLI audit runner is not persisted.
- **Exact next hypothesis/action:** authenticate a real public move/pass trace with late arrival at a previously doubled number, then confirm block-tie scoring before strategy comparisons.

Scoreboard/PWA and GitHub Actions untouched.
