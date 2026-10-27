# Qoşa research status

Updated: 2026-10-27 11:53:48 +04 (Asia/Baku)

## Verified cumulative scale
- **1,248,975** complete rounds; historical 4,000 separate.
- **1,898,856** matched forced hidden-world continuations (unchanged).
- **4,900** separate known-world diagnostics; **7,558** immediate next-opponent pass labels.
- Engine qosa-research-0.5.3 / recovered qosa-1.0.0 3×9; four-side number-lock **PROVISIONAL**.
- Latest disjoint fresh seeds 1587940..1590339; next >=1590340.

## Latest checkpoint
- 2,400 deals, 14,400 complete baseline rounds, 912 selected positions, 1,824 next-pass labels, 87,552 sampled hidden allocations (96/position); 0 new forced full continuations.
- Earlier chosen opponent tile groups reconstructed from public play history; explicit softmax likelihood with 10% lapse, last 3 opponent choices, **known synthetic opponent profiles** (oracle assumption).
- Non-certain 366 labels / 269 clusters: exact pass-only Brier **0.08939** vs choice-weighted **0.07068**; cluster gain **0.02044 ± 0.01038** exploratory 95% half-width.
- Disjoint cohort gains **0.01734 ± 0.01190** and **0.02370 ± 0.01728**. BOTH-pass non-certain only 4 labels / 3 positions; no conclusion.
- 7-check deterministic V8 CommonJS replay passed; Node CLI not run. No confirmed real-game tactic; no changes to scoreboard/PWA.
- Source: `qosha-research/simulator/pass-choice-posterior.js`; raw data: `runs/2026-10-27-1152-choice-posterior-1587940.json`, `runs/2026-10-27-1153-choice-posterior-1589140.json`.

## NEXT ACTION
- Fresh seeds >=1590340: compare **profile-blind** choice mixture to pass-only with non-certain holdout, oversample BOTH-pass without hidden-hand peeking; authenticate branch locking and blocked winner.
