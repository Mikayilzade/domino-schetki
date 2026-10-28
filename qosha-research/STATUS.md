# Qoşa research status

Updated: 2026-10-28T08:50:09+04:00 (Asia/Baku)

## Verified cumulative
- **1,380,975** complete model-rounds across incompatible branch assumptions (workload only); historical 4,000 separate.
- **1,898,856** forced hidden-world continuations; **14,082** next-pass labels; **4,900** known-world diagnostics (unchanged).
- **60,000** prior random opening deals + **60,000** new deterministic opening deals (separate from model-rounds).
- **499,000** separate synthetic hidden-world allocations (**479,000** previous + **20,000** new); not complete rounds.
- Engine `qosa-research-0.5.3 + opening-owned-double-paired-1.0`; recovered `qosa-1.0.0`.
- Authentic late-arrival branch unlock, blocked winner/ties, loneZero/bust and 101 scoring **UNVALIDATED**.
- Fresh deal seeds **2120000..2179999**, hidden allocation seeds **2180000..2199999**; next unused **>=2200000**.

## Latest checkpoint — paired owned-double opening tradeoff
- Of **57,954** valid first-round starters, **21,929** have both a 1-X with owned X-X and a 1-Y with Y-Y unseen (**37.84%** of valid starters).
- Exact mean immediate next-player pass chance on those same hands: **9.57%** with owned double vs **3.91%** with unseen double; lift **5.67 percentage points**. This is a one-ply legality effect, **not a win-rate gain**.
- Choosing the lowest-X owned candidate instead of the lowest-X unowned candidate costs **0.425** extra pips on average (signed); costs more in **55.37%** of paired hands. More pips now versus next-opponent pass is a real tradeoff.
- **20,000** matched hidden-world allocations across 1,000 dealt positions; observed next-player passes **2050** vs **855**, expected **2005.6** vs **826.0**. Maximum |z| **1.10**; no nested-pass violations.
- Independent brute enumeration of 4 dealt hands × 48,620 allocations each matched exact hypergeometric formula. 100 deterministic seed replays and 60,000 28-tile conservation checks passed in V8; Node CLI not executed.
- Raw: `runs/2026-10-28-0850-opening-owned-double-paired-2120000-2199999.json`; reproducible source `simulator/opening-owned-double-paired.js`. Scoreboard/PWA and GitHub Actions untouched.

## NEXT ACTION
- Measure whether the one-ply pass benefit survives opponent response and retained-double tempo on identical hidden worlds, keeping late-arrival branch models separate and block winners unresolved; authenticate late-arrival rule before win-rate claims.
