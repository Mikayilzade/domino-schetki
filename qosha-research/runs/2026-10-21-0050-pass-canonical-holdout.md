# 2026-10-21 00:50 Asia/Baku — canonical pass-history holdout

Engine `qosa-research-0.5.3`, rules `qosa-1.0.0`, mode 3 players × 9 stones.
Seed range: **1308400..1308447** (48 distinct deals); 3 focal seats, 2 opponent profiles, alpha=20/28, one-vs-joint pass posterior, legacy-vs-canonical tie-breaking. **3,456 full continuations**; 0 unresolved. Historical full-deal count 264,900 is unchanged; do not mix cohorts.

Validation in JavaScript V8 CommonJS harness (not Node CLI): `joint-pass-memory-runner.test()`, patched canonical `test()`, and `2026-10-20-2352-canonical-geometry.test()` all passed.

Canonical runner is a reproducible transformation of `simulator/joint-pass-memory-runner.js`:
1. Import `{chooseCanonical,signature}` from `../runs/2026-10-20-2352-canonical-geometry`.
2. In `select`, between score/pip comparison and the existing action-key tie-break, compare `signature(state,a.action).localeCompare(signature(state,b.action))`.
3. In `play`, replace opponent `chooseBy(profile,opts)` with `chooseCanonical(profile,opts,state)`.
4. Run original and patched runners with seed=1308400, count=48, weights=[20,28], keeping their results separate.

### Joint minus one: first-finish rate (percentage points)

| Opponent policy | Alpha | Legacy | Canonical | Canonical exploratory 95% deal-cluster CI |
|---|---:|---:|---:|---|
| min-hand-pips | 20 | +0.69 | −0.69 | [−2.06,+0.67] |
| min-hand-pips | 28 | +1.39 | −1.39 | [−2.06,+0.67] |
| closed-branch-control | 20 | −2.78 | −3.47 | [−6.97,+0.03] |
| closed-branch-control | 28 | −2.08 | −4.86 | [−7.87,−0.46] |

**Interpretation:** Removing branch-label-dependent tie-breaking changes the estimated advantage of joint pass memory, sometimes reversing its sign. Alpha28 versus closed-branch-control looks unfavorable on this small cohort, but the holdout is exploratory and policy-dependent. **No universal gameplay rule is established.**

Assumptions: provisional four-branch semantics; hidden hands uniform conditional on pass history; opponents use fixed policies; first finish is not match victory; block winner unassigned. CIs are exploratory and clustered by deal. Changes in bot tie-breaking affect trajectories, not only the focal player's chosen move.

**Next:** persist the canonical runner as executable source; repeat on independent 200+ deal seeds and use canonical continuation for fixed-visible hidden-world regret. Do not pool old and canonical samples.
