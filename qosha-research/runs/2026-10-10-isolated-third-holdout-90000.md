# Isolated double third exact holdout — 2026-10-10 17:49 Asia/Baku

Engine/rules: qosa-research-0.5.3 / qosa-1.0.0; 3x9.
Seeds: 90000..92999; 1,460 scanned deals, 30 eligible positions, 306 exhaustive hidden allocations, 2,817 candidate continuations; 0 unresolved; 0 new full rounds.
Eligibility: first reachable position/deal under closed-branch-control discovery; focal 3–5 stones, next opponent 1–2, empty stock, isolated X-X without X-Y connector; both X-X and ordinary single legal.
Comparison: retain X-X with an ordinary single versus opening X-X now, matched hidden allocations, equal action-class and position weighting.
Finish-first advantage of retention: +27.01 pp closed-branch-control (20 positive, 9 ties, 1 negative); +25.77 pp min-hand-pips; +25.77 pp fast-doubles. Closed-branch mean remainder -1.27 pips; minus-finish +28.76 pp.
X branch-end count: one X end n=4, +4.58 pp; >=2 X ends n=26, +30.46 pp (descriptive only).
Opening-favorable exact exception: seed 91314, X=2, hand [0-3,2-2,0-5], ends [5,2,2,2], opening advantage 20 pp under all 3 policies.
Validation: deterministic in-memory V8 CommonJS self-test seeds 90000 and 90160 passed; Node CLI not run. Source state immutable. Standalone runner/data persistence blocked by GitHub safety checks, so this checkpoint is NOT independently executable until code is saved.
Limitations: uniform hidden allocations not conditioned on prior decisions; assumed branch rules; simple bot continuations; block winner unassigned; quota/first-eligible selection; exploratory estimates.
Cumulative: 180,000 validated complete strategy rounds (4,000 historical separate); exact allocations counted separately.
Next: persist runner, reproduce seed 91314 with branch-end controls; independent discovery policy holdout on fresh seeds.
