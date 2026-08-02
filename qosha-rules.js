'use strict';

MODES.qosha.target = 101;
MODES.qosha.note = 'Экономия: 101+ — взрыв, последние делят 3 балла';

const baseSelectedEntity = selectedEntity;
const baseRenderScoreCard = renderScoreCard;
const baseRenderControlPanel = renderControlPanel;
const baseRenderGame = renderGame;
const baseCheckWinner = checkWinner;
const baseFinishGame = finishGame;
const baseRecordGame = recordGame;

function qoshaSurvivors(game = state.game) {
  return game?.entities?.filter(entity => !entity.exploded && entity.score < 101) || [];
}

function qoshaPlaces(game = state.game) {
  const survivors = qoshaSurvivors(game).sort((a, b) => a.score - b.score);
  if (survivors.length === 1) return [{ entity: survivors[0], points: 3, place: 1 }];
  if (survivors.length === 2) {
    return [
      { entity: survivors[0], points: 2, place: 1 },
      { entity: survivors[1], points: 1, place: 2 }
    ];
  }
  return [];
}

selectedEntity = function selectedActiveEntity() {
  if (state.game?.mode !== 'qosha') return baseSelectedEntity();
  const selected = state.game.entities.find(entity => entity.id === state.selectedId && !entity.exploded);
  return selected || qoshaSurvivors()[0] || state.game.entities[0];
};

renderScoreCard = function renderEconomyCard(entity, winner) {
  if (state.game?.mode !== 'qosha') return baseRenderScoreCard(entity, winner);
  const selected = entity.id === selectedEntity()?.id;
  const exploded = entity.exploded || entity.score >= 101;
  return `<button class="score-card ${selected ? 'selected' : ''} ${exploded ? 'exploded' : ''}" data-select="${entity.id}" ${exploded ? 'disabled' : ''}><div class="score-name">${esc(entity.name)}</div><div class="score-members">${exploded ? 'ВЗОРВАН' : entity.members.map(esc).join(' · ')}</div><div class="score-value">${entity.score}</div></button>`;
};

renderControlPanel = function renderEconomyControls(entity) {
  if (state.game?.mode !== 'qosha') return baseRenderControlPanel(entity);
  const survivors = qoshaSurvivors();
  if (survivors.length <= 2) {
    const places = qoshaPlaces();
    return `<section class="control-panel"><div class="control-title"><strong>Партия завершена</strong></div><div class="stat-lines">${places.map(item => `<p>${item.place}-е: <b>${esc(item.entity.name)}</b> — ${item.points} бал.</p>`).join('')}</div></section>`;
  }
  if (!entity || entity.exploded) return '';
  return `<section class="control-panel"><div class="control-title">Записать → <strong>${esc(entity.name)}</strong></div><div class="qosha-grid"><button data-add="10">+10</button>${[10,20,30,40].map(n => `<button class="minus" data-minus="${n}">−${n}</button>`).join('')}<button id="open-keypad">Рука</button></div></section>`;
};

renderGame = function renderEconomyGame() {
  let html = baseRenderGame();
  if (state.game?.mode !== 'qosha') return html;
  const survivors = qoshaSurvivors();
  const places = qoshaPlaces();
  html = html.replace(/<div class="banner">[\s\S]*?<\/div>/, '');
  if (survivors.length <= 2 && places.length) {
    const summary = places.map(item => `${esc(item.entity.name)} — ${item.points}`).join(' · ');
    html = html.replace('<div class="game-meta">', `<div class="banner">Итог: ${summary}</div><div class="game-meta">`);
    html = html.replace(/>Завершить партию<|>Сохранить результат</, '>Сохранить результат<');
  }
  return html;
};

checkWinner = function checkEconomyExplosion(entity, amount, isHand) {
  const game = state.game;
  if (game?.mode !== 'qosha') return baseCheckWinner(entity, amount, isHand);
  if (entity.score >= 101) {
    entity.exploded = true;
    const last = game.history[game.history.length - 1];
    if (last) last.text += ' — ВЗРЫВ';
    const next = qoshaSurvivors(game)[0];
    if (next) state.selectedId = next.id;
  }
  game.winnerId = null;
  game.qoshaFinished = qoshaSurvivors(game).length <= 2;
};

finishGame = function finishEconomyGame() {
  const game = state.game;
  if (game?.mode !== 'qosha') return baseFinishGame();
  if (qoshaSurvivors(game).length > 2) {
    alert('Игра продолжается: должны остаться один или два невзорванных игрока.');
    return;
  }
  completeFinish(0);
};

recordGame = function recordEconomyGame(game) {
  if (game.mode !== 'qosha') return baseRecordGame(game);
  const participantIds = new Set(game.entities.flatMap(entity => entity.memberIds));
  const places = qoshaPlaces(game);
  const first = places.find(item => item.place === 1)?.entity;

  state.players.forEach(player => {
    if (!participantIds.has(player.id)) return;
    player.stats = normalizeStats(player.stats);
    player.stats.games++;
    const entity = game.entities.find(item => item.memberIds.includes(player.id));
    player.stats.points += entity?.score || 0;
    if (first?.memberIds.includes(player.id)) player.stats.wins++;
  });

  for (const item of places) addRating(item.entity.memberIds, item.points, item.place, item.points === 3);
  for (const entity of game.entities.filter(item => item.exploded)) addRating(entity.memberIds, 0, 0, false);

  for (const historyItem of game.history.filter(item => item.kind === 'minus')) {
    for (const id of historyItem.memberIds || []) {
      const player = state.players.find(item => item.id === id);
      if (!player) continue;
      const minus = player.stats.minus;
      minus.events++;
      minus.sum += historyItem.amount;
      const bucket = historyItem.amount >= 40 ? 40 : historyItem.amount;
      minus.byAmount[bucket] = (minus.byAmount[bucket] || 0) + 1;
      const day = dayKey();
      minus.daily[day] = minus.daily[day] || { events: 0, sum: 0 };
      minus.daily[day].events++;
      minus.daily[day].sum += historyItem.amount;
    }
  }
  game.recorded = true;
};

const style = document.createElement('style');
style.textContent = '.score-card.exploded{opacity:.42;border-color:#ff7b7b}.score-card.exploded .score-members{color:#ff7b7b;font-weight:800;letter-spacing:.06em}';
document.head.appendChild(style);
render();
