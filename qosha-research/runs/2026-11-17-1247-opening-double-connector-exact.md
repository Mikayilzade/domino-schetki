# Exact opening-double connector availability — 2026-11-17 12:47 Asia/Baku

Engine reference: qosha-research-0.5.3; recovered rules: qosa-1.0.0 (3 players × 9 tiles). This is a **combinatorial hand-inventory oracle**, not gameplay-engine validation. Branch unlock, block allocation and loneZero remain provisional.

## Question and sampling frame
Condition on an **initial 9-tile hand** containing 1-1 and exactly k additional doubles from {0-0,2-2,3-3,4-4,5-5,6-6}. Before the compulsory stock draw, does the hand contain at least one 1-x tile matching any of these k extra doubles? This is a candidate two-step opening resource, not proof that the corresponding moves are legal or optimal.

There are 21 nondoubles. Conditional on k, exactly 8-k nondoubles are uniformly selected. Of the 21 nondoubles, exactly k are relevant 1-x connectors. Thus

P(at least one connector | k) = 1 - C(21-k, 8-k) / C(21, 8-k).

## Exact results
| Extra doubles k | Favorable nondouble selections | Total nondouble selections | Probability |
|---:|---:|---:|---:|
| 1 | 38,760 | 116,280 | 33.333333% |
| 2 | 27,132 | 54,264 | 50.000000% |
| 3 | 11,781 | 20,349 | 57.894737% |
| 4 | 3,605 | 5,985 | 60.233918% |
| 5 | 770 | 1,330 | 57.894737% |
| 6 | 105 | 210 | 50.000000% |

This conditional probability **peaks at k=4**, not k=6: adding doubles increases the number of connector targets but reduces the remaining nondouble slots. The probability is the same for any fixed k-double subset by symmetry. A connector may be held without a legally accessible branch; do not equate this with a playable multi-double finish.

## Reproduction
No random seeds: exact binomial-coefficient arithmetic. Node.js or JavaScript:
```js
function choose(n,k){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v);}
for(let k=1;k<=6;k++){
  const total=choose(21,8-k);
  const favorable=total-choose(21-k,8-k);
  console.log(k,favorable,total,favorable/total);
}
```
Calculated independently in connector JavaScript during this checkpoint. No gameplay deals (0), hidden-world samples (0), rollouts (0), strategies (none), gameplay suites (0/17 executed), hidden-world suites (0/4 executed). Win rate, mean/median pips, round length, block rate, minus frequencies, actual double/branch effects and regret were not measured. Historical 180,000 matched-seat rounds remain separate.

Confidence: exact under uniform 28-tile dealing conditional on the specified **initial** hand composition. The mandatory stock draw is deliberately excluded; probabilities must not be interpreted as post-draw opening rates. This is not a strategy superiority result.

Exact next action: obtain complete single-commit research-only checkout, verify pinned inventory and run preflight, all 17 gameplay suites, all four hidden-world suites and fingerprint replays; archive actual JSON. Only after validation, compare retaining vs shedding connected doubles on matched seeds, stratified by k and connector presence. Do not modify PWA files or create GitHub Actions.
