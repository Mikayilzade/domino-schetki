# 2026-10-15 10:53 Asia/Baku — independent holdout
Engine qosa-research-0.5.3 / qosa-1.0.0 (branch rules provisional); 3x9.
Discovery: min-hand-pips, first eligible equal-pip connector vs unrelated single, retaining X-X and another connector. Seeds 120000..129569 (9570 scanned), 30 positions. 50 hidden worlds each; seed=37000000+1000*dealSeed+worldIndex. 1500 worlds, 9000 paired continuations; 0 new full rounds (verified total 180000, historical 4000 separate).
Connector minus unrelated first-place: closed-branch -16.47 pp, min-pips -15.80 pp, fast-doubles +1.73 pp. Immediate next-opponent response changed 745/1500; pass/play flipped 452/1500.
Only 3..15 distinct hidden allocations per 50 samples; CIs exploratory, selection/bots/branch semantics provisional. V8 replay test seeds 120139,120707 passed; Node not run. Standalone runner write blocked.
Next: exact sparse-world enumeration, independent four-end/response controls.
