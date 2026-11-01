# Stratified branch-label action/transition audit

**Timestamp:** 2026-11-01 04:53 (+04, Asia/Baku)  
**Engine/rules:** qosa-research-0.5.3 + branch-label-stratified-transition-audit/v1; recovered qosa-1.0.0, 3 players × 9 stones + 1 stock tile. Four branch labels are assumed interchangeable for this metamorphic test. Physical branch reopening and block/tie scoring remain PROVISIONAL.

## Cohort and sampling

- Seed draws: 500, 3407220–3407719; 500 unique full allocations, 0 duplicate allocation pairs.
- Deterministic seeded legal-action index was used only to create reachable validation trajectories.
- Reachable decision positions: 11,863; terminal diagnostics: 467 finish, 33 block; mean round turn counter including opening setup: 24.726.
- Stratified sample: 226 unique states after union of six strata. Quota 60 per stratum; the mixed-finish stratum contained 38 eligible states.

| Stratum | Eligible unique states | Selected |
|---|---:|---:|
| Pass | 888 | 60 |
| Ordinary single present | 9,579 | 60 |
| Double sequence present | 4,480 | 60 |
| Mixed finish present | 38 | 38 |
| At least four legal actions | 5,135 | 60 |
| At least four opened numbers | 8,321 | 60 |

## Metamorphic checks

Across all 24 permutations for each selected state:

- Legal action-set comparisons: **5,424**, 0 mismatches.
- Applied legal action transitions: **14,136**, 0 mismatches (9,624 single, 3,552 double-sequence, 960 mixed-finish).
- Pass transitions: **1,440**, 0 mismatches.
- Explicit nonempty-stock fixtures: 48 option/permutation checks; 96 draw-then-play transitions; 24 draw-then-pass transitions; 0 mismatches.

The reachable trajectories consume the lone stock tile during opening setup, so no in-round draw appeared in the sampled trajectories. The explicit draw fixtures are model-labelled contracts, not physical rule evidence.

## Finding and limits

The research kernel's action generation and successor transitions commute with all 24 branch-label permutations in this stratified reachable sample. This is a high-confidence internal consistency result for the tested kernel. It is **not** proof that the assumed four-branch model matches physical Qoşa açdı rules, and it does not establish a tactical advantage.

- Strategy comparisons: 0.
- Hidden-world allocations: 0.
- Historical baseline and legacy populations: unchanged and separate.

**Exact next action:** obtain an authenticated real-game trace/ruling for late-arrival branch reopening and blocked-tie scoring. Keep strategy ranking paused until those rules are resolved.
