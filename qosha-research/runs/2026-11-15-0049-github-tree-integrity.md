# GitHub tree vs pinned simulator inventory — 2026-11-15 00:49 Asia/Baku

- Source of truth: GitHub default branch `main`, tree SHA `7df10626949bc2eee6ec11e02d674c5d1fbdabf2`.
- Engine reference: `qosha-research-0.5.3`; recovered rules: `qosa-1.0.0`, primary 3 players × 9 stones + stock.
- Method: compare all 387 `path / Git blob SHA-1 / size` manifest entries in `simulator-checkout-inventory-2026-11-14.md` to the current GitHub recursive tree via the authenticated connector. Comparison was of exact paths and Git blob SHAs, **not** executable checkout files.
- Result: **387/387 pinned simulator blobs are present with identical Git SHA**; **0 missing, 0 changed**, **4 additional files**:
  - `simulator/opening-double-pass-risk-oracle.js`
  - `simulator/opening-joint-connector-double-oracle.js`
  - `simulator/pinned-inventory-audit.js`
  - `simulator/reconstruct-checkout.js`
- Current simulator blob count: **391**. This shows that GitHub's source tree is complete relative to the historical pin, not that a local executable checkout is available. The historical pin is a subset and additional files are legitimate, not corruption.
- Executable-shell attempt: `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD` failed with `Could not resolve host: github.com`; Node v22.16.0 is available. **No full-engine tests were executed**.
- New gameplay deals: **0**; hidden-world samples: **0**; seed set: none; strategies: none; gameplay gate **0/17 executed**, hidden-world gate **0/4 executed**. Win rate, pips, round length, block rate, minus frequencies, doubles, branch effects and regret: **not measured**. Historical 180,000 matched-seat strategy rounds remain a separate legacy subtotal.
- Finding: **GitHub source integrity is not the blocker**: the complete pinned simulator content exists in the current repository. The blocker is transporting it into the executable environment. This is a high-confidence GitHub tree/blob inventory finding, **not a gameplay/strategy result**.
- Physical-rule uncertainties: branch unlocking, blocked-round scoring and `loneZero=10` remain provisional.
- Exact next action: test the committed `simulator/reconstruct-checkout.js` transport path or implement connector-backed transfer of the 391 current blobs into a local research-only checkout; independently verify hashes, run `pinned-inventory-audit.js`, `validation-checkout-preflight.js`, both validation gates and fingerprint replays; archive real JSON and timings before any new strategy tournament.
- Scope: only `qosha-research/`; no live scoreboard/PWA or GitHub Actions changes.
