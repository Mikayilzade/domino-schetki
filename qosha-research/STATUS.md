# Latest checkpoint — model-agreement common-world regret audit (2026-11-01 09:54:30 +04 (Asia/Baku))

- [Report](runs/2026-11-01-0954-model-agreement-common-world-regret.md); [JSON](runs/2026-11-01-0954-model-agreement-common-world-regret.json). Source head before this checkpoint: `4983bcf6c16bcdaccba4e5f0b16043f23d49c0e1`.
- 250 unique deals, seeds 3409720–3409969; 6,342 decision positions; global/current-only legal action sets differ in 1,161 (18.31%). 3,102 unique agreement choice states.
- 24 stratified agreement states; 334 unique hidden allocations (128 seeded draws, 0 duplicates); 1,435 candidate-world evaluations per model / 2,870 full rounds; 0 unresolved and 0 candidate-set drift.
- Mean oracle regret (global/current-only): first-finish chance 2.86/2.38 pp; mean remainder 0.122/0.753 pips; minus risk 10.49/6.25 pp; expected minus loss 1.10/0.625 pips. Exploratory only; no strategy promoted.
- Reference opening regression matched exactly (500 deals; 474 follow-ups / 26 passes; side counts 118/118/120/118). Tests passed. Python audit port used; no native Node checkout and no engine/PWA source change.
- Cumulative separate validation/opening/tie-break allocations: **3,950**; property-audit count remains 39,262; strategy-strength holdout unchanged.
- **Next:** persist a native Node runner, then repeat on seeds 3409970–3410469 with ≥72 agreement states and up to 24 unique hidden worlds/state; analyze root model-disagreement positions separately.

---

# Latest checkpoint — independent symmetric-opener tie-break replication (2026-11-01 08:54 +04, Asia/Baku)

- [Runner](simulator/opening-symmetric-continuation-tiebreak-audit.js); [report](runs/2026-11-01-0854-opening-symmetric-continuation-tiebreak-replication.md); [JSON](runs/2026-11-01-0854-opening-symmetric-continuation-tiebreak-replication.json). Engine qosa-research-0.5.3; recovered qosa-1.0.0 3×9+stock. Late-arrival reopening and blocked-tie scoring remain PROVISIONAL.
- 500 unique allocations, seeds 3409220–3409719; symmetric opener: 954 follow-ups / 46 passes, sides up 234 / left 238 / right 240 / down 242; 1,000 conservation checks, 0 failures.
- 3,000 paired comparisons / 6,000 rounds. Mix 1: 55/1,500 outcome-kind changes (3.67%), 285/1,427 first-finisher changes (19.97%). Mix 2: 90/1,500 (6.00%), 307/1,398 (21.96%). Pooled descriptively with the prior disjoint 500-deal cohort: first-finisher changes 20.47% (Mix 1) / 22.53% (Mix 2). Tie-break sensitivity only; not strategy superiority. 0 unresolved rounds, 0 new hidden worlds/regret/strategy-strength samples.
- Regression test passed: 8 replay deals / 48 pairs. Cumulative validation/opening/tie-break allocations: **3,700**; reachable-position audits remain 39,262; strategy-strength holdout unchanged.
- **Next:** isolate reachable positions where the two provisional branch models agree and run common-hidden-world within-state regret; keep model-disagreement positions separate and continue seeking physical rule authentication.

---

# Latest checkpoint — opening-symmetric continuation tie-break audit (2026-11-01 07:46 +04, Asia/Baku)

- [Runner](simulator/opening-symmetric-continuation-tiebreak-audit.js); [report](runs/2026-11-01-0746-opening-symmetric-continuation-tiebreak-audit.md); [JSON](runs/2026-11-01-0746-opening-symmetric-continuation-tiebreak-audit.json). Engine qosa-research-0.5.3; recovered qosa-1.0.0 3×9+stock. Physical branch reopening and block/tie scoring remain provisional.
- 500 unique full allocations, seeds 3408720–3409219, 0 duplicates. The seeded symmetric 1-1 follow-up was fixed across both arms: 948 follow-ups / 52 passes; 1,000 conservation checks, 0 failures; follow-up tile/hand mismatches 0.
- 2 mixes × 3 seat rotations = 3,000 paired comparisons / 6,000 rounds. Cleaner deterministic mix: outcome kind changed 86/1,500 (5.73%, deal-clustered approximate 95% CI 4.51%–6.95%); first finisher changed 322/1,394 both-finish pairs (23.10%, CI 20.83%–25.37%); minus changed 179/1,394 (12.84%). Sensitivity mix: 87/1,500 kind changes (5.80%); 293/1,397 first-finisher changes (20.97%).
- This is tie-break sensitivity, not strategy superiority. No hidden worlds, regret, or human/101-match win-rate. Main cohort had 0 unresolved rounds. Regression test passed: 8 replay deals / 48 paired comparisons.
- Cumulative new validation/opening/tie-break allocations: 3,200; reachable-position audits remain 39,262. Strategy-strength holdouts unchanged.
- **Next:** authenticate late-arrival branch reopening and blocked-round tie scoring; then matched-seed strategy holdout with symmetric opener/action-orbit policy fixed.

---

# Latest checkpoint — seeded symmetric opening follow-up side audit (2026-11-01 06:45 +04, Asia/Baku)

- [Runner](simulator/opening-followup-symmetric-selector-audit.js); [report](runs/2026-11-01-0645-opening-followup-symmetric-selector-audit.md); [JSON](runs/2026-11-01-0645-opening-followup-symmetric-selector-audit.json). Engine qosa-research-0.5.3; recovered qosa-1.0.0 3×9. Physical branch-label interchangeability and branch/block scoring remain unauthenticated.
- Optional initializer `chooseFollowupSide` preserves canonical tile/hand and varies only side; default behavior unchanged.
- **500 unique allocations**, seeds 3408220–3408719; 474 follow-ups, 26 passes. **1,500 matched pairs / 3,000 rounds**. Outcome kind changed 40/1,500 (2.67%); first finisher changed 158/1,411 both-finish pairs (11.20%). Canonical 1,427 finish / 73 block; symmetric 1,435 / 65. Tie-break sensitivity only.
- Opening conservation: 1,000 checks, 0 failures. Exact 24-permutation distributional audit: 0 action-set or transition-distribution mismatches; 96 mapped successor outcomes.
- Test passed: 12 replay deals / 36 paired rounds. GitHub-fetched source executed in V8 harness; clean Node checkout remains DNS-blocked. No strategy-strength comparisons or hidden worlds.
- Cumulative new validation/opening/tie-break allocations: **2,700**; reachable-position property-audit count remains 39,262. Strategy holdout populations unchanged.
- **Next:** hold symmetric opening selection fixed; compare side-order versus action-orbit continuation tie-breaks on matched seeds; seek physical trace/ruling for late reopening and block scoring.

---

# Latest checkpoint — opening follow-up branch-label tie-break audit (2026-11-01 05:46 +04, Asia/Baku)

