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
