# Qoşa açdı research

Исследовательская папка для правил, симуляций и практической стратегии Qoşa açdı.

Цель: не менять приложение-счётки, а отдельно накапливать воспроизводимые данные, чтобы потом разбирать реальные позиции и давать советы по игре.

## Структура

- \`RULES.md\` — текущая спецификация правил и отмеченные неясности.
- \`EXPERIMENTS.md\` — протокол почасовых симуляций.
- \`RESULTS.md\` — накопленные результаты и выводы.
- \`simulator/\` — исследовательский движок, runners, тесты и trace-calibration utilities; спорные правила остаются явно provisional. \`pass-history-conditioned-support.js\` реконструирует pass-time hand и считает exact support; opponent-choice softmax runners исследуют likelihood assumptions; \`pass-history-trace-temperature-calibration.js\` готовит leakage-safe calibration по реальным decision traces и считает cluster-robust uncertainty по round-seat группам.
- \`runs/\` — отчёты и машинно-читаемые данные отдельных воспроизводимых когорт.

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
2026-11-02T17:56:32+04:00: synthetic finite-sample validation of round-seat CR1 uncertainty; no new deals or real traces, no temperature fit. Small-G/unequal-cluster intervals can undercover sharply. See `qosha-research/runs/2026-11-02-1756-trace-calibration-cr1-small-cluster-sensitivity.md` and `.json`, with reproducer `qosha-research/simulator/cluster-se-synthetic-validation.py`.