'use strict';

// Qoşa açdı minus actions (including the quick Minus panel) go through applyCalculator.
// Track the assigned minus here so the statistics reflect −10/−20/−30/−40 even
// when the visible score is clamped at zero.
const applyCalculatorV19Base=applyCalculator;
applyCalculator=function(entityId){
  const g=ensureGame();
  const e=g.entities.find(x=>x.id===entityId);
  const sign=Number(state.calculator.sign||1);
  const amount=Math.abs(Number(state.calculator.value||0));
  const historyBefore=(g.history||[]).length;
  const date=dayKey();
  const result=applyCalculatorV19Base(entityId);

  if(g.mode==='qosha'&&e&&sign<0&&[10,20,30,40].includes(amount)){
    const current=state.games?.[g.mode];
    const entity=current?.entities?.find(x=>x.id===entityId);
    const entry=current?.history?.slice(historyBefore).find(h=>h.type==='score'&&h.entityId===entityId&&Number(h.amount||0)<0);
    if(current&&entity&&entry&&!entry.minusTrackedV15){
      adjustMinusStatsV15(entity,amount,1,date);
      entry.minusTrackedV15=true;
      entry.minusTrackedDateV15=date;
      save();
    }
  }
  return result;
};

setTimeout(()=>{try{render();}catch(e){console.error('render v19',e);}},0);
