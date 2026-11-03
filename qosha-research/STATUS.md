# Qoşa açdı research — current status

Last checkpoint: 2026-11-03T06:49:40+04:00 Asia/Baku.

- Latest checkpoint: reachable blocked-state candidate-set audit on 2,000 unique 3×9 deals (seed range 9,000,000–9,001,999), 48,000 model-rounds across global-ever-open, current-all, local-first and local-last branch models.
- All rounds resolved; block preconditions, remainder sums, and candidate sets were checked. The block winner, tie split, score award, and physical branch semantics remain unresolved.
- Block incidence was 3.78% in the global-ever-open model versus 93.20% current-all and 98.37–98.92% one-side-local. This is model sensitivity, not physical-rule evidence. Minimum-pip tie rates among blocked states were 5.20–6.20%; no strategy promoted.
- New cohort is separate: 2,000 unique allocations / 48,000 model-rounds. Existing cohorts remain separate: 2,120 tie-break seed draws / 12,720 paired rounds; 88,886 prior allocations; 1,074 multi-action positions; 5,863 state-world assignments; 5,000 invariant-smoke rounds. No global dedup or historical-baseline pooling.
- Exact next action: on a disjoint seed holdout, retain replay traces for every tied-minimum block and stratify candidate-set / last-passer diagnostics by policy mix and seat rotation. Keep all winner/scoring interpretations provisional.

Report: qosha-research/runs/2026-11-03-0649-reachable-block-candidate-audit.md
Data: qosha-research/runs/2026-11-03-0649-reachable-block-candidate-audit.json
Reproducer: qosha-research/simulator/block-reachable-candidate-audit.js
