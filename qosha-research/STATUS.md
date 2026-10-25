# Qoşa research status

Updated: 2026-10-25 21:57 +04 (Asia/Baku)

## Verified cumulative scale
- **921,735** complete full-round discovery/tournament continuations.
- **1,295,872** forced matched hidden-world counterfactual continuations; historical 4,000 separate.
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0`; primary 3×9; number-lock/four-branch semantics **PROVISIONAL**.
- Latest disjoint seed window **1550940..1554939** (4,000 deals). Next fresh seed **>=1554940**.

## Latest checkpoint
- New `simulator/connector-six-late-runner.js`: targeted reachable 6-6 vs same-X connector positions with next opponent exactly 2–4 stones; explicit gate/selection accounting, no synthetic hands. V8 CommonJS fixture/replay green; Node CLI not run.
- **4,000 distinct deals, 12,000 full trajectories** (11,628 finishes, 372 blocks, 0 unresolved); **4 eligible late positions** from 4 distinct seeds, **64 pass-consistent hidden worlds**, **256 forced continuations**. Data: [2026-10-25 21:57 targeted late 6-6](runs/2026-10-25-2155-six-late-1550940.json).
- **Main methodological finding:** in min-hand-pips discovery, 6-6 was held on only 2 of 16,727 focal late-turn observations and yielded **0 legal same-X connector pairs**; closed-branch-control: 41/16,971 late-turn observations held 6-6, with 4 legal pairs. These are turn-level counts, not independent game samples. This explains the late-game sampling bottleneck under current bots.
- With n=4, double-minus-connector focal finish-first estimates −1.56 / −12.50 pp for min-pips / closed-branch continuation, exploratory uncertainty far too large for a reliable late-game claim. Next opponent playable count +1.672; no human advice. Provisional geometry, changed retained tiles/pips, no block winner/loneZero/bust/101-point validation.
- Source, raw data, RESULTS checkpoint saved; live scoreboard/PWA untouched.

## NEXT ACTION
- On **fresh seeds >=1554940**, preregister and test a legal `moderate-double-hold` discovery-policy enrichment of *late* 6-6 positions, with independent deal clusters and explicit eligibility rates; seek >=30 late positions before making tactical claims. Independently validate real four-branch locked/open and block-winner rules; execute Node CLI tests when available.
