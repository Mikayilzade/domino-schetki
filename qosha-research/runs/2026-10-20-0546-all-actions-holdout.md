# Qoşa açdı — pre-registered all-action holdout (2026-10-20 05:46 Asia/Baku)

Engine qosa-research-0.5.3; rules qosa-1.0.0; primary 3×9. Branch opening provisional.

Seeds 1303200..1303236, scanned 37 deterministic deals; one fixed focal seat/profile per seed, first >=12-turn multi-choice state. 36 positions, 0 >18-action skips, 5680 forced continuations, 0 unresolved. 20 hidden worlds/position, both continuation policies, every legal action (no disagreement selection).

Historical 4,000 and quarantined samples excluded. Previous matched strategy rounds 266,700 unchanged; these 5680 forced continuations are separate.

## min-hand-pips
36 positions, 142 distinct state-actions, mean 3.94 legal actions. Changed alpha28 vs20 in 0/36, joint vs one in 2/36.
Alpha28-one minus alpha20-one finish-first: 0.00 pp; exploratory 95% deal/position CI [0.00 pp, 0.00 pp]. Mean pip delta 0.000.
Alpha28-joint minus alpha28-one finish-first: 0.83 pp; exploratory CI [-0.55 pp, 2.21 pp]. Mean pip delta 0.001.
In-sample first-finish regret alpha20/alpha28/joint: 6.94 pp / 6.94 pp / 6.11 pp. Regret is optimistic (oracle uses same worlds); NOT a validated advantage.

## closed-branch-control
36 positions, 142 distinct state-actions, mean 3.94 legal actions. Changed alpha28 vs20 in 0/36, joint vs one in 2/36.
Alpha28-one minus alpha20-one finish-first: 0.00 pp; exploratory 95% deal/position CI [0.00 pp, 0.00 pp]. Mean pip delta 0.000.
Alpha28-joint minus alpha28-one finish-first: 0.28 pp; exploratory CI [-1.33 pp, 1.88 pp]. Mean pip delta 0.088.
In-sample first-finish regret alpha20/alpha28/joint: 8.47 pp / 8.47 pp / 8.19 pp. Regret is optimistic (oracle uses same worlds); NOT a validated advantage.

## Limitations and next hypothesis

Selection fixed before outcome and NOT conditioned on policy disagreement; nonetheless only one fixed focal trajectory per seed, 18-action cap and one continuation family. Exact win means first finisher, not match winner. No full posterior conditioned on opponents' earlier choices. Intervals are exploratory, no multiplicity correction. Test rerun deterministic in V8 CommonJS harness, not Node CLI.

Next: independent seeds 1303400..1303599, 40+ positions with 40 worlds and two policies, stratify changed-choice positions without selecting on them; evaluate regret out-of-sample by selecting oracle on one half of worlds and scoring on the other. Inspect whether alpha28 gain concentrates in 1-2 specific tile/branch configurations.

Reproduce: node qosha-research/simulator/pass-all-actions-holdout.js test; node qosha-research/simulator/pass-all-actions-holdout.js 1303200 90 20 36 12. Full JSON linked in runs/2026-10-20-0546-all-actions-holdout.json.
