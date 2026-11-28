# Exact pass-mask conditional double isolation — 2026-11-28 13:50 Asia/Baku

Engine reference qosha-research-0.5.3; recovered qosa-1.0.0. Read README, RULES, EXPERIMENTS, STATUS, preflight, hidden-world gate, and RESULTS via blob 131f175a1b06c7fc427aaadb9dd6bd7edefaf0cb (contents endpoint empty). Native git ls-remote still fails DNS.

Synthetic allocation oracle, not a gameplay experiment: 18 hidden tiles, two opponents A/B with nine each, target double known to be in B. A has a valid hard pass mask of m forbidden hidden tiles, excluding target double; assume unchanged hands between pass and evaluation (or equivalently a correctly reconstructed mask on current unknown tiles). k other connectors to target number, t overlap with forbidden mask. Uniform allocations conditional on mask and double ownership. A receives nine of the 17 non-double hidden tiles. B is isolated iff all k connectors belong to A. Thus support C(17-m,9), isolation count zero when t>0, otherwise C(17-m-k,9-k). No voluntary choice likelihood. A pass mask must come from actual legal-action reconstruction, not merely a visible branch number; this oracle does not resolve branch semantics.

Executed Python exhaustive enumeration, 24,310 subsets per configuration, seven configurations (170,170 subset visits); all exact count assertions passed.

|m|k|t|support|isolated|probability|
|--:|--:|--:|--:|--:|--:|
|2|2|0|5005|1716|34.2857%|
|2|2|1|5005|0|0%|
|4|2|0|715|330|46.1538%|
|4|2|1|715|0|0%|
|4|2|2|715|0|0%|
|4|1|0|715|495|69.2308%|
|4|1|1|715|0|0%|

Reproduction (Python):
```python
from itertools import combinations
from math import comb
for m,k,t in [(2,2,0),(2,2,1),(4,2,0),(4,2,1),(4,2,2),(4,1,0),(4,1,1)]:
    F=set(range(1,m+1))
    X=set(range(1,t+1))|set(range(m+1,m+1+k-t))
    n=z=0
    for a in combinations(range(1,18),9):
        a=set(a)
        if a&F: continue
        n+=1
        z+=X<=a
    assert n==comb(17-m,9)
    assert z==(0 if t else comb(17-m-k,9-k))
    print(m,k,t,n,z,z/n)
```

Finding: a hard pass constraint can raise isolation probability from unconditional 26.47% to 46.15% for two connectors when four unrelated tiles are excluded from A, but reduce it to zero when even one connector is excluded from A. This is conditional on known double ownership, not a claim that B cannot play the double or that a tactic wins. Exact combinatorial confidence under stated assumptions only.

New gameplay deals/rollouts 0; no random seeds or strategy arms (exhaustive); no win, remainder, length, block, minus, branch or regret metrics. Native gates 0/17 and 0/4 this run; historical 180,000 matched-seat rounds separate. Next: test pass-mask-conditioned allocator against these exact counts, then recover complete pinned checkout and execute native gates and fingerprint replay. Branch unlock, block allocation and loneZero remain provisional. No PWA or Actions changes.
