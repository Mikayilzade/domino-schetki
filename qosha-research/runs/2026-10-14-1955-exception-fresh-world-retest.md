# Fresh-world exception retest — 2026-10-14 19:55 Asia/Baku

- Engine: `qosa-research-0.5.3`; rules: recovered `qosa-1.0.0`; 3 players × 9 stones.
- Deals/positions: **3 previously selected positions** (seeds 4300746, 4301813, 4301845; turns 14, 10, 9). New complete strategy rounds: **0**.
- New independent draws: **300 hidden-world samples**, 100 per position; **1,800 candidate continuations** (2 forced actions × 3 bot policies × 300 worlds); no unresolved continuations.
- Exact world seed formula: `(1500000000 + Math.imul(dealSeed,73) + worldIndex) >>> 0`; only indices **20..119** used for this retest, disjoint from the discovery indices 0..19. Sampled allocations may repeat by chance.
- Strategies: `closed-branch-control`, `min-hand-pips`, `fast-doubles`; position discovery: `closed-branch-control`. Forced actions and visible state are the same as the earlier 20-world discovery. Single and double alternatives have equal discarded pips, hand size, and playable unknown-tile count K, but not identical branch geometry.
- Sign convention: **single minus double**. Negative first-finish percentage points favor opening the double.

| Seed / turn | Single / double | Branch control | Min pips | Fast doubles | Next opponent legal actions: single restricts / double restricts / equal |
| --- | --- | ---: | ---: | ---: | --- |
| 4300746 / 14 | 2-4 left / 3-3 | +61 pp | +2 pp | +4 pp | 78 / 11 / 11 |
| 4301813 / 10 | 3-5 down / 4-4 | **−33 pp** | **−37 pp** | −3 pp | 85 / 5 / 10 |
| 4301845 / 9 | 3-5 down / 4-4 | −5 pp | −9 pp | +8 pp | 67 / 10 / 23 |

Other diagnostics (single minus double):
- 4300746: mean focal remainder −3.04 / −0.31 / −0.79 pips; minus-finish +60 / 0 / 0 pp; next-opponent pass flips 17/100.
- 4301813: mean focal remainder +1.34 / +0.84 / −0.26 pips; minus-finish −20 / −29 / 0 pp; **zero next-opponent pass flips**.
- 4301845: mean focal remainder −0.45 / −0.22 / +0.05 pips; minus-finish +1 / 0 / 0 pp; zero next-opponent pass flips.

**Key finding (model-specific):** seed **4301813** is a repeatable opening-favorable counterexample under two policies, even though keeping the double reduces the next opponent's legal-action count in 85/100 sampled worlds. Immediate mobility alone is therefore not a reliable decision rule; longer-term branch access/tempo and finishing doubles matter. Seed 4300746 reversed the originally opening-favorable sign, showing the original 20-world discovery was noisy; seed 4301845 remains too weak to promote.

**Concrete state fixture for 4301813:** focal hand `2-6,4-4,0-2,3-5,2-4,0-0`; pre-move four ends `up=4,left=5,right=2,down=5`, opened numbers `1,3,5,6`. Playing `3-5` on down changes the down end to 3 and retains `4-4`; playing `4-4` opens number 4 without changing four ends. Both moves discard 8 pips; K=7 with overlap 5.

**Validation:** the persisted `simulator/exception-fresh-world-retest.js` self-test and 100-world replay executed successfully using deterministic V8 CommonJS loader; source replay returns 3 positions, 300 fresh worlds and 1800 continuations. Node CLI was not executed. Historical verified 180,000 complete strategy rounds unchanged (older 4,000 historical rounds separate).

**Confidence / limitations:** exploratory, highly selected three positions; no multiple-testing correction, no fresh-deal preregistered holdout; uniform hidden allocations with replacement ignore earlier opponents' decisions; deterministic bots, provisional double-opening branch semantics, and block winner not assigned. Do not generalize a win percentage to human play.

**Exact next action:** run 100+ *new disjoint* hidden worlds for seed 4301813 and matched non-exception controls; record opponent actual first reply, four-end geometry and access to `4` on subsequent turns; test whether advantage survives a changed continuation policy. Do not change scoreboard/PWA files.
