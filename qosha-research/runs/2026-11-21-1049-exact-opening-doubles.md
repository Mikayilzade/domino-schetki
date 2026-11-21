# 2026-11-21 10:49 Asia/Baku — exact opening double inventory (rule-invariant checkpoint)

- **Source of truth:** GitHub `qosha-research/README.md`, `RULES.md`, `EXPERIMENTS.md`, `RESULTS.md`, `STATUS.md`, and validation preflight/gate source were read before this checkpoint.
- **Engine/rules:** gameplay engine reference `qosha-research-0.5.3`; recovered `qosa-1.0.0` 3 players × 9 tiles, 1 stock, mandatory 1-1 opening. Branch unlocking, block allocation and `loneZero=10` remain provisional.
- **Experiment:** exact combinatorial enumeration of the **starter's inventory of other doubles immediately after playing 1-1 and drawing the single stock tile**, conditional on a uniformly shuffled valid deal where starter initially owns 1-1. The remaining 9 tiles are a uniform subset of the other 27 tiles; exactly 6 of those 27 are doubles.
- **Deterministic formula:** `P(D=k)=C(6,k)*C(21,9-k)/C(27,9)` for integer `k=0..6`. Exact enumeration, no pseudorandom seeds, no Monte Carlo. Denominator `C(27,9)`.
- **Distribution:** D=0: 6.2714097497%; D=1: 26.0504712679%; D=2: 37.2149589541%; D=3: 23.1559744603%; D=4: 6.5126178170%; D=5: 0.7661903314%; D=6: 0.0283774197%. Thus `P(D>=2)=67.6781189825%`, `P(D>=3)=30.4631606284%`. Expected D=2 exactly.
- **New finding:** a starter has at least two *other* doubles after the mandatory opening and draw in about 67.68% of valid opening deals. This is a hand-composition base rate, **not** a probability of a −20 finish, a claim that doubles are playable, or evidence that retaining them is optimal. No branch or block assumptions enter this result.
- **Reproduction (Python standard library):**
  ```python
  from math import comb
  den=comb(27,9)
  numerators=[comb(6,k)*comb(21,9-k) for k in range(7)]
  assert sum(numerators)==den
  assert sum(k*numerators[k] for k in range(7))==2*den
  print([(k,n/den) for k,n in enumerate(numerators)])
  print('P>=2',sum(numerators[2:])/den)
  ```
- **Execution status:** exact arithmetic evaluated locally; **0** new gameplay deals, **0** hidden-world samples, **0** rollouts; seed set N/A; strategies N/A. Shell `git ls-remote` still failed `Could not resolve host: github.com`. Full gameplay suites **0/17 executed**, hidden-world suites **0/4 executed**. Win/first place, remaining pips, round length, blocks, minus rates, branch effects, decision regret: **not measured**. Historical 180,000 matched-seat rounds remain separate and are not added to this cohort.
- **Confidence/limitations:** exact under uniform shuffle and conditioning on starter possessing 1-1. This conditional sample does not describe later-round stock-1-1 forced openings, where the winner receives 1-1 from stock. The inventory distribution alone cannot establish strategic double value.
- **Exact next action:** recover complete verified GitHub simulator checkout; verify pinned Git blob hashes, execute preflight and 17+4 validation suites plus fingerprint replays; then compare double-retention policies on identical seed/deal/seat sets and test whether `D>=2` predicts achievable multi-double finishes after controlling for connectivity and branch locks.
- **Scope:** new report only under `qosha-research/runs/`; no live PWA files or GitHub Actions touched.
