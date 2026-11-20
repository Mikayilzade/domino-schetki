# Exact connector allocation after forced opening pass — 2026-11-20 19:47 Asia/Baku

- Source of truth: GitHub `qosha-research/README.md`, `RULES.md`, `EXPERIMENTS.md`, `RESULTS.md`, `STATUS.md`; simulator directory inspected.
- Rules: recovered `qosa-1.0.0`; research reference `qosha-research-0.5.3`; primary 3 players × 9 tiles, one stock.
- Experiment: **exact enumeration**, not gameplay simulation. Deals simulated: **0**; Monte Carlo worlds: **0**; rollouts: **0**; seed set: **none**; strategies: **none**.
- Condition: starter owns 1-1, places it, draws the one stock tile, and cannot play an ordinary 1-x follow-up. Under the documented uniform-shuffle model, all six ordinary 1-x connectors belong to the other two players, each holding nine tiles. Remaining 12 opponent tiles are non-connectors. This conditions on the **initial mandatory follow-up pass**, not on any later opponent move.
- Let K be the number of those six connectors held by the *clockwise next opponent*. Then
  `P(K=k | forced pass) = C(6,k) C(12,9-k) / C(18,9)`, with denominator `C(18,9)=48620`.

| K | Exact allocations | Conditional probability |
|---:|---:|---:|
| 0 | 220 | 0.452489% |
| 1 | 2970 | 6.108597% |
| 2 | 11880 | 24.434389% |
| 3 | 18480 | 38.009050% |
| 4 | 11880 | 24.434389% |
| 5 | 2970 | 6.108597% |
| 6 | 220 | 0.452489% |
| **Total** | **48620** | **100%** |

- Checks: counts sum to 48620; distribution symmetric `P(K=k)=P(K=6-k)`; mean `E[K]=3`; `P(K>=1)=99.547511%`; `P(K>=2)=93.438914%`; `P(2<=K<=4)=86.877828%` (cross-checks prior result).
- **Finding:** after this rare forced opening pass, the clockwise next player has at least two ordinary 1-connectors in **93.44%** of uniform hidden allocations. This is a *hand-support* result, **not** a 93.44% chance of playing next: the actual move depends on legal branch semantics, double availability, and opponent policy. No strategy superiority is established.
- Confidence: exact for the explicitly conditioned uniform deal. Assumptions: all 18 opponent tiles allocated uniformly in labeled 9/9 hands, no further observed play/pass or policy conditioning. Branch unlocking, block winner/ties, and `loneZero=10` remain provisional and do not affect this count.
- Validation status this pass: full gameplay suites **0/17 executed**, hidden-world suites **0/4 executed**; DNS for shell GitHub access failed (`Could not resolve host: github.com`). No new first-place, remaining-pips, round-length, block, minus, doubles, branch or regret metrics. Historical 180,000 matched-seat rounds are separate legacy data.
- **Exact next action:** recover verified full research-only checkout, run preflight, 17+4 validation suites and fingerprint replays, archive actual outputs/timings, then paired-seed strategies; for real-game post-pass inference, update this prior using observed opponent actions rather than equating connector possession with a move.
- No live PWA/scoreboard or GitHub Actions files changed.
