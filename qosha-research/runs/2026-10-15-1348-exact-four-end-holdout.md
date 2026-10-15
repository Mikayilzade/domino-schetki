# Exact four-end connector control — 2026-10-15 13:48 Asia/Baku

Engine `qosa-research-0.5.3`; recovered `qosa-1.0.0`; provisional branch semantics; primary 3×9.

Fresh closed-branch-control discovery: seeds `181000..186495` (5,496 scanned; configured end 200000), first eligible position and lexicographically first equal-pip connector X-Y versus unrelated single, retaining X-X and another connector. **30 positions; 190 exhaustively enumerated hidden opponent allocations; 1,140 candidate continuations; zero unresolved**. No new full strategy rounds; verified historical new-engine total **180,000** (separate historical 4,000 not mixed).

Selected seeds: 181145, 181450, 181741, 181843, 182118, 182122, 182168, 182240, 182261, 182615, 182855, 183037, 183111, 183203, 183540, 183788, 183901, 184025, 184437, 184585, 184946, 185131, 185259, 185349, 185450, 185981, 186019, 186064, 186454, 186495.

Continuation seed: `42000000 + 1000*dealSeed + allocationIndex`. Uniform lexicographic enumeration of unseen tiles between opponent hands; known tiles, focal hand and board fixed. Policies: `closed-branch-control`, `min-hand-pips`, `fast-doubles`; both actions evaluated on identical worlds.

Equal-position-weight **connector minus unrelated** finish-first:
- closed-branch-control **−21.44 pp**, exploratory position 95% interval [−39.86, −3.03] pp; mean remainder **+2.91 pips**, minus-finish rate **−24.61 pp**.
- min-hand-pips **−21.11 pp**, interval [−39.99, −2.24] pp; remainder **+2.90**, minus-finish **−24.94 pp**.
- fast-doubles **−0.67 pp**, interval [−1.97, +0.64] pp; remainder **+0.53**, minus-finish **0.00 pp**.

Pre-action geometry/next-opponent hand size (closed-branch finish delta): **four distinct ends + next has 2 tiles: −57.0 pp (n=10)**; three distinct ends + next has 2: **+5.90 pp (n=13)**; four ends + next has 1: −16.67 pp (n=3); three ends + next has 1: −25.0 pp (n=4). Exploratory strata; no causal claim.

Post-action pass response (exploratory): connector causes more next-player passes: 8 positions, finish delta +25.63 pp; fewer passes: 12 positions, −62.92 pp; same: 10 positions, −9.33 pp. **Pass difference is a post-action moderator, not independent treatment.** Zero of 30 pairs produced identical post-action branch-end multisets, so these data do not isolate pass effects at identical resulting geometry.

Validation: V8 CommonJS executed on source fetched from GitHub; exact-world fixture seed 90179 yields 15 unique legal allocations and deterministic replay; 28-tile partition and no source mutation checked; new standalone runner self-test and 3-position pilot passed in V8. Node CLI not executed.

**Finding:** retaining the connector is not universally better. It underperformed the equal-pip alternative under two bot policies in this independent 30-position set, especially when four distinct ends were present and the next opponent held two stones. Not proof for human games.

**Limitations/confidence:** moderate for these model-specific paired contrasts; low for causal branch/pass interpretation. First-eligible position/pair selection, bot continuation policies, uniform hidden allocations ignore opponent history, unconfirmed branch semantics, block winner unassigned, exploratory uncorrected intervals. Exact worlds are separate from the 180,000 complete strategy rounds.

**Exact next action:** run `node qosha-research/simulator/connector-exact-response-runner.js test`, then reproduce `node qosha-research/simulator/connector-exact-response-runner.js 181000 200000 30`; compare on fresh seed sets with pre-action four-end and next-hand strata balanced. Design a genuine post-action geometry-matched candidate pair before attributing an effect to forced passes.
