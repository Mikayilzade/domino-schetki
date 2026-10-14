# Independent matched-K replication — 2026-10-14 10:55 Asia/Baku

- Engine: `qosa-research-0.5.3`; rules: recovered `qosa-1.0.0`; mode: 3 players × 9 stones.
- Runner: `qosha-research/simulator/matched-k-outcome-runner.js`, unmodified. V8 CommonJS deterministic `test()` passed (fixture 3603084); Node CLI not run.
- Call: `run(3630000,3650000,40,25)`. Scanned 7,579 deals; 40 selected positions. Seeds: 3630187,3630225,3630427,3630690,3630831,3631001,3631024,3631279,3631481,3631505,3631757,3632224,3632353,3632534,3633124,3633137,3633420,3633584,3633718,3634046,3634658,3634687,3634953,3635042,3635270,3635292,3635396,3635546,3635624,3635642,3635648,3635731,3635813,3635867,3636152,3636376,3636951,3637009,3637109,3637578.
- New: **1,000 hidden allocations**, 895 distinct within positions; **6,000 completed paired candidate continuations**, 0 unresolved. **0 new full strategy rounds**; validated cumulative full-round baseline **180,000** (historical 4,000 separate).
- Compare single/retain-double vs one-double opening: equal discarded pips, hand size and K distinct unknown playable stones; same position, hidden allocation, and continuation policy. Hidden seed `(1500000000 + Math.imul(dealSeed,73) + worldIndex) >>> 0`.

| Bot policy | Finish-first delta | Exploratory 95% position CI | Focal remainder delta | Minus-finish delta | Position signs (+/−/tie) |
|---|---:|---:|---:|---:|---:|
| closed-branch-control | **+15.0 pp** | +7.78..+22.22 pp | −0.763 pips | +5.8 pp | 26/9/5 |
| min-hand-pips | **+11.5 pp** | +4.55..+18.45 pp | −0.783 pips | −1.0 pp | 24/10/6 |
| fast-doubles | +2.9 pp | −4.09..+9.89 pp | +0.060 pips | 0.0 pp | 15/17/8 |

Next clockwise opponent: fewer legal placements after single in 700/1000 worlds, after double in 143/1000, equal in 157/1000. 49 play/pass flips, 948 both-play, 3 both-pass. Mean placements after single 2.679 vs double 4.299 (these count action placements, not distinct playable stone identities).

**New finding:** disjoint-seed replication supports a positive single/retain-double effect under branch-control and min-pips continuation, but **not reliably under fast-doubles**. Do not generalize prior +14 pp as universal. Restricting opponent action count and retaining a double are still confounded by post-action geometry and playable identities.

**Confidence/limits:** model-specific, exploratory, selected first-eligible positions, same closed-branch discovery policy as previous cohort, sampled uniform hidden worlds with replacement, no prior-opponent-decision posterior, assumed branch opening, no block winner. Intervals cluster by position but are not preregistered. The historical 180,000 complete rounds are not merged with hidden-world continuations.

**Exact next action:** replicate with a different `min-hand-pips` discovery policy on fresh seeds, and stratify saved cohorts by exact playable-stone overlap and opponent action-count difference without treating post-action mobility as randomized. Reproduce using `node qosha-research/simulator/matched-k-outcome-runner.js test` and `node qosha-research/simulator/matched-k-outcome-runner.js 3630000 3650000 40 25`.
