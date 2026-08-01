'use strict';

const STORAGE_KEY = 'domino-schetki-v2';
const LEGACY_KEY = 'domino-schetki-v1';
const MODES = {
  classic: { title: 'Обычное домино', target: 101, note: 'Записываем остаток руки победителю' },
  phone: { title: 'Телефон', target: 365, note: 'Очки в игре и остаток руки' },
  qosha: { title: 'Qoşa açdı', target: null, note: 'Штрафы и минусы за гошу' }
};

const uid = () => crypto.randomUUID();
const emptyStats = () => ({ games: 0, wins: 0, points: 0, instant35: 0, minus: { events: 0, sum: 0, byAmount: {10:0,20:0,30:0,40:0}, daily: {} } });
const newPlayer = (name, team) => ({ id: uid(), name, active: true, team, stats: emptyStats() });
const defaultState = () => ({ screen: 'setup', mode: 'classic', players: [newPlayer('Микаил', 1), newPlayer('Игрок 2', 2)], game: null, archive: [], modal: null, selectedId: null, phoneEntry: 'play', savedAt: null });

let state = loadState();
const app = document.getElementById('app');

function normalizeStats(s) {
  const base = emptyStats();
  if (!s) return base;
  return { ...base, ...s, minus: { ...base.minus, ...(s.minus || {}), byAmount: { ...base.minus.byAmount, ...(s.minus?.byAmount || {}) }, daily: { ...(s.minus?.daily || {}) } } };
}
function normalizeState(raw) {
  const base = defaultState();
  if (!raw || !Array.isArray(raw.players)) return base;
  return { ...base, ...raw, players: raw.players.map((p, i) => ({ id: p.id || uid(), name: p.name || `Игрок ${i+1}`, active: p.active !== false, team: Number(p.team || i+1), stats: normalizeStats(p.stats) })), archive: Array.isArray(raw.archive) ? raw.archive : [], selectedId: raw.selectedId || raw.game?.entities?.[0]?.id || null, phoneEntry: raw.phoneEntry === 'hand' ? 'hand' : 'play' };
}
function loadState() {
  try {
    const v2 = localStorage.getItem(STORAGE_KEY);
    if (v2) return normalizeState(JSON.parse(v2));
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) return normalizeState(JSON.parse(legacy));
  } catch {}
  return defaultState();
}
function save() { state.savedAt = new Date().toISOString(); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function esc(v) { return String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function nowTime() { return new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); }
function dayKey() { return new Date().toISOString().slice(0,10); }
function activePlayers() { return state.players.filter(p => p.active); }

function entitiesFromSetup() {
  const groups = new Map();
  for (const p of activePlayers()) {
    const key = `team-${p.team || p.id}`;
    if (!groups.has(key)) groups.set(key, { id:key, name:'', memberIds:[], members:[], score:0 });
    const g = groups.get(key); g.memberIds.push(p.id); g.members.push(p.name);
  }
  const entities = [...groups.values()];
  entities.forEach((e,i) => e.name = e.members.length > 1 ? `Команда ${i+1}` : e.members[0]);
  return entities;
}
function render() { app.innerHTML = state.screen === 'game' && state.game ? renderGame() : renderSetup(); bind(); save(); }
function renderSetup() {
  const hasGame = !!state.game;
  return `<div class="shell">
    <header class="topbar"><div class="brand"><h1>Домино — счётки</h1><p>Счёт, история и статистика игроков</p></div></header>
    ${hasGame ? `<button class="resume-banner" id="resume-game">Продолжить сохранённую партию · ${esc(MODES[state.game.mode].title)}</button>` : ''}
    <section class="card"><h2 class="section-title">Режим</h2><div class="grid mode-grid">${Object.entries(MODES).map(([id,m]) => `<button class="mode-card ${state.mode===id?'active':''}" data-mode="${id}"><strong>${m.title}</strong><span>${m.note}</span></button>`).join('')}</div></section>
    <section class="card"><div class="topbar"><h2 class="section-title">Игроки</h2><button class="secondary" id="add-player">+ Игрок</button></div>
      <div class="list">${state.players.map(p=>`<div class="player-row"><input type="checkbox" data-active="${p.id}" ${p.active?'checked':''}><input class="name" type="text" data-name="${p.id}" value="${esc(p.name)}"><select data-team="${p.id}">${[1,2,3,4,5].map(n=>`<option value="${n}" ${p.team===n?'selected':''}>${n}</option>`).join('')}</select><button class="stat-chip" data-stats="${p.id}" title="Статистика">${p.stats.wins}🏆</button><button class="danger compact" data-remove="${p.id}" ${state.players.length<=2?'disabled':''}>×</button></div>`).join('')}</div>
      <p class="small">Одинаковый номер объединяет игроков в команду.</p>
    </section>
    <div class="actions"><button class="primary" id="start-game">Начать новую игру</button><button class="secondary" id="open-progress">Прогресс</button></div>
    <section class="card reset-card"><h2 class="section-title">Сброс</h2><div class="actions"><button class="danger" id="reset-stats">Стереть статистику</button><button class="danger" id="reset-all">Полный сброс</button></div></section>
    ${renderModal()}
  </div>`;
}
function selectedEntity() { return state.game?.entities.find(e => e.id === state.selectedId) || state.game?.entities[0]; }
function renderGame() {
  const g = state.game, mode = MODES[g.mode], winner = g.winnerId ? g.entities.find(e=>e.id===g.winnerId) : null, selected = selectedEntity();
  return `<div class="shell game-shell">
    <header class="topbar"><div class="brand"><h1>${mode.title}</h1><p>${mode.target ? `Игра до ${mode.target}` : 'Свободный счёт'}</p></div><button class="icon-btn" id="setup">⚙</button></header>
    ${winner ? `<div class="banner">Победа: ${esc(winner.name)}</div>` : ''}
    <div class="game-meta"><span>Записей: ${g.history.length}</span><span class="saved">● сохранено</span><span>${g.entities.length} сторон</span></div>
    <section class="score-strip">${g.entities.map(e => renderScoreCard(e, winner)).join('')}</section>
    ${g.mode === 'phone' ? `<div class="entry-toggle"><button data-entry="play" class="${state.phoneEntry==='play'?'active':''}">В игре</button><button data-entry="hand" class="${state.phoneEntry==='hand'?'active':''}">Рука</button></div>` : ''}
    ${renderControlPanel(selected)}
    <div class="actions"><button class="secondary" id="undo" ${g.history.length?'':'disabled'}>↶ Отменить</button><button class="danger" id="finish-game">${winner?'Сохранить результат':'Завершить партию'}</button></div>
    <section class="card"><h2 class="section-title">История</h2><div class="history">${g.history.length ? g.history.slice().reverse().map(h=>`<div class="history-row"><span>${esc(h.text)}</span><time>${h.time}</time></div>`).join('') : '<div class="empty">Пока нет записей</div>'}</div></section>${renderModal()}
  </div>`;
}
function renderScoreCard(e, winner) {
  const selected = e.id === selectedEntity()?.id;
  return `<button class="score-card ${selected?'selected':''} ${winner?.id===e.id?'winner':''}" data-select="${e.id}"><div class="score-name">${esc(e.name)}</div><div class="score-members">${e.members.map(esc).join(' · ')}</div><div class="score-value">${e.score}</div></button>`;
}
function renderControlPanel(e) {
  if (!e) return '';
  const mode = state.game.mode;
  if (mode === 'phone' && state.phoneEntry === 'play') return `<section class="control-panel"><div class="control-title">В игре → <strong>${esc(e.name)}</strong></div><div class="quick-grid">${[5,10,15,20,25,30,35].map(n=>`<button data-add="${n}">+${n}</button>`).join('')}</div></section>`;
  if (mode === 'phone' || mode === 'classic') return `<button class="hand-launch" id="open-keypad">Рука → ${esc(e.name)} <span>ввести остаток</span></button>`;
  return `<section class="control-panel"><div class="control-title">Записать → <strong>${esc(e.name)}</strong></div><div class="qosha-grid"><button data-add="10">+10</button>${[10,20,30,40].map(n=>`<button class="minus" data-minus="${n}">−${n}</button>`).join('')}<button id="open-keypad">Рука</button></div></section>`;
}
function renderModal() {
  if (!state.modal) return '';
  if (state.modal.type === 'keypad') {
    const e = selectedEntity(), value = state.modal.value || '';
    return `<div class="modal-backdrop"><div class="modal keypad-modal"><h2>${esc(e.name)}</h2><div class="keypad-display">${value || '0'}</div><div class="keypad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button data-digit="${n}">${n}</button>`).join('')}<button id="keypad-clear">⌫</button><button data-digit="0">0</button><button id="keypad-reset">C</button></div><div class="actions"><button class="secondary" id="close-modal">Закрыть</button><button class="primary" id="apply-keypad" ${value?'':'disabled'}>Записать</button></div></div></div>`;
  }
  if (state.modal.type === 'stats') {
    const p = state.players.find(x=>x.id===state.modal.playerId), s=p.stats, d=s.minus.daily[dayKey()]||{events:0,sum:0};
    return `<div class="modal-backdrop"><div class="modal"><h2>${esc(p.name)}</h2><div class="stat-grid"><div><b>${s.games}</b><span>партий</span></div><div><b>${s.wins}</b><span>побед</span></div><div><b>${s.points}</b><span>очков</span></div><div><b>${s.instant35}</b><span>побед +35</span></div></div><h3>Минусы</h3><div class="stat-lines"><p>Сегодня: ${d.events} раз, сумма −${d.sum}</p><p>Всего: ${s.minus.events} раз, сумма −${s.minus.sum}</p><p>−10: ${s.minus.byAmount[10]} · −20: ${s.minus.byAmount[20]} · −30: ${s.minus.byAmount[30]} · −40+: ${s.minus.byAmount[40]}</p></div><button class="secondary wide" id="close-modal">Закрыть</button></div></div>`;
  }
  if (state.modal.type === 'progress') return `<div class="modal-backdrop"><div class="modal"><h2>Прогресс</h2><div class="list">${state.players.map(p=>`<button class="progress-row" data-stats="${p.id}"><span>${esc(p.name)}</span><b>${p.stats.wins}/${p.stats.games}</b></button>`).join('')}</div><p class="small">Победы / сыгранные партии. Нажми игрока для подробностей.</p><button class="secondary wide" id="close-modal">Закрыть</button></div></div>`;
  return '';
}
function bind() {
  document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{state.mode=b.dataset.mode;render();});
  document.getElementById('add-player')?.addEventListener('click',()=>{state.players.push(newPlayer(`Игрок ${state.players.length+1}`,state.players.length+1));render();});
  document.querySelectorAll('[data-active]').forEach(el=>el.onchange=()=>{state.players.find(p=>p.id===el.dataset.active).active=el.checked;save();});
  document.querySelectorAll('[data-name]').forEach(el=>el.onchange=()=>{state.players.find(p=>p.id===el.dataset.name).name=el.value.trim()||'Игрок';save();});
  document.querySelectorAll('[data-team]').forEach(el=>el.onchange=()=>{state.players.find(p=>p.id===el.dataset.team).team=Number(el.value);save();});
  document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{state.players=state.players.filter(p=>p.id!==b.dataset.remove);render();});
  document.querySelectorAll('[data-stats]').forEach(b=>b.onclick=()=>{state.modal={type:'stats',playerId:b.dataset.stats};render();});
  document.getElementById('open-progress')?.addEventListener('click',()=>{state.modal={type:'progress'};render();});
  document.getElementById('start-game')?.addEventListener('click',startGame);
  document.getElementById('resume-game')?.addEventListener('click',()=>{state.screen='game';render();});
  document.getElementById('setup')?.addEventListener('click',()=>{state.screen='setup';render();});
  document.querySelectorAll('[data-select]').forEach(b=>b.onclick=()=>{state.selectedId=b.dataset.select;if(state.game.mode!=='phone'||state.phoneEntry==='hand')openKeypad();else render();});
  document.querySelectorAll('[data-entry]').forEach(b=>b.onclick=()=>{state.phoneEntry=b.dataset.entry;render();});
  document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>applyScore(state.selectedId,Number(b.dataset.add),false));
  document.querySelectorAll('[data-minus]').forEach(b=>b.onclick=()=>applyMinus(state.selectedId,Number(b.dataset.minus)));
  document.getElementById('open-keypad')?.addEventListener('click',openKeypad);
  document.querySelectorAll('[data-digit]').forEach(b=>b.onclick=()=>{const v=(state.modal.value||'')+b.dataset.digit;state.modal.value=v.replace(/^0+(?=\d)/,'').slice(0,3);render();});
  document.getElementById('keypad-clear')?.addEventListener('click',()=>{state.modal.value=(state.modal.value||'').slice(0,-1);render();});
  document.getElementById('keypad-reset')?.addEventListener('click',()=>{state.modal.value='';render();});
  document.getElementById('apply-keypad')?.addEventListener('click',applyKeypad);
  document.getElementById('close-modal')?.addEventListener('click',()=>{state.modal=null;render();});
  document.getElementById('undo')?.addEventListener('click',undo);
  document.getElementById('finish-game')?.addEventListener('click',finishGame);
  document.getElementById('reset-stats')?.addEventListener('click',resetStats);
  document.getElementById('reset-all')?.addEventListener('click',resetAll);
}
function startGame() {
  const entities=entitiesFromSetup(); if(entities.length<2)return alert('Нужно минимум две стороны.');
  state.game={id:uid(),mode:state.mode,entities,history:[],winnerId:null,startedAt:new Date().toISOString(),recorded:false}; state.selectedId=entities[0].id;state.phoneEntry='play';state.screen='game';state.modal=null;render();
}
function openKeypad(){state.modal={type:'keypad',value:''};render();}
function applyKeypad(){const value=Number(state.modal.value);if(!value)return;state.modal=null;applyScore(state.selectedId,value,true);}
function snapshot(){return JSON.stringify({entities:state.game.entities,winnerId:state.game.winnerId});}
function applyScore(entityId, raw, isHand) {
  const g=state.game,e=g.entities.find(x=>x.id===entityId);if(!e)return;const before=snapshot();let amount=raw,text;
  if(g.mode==='phone'&&isHand){if(e.score>=300){g.history.push({text:`${e.name}: рука ${raw} не записана — уже 300+`,time:nowTime(),before});render();return;}amount=Math.ceil(Math.max(0,raw)/5)*5;text=`${e.name}: рука ${raw} → +${amount}`;}else text=`${e.name}: ${isHand?'рука ':''}+${amount}`;
  e.score+=amount;g.history.push({text,time:nowTime(),before,kind:'score',amount,entityId});checkWinner(e,amount,isHand);render();
}
function applyMinus(entityId, amount){const g=state.game,e=g.entities.find(x=>x.id===entityId);if(!e)return;const before=snapshot(),applied=Math.min(e.score,amount);e.score-=applied;const text=applied<amount?`${e.name}: −${amount}, счёт остался 0`:`${e.name}: −${amount}`;g.history.push({text,time:nowTime(),before,kind:'minus',amount,entityId,memberIds:e.memberIds});render();}
function checkWinner(e,amount,isHand){const g=state.game;if(g.winnerId)return;if(g.mode==='classic'&&e.score>=101)g.winnerId=e.id;if(g.mode==='phone'){const nobodyAt300Before=g.entities.every(x=>x.id===e.id?x.score-amount<300:x.score<300);if(!isHand&&amount===35&&nobodyAt300Before){g.winnerId=e.id;g.instant35=true;}else if(e.score>=365)g.winnerId=e.id;}}
function undo(){const last=state.game.history.pop();if(!last)return;const old=JSON.parse(last.before);state.game.entities=old.entities;state.game.winnerId=old.winnerId;render();}
function finishGame(){const g=state.game;if(!g)return;if(!g.winnerId&&!confirm('Победитель не определён. Всё равно завершить партию?'))return;if(!g.recorded)recordGame(g);state.archive.unshift({id:g.id,mode:g.mode,winnerId:g.winnerId,endedAt:new Date().toISOString(),entities:g.entities.map(e=>({name:e.name,score:e.score}))});state.archive=state.archive.slice(0,100);state.game=null;state.screen='setup';state.modal=null;render();}
function recordGame(g){const winner=g.entities.find(e=>e.id===g.winnerId),participantIds=new Set(g.entities.flatMap(e=>e.memberIds));state.players.forEach(p=>{if(!participantIds.has(p.id))return;p.stats=normalizeStats(p.stats);p.stats.games++;const entity=g.entities.find(e=>e.memberIds.includes(p.id));p.stats.points+=entity?.score||0;if(winner?.memberIds.includes(p.id)){p.stats.wins++;if(g.instant35)p.stats.instant35++;}});for(const h of g.history.filter(x=>x.kind==='minus'))for(const id of h.memberIds||[]){const p=state.players.find(x=>x.id===id);if(!p)continue;const m=p.stats.minus;m.events++;m.sum+=h.amount;const bucket=h.amount>=40?40:h.amount;m.byAmount[bucket]=(m.byAmount[bucket]||0)+1;const day=dayKey();m.daily[day]=m.daily[day]||{events:0,sum:0};m.daily[day].events++;m.daily[day].sum+=h.amount;}g.recorded=true;}
function resetStats(){if(!confirm('Стереть всю статистику и архив? Список игроков останется.'))return;state.players.forEach(p=>p.stats=emptyStats());state.archive=[];render();}
function resetAll(){if(!confirm('Удалить игроков, текущую партию и всю статистику?'))return;localStorage.removeItem(STORAGE_KEY);localStorage.removeItem(LEGACY_KEY);state=defaultState();render();}
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();
