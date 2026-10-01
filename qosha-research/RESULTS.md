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
