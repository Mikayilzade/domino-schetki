# 2026-10-15 11:47 (+04): independent equal-pip exact holdout

Engine qosa-research-0.5.3; rules qosa-1.0.0; 3x9. Deal seeds 92200..105392 inclusive; 13,193 scanned; 40 selected reachable positions; 281 exhaustively enumerated hidden opponent allocations; 1,686 matched candidate continuations; 0 unresolved; 0 new complete rounds. Cumulative validated complete strategy rounds: 180,000 (historical 4,000 separate). The previous 10 positions (90000..92172) are independent and excluded from these estimates.

Comparison: first legal same-pip X-Y connector vs non-X single, both retaining X-X and another X-Y; fixed focal state and known played tiles, identical hidden allocations and continuation policy. Exact world enumeration by combinations of opponent hands, 28 unique tiles checked. Seed for continuations: 16000000 + 1000*dealSeed + allocationIndex. Policies: closed-branch-control, min-hand-pips, fast-doubles. V8 CommonJS execution, not Node CLI.

Connector-minus-other finish-first (equal weight per position):
- closed-branch-control: -7.875 percentage points; exploratory 95% CI [-17.93,+2.18] pp; positive/negative/tied 4/8/28.
- min-hand-pips: -7.458 pp; CI [-17.51,+2.60] pp; 4/7/29.
- fast-doubles: -0.321 pp; CI [-1.77,+1.13] pp; 2/2/36.

Mean remainder pips: +1.426 / +1.342 / -0.533, respectively. Minus-finish frequency difference: -8.798 / -8.798 / -0.357 pp. Block rate difference: 0 / 0 / -0.417 pp.

Exploratory next-opponent immediate-pass comparison: 13 positions where connector induced more passes had mean +5.31 pp finish-first; 12 with fewer passes had -25.02 pp; 15 unchanged had -5.59 pp (closed-branch-control). Post-hoc moderator, NOT a causal conclusion. Counterexample seeds 92377, 92789, 103218 showed -100 pp across six exact allocations each; seed 93566 showed +60 pp and seed 94429 +52.38 pp.

Limitations: first-eligible selection, assumed branch opening, only three bot policies, uniform hidden allocations ignore previous opponent choices, block winner not assigned, exploratory intervals uncorrected. No reliable universal connector rule established. Executable standalone runner write was rejected by connector safety checks; do not claim persisted runner.

Next: retry persisting runner, execute Node regression, independently sample 40+ positions with different discovery policy; match four-branch geometry and next-player hand size before analyzing pass effects.
