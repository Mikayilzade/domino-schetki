# Qoşa research status

Updated: 2026-10-28T06:48:03+04:00 (Asia/Baku)

## Verified cumulative
- **1,380,975** complete model-rounds across incompatible branch assumptions (workload only); historical 4,000 separate.
- **1,898,856** forced hidden-world continuations; **14,082** next-pass labels; **4,900** known-world diagnostics (unchanged).
- **60,000** random opening deals; **6,906,900** exact 9-stone hands enumerated previously.
- **459,000** separate synthetic hidden-world allocations (439,000 prior + **20,000** new, 10,000 per provisional branch model). Not full rounds.
- Engine `qosa-research-0.5.3 + branch-robust-pass-audit-1.0`; recovered `qosa-1.0.0`.
- Authentic late-arrival branch unlock, blocked winner/ties, loneZero/bust and 101 scoring **UNVALIDATED**.
- Last seeds **2090000..2099999** used for both models; next fresh **>=2100000**.

## Latest checkpoint
- Exact 3,432 assignments: global-ever-open **120** pass-compatible, all-current-only **330**, overlap **120**. Conditional posterior total-variation distance **63.636%**.
- **Robust forced seat-1 tiles** in this synthetic pass position: `1-5`, `1-6`, `4-4` under both models. Seat-1 `2-6` probability is **36.36%–100%**, not a safe certainty.
- **20,000** new seeded hidden worlds; all 14 tile marginals calibrated (<5σ), 120 deterministic replay checks per model. V8 CommonJS harness executed; Node CLI not run.
- **No confirmed winning tactic**. Data: `runs/2026-10-28-branch-robust-2090000-2099999.json`. Code: `simulator/branch-robust-pass-audit.js`.
- Scoreboard/PWA and GitHub Actions untouched.

## NEXT ACTION
- Authenticate late-arrival branch unlocking with physical-game evidence; then compare double/connector actions that are legal under both models.
