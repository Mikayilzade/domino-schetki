# Crossvalidated pass-vs-win checkpoint — 2026-10-13 04:50 Asia/Baku

Engine qosa-research-0.5.3; rules qosa-1.0.0; mode 3x9. Fresh seeds 2080000..2199999: 15,740 deals scanned, 40 positions, 413 exact hidden allocations, 5,235 candidate continuations, 0 unresolved. Full rounds added: 0; prior validated full rounds: 180,000.

Across 30 informative positions, out-of-sample trained-win minus pass-max finish-first: closed-branch -0.97 pp, min-pips +0.14 pp, fast-doubles -0.33 pp. None statistically secure. Training folds contain only 3-11 allocations. No new human-play rule.

Reproduce: `node qosha-research/simulator/pass-vs-win-cv-replay.js test` and `node qosha-research/simulator/pass-vs-win-cv-replay.js`. V8 tests passed and all 40 saved rows reproduced exactly; Node CLI not executed. Full details: `runs/2026-10-13-0450-pass-vs-win-twofold-cv-2080000.json`.

Next: independent 2200000..2350000 seeds with at least 10 worlds, then history-conditioned 3+ candidate decisions. No scoreboard/PWA files changed.
