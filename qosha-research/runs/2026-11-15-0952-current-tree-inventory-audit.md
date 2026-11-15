# GitHub tree inventory comparison — 2026-11-15 09:52 Asia/Baku

- Source: GitHub default branch recursive tree `9a2f8d192d98e57715d0f581217e44ea876ae72c`, `truncated=false`, compared with `simulator-checkout-inventory-2026-11-14.md` (historical tree `cdb2a10e50e58314e4af5472838b31e5740db2f9`).
- Engine/rules reference: `qosha-research-0.5.3` / recovered `qosa-1.0.0`; primary 3×9+1. Branch unlock, block allocation and `loneZero=10` remain provisional.
- Historical pin: **387 unique** simulator files. Current tree: **392** simulator blobs. Missing historical paths: **0**. Changed historical blobs: **1**, `simulator/validation-checkout-preflight.js` (known later preflight edits). Extra paths: **5**:
  - `opening-double-pass-risk-oracle.js`
  - `opening-joint-connector-double-oracle.js`
  - `pinned-inventory-audit.js`
  - `pinned-inventory-parser-regression.js`
  - `reconstruct-checkout.js`
- Finding: current GitHub tree retains every historical pinned path; one changed file and five additional files are expected drift, not missing-source evidence. This is a **Git object metadata comparison**, not an executable checkout, content execution, or gameplay validation. Confidence: high for Git tree SHA/path/size comparison; none for simulator correctness.
- Executable environment: `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD` failed with `Could not resolve host: github.com`. GitHub connector remained readable. Full gameplay suites **0/17 executed**, hidden-world suites **0/4 executed**.
- New gameplay deals: **0**; hidden-world samples: **0**; seed range/set: **none**; strategies: **none**. Win rate, mean/median remaining pips, round length, block rate, −10/−20/−30/−40, starting/ending doubles, double value, branch effects and regret **not measured**. Historical **180,000** matched-seat rounds are a separate legacy subtotal, not a validated all-time count.
- New reliable strategic finding: **none**.
- Exact next action: reconstruct all **392 current simulator blobs** (not only the 387 historical pin), plus the four Markdown contracts, using a verified connector-to-executable transfer or restored DNS; run pinned inventory audit, preflight, 17 gameplay and four hidden-world suites, then fingerprint replays. Archive real JSON/timings and fix failures before matched-seed strategy experiments.
- Scope: research-only checkpoint; no PWA/scoreboard files or GitHub Actions modified.
