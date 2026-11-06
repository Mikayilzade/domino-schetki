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
2026-11-06 12:45 Asia/Baku: **execution gate remains blocked**, not green. GitHub source-of-truth `RESULTS.md` (latest entry 11:51 +04) records **0/17 validation suites actually executed** and no new strategy deals; the 17 suites and fingerprint replay harness are authored but not runtime-verified. This environment cannot resolve `github.com` from its executable shell (`git ls-remote` failed again at 12:45); GitHub connector can read/write text but does not provide a runnable checkout. **Do not claim test success or expand strategy samples from source inspection.** Historical 180,000 matched-seat strategy rounds remain separate from later documented cohorts; do not treat that historical subtotal as an all-time cumulative total. Next: obtain executable checkout, run `node qosha-research/simulator/validation-fingerprint-replay-test.js` and `node qosha-research/simulator/validation-gate.js`, archive real JSON and fix failures before new matched-seed simulations. No PWA files changed.
