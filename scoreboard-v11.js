'use strict';

// Keep the main scoreboard on the proven v8 binding chain.
// Analytics uses delegated events instead of wrapping bind() again.
if (typeof bindV10Base === 'function') bind = bindV10Base;

function todayRating(p){
  return typeof todayRatingV8 === 'function'
    ? todayRatingV8(p)
    : (p?.stats?.rating?.daily?.[dayKey()] || {points:0,games:0,first:0,second:0,bonus3:0});
}

function rerenderV11(){
  try { render(); } catch (e) { console.error('render v11', e); }
}

document.addEventListener('change', event => {
  const el = event.target;
  if (!el) return;
  if (el.id === 'rank-mode') { ensureModeRankingV10(); state.analytics.mode = el.value; rerenderV11(); return; }
  if (el.id === 'rank-period') { ensureModeRankingV10(); state.analytics.period = el.value; rerenderV11(); return; }
  if (el.id === 'rank-anchor') { ensureModeRankingV10(); state.analytics.anchor = el.value || dayKey(); rerenderV11(); return; }
  if (el.id === 'rank-month') { ensureModeRankingV10(); state.analytics.month = el.value || dayKey().slice(0,7); rerenderV11(); return; }
  if (el.id === 'rank-from') { ensureModeRankingV10(); state.analytics.from = el.value || dayKey(); rerenderV11(); return; }
  if (el.id === 'rank-to') { ensureModeRankingV10(); state.analytics.to = el.value || dayKey(); rerenderV11(); return; }
  if (el.matches?.('[data-rank-player]')) {
    ensureModeRankingV10();
    const all = state.players.map(p => p.id);
    const selected = [...document.querySelectorAll('[data-rank-player]:checked')].map(x => x.dataset.rankPlayer);
    state.analytics.players = selected.length === all.length ? [] : selected;
    rerenderV11();
  }
});

document.addEventListener('click', event => {
  const button = event.target?.closest?.('#rank-toggle-all');
  if (!button) return;
  ensureModeRankingV10();
  state.analytics.players = state.analytics.players.length ? [] : state.players.map(p => p.id);
  rerenderV11();
});

// Final render after all extension scripts are loaded.
setTimeout(rerenderV11, 0);
