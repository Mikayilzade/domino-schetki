'use strict';

const STORAGE_KEY = 'domino-schetki-v1';
const MODES = {
  classic: { title: 'Обычное домино', target: 101, note: 'Остаток камней победителю или команде' },
  phone: { title: 'Телефон', target: 365, note: '+5…+35 во время игры, особая победа на 35' },
  qosha: { title: 'Qoşa açdı', target: null, note: '+10 штраф, −10 за завершение гошой' }
};

const defaultState = () => ({
  screen: 'setup',
  mode: 'classic',
  players: [
    { id: crypto.randomUUID(), name: 'Микаил', active: true, team: 1 },
    { id: crypto.randomUUID(), name: 'Игрок 2', active: true, team: 2 }
  ],
  game: null,
  modal: null
});

let state = loadState();
const app = document.getElementById('app');

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return parsed && parsed.players ? parsed : defaultState();
  } catch { return defaultState(); }
}
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function esc(value) { return String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch])); }
function nowTime() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
function activePlayers() { return state.players.filter(p => p.active); }
function entitiesFromSetup() {
  const groups = new Map();
  for (const p of activePlayers()) {
    const key = `team-${p.team || p.id}`;
    if (!groups.has(key)) groups.set(key, { id: key, name: '', members: [], score: 0, handLocked: false });
    groups.get(key).members.push(p.name);
  }
  const entities = [...groups.values()];
  entities.forEach((e, i) => { e.name = e.members.length > 1 ? `Команда ${i + 1}` : e.members[0]; });
  return entities;
}

function render() {
  app.innerHTML = state.screen === 'game' && state.game ? renderGame() : renderSetup();
  bind();
  save();
}

function renderSetup() {
  return `<div class="shell">
    <header class="topbar"><div class="brand"><h1>Домино — счётки</h1><p>Быстрый счёт для игры за столом</p></div></header>
    <section class="card"><h2 class="section-title">Режим</h2><div class="grid mode-grid">
      ${Object.entries(MODES).map(([id,m]) => `<button class="mode-card ${state.mode===id?'active':''}" data-mode="${id}"><strong>${m.title}</strong><span>${m.note}</span></button>`).join('')}
    </div></section>
    <section class="card"><div class="topbar"><h2 class="section-title">Игроки</h2><button class="secondary" id="add-player">+ Игрок</button></div>
      <div class="list">${state.players.map((p,i)=>`<div class="player-row">
        <input type="checkbox" data-active="${p.id}" ${p.active?'checked':''} aria-label="Участвует" />
        <input class="name" type="text" data-name="${p.id}" value="${esc(p.name)}" />
        <select data-team="${p.id}" aria-label="Команда">${[1,2,3,4,5].map(n=>`<option value="${n}" ${p.team===n?'selected':''}>${n}</option>`).join('')}</select>
        <button class="danger" data-remove="${p.id}" ${state.players.length<=2?'disabled':''}>×</button>
      </div>`).join('')}</div>
      <p class="small">Одинаковый номер объединяет игроков в команду. Разные номера означают отдельные стороны.</p>
    </section>
    <div class="actions"><button class="primary" id="start-game">Начать игру</button>${state.game?'<button class="secondary" id="resume-game">Продолжить прошлую</button>':''}</div>
  </div>`;
}

function renderGame() {
  const g = state.game;
  const mode = MODES[g.mode];
  const winner = g.winnerId ? g.entities.find(e=>e.id===g.winnerId) : null;
  return `<div class="shell">
    <header class="topbar"><div class="brand"><h1>${mode.title}</h1><p>${mode.target ? `Игра до ${mode.target}` : 'Свободный счёт'}</p></div><button class="icon-btn" id="setup">⚙</button></header>
    ${winner?`<div class="banner">Победа: ${esc(winner.name)}</div>`:''}
    <div class="game-meta"><span>Ход ${g.history.length + 1}</span><span>${g.entities.length} сторон</span></div>
    <section class="game-board">${g.entities.map(e=>renderScoreCard(e,g.mode,winner)).join('')}</section>
    <div class="actions"><button class="secondary" id="undo" ${g.history.length?'':'disabled'}>↶ Отменить</button><button class="danger" id="new-game">Новая игра</button></div>
    <section class="card"><h2 class="section-title">История</h2><div class="history">${g.history.length?g.history.slice().reverse().map(h=>`<div class="history-row"><span>${esc(h.text)}</span><time>${h.time}</time></div>`).join(''):'<div class="empty">Пока нет записей</div>'}</div></section>
    ${renderModal()}
  </div>`;
}

function renderScoreCard(e, mode, winner) {
  let buttons = '';
  if (mode === 'phone') {
    buttons = [5,10,15,20,25,30,35].map(n=>`<button data-add="${e.id}:${n}">+${n}</button>`).join('') + `<button class="custom" data-custom="${e.id}">Рука / другое</button>`;
  } else if (mode === 'qosha') {
    buttons = `<button data-add="${e.id}:10">+10</button><button class="minus" data-add="${e.id}:-10">−10</button><button class="custom" data-custom="${e.id}">Другое</button>`;
  } else {
    buttons = `<button class="custom" data-custom="${e.id}">Записать остаток</button>`;
  }
  return `<article class="score-card ${winner?.id===e.id?'winner':''}">
    <div><div class="score-name">${esc(e.name)}</div><div class="score-members">${e.members.map(esc).join(' · ')}</div></div>
    <div class="score-value">${e.score}</div>
    <div class="score-tools">${buttons}</div>
  </article>`;
}

