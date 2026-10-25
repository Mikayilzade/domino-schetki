# Qoşa research status

Updated: 2026-10-25 22:57:33 +04 (Asia/Baku)

## Verified cumulative scale
- **926535** complete full-round discovery/tournament continuations.
- **1302832** forced matched hidden-world continuations; historical 4,000 separate.
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0`, primary 3×9; number-lock/four-branch semantics **PROVISIONAL**.
- Latest fresh unique seed window **1554940..1555339** (400 deals, same seeds across four discovery policies). Next fresh seed **>=1555340**.

## Latest checkpoint
- New `simulator/connector-six-late-policy-enrichment.js`, deterministic matched-seed min-pips, moderate-double-hold, closed-branch-control and experimental six-pair-hold; V8 CommonJS fixture/replay green, Node CLI not executed. Scoreboard/PWA untouched.
- **4800 full trajectories**, 4680 finishes, 120 blocks, 0 unresolved. **145 late 6-6 legal pair positions**, 1740 matched worlds, **6960 forced continuations**. Data: [late 6-6 policy enrichment](runs/2026-10-25-2253-six-late-policy-enrichment-1554940.json).
- Positions by discovery policy: **min-hand-pips=0, moderate-double-hold=1, closed-branch-control=1, six-pair-hold=143**. Six-pair-hold avoids all 6-containing legal moves while hand >3 if another legal move exists; it is an enrichment policy, NOT proven advice. Next opponent 2/3/4: 59/46/38.
- Exploratory double-minus-connector focal finish-first delta: -23.28 / -29.60 pp under two continuation bots; different discarded/retained tiles confound opening mechanism. Authentic branch geometry, block winner/loneZero/bust/101 scoring unvalidated.

## NEXT ACTION
- Fresh seeds >=1555340: independent holdout of six-pair-hold, >=30 distinct deal clusters per next-opponent 2/3/4 stratum, separate policy win-rate comparison and real branch-lock/block-winner fixtures.
