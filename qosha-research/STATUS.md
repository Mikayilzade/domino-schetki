# Qoşa research status

Updated: 2026-10-27 13:59:14 +04 (Asia/Baku)

## Verified cumulative scale
- **1,292,175** complete rounds; historical 4,000 separate.
- **1,898,856** matched forced hidden-world continuations (unchanged).
- **4,900** separate known-world diagnostics; **12,534** immediate next-opponent pass labels.
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0` 3×9; four-side number-lock **PROVISIONAL**.
- Fresh disjoint seeds **1593940..1595739**; next >=**1595740**.

## Latest checkpoint
- Out-of-family policy robustness: 1,800 deals / 21,600 complete rounds, 1,143 selected positions, 2,286 next-pass labels, 73,152 sampled hidden allocations (64 per position); 0 new forced full continuations.
- Four opponent mixes: random/random, tempo-open/tempo-open, anti-minus/anti-minus, random/tempo-open. Focal closed-branch-control. No hidden-hand policy leakage.
- Non-certain 312 positions / 423 labels: exact pass-only Brier **0.112781**, profile-blind 50/50 **0.112993**; position-cluster gain **+0.002218 ± 0.009891**. Independent 900-deal holdout gain **+0.002519 ± 0.015665**. **No reliable benefit** under policy mismatch; 80/20 prior also inconclusive.
- BOTH-pass non-certain 16 positions / 18 labels, inconclusive. 8-check deterministic pilot, 1,056 scoring assertions, synthetic four-branch −40 regression and core integration tests passed via V8; Node CLI not run.
- New code: `simulator/pass-choice-outfamily.js`; raw and pooled data: `runs/2026-10-27-1351-outfamily-*.json`. No scoreboard/PWA changes, no GitHub Actions.

## NEXT ACTION
- Fresh seeds >=1595740: test public-history mismatch guard vs exact pass-only on untouched out-of-family holdout; authenticate branch opening/locking and blocked winner.
