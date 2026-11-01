# Matched legal branch-opening choice + exact equal-pip audit — 2026-11-02 02:03:32 +04 (Asia/Baku)

## Engine and rules

- Engine: `qosha-research-0.5.3`; recovered `qosa-1.0.0`, 3 players × 9 stones + 1 stock tile.
- Global number-unlock / branch geometry remains **PROVISIONAL**. These are model diagnostics, not authenticated table rules.
- Source modules were fetched from GitHub and executed through an in-memory CommonJS harness. A direct Git checkout was unavailable in this runtime because GitHub DNS resolution failed; the committed runner is Node-compatible and has deterministic tests.

## A. Fresh matched legal-choice cohort

- Reserved seeds: `3421020–3425019`; actual disjoint profile windows:
  - `min-hand-pips`: `3421020–3422599` (1,580 deals scanned)
  - `closed-branch-control`: `3423020–3424919` (1,900 deals scanned)
- **3,480 unique complete deal allocations**, 0 duplicates; 3,480 discovery rounds: 3,356 finishes / 124 blocks / 0 unresolved.
- 160 selected positions, 20 for each next-opponent hand size 1–4 in each profile. Both candidates are legal: one unopened-number double vs an ordinary single, chosen at minimum absolute pip gap; only **11/160** pairs had exactly equal pips.
- Hidden worlds: 7,680 draws → **1,964 unique assignments within visible states**, 5,716 repeats; mean unique worlds 12.28/position, mean draw ESS 10.16/48. After per-state dedup: **3,928 paired continuations**.

| Continuation profile (80 positions each) | Next-opponent immediate finish Δ | Focal finish-first Δ | Focal remainder Δ | Expected minus loss Δ |
|---|---:|---:|---:|---:|
| min-hand-pips | +12.71 ± 5.68 pp | −22.32 ± 8.55 pp | +2.12 ± 0.57 pips | −2.08 ± 0.95 |
| closed-branch-control | +13.55 ± 6.14 pp | −24.68 ± 7.39 pp | +2.82 ± 0.69 pips | −1.86 ± 0.74 |

Approximate 95% half-widths are clustered by selected position. A negative expected-minus-loss delta means less modeled minus loss in the double arm. This remains confounded by tile identity, retained-hand geometry and often pip gap.

## B. Exact equal-discard-pip cohort

- Reserved seeds: `3429020–3445019`; 8,000 deals scanned per profile, **16,000 unique complete allocations**, 0 duplicates; 16,000 discovery rounds: 15,453 finishes / 547 blocks / 0 unresolved.
- All **63/63** selected pairs remove exactly equal pip sums: 30 min-hand-pips / 33 closed-branch-control. The target quota of 10 one-stone positions per profile was **not met**: min-hand-pips 0; closed-branch-control 3. Each profile did reach 10 positions for each of next-hand sizes 2, 3 and 4.
- Hidden worlds: 4,032 draws → **1,164 unique assignments within visible states**, 2,868 repeats; mean 18.48 unique worlds/position, ESS 15.46/64; **2,328 paired continuations**.

| Profile | Positions | Next hand = 1 | Next hand = 2–4 | Focal finish-first Δ (all) | Focal remainder Δ (all) |
|---|---:|---:|---:|---:|---:|
| min-hand-pips | 30 | 0 | 30 | −16.69 ± 9.46 pp | +1.59 ± 1.19 pips |
| closed-branch-control | 33 | 3 | 30 | −23.02 ± 12.51 pp | +1.36 ± 0.98 pips |

For the three closed-branch-control one-stone positions, next-opponent immediate-finish Δ was +27.78 ± 28.81 pp; this stratum is far too small for inference. Equal pip sums control discarded points, **not** tile identity or the focal player's remaining hand geometry, so this is still not a pure unlock ablation.

## Finding, confidence, and limitations

The minimum-gap cohort again shows the same model-level direction under both continuation profiles: opening the double raises the next opponent's immediate finish chance and lowers the focal player's finish-first chance. The exact equal-pip cohort also has a negative focal finish-first estimate, but it is selected, small, and still confounded by tile/hand geometry. No reliable tactical advantage is established; **no strategy is promoted**.

The branch-opening rule remains provisional; hidden worlds condition on observed no-stock pass exclusions, not opponent action-choice likelihood. Only two synthetic continuation profiles were used. These estimates are not match-win rates, and the blocked-round winner/tie rule, `loneZero`, and `bust=101` scoring remain unauthenticated.

## Regression and cumulative scale

- Existing matched legal-choice runner: **6 assertions passed**.
- New exact equal-pip/dedup runner: **6 assertions passed** (equal-pip candidate, deterministic replay, resolved cohort, allocation/dedup accounting).
- Prior branch-label cohorts remain 1,500 unique deals / 60,274 reachable positions / 0 recorded metamorphic mismatches; property audit remains 52,315 positions.
- Strategy tournament remains unchanged at 1,500 deals / 18,000 arm-rounds (+ separate 120-deal / 1,440-arm pilot).
- This checkpoint adds 19,480 unique deal allocations across two disjoint research cohorts, 11,712 hidden-world draws, 3,128 within-state unique hidden-world assignment records, 8,584 repeats, and 6,256 paired continuations. Within-state unique counts are not globally deduplicated across different visible positions.

## Exact next action

Start fresh at seed **3445020**. Use a policy-mixed, branch-label-symmetric discovery cohort to raise the one-stone equal-pip quota, then enumerate or hash-rank the finite hidden-world support for each selected visible state. Keep the 2–4-stone equal-pip cohort separate and replicate it with another continuation policy. Continue seeking an authentic trace/ruling for global-vs-local branch opening and block scoring; do not promote a tactic yet.

Raw data: [minimum-gap cohort JSON](./2026-11-02-branch-legal-choice-strata-dedup.json); [exact equal-pip JSON](./2026-11-02-equal-pip-legal-choice-dedup.json). Runner: [branch-legal-equal-pip-dedup.js](../simulator/branch-legal-equal-pip-dedup.js).
