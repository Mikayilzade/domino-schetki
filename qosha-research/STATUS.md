# Qoşa research status

Updated: 2026-10-28 03:52:56 +04:00 (Asia/Baku)

## Verified cumulative
- **1,380,975** full model-rounds across incompatible branch assumptions (workload only); historical 4,000 separate.
- **1,898,856** forced hidden-world continuations, **14,082** next-pass labels, **4,900** known-world diagnostics (unchanged).
- **60,000** random opening deals; **6,906,900** exact 9-stone hands enumerated (previous).
- **403,000** separate synthetic hidden-world allocations: 391,000 prior + **12,000 known-draw-conditioned** this run; NOT model rounds.
- Engine `qosa-research-0.5.3 + public-history-replay-1.1`; recovered `qosa-1.0.0`. Branch unlock, block winner/ties and 101 scoring UNVALIDATED.
- Last seed range **2054000..2065999**; next fresh >=**2066000**.

## Latest checkpoint
- Chronological replay now rejects a final known focal hand contradicting an earlier no-acquisition pass.
- Explicitly known opening draw 3-6 stays with seat 2 in posterior; 5,005 → **2,002** exact conditional partitions. No inference from unspecified public draws.
- 12,000 deterministic seeded worlds: seat 1 owns 0-6 in **64.4833%**, exact **64.2857%** (z=+0.452); 1,996 distinct seat-1 hands.
- V8 CommonJS-compatible tests passed: **13** negative guards, 100 deterministic replays, conservation, multi-double, late-arrival diagnostic. Node CLI not run. **No reliable winning tactic.**
- Data `qosha-research/runs/2026-10-28-0352-known-draw-audit.md` and `qosha-research/runs/2026-10-28-0352-known-draw-audit-2054000-2065999.json`.
- Scoreboard/PWA and GitHub Actions untouched.

## NEXT ACTION
- Validate an authentic chronological public game trace, especially late arrival at a previously doubled number, and authenticate blocked-round tie scoring before tactical advice.
