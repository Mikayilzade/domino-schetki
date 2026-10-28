# Qoşa research status

Updated: 2026-10-28 04:49:19 +04:00 (Asia/Baku)

## Verified cumulative
- **1,380,975** complete model-rounds across incompatible branch assumptions (workload only); historical 4,000 separate.
- **1,898,856** forced hidden-world continuations; **14,082** next-pass labels; **4,900** known-world diagnostics (unchanged).
- **60,000** random opening deals; **6,906,900** exact 9-stone hands enumerated previously.
- **415,000** separate synthetic hidden-world allocations: 403,000 prior + **12,000** new paired stock-opening audit worlds. The 12,000 paired equivalence checks are NOT additional independent allocations.
- Engine `qosa-research-0.5.3 + public-history-replay-1.2`; recovered `qosa-1.0.0`. Branch unlock, blocked winner/ties and 101 scoring UNVALIDATED.
- Last seeds **2066000..2077999**; next fresh >=**2078000**.

## Latest checkpoint
- Chronological replay distinguishes confirmed 1-1 in starter's hand (draw replacement) from later-round 1-1 in stock (previous winner plays without replacement draw).
- Both opening modes yield the same exact **5,005** conditional hidden partitions when their public post-opening states match.
- **12,000** deterministic paired worlds: seat-1 3-6 probability 59.858% vs exact 60%, z=-0.317; paired worlds matched 12,000/12,000.
- V8 CommonJS tests passed with **18** negative guards and deterministic replay. Node CLI not run. **No confirmed winning tactic.**
- Data `qosha-research/runs/2026-10-28-0448-stock-opening-audit.md` and `qosha-research/runs/2026-10-28-0448-stock-opening-2066000-2077999.json`.
- Scoreboard/PWA and GitHub Actions untouched.

## NEXT ACTION
- Authenticate a real late-arrival branch and block-tie scoring fixture; then resume matched double-connector tactics only under validated legal rules.
