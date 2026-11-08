# Exact opening-double confounding audit — 2026-11-08 04:47 Asia/Baku

- Engine reference: `qosha-research-0.5.3`; rules reference: recovered `qosa-1.0.0`, primary 3 players × 9 stones + one stock.
- Method: exact hypergeometric combinatorics; **0 simulated deals**, no seed range, no strategies, no validation suites executed in this checkpoint. This is an invariant of uniformly shuffled 28-tile allocations, independent of branch, block, and minus interpretation.
- Cohort A: `1-1` is in starter's initial nine stones. Starter has exactly `1 + Hypergeometric(N=27,K=6,n=8)` doubles; expectation `1 + 48/27 = 2.77777778`.
- Cohort B: another player owns `1-1`; focal nonstarter's initial nine stones exclude it. Focal has `Hypergeometric(N=27,K=6,n=9)` doubles; expectation `54/27 = 2.00000000`.
- Exact initial-hand distribution P(D=k), k=0..7:
  - starter A: [0, 0.0916590656, 0.3142596534, 0.3666362623, 0.1833181311, 0.0404378230, 0.0035944732, 0.0000945914].
  - nonstarter B: [0.0627140975, 0.2605047127, 0.3721495895, 0.2315597446, 0.0651261782, 0.0076619033, 0.0002837742, 0].
- P(initial doubles >= 3): **59.4081%** starter A vs **30.4632%** nonstarter B, +28.9450 percentage points. P(D>=4): 22.7445% vs 7.3072%.
- **New useful finding:** raw associations between starting with ≥3 doubles and finish/minus success are strongly confounded by ownership of mandatory `1-1` and the opening privilege; a naive pooled comparison cannot identify double-retention benefit. The difference is exact for initial allocations, **not** an estimate of any strategy's win probability.
- Important exclusion: when `1-1` is in stock in a later round, previous winner starts; their initial nine tiles have no `1-1`, so the starter-A formula does **not** apply. When `1-1` is stock in the first round, redeal occurs. Also, starter's compulsory stock draw changes post-opening hand size/double count. Do not mix pre-opening and post-draw distributions.
- Confidence: exact combinatorial result conditional on uniform deals; not a PRNG audit, not a physical-rule authentication, and not a validation-gate pass.
- Cumulative context: historical 180,000 matched-seat strategy rounds are a separate subtotal, not the total across later cohorts. New strategy sample here: 0. Win/first-place, pips, turns, blocks, minus frequencies, branch effects and regret: not measured.
- **Next action:** once an executable checkout is available, run checkout preflight + fingerprint replay + all 17 validation suites; archive actual JSON. Then on matched seeds 30000..39999 stratify double-related finish/minus contrasts by `1-1` initial location (starter hand / opponent hand / stock), seat rotation and pre/post draw hand, with seed-clustered uncertainty. Do not promote a double strategy from pooled outcomes. No live PWA files or GitHub Actions modified.
