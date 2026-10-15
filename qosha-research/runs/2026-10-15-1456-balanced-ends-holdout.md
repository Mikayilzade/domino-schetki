# Independent balanced pre-action geometry holdout — 2026-10-15 14:56 Asia/Baku

- Engine/rules: qosa-research-0.5.3 / recovered qosa-1.0.0, 3 players × 9 stones; branch-opening semantics still provisional. No gameplay-rule changes.
- Seeds: scan 200000..224999 (25,000 scanned; 72 first-eligible reachable positions). Select first 20 positions with 3 distinct pre-action branch ends and next clockwise opponent holding exactly 2 tiles, and first 20 with 4 distinct ends and next opponent holding 2. **40 positions, 296 exhaustively enumerated hidden allocations (148 in each stratum), 1,776 matched candidate continuations; zero unresolved.**
- Comparison: equal discarded-pip legal singles, connector X-Y (retains X-X and another X-Y) minus unrelated single; same hidden allocation and continuation seed for both candidate moves. Policies: closed-branch-control, min-hand-pips, fast-doubles. First eligible position and first matching pair per deal; uniform conditional hidden allocations, equal weight per selected position.
- Continuation seed: 54000000 + 1000*dealSeed + allocationIndex; exhaustive allocation order from connector-exact-response-runner.js.

## Results: connector minus unrelated

| Pre-action ends / next hand | n | closed-branch finish-first | min-pips finish-first | fast-doubles finish-first | closed-branch mean remainder | closed-branch minus-finish | next-player pass difference |
|---|---:|---:|---:|---:|---:|---:|---:|
| 3 distinct ends / 2 tiles | 20 | **−3.00 pp** (exploratory 95% [−19.34, +13.34]) | −5.50 pp | +0.50 pp | +1.80 pips | −4.00 pp | +15.64 pp |
| 4 distinct ends / 2 tiles | 20 | **−37.90 pp** (exploratory 95% [−58.56, −17.25]) | −37.43 pp | 0.00 pp | +3.42 pips | −36.50 pp | −13.98 pp |

Between-stratum contrast in closed-branch finish effect is −34.90 percentage points (4 minus 3), but this is observational across selected positions, not a causal effect of branch geometry. Next-player pass is measured after the forced action, so it is not an independent treatment. The negative four-end association replicates the separate 2026-10-15 13:48 experiment (n=10 in this stratum) within this simulator.

## Selected seeds

3 ends: 200621, 200918, 201131, 202556, 202592, 203230, 203411, 204272, 204397, 205488, 206156, 206454, 206541, 207581, 208592, 208600, 208689, 210128, 210241, 211978.

4 ends: 201056, 201151, 202967, 205816, 206745, 209874, 211221, 211267, 212565, 212672, 212827, 213222, 213387, 213677, 215295, 217059, 218376, 218409, 220228, 220661.

## Validation, scale, limits, next action

- V8 CommonJS harness loaded source directly from GitHub and ran the new runner; deterministic two-position replay test passed (seeds 200621 and 201056, 16 exact allocations, 96 continuations). Existing exact-world fixture 90179 also passed (15 allocations). Deck integrity and source-state immutability checks exercised. Node CLI not executed.
- New complete strategy rounds: 0. Verified historical new-engine total remains **180,000** matched-seat full rounds; historical 4,000 separate. The 296 conditional allocations are additional analysis, not complete rounds.
- Confidence: moderate for the association in the fixed simulator and two bot policies, low for human-play generalization or causal branch/pass explanation. Uniform hidden allocations ignore previous opponent choices; branch-opening rules provisional; first-eligible selection; only 20 positions per stratum; exploratory unadjusted CIs; block winner unassigned.
- Next: run Node CLI test and full replay, then design post-action geometry-matched candidate pairs and condition hidden-world sampling on prior pass/play history. Repeat using a different discovery policy.
