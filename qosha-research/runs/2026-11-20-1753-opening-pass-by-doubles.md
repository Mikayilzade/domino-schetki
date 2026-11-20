# Exact opening-pass risk by additional starting doubles — 2026-11-20 17:53 Asia/Baku

- Engine reference: `qosha-research-0.5.3`; recovered rules: `qosa-1.0.0`; 3 players × 9 stones, one stock; uniform double-six shuffle.
- Deals simulated: **0**; seed set: none (closed-form enumeration); strategies: none; sampled hidden worlds: 0; full gameplay suites: 0/17 executed; hidden-world suites: 0/4 executed.
- Condition on the starter initially owning 1-1. Let d be the number of **other** doubles among that starter's remaining 8 tiles (d=0..6). Six ordinary 1-x connectors and six other doubles exist among the 27 remaining tiles, with 15 other nonconnector nondoubles.
- An immediate forced pass after placing 1-1 and drawing stock requires that neither the starter's eight other tiles nor the drawn stock contain an ordinary 1-x connector. Given d, the starter's remaining 8-d nondoubles are sampled from 21 nondoubles (6 connectors, 15 nonconnectors). Thus exactly:
  `P(pass | d, owns 1-1) = C(15,8-d)/C(21,8-d) * (13/19)`.
  The 13/19 factor is the chance the stock is nonconnector after an 8-tile starter hand without any connector.
- Exact percentages by d (rounded to 3 decimals): d=0: **2.164%**; d=1: **3.786%**; d=2: **6.311%**; d=3: **10.097%**; d=4: **15.605%**; d=5: **23.407%**; d=6: **34.211%**.
- Finding: holding more additional doubles substantially raises the *conditional immediate-opening-pass risk* despite the usual strategic benefit of doubles. This is a **hand-composition association, not a causal strategy recommendation**. It is invariant to branch unlock, block scoring and loneZero conventions, assuming a normal 1-x is required for the mandatory follow-up.
- Confidence: exact under uniform deals and the stated opening rule; no gameplay/strategy inference. Overall forced-pass probability conditional on owning 1-1 is the previously established **6.2714%**, not a new independent sample. Historical 180,000 matched-seat rounds remain separate legacy evidence.
- Runtime blocker: Node v22.16.0 available but fresh `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD` failed DNS resolution of github.com; a full executable checkout and its validation gates were not run.
- Next: restore a verified research-only HEAD checkout, run preflight and 17+4 suites plus fingerprint replays, archive actual outputs, then compare branch-preservation policies on matched seeds stratified by starter double count and forced-pass status. Do not alter PWA files or create Actions.