- [Runner](simulator/opening-followup-label-bias-audit.js); [report](runs/2026-11-01-0546-opening-followup-label-bias-audit.md); [JSON](runs/2026-11-01-0546-opening-followup-label-bias-audit.json). Engine qosa-research-0.5.3; recovered qosa-1.0.0 3×9. Physical branch symmetry remains an assumption.
- **500 unique allocations**, seeds 3407720–3408219; 0 duplicates. Follow-up available in 468; 32 opening passes. The initializer's default chose canonical **up 468/468**.
- All 24 branch-label permutations: **11,232** default-choice checks; **8,424 (75%)** mapped-choice mismatches, exactly 18/24 per eligible state. Legal action sets and uniform legal-action distribution: **0 mismatches**. Tile conservation: 500 checks, 0 failures.
- This is a representation tie-break diagnostic, not a physical side preference or tactic. **0 full rounds, 0 strategy comparisons, 0 hidden worlds.**
- Cumulative validation allocations: **2,200** (1,700 prior property audits + this disjoint 500-deal opening cohort); reachable positions remain **39,262**. Strategy populations unchanged.
- **Next:** add an explicit seeded symmetric opening-follow-up selector for validation trajectories; compare matched-seed tie-break sensitivity. Keep strategy ranking paused pending physical branch/block authentication.

---

# Latest checkpoint — stratified branch-label action/transition audit (2026-11-01 04:53 +04, Asia/Baku)

- [Runner](simulator/branch-label-stratified-transition-audit.js); [report](runs/2026-11-01-0453-branch-label-stratified-transition-audit.md); [JSON](runs/2026-11-01-0453-branch-label-stratified-transition-audit.json). Engine qosa-research-0.5.3; recovered qosa-1.0.0 3×9. Physical branch reopening and block/tie scoring remain PROVISIONAL.
- **500 unique full allocations**, seeds 3407220–3407719; **11,863 reachable decision positions**. Stratified union: **226 unique states** across pass/single/double/mixed/multi-action/late-open strata.
- All 24 branch-label permutations: **5,424 legal action-set checks, 14,136 action transitions, 1,440 pass transitions — 0 mismatches**. Explicit nonempty-stock fixtures: 48 option checks, 96 draw-then-play transitions, 24 draw-then-pass transitions — 0 mismatches.
- Terminal counts (467 finish / 33 block) are trajectory diagnostics only. The 500 deals generated validation states; no strategy comparisons or hidden worlds.
- Cumulative property audits: **1,700 unique allocations / 39,262 reachable positions** (prior 1,200 / 27,399 plus this 500 / 11,863). Do not add this run's stratified transition checks to the old all-candidate trajectory totals.
- **Next:** obtain an authenticated physical trace/ruling for late-arrival branch reopening and blocked-tie scoring; keep strategy ranking paused.

---

# Latest checkpoint — reachable four-branch lock/open contract (2026-11-01 03:54:47 +04, Asia/Baku)

- [Runner](simulator/branch-lock-reachability-contract.js); [report](runs/2026-11-01-0354-branch-lock-reachability-contract.md); [JSON](runs/2026-11-01-0354-branch-lock-reachability-contract.json). Engine qosa-research-0.5.3; 3×9 recovered qosa-1.0.0. Physical branch reopening and block/tie scoring remain PROVISIONAL.
- **500 unique full allocations**, seeds 3406720–3407219; **11,795 reachable positions**, **41,451 legal action candidates applied**, 0 internal invariant failures. Candidate types: 32,482 single; 8,912 double-sequence; 57 mixed-finish. 924 forced passes, 0 in-round draws; 476 finish / 24 block terminal kinds are diagnostics only.
- All 24 four-double orders passed. Mixed-finish doubles are validated after the ordinary prefix, which can expose their number. The synthetic late-arrival fixture confirms chronology sensitivity only under the current-only provisional model (8→5 legal tiles); global-ever-open remains 8.
- No strategy deals/comparisons or hidden worlds. Cumulative property audits: **1,200 unique allocations / 27,399 positions / 98,933 candidate applications**. Strategy populations unchanged; historical and legacy populations remain separate.
- **Next:** 24-permutation branch-label action/transition checks on stratified reachable states; obtain physical trace/ruling for late-arrival unlocking and blocked-tie scoring before strategy rankings.

---

## Latest checkpoint — reachable multi-double and mixed-finish property audit (2026-11-01 02:57:11 +04, Asia/Baku)

- [Runner](simulator/multi-double-finish-property-audit.js); [report](runs/2026-11-01-0257-multi-double-finish-property-audit.md); [JSON](runs/2026-11-01-0257-multi-double-finish-property-audit.json). Engine qosa-research-0.5.3; recovered 3×9 qosa-1.0.0. Branch reopening and block/tie scoring remain provisional.
- **500 unique allocations**, seeds 3406220–3406719; **10,862 reachable decision positions** and **41,189 candidate actions applied**. 3,466 multi-double candidates; maximum sequence length 4; 46 mixed-finish candidates (44 one-double, 2 two-double). The validation path deliberately selected mixed finish when available; 43 were selected.
- 0 transition, tile-conservation, remainder, opening-state, branch-update, or finish-minus invariant failures. Direct finish-minus contract and existing dispatcher/round-driver tests passed. No all-double terminal candidate appeared in this cohort; that is not evidence of impossibility.
- **0 strategy deals/comparisons and 0 hidden worlds.** No tactic claim. Local Node v22.16.0 harness used mirrored research modules; clean GitHub checkout remains DNS-blocked.
- **Next:** targeted four-branch locked/open and late-arrival regression properties; do not rank strategies until physical branch reopening and blocked-tie scoring are confirmed.

---

## Latest checkpoint — reachable 3×9 trajectory property audit (2026-11-01 01:52 +04, Asia/Baku)

- [Runner](simulator/reachable-property-audit.js); [report](runs/2026-11-01-0152-reachable-property-audit.md); [JSON](runs/2026-11-01-0152-reachable-property-audit.json). Engine qosa-research-0.5.3, 3×9 recovered qosa-1.0.0. Five core local source mirrors matched GitHub blob hashes; Node v22.16.0.
- **200 unique allocations**, seeds 3406020–3406219; 4,742 reachable decision states; **16,293/16,293 candidate actions applied**, 0 conservation/stock/transition mismatches. Five deterministic action-history replays passed.
- Four draw/pass fixtures passed. The one stock tile is consumed by opening setup in each trajectory (190 opening draws; 10 stock-1-1 starts); no in-round draws in this cohort. Actual path: 4,398 plays, 344 passes; 192 finish / 8 block terminal kinds, diagnostic only.
- **0 strategy deals/comparisons or hidden worlds.** Branch reopening and block/tie scoring remain provisional. Clean GitHub checkout is still DNS-blocked; exact local source mirror, not a clean-checkout claim.
- **Next:** targeted reachable multi-double/mixed-finish properties; physical branch-reopening and blocked-tie evidence before strategy rankings.

---

## Latest checkpoint — 3×9 seed-to-deal reproducibility audit (2026-11-01 00:55 +04, Asia/Baku)

