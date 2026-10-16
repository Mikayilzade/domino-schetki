# Qoşa two-double research recovery — 2026-10-16 14:52 Asia/Baku

Engine qosa-research-0.5.3; recovered qosa-1.0.0; 3×9. Branch opening remains provisional. These are **recovered local aggregate-only observations**, not newly run or Node-verified experiments.

## 12:46 checkpoint
Seeds 1075000..1079999 (two independent 2500-deal blocks). Focal closed-branch-control vs moderate-double-hold, same deal/seat. Two opponent policies: both moderate-double-hold or both min-hand-pips. 5000 unique deals, 11160 paired focal-seat observations, 22320 completed rounds, zero unresolved. Moderate opponents: finish-first advantage +9.585/+8.369 pp (A/B). Min-pips opponents: +8.763/+7.184 pp. Pair 2-2 and 6-6 (n=183/192) delta +12.022/+14.063 pp versus moderate, +13.115/+16.667 pp versus min-pips. After starter/12-pip hand-bin/connector matching, pair's incremental advantage versus other 6-6 pairs is +2.545/−3.706 pp against moderate opponents and +3.803/+3.774 pp against min-pips: **not stable across policies or blocks**.

## 13:48 checkpoint
Fresh seeds 1080000..1084999 (A/B 2500 each). Two fast-doubles opponents; focal control vs moderate-double-hold. Eligible seats 2765/2823; 11176 completed rounds, zero unresolved. Control finish-first 51.935/52.993%; hold 47.052/47.644%; delta +4.882/+5.349 pp. Mean remainder delta (control minus hold) +0.058/+0.026 pips, minus-finish delta +7.089/+6.801 pp, paired first-finish gains/losses 513/378 and 530/379. Pair 2-2 & 6-6 n=178/197, delta +17.416/+20.305 pp, but observational confounding remains.

## Verification/accounting
The executable runner was saved as `simulator/two-double-confound-runner.js` in commit 7b86d3a. V8 CommonJS deterministic 12-seed replay passed at the time; Node CLI and raw-output GitHub persistence did not. Prior verified complete rounds: **438760**. These 33496 rounds are quarantined; 472256 is **potential**, not verified. Another 11272 earlier aggregate-only rounds remain separate; historical 4000 separate. No scoreboard/PWA files touched.

Finding: control of closed branches repeatedly improves model finish-first rate across opponent policies, but 2-2 + 6-6 is **not established as intrinsically better**; in the fast-doubles blocks control does not improve mean remaining pips.

Limitations: assumed branch mechanics, bot-specific, no block winner, seat/deal correlation, exploratory subgroups and coarse hand matching.

Reproduce runner: `node qosha-research/simulator/two-double-confound-runner.js START 2500 POLICY` for START 1075000/1077500 and POLICY moderate-double-hold/min-hand-pips; for START 1080000/1082500 and POLICY fast-doubles.

Next: reproduce these exact seeds in Node, persist raw JSON, calculate deal-clustered uncertainty, and avoid double counting.
