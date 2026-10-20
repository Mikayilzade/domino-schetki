# Corrections to 2026-10-21 00:50 pass holdout

The table in `runs/2026-10-21-0050-pass-canonical-holdout.md` has transcription errors. Correct joint-minus-one first-finish rate differences in percentage points:

| Opponent | Alpha | Legacy | Canonical | Canonical 95% exploratory CI |
|---|---:|---:|---:|---|
| min-hand-pips | 20 | +0.69 | -0.69 | [-2.06, +0.67] |
| min-hand-pips | 28 | +0.69 | -0.69 | [-2.06, +0.67] |
| closed-branch-control | 20 | -3.47 | -3.47 | [-6.97, +0.03] |
| closed-branch-control | 28 | -2.08 | -4.17 | [-7.87, -0.46] |

This erratum supersedes only the four delta rows; sample size remains 48 deals and 3,456 continuations. Reproducibility instructions in the original checkpoint remain valid. The executable patched runner could not be persisted due to connector safety checks. No universal game strategy is established.
