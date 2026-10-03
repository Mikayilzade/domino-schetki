# Qoşa açdı — накопленные результаты

## Исторический baseline из чата

До переноса исследования в GitHub было выполнено:

### 4 000 раздач × 9 простых стратегий
Предварительные наблюдения:
- удерживать все дубля до конца — слабая общая политика;
- возможность нескольких дублей за ход увеличивает темп и меняет их ценность;
- закрытая ветвь имеет стратегическую ценность;
- −10 наблюдался регулярно;
- −20 — заметно реже;
- −30/−40 в этой конкретной выборке не встретились;
- отдельно был построен пример, доказывающий возможность −40 при 3 игроках.

Эти результаты считаются историческими и не смешиваются с новыми до полной валидации нового движка.

### Разбор реальной партии seed 1898414179
Старый формат:
- schema: `qosa-round/v1`;
- engineVersion: `qosa-1.0.0`;
- players: 3;
- handSize: 9.

Для позиции было рассмотрено около 2 000 возможных скрытых раскладов. Большая часть ходов пользователя оказалась вынужденной; существенные развилки были найдены примерно на ходах №20 и №23.

## Новые почасовые прогоны

### 2026-09-30 23:54 (+04)
- engine: `qosa-research-0.1.0` (local validation prototype)
- deals: 0 strategy deals; 4 deterministic deal fixtures used for invariant validation
- seeds: 0, 1, 1898414179, 4294967295
- strategies: none yet; intentionally blocked until branch/legal-move semantics are validated
- key metrics: 28 unique tiles; each 3×9 fixture produced 27 unique hand tiles + 1 stock tile; deterministic replay, pip counting, minus classification and score-floor checks passed
- new finding: reproducible deal infrastructure is feasible, but strategy statistics are still premature
- confidence: high for these basic invariants; no claim for branch legality or historical seed compatibility
- follow-up: add branch-state/legal-move fixtures from confirmed rules and real positions before the first strategy batch

### 2026-10-01 12:50 (+04)
- engine: `qosa-research-0.1.0` plus pending multi-double API
- deals: 0 strategy deals
- seeds: none
- strategies: none; validation gate remains active
- key metrics: source-of-truth inspection confirms `test.js` requires `enumerateDoubleOpeningSequences` and `applyDoubleOpeningSequence`, while `engine.js` does not export/implement them
- new finding: the multi-double validation fixture is present but cannot pass until the engine API is added; no strategy claim is valid yet
- confidence: high for repository-state diagnosis; multi-double semantics remain assumption-labelled
- limitation: attempted engine write was blocked by connector safety checks, so no code mutation was persisted
- follow-up: implement the missing multi-double API, run invariants, then proceed to draw/pass turn-loop validation

### 2026-10-01 16:45 (+04)
- engine: `qosa-research-0.2.0` multi-double opening kernel
- deals: 0 strategy deals; deterministic invariant suite only
- seeds: 0, 1, 1898414179, 4294967295 for deal invariants; no strategy seeds yet
- strategies: none; validation gate remains active
- key metrics: local invariant suite is green; for branch ends {5,2}, hand {2-2,5-5,3-3} enumerates exactly the two maximal opening orders `2→5` and `5→2`; applying either opens 2 and 5, rejects 3, and leaves branch geometry unchanged
- new finding: the previously missing multi-double API is now implemented and persisted in GitHub commit `dee39ecc6b06c6c2b6bb37054a0cf68117b51621`
- confidence: high for the assumption-labelled opening-state kernel and existing deterministic invariants; this is not yet a claim that all real-game multi-double semantics are fully validated
- limitation: draw/pass turn loop, block termination, and mixed-finish integration are not yet implemented
- follow-up: implement and test draw-one-then-play-or-pass turn flow and block termination before the first strategy batch


### 2026-10-01 16:50 (+04)
- engine: `qosa-research-0.3.0` turn-kernel layer
- deals: 0 strategy deals; deterministic turn/block invariants only
- seeds: none beyond existing deal fixtures
- strategies: none; validation gate remains active
- key metrics: local invariant suites are green; an ordinary legal tile in hand prevents drawing; when hand is dead, exactly one stock tile is drawn; if the drawn tile is legal it may be played immediately, otherwise it remains in hand and the player passes; block is detected only after a full 3-player pass cycle with empty stock; block remainder pip sums are deterministic
- new finding: the draw-one-then-play-or-pass flow and block termination can be modelled cleanly as a separate layer without disturbing the validated multi-double/opening kernel
- confidence: high for the isolated ordinary-turn invariants; the block rule is assumption-labelled to the documented 3-player configuration
- limitation: double-opening actions are not yet integrated into the same turn dispatcher; mixed-finish and complete-round termination are still pending
- follow-up: integrate ordinary play and double-opening into one turn action set, then validate complete round termination before starting strategy batches


