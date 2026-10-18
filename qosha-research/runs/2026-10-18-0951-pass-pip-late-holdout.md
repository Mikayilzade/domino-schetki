# Late-hand public-pass vs pip-aware holdout — 2026-10-18 09:51 Asia/Baku

- **Engine/rules:** `qosa-research-0.5.3` / recovered `qosa-1.0.0`; primary 3×9, later-round. No rule or scoreboard changes.
- **New work:** scanned **483 fresh independent deal seeds** (`1064809..1065291`); selected **30** 1–3-stone late-game choice disagreements (one per deal), hand-size counts {"1":0,"2":0,"3":30}.
- **Paired evaluation:** **1500 fixed-visible hidden worlds**, **6000 forced continuations** under closed-branch-control and moderate-double-hold; same hidden world per action and policy. No new complete strategy rounds.
- **Validation:** deterministic V8 CommonJS replay/self-test passed (1 fixture position, 8 forced continuations); no unresolved rollouts. **Node CLI not executed**.
- **Policies:** choose by public next-player pass probability vs `pass-pip-0.01`; first actual disagreement with 1–3 stones per focal seat, then select smallest hand-size across seats in a deal. No hidden identities used by focal selection.
- **Result closed-branch-control:** hybrid minus pass finish-first **5.60 pp**, exploratory 95% position CI **[0.30, 10.90] pp**; raw remainder delta **-0.42 pips**.
- **Result moderate-double-hold:** hybrid minus pass finish-first **5.00 pp**, exploratory 95% position CI **[0.72, 9.28] pp**; raw remainder delta **-0.40 pips**.
- **Confidence:** exploratory only; position-level CIs uncorrected for multiple comparisons, policy dependence, and discovery selection. Uniform hidden worlds ignore opponent pass/action history; branch semantics provisional; block winner not assigned. Any unobserved 1- or 2-stone stratum must remain unclaimed.
- **Cumulative complete matched-seat rounds:** **215,520**, historical 4,000 separate; this run adds **0** full rounds.
- **Reproduce:** `node qosha-research/simulator/pass-pip-late-holdout.js test`; `node qosha-research/simulator/pass-pip-late-holdout.js 1064809 800 30 50`. Raw data `runs/2026-10-18-0951-pass-pip-late-holdout.json`.
- **Exact next action:** independently repeat on disjoint seeds `1065609..` with >=50 worlds/position, seek 1–2-stone choice cases separately, and compare against an alternate discovery policy to test selection bias; run Node CLI test + invariants before upgrading confidence.
