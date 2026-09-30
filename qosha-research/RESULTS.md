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