### 2026-10-01 16:57 (+04)
- engine: `qosa-research-0.4.0` unified dispatcher + initialized-board round driver
- deals: 0 strategy deals; deterministic dispatcher/round fixtures only
- seeds: no new strategy seed set
- strategies: none; mass-simulation gate remains active
- key metrics: local dispatcher and round-driver invariants are green; doubles are excluded from ordinary single actions and routed through the opening sequence path; draw/pass works through the same dispatcher; ordinary empty-hand finish, double empty-hand finish with −10, and 3-pass empty-stock block all terminate correctly
- new finding: mixed-finish positions can now be detected before an incorrect transition is simulated; the driver returns `unresolved/mixed-finish` instead of silently choosing a rule
- confidence: high for the isolated dispatcher and initialized-board termination fixtures; no claim yet about complete real-round initialization or exact mixed-finish semantics
- limitation: exact starter/opening initialization and mixed finish are still unresolved; current multi-double sequence enumeration remains assumption-labelled
- follow-up: implement a deterministic 3-player round initializer with explicit unresolved gates, then connect it to the driver before the first strategy batch


### 2026-10-01 17:00 (+04)
- engine: `qosa-research-0.4.0`
- compatibility fixture: historical round `seed=1898414179`, engine `qosa-1.0.0`
- key metric: current `dealThreeByNine(1898414179)` does **not** reproduce the historical initial hands or stock; current stock is `2-6`, historical stock is `1-5`
- new finding: the new xorshift-based deal generator is internally deterministic but not seed-compatible with `qosa-1.0.0`
- implication: new matched-seed strategy experiments may compare strategies within the new engine, but numeric seeds must not be interpreted as recreating old-engine rounds unless an old-RNG compatibility layer is implemented
- confidence: high; exact historical hands/stock are preserved as a repository fixture
- follow-up: keep historical fixtures separate, then validate round initialization semantics before mass strategy runs


### 2026-10-01 18:49 (+04)
- engine: `qosa-research-0.4.0`; no engine mutation this pass
- deals: 0 strategy deals
- seeds: historical fixture `1898414179` inspected only
- strategies: none; validation gate remains active
- key metrics: repository searches for old simulator field names returned no implementation evidence; the historical fixture has starter 2 with doubles 5-5, 1-1, 2-2 and `openingDraw=1-5`, insufficient to uniquely recover the centre/opening transition
- new finding: current GitHub evidence cannot resolve exact `qosa-1.0.0` round initialization; inferring the centre would invent a rule
- confidence: high for the evidence audit; no gameplay-strategy claim
- limitation: old simulator source or additional complete historical logs are not discoverable on the default branch
- follow-up: continue with initialization-invariant validation: explicit −10/−20/−30/−40 finish fixtures and a documented maximal-vs-prefix multi-double assumption matrix


### 2026-10-01 20:00 (+04)
- engine: `qosa-research-0.5.0` rule-confirmation checkpoint
- deals: 0 strategy deals; deterministic rule/integration fixtures only
- seeds: historical fixture `1898414179` plus constructed start/finish fixtures
- strategies: none yet
- key metrics: user confirmed mandatory `1-1` opening, clockwise continuation, first-round redeal if `1-1` is stock, previous-winner start on later stock `1-1`; non-finishing multi-double prefixes are voluntary; finishing doubles are all played; mixed finish is valid
- validated example: hand `1-5, 5-5, 2-2` with 5 and 2 available after `1-5` ends the round in the same turn with −20
- historical opening fixture: player 2 owns `1-1`, draws stock `1-5`, plays `1-5` as the second opening move, then turn passes clockwise to player 0
- new finding: the three largest rule blockers (start centre, mixed finish, maximal-vs-prefix multi-double behavior) are now resolved by direct user confirmation
- confidence: high for these rules; they are user-confirmed rather than inferred
- limitation: a rare opening edge remains unresolved when starter has no other 1 after the required opening draw; engine explicitly gates it
- follow-up: quantify that edge-case frequency, resolve it, then run complete initialized-round smoke batches before matched strategy simulations


