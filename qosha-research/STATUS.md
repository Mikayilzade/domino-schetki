# Qoşa research status

Updated: 2026-10-28 02:58:10 +04:00 (Asia/Baku)

## Verified cumulative
- **1,380,975** full model-rounds across incompatible branch assumptions (workload only); historical 4,000 separate.
- **1,898,856** forced hidden-world continuations, **14,082** next-pass labels, **4,900** known-world diagnostics (unchanged).
- **60,000** random opening deals; **6,906,900** exact 9-stone hands enumerated (previous).
- **391,000** synthetic hidden-world allocations: 379,000 prior + **12,000 new chronological-replay posterior worlds**; NOT model rounds.
- Engine `qosa-research-0.5.3 + public-history-replay-1.0`; recovered `qosa-1.0.0`. Branch unlock, block winner/ties and 101 scoring UNVALIDATED.
- Last seed range **2042000..2053999**; next fresh >=**2054000**.

## Latest checkpoint
- `simulator/public-history-replay.js` reconstructs public 1-1 opening/draw, played tiles, branch ends, opened doubles, turn order, passes and pass-time legal masks from events. No caller-supplied board/pass mask is trusted.
- Synthetic 1-1/draw/1-2/2-2/pass yields **10 excluded tiles** and exact **5,005/24,310** hidden partitions. **12,000** fresh seeded worlds: seat 1 owns 3-6 in **59.475%** versus exact **60%** (z=−1.174).
- Synthetic late arrival: a left branch reaches 2 *after* 2-2 opened on up; subsequent 2-4 is legal in provisional global-ever-open but locked under all-current-only. Authentic legality unknown.
- V8 CommonJS-compatible tests passed: **10** negative guards, forced opening pass, multi-double, **100** deterministic seed replays, 28-tile conservation and exact partition calibration. Node CLI not run. **No reliable winning tactic.**
- Data `qosha-research/runs/2026-10-28-0257-public-history-replay.md` and `qosha-research/runs/2026-10-28-0257-public-history-replay-2042000-2053999.json`.
- Scoreboard/PWA and GitHub Actions untouched.

## NEXT ACTION
- Validate an authentic chronological public game trace, especially late arrival at a previously doubled number, and authenticate blocked-round tie scoring before tactical advice.
