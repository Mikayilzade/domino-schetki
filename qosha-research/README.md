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
2026-11-03T08:50:37+04:00: paired tied-minimum block mix/rotation holdout (2,000 unique deals; 48,000 model-rounds; 1,976 tied traces replay-verified). No stable mix×rotation interaction; branch/block assumptions remain provisional. See qosha-research/RESULTS.md and the linked run report.
