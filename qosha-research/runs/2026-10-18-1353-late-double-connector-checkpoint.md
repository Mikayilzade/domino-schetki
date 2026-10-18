# Qoşa late double / connector holdout — 2026-10-18 13:53 Asia/Baku

Engine qosa-research-0.5.3; rules qosa-1.0.0; 3x9 later-round.
V8 CommonJS execution with deterministic independent seeds 1071000..1071801: scanned 802 deals; selected 65 late positions (62 with 3 stones, 3 with 2). 2,600 matched hidden-world allocations, 10,400 forced continuations, 0 unresolved. New complete tournament rounds: 0; cumulative prior complete-round baseline remains 215,520 (historical 4,000 separate).

Compared public-next-pass vs pass-pip-0.01, identical hidden worlds, with closed-branch-control and moderate-double-hold continuations. Hybrid-minus-pass finish-first: -6.15 / -4.35 percentage points; beneficial minus-finish -24.88 pp.

Transition strata under closed-branch-control: single-to-double n=25, first -16.50 pp, minus -32.30 pp; double-to-double n=21, first +4.52 pp, minus -40.71 pp; single-to-single n=19, first -4.34 pp, minus +2.37 pp.

When hybrid spent a double that pass preserved: connector retained after pass n=13, first -18.27 pp, minus -30.58 pp; no connector retained n=33, first -2.42 pp, minus -38.33 pp. This is observational and **not** equal-pip matched; connector groups may be confounded by the transition type and branch accessibility.

The self-test passed (deterministic two-world replay). Node CLI was not executed. No human gameplay claim: first eligible divergence per seed, uniform hidden worlds ignoring opponent history, provisional branch-opening semantics, block winner unassigned, two deterministic bots, exploratory uncorrected subgroup comparisons.

Reproduce with existing simulator/pass-pip-late-holdout.js 1071000 1800 65 40 and classify each selected state by action types and retained X-Y connector after the public-pass action. In this checkpoint the dedicated stratification runner was executed in V8 but source upload was blocked; do not treat this note alone as a fully archived reproducible implementation.

Next: persist stratification runner and raw position rows, independently replicate on seeds 1073000+, control discarded-pip gap and accessible ends, and test stronger continuation opponents.
