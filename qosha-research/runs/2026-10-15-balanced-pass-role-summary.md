# Balanced pass-role run 2026-10-15 19:49 Asia/Baku

Reproduce: `node qosha-research/simulator/pass-role-balanced-runner.js 400000 500000 25`.

100,000 deterministic deals scanned; 225 eligible; 25 next-only and 25 third-only retained-pass positions selected. Exact hidden allocations: 95 and 260 (355 total); paired candidate continuations: 2,130. Additional hidden allocations eliminated by retained pass history: 4 next-only versus 38 third-only. Third-only next-pass Brier improved 0.20754 to 0.17887; exploratory uncertainty includes zero. No reliable strategy rule. No new complete rounds; validated cumulative 180,000. Branch semantics provisional. Next: independent hand-size and pass-age matched holdout.
