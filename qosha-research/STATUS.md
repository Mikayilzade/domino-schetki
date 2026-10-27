# Qoşa research status

Updated: 2026-10-27T19:53:44+04:00 (Asia/Baku)

## Verified cumulative
- Global provisional rounds: **1,342,575**; one-side counterfactual: **28,800**; current-all counterfactual: **9,600**.
- **1,380,975** total model-rounds across incompatible assumptions, workload ONLY; historical 4,000 separate.
- **1,898,856** forced hidden-world continuations, **14,082** next-pass labels, **4,900** known-world diagnostics (unchanged).
- Engine `qosa-research-0.5.3+tie-probe`; recovered `qosa-1.0.0`; branch unlock and blocked winner **UNVALIDATED**.
- Fresh seeds **1602140..1602939**; next >=**1602940**.

## Latest checkpoint
- 800 deals × 2 mixes × 3 rotations × 4 models = **19,200 complete model-rounds**; zero unresolved. V8 CommonJS test/replay passed, Node CLI not executed.
- **global:** 159/4800 blocks (3.31%); 6 tied minima (5 two-way, 1 three-way), 0 zero-pip ties; minus −10/−20/−30/−40 763/37/0/0; mean 25.24 turns.
- **currentAll:** 4453/4800 blocks (92.77%); 257 tied minima (255 two-way, 2 three-way), 0 zero-pip ties; minus −10/−20/−30/−40 39/6/0/0; mean 23.33 turns.
- **localFirst:** 4716/4800 blocks (98.25%); 245 tied minima (240 two-way, 5 three-way), 0 zero-pip ties; minus −10/−20/−30/−40 3/0/0/0; mean 20.54 turns.
- **localLast:** 4735/4800 blocks (98.65%); 239 tied minima (231 two-way, 8 three-way), 0 zero-pip ties; minus −10/−20/−30/−40 1/2/0/0; mean 20.40 turns.
- Minimal SYNTHETIC late-arrival probe distinguishes global-ever-open (left 5-6 YES) from all-current-only (NO). No authentic move-by-move trace archived; block tie winners remain unknown.
- Source `simulator/branch-tie-probe.js`, raw `runs/2026-10-27-1951-branch-tie-probe-1602140-1602939.json`, checkpoint `runs/2026-10-27-1951-branch-tie-probe.md`.
- Live scoreboard/PWA and GitHub Actions untouched.

## NEXT ACTION
- Verify actual late-arrival legality and block-tie scoring from real play before human strategy rankings; otherwise focus on ambiguity-invariant hypotheses.
