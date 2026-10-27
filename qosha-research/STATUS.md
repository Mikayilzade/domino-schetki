# Qoşa research status

Updated: 2026-10-27T20:53:08+04:00 (Asia/Baku)

## Verified cumulative
- Global provisional rounds **1,342,575**; one-side counterfactual **28,800**; all-current counterfactual **9,600**.
- **1,380,975** full model-rounds across incompatible assumptions (workload only); historical 4,000 separate.
- **1,898,856** forced hidden-world continuations, **14,082** next-pass labels, **4,900** known-world diagnostics (unchanged).
- **60,000 new rule-invariant opening deals**, 180,000 initial hands, 57,883 valid first-round starters. Do NOT add these deals to full model-round cumulative.
- Engine `qosa-research-0.5.3` + `opening-pattern-baseline-1.0`; recovered `qosa-1.0.0`; branch opening and blocked winner UNVALIDATED.
- Fresh seeds **1602940..1662939**; next >=**1662940**.

## Latest checkpoint
- Exact probability of a starter forced pass immediately after 1-1 + stock draw: **6.2714%**; observed **3,647/57,883 = 6.3006%**.
- At least two 1-X connectors: exact **67.6781%**, observed **67.5846%**.
- **40.4578%** of 180,000 initial 9-stone hands contain X-X,Y-Y,X-Y bridge; descriptive, not a winning tactic.
- Script `simulator/opening-pattern-baseline.js`, raw `runs/2026-10-27-opening-pattern-baseline-1602940-1662939.json`. Node CLI not run.
- Scoreboard/PWA and GitHub Actions untouched.

## NEXT ACTION
- Authenticate late-side legality and blocked-round tie convention from real traces; otherwise continue ambiguity-invariant opening/pattern work. Only rank connector-preservation strategies under validated rules.
