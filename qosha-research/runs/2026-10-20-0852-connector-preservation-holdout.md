# Qoşa açdı — connector-preservation matched holdout
Timestamp: 2026-10-20, 08:57 Asia/Baku (+04).
Engine qosa-research-0.5.3, recovered qosa-1.0.0, 3×9.
Runner: `qosha-research/simulator/connector-preservation-holdout.js`; command `node qosha-research/simulator/connector-preservation-holdout.js 1305000 1200 48 40`.
Validation: V8 CommonJS deterministic self-test {"passed":true,"positions":3,"forced":48}; Node CLI not run.
Seed range 1305000..1306199, scanned 1200 deals, 306 late-double states, 45 both-class eligible, selected 40. 1920 matched hidden allocations (24 training and 24 holdout per state), 12672 forced continuations, 0 unresolved.
Strategies: min-hand-pips and closed-branch-control continuation. Compare legal ordinary singles keeping X-X + X-Y connector versus breaking it within the SAME state; choose best within class on training worlds and evaluate on disjoint identical hidden holdout worlds. Not a double-vs-single comparison.
- min-hand-pips: preserve minus break first-place 10.73 pp, exploratory 95% position CI [2.78, 18.68] pp; remainder -1.041 pips; minus-finish 4.79 pp; keep/tie/break 17/14/9.
- closed-branch-control: preserve minus break first-place 9.69 pp, exploratory 95% position CI [2.04, 17.34] pp; remainder -1.017 pips; minus-finish 5.21 pp; keep/tie/break 16/16/8.
New finding: provisional model-specific advantage of retaining a double-plus-connector pair in positions offering both single-action classes. Not a universal rule; hand size 3 n=8, hand size 4 n=32; next opponent <=2 stones n=3, 3-4 n=25, 5+ n=12; double 0-0 n=21 and 2-2 n=12, other strata small. See JSON for per-position and stratified metrics.
Confidence/limitations: exploratory, first eligible state selection, potential pip-shedding confounding, provisional branch-opening semantics, deterministic opponents, first finisher not full match winner, block winner unspecified, no multiple-testing adjustment. World allocations conditional on observed no-stock passes, not full opponent-choice posterior.
Cumulative: 266,700 previously verified full strategy rounds unchanged; 54,096 prior + 12672 new = 66768 paired continuations. Historical 4,000 separate.
Exact next hypothesis/action: repeat fresh seeds 1307000..1308999 with >=64 worlds per position; restrict to equal-pip ordinary single comparisons to distinguish connector structure from immediate pip shedding; stratify by opponent stones and double number.
