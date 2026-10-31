# Branch-label action and transition equivariance audit

- **Timestamp:** 2026-10-31 19:46 +04 (Asia/Baku)
- **Engine/rules:** `qosa-research-0.5.3 + branch-label-transition-equivariance/v1`; recovered `qosa-1.0.0`, primary 3×9. Treating four branch labels as interchangeable is a metamorphic assumption; physical reopening/blocked-tie rules remain provisional.
- **Seeds:** 3404360–3404399; 40 seeded deal draws, 40 unique deal allocations, 0 duplicate allocations.
- **Workload:** 40 deterministic validation trajectories (38 finish, 2 block, 0 unresolved); 891 sampled seat/position snapshots; all 24 branch-label permutations.
- **Checks:** 21,384 permutation-level action-set checks; 61,800 mapped legal-action applications; 2,760 pass/draw transition checks. **All passed: 0 action-set, transition, or pass mismatches.**
- **Strategies in tie-break diagnostic:** min-hand-pips, fast-doubles, moderate-double-hold, closed-branch-control, random-legal. These are not head-to-head outcome comparisons.

## Policy-choice mismatch under a branch-label permutation

| Policy | Different mapped choices | Playable permutation comparisons | Rate |
|---|---:|---:|---:|
| min-hand-pips | 2,966 | 18,624 | 15.93% |
| fast-doubles | 2,622 | 18,624 | 14.08% |
| moderate-double-hold | 3,058 | 18,624 | 16.42% |
| closed-branch-control | 3,178 | 18,624 | 17.06% |
| random-legal | 3,308 | 18,624 | 17.76% |

The mismatch means the existing deterministic tie-break selected a different branch-mapped action after relabeling. It is a structural policy artifact diagnostic, not evidence that a strategy is stronger or weaker. Exact deterministic equivariance can be impossible when multiple branches are perfectly symmetric; a symmetric random tie-break or action-orbit comparison is preferable to forcing an arbitrary label.

## Finding, confidence, and limitations

The legal-action generator and turn application commute with all four-branch label permutations in these reachable positions. This supports the engine's internal symmetry contract, but does **not** authenticate the real-table branch-lock/reopening rule or blocked-tie scoring. The 40 trajectories are validation fixtures, not a strategy tournament; no new hidden-world allocations or strategy-comparison rounds were added. The existing 1,380,975 incompatible-model round population, 1,898,856 forced continuations, 630,000 opening-deal study seeds, and 1,195,408 hidden allocations remain separate and unchanged.

V8 harness execution of the exact GitHub-fetched engine modules, smoke test, and full run passed. Node is available as v22.16.0, but a clean checkout/CLI run remains blocked by this runtime's DNS failure resolving github.com.

## Reproduction and next action

```sh
node qosha-research/simulator/branch-label-transition-equivariance.js test
node qosha-research/simulator/branch-label-transition-equivariance.js 3404360 40 45 3
```

- **Next validation-deal seed:** 3404400. Hidden-world allocation seed remains 3404360 because this run sampled no hidden worlds.
- **Exact next hypothesis/action:** add a symmetric-random/action-orbit tie-break ablation and compare it against raw side-index tie-breaking on matched full-round seeds. Keep results provisional until physical branch and blocked-round rules are authenticated.
