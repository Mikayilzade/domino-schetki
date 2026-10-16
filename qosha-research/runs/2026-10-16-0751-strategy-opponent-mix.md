# Independent opponent-mix holdout — 2026-10-16 07:51 Asia/Baku

Engine `qosa-research-0.5.3`; recovered `qosa-1.0.0` 3×9. Branch semantics remain provisional. Fresh seeds A `1030000..1039999`, B `1040000..1049999`, split into 5000-seed disjoint blocks. Three seat rotations per deal. **20,000 new deals, 60,000 complete rounds, zero unresolved**. Historical 4,000 separate; validated prior 300,000 + 60,000 = **360,000 complete strategy rounds**.

A (closed-branch / moderate-hold / fast-doubles) combined finish-first percentages: **44.32% / 32.557% / 19.027%**. B (closed-branch / min-pips / random-legal): **42.08% / 26.747% / 27.743%**. Both 5000-seed blocks for each lineup recorded in the linked JSON with finish counts, mean/median remainder, minus counts, round length and blocks. All percentages mean **finished first**, not overall match first-place; blocked rounds have no winner assignment.

**New finding:** branch-control's comparative finish-first performance has now been measured against two previously untested bot lineups on independent seed sets. This is a model/opponent-mix result, not a general rule for human play.

**Validation and code fix:** deterministic 20-seed replay passed; 10-seed regression exposed and fixed a reporting crash when the same strategy occupies two seats (`finalPips` was deleted twice during summary finalization). New `Set(strategies)` finalization passed 60/30 duplicate appearances, zero unresolved. Does not change move selection, rules or previous metrics.

**Confidence/limits:** deterministic, same-seed seat rotations and independent 5000-seed blocks; rotations correlated; branch locking provisional; bot opponent selection matters; block winners and match score not modeled; 5-player/loneZero unresolved. No inference about pass-history benefit in this checkpoint.

**Reproduce:** `runTournament({strategies,startSeed,count:5000,maxTurns:200,salt:0})` for each exact block in `runs/2026-10-16-0751-strategy-opponent-mix.json`. Tests: duplicate strategies 10 seeds and identical 20-seed replay.

**Next:** evaluate two copies of branch-control against one moderate-hold on new matched seeds to estimate self-play robustness, then revisit pass-history regret with posterior support >1 and unequal-pip legal alternatives.