### 2026-10-01 21:34 (+04)
- engine: `qosa-research-0.5.1`
- deals: 0 strategy deals; opening-pass fixture added
- seeds: constructed valid 3×9+1 opening fixture
- strategies: none
- key rule confirmation: after playing `1-1` and drawing the stock tile, if the starter still has no legal tile on 1, the starter passes; play continues clockwise and later passes follow the ordinary rule until a legal move appears
- new finding: the previously gated `no-followup-on-1` opening case is now resolved and no longer needs to be excluded from simulations
- confidence: high; directly confirmed by user
- limitation: branch locking/opening semantics still need stronger integration fixtures before large strategic claims
- follow-up: run complete initialized-round smoke batches and measure unresolved/turn-limit rate


### 2026-10-02 01:53 (+04)
- engine: `qosa-research-0.5.2` locked-branch regression checkpoint
- deals: 0 strategy deals; deterministic branch legality fixture only
- seeds: constructed branch state
- strategies: none
- key metrics: ordinary `5-6` is illegal while number 5 is closed; `5-5` remains a legal opening action; after playing `5-5`, ordinary `5-6` becomes legal on the same branch end
- new finding: the locked/open branch fix is now protected by a regression test rather than existing only in implementation code
- confidence: high for this isolated transition
- limitation: complete initialized-round smoke batches have not yet been run; no new strategy claim
- follow-up: run deterministic full rounds from initializer to finish/block and quantify unresolved/turn-limit rate before strategy batches


### 2026-10-02 04:48 (+04)
- engine: `qosa-research-0.5.3` RNG checkpoint
- deals: 10,000 deterministic deal-generation checks; 0 strategy rounds
- seeds: sequential `0..9999`
- strategies: none; validation gate remains active
- key metrics: previous direct-xorshift seeding was unsuitable for sequential experimental seeds (earlier audit: only 18/28 stock tiles appeared over 10,000 seeds and `1-1` was absent over `0..4095`); seed pre-mixing is now applied before xorshift and protected by a 10,000-seed stock-distribution regression requiring all 28 tiles and a broad sanity band around the expected 357.1 occurrences/tile
- new finding: deterministic seed identity can be preserved without letting adjacent integer seeds feed highly correlated initial xorshift states
- confidence: high that the specific sequential-seed pathology is addressed; this is a distribution sanity check, not a proof of perfect RNG quality
- limitation: RNG remains intentionally incompatible with historical `qosa-1.0.0` numeric seeds; historical fixtures stay separate
- follow-up: run complete initialized-round smoke batches under the corrected deal generator; inspect every unresolved/turn-limit seed before strategy statistics


### 2026-10-03 17:53 (+04)
- engine: `qosa-research-0.5.3`
- run type: complete-round smoke validation; deterministic policy = first legal action
- later-round seeds: `0..999`; 1,000/1,000 initialized, 961 finishes, 39 blocks, 0 init-unresolved, 0 round-unresolved/turn-limit
- later-round finish diagnostics: −10 = 169, −20 = 5, −30 = 0, −40 = 0; mean turns = 26.775, range 19..37
- first-round seeds: `0..999`; 45 correct redeals because `1-1` was in stock, 955 initialized; among initialized rounds 919 finishes, 36 blocks, 0 unresolved/turn-limit
- first-round finish diagnostics: −10 = 163, −20 = 3, −30 = 0, −40 = 0; mean turns = 26.788, range 19..37
- new finding: the initialized 3-player engine now completes the first 1,000 sequential-seed smoke set with zero unresolved states and zero turn-limit failures under both later-round and first-round initialization paths
- confidence: high as a smoke/integration result; these distributions are not strategy findings because only a trivial first-legal policy was used
- run data: `runs/2026-10-03-smoke-0000-0999.json`
- follow-up: expand smoke coverage to at least 10,000 sequential seeds and inspect any failures; if unresolved remains zero, begin matched-seed baseline strategy comparisons


