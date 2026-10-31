# 2026-10-31T16:54:55+04:00 — alternate branch-side chronology paired holdout

- **Engine/rules:** `qosa-research-0.5.3 + late-return-alt-prefix-paired/v1`; recovered `qosa-1.0.0`, 3×9 plus one stock. Both late-arrival branch interpretations (`global-ever-open`, `all-current-only`) remain **PROVISIONAL**.
- **Chronological prefix:** same fixed tile sequence as the prior nine-event fixture, but `1-3` is placed on the right rather than left, and `1-4` on the left rather than right. The scripted seat-2 pass remains forced. This is an alternate reachable branch-side history, not a new naturally sampled public-game trace.
- **Workload/seeds:** **2,048 NEW seeded conditional hidden allocations**, development `3400264..3401287` and disjoint holdout `3401288..3402311` (1,024 each). **0 new opening deals, 0 complete rounds, 0 full-game continuations.**
- **Paired design:** each allocation is extended through seats 1→2→0 under low-pip and high-pip common-legal-action policies. Candidate placements are kept only if ordinary moves are legal in both branch models and both extension histories. Each candidate is evaluated under 2 models × 4 reply styles (`low`, `high`, `double-first`, `double-last`) × 2 stopping policies (`single`, `greedy`) for each extension: **32 two-opponent continuations per candidate**.

## Results

| Cohort | Eligible worlds | Candidate comparisons | Continuations | Low-only safe | High-only safe | Both safe | Neither safe | Worlds with any flip |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Development | 59 | 125 | 4,000 | 7 | 36 | 42 | 40 | 25 |
| Disjoint holdout | 52 | 112 | 3,584 | 18 | 20 | 43 | 31 | 23 |
| Combined | 111 | 237 | 7,584 | 25 | 56 | 85 | 71 | 48 |

- **Paired safety reversal:** `81/237 = 34.18%` of common-candidate comparisons changed robust forced-return-pass safety between the low and high extension histories. The disjoint cohorts are descriptively consistent: `43/125 = 34.4%` and `38/112 = 33.9%`. At world level, `48/111 = 43.24%` of eligible worlds had at least one candidate reversal.
- **Comparison with the previous branch chronology:** its result was `127/303 = 41.9%`; this alternate side history gives `34.2%`. The gap is a useful warning that branch geometry/history changes the conditional effect; it is **not** a significance test because candidate rows are selected and correlated within worlds.
- **Selection:** of 2,048 allocations, 815 failed the paired extension gate and 1,122 failed the >=2-common-candidate gate; only 111 worlds contributed. The common-candidate sample is deliberately selected, not natural-game prevalence.
- **Validation:** committed-source dependencies were fetched from GitHub and the new script was executed in a V8 CommonJS-compatible harness. All 2,048 worlds passed chronological legality, forced-pass, 28-tile conservation, cross-model hand identity and cohort accounting; first 16 seeds in each cohort replayed deterministically. The previous 15:53 development/holdout totals were also independently replayed from GitHub source and matched. **A clean-checkout Node 22 CLI run remains unavailable in this runtime.**
- **Finding/confidence:** high confidence in deterministic conditional bookkeeping; low external validity for human play. No verified winning tactic, full-round win rate, final-pip, minus, block or decision-regret inference. Physical branch reopening and blocked-tie scoring remain unresolved.
- **Cumulative populations kept separate:** **1,380,975** incompatible-model complete rounds unchanged; **1,898,856** full-game forced continuations unchanged; **630,000** opening deals unchanged; **1,193,360** seeded hidden allocations (`1,191,312 + 2,048`). Historical 4,000 rounds remain separate. Next unused seed **>=3402312**.
- **Reproduce:** `node qosha-research/simulator/late-return-alt-prefix-paired.js test`; `node qosha-research/simulator/late-return-alt-prefix-paired.js 3400264 1024`; `node qosha-research/simulator/late-return-alt-prefix-paired.js 3401288 1024`.
- **Exact next hypothesis/action:** repeat this paired comparison on a **different tile-sequence prefix** or an authenticated logged forced-pass history, preserving the same hidden world across candidate moves. Prioritize physical late-arrival branch-unlocking and blocked-tie rulings before full-game win/minus/regret claims.

## Run data (JSON)

```json
{
  "timestamp": "2026-10-31T16:54:55+04:00",
  "engine": "qosa-research-0.5.3 + late-return-alt-prefix-paired/v1",
  "rules": "recovered qosa-1.0.0 3x9; both branch models provisional",
  "seedRanges": {
    "development": [3400264, 3401287],
    "holdout": [3401288, 3402311]
  },
  "worlds": 2048,
  "eligibleWorlds": 111,
  "candidateComparisons": 237,
  "twoOpponentContinuations": 7584,
  "safety": {
    "lowOnly": 25,
    "highOnly": 56,
    "bothSafe": 85,
    "neitherSafe": 71,
    "worldsWithAnyFlip": 48
  },
  "newOpeningDeals": 0,
  "newCompleteRounds": 0,
  "newFullGameContinuations": 0,
  "nextSeed": 3402312
}
```
