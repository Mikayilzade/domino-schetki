# Exact opening-double connectivity — 2026-11-27 04:51 Asia/Baku

Reference engine qosha-research-0.5.3; recovered qosa-1.0.0, 3×9+1. Exact combinatorics only, no engine execution. README, RULES, EXPERIMENTS, STATUS, engine, hidden-world and gameplay gate inspected; RESULTS raw fetch rejected as oversized. No physical branch/block/loneZero assumptions needed.

Under a uniform deal conditional on hand-owned 1-1, after removing it and drawing the single stock tile, the starter's nine tiles are a uniform subset of the other 27. The same distribution holds for stock-owned 1-1 if the previous winner is independent of the current deal. For a fixed x != 1, condition on holding both 1-x and x-x. The remaining seven tiles are drawn from 25, of which five are other ordinary x-connectors. Exact counts:

| Other x-connectors | Hands | Probability |
|---|---:|---:|
|0|77520|16.1265%|
|1|193800|40.3162%|
|2|155040|32.2530%|
|3|48450|10.0791%|
|4|5700|1.1858%|
|5|190|0.0395%|

Reproduce with n(k)=C(5,k)*C(20,7-k), denominator C(25,7)=480700. Sum checked against denominator. Unconditional probability of both specified tiles is C(25,7)/C(27,9)=10.2564%. All six non-1 values are symmetric for connectivity, not pip burden. 56.4427% of these hands have at most one other connector; 16.1265% have none. Thus owning a matching double is not equivalent to having a sustained ordinary chain on that value. This is not a win-rate estimate; selection among opening candidates changes the distribution.

Scale: exact universe 4,686,825 possible starter hands, 480,700 conditional hands per fixed x; formula counts, not simulated or newly enumerated rounds. Seeds none, strategies none, new full deals/rollouts 0. No first-place, remainder, length, block, minus, regret metrics measured. Historical 180,000 matched-seat rounds remain separate; no native validation gate executed. Next: in a verified gameplay checkout, compare opening choices on matched deals stratified by zero/one/two-plus remaining connectors of the double-backed value, controlling alternative connectivity and pip burden; report paired first-finish and minus outcomes with deal-clustered uncertainty. Do not promote this combinatorial result to a tactical rule.
