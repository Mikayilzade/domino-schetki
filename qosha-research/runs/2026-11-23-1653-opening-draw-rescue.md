# 2026-11-23 16:53 Asia/Baku — exact mandatory-draw rescue probability

- Rules: recovered `qosa-1.0.0`; engine reference `qosha-research-0.5.3` (full engine **not** validated in this environment).
- Mode: 3 players × 9 stones, one stock, starter owns and plays 1-1, mandatory stock draw.
- Experiment: exact combinatorics, no stochastic strategy deals; seed set: none; strategies: none; 0 hidden-world samples, 0 rollouts.
- Definition: the eight stones remaining after placing 1-1 contain none of six ordinary 1-x connectors; stock draw *rescues* this otherwise stuck starter if it is one of those six.
- Exact arithmetic: P(initially no connector) = C(21,8)/C(27,8) = 0.09165906557210905. Given no connector, stock contains one of the six connectors with probability 6/19. Therefore P(rescued by mandatory draw) = C(21,8)/C(27,8) × 6/19 = **0.028944968075402856** (2.8945% of starter deals). P(still forced to pass) = C(21,8)/C(27,8) × 13/19 = **0.06271409749670619** (6.2714%). Conditional rescue fraction among initially stuck starters = **6/19 = 31.5789%**.
- Independently checked with local Python `math.comb`; these events partition the initially stuck event (2.8945% + 6.2714% = 9.1659%). No branch-unlocking or block-scoring assumption enters the calculation. The confirmed opening requires mandatory draw, so this is not an optional-draw policy comparison.
- New finding: mandatory stock draw restores an immediate connector for **31.58% of starters whose post-1-1 eight-stone hand has none**. This is an opening-mechanics probability, **not** a demonstrated strategy advantage.
- Validation: shell `git ls-remote https://github.com/Mikayilzade/domino-schetki.git HEAD` failed `Could not resolve host: github.com`. Complete executable checkout absent; gameplay suites 0/17 executed, hidden-world suites 0/4 executed. Historical 180,000 matched-seat strategy rounds remain separate. No fresh win, remainder, turn-length, block, minus, doubles, branch or regret metrics.
- Confidence: exact under uniform random deal conditional on 1-1 owned by starter and the confirmed 3×9+1 opening; full gameplay engine remains unvalidated. Branch opening, block allocation and loneZero=10 provisional.
- Exact next action: obtain complete pinned research-only checkout; verify Git blob SHA/path/size, run strict audit, preflight, 17 gameplay and 4 hidden-world suites plus fingerprint replays; archive real outputs and fix failures before new matched-seed strategy tests.
- Scope: only `qosha-research/`; no live scoreboard/PWA or GitHub Actions changes.
