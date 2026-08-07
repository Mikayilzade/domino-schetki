'use strict';

function scoreNameForPlayer(p){
  const nick=String(p.nick||'').trim().slice(0,8);
  if(nick)return nick;
  const first=String(p.fullName||'').trim().split(/\s+/)[0]||'';
  if(first.length<=8)return first;
  return p.short||initials(p.fullName);
}
function scoreNameForEntity(e){
  if((e.memberIds||[]).length===1){const p=state.players.find(x=>x.id===e.memberIds[0]);return p?scoreNameForPlayer(p):(e.short||e.name);}
  const parts=(e.memberIds||[]).map(id=>state.players.find(x=>x.id===id)).filter(Boolean).map(scoreNameForPlayer);
  return (parts.join('+')||e.short||e.name).slice(0,8);
}
function scoreNameClass(name){const n=String(name).length;return n<=5?'name-lg':n<=7?'name-md':'name-sm';}

renderEntityCard=function(e,mode){
  const selected=e.id===state.calculator.selectedEntityId,name=scoreNameForEntity(e);
  return `<div class="player-card ${selected?'selected':''} ${e.exploded?'exploded':''}"><button class="player-main" data-entity="${e.id}" ${e.exploded?'disabled':''}><span class="score-name ${scoreNameClass(name)}">${esc(name)}</span><strong>${e.score}</strong><small>${e.exploded?'ВЗОРВАН':`🏆 ${entityWins(e,mode)}`}</small></button><button class="edit-btn" data-edit="${e.id}" aria-label="Исправить">✎</button></div>`;
};

renderCalculator=function(g){
  const c=state.calculator,display=`${c.sign<0?'−':'+'}${c.value||'0'}`;
  return `<div class="calculator">${g.mode==='phone'?`<div class="phone-kind"><button data-kind="play" class="${c.phoneKind==='play'?'active':''}">В игре</button><button data-kind="hand" class="${c.phoneKind==='hand'?'active':''}">Рука</button></div>`:''}<div class="calc-display"><button data-sign="1" class="${c.sign===1?'active':''}">+</button><output>${display}</output><button data-sign="-1" class="${c.sign===-1?'active':''}">−</button></div><div class="key-grid">${[1,2,3,4,5,6,7,8,9].map(n=>`<button data-digit="${n}">${n}</button>`).join('')}<button id="clear-value">C</button><button data-digit="0">0</button><button id="backspace">⌫</button></div><div class="target-row">${g.entities.map(e=>{const name=scoreNameForEntity(e);return `<button data-apply="${e.id}" class="${e.id===c.selectedEntityId?'active':''} ${scoreNameClass(name)}" ${e.exploded?'disabled':''}>${esc(name)}</button>`;}).join('')}</div><p class="calc-hint">Выбери знак, набери число и нажми имя игрока</p></div>`;
};

renderMenu=function(){return `<div class="app-shell menu-screen"><header class="menu-header"><button id="back-score">← Счётки</button><h1>Меню</h1></header><section class="menu-card"><div class="menu-title"><h2>Игроки</h2><button id="add-player">+ Игрок</button></div><div class="player-list">${state.players.map(p=>`<div class="menu-player"><input type="checkbox" data-active="${p.id}" ${p.active?'checked':''}><div><input data-name="${p.id}" value="${esc(p.fullName)}" aria-label="Имя и фамилия"><input class="nick-input" data-nick="${p.id}" maxlength="8" value="${esc(p.nick||'')}" placeholder="Ник, если нужен"><small>На счётках: ${esc(scoreNameForPlayer(p))} · максимум 8 символов</small></div><select data-team="${p.id}">${[1,2,3,4,5].map(n=>`<option value="${n}" ${p.team===n?'selected':''}>Команда ${n}</option>`).join('')}</select><button data-delete="${p.id}" ${state.players.length<=2?'disabled':''}>×</button></div>`).join('')}</div><p class="note">Полное имя хранится для статистики. Если первое имя короче 9 символов, оно само показывается на счётках. Ник заполняй только для длинного имени или если хочешь другое обозначение.</p></section><section class="menu-card help-card"><h2>Инструкции</h2><details open><summary>Как пользоваться счётками</summary><div class="help-text"><p>Сверху выбери режим костяшкой: 1 — 101, 5 — Телефон, 6 — Qoşa açdı.</p><p>В калькуляторе выбери + или −, набери число и нажми имя игрока. Последний знак и выбранный игрок сохраняются.</p><p>В Телефоне переключай «В игре / Рука». В режиме «Рука» остаток округляется вверх до ближайших 5.</p><p>✎ у игрока исправляет текущий счёт и число побед сегодня. Исправление попадает в журнал.</p><p>Вкладка «Лог» хранит точное время каждой записи. ↶ делает реверс отдельной записью, не удаляя историю.</p><p>Когда приложение определит исход партии, оно только предложит результат. Победа и баллы сохраняются после подтверждения.</p><p>Каждая завершённая партия получает ID и остаётся в архиве.</p></div></details><details><summary>Правила игр</summary><div class="help-text"><h3>101</h3><p>При 2–3 игроках победитель раздачи записывает сумму камней, оставшихся у противников. При 4 игроках сумма рук проигравших записывается победившей команде. Первый достигший 101 или больше выигрывает партию.</p><h3>Телефон</h3><p>Игра до 365. Во время игры можно записывать 5, 10, 15, 20, 25, 30 или 35. Остаток руки в конце раздачи округляется вверх до ближайших 5.</p><p>Запись +35 до того, как кто-либо достиг 300, даёт мгновенную победу. После 300 игроку больше не записывается остаток руки, но очки «в игре» продолжают считаться.</p><h3>Qoşa açdı</h3><p>3 игрока — по 9 камней; 4 — по 7; 5 — по 5 и 3 в базаре. Штрафы добавляют очки, завершение гошой снимает 10; ниже нуля счёт не опускается.</p><p>101 или больше означает взрыв. Взорвавшийся прекращает участие, а игра продолжается. Если остаются двое, меньший счёт получает 2 дневных балла, второй — 1. Если остаётся один — он получает 3.</p></div></details></section><section class="menu-card"><div class="menu-title"><h2>Архив партий</h2><span>${state.archive.length}</span></div><div class="archive-list">${state.archive.slice(0,1000).map(a=>`<details><summary><b>${esc(MODES[a.mode]?.title||a.mode)}</b><span>${new Date(a.endedAt).toLocaleString()}</span></summary><p>ID: ${esc(a.id)}</p><p>${(a.entities||[]).map(e=>`${esc(e.short||e.name)} ${e.score}`).join(' · ')}</p><p>${a.historyCount||a.history?.length||0} записей</p></details>`).join('')||'<div class="empty">Завершённых партий пока нет</div>'}</div></section><section class="menu-card danger-zone"><h2>Данные</h2><button id="reset-current">Сбросить текущие игры</button><button id="reset-all">Полный сброс</button></section>${renderModal()}</div>`;};

const baseBindExtra=bind;
bind=function(){
  baseBindExtra();
  document.querySelectorAll('[data-nick]').forEach(el=>el.onchange=()=>{const p=state.players.find(x=>x.id===el.dataset.nick);if(!p)return;p.nick=el.value.trim().slice(0,8);render();});
};
