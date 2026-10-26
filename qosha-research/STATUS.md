# Qoşa research status

Updated: 2026-10-26 19:57:08 +04 (Asia/Baku)

## Verified cumulative scale
- **1112175** complete full rounds; historical 4,000 separate.
- **1558080** forced matched hidden-world continuations.
- **4,900** separate full-known-world diagnostics.
- Engine qosa-research-0.5.3 / recovered qosa-1.0.0, 3×9; four-side number-lock **PROVISIONAL**.
- Fresh seeds **1566540..1567539**; next unused seed **>=1567540**.

## Latest checkpoint
- New `simulator/pass-aware-widechoice.js`, deterministic 12-check suite passed in V8 CommonJS; Node CLI not run. No scoreboard/PWA changes.
- **1000 unique deals**, **6000 full baseline rounds** (5819 finishes, 181 blocks, 0 unresolved), **26064** forced matched hidden-world continuations; **59** first eligible >=5-candidate both-pass positions from **37** deal clusters.
- Candidate count histogram: {"5":23,"6":19,"7":3,"8":14}. Expanded vs policy-only choice changed in **14/59** positions.
- Out-of-sample expanded-minus-policy-only finish-first: **5.35 ±4.24 pp** (exploratory deal-cluster 95% normal half-width); discovery 4.17 pp, holdout 7.53 pp. Changed-choice mean 21.73 pp (selected, NOT causal).
- Same train worlds and fresh matched held-out pass-compatible evaluation worlds for each candidate. Training 24 worlds per posterior; evaluation 24 worlds per position. Four-side locking, block winner, loneZero, bust and 101-match scoring remain unvalidated. Finish-first != match victory. No human tactical rule promoted.
- Raw run data: `runs/2026-10-26-widechoice-1566540.json`.

## NEXT ACTION
- Fresh seeds >=1567540: independently replicate targeted >=5 candidate ablation, stratify changes by alternative side vs alternative tile and opening type, seek authentic four-branch lock/open and blocked-round winner fixtures.