- [Runner](simulator/seed-reproducibility-audit.js); [report](runs/2026-11-01-0055-seed-reproducibility-audit.md); [JSON](runs/2026-11-01-0055-seed-reproducibility-audit.json). Engine qosa-research-0.5.3; exact engine.js blob SHA 82e5bd544a57683d5b4f7812beb2d4abf80da894. Deal-generator audit only; no branch/scoring rule claims.
- **100,000 seeds** 0..99,999: 100,000 unique full allocations, 0 duplicate allocation pairs, 0 tile-conservation failures. Stock χ²(27)=23.77952, p=0.64252; per-position χ² range 14.8212–43.4641, smallest p=0.02347 (above Bonferroni 0.00179 for 28 positions).
- Five anchor fingerprints and aggregate counts matched Node v22.16.0 vs V8. Node used an engine.js mirror with an exact matching Git blob hash; clean GitHub clone remains blocked by DNS. Not a clean-checkout CLI run.
- **No strategy samples added:** 0 full rounds, 0 hidden worlds. Legacy populations unchanged; 1,500 action-orbit holdout deals (+120 pilot) remain separate. Branch reopening and blocked ties remain **PROVISIONAL**.
- **Next:** property-audit 200 reachable 3×9 trajectories on seeds 3406020–3406219 for legal action/application, draw/pass stock accounting, and tile conservation; no strategy ranking until physical rules are authenticated.

---

## Latest checkpoint — disjoint 500-deal symmetric action-orbit holdout (2026-10-31 21:53 +04, Asia/Baku)
- [Run report](runs/2026-10-31-2153-branch-label-symmetric-tiebreak-holdout.md); [JSON](runs/2026-10-31-2153-branch-label-symmetric-tiebreak-holdout.json). 500 unique deals, seeds 3404520–3405019; 3 rotations × 2 mixes = 3,000 matched round pairs / 6,000 arm-rounds. 0 hidden worlds. Branch reopening/block ties remain PROVISIONAL.
- 40-deal structural audit: 903 positions; 21,672 permutation checks; 19,368 playable comparisons; 0 option/action-set mismatches. 96,840 distribution checks, 0 mismatches.
- Paired outcome-kind changes: 92/1,500 (6.13%) Mix 1; 66/1,500 (4.40%) Mix 2. Mix 2 first finisher changed 312/1,417 both-finish pairs (22.02%). Deal-clustered 95% CIs for Mix 2 finish-rate differences: fast-doubles +0.60 pp [-1.21,+2.41]; moderate-hold +1.13 pp [-0.82,+3.08]; closed-branch-control −2.27 pp [-4.50,−0.03]. Exploratory tie-break sensitivity only; the last interval is unadjusted for multiple comparisons and rules are provisional, so no tactic promoted.
- Legacy cumulative populations unchanged: 1,380,975 incompatible-model rounds; 1,898,856 continuations; 630,000 opening-deal study seeds; 1,195,408 hidden allocations. Separate new cohort: 500 full-round deals / 6,000 arm-rounds. Next seed **3405020**.
- **Next:** authenticate late-arrival branch reopening and blocked-round tie scoring with a physical trace/ruling; then repeat matched-seed strategy comparisons under confirmed rules.

---

## Latest checkpoint — symmetric action-orbit tie-break (2026-10-31 20:53 +04, Asia/Baku)
- [Runner](simulator/branch-label-symmetric-tiebreak.js); [run report](runs/2026-10-31-2053-branch-label-symmetric-tiebreak.md); [JSON](runs/2026-10-31-2053-branch-label-symmetric-tiebreak.json). Engine `qosha-research-0.5.3 + symmetric-action-orbit-tiebreak/v1`; branch reopening/block ties remain PROVISIONAL.
- **120 new unique 3×9 deal allocations**, seeds 3404400–3404519; 3 seat rotations × 2 mixes = **720 matched round pairs / 1,440 arm-rounds**. No hidden worlds. Legacy cumulative populations unchanged: 1,380,975 incompatible-model rounds; 1,898,856 forced continuations; 630,000 opening-deal study seeds; 1,195,408 seeded hidden allocations. Keep this new cohort separate.
- **Distributional symmetry:** 40 unique audit deals, 927 sampled positions, 22,248 permutation checks, 19,368 playable comparisons. Action sets/options: 0 mismatches. Five policies × 19,368 = 96,840 distribution checks, **0 mismatches**. Existing deterministic choice mismatch range 12.63%–16.26%.
- **Matched outcomes:** mix1 kind changed 33/360; mix2 19/360. First finisher changed in 162/327 and 80/338 both-finish pairs, respectively. Tie-break sensitivity only; no strength claim. Clean Node 22 checkout still DNS-blocked; GitHub-fetched source executed in V8.
- **Next:** disjoint 500-deal paired holdout + uncertainty; physical branch-rule authentication. Next full-round seed **3404520**; hidden-world seed remains **3404360**.

---

## Latest checkpoint — reachable branch-label action/transition equivariance (2026-10-31 19:46 +04 (Asia/Baku))
- [Audit](simulator/branch-label-transition-equivariance.js); [report](runs/2026-10-31-1946-branch-label-transition-equivariance.md). 40 unique seeded validation deals; 891 sampled positions; all 24 branch permutations.
- 21,384 legal-action-set checks, 61,800 mapped action transitions and 2,760 pass/draw transitions passed with **0 mismatches**.
- Built-in policy tie-break choices remain label-sensitive: min-pips 15.93%, fast-doubles 14.08%, moderate-hold 16.42%, closed-branch 17.06%, random-legal 17.76%. Structural artifact only; no tactic claim.
- Cumulative strategy populations unchanged. Branch reopening and blocked ties remain provisional. **Next:** matched-seed symmetric-random/action-orbit tie-break ablation, plus physical-rule authentication.

## Latest checkpoint — side-label tie-break replay + duplicate-world accounting (2026-10-31 18:49 +04)
- [Runner](simulator/side-label-invariance-audit.js); [detailed checkpoint](runs/2026-10-31-1849-side-label-tiebreak-replay.md). Replayed two existing seed cohorts on the same alternate chronological prefix; **0 new seeds/worlds/deals/rounds**. 4,096 seed draws → **4,094 unique allocations**; two duplicate pairs in the first cohort were tracked and excluded after their first occurrence.
- Prior cohort `3400264..3402311`: 111 eligible worlds, 237 common-candidate comparisons, 81 safety flips (34.18%); canonical tie-break 0/2,664 permutation mismatches; raw numeric order 192 eligibility changes and 264/2,472 classification mismatches (10.68%).
- Latest cohort `3402312..3404359`: 111 eligible worlds, 239 candidates, 106 safety flips (44.35%); canonical 0/2,664; numeric order 136 eligibility changes and 188/2,528 classification mismatches (7.44%). Combined descriptive safety flips: 187/476 (39.29%); numeric classification mismatches 452/5,000 (9.04%).
- Clarification: the prior `16/111` metric refers to worlds with classification-map changes; 12/111 had eligibility changes, so 28/111 had either type. No overlap in that cohort. This is a branch-label policy artifact audit, **not a game tactic**.
- Duplicate pairs: 3401407→3400549 and 3401867→3400594; both are ineligible worlds, so deduplication does not change the candidate totals. V8 source execution and the duplicate regression test passed. Clean local Node 22 checkout remains blocked by DNS resolution for github.com.
- **Cumulative unchanged:** 1,380,975 incompatible-model rounds; 1,898,856 forced continuations; 630,000 opening deals; 1,195,408 seeded hidden allocations. Historical 4,000-round baseline separate. Next seed **≥3404360**.
- **Next:** use duplicate-aware unique-world accounting and invariant tie-breaks in remaining policy runners; seek an authenticated physical pass/branch trace before full-round scoring claims.