### 2026-10-03 18:05 (+04)
- engine: `qosa-research-0.5.3`
- run type: 10,000-seed complete-round smoke validation; deterministic first-legal policy
- later-round seeds `0..9999`: 10,000/10,000 initialized; 9,637 finishes; 363 blocks; 0 init-unresolved; 0 round-unresolved/turn-limit; mean turns 26.620, range 19..41
- later-round finish diagnostics: −10 = 1,684; −20 = 63; −30 = 0; −40 = 0
- first-round seeds `0..9999`: 363 correct redeals with `1-1` in stock; 9,637 initialized; 9,284 finishes; 353 blocks; 0 unresolved/turn-limit; mean turns 26.627, range 19..41
- first-round finish diagnostics: −10 = 1,617; −20 = 58; −30 = 0; −40 = 0
- new finding: the complete initialized 3-player engine survives 10,000 sequential seeds in both opening modes with zero unresolved states and zero turn-limit failures
- confidence: high as integration/stability evidence; outcome frequencies remain validation diagnostics, not strategy conclusions
- run data: `runs/2026-10-03-smoke-0000-9999.json`
- follow-up: begin matched-seed strategy baselines; do not assign block winners until block winner/tie semantics are explicitly documented


### 2026-10-03 18:12 (+04)
- engine: `qosa-research-0.5.3`
- run type: first matched-seed strategy baseline
- seeds: `0..9999`; 3 seat rotations per seed; 30,000 complete rounds; 28,722 finishes; 1,278 blocks; 0 unresolved
- strategies: `random-legal`, `min-hand-pips`, `fast-doubles`; each strategy has 30,000 appearances and occupies every seat once per seed across the three rotations
- finish rate per appearance: random legal 38.17%; min-hand-pips 35.24%; fast-doubles 22.33%
- mean / median final pips: random 5.56 / 5; min-hand-pips 3.57 / 2; fast-doubles 5.11 / 4
- winner minus counts: random −10=576, −20=12; min-hand-pips −10=1,163, −20=10; fast-doubles −10=131, −20=1; no −30/−40 in this baseline
- new finding: the first simple policies expose a real objective tradeoff: immediate pip minimization substantially lowers end-of-round residue but does not maximize first-to-finish frequency; blindly prioritizing doubles is clearly weak in this three-policy environment
- confidence: medium as a reproducible baseline; the 1,000-seed pilot showed the same ordering, but this is still one bot mix with simplistic policies and fixed opening choice
- limitation: blocks are included in final-pip averages but no block winner is assigned; therefore finish rate is not an overall game-win rate
- run data: `runs/2026-10-03-baseline-0000-9999.json`
- runner: `simulator/strategy-runner.js`
- follow-up: add moderate-double-hold and branch-control policies on the same `0..9999` seed set; add block winner semantics once user confirms them


### 2026-10-03 18:16 (+04)
- engine: `qosa-research-0.5.3`
- run type: matched-seed candidate strategy extension, exact same `0..9999` seed set, 3 seat rotations per seed
- tournament A (30,000 rounds): random legal / min-hand-pips / moderate-double-hold. Finish rates: 30.50% / 30.91% / **35.16%**. Mean final pips: 7.22 / 4.32 / **3.94**. 0 unresolved.
- tournament B (30,000 rounds): random legal / min-hand-pips / closed-branch-control. Finish rates: 28.37% / 27.16% / **41.04%**. Mean final pips: 7.71 / 5.30 / **3.67**. 0 unresolved.
- strong-control tournament (30,000 rounds): min-hand-pips / moderate-double-hold / closed-branch-control. Finish rates: 26.50% / 30.23% / **39.90%**. Mean final pips: 5.61 / 4.88 / **3.87**. 0 unresolved.
- new finding: preserving closed numbers and opening as few new double-numbers as possible is the strongest provisional heuristic tested so far; importantly, it keeps its advantage when random-legal is removed and it faces the two stronger simple baselines
- secondary finding: moderate double holding improves on pure immediate pip minimization in the matched environments tested
- confidence: medium. The signal repeats across 10,000 matched seeds and stronger-opponent control, but these remain handcrafted bots rather than a proof of optimal play
- limitation: block winners remain unassigned; opening follow-up uses the common initializer policy; no rollout-based decision regret yet
- run data: `runs/2026-10-03-candidate-strategies-0000-9999.json`
- follow-up: stress-test branch control against variants that deliberately trade branch closure for tempo, then build paired decision-regret rollouts for positions with multiple legal moves
