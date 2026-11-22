# 2026-11-22 11:47 Asia/Baku — stock identity and opening forced pass

- Engine: independent exact combinatorial oracle (not full gameplay engine); recovered rules `qosa-1.0.0`, 3 players × 9 stones + one stock. Uniform random deal conditioned on starter holding `1-1`.
- Gameplay deals: **0**; seed set: **none** (exact enumeration); strategies: **none**. Full gameplay suites **0/17**, hidden-world suites **0/4** executed. No new win rate, pip remainder, length, block, minus, double, branch or regret metrics. Historical **180,000** matched-seat rounds remain separate legacy evidence.
- Among the 27 tiles other than `1-1`, exactly six are ordinary `1-x` connectors. If the single stock tile is one of these six (probability **6/27 = 22.2222%**), drawing it guarantees the starter an ordinary `1-x` follow-up. Conditional forced-pass probability is **0%**.
- If the stock tile is **not** a connector (probability **21/27 = 77.7778%**), the original eight other starter tiles must avoid all six connectors to force a pass: **C(20,8)/C(26,8) = 125970/1562275 = 8.0632411%**.
- Weighted total: **(6/27)×0 + (21/27)×(125970/1562275) = 6.27140975%**, exactly agreeing with the independent post-draw count **C(21,9)/C(27,9)**.
- Verified locally using Node 22 (standalone source with assertions, output stored below); **not** a full checkout or engine validation. Executable `git ls-remote` still fails `Could not resolve host: github.com`. This result is an exact *opening hand-availability* calculation, not a strategic advantage, and does not settle provisional branch/block/loneZero rules.
- New finding: observing the identity of the drawn stock tile partitions starter forced-pass risk into **0%** versus **8.06%**; this is information value, not proof of a better policy.
- Exact next action: recover complete SHA-verified research checkout, run strict manifest audit, preflight, 17 gameplay + 4 hidden-world suites and fingerprint replays, archive actual JSON/timings; only then resume matched-seed strategy tests. No PWA files or GitHub Actions modified.

```json
{"schema":"qosha-opening-stock-connector-exact/v1","timestampAsiaBaku":"2026-11-22T11:47:37+04:00","engine":"independent exact oracle","rules":"qosa-1.0.0 opening only","deals":0,"seeds":null,"strategies":[],"stockConnectorProbability":0.2222222222222222,"passGivenStockConnector":0,"passGivenStockNonconnector":0.08063241106719368,"forcedPassProbability":0.06271409749670619,"validation":"standalone Node assertion passed; full engine not validated"}
```