## Latest checkpoint — paired extension-policy holdout (2026-10-31 14:55 +04)
- [Reproducible runner](simulator/late-return-extension-paired.js); [detailed checkpoint](runs/2026-10-31-1455-late-return-extension-paired.md). **2,048 NEW conditional hidden allocations** on seeds 3396168..3398215; **368** identical-world/candidate comparisons, **11,776** two-opponent continuations. 0 new opening deals/full rounds.
- **Finding (synthetic, not win-rate):** among **505** worlds eligible under both low-/high-pip chronological extensions, **306** had no candidate ordinary placement common to both histories. Among 368 comparable placements, robust forced-pass safety reversed in **148** (63 low-only, 85 high-only). Repeated in disjoint 1,024-world holdout. Physical branch/tie rules still unverified; Node clean checkout pending.
- **Cumulative:** 1,380,975 incompatible-rule complete rounds; 1,898,856 forced continuations; 630,000 opening deals; **1,189,264** seeded hidden allocations. Next unused seed >=3398216. **Next:** clean Node replay; branch-end-stratified common-candidate analysis; authenticate physical branch/tie rules.

## Latest checkpoint — chronological 3×9 opening correction (2026-10-31 04:48 +04)
- **Critical validation:** the preceding 03:57 synthetic paired-return fixture used 2 played + focal 9 + seat1 9 + seat2 8; it conserves 28 but is **not a reachable first-round starter-return state** after the mandatory 1-1 stock draw and 1-2 play. Do not promote its 23.33% pass or policy-dependent mobility sign as a real-game tactic.
- [Executable audit](simulator/reachable-opening-pair-audit.js), [full checkpoint](runs/2026-10-31-0448-reachable-opening-pair-audit.md): corrected chronological opening with focal 8, seat1/seat2 9 each, two forced passes, and known seat1 3-3. Exhaustive **24,310 exact conditional allocations**: after focal 1-3 seat1 pass 0%, after 1-4 **12,870/24,310 = 52.94%**, but seat2 pass **715/24,310 → 55/24,310**. In all 12,870 seat1 passes after 1-4, seat2 can open 4-4. These are **conditional legal-move facts**, not winning statistics.
- Actual fetched GitHub dispatcher V8 integration passed all 24,310 worlds; independent Node 22 combinatorial oracle passed. Clean-checkout Node execution still pending. 0 new deals/seeded worlds/full rounds. Cumulative unchanged: 1,380,975 incompatible-model rounds, 1,898,856 continuations, 630,000 opening deals, 1,183,120 seeded hidden allocations; next unused seed >=3392072. Physical branch/tie rules unresolved. **Next:** audit earlier paired fixtures for chronological reachability and retest on multiple independent reachable hands.

## Latest checkpoint — actual-dispatcher focal return after two opponents (2026-10-31 03:57 +04)
- [Code](simulator/public-return-dispatcher-exact.js), [run details](runs/2026-10-31-0357-public-return-dispatcher-exact.md). Reused 56,485 overlapping exact synthetic conditional hands; 0 new random worlds, deals, full rounds or continuations. Actual research dispatcher V8 exhaustive test passed (4 scenarios, both focal choices, 2 seat1 policies, every seat2 legal reply); independent two-opponent pass counts agree.
- **Finding (conditional, NOT a winning tactic):** with seat1 known `3-3`, focal `1-4` vs `1-3` raises worst-case next-turn mean playable tiles **4.413→4.578** if seat1 plays only one low double, but lowers them **4.816→4.773** if seat1 greedily plays all doubles. Policy-dependent sign; branch rule remains provisional.
- Cumulative unchanged: 1,380,975 incompatible-rule rounds; 1,898,856 continuations; 630,000 opening deals; 1,183,120 seeded hidden allocations; next seed >=3392072. Clean Node checkout, physical branch/tie authentication, and independent-hand replication next.

## Latest checkpoint — exact double-chain opportunity cross-check (2026-10-31 01:54 +04 (Asia/Baku))
- [Code](simulator/public-double-chain-exact.js) and [run report](runs/2026-10-31-0154-public-double-chain-exact.md). Reused 56,485 exact conditional hand assignments; 0 new random worlds/deals/rounds. Actual research dispatcher agrees with independent maximum-double oracle in every assignment; representative `applyTurn` checks passed in V8 (clean Node pending).
- Conditional known `3-3`: move `1-4` instead of `1-3` reduces opponent two-double opportunity **50% → 23.3333%** and mean maximum double tiles **1.5 → 1.0**; known `4-4` reverses, both known cancel. **NOT a win-rate or human-policy result**.
- Cumulative unchanged: 1,380,975 incompatible-model rounds; 1,898,856 forced continuations; 630,000 opening deals; 1,183,120 seeded hidden allocations. Next seed >=3392072. Branch/tie and optional-chain choice unresolved. Next: clean Node and matched-world two-turn policy sensitivity.

## 2026-10-30 20:50 +04 — stock-conditioned double posterior (latest)
- [Standalone Node exact/sampled contract](simulator/connector-posterior-contract.js); [checkpoint](runs/2026-10-30-2050-connector-posterior-contract.md). 7,150 exact synthetic allocations + **32,768 new seeded worlds** (3344968..3377735), 0 new complete rounds. Node 22 independent mode passed; optional actual-repository integration is coded but **not yet executed**.
- Given seat1 owns 1-3, P(seat1 also owns 3-3) is **30.77%** if stock is another 1-X connector versus **23.08%** if stock is a nonconnector; exact only under synthetic pass and fixed focal hand, not a proven winning tactic.
- Cumulative: **1,380,975** incompatible-model rounds, **1,898,856** continuations, **630,000** opening deals, **1,168,784** seeded hidden allocations; next unused seed >=3377736. Physical late-arrival branches/ties unresolved; next clean-checkout integration and authenticated chronological pass.

