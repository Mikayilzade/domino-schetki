# 2026-11-27 03:53 Asia/Baku — exact allocation marginal audit

Engine qosha-research-0.5.3; recovered qosa-1.0.0. Read README, RULES, EXPERIMENTS, STATUS and RESULTS via blob fallback (raw endpoint rejected >1 MB), plus hidden-world contract and enumeration source/test. Primary 3x9+1; branch unlock, block allocation and loneZero remain provisional.

Executed fetched engine.js and hidden-world-enumeration.js in V8 CommonJS adapter, no native Node or full gate claim. Seedless exact enumeration, no strategies, zero gameplay deals or rollouts. Six synthetic slot configurations (last slot stock); pool is first n tiles of createDoubleSixDeck. Each allocation checked for unique fingerprint, slot sizes and unique tile count; each configuration checked for exact multinomial total and exact marginal of first pool tile in each slot.

| slots | worlds | first-tile slot counts |
|---|---:|---|
|1,1,1|6|2,2,2|
|2,2,0|6|3,3,0|
|3,3,1|140|60,60,20|
|4,4,1|630|280,280,70|
|5,4,1|1260|630,504,126|
|3,3,3,1|16800|5040,5040,5040,1680|

18,842 enumerated worlds; 56,538 predicate checks passed. Reproduce with iterateAllocations, allocationFingerprint, countAllocations and test counts[i]*n === worlds*sizes[i]. No crypto hash-ranked subset tested. Exact marginal matches uniform allocation, including zero stock and unequal opponent hand sizes. This validates a narrow combinatorial property, not opponent-history posterior or gameplay. Fixture overlap with previous enumeration possible; do not add to independent strategy samples. Historical 180,000 matched-seat rounds separate. Win, pips, length, block, minus, doubles, branch and regret not measured. Next: native Node exact enumeration test including hash-ranked subset, then pinned checkout preflight and both full gates. No live files or Actions changed.
