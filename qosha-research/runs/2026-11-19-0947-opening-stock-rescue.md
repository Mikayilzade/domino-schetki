# 2026-11-19 09:47 Asia/Baku — opening stock rescue decomposition

- Engine reference: `qosha-research-0.5.3`; rules: recovered `qosa-1.0.0`, 3 players × 9 stones + 1 stock.
- Source-of-truth files inspected: README.md, RULES.md, EXPERIMENTS.md, RESULTS.md, STATUS.md, validation-checkout-preflight.js, validation-gate.js, hidden-world-validation-gate.js.
- Method: exact hypergeometric counting, independently evaluated with Python math.comb; no gameplay engine used.
- Condition: the 1-1 starter holds 1-1 among nine initially dealt tiles, then takes the stock tile. Among the remaining 27 tiles, six contain a 1; the starter's other eight initial tiles and one stock tile are uniform without replacement.
- Probability starter initially has **no** 1-x among the other eight: C(21,8)/C(27,8) = 0.09165906557210905.
- Joint probability starter initially has no connector **but stock rescues the opening**: [C(21,8)/C(27,8)] × 6/19 = **0.028944968075402856 (2.8945%)**.
- Joint probability starter initially has no connector **and stock does not rescue**: [C(21,8)/C(27,8)] × 13/19 = **0.06271409749670619 (6.2714%)**.
- Cross-check: rescue + forced pass = initial no-connector probability, to numerical precision. This partitions the previously measured 6.27% forced-pass case, not an independent strategy effect.
- New finding: the obligatory stock pickup is the *only* immediate legal continuation in about **2.89% of all starts conditional on starter owning 1-1**; this event is an exact measurable edge case for a future opening initializer regression.
- Confidence: exact conditional combinatorics under uniform shuffle; independent of branch unlock, block allocation and loneZero. Does not validate the simulator or imply a preferred strategy.
- Run metrics: gameplay deals **0**, hidden-world samples **0**, seeds **none** (exact enumeration/formula), strategies **none**; gameplay suites **0/17**, hidden-world suites **0/4** executed. Win/first-place, remaining pips, turns, block, minus, double, branch and regret metrics **not measured**. Historical 180,000 matched-seat rounds separate.
- Runtime blocker: local `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD` still fails `Could not resolve host: github.com`; no executable checkout.
- Next action: turn this rescue/no-rescue partition into an initializer test once a complete research-only checkout is available; run checkout preflight, 17 gameplay and 4 hidden-world suites, fingerprint replays, archive actual JSON and timings; only then resume matched-seed strategies.
- No live PWA/scoreboard files or GitHub Actions changed.