## 2026-10-30 19:46 +04 — connector versus matching double posterior (latest)
- [Executable standalone exact audit](simulator/connector-double-conditional-audit.js); [full checkpoint](runs/2026-10-30-1946-connector-double-conditional.md). 7,150 exact synthetic conditional worlds + 32,768 new seeded allocations (3312200..3344967), Node test/full run passed; 0 new full rounds.
- Assumed forced pass makes P(seat1 has 1-3)=90%, but P(seat1 has 3-3 | has 1-3) **falls from 44.44% to 27.35%** because connector-heavy hands have fewer slots for doubles. This is an exact *conditional capacity* finding, not an authenticated physical-game tactic.
- Cumulative: 1,380,975 model rounds; 1,898,856 continuations; 630,000 opening deals; **1,136,016** seeded hidden allocations. Next unused seed >=3344968. Branch/tie scoring unresolved; next real chronological pass + cross-check against existing posterior sampler.

# Qoşa research status

Updated: 2026-10-30 18:50 +04 (Asia/Baku)

## Latest checkpoint — calibrated exact pairwise ownership against seeded hidden-world sampler
- [Script](simulator/public-joint-sampler-calibration.js), [full metrics](RESULTS.md). **32,768 new seeded hidden allocations** on `3279432..3312199`; **0 new deals, complete rounds or forced continuations**. 7,150 exact compatible worlds, 7,071 distinct observed; paired `1-2`/`1-3` both in seat1 **26,172/32,768** versus exact **80%**, no impossible both-in-stock assignments. All calibration |z| <=1.051. Fetched committed source and actual GitHub dependencies passed V8 CommonJS replay; clean-checkout Node still pending.
- **Cumulative:** 1,380,975 incompatible-model complete rounds, 1,898,856 forced continuations, 630,000 opening deals, **1,103,248 seeded hidden allocations**. Historical 4,000 rounds separate. **Next unused seed >=3312200**.
- This is one synthetic known-hand/pass-mask fixture, **not an authenticated physical pass or a winning strategy**. Late-arrival branch and blocked ties remain unverified. **Next:** authentic trace/rules, then matched-world move regret.

Updated: 2026-10-30 16:50 +04 (Asia/Baku)

## Latest checkpoint — chronological exact four-owner bridge
- [Source](simulator/public-ownership-bridge.js), [run note](runs/2026-10-30-1650-public-ownership-bridge.md). V8 integration of actual fetched GitHub modules passed 6 public chronological cases (5,005 / 24,310 / 2,002 / 5,005 / 3,003 / 6,435 compatible worlds), 98 hidden-tile marginals independently matched against the existing exact ledger, 2 negative guards. **Node clean-checkout still pending**.
- **0 new seeded deals/worlds/complete rounds/forced continuations**; no new winning tactic. Exact owner probabilities now flow from verified chronological forced passes into seat0/seat1/seat2/stock marginals, conditional on PROVISIONAL global-ever-open geometry.
- Cumulative unchanged: **1,380,975** incompatible-model rounds, **1,898,856** forced continuations, **630,000** opening deals, **1,070,480** seeded hidden allocations; next unused seed >=3279432. Physical branch reopening and blocked ties unverified.
- **Next:** independent Node execution, authentic pass/branch/tie evidence, then matched-seed full-game comparisons.


Updated: 2026-10-30 14:55 +04 (Asia/Baku)

## Latest checkpoint — impossible opening triple-pass history now rejected
- [Exact capacity checker](simulator/public-pass-feasibility.js), [replay integration](simulator/public-history-replay.js), [run details](runs/2026-10-30-1455-public-pass-feasibility.md). In a 3×9 first-round 1-1 opening with empty stock, **all three players cannot be forced to pass**: six unplayed 1-X connectors must be held somewhere. Exact compatible assignments: **227,873,431,500** without passes, **64,664,600** when two seats pass, **0** when all three pass.
- Node 22 standalone checker passed 7 fixtures and 2 guards. GitHub-fetched V8 integration passed replay (18 guards, 100 seeds), bridge (6 fixtures), ledger (9 checks) and posterior (200 seeds). Clean-checkout Node integration remains pending. **0 new deals/worlds/rounds**, no new winning tactic.
- Cumulative unchanged: **1,380,975** incompatible-model complete rounds, **1,898,856** forced continuations, **630,000** opening deals, **1,070,480** hidden allocations; next unused seed >=3279432. Late-arrival branch rule and blocked ties still provisional.
- **Next:** clean-checkout Node tests, authentic physical pass/branch/tie evidence, then matched-seed strategy ranking.

Updated: 2026-10-30 13:52 +04 (Asia/Baku)

## Latest checkpoint — chronological focal/opponent pass regression repaired
- [Code](simulator/public-history-replay.js) and [checkpoint](runs/2026-10-30-1350-public-replay-regression.md). Fixed stale assertion after the focal-pass exclusion: opening seats 2→0 have **1** hidden pass mask, not 2; new 2→0→1 fixture has **2** opponent masks, 1 focal pass, eligibility [true,false,true].
- V8 CommonJS integration passed for public replay (18 guards, 100 deterministic replays), bridge (6 exact scenarios, 6 guards), and independent ownership ledger (9 checks). **Clean-checkout Node still pending**. **0 new deals/worlds/rounds**; no new strategy finding.
- Cumulative unchanged: **1,380,975** incompatible-model rounds; **1,898,856** continuations; **630,000** opening deals; **1,070,480** hidden allocations; next unused seed >=3279432. Physical branch reopening and blocked ties remain provisional.
- **Next:** clean-checkout Node tests and authenticated public trace, then matched-seed strategy comparisons only under verified rules.


Updated: 2026-10-30 12:45 +04 (Asia/Baku)

## Latest checkpoint — focal-pass posterior bug fixed (2026-10-30 12:45 +04)
- [Chronological replay](simulator/public-history-replay.js) previously forwarded a valid **seat-0 (known focal) forced pass** into an opponent-only posterior, causing a rejection. It now verifies the focal pass against the known hand but constrains only hidden seats 1 and 2. [Bridge](simulator/public-pass-inference-bridge.js) reports focal passes separately.
- New 3×9 chronological fixture: 5 played tiles, focal hand 8, unknown opponent hands 8+7, **C(15,8)=6,435** exact allocations, **0 hidden pass masks**. A deliberately playable focal hand is rejected. Independent Node 22 fixture combinatorics passed; full repository integration Node/V8 run remains pending.
- **0 new seeded deals, random worlds, complete rounds or forced continuations.** Cumulative unchanged: **1,380,975** incompatible-rule rounds; **1,898,856** continuations; **630,000** opening deals; **1,070,480** seeded hidden allocations. Next unused seed >=3279432. Physical late-arrival branches and block ties remain provisional.
- [Detailed checkpoint](runs/2026-10-30-1245-focal-pass-posterior-fix.md). **Next:** run the full bridge and replay tests from a clean checkout; validate real public histories, then compare matched-seed strategies only under authenticated rules.

Updated: 2026-10-30 11:55 +04 (Asia/Baku)

