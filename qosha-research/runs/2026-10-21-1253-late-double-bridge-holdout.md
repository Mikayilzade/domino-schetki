# Independent late-game double bridge holdout

Timestamp: 2026-10-21 12:53 Asia/Baku (+04:00). Engine qosa-research-0.5.3; recovered rules qosa-1.0.0; 3x9, provisional branch semantics.

Test: {"passed":true,"selected":8,"seeds":[1360155,1360192,1360144,1360146,1365243,1365383,1365120,1365619],"firstExactAllocations":20}. Executed in GitHub-sourced V8 CommonJS harness (Node CLI not run). Exact hidden-world enumeration, unchanged source states, equal discarded pips and deterministic seed selection validated.

Independent deal seeds: 1360000..1363305 (min-hand-pips); 1365000..1367489 (closed-branch-control); 5796 deals scanned; 56 preselected late positions (14 connected and 14 disconnected per discovery policy), 979 distinct exact allocations, 7832 matched candidate continuations, 0 unresolved; 0 new full strategy rounds.

**Question:** If the focal player has exactly X-X plus two ordinary stones, is early opening X-X less harmful when the two ordinary stones share a number (form a bridge)? Comparison is always against a legal equal-pip ordinary single from the *same position*, on all unseen allocations and four fixed continuation policies. Grouping is pre-outcome, not matched across connected/disconnected hands.

| Feature group | Positions | Exact worlds | Branch-control first-finisher opening-minus-single | Remainder delta (pips) | Minus-finish delta |
| --- | ---: | ---: | ---: | ---: | ---: |
| Connected ordinary pair after opening | 28 | 501 | -26.48 pp | 1.218 | -48.91 pp |
| Disconnected ordinary pair after opening | 28 | 478 | -26.90 pp | 1.153 | -30.05 pp |

Other policy first-finisher deltas (connected / disconnected): min-hand-pips: -26.48 / -26.90 pp; closed-branch-control: -26.48 / -26.90 pp; fast-doubles: -25.87 / -26.90 pp; moderate-double-hold: -27.34 / -28.91 pp.

Positive opening in all four policies: connected 2/28, disconnected 2/28; negative in all four: connected 17, disconnected 17. The exact previous exception seed 1350420 (not included in this independent set) has 0-4, 0-6, 2-2: opening 2-2 leaves connected 0-4 + 0-6, while playing 0-4 leaves 0-6 + 2-2. On 35 exact worlds, opening improved finish-first by 25.71 pp but **reduced beneficial minus finishes by 48.57 pp** against canonical bots. This is a goal tradeoff, not an unconditional recommendation.

Interpretation: connected residual ordinary stones are associated with a less negative/more positive opening effect in this selected cohort; still not causal, because hand composition and post-action geometry differ. Confidence: exploratory; group intervals are position-level and do not account for multiple exploratory comparisons. Full historical strategy scale remains 264,900 complete continuations, separate from exact candidate continuations.

Limitations: first-eligible state selection; branch semantics provisional; exact allocations uniform but not conditioned on previous opponent choices/passes; four deterministic bot continuations; no block winner; 3-tile endgame only; 5-player not studied. Do not claim universal human strategy.

Reproduce: `node qosha-research/simulator/late-double-bridge-holdout.js test`, then `node qosha-research/simulator/late-double-bridge-holdout.js`. Raw: `runs/2026-10-21-1253-late-double-bridge-holdout.json`.

Exact next hypothesis/action: match opening/single comparisons on the same *post-action* legal-tile set and number of available ends, or explicitly report non-identifiability; on fresh seeds >=1370000 replicate connected/disconnected contrast with >=30 positions per group and analyze immediate minus-finish opportunities before recommending opening.
