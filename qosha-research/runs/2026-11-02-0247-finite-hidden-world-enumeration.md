# Exact finite hidden-world support enumerator — 2026-11-02 02:47:37 +04 (Asia/Baku)

## Purpose and scope
Added a reusable exact allocator for late-game Monte Carlo positions. It accepts the complete unknown tile pool plus labeled hidden-seat hand sizes and stock size. A hand and the stock are treated as unordered sets; seat identity remains labeled. It deliberately does not infer the unknown pool from branch endpoints, and it does not apply pass-history constraints by itself.

## Reproducible validation
- Engine/rules context: qosha-research-0.5.3; recovered qosa-1.0.0, primary 3×9 + one stock tile. Branch-opening assumptions are irrelevant to this allocation-only contract.
- Synthetic finite support: 10 distinct tiles allocated into hidden hand sizes [3,3,3] and stock size 1.
- Exact support count: 10!/(3!·3!·3!·1!) = 16,800.
- Exhaustively generated all 16,800 assignments; every fingerprint was unique; each assignment conserved the exact pool and respected all slot sizes.
- SHA-256 hash-ranked subset: 128/128 unique and reproducible for a fixed salt.
- Regression: 10 assertions passed under Node 22.16.0.

## Interpretation and limitations
This is an infrastructure/contract result, not a Qoşa strategy simulation. No win rate, regret, or tactical advantage was estimated. Local execution used a minimal compatibility shim for the two engine helpers used by the test (tileKey and createDoubleSixDeck), copied from the current GitHub engine source; a clean repository checkout was not available in the execution container. The committed regression imports the repository engine directly and should be run there. Exact enumeration is only allowed below an explicit maxWorlds cap; hash ranking here operates on a fully enumerated finite set and is not a substitute for sampling enormous supports.

## Exact next action
Select reachable late-game visible states whose remaining hidden allocation support is below the cap. Build each pool from the complete known/played tile list, apply pass evidence as a separate model-specific filter, and enumerate the remaining assignments exactly. Compare at least two legal root actions on the same filtered worlds and continuation policies; report model-specific support sizes and do not promote a tactic from a small or hindsight-oracle sample.