## Latest checkpoint — bridge integration fixture repaired (2026-10-30 11:55 +04)
- [Regression fix](simulator/public-pass-inference-bridge.js), [run note](runs/2026-10-30-1155-bridge-integration-regression.md). Previous no-pass fixture incorrectly removed a real played tile while keeping the old focal hand; reproduced fail-closed rejection, corrected the fixture, and added a negative guard.
- In isolated V8 CommonJS integration: 5 fixture counts (5,005 / 24,310 / 2,002 / 5,005 / 3,003), 5 bridge negative guards, related replay (100 seeds), posterior (200 seeds) and stock-aware ledger tests pass. **Clean-checkout Node 22 execution still pending.**
- **0 new deals/worlds/rounds/continuations**; cumulative unchanged: 1,380,975 incompatible-rule rounds, 1,898,856 continuations, 630,000 opening deals, 1,070,480 hidden allocations; next unused seed >=3279432. Physical branch/tie rules provisional; no new winning tactic.
- **Next:** clean-checkout Node test and authenticated real forced-pass history; then matched-seed strategy validation.

Updated: 2026-10-30 10:53 +04 (Asia/Baku)

## Latest checkpoint — chronological pass-to-ownership bridge (2026-10-30 10:53 +04)
- [New source](simulator/public-pass-inference-bridge.js), [checkpoint](runs/2026-10-30-1053-public-pass-inference-bridge.md). Connects chronological provisional public replay to exact stock-aware ownership inference with independent posterior-count comparison.
- 5 fixture expectations: 5,005 forced-pass, 24,310 no-pass, 2,002 known draw to seat 2, 5,005 stock-1-1 opening, 3,003 known tile in seat 1. Four fail-closed guards. Node 22 syntax and independent combinatorial oracle checked; **clean-checkout integration test still pending**.
- **0 new deals/worlds/rounds/continuations**. Cumulative unchanged: 1,380,975 incompatible-rule rounds; 1,898,856 continuations; 630,000 opening deals; 1,070,480 hidden allocations. Next seed >=3279432. Physical branch reopening and blocked ties still unresolved; no new winning tactic.
- **Next:** execute bridge test in clean checkout; validate against genuinely logged forced-pass history and physical branch/tie rulings.

## Latest checkpoint — two forced passes distinguish provisional branch models (2026-10-30 06:50 +04)
- [Node exact evidence-strength audit](simulator/late-arrival-pass-evidence-strength.js), [checkpoint](runs/2026-10-30-0650-pass-evidence-strength.md). 8,568 own hands × 1,716 hidden opponent hands (14,702,688 exact joint assignments), 6,864 independent brute-force checks; **0 new seeded deals/worlds/full rounds**.
- Constructed witness: current-only/global forced-pass likelihood ratio **10.4** for one pass, **36.0** for two; own-hand-exclusive evidence among current-model pass observations **1.05% → 60.10%**. **Both physical branch models provisional; not a real-game frequency or win tactic.**
- Cumulative unchanged: 1,380,975 incompatible-rule model rounds; 1,898,856 forced continuations; 630,000 opening deals; 1,070,480 seeded hidden allocations. Next seed >=3279432. **Next:** authenticate physical branch reopening and blocked ties, then analyze real forced-pass history.

## Latest checkpoint — own-hand-conditioned late-arrival posterior (2026-10-30 04:45 +04)
- [Standalone exact Node script](simulator/late-arrival-own-hand-posterior.js); [checkpoint](runs/2026-10-30-0445-late-arrival-own-hand-posterior.md); [JSON](runs/2026-10-30-0445-late-arrival-own-hand-posterior.json). **27,132** own-hand subsets classified; **10,296** opponent-hand brute-force checks passed. **0 new seeded deals, random worlds, or full rounds**.
- Under the forced chronological prefix and fixed seat-1 `2-6`, knowing that seat 0 holds r of five remaining `1-a` stones changes the current-only forced-pass chance from **1.63% (r=0)** through **26.92% (r=3)** to **100% (r=5)**; global-ever-open gives 0% throughout. Exact conditional combinatorics, **not natural prevalence or an authenticated rule**.
- Cumulative unchanged: 1,380,975 incompatible-model rounds; 1,898,856 forced continuations; 630,000 opening deals; 1,070,480 seeded hidden allocations. Next unused seed >=3279432. **Next:** physical branch/tie authentication and public-history-conditioned posterior.

## Previous checkpoint — conditional late-arrival pass census (2026-10-30 03:54 +04)
- [Independent Node 22 census](simulator/late-arrival-conditional-census.js); [checkpoint](runs/2026-10-30-0354-late-arrival-conditional-census.md). All 360 relabels structurally checked, 12 × 27,132 = **325,584** exhaustive conditional hand subsets validated. **0 new deals/seeded worlds/rounds**.
- Conditional on the forced reachable prefix and fixed candidate x-w, **3,003/27,132 = 11.0681%** of seat-1 six-tile assignments force a pass under current-only but allow a move under global-ever-open. Not a natural-game frequency or a verified tactic; physical rule and blocked-tie scoring remain unconfirmed.
- Cumulative unchanged: 1,380,975 incompatible-model rounds; 1,898,856 forced continuations; 630,000 opening deals; 1,070,480 seeded hidden allocations. Next unused seed >=3279432. **Next:** authenticate late-arrival branch and blocked ties.

## Latest checkpoint — reachable chronological branch divergence (2026-10-30 02:52 +04)
- [Reproducible 3×9 chronological contract](simulator/late-arrival-reachable-contract.js); [full checkpoint](RESULTS.md). **360/360** distinct relabelled forced traces passed; each preserves 28 unique stones, 3×9+stock, clockwise turns and the confirmed `1-1` starter draw. **0 new deals/worlds/rounds**.
- Example: `1-1 → 1-2 → 2-2 → 2-4 → 4-4 → 4-5 → 5-5 → 2-5`; next `2-6` is legal under global-ever-open but illegal under all-current-only. Thus the prior synthetic branch-model counterexample is **reachable within both provisional kernels** until the final action; neither physical interpretation is authenticated.
- Node 22 standalone independent test passed; exact GitHub kernel cross-check passed in V8; clean-checkout Node with dependency pending. **No reliable new winning tactic.** Cumulative unchanged: 1,380,975 incompatible-rule model rounds, 1,898,856 forced continuations, 630,000 opening deals, 1,070,480 hidden allocations. Next unused seed >=3279432.
- **Next:** verify physical late-arrival reopening and blocked-tie scoring, then compare matched-seed strategies only under authenticated rules.

## Latest checkpoint — independent probability oracle (2026-10-30 01:46 +04)
- [Independent regression script](simulator/per-double-probability-contract-test.js), [full checkpoint](runs/2026-10-30-0146-per-double-probability-contract.md). **3,840** synthetic exact-probability comparisons passed (three board fixtures × 64 seeds × 2 policies × 2 provisional branch models × 5 p values). **0 new deals/worlds/rounds**; existing totals unchanged.
- **Critical counterexample:** a synthetic late-arrival branch gives 1.0 opponent moves under global-ever-open but 0.0 under all-current-only. Thus prior short-window equality between the models is not physical rule validation. No new win tactic.
- Independent oracle passed in V8; fresh-checkout Node pending. **Cumulative:** 1,380,975 incompatible-rule rounds; 1,898,856 forced continuations; 630,000 opening deals; 1,070,480 seeded hidden allocations; next unused seed >=3279432. **Next:** authenticate physical late-arrival branch unlocking and blocked ties, then full-game win-rate experiments.

