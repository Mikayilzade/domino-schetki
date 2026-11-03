# Qoşa açdı research

Исследовательская папка для правил, симуляций и практической стратегии Qoşa açdı.

Цель: не менять приложение-счётки, а отдельно накапливать воспроизводимые данные, чтобы потом разбирать реальные позиции и давать советы по игре.

## Структура

- `RULES.md` — текущая спецификация правил и отмеченные неясности.
- `EXPERIMENTS.md` — протокол почасовых симуляций.
- `RESULTS.md` — накопленные результаты и выводы.
- `simulator/` — исследовательский движок, runners, тесты и trace-calibration utilities; спорные правила остаются явно provisional. `pass-history-conditioned-support.js` реконструирует pass-time hand и считает exact support; opponent-choice softmax runners исследуют likelihood assumptions; `pass-history-trace-temperature-calibration.js` готовит leakage-safe calibration по реальным decision traces и считает cluster-robust uncertainty по round-seat группам.
- `runs/` — отчёты и машинно-читаемые данные отдельных воспроизводимых когорт.

## Принцип

Сначала корректность правил и движка, потом объём. Любой вывод должен хранить:
- версию правил/движка;
- число раздач;
- состав стратегий;
- seed/диапазон seed;
- метрику;
- уровень уверенности;
- известные ограничения.

Исторические результаты из чата сохраняются отдельно от новых прогонов.

## Latest checkpoint
2026-11-03T18:52:25+04:00: second disjoint six-order PWA finish-score holdout with proximity strata (1,000 accepted 3×9 outcomes; attempt seeds 19,000,000–19,001,040; 73 identical match boundaries across all six input orders). Event-order differences appeared in the <=20-point pre-round gap strata in this cohort; descriptive only. See the [run report](runs/2026-11-03-1852-finish-score-event-order-proximity-six-permutation-holdout.md), [runner](simulator/finish-score-event-order-proximity-six-permutation-holdout.js), and [test](simulator/finish-score-event-order-proximity-six-permutation-holdout-test.js).