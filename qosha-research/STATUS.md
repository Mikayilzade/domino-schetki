# Qoşa açdı research — current status

Last checkpoint: 2026-11-02 04:21 Asia/Baku (+04:00).

- Added pass-history-conditioned exact support filtering for the recovered 3x9 mode.
- 386 deterministic deals generated; 200 late pass-conditioned positions selected from seed window 3446032–3446417; 362 no-stock pass observations.
- Exact state-world support totals: raw 777; global-ever-open 514; current-only 0; joint 0; global-only 514; current-only-exclusive 0; neither 263. The actual global allocation survived all 200 positions.
- 103 positions had different global/current-only pass masks. All generated traces were incompatible with the strict current-only side-local counterfactual; this is a model-divergence diagnostic from global-generated states, not a physical-rule conclusion.
- Synthetic model-agreement fixture: raw 3,432; global 8; current-only 120; joint 8; current-only-exclusive 112; neither 3,312. This validates that the pass-time filter can produce distinct support.
- Test: 12 assertions passed under Node 22.16.0 using a local mirror of repository modules. Clean checkout integration was not run due container DNS failure for github.com.
- No candidate strategy comparisons were run. No strategy promoted. Live scoreboard/PWA files remain untouched.
- Exact next: collect current-only-compatible or real public traces and run matched candidate comparisons only on joint hidden-world support; keep model-divergent traces separate.

Report: runs/2026-11-02-pass-history-conditioned-support.md  
Data: runs/2026-11-02-pass-history-conditioned-support.json  
Runner/test: simulator/pass-history-conditioned-support.js and simulator/pass-history-conditioned-support-test.js
