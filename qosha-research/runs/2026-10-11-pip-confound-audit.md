# 2026-10-11 11:51 Asia/Baku: pip-discard audit
Engine qosa-research-0.5.3; rules qosa-1.0.0; 3 players x 9 stones.
New deals: 0. Reanalysed persisted 2026-10-10 exact-late-double-74000.json:
100 positions; 671 exhaustive hidden allocations; 5622 continuations; seed set 74000..75999.
Policies: closed-branch-control, min-hand-pips, fast-doubles.
Connector vs immediate double: connector discarded more pips in 81 positions (mean +3.08), fewer in 17 (mean -1.85), equal in 2. Overall connector pip-discard advantage +2.18.
Closed-branch-control finish-first deltas by those strata: +22.84, +23.24, +29.17 percentage points respectively.
Finding: earlier remainder benefit is confounded by pip disposal; finish advantage is not solely explained by pips, but connector-specific causal value is not identified.
Confidence: exact reaggregation of existing rows, observational and small strata; no independent sample.
Validated cumulative full strategy rounds: 180000; historical 4000 separate. No new rounds credited.
Next: persist and run equal-pip connector-vs-unrelated control on independent seeds 80000..89999, identical exhaustive hidden worlds and three policies.
