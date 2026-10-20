# Qoşa açdı — independent late-double holdout
Timestamp: 2026-10-20 07:50 Asia/Baku (+04:00).
Engine: qosa-research-0.5.3; rules: qosa-1.0.0; mode: 3 players × 9 tiles.
Source commit: 31d8634c82d2611cd72779f89b748a96a96ad425.
Runner: qosha-research/simulator/late-double-crossfit.js.
Reproduce: node qosha-research/simulator/late-double-crossfit.js 1304000 1000 64 90.
Validation: runner.test() passed in V8 CommonJS harness; Node CLI not executed.

Seeds: 1304000..1304303 (304 scanned deals); 90 selected late-double decision states.
Hidden allocations: 64 per state (32 training + 32 disjoint test).
Continuation policies: min-hand-pips and closed-branch-control.
Forced continuations: 37,888; unresolved: 0.
Method: select strongest legal double-sequence and strongest legal ordinary single on training worlds; evaluate both on the same held-out worlds. First eligible 2–4-tile hand with both classes legal, after turn 12 and empty stock.

Min-hand-pips continuation: double minus single first-finisher probability = -19.27 percentage points (exploratory position-cluster 95% CI -25.51 to -13.04); mean remaining pips +1.665; minus-finish probability -21.04 pp. Double better / equal / single better = 11 / 23 / 56 states.
Closed-branch-control continuation: double minus single first-finisher probability = -22.01 pp (95% CI -28.20 to -15.83); mean remaining pips +1.823; minus-finish probability -28.58 pp. Double better / equal / single better = 9 / 23 / 58 states.
Alpha28 vs alpha20 chosen action differed in only 2/90 states; average first-finisher delta -0.21 pp under either continuation.

Exploratory double-number breakdown, double-minus-single first-finisher pp:
- 0-0: -17.26 (n=46) min-pips; -18.55 (n=47) branch-control.
- 2-2: -25.99 (n=22) min-pips; -27.98 (n=22) branch-control.
- 3-3: -12.24 (n=12) min-pips; -22.16 (n=11) branch-control.
- 4-4: -15.91 (n=11) min-pips; -18.18 (n=11) branch-control.
- 5-5 and 6-6: n=1 each; insufficient to interpret.

Finding: On this preselected late-game state class, keeping the double and playing an ordinary stone is associated with a substantially higher first-finisher probability. This replicates the direction of the previous independent 28-state crossfit. It is NOT a universal double-holding rule.
Confidence/limitations: exploratory unadjusted CIs; position selection is conditional and not representative of all moves; provisional branch-opening rules; deterministic bots; first finisher is not full-match winner; block winner unspecified; no opponent-choice posterior; double-number strata are noncausal.
Cumulative: 266,700 previously verified full strategy rounds (unchanged), plus 16,208 previous and 37,888 new paired continuations = 54,096 paired continuations; historical 4,000 kept separate.
Next hypothesis/action: fresh seeds 1305000..1305999, >=64 hidden worlds, stratify by hand size (2/3/4), next-opponent stones, connector presence and double number. Pre-register connector-preservation rule and compare against matched nonconnector double-vs-single controls under both policies.
