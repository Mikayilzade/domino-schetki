# Qoşa controlled double-swap holdout — 2026-10-16 16:50 Asia/Baku

Engine qosa-research-0.5.3; recovered qosa-1.0.0; 3 players × 9 stones. Provisional branch opening rules.
Deals: 4000 distinct seeds, cohorts A 1098000..1099999 and B 1100000..1101999. Two opponent policies: moderate-double-hold and fast-doubles. 4196 completed deterministic continuations; 1554 swap comparisons, 0 unresolved.
Strategies for focal player: closed-branch-control vs moderate-double-hold.
Focal hand contains 2-2 and 6-6; replace 2-2 with another player's 3-3, 4-4 or 5-5. Compare policy advantage on the same deal before/after swapping. Opponent hand changes too.
Bootstrap 95% intervals for all 12 differences include zero. No reproducible special advantage for 2-2 plus 6-6.
Cumulative in this branch lineage: 474764 + 4196 = 478960 completed continuations; quarantined and historical excluded.
Confidence: exploratory; V8 runtime, not Node CLI; branch rules provisional, small subgroup samples, multiple comparisons uncorrected. No live scoreboard files touched.
Next: persist reproducible swap runner, test branch-end/connector-matched independent holdout.
