# Exact opening follow-up availability oracle — 2026-11-15 07:49 Asia/Baku

- Rules: recovered `qosa-1.0.0`; reference research engine `qosha-research-0.5.3`; mode 3 players × 9 stones, 28 double-six stones.
- Run type: **exact combinatorial calculation**, not gameplay simulation. Gameplay deals: **0**; seed set: none; strategies: none; hidden-world samples: **0**.
- Conditional population: starter holds or claims `1-1` and has exactly nine **other** stones after the mandatory draw/claim. There are 27 distinct remaining stones, six of which contain a 1.
- Under a uniform deal independent of starter selection, probability the starter has **no playable follow-up on 1** is `C(21,9)/C(27,9) = 0.06271409749670619` (**6.2714%**). Complement: **93.7286%** have at least one other stone containing a 1. This is a rule-invariant availability calculation and does not require branch-lock semantics.
- The same conditional marginal holds when the previous-round winner claims stock `1-1` and already holds nine other stones, **only if** their hand is exchangeable/uniform conditional on claiming; it must not be assumed for real match histories with selection bias.
- This is not a first-round unconditional percentage and must not be conflated with the `1/28` first-round redeal probability. For the first round conditional on accepted `1-1` being in a player's original hand, the other eight hand stones plus one stock draw constitute nine distinct samples of the 27 non-`1-1` stones.
- Independent local Python `math.comb` computation executed this run. No simulator suite executed: gameplay **0/17**, hidden-world **0/4**. No win rate, remainder, minus, block or regret estimates. Historical 180,000 rounds are not included.
- Finding: a starter without any 1-follow-up is not exceptionally rare (~1 in 16 accepted openings); explicit pass handling matters in validation. **Not a strategic advantage claim.**
- Confidence: exact given uniform conditional sampling and confirmed mandatory draw; no claim about nonuniform observed game states. Branch unlock, block scoring and loneZero=10 remain provisional.
- Next action: reconstruct complete research-only checkout, execute preflight + both validation gates and fingerprint replays, then compare matched-seed strategies after validation. Do not modify scoreboard/PWA or Actions.
