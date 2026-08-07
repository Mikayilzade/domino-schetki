'use strict';

function minusBucketV15(amount){
  const n=Math.abs(Number(amount||0));
  return [10,20,30,40].includes(n)?String(n):null;
}
function ensureMinusDailyV15(stats,dateKey){
  stats.minus=stats.minus||{events:0,sum:0,byAmount:{10:0,20:0,30:0,40:0},daily:{}};
  stats.minus.byAmount=stats.minus.byAmount||{10:0,20:0,30:0,40:0};
  stats.minus.daily=stats.minus.daily||{};
  stats.minus.daily[dateKey]=stats.minus.daily[dateKey]||{events:0,sum:0,byAmount:{10:0,20:0,30:0,40:0}};
  stats.minus.daily[dateKey].byAmount=stats.minus.daily[dateKey].byAmount||{10:0,20:0,30:0,40:0};
  return stats.minus.daily[dateKey];
}
function adjustMinusStatsV15(entity,amount,direction=1,dateKey=dayKey()){
  const n=Math.abs(Number(amount||0));if(!n||!entity)return;
  (entity.memberIds||[]).forEach(pid=>{
    const p=state.players.find(x=>x.id===pid);if(!p)return;
    p.stats=normalizeStats(p.stats);
    const s=p.stats,d=ensureMinusDailyV15(s,dateKey),bucket=minusBucketV15(n);
    s.minus.events=Math.max(0,Number(s.minus.events||0)+direction);
    s.minus.sum=Math.max(0,Number(s.minus.sum||0)+direction*n);
    d.events=Math.max(0,Number(d.events||0)+direction);
    d.sum=Math.max(0,Number(d.sum||0)+direction*n);
    if(bucket){
      s.minus.byAmount[bucket]=Math.max(0,Number(s.minus.byAmount[bucket]||0)+direction);
      d.byAmount[bucket]=Math.max(0,Number(d.byAmount[bucket]||0)+direction);
    }
  });
}

// Capture score actions without replacing the proven calculator implementation.
document.addEventListener('click',event=>{
  const apply=event.target?.closest?.('[data-apply]');
  if(apply){
    const g=ensureGame(),e=g.entities.find(x=>x.id===apply.dataset.apply);
    const raw=Number(state.calculator.value||0),sign=Number(state.calculator.sign||1);
    if(!e||!raw)return;

    // Huge entries are allowed, but require a deliberate second confirmation.
    if(raw>=500){
      const ok=confirm(`Записать ${sign<0?'−':'+'}${raw} для ${scoreNameForEntity(e)}?\n\nЧисло необычно большое — проверь, что это не ошибка ввода.`);
      if(!ok){event.preventDefault();event.stopImmediatePropagation();return;}
    }

    if(sign<0){
      const before=e.score,entityId=e.id,gameId=g.id,historyBefore=g.history.length,date=dayKey();
      setTimeout(()=>{
        const game=state.games?.[g.mode];if(!game||game.id!==gameId)return;
        const entity=game.entities.find(x=>x.id===entityId);if(!entity)return;
        const entry=game.history.slice(historyBefore).find(h=>h.type==='score'&&h.entityId===entityId&&Number(h.amount||0)<0);
        if(!entry||entry.minusTrackedV15)return;
        const actual=Math.max(0,before-entity.score);
        if(!actual)return;
        adjustMinusStatsV15(entity,Math.abs(Number(entry.amount||actual)),1,date);
        entry.minusTrackedV15=true;entry.minusTrackedDateV15=date;
        save();
      },0);
    }
  }

  const reverse=event.target?.closest?.('[data-reverse]');
  if(reverse){
    const g=ensureGame(),entry=g.history.find(h=>h.id===reverse.dataset.reverse);
    if(!entry?.minusTrackedV15||Number(entry.amount||0)>=0)return;
    const entity=g.entities.find(x=>x.id===entry.entityId),amount=Math.abs(Number(entry.amount||0)),date=entry.minusTrackedDateV15||dayKey(new Date(entry.at));
    setTimeout(()=>{
      const current=state.games?.[g.mode];const original=current?.history?.find(h=>h.id===entry.id);
      if(!original?.reversedBy||original.minusUntrackedV15)return;
      adjustMinusStatsV15(entity,amount,-1,date);
      original.minusUntrackedV15=true;
      save();
    },0);
  }
},true);

function archiveNumberMapV15(){
  const chronological=[...(state.archive||[])].sort((a,b)=>new Date(a.endedAt||0)-new Date(b.endedAt||0));
  const map=new Map();chronological.forEach((a,i)=>map.set(a.id,i+1));return map;
}
archiveSectionV8=function(){
  const numbers=archiveNumberMapV15();
  const newest=[...(state.archive||[])].sort((a,b)=>new Date(b.endedAt||0)-new Date(a.endedAt||0));
  return `<section class="menu-card"><div class="menu-title"><h2>Архив партий</h2><span>${state.archive.length}</span></div><div class="archive-list">${newest.map(a=>{const hist=a.history||[],number=numbers.get(a.id)||'?';return `<details class="archive-game"><summary><b>Партия ${number} · ${esc(MODES[a.mode]?.title||a.mode)}</b><span>${new Date(a.endedAt).toLocaleString()}</span></summary><p>${(a.entities||[]).map(e=>`${esc(typeof archiveEntityNameV14==='function'?archiveEntityNameV14(e):(e.displayName||e.short||e.name||'Игрок'))} ${e.score}`).join(' · ')}</p><p>${hist.length||a.historyCount||0} записей</p><div class="archive-log">${hist.length?hist.map(h=>`<div class="archive-log-row"><time>${timeText(h.at)}</time><span>${esc(h.text||'')}</span></div>`).join(''):'<div class="empty">Подробный лог этой старой партии не сохранён</div>'}</div><div class="archive-id">ID: ${esc(a.id)}</div></details>`;}).join('')||'<div class="empty">Завершённых партий пока нет</div>'}</div></section>`;
};

// Clarify achievement text now that all calculator minus actions are tracked.
const achievementsV15Base=achievementsV10;
achievementsV10=function(p){
  return achievementsV15Base(p).map(a=>a[0]==='10 минусов'?[a[0],a[1],'Сделать 10 минусовых записей. Ошибочно реверснутые записи не считаются.']:a);
};
achievementsV8=achievementsV10;

setTimeout(()=>{try{render();}catch(e){console.error('render v15',e);}},0);
