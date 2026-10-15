# Retained passes and move preferences — 2026-10-15 22:51 Asia/Baku

Engine: `qosa-research-0.5.3`; rules: recovered `qosa-1.0.0`; mode: 3 players × 9. Branch-opening semantics provisional.

Source of truth: `runs/2026-10-15-2151-pass-role-cycle-independent-600000-749999.json`, commit `6199411741d1e0f4bdc91f959ab6d20fb641e4c0`. This is a NEW POST-ANALYSIS of the already persisted sample, not a new simulation. Discovery seeds 600000..749999, 150,000 deals scanned in the prior run; 64 distinct positions, 298 exact hidden allocations, 1,788 existing paired candidate continuations. Existing policies: closed-branch-control, min-hand-pips, fast-doubles. The strict 16 matched pairs and sensitivity 31 matched pairs overlap; the union is 64 distinct positions.

Question: does conditioning on an opponent's earlier empty-stock pass, retained after subsequent plays, actually change which equal-pip move is preferred (connector versus unrelated ordinary stone)?

Analysis convention (not a gameplay rule): compare connector-minus-other on finish-first probability (higher is better); if tied, on mean remaining pips (lower is better); if tied, on minus-finish probability (higher is better). If all tie, report an explicit tie, not a chosen move. Use absolute tolerance 1e-10. Evaluate `details[].policy[policy][metric].legacy` and `.conditioned` from the source JSON.

**Verified arithmetic:**
- Legacy pass-compatible allocations = **241**; all-pass-compatible allocations = **224**; **17 excluded** by retained historical passes.
- Only **6 of 64 positions** had a posterior change: 1/32 next-only positions (2 allocations excluded), 5/32 third-only (15 excluded).
- Across 64 positions × 3 continuation policies = **192 paired preference comparisons**: **0 strict connector-to-other or other-to-connector reversals**; **3 preference-to-tie transitions**; **189 unchanged**.
- Finish-first candidate difference changed in **0/192**; minus-finish candidate difference in **0/192**; mean-remainder candidate difference in **10/192**.
- Closed-branch-control connector / other / tie: **21 / 33 / 10** legacy; **20 / 33 / 11** conditioned. Seed **686517** connector→tie.
- Min-hand-pips: **20 / 30 / 14** legacy; **19 / 30 / 15** conditioned. Seed **686517** connector→tie.
- Fast-doubles: **15 / 15 / 34** legacy; **15 / 14 / 35** conditioned. Seed **678033** other→tie.
- Both changed seeds occur in the strict and sensitivity cohorts. Three preference-to-tie transitions arise from **only two distinct positions**.

**Finding:** historical passes sometimes remove impossible hidden hands but in this specific late-game equal-pip choice family did **not** reverse a strict move preference or alter the finish-first comparison. This is useful negative evidence against equating information gain with strategic gain; **not** proof that pass history never matters.

Reproduce: parse the referenced JSON, verify 64 unique `details[].seed`, sum `details[].worlds` = 298, sum `legacy` = 241, sum `conditioned` = 224; for each of three `strategies` and 64 rows compare `policy[p].finish.legacy/conditioned`, then negate the sign of `remainder`, then use `minus`. Count connector=+1, other=-1, tie=0. The arithmetic was independently checked in JavaScript V8 during this checkpoint. Node CLI was not executed.

Accounting: **0 new full strategy rounds, 0 new hidden allocations, 0 new continuations**. Verified cumulative full matched-seat strategy rounds remain **180,000**; historical 4,000 separate. Reused observations are not double-counted.

Confidence: high for descriptive arithmetic, low for general inference. Limits: first-eligible selected positions, only 6 posterior-changing cases, tiny exact world supports, deterministic continuation bots, equal allocation prior, not conditioning on voluntary opponent action choice, unassigned block winner, provisional branch semantics, overlapping matched cohorts. No statistical significance claim or human-play optimality claim.

Exact next action: build and execute independent fresh-seed **750000..899999** posterior-aware move-choice regret runner. Fix visible focal hand/table/known stones, enumerate exact hidden allocations, compare **all legal actions** under legacy and retained-pass posteriors with identical continuation policies/world seeds; measure strict recommendation changes and realized regret on the known true deal (finish-first, mean remainder, minus separately). Stratify by whether the posterior actually changes. Validate on seeds 686517 and 678033 first. Do not infer benefit solely from world elimination.