## Previous checkpoint — independent new-hand per-double-stop holdout
- [Source](simulator/multi-double-per-double-holdout.js), [checkpoint](runs/2026-10-30-0055-per-double-new-hand-holdout.md), [per-hand JSON](runs/2026-10-30-0055-per-double-new-hand-holdout.json).
- **30,000 new seeded deals, 49,152 new hidden allocations across 24 independent starter hands; 0 new complete rounds**. New per-double continuation break-even **49.46% high / 57.14% low**, previous **26.98% / 51.76%**. At p=.5, high **−0.00145** and low **+0.02030** opponent stones; both exploratory hand-level 95% intervals cross zero. **Earlier high-pip sign does not robustly replicate across hands.** No win-rate claim.
- V8 CommonJS deterministic replay and full run passed; clean-checkout Node pending. Both branch models provisional. **Cumulative:** 1,380,975 incompatible-rule rounds, 1,898,856 forced continuations unchanged; 630,000 opening deals; 1,070,480 seeded hidden allocations. Next unused seed >=3279432. **Next:** Node replay, physical branch/tie fixtures, equal-pip control.

## Latest checkpoint — independent per-double stopping
- [Reproducible source](simulator/multi-double-per-double-stop.js), [full checkpoint](runs/2026-10-29-2351-per-double-stop.md), [JSON](runs/2026-10-29-2351-per-double-stop.json). **0 new deals/worlds/rounds**; reused **49,152** worlds from 24 prior starter hands.
- **Finding:** independent continuation decisions after *each* double yield nonlinear throughput differences: high `(3853-13730p-2034p²)/49152`, low `(7205-12597p-2555p²)/49152`; sign changes at **26.98%** and **51.76%** (previous per-turn mixture: 24.44% / 47.55%). No win-rate claim.
- V8 regression and deterministic replay passed; clean-checkout Node execution pending. Both physical branch models and blocked ties remain provisional.

## Latest checkpoint — independent per-turn chain choices (2026-10-29 22:53:27 +04)
- [Reproducible source](simulator/multi-double-turn-mixture.js) and [checkpoint](runs/2026-10-29-2253-per-turn-chain-mixture.md). Reused **49,152 existing worlds**; **0 new deals/worlds/rounds**.
- Evaluated all four combinations of single versus greedy multi-double response for the two opponents. First opponent's chain policy has larger short-window impact. The per-turn interaction is **zero in every world**, so independent per-turn mixture break-even remains **24.44%** (high-pip) / **47.55%** (low-pip), exactly the whole-world thresholds *in this provisional kernel*.
- V8 CommonJS full regression passed; Node clean-checkout execution pending. No win-rate claim; next independent per-double stopping and physical branch/tie authentication.

## Previous checkpoint — chain-policy break-even and second-opponent residual (2026-10-29 21:46 +04)
- [Reproducible run audit](runs/2026-10-29-2146-chain-policy-break-even-audit.md) and [updated chain script](simulator/multi-double-response-sensitivity.js). Replayed the same **49,152** hidden worlds in the JavaScript research runtime; **0 new deals/worlds/rounds**.
- For a whole-world mixture of one-tile versus greedy multi-double opponent policies, the double-minus-ordinary opponent throughput changes sign at **24.44%** chain worlds (high-pip bots) or **47.55%** (low-pip). Not a per-turn independent mixture estimate.
- Decomposition finds **−277** (high) / **−153** (low) net second-opponent first-move contributions beyond extra double tiles, showing that chain effects propagate between opponents.
- Added optional-stop, four-double, ordinary-first no-chain, and unexposed-double legality fixtures. The matching algorithm and fixtures were exercised in V8; clean-checkout Node remains pending. Physical late-arrival branch/tie rules still provisional.

## Previous checkpoint — optional multi-double opponent replies
- [Run report](runs/2026-10-29-2051-multi-double-response-sensitivity.md) and [reproducible script](simulator/multi-double-response-sensitivity.js).
- Reused 24 starter hands × 2,048 hidden worlds = **49,152 existing worlds**; **0 new deals, 0 new worlds, 0 new full rounds**.
- Opponent stones after starter double versus ordinary: single replies **+0.0784** (high-pip) / **+0.1466** (low-pip), but greedy optional double chains **−0.2423** / **−0.1617**. Prior short-window conclusion reverses under chain policy.
- Branch models and human chain propensity remain provisional; no full-game win-rate claim. Next: clean Node replay, chain legality fixtures, physical branch/tie validation.

## Verified cumulative (incompatible models kept separate)
- **1,380,975** complete model rounds across incompatible branch assumptions; historical 4,000 separate (unchanged).
- **1,898,856** forced hidden-world continuations (unchanged).
- **630,000** deterministic opening deals (600,000 prior + 30,000 new).
- **1,070,480** seeded random hidden-world allocations (1,021,328 prior + 49,152 new); exact partitions separate.
- Engine `qosa-research-0.5.3 + multi-double-per-double-holdout-1.0`; recovered `qosa-1.0.0` 3×9. Both late-arrival branch models **PROVISIONAL**.
- Next unused random seed **>=3279432**.

## Latest checkpoint — new-hand double follow-up (2026-10-29 19:50 +04)
- [Standalone reproducible script](simulator/opening-double-followup-new-hands.js); [full details](RESULTS.md).
- **30,000 new seeded deals** and **49,152 new matched hidden worlds**, 24 *new* stratified starter hands; **0 new full rounds**.
- Playing a double rather than an ordinary stone on the starter return gave opponents **+0.0784** (high-pip policy) / **+0.1466** (low-pip) more immediate moves; increased starter ordinary mobility on the next return by **+1.49 to +1.89**, depending on provisional branch model and opponent policy.
- No proven win-rate benefit. Code was executed as JavaScript in the research runtime with deterministic replay, but not via Node from a clean checkout.
- **Next:** fresh-checkout Node verification; optional multi-double reply sensitivity; authenticate physical late-arrival branches and blocked ties.

## Previous checkpoint — ordinary versus double return mobility (2026-10-29 17:56 +04)
- [Earlier mobility audit](simulator/opening-ordinary-mobility-audit.js); [detailed checkpoint](runs/2026-10-29-1754-opening-ordinary-mobility-audit.md).
- Reanalysis of earlier 24 hands × 1,166,880 exact partitions; **no new allocations**.
- Retaining a matching double improved playable doubles by +1.0096 / +1.0073, but reduced playable ordinary stones by −0.2485 / −0.2767 (high-/low-pip opponents). No win-rate claim.

