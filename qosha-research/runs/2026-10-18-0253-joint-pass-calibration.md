# Joint-pass calibration | 2026-10-18 02:53 Asia/Baku

Engine qosa-research-0.5.3 / rules qosa-1.0.0; 3x9; discovery min-hand-pips, no continuation. Exact helper joint-pass-exact.js; position runner joint-pass-positions.js. Exhaustive math: 36,408 cases, max error 2.22e-16.

Seeds 1020000..1039999: 13,398 deals scanned, 48 eligible, 6 compared positions, 384 hidden worlds. Predicted pass disagreement 36.03%, observed 33.85%, MAE 3.60 pp.

Seeds 1040000..1059999: 9,712 scanned, 48 eligible, 9 compared positions, 2,304 worlds. Predicted 43.70%, observed 44.70%, MAE 3.42 pp.

Total: 23,110 scanned, 15 positions, 2,688 worlds, zero new full rounds; prior 186,000 separate. World seed: (2000000000+Math.imul(dealSeed,113)+worldIndex)>>>0. Finding: union of legal reply sets predicts pass disagreement, not victory. Limits: uniform hidden worlds, provisional branch rules, first eligible positions. Next: matched full-round reply-aware strategy test.
