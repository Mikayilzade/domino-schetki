# Conditional linked-double inventory by remaining double count — 2026-11-16 19:56 Asia/Baku

- Rules: recovered `qosa-1.0.0` opening, 3 players × 9 tiles, 1 stock. Reference gameplay engine `qosha-research-0.5.3`; **independent exact combinatorics only**, no gameplay-engine validation.
- Deals simulated: **0**; seeds: none (complete weighted enumeration); strategies: none; hidden-world samples: 0. Full gameplay gate: **0/17 executed**; hidden-world gate: **0/4 executed**. Historical 180,000 matched-seat rounds are a separate legacy subtotal.
- Conditioning: starter initially owns 1-1, plays it, draws mandatory stock, and then has a uniformly random 9-tile subset of the other 27. Let `D` be the number of the other six doubles in those nine tiles. Let `L` count disjoint linked pairs `(1-x, x-x)` for x in {0,2,3,4,5,6}. This is **tile inventory**, not a claim that those stones can be played sequentially.
- Exact algorithm: enumerate all 2^12=4096 masks for the six 2-tile pairs, weight each by `C(15, 9-popcount(mask))`, group by `D` and `L`. Cross-check each stratum total against `C(6,D)*C(21,9-D)`; all seven strata matched exactly. Total weight `C(27,9)=4,686,825`.

| Other doubles D | Weighted hands | P(L≥1 given D) | P(L≥2 given D) | E[L given D] |
|---:|---:|---:|---:|---:|
| 0 | 293930 | 0% | 0% | 0 |
| 1 | 1220940 | 38.095238% | 0% | 0.380952 |
| 2 | 1744200 | 56.666667% | 10.000000% | 0.666667 |
| 3 | 1085280 | 65.789474% | 18.421053% | 0.857143 |
| 4 | 305235 | 69.590643% | 22.807018% | 0.952381 |
| 5 | 35910 | 69.590643% | 22.807018% | 0.952381 |
| 6 | 1330 | 65.789474% | 18.421053% | 0.857143 |

**New exact finding:** more remaining doubles do **not** monotonically increase the chance of linked pairs. It peaks at D=4–5 (69.59% for at least one pair) and falls at D=6 (65.79%), because the nine-tile hand has fewer available slots for connecting 1-x tiles. For D=2, 56.67% have at least one pair. This refines the unconditional 51.330698% opening-inventory baseline; it does **not** establish any move advantage.

**Confidence:** exact under uniform dealing and the confirmed mandatory opening draw. Branch unlock, block allocation, loneZero=10, move legality and opponent effects are not involved and remain unvalidated. No win rate, remainder, round length, block, minus, branch-effect or regret metrics measured. Direct executable checkout retry failed with `Could not resolve host: github.com`.

**Exact next action:** recover complete single-commit research-only simulator checkout, verify Git blob SHAs, run preflight + 17 gameplay and 4 hidden-world suites and fingerprint replays, archive outputs; then compare linked-double retention by D on matched seeds, controlling starter status and branch state. Do not alter scoreboard/PWA or create GitHub Actions.
