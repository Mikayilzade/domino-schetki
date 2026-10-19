# Qoşa açdı — pass-history conditional tournament

Timestamp: 2026-10-19 05:50 Asia/Baku. Engine `qosa-research-0.5.3`; rules `qosa-1.0.0`; mode 3 players × 9 stones, later round.

## New matched experiment

Deterministic seeds **2022000..2022999**: 1,000 distinct deals, three seat rotations, two opponent mixtures, **6,000 complete rounds**; zero unresolved, 586 blocks. Previous seed sets are not mixed into this estimate.

Policy `history`: prioritize immediate finish, then exact next-player pass probability **conditioned on observed opponent passes**, then fewer opened numbers, then larger pip discard, then stable action key. Policy `uniform` is identical but computes next-pass probability without pass history. Both use public played tiles, own hand, opponent hand sizes, and public pass events; neither reads hidden opponent identities. Opponents: closed-branch-control in A, min-hand-pips in B.

Pass-only posterior: after the 3×9 opening, stock is empty. When player P passes, all tiles playable on that public board are forbidden in P's retained hand. At each decision, classify unknown tiles as forced to next player (forbidden to third), forced to third (forbidden to next), or flexible (forbidden to neither). A tile forbidden to both indicates an inconsistency. Let f be flexible count and k = next hand size minus forced-next count. For each candidate action, if any forced-next tile is playable then next-pass probability is zero; otherwise it is C(f-m,k)/C(f,k), where m is the number of flexible tiles playable on the post-action board. This ignores the likelihood of opponents' voluntary move choices and assumes no later draws.

### Arm A: history / uniform / closed-branch-control

- 3,000 rounds, 286 blocks, 12,821 pass events, mean 27.1303 turns.
- Finish-first: **35.60% / 28.3667% / 26.50%** (1,068 / 851 / 795 finishes).
- Mean remaining pips: **6.0407 / 7.3997 / 6.9570**; median **4 / 6 / 5**.
- Minus finishes −10: **207 / 203 / 149**; −20: **14 / 19 / 6**; −30 and −40: 0.
- History vs uniform: **+7.2333 percentage points**, 95% deal-clustered normal CI **[+4.8087,+9.6580] pp**, mean remaining pips −1.3590.
- History policy changed 806 of its 16,214 multi-choice decisions vs uniform; all 806 had forced-allocation evidence. 4,764 multi-choice decisions had such evidence.

### Arm B: history / uniform / min-hand-pips

- 3,000 rounds, 300 blocks, 12,204 pass events, mean 26.6543 turns.
- Finish-first: **38.70% / 31.5333% / 19.7667%** (1,161 / 946 / 593 finishes).
- Mean remaining pips: **5.0750 / 7.0180 / 7.8840**; median **4 / 5 / 6**.
- Minus finishes −10: **275 / 264 / 55**; −20: **14 / 21 / 0**; −30: **1 / 0 / 0**; −40: 0.
- History vs uniform: **+7.1667 pp**, 95% deal-clustered normal CI **[+4.4520,+9.8813] pp**, mean remaining pips −1.9430.
- History changed 1,047 of 17,088 multi-choice decisions; all 1,047 had forced-allocation evidence. 5,317 decisions had such evidence.

Confidence: **provisional**. In V8 CommonJS harness the existing baseline test passed (24 rounds), new prototype deterministic replay/hidden-hand permutation/no-history identity passed (18 rounds), 100-seed pilot ran clean, and **21,888 exact posterior combinatorial fixtures** matched exhaustive enumeration (max absolute error 1.12e-16). But the new executable JS runner could **not be saved to GitHub** (connector safety checks), and Node CLI replay has not happened. CIs cluster seat rotations by the 1,000 underlying deals. Branch-opening semantics provisional, deterministic bot mixture, default opening follow-up, no winner assigned on blocks, no 101-match outcome. Do not generalize to human play yet.

## Recovery of previous run, 2026-10-19 04:54

Seeds 2021000..2021999; existing committed `simulator/public-pass-tournament.js` reproduces 1,000 deals × 3 rotations × 2 arms = 6,000 complete rounds, 0 unresolved, 393 blocks. Arm A public-next-pass / public-no-pass / closed-branch-control: first-finish **37.7667% / 24.1000% / 31.6333%**, mean remaining pips **5.4917 / 7.0477 / 5.6517**, 195 blocks. Arm B public-next-pass / public-no-pass / min-hand-pips: **41.1333% / 28.2000% / 24.0667%**, mean remaining pips **4.8677 / 6.5900 / 6.4423**, 198 blocks. Next-pass advantage vs no-pass **+13.6667 pp** (A), **+12.9333 pp** (B). These 6,000 were previously executed but not committed due to write failure.

## Cumulative and next action

Previously GitHub-verified: **201,000** full rounds. Previous 6,000 now summarized here have a committed runner; new 6,000 from this checkpoint still lack a committed runner. **213,000 executed total**, of which **207,000 have existing executable backing**, but the 12,000 new rounds remain outside GitHub because this checkpoint's write failed. Earlier 215,520 claim is not reconciled; historical 4,000 separate.

**Next:** recover GitHub writes, commit executable history runner and both checkpoints, independently replay in Node, then test fresh seeds 2023000..2023999 and stratify the improvement by prior passes, forced-tile count, next hand size and opened branch numbers. Do not touch scoreboard/PWA files.