# Matched retained-pass role holdout — 2026-10-15 20:48 Asia/Baku

Engine: `qosa-research-0.5.3`; rules: recovered `qosa-1.0.0`, branch-opening assumptions provisional. Mode: 3 players × 9 stones. No rule/engine mutation.

**Reproduce:** `node qosha-research/simulator/pass-role-cycle-matched-runner.js test`; then `node qosha-research/simulator/pass-role-cycle-matched-runner.js 500000 600000`. The source-of-truth runner emits all 42 per-position policy summaries and exact matched seed pairs as JSON. V8 CommonJS self-test and full numerical run passed; Node CLI was not executed.

**Fresh seeds:** 500000..599999 (100,000 deterministic deals scanned). 234 eligible first-discovered positions: 29 next-only and 155 third-only retained-pass exposures; 6 both and 44 neither excluded. Match groups only after selecting positions; do not mix with older samples.

**Evaluation:** 42 unique positions, 187 exhaustive hidden allocations, 1,122 paired candidate continuations (3 policies × 2 candidate moves × 187 allocations). Policies: closed-branch-control, min-hand-pips, fast-doubles. Continuation seeds `61000000+1000*dealSeed+lexicographicAllocationIndex`. New complete strategy rounds: 0. Previously validated cumulative complete rounds: **180,000**, historical 4,000 kept separate.

**Primary strict matching:** 9 pairs, matching exposed player's remaining hand size, other opponent's hand size, elapsed completed pass cycles, retained-pass count, opened-number count and distinct branch-end count. Next/third seed pairs:
`504596/580709, 507407/520385, 508713/503917, 519992/515028, 522809/578243, 583721/550698, 587724/583060, 587862/531595, 595122/509320`.
Third-minus-next mean additional elimination fraction = **−0.0741** (−7.41 percentage points), exact paired sign-flip p=1.00; information gain = **−0.1761 bits**, p=1.00. Eight pairs have zero difference; the sole nonzero pair favors next. Mean next-pass Brier improvement difference (third minus next) = −0.0494.

**Sensitivity:** 20 relaxed pairs matched on exposed hand size, pass-age cycles, opened-number count and end diversity; third-minus-next elimination fraction = **−0.00833** (−0.83 pp), information difference = +0.0500 bits. These pairs overlap the strict sample and are **not independent**.

**Method finding:** raw pass ages differ mechanically by one turn across roles: next-only `age=2+3k`, third-only `age=1+3k`. Match `k` (completed cycles), not raw age. The prior 38-vs-4 exclusions comparison was exposed to severe hand-size imbalance: next-only is almost always 2 stones, third-only often 3–4. After matching, no reliable role advantage is established; p=1 with 9 pairs and many ties does not prove equivalence. **No new gameplay strategy rule.**

**Limitations/confidence:** high for deterministic matched accounting; low for general role inference. Strict cohort only 9 pairs; branch geometry matched by diversity, not exact end identities; equal prior on hidden allocations; deterministic first-eligible selection, no conditioning on voluntary opponent choices, three bot policies, unassigned block winner, provisional branch-opening rules.

**Exact next action:** independent seeds 600000..749999; target more strict pairs, stratify by pass count, report matched exclusion fraction and information bits, then test whether pass conditioning improves *move-choice regret* rather than only hidden-world elimination.