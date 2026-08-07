'use strict';

const BACKUP_FORMAT_V20='domino-schetki-backup';
const BACKUP_VERSION_V20=1;
const PREIMPORT_KEY_V20='domino-schetki-preimport-v1';

function backupSummaryV20(rawState){
  const s=rawState||{};
  const archive=Array.isArray(s.archive)?s.archive:[];
  const players=Array.isArray(s.players)?s.players:[];
  const currentGames=Object.values(s.games||{}).filter(Boolean);
  const archiveLogs=archive.reduce((n,a)=>n+(Array.isArray(a.history)?a.history.length:Number(a.historyCount||0)),0);
  const currentLogs=currentGames.reduce((n,g)=>n+(Array.isArray(g.history)?g.history.length:0),0);
  const dates=archive.map(a=>a.endedAt).filter(Boolean).map(x=>new Date(x)).filter(d=>!Number.isNaN(d.getTime())).sort((a,b)=>a-b);
  return {players:players.length,archive:archive.length,currentGames:currentGames.length,logEntries:archiveLogs+currentLogs,from:dates.length?dates[0].toISOString():null,to:dates.length?dates[dates.length-1].toISOString():null};
}
function dateOnlyV20(iso){return iso?new Date(iso).toLocaleDateString():'—';}
function makeBackupPayloadV20(){
  if(typeof writeNickMapV12==='function')writeNickMapV12();
  const nickMap=typeof readNickMapV12==='function'?readNickMapV12():{};
  const snapshot=JSON.parse(JSON.stringify(state));
  return {format:BACKUP_FORMAT_V20,version:BACKUP_VERSION_V20,exportedAt:new Date().toISOString(),summary:backupSummaryV20(snapshot),state:snapshot,nicks:nickMap};
}
function safeFileStampV20(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}-${String(d.getMinutes()).padStart(2,'0')}`;}
function downloadBackupV20(){
  try{
    const payload=makeBackupPayloadV20(),blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=`domino-schetki-backup_${safeFileStampV20()}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }catch(err){console.error('backup export',err);alert('Не удалось создать резервную копию. Данные не изменены.');}
}
function validateBackupV20(data){
  if(!data||data.format!==BACKUP_FORMAT_V20)throw new Error('Неверный формат файла');
  if(!data.state||!Array.isArray(data.state.players)||!Array.isArray(data.state.archive))throw new Error('В копии нет обязательных данных');
  return data;
}
function importSummaryTextV20(data){
  const s=backupSummaryV20(data.state),period=s.archive?`${dateOnlyV20(s.from)} — ${dateOnlyV20(s.to)}`:'архив пуст';
  return `Найдена резервная копия:\n\nИгроков: ${s.players}\nЗавершённых партий: ${s.archive}\nЗаписей лога: ${s.logEntries}\nПериод: ${period}\nСоздана: ${new Date(data.exportedAt||Date.now()).toLocaleString()}\n\nТекущие данные на этом телефоне будут заменены. Продолжить?`;
}
function saveEmergencySnapshotV20(){try{localStorage.setItem(PREIMPORT_KEY_V20,JSON.stringify(makeBackupPayloadV20()));}catch(err){console.warn('preimport snapshot',err);}}
function restoreBackupV20(data){
  validateBackupV20(data);if(!confirm(importSummaryTextV20(data)))return;saveEmergencySnapshotV20();
  try{
    const imported=JSON.parse(JSON.stringify(data.state));state=typeof migrate==='function'?migrate(imported):imported;state.screen='menu';state.modal=null;
    const nicks=data.nicks&&typeof data.nicks==='object'?data.nicks:{};
    (state.players||[]).forEach(p=>{const n=String(nicks[p.id]||p.nick||'').trim().slice(0,8);if(n)p.nick=n;});
    localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
    if(typeof NICK_STORAGE_KEY_V12!=='undefined')localStorage.setItem(NICK_STORAGE_KEY_V12,JSON.stringify(nicks));
    if(typeof writeNickMapV12==='function')writeNickMapV12();save();alert(`Готово. Восстановлено партий: ${(state.archive||[]).length}.`);render();
  }catch(err){console.error('backup import',err);alert('Не удалось восстановить копию. Текущая база сохранена в аварийном локальном слоте.');}
}
function readBackupFileV20(file){
  if(!file)return;const reader=new FileReader();
  reader.onload=()=>{try{restoreBackupV20(validateBackupV20(JSON.parse(String(reader.result||''))));}catch(err){console.error('backup parse',err);alert('Этот файл не похож на резервную копию Счёток или повреждён.');}};
  reader.onerror=()=>alert('Не удалось прочитать файл.');reader.readAsText(file);
}

const renderMenuV20Base=renderMenu;
renderMenu=function(){
  let html=renderMenuV20Base();
  const marker='<p class="note">Сброс дня удаляет только данные сегодняшнего дня. Полный сброс удаляет вообще всё.</p>';
  const backup=`<div class="backup-v20"><h3>Резервная копия</h3><p class="note">Сохрани JSON-файл в Файлы, iCloud или Google Drive. В нём игроки, партии, логи, статистика, достижения, рейтинги и текущие игры.</p><div class="backup-actions-v20"><button type="button" id="backup-download">Скачать резервную копию</button><button type="button" id="backup-restore">Восстановить из копии</button></div><input id="backup-file" type="file" accept="application/json,.json" hidden><p class="note">Перед восстановлением текущая база автоматически сохраняется локально как аварийная копия.</p></div>`;
  if(html.includes(marker))html=html.replace(marker,backup+marker);return html;
};

document.addEventListener('click',event=>{
  const download=event.target?.closest?.('#backup-download');if(download){event.preventDefault();event.stopImmediatePropagation();downloadBackupV20();return;}
  const restore=event.target?.closest?.('#backup-restore');if(restore){event.preventDefault();event.stopImmediatePropagation();document.getElementById('backup-file')?.click();}
},true);
document.addEventListener('change',event=>{const input=event.target;if(!input?.matches?.('#backup-file'))return;const file=input.files?.[0];input.value='';readBackupFileV20(file);},true);

setTimeout(()=>{try{render();}catch(e){console.error('render v20',e);}},0);