function renderModal() {
  if (!state.modal) return '';
  const e = state.game.entities.find(x=>x.id===state.modal.entityId);
  return `<div class="modal-backdrop"><div class="modal"><h2>${esc(e.name)}</h2>
    <div class="field"><label>Сколько записать</label><input id="custom-value" inputmode="numeric" type="number" min="-999" max="999" placeholder="Например, 21" autofocus /></div>
    ${state.game.mode==='phone'?'<label class="small"><input id="hand-score" type="checkbox" checked /> Это остаток руки (округлить вверх до 5)</label>':''}
    <div class="actions" style="margin-top:14px"><button class="secondary" id="close-modal">Отмена</button><button class="primary" id="apply-custom">Записать</button></div>
  </div></div>`;
}

function bind() {
  document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{state.mode=b.dataset.mode;render();});
  document.getElementById('add-player')?.addEventListener('click',()=>{state.players.push({id:crypto.randomUUID(),name:`Игрок ${state.players.length+1}`,active:true,team:state.players.length+1});render();});
  document.querySelectorAll('[data-active]').forEach(el=>el.onchange=()=>{state.players.find(p=>p.id===el.dataset.active).active=el.checked;save();});
  document.querySelectorAll('[data-name]').forEach(el=>el.onchange=()=>{state.players.find(p=>p.id===el.dataset.name).name=el.value.trim()||'Игрок';save();});
  document.querySelectorAll('[data-team]').forEach(el=>el.onchange=()=>{state.players.find(p=>p.id===el.dataset.team).team=Number(el.value);save();});
  document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{state.players=state.players.filter(p=>p.id!==b.dataset.remove);render();});
  document.getElementById('start-game')?.addEventListener('click', startGame);
  document.getElementById('resume-game')?.addEventListener('click',()=>{state.screen='game';render();});
  document.getElementById('setup')?.addEventListener('click',()=>{state.screen='setup';render();});
  document.getElementById('new-game')?.addEventListener('click',()=>{if(confirm('Сбросить текущий счёт и начать заново?')){state.game=null;state.screen='setup';render();}});
  document.getElementById('undo')?.addEventListener('click', undo);
  document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{const [id,val]=b.dataset.add.split(':');applyScore(id,Number(val),false);});
  document.querySelectorAll('[data-custom]').forEach(b=>b.onclick=()=>{state.modal={entityId:b.dataset.custom};render();setTimeout(()=>document.getElementById('custom-value')?.focus(),0);});
  document.getElementById('close-modal')?.addEventListener('click',()=>{state.modal=null;render();});
  document.getElementById('apply-custom')?.addEventListener('click',()=>{const value=Number(document.getElementById('custom-value').value);if(!Number.isFinite(value))return;const hand=!!document.getElementById('hand-score')?.checked;const id=state.modal.entityId;state.modal=null;applyScore(id,value,hand);});
  document.getElementById('custom-value')?.addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('apply-custom').click();});
}

function startGame() {
  const entities = entitiesFromSetup();
  if (entities.length < 2) return alert('Нужно минимум две стороны. Раздели игроков на разные команды.');
  state.game = { mode: state.mode, entities, history: [], winnerId: null };
  state.screen = 'game';
  state.modal = null;
  render();
}

function applyScore(entityId, raw, isHand) {
  const g = state.game;
  const e = g.entities.find(x=>x.id===entityId);
  if (!e) return;
  const before = snapshot();
  let amount = raw;
  let text = '';

  if (g.mode === 'phone' && isHand) {
    if (e.score >= 300) {
      text = `${e.name}: рука ${raw} не записана — уже 300+`;
      g.history.push({ text, time: nowTime(), before });
      render(); return;
    }
    amount = Math.max(0, Math.ceil(raw / 5) * 5);
    text = `${e.name}: рука ${raw} → +${amount}`;
  } else if (g.mode === 'qosha' && amount < 0) {
    const applied = Math.min(e.score, Math.abs(amount));
    e.score -= applied;
    text = applied ? `${e.name} −${Math.abs(amount)}${applied<Math.abs(amount)?`, счёт остался 0`:''}` : `${e.name} −${Math.abs(amount)}, счёт остался 0`;
    g.history.push({ text, time: nowTime(), before });
    checkWinner(e, amount, false);
    render(); return;
  } else {
    text = `${e.name} ${amount >= 0 ? '+' : ''}${amount}`;
  }

  e.score = Math.max(0, e.score + amount);
  g.history.push({ text, time: nowTime(), before });
  checkWinner(e, amount, isHand);
  render();
}

function checkWinner(e, amount, isHand) {
  const g = state.game;
  if (g.winnerId) return;
  if (g.mode === 'classic' && e.score >= 101) g.winnerId = e.id;
  if (g.mode === 'phone') {
    const nobodyAt300Before = g.entities.every(x => x.id===e.id ? x.score - amount < 300 : x.score < 300);
    if (!isHand && amount === 35 && nobodyAt300Before) g.winnerId = e.id;
    else if (e.score >= 365) g.winnerId = e.id;
  }
}

function snapshot() { return JSON.stringify({ entities: state.game.entities, winnerId: state.game.winnerId }); }
function undo() {
  const last = state.game.history.pop();
  if (!last) return;
  const old = JSON.parse(last.before);
  state.game.entities = old.entities;
  state.game.winnerId = old.winnerId;
  render();
}

if ('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();
