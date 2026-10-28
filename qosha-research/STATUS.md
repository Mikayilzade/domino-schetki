# Qoşa research status

Updated: 2026-10-28 05:55:00 +04:00 (Asia/Baku)

## Verified cumulative
- **1,380,975** complete model-rounds across incompatible branch assumptions (workload only); historical 4,000 separate.
- **1,898,856** forced hidden-world continuations; **14,082** next-pass labels; **4,900** known-world diagnostics (unchanged).
- **60,000** random opening deals; **6,906,900** exact 9-stone hands enumerated previously.
- **439,000** separate synthetic hidden-world allocations: 415,000 prior + **24,000** new conditional worlds across two incompatible provisional branch models (12,000 per model). These are NOT full strategy rounds.
- Engine `qosa-research-0.5.3 + branch-pass-ablation-1.0`; recovered `qosa-1.0.0`. Authentic late-arrival branch unlock, blocked winner/ties, loneZero/bust and 101 scoring UNVALIDATED.
- Last seeds **2078000..2089999**; next fresh **>=2090000**.

## Latest checkpoint
- Same synthetic public history and observed seat-2 pass; 3,432 possible hidden allocations before pass constraints.
- Exact compatible allocations: **120 global-ever-open** versus **330 all-current-only**. Under global model, seat 1 must hold 2-6; under all-current-only, its conditional probability is **4/11 = 36.36%**.
- **24,000** seeded conditional worlds: global 12,000/12,000 seat-1 2-6; all-current 4,361/12,000 (36.342%). 100 deterministic replay checks per model, independent exhaustive counts, conservation passed in V8 CommonJS harness; Node CLI not run.
- **No confirmed winning tactic**: both branch models provisional; the difference demonstrates why pass-based ownership deductions must wait for authenticated branch legality.
- Code: `qosha-research/simulator/branch-pass-ablation.js`; raw data: `qosha-research/runs/2026-10-28-0554-branch-pass-ablation-2078000-2089999.json`.
- Scoreboard/PWA and GitHub Actions untouched.

## NEXT ACTION
- Authenticate a real late-arrival branch example (a different side reaches N after N-N was played; can a non-double extend it?), then resolve blocked-round ties and resume matched strategy comparisons only under validated legal moves.