## Previous checkpoint — exact third-turn return mobility (16:50 +04)
- [Executable source](simulator/opening-third-return-exact.js); [detailed checkpoint](runs/2026-10-29-1650-opening-third-return-exact.md).
- Reused 24 balanced starter hands from 20,000 seeded opening deals; exact 1,166,880 hidden partitions, **0 new seeded deals/worlds/full rounds**.
- Keeping a matching double improved **distinct playable stones** on return by +0.761 (high-pip opponents) / +0.731 (low-pip), but changed **branch placements** by −0.332 / +0.100. Two low-policy hands reversed the legal-stone effect despite higher opponent pass probability.
- No proven win-rate benefit; both late-arrival branch models still provisional. Next: physical late-arrival and blocked-tie rule authentication before full-game claims.

## Earlier checkpoint — exact one-opponent-turn pip-margin census
- [Reproducible source](simulator/opening-first-turn-exact.js); [run checkpoint](runs/2026-10-29-1252-opening-first-turn-exact.md).
- **0 new seeded deals/hidden worlds/full rounds**; exact combinatorial analysis of **4,686,825** post-draw starter hands and **969,475** pip-conflict choices. Two independent exhaustive **48,620-world** fixture checks (97,240 partitions); no samples added to cumulative.
- With 1–2 immediate pip sacrifice, the one-turn relative pip-margin difference (retain matching X-X minus shed larger Y) is **+1.230** against high-pip opponent but **−0.872** against low-pip. With 3+ sacrifice it is **−1.068** and **−3.385**, respectively, despite a ~6 pp first-pass advantage in both groups.
- **Exact one-turn finding only**, not a full-game win tactic; both branch models provisional, blocked tie unresolved. Next: independent gap-balanced two-turn holdout and physical-rule authentication.

## Previous checkpoint — policy-mixture sensitivity (reanalysis only)
- [Executable audit](simulator/opening-policy-mixture-audit.js); [checkpoint](runs/2026-10-29-1153-opening-policy-mixture-audit.md).
- **No new deals/worlds/rounds**; the previous 30,000 deals and 19,200 worlds are reused, not counted again. Six arithmetic policy-mixture comparisons with exact branch-model consistency checks.
- Single-tile opponents: high-pip-policy share required for positive short-window margin is **9.49%** for 1–2 pip sacrifice versus **56.64%** for 3+; optional double chains **0%** versus **38.93%**. Descriptive threshold only, not a win-rate claim.
- Next: independent gap-balanced holdout and physical late-arrival/blocked-tie rule authentication.

## Previous checkpoint — opponent pip margin versus opening double retention
- [Executable source](simulator/opening-pip-margin-holdout.js); [detailed checkpoint](runs/2026-10-29-1053-opening-pip-margin-holdout.md); [raw JSON](runs/2026-10-29-1053-opening-pip-margin-holdout.json).
- Independent **30,000** opening deal seeds and **19,200** matched hidden worlds, 600 selected same-hand conflicts. No new full rounds.
- Keeping matching X-X suppresses opponent stone tempo, but relative remaining-pip margin is **policy-dependent**: high-single **+3.56**, high-chain **+4.76**, low-single **−1.81**, low-chain **−0.97**, seeded-random single **−0.60**, random chain **+0.07** (95% exploratory interval crosses zero), all owned minus higher-pip choice.
- Both provisional branch models agree in this two-turn window; **no confirmed real-game win-rate or universal strategy**. Pip/geometry confounded; selected positions and simple bots.

## Previous checkpoint — opening cost matched
- [2026-10-29 09:48](runs/2026-10-29-0947-opening-cost-matched.md): 30,000 opening deals + 7,680 seeded worlds, mean immediate pip sacrifice 2.746; opponent stone tempo reduced 0.10–0.28 over two turns. Cumulative after prior run 756,368 seeded worlds and 520,000 opening deals.

## Earlier checkpoints
- [Exact repeated opening pass locks](simulator/opening-lock-depth-exact.js): 875/245/20 of 4,686,825 post-draw starter hands guarantee at least 2/4/6 opponent passes respectively, under a very rare confirmed opening configuration; not win-rate evidence.
- [Chronological pass posterior](runs/2026-10-29-0452-branch-order-posterior.md): same board snapshot but different histories can imply 100% versus 36.36% tile ownership in an explicit **provisional** branch model.
- [Four-model blocked-tie audit](runs/2026-10-27-1951-branch-tie-probe.md): tied minima occur in synthetic blocked rounds, but the actual winner/tie convention is unconfirmed.

## NEXT ACTION
Authenticate physical late-arrival branch reopening and blocked-tie scoring. Evaluate double-play follow-up versus ordinary-play alternatives on matched hidden worlds under explicitly labelled models; do not treat short-window playable-double count as a win-rate advantage.

## Latest checkpoint — alternate branch-side chronology paired holdout (2026-10-31 16:54 +04)

- [Reproducible script](simulator/late-return-alt-prefix-paired.js), [run report](runs/2026-10-31-1654-alt-prefix-paired.md). **2,048 new conditional hidden allocations**, seeds 3400264..3402311; 0 new opening deals/full rounds.
- Alternate reachable branch-side trace (same tile sequence, 1-3 right and 1-4 left) produced 111 eligible worlds, 237 common candidate comparisons and 7,584 two-opponent continuations. **81/237 (34.18%)** low-vs-high extension safety reversals; disjoint cohorts 43/125 and 38/112. Prior branch-side chronology was 127/303 (41.9%): descriptive difference, not a significance test.
- Validation in V8 CommonJS-compatible harness: legal chronological replay, forced pass, 28-tile conservation, common-action and deterministic-seed checks passed. Clean Node 22 CLI remains unavailable. Branch rules/ties provisional; no full-game win/minus/regret claim.
- Cumulative: 1,380,975 incompatible-model rounds; 1,898,856 forced continuations; 630,000 opening deals; 1,193,360 seeded hidden allocations. Next seed >=3402312.
- **Next:** test a different tile-sequence prefix or authenticated pass history; resolve physical late-arrival branch unlocking and blocked-tie scoring.

## Latest checkpoint — branch-label tie-break invariance audit (2026-10-31 17:53 +04)
- Run report: runs/2026-10-31-1753-side-label-invariance-audit.md; standalone audit: simulator/side-label-invariance-audit.js. **2,048 new conditional hidden allocations**, seeds **3402312..3404359**, 24 branch-label permutations; 0 new deals/rounds/full continuations.
- Canonicalized tie-break: **0/2,664** permutation mismatches. Raw numeric side-index tie-break: **136** permutation cases changed eligibility; among **2,528** both-eligible cases, **188** classification maps changed (**7.44%**); 16/111 eligible worlds affected at least once.
- Finding: raw branch-index tie-break can inject a label artifact into continuation policy. Use a label-invariant or seeded-symmetric tie-break for future strategy comparisons; keep numeric side order as an explicit ablation.
- Cumulative separate populations: **1,380,975** incompatible-model rounds; **1,898,856** forced continuations; **630,000** opening deals; **1,195,408** seeded hidden allocations. Next seed **3404360**. Physical branch reopening and blocked ties remain provisional; no win/minus/regret claim.
- **Next:** rerun prior late-return cohorts on identical seeds with corrected tie-break, then obtain an authenticated physical pass/branch trace.
