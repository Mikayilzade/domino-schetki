'use strict';
// Isolated block-remainder contract fixtures. This checks the coded model only;
// it does not authenticate how a real table awards points or resolves block ties.
const e=require('./engine');
const d=require('./turn-dispatcher');
const t=require('./turn-kernel');

function test(){
  let assertions=0;
  const check=(condition,message)=>{assertions++;if(!condition)throw new Error(message);};
  const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const cases=[
    {
      name:'3p-unique-minimum',
      players:3,
      hands:[[[0,2],[4,4]],[[1,1]],[[3,6]]],
      passes:3,
      expected:[10,2,9],
      minSeats:[1]
    },
    {
      name:'3p-tied-minimum',
      players:3,
      hands:[[[0,0]],[[0,0]],[[3,3]]],
      passes:3,
      expected:[0,0,6],
      minSeats:[0,1]
    },
    {
      name:'5p-zero-pip-hand-is-still-block',
      players:5,
      hands:[[[0,1],[2,2]],[[3,4]],[[1,5]],[[0,0]],[[2,6]]],
      passes:5,
      expected:[5,7,6,0,8],
      minSeats:[3]
    }
  ];
  for(const f of cases){
    check(same(f.hands.map(e.pipSum),f.expected),f.name+': fixture pip sums');
    const out=d.roundOutcome({
      hands:f.hands,
      stock:[],
      consecutivePasses:f.passes,
      lastPlayerIndex:f.players-1,
      lastTurnResult:{passed:true},
      players:f.players
    });
    check(out&&out.kind==='block',f.name+': expected block');
    check(out.playerIndex===null,f.name+': do not infer block winner');
    check(out.minus===0,f.name+': block must not be a minus finish');
    check(same(out.remainders,f.expected),f.name+': remainder order/sums');
    check(same(f.minSeats,f.expected.map((v,i)=>v===Math.min(...f.expected)?i:-1).filter(i=>i>=0)),f.name+': min-seat fixture');
  }
  const hands=[[[0,0]],[[2,2]],[[4,4]]];
  check(d.roundOutcome({hands,stock:[],consecutivePasses:2,lastPlayerIndex:0,lastTurnResult:{passed:true},players:3})===null,
    '3p must not block before three consecutive passes');
  check(d.roundOutcome({hands,stock:[[6,6]],consecutivePasses:3,lastPlayerIndex:0,lastTurnResult:{passed:true},players:3})===null,
    'nonempty stock must prevent block');
  check(t.isBlocked({stock:[],consecutivePasses:5,players:5}), '5p threshold fixture');
  check(!t.isBlocked({stock:[],consecutivePasses:4,players:5}), '5p below-threshold fixture');
  return {
    passed:true,
    assertions,
    fixtures:cases.map(x=>x.name),
    checks:{
      blockRemaindersArePerSeat:true,
      uniqueAndTiedMinimumDoNotAssignWinner:true,
      zeroPipHandDoesNotConvertBlockToFinish:true,
      stockAndPassThresholdGates:true
    },
    limitation:'Coded-model contract only; actual blocked-round point allocation and winner/tie rule remain unauthenticated.'
  };
}
module.exports={test};
