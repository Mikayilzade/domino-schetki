# Qoşa açdı — 2026-10-20 20:48 Asia/Baku — matched alpha geometry (recovered local checkpoint)

**Provenance:** This is a recovery of the previous run's locally executed, GitHub-uncommitted checkpoint. Original file was `/mnt/data/qosha-research/runs/2026-10-20-2048-matched-alpha-geometry.md`. It is **not** a new run and must not be counted twice. Executed using a V8 CommonJS harness; Node CLI was not run.

- Engine/rules: `qosa-research-0.5.3` / `qosa-1.0.0`; 3 players × 9; provisional branch-opening semantics.
- Discovery seeds `1305800..1306499`; 93 deals scanned, 24 positions selected by first alpha28 one-vs-joint disagreement. 32 identical pass-conditioned hidden worlds per position, 768 hidden allocations, 8,064 candidate continuations across min-hand-pips and closed-branch-control continuation bots, zero unresolved. **0 new full strategy rounds.**
- Alpha20, 28, 36 tested on identical positions/worlds. Selection on alpha28 disagreement limits across-alpha generalization.

| Bot | Alpha | Changed decisions / 24 | Joint minus one finish-first | Exploratory position CI 95% |
|---|---:|---:|---:|---:|
| min-hand-pips | 20 | 18 | -6.77 pp | [-16.57,+3.03] pp |
| min-hand-pips | 28 | 24 | -5.86 pp | [-16.99,+5.27] pp |
| min-hand-pips | 36 | 22 | -6.77 pp | [-17.72,+4.18] pp |
| closed-branch-control | 20 | 18 | -4.17 pp | [-17.31,+8.98] pp |
| closed-branch-control | 28 | 24 | -2.99 pp | [-16.96,+10.97] pp |
| closed-branch-control | 36 | 22 | -3.65 pp | [-17.52,+10.23] pp |

All changed decisions altered a branch end or opened number; zero same-geometry controls. For alpha28, joint opened more doubles in 10/24 positions; mean joint-minus-one finish-first there: +2.19 pp (min-pips bot), -2.19 pp (branch-control). Remaining 14 positions: -11.61 pp and -3.57 pp. **Extra double opening alone does not explain the negative average.** Geometry confounding remains. Alpha28 average decision regret: one 13.15% vs joint 19.01% (min-pips), one 13.80% vs joint 16.80% (branch-control).

**No reliable universal rule:** all reported confidence intervals include zero. Uniform pass-conditioned hidden allocations omit likelihood of opponents' earlier choices; fixed bots; branch semantics provisional; no block winner; exploratory uncorrected CI.

**Reproduce:** checkout `qosha-research-20261020-pass-regret` at `1d15c3ef98bf5723ae5a691a51cc2b18c6900b5a`; use `pass-disagreement-regret.collect(1305800,1306500,24,28)`; `joint-pass-memory-runner.select` for `a{20,28,36}-{one,joint}`. For each position j=0..31 seed = `mixSeed32((dealSeed + imul(j+1,0x9e3779b9) + imul(turn+1,0x85ebca6b) + imul(seat+1,0xc2b2ae35))>>>0)`; `pass-conditioned-sampler.sample`; evaluate all candidates via `decision-regret.evaluateDecisionInWorld` with identical continuation policies. Position-weighted differences, between-position 95% normal CI. Tests `pass-conditioned-sampler.test()` and `joint-pass-memory-runner.test()` passed in V8.

**Scale:** prior GitHub-verified baseline 264,900 full continuations + 118,520 comparative candidate continuations, separate. This recovered 8,064 comparative continuations must not be counted as additional on top of this checkpoint.

**Next hypothesis/action:** fresh discovery not selected by alpha28; equal-pip/geometry controls, audit exact action flips and post-action open-end geometry. Never modify scoreboard/PWA files.
