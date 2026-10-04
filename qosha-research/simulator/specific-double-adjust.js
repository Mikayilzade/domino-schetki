'use strict';

/*
Post-processes output from specific-double-control.js.
Compares ownership vs non-ownership only inside the same
(total starting doubles, starter-status) stratum.
*/
const DOUBLE_KEYS=[0,1,2,3,4,5,6].map(n=>n+'-'+n);

function summarizeAdjusted(summary,minCell=25){
  const result={};
  for(const [strategy,data] of Object.entries(summary.byStrategy||{})){
    result[strategy]={};
    for(const dk of DOUBLE_KEYS){
      const cells=(data.specific||{})[dk]||{};
      const strata=new Set(Object.keys(cells).map(k=>k.replace(/\|owns:[01]$/,'')));
      const pairs=[];
      for(const sk of strata){
        const no=cells[sk+'|owns:0'];
        const yes=cells[sk+'|owns:1'];
        if(!no||!yes||no.n<minCell||yes.n<minCell)continue;
        const weight=Math.min(no.n,yes.n);
        pairs.push({
          stratum:sk,weight,nOwned:yes.n,nNotOwned:no.n,
          finishRateDiff:yes.finishRate-no.finishRate,
          meanPipsDiff:yes.meanPips-no.meanPips
        });
      }
      const W=pairs.reduce((a,x)=>a+x.weight,0);
      result[strategy][dk]={
        identifiable:W>0,
        note:W>0?null:(dk==='1-1'
          ?'1-1 ownership is identical to starter status in raw deals; its independent effect is not identifiable while starter is controlled.'
          :'No adequately populated matched strata.'),
        matchedWeight:W,
        strata:pairs.length,
        adjustedFinishRateDiff:W?pairs.reduce((a,x)=>a+x.weight*x.finishRateDiff,0)/W:null,
        adjustedMeanPipsDiff:W?pairs.reduce((a,x)=>a+x.weight*x.meanPipsDiff,0)/W:null
      };
    }
  }
  return result;
}

if(require.main===module){
  let src='';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data',x=>src+=x);
  process.stdin.on('end',()=>{
    const summary=JSON.parse(src);
    console.log(JSON.stringify(summarizeAdjusted(summary),null,2));
  });
}
module.exports={summarizeAdjusted};
