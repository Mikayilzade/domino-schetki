# Qoşa research status

Updated: 2026-10-28 01:49:18 +04:00 (Asia/Baku)

## Verified cumulative
- **1,380,975** full model-rounds across incompatible branch assumptions (workload only); historical 4,000 separate.
- **1,898,856** forced hidden-world continuations, **14,082** next-pass labels, **4,900** known-world diagnostics (unchanged).
- **60,000** random opening deals; **6,906,900** exact 9-stone hands enumerated (previous).
- **379,000** synthetic hidden-world allocations: 355,000 opening + 12,000 prior midgame + **12,000 new pass-evidence audit**; NOT model rounds.
- Engine `qosa-research-0.5.3 + pass-evidence-audit-1.0`; recovered `qosa-1.0.0`. Branch unlock, block winner/ties and 101 scoring UNVALIDATED.
- Last seed range **2030000..2041999**; next fresh >=**2042000**.

## Latest checkpoint
- **Important qualification of previous result:** prior synthetic pass masks forbidding every 2-X/6-X tile cannot be derived as authentic legal masks under the provisional global-ever-open model without publicly played 2-2/6-6. Previous 21/24,310 is still an exact *hypothetical-mask* count, not a real-match deduction.
- Added `simulator/pass-evidence-audit.js`: derive no-stock pass exclusions from explicit pass-time ends and opened-number double evidence; reject missing doubles, stock, intervening acquisition and unsupported provenance. Still **not** a full chronological replay.
- New internally consistent synthetic snapshot: exact **5,005/24,310** hidden allocations; **12,000** seeded samples; 3-6 held by passing seat **59.70%** vs exact **60%**, z=−0.671. Seven invalid-evidence guards and 100 seed replay checks passed in V8 CommonJS-compatible execution (Node CLI not run).
- Data `runs/2026-10-28-0149-pass-evidence-audit.md`; **no reliable new winning tactic**.
- Scoreboard/PWA and GitHub Actions untouched.

## NEXT ACTION
- Chronologically replay public moves, draws and passes to validate pass-time legal ends and the absence of later acquisition; authenticate late-arrival branch unlock and blocked tie scoring before tactical recommendations.
