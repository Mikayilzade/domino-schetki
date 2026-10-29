# Qoşa research status

Updated: 2026-10-29T16:50:13+04:00 (Asia/Baku)

## Verified cumulative (incompatible models kept separate)
- **1,380,975** complete model rounds across incompatible branch assumptions; historical 4,000 separate (unchanged).
- **1,898,856** forced hidden-world continuations; **14,082** next-pass labels; **4,900** known-world diagnostics (unchanged).
- **570,000** separate deterministic opening deals (prior 550,000 + 20,000 holdout).
- **775,568** separate synthetic seeded hidden-world allocations (**756,368 + 19,200**); exact partitions not counted as seeded worlds.
- Engine `qosa-research-0.5.3 + opening-pip-margin-holdout-1.0` (analysis only); recovered `qosa-1.0.0` 3×9. Both late-arrival branch models **PROVISIONAL**.
- Next unused random seed **>=2924520**.

## Latest checkpoint — exact third-turn return mobility (16:50 +04)
- [Executable source](simulator/opening-third-return-exact.js); [detailed checkpoint](runs/2026-10-29-1650-opening-third-return-exact.md).
- Reused 24 balanced starter hands from 20,000 seeded opening deals; exact 1,166,880 hidden partitions, **0 new seeded deals/worlds/full rounds**.
- Keeping a matching double improved **distinct playable stones** on return by +0.761 (high-pip opponents) / +0.731 (low-pip), but changed **branch placements** by −0.332 / +0.100. Two low-policy hands reversed the legal-stone effect despite higher opponent pass probability.
- No proven win-rate benefit; both late-arrival branch models still provisional. Next: physical late-arrival and blocked-tie rule authentication before full-game claims.

## Earlier checkpoint — exact one-opponent-turn pip-margin census
- [Reproducible source](simulator/opening-first-turn-exact.js); [run checkpoint](runs/2026-10-29-1252-opening-first-turn-exact.md).
- **0 new seeded deals/hidden worlds/full rounds**; exact combinatorial analysis of **4,686,825** post-draw starter hands and **969,475** pip-conflict choices. Two independent exhaustive **48,620-world** fixture checks (97,240 partitions); no samples added to cumulative.
- With 1–2 immediate pip sacrifice, the one-turn relative pip-margin difference (retain matching X-X minus shed larger Y) is **+1.230** against high-pip opponent but **−0.872** against low-pip. With 3+ sacrifice it is **−1.068** and **−3.385**, respectively, despite a ~6 pp first-pass advantage in both groups.
- **Exact one-turn finding only**, not a full-game win tactic; both branch models provisional, blocked tie unresolved. Next: independent gap-balanced two-turn holdout and physical-rule authentication.

## Previous checkpoint — policy-mixture sensitivity (reanalysis only)
- [Executable audit](simulator/opening-policy-mixture-audit.js); [checkpoint](runs/2026-10-29-1153-opening-policy-mixture-audit.md).
- **No new deals/worlds/rounds**; the previous 30,000 deals and 19,200 worlds are reused, not counted again. Six arithmetic policy-mixture comparisons with exact branch-model consistency checks.
- Single-tile opponents: high-pip-policy share required for positive short-window margin is **9.49%** for 1–2 pip sacrifice versus **56.64%** for 3+; optional double chains **0%** versus **38.93%**. Descriptive threshold only, not a win-rate claim.
- Next: independent gap-balanced holdout and physical late-arrival/blocked-tie rule authentication.

## Previous checkpoint — opponent pip margin versus opening double retention
- [Executable source](simulator/opening-pip-margin-holdout.js); [detailed checkpoint](runs/2026-10-29-1053-opening-pip-margin-holdout.md); [raw JSON](runs/2026-10-29-1053-opening-pip-margin-holdout.json).
- Independent **30,000** opening deal seeds and **19,200** matched hidden worlds, 600 selected same-hand conflicts. No new full rounds.
- Keeping matching X-X suppresses opponent stone tempo, but relative remaining-pip margin is **policy-dependent**: high-single **+3.56**, high-chain **+4.76**, low-single **−1.81**, low-chain **−0.97**, seeded-random single **−0.60**, random chain **+0.07** (95% exploratory interval crosses zero), all owned minus higher-pip choice.
- Both provisional branch models agree in this two-turn window; **no confirmed real-game win-rate or universal strategy**. Pip/geometry confounded; selected positions and simple bots.

## Previous checkpoint — opening cost matched
- [2026-10-29 09:48](runs/2026-10-29-0947-opening-cost-matched.md): 30,000 opening deals + 7,680 seeded worlds, mean immediate pip sacrifice 2.746; opponent stone tempo reduced 0.10–0.28 over two turns. Cumulative after prior run 756,368 seeded worlds and 520,000 opening deals.

## Earlier checkpoints
- [Exact repeated opening pass locks](simulator/opening-lock-depth-exact.js): 875/245/20 of 4,686,825 post-draw starter hands guarantee at least 2/4/6 opponent passes respectively, under a very rare confirmed opening configuration; not win-rate evidence.
- [Chronological pass posterior](runs/2026-10-29-0452-branch-order-posterior.md): same board snapshot but different histories can imply 100% versus 36.36% tile ownership in an explicit **provisional** branch model.
- [Four-model blocked-tie audit](runs/2026-10-27-1951-branch-tie-probe.md): tied minima occur in synthetic blocked rounds, but the actual winner/tie convention is unconfirmed.

## NEXT ACTION
Authenticate physical late-arrival branch reopening and blocked-tie scoring. Then compare same-hand moves on fixed visible histories and matched hidden worlds with first-finish, minus and regret metrics. Do not promote two-turn pip-margin effects into a general win tactic.
