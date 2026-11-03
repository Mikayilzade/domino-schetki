# Reachable block candidate-set audit — 2026-11-03T06:49:40+04:00 (Asia/Baku)

## Scope and reproducibility

- **Engine/rules:** `qosha-research-0.5.3`; recovered `qosa-1.0.0`, primary 3 players × 9 tiles + one stock tile. Branch semantics and block winner/tie interpretation remain provisional.
- **Seed set:** 9000000–9001999; 2000 deterministic seed draws, 2000 unique seat-labelled allocations, 0 duplicate allocations.
- **Rounds:** 12,000 rounds per branch model; 48,000 total model-rounds. Two policy mixes × three seat rotations per deal. All rounds resolved.
- **Policy mixes:** (1) random-legal / min-hand-pips / closed-branch-control; (2) fast-doubles / moderate-double-hold / closed-branch-control.
- **Initializer:** recovered 1-1 opening; previous-winner index = seed modulo 3 when 1-1 is in stock; canonical-up follow-up remains a representation convention.
- **Reproducer:** `node qosha-research/simulator/block-reachable-candidate-audit.js 9000000 2000`; test: `node qosha-research/simulator/block-reachable-candidate-audit.js test`.
- **Pilot regression:** {"passed":true,"pilotDeals":8,"roundsPerModel":48,"totalModelRounds":192,"deterministicReplay":true,"assertions":"allocation census, round census, resolved outcomes, candidate-set census"}.
- **Execution:** exact GitHub source blobs were loaded and executed in an isolated V8 harness. Clean Node checkout was unavailable because the container could not resolve `github.com`.

## Model-labelled block diagnostics

A block is the coded round-driver condition: stock empty and at least three consecutive passes. No winner, tie split, score award, or 101-match result is assigned.

- **Global-ever-open:** current research dispatcher; a played double opens its number globally.
- **Current-all:** a double opens every side ending in that number at play time; later-arriving sides remain locked.
- **Local-first / local-last:** one currently matching side is opened, chosen by first/last in up-left-right-down order. These are explicit order-dependent counterfactuals.

The minimum-pip set is only a candidate set. Fewest remaining tiles is a contrast metric; last passer is recorded without priority.

| Branch model | Block rate (deal-clustered 95% CI) | Min-pip tie rate among blocks (95% CI) | Last passer in min-pip set (95% CI) | Min-pip vs fewest-tile candidate-set agreement (95% CI) |
|---|---:|---:|---:|---:|
| Global-ever-open | 453/12000 = 3.77% (3.43%–4.12%) | 24/453 = 5.30% (3.25%–7.35%) | 183/453 = 40.40% (35.79%–45.00%) | 69/453 = 15.23% (11.88%–18.58%) |
| Current-all | 11184/12000 = 93.20% (92.69%–93.71%) | 693/11184 = 6.20% (5.72%–6.68%) | 5000/11184 = 44.71% (43.71%–45.70%) | 5304/11184 = 47.42% (46.37%–48.48%) |
| Local-first | 11804/12000 = 98.37% (98.09%–98.64%) | 640/11804 = 5.42% (4.96%–5.89%) | 4926/11804 = 41.73% (40.71%–42.75%) | 5221/11804 = 44.23% (43.12%–45.34%) |
| Local-last | 11870/12000 = 98.92% (98.70%–99.13%) | 617/11870 = 5.20% (4.74%–5.66%) | 4962/11870 = 41.80% (40.77%–42.83%) | 5193/11870 = 43.75% (42.62%–44.88%) |

## Most useful finding

Block incidence is dominated by the branch-model assumption in this coded cohort: **3.77%** under global-ever-open versus **93.20%–98.92%** under the current-all / one-side-local models. This is model sensitivity, not evidence that any branch rule is the physical rule.

Within blocked rounds, minimum-pip ties were **5.30%–6.20%** across these models. The minimum-pip and fewest-tile candidate sets also differ frequently; neither criterion is authenticated as the block winner rule.

## Validation, confidence, and limits

- 48,000 resolved round checks; 35,311 block-precondition checks; 35,311 remainder consistency checks; 35,311 candidate-set checks.
- Approximate 95% intervals use deal-level clusters; all six mix/rotation rounds for a deal stay in the same cluster.
- Confidence is high for reproducibility and internal measurements under the coded models. No physical branch rule, block winner/tie rule, score allocation, or strategy superiority is authenticated.
- The random-legal action index may select a different action when model-specific legal-action lists differ. Cross-model trajectories are therefore descriptive model sensitivity, not a pure causal intervention.

## Separate cohort scale

This checkpoint adds 2,000 unique deals and 48,000 model-rounds. No global deduplication or pooling with historical baselines was performed.

Prior separate cohorts remain unchanged: 2,120 tie-break seed draws / 12,720 paired rounds; 88,886 prior deal allocations; 1,074 selected multi-action positions; 5,863 state-world assignments; and 5,000 invariant-smoke rounds.

## Exact next action

On a disjoint seed holdout, retain replay traces for every tied-minimum block and test candidate-set / last-passer diagnostics by policy mix and seat rotation. Keep all block winner and scoring interpretations provisional.

Data: [JSON run record](qosha-research/runs/2026-11-03-0649-reachable-block-candidate-audit.json). Reproducer: [simulator](../simulator/block-reachable-candidate-audit.js).
