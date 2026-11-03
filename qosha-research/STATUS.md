# Qoşa açdı research — current status

Last checkpoint: 2026-11-03T08:50:37+04:00 Asia/Baku.

- Latest checkpoint: paired mix/rotation analysis of tied-minimum block traces on 2,000 unique 3×9 deals (seeds 9,004,000–9,005,999), 48,000 model-rounds across four provisional branch models.
- All rounds resolved; 1,976 tied-minimum traces replayed exactly, 0 mismatches. No stable policy-mix-by-seat-rotation interaction in tied-trace incidence was established; selected discovery effects cross zero and did not reproduce directionally.
- Block incidence remains highly branch-model-sensitive: global-ever-open 3.82%, current-all 93.30%, local-first 98.49%, local-last 98.86%. These are counterfactual model measurements, not physical-rule evidence.
- No block winner, tie split, points, or match score assigned. No strategy promoted; no historical baseline pooled.
- Block-audit series: three disjoint seed windows, 6,000 seed draws / 144,000 model-rounds. Allocation uniqueness checked within each cohort; no cross-cohort allocation deduplication.
- Other cohorts remain separate: 2,120 tie-break seed draws / 12,720 paired rounds; 88,886 prior allocations; 1,074 multi-action positions; 5,863 state-world assignments; 5,000 invariant-smoke rounds.

Exact next action: stop expanding the mix/rotation interaction. Return to engine validation with exhaustive mixed-finish fixtures for 1–4 closing doubles (−10/−20/−30/−40), score-floor boundaries, and legal branch/open-state transitions. Keep block winner/scoring provisional.

Report: qosha-research/runs/2026-11-03-0850-block-tied-minimum-paired-mix-rotation-holdout.md
Data: qosha-research/runs/2026-11-03-0850-block-tied-minimum-paired-mix-rotation-holdout.json
Reproducer: qosha-research/simulator/block-tied-minimum-paired-contrast.js
Regression test: qosha-research/simulator/block-tied-minimum-paired-contrast-test.js
