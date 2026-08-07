'use strict';

const renderCalculatorV17Base = renderCalculator;

function targetButtonsV17(g, attr='data-apply'){
  return `<div class="target-row">${g.entities.map(e=>{const name=scoreNameForEntity(e);return `<button ${attr}="${e.id}" class="${e.id===state.calculator.selectedEntityId?'active':''} ${scoreNameClass(name)}" ${e.exploded?'disabled':''}>${esc(name)}</button>`;}).join('')}</div>`;
}

function phoneFastCalculatorV17(g){
  const c=state.calculator;
  const chosen=Number(c.value||0);
  return `<div class="calculator fast-calculator-v17">
    <div class="phone-kind"><button data-kind="play" class="active">В игре</button><button data-kind="hand">Рука</button></div>
    <div class="fast-title-v17">Очки в игре</div>
    <div class="phone-fast-grid-v17">${[5,10,15,20,25,30,35].map(n=>`<button data-phone-fast="${n}" class="${chosen===n?'active':''}">+${n}</button>`).join('')}</div>
    ${targetButtonsV17(g)}
    <p class="calc-hint">Нажми сумму, затем имя игрока</p>
  </div>`;
}

function qoshaActionCalculatorV17(g){
  const c=state.calculator, action=c.qoshaActionV17;
  if(action==='penalty'){
    return `<div class="calculator fast-calculator-v17"><div class="fast-title-v17">Штраф +10 · выбери игрока</div>${targetButtonsV17(g,'data-qosha-target')}<button class="fast-cancel-v17" data-qosha-cancel>Отмена</button></div>`;
  }
  if(action==='minus-amount'){
    return `<div class="calculator fast-calculator-v17"><div class="fast-title-v17">Сколько снять?</div><div class="qosha-minus-grid-v17">${[10,20,30,40].map(n=>`<button data-qosha-minus="${n}">−${n}</button>`).join('')}</div><button class="fast-cancel-v17" data-qosha-cancel>Отмена</button></div>`;
  }
  if(action==='minus-target'){
    return `<div class="calculator fast-calculator-v17"><div class="fast-title-v17">−${Number(c.qoshaMinusV17||0)} · выбери игрока</div>${targetButtonsV17(g,'data-qosha-target')}<button class="fast-cancel-v17" data-qosha-cancel>Отмена</button></div>`;
  }
  let html=renderCalculatorV17Base(g);
  html=html.replace('<div class="calc-display">','<div class="qosha-fast-row-v17"><button data-qosha-action="penalty">Штраф +10</button><button data-qosha-action="minus">Минус</button></div><div class="calc-display">');
  return html;
}

renderCalculator=function(g){
  if(g.mode==='phone' && state.calculator.phoneKind==='play') return phoneFastCalculatorV17(g);
  if(g.mode==='qosha') return qoshaActionCalculatorV17(g);
  return renderCalculatorV17Base(g);
};

// Fast actions are isolated from the older bind chain.
document.addEventListener('click',event=>{
  const phone=event.target?.closest?.('[data-phone-fast]');
  if(phone){
    event.preventDefault();event.stopImmediatePropagation();
    state.calculator.sign=1;
    state.calculator.value=String(phone.dataset.phoneFast);
    render();return;
  }

  const qAction=event.target?.closest?.('[data-qosha-action]');
  if(qAction){
    event.preventDefault();event.stopImmediatePropagation();
    state.calculator.qoshaActionV17=qAction.dataset.qoshaAction==='penalty'?'penalty':'minus-amount';
    state.calculator.qoshaMinusV17=null;
    render();return;
  }

  const qMinus=event.target?.closest?.('[data-qosha-minus]');
  if(qMinus){
    event.preventDefault();event.stopImmediatePropagation();
    state.calculator.qoshaMinusV17=Number(qMinus.dataset.qoshaMinus);
    state.calculator.qoshaActionV17='minus-target';
    render();return;
  }

  const qCancel=event.target?.closest?.('[data-qosha-cancel]');
  if(qCancel){
    event.preventDefault();event.stopImmediatePropagation();
    state.calculator.qoshaActionV17=null;
    state.calculator.qoshaMinusV17=null;
    render();return;
  }

  const qTarget=event.target?.closest?.('[data-qosha-target]');
  if(qTarget){
    event.preventDefault();event.stopImmediatePropagation();
    const id=qTarget.dataset.qoshaTarget;
    const penalty=state.calculator.qoshaActionV17==='penalty';
    const amount=penalty?10:Number(state.calculator.qoshaMinusV17||0);
    if(!amount)return;
    state.calculator.sign=penalty?1:-1;
    state.calculator.value=String(amount);
    state.calculator.selectedEntityId=id;
    state.calculator.qoshaActionV17=null;
    state.calculator.qoshaMinusV17=null;
    applyCalculator(id);
    return;
  }
},true);

const renderMenuV17Base=renderMenu;
renderMenu=function(){
  let html=renderMenuV17Base();
  html=html.replace('В Телефоне переключай «В игре / Рука». В режиме «Рука» остаток округляется вверх до ближайших 5.','В Телефоне переключай «В игре / Рука». «В игре» показывает быстрые кнопки +5…+35; выбери сумму и игрока. «Рука» открывает обычный калькулятор, а остаток округляется вверх до ближайших 5.');
  html=html.replace('✎ у игрока исправляет текущий счёт и число побед сегодня. Исправление попадает в журнал.','В Qoşa açdı обычный калькулятор остаётся основным. «Штраф +10» сразу просит выбрать игрока; «Минус» предлагает −10/−20/−30/−40 и затем игрока. После записи или отмены возвращается калькулятор. ✎ у игрока исправляет текущий счёт и число побед/баллов сегодня. Исправление попадает в журнал.');
  return html;
};

setTimeout(()=>{try{render();}catch(e){console.error('render v17',e);}},0);
