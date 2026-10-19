# Pass-memory posterior ablation — 2026-10-19 20:54 Asia/Baku

- **Engine/rules:** qosa-research-0.5.3 / recovered qosa-1.0.0; 3 players × 9 stones, later-round initialization; provisional branch semantics unchanged.
- **Reproduce:** \`node qosha-research/simulator/pass-memory-ablation.js test\` and \`node qosha-research/simulator/pass-memory-ablation.js 1300000 200\`.
- **Execution:** V8 CommonJS loader with GitHub-sourced modules, deterministic self-test 90/90 green (3 seeds replayed twice), Node CLI not run.
- **Seeds/deals:** 1300000..1300199 (200 distinct deals); all 3 focal seats, 2 opponent policies, 5 variants = **6,000 complete round continuations** (not 6,000 independent deals); 0 unresolved. Matched by deal/seat/opponent policy.
- **Policies:** min-hand-pips; reply-aware exact hypergeometric pass heuristic at alpha=12 and alpha=20, each with/without remembered pass constraints. Opponents fixed to min-hand-pips or closed-branch-control.
- **Memory inference:** when an opponent passes with empty stock, all tiles individually legal on that board are excluded from their *current and later* hand; the inferred forbidden set is accumulated. Each pass was checked against the actual hidden hand in the simulator (no contradictions). Candidate next-pass probability uses a uniform k-subset of the allowed unseen pool; this is only a **partial posterior** (ignores other opponent constraints and choice-policy likelihoods).
- **Outcomes:** finish-first rates, remaining pips, block rates, turns, minus categories and paired deal-cluster exploratory CIs.

| Opponents | Variant | Finish first | Δ vs same-alpha no memory | Exploratory 95% CI for Δ | Mean remaining pips | Block |
|---|---|---:|---:|---|---:|---:|
| min-pips | alpha12 plain | 40.83% | — | — | 3.830 | 5.00% |
| min-pips | alpha12 memory | 41.17% | +0.33 pp | [-0.59,+1.26] pp | 3.817 | 4.67% |
| min-pips | alpha20 plain | 41.67% | — | — | 3.872 | 5.00% |
| min-pips | alpha20 memory | 42.50% | +0.83 pp | [-0.14,+1.81] pp | 3.848 | 4.33% |
| branch-control | alpha12 plain | 28.33% | — | — | 5.665 | 7.17% |
| branch-control | alpha12 memory | 28.67% | +0.33 pp | [-0.59,+1.26] pp | 5.735 | 7.33% |
| branch-control | alpha20 plain | 31.83% | — | — | 5.670 | 7.00% |
| branch-control | alpha20 memory | 32.50% | +0.67 pp | [-0.13,+1.46] pp | 5.630 | 7.17% |

Baseline min-pips finish-first: 32.17% against min-pips bots; 25.50% against branch-control bots. No-memory alpha12: +8.67 pp against min-pips baseline, +2.83 pp against branch-control baseline on this seed set. Alpha20 was not separately confirmed as an optimal weight.

**Decision-level impact:** alpha12 memory changed only 30/3712 focal decisions against min-pips and 34/3171 against branch-control; alpha20 changed 40/3704 and 31/3180. These are direct same-state policy differences, not all changes in downstream trajectories. Memory-conditioned opportunities were 648/3712, 880/3171, 732/3704 and 960/3180 respectively. Matched finish outcome flips (improved/worsened) alpha12: 5/3 under either opponent policy; alpha20: 7/2 and 5/1. All differences are small and exploratory.

**Minus finish:** no −30/−40 observed. For min-pips opponents, alpha12 memory had 50 × −10, 1 × −20; plain had 51 × −10, 0 × −20. For branch-control, alpha12 memory and plain both had 21 × −10, 2 × −20. The other rows' complete minus counts are available by rerunning the script.

**Finding:** remembering actual prior passes changes a small fraction of decisions and shows a **positive but statistically inconclusive** +0.33 to +0.83 percentage-point finish-first delta in this sample. The larger advantage seen for reply-aware versus pure min-pips cannot be attributed to pass memory. No human-game strategy rule is promoted.

**Limitations:** uniform hidden hands conditional only on pass-implied forbidden tiles, no conditioning on other opponents' passes when computing next opponent marginal or bot choice likelihood, provisional branch rules, fixed bots, block winner not assigned, finish-first not match win. Exploratory unadjusted CIs based on 200 deal clusters and reused seeds across alpha weights. Historical 4,000 and quarantined rounds remain excluded.

**Cumulative:** repository prior validated **186,000** full rounds; this checkpoint adds **6,000**, for **192,000 repository-persisted full round continuations** if commit succeeds. Hidden-world draws and historic 4,000 are counted separately.

**Exact next action:** on fresh 1300200..1300999 seeds, compare alpha12/20 memory vs plain with identical policies, and separately check calibrated posterior pass probability against true pass frequencies conditioned on actual pass history. Then test whether conditioning on *both* opponents' pass constraints changes the sign or magnitude. No GitHub Actions; scoreboard/PWA untouched.
