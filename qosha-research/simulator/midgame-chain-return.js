'use strict';
// Synthetic two-opponent 3x9 midgame, both branch models provisional.
// node qosha-research/simulator/midgame-chain-return.js test
// node qosha-research/simulator/midgame-chain-return.js 2749200 12000 12000
const history=[[[1,2],0],[[2,2],0],[[1,3],1],[[1,4],2],[[4,4],2],[[3,4],2],[[1,5],3],[[5,5],3],[[3,5],3],[[3,3],1]];
const key=t=>t[0]+"-"+t[1],pip=t=>t[0]+t[1],has=(t,n)=>t[0]===n||t[1]===n;
const deck=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)deck.push([a,b]);
const played=[[1,1],...history.map(x=>x[0])],used=new Set(played.map(key)),candidate=[2,3];
const pool=deck.filter(t=>!used.has(key(t))&&key(t)!=='2-3');
function assert(x,m){if(!x)throw Error(m);}

function init(model){
 assert(model==="global-ever-open"||model==="all-current-only","unknown branch model");
 const b={model,ends:[1,1,1,1],locks:[false,false,false,false],global:new Set([1]),bySide:Array.from({length:4},()=>new Set([1]))};
 for(const [t,s] of history){
  if(t[0]===t[1]){assert(b.ends[s]===t[0],"history double mismatch");openDouble(b,t[0]);}
  else{assert(!b.locks[s]&&has(t,b.ends[s]),"illegal history ordinary");place(b,{t,s,dbl:false,to:t[0]===b.ends[s]?t[1]:t[0]});}
 }
 assert(b.ends.join()==="2,3,3,3","history ends");
 return b;
}

function clone(b){return{model:b.model,ends:b.ends.slice(),locks:b.locks.slice(),global:new Set(b.global),bySide:b.bySide.map(s=>new Set(s))};}

function openDouble(b,n){b.global.add(n);for(let s=0;s<4;s++)if(b.ends[s]===n){b.locks[s]=false;b.bySide[s].add(n);}}

function place(b,a){
 const n=b.ends[a.s];assert(a.t[0]===a.t[1]?a.dbl&&a.t[0]===n:!a.dbl&&!b.locks[a.s]&&has(a.t,n),"illegal placement");
 if(a.dbl)openDouble(b,n);
 else{assert(a.to===(a.t[0]===n?a.t[1]:a.t[0]),"bad other end");b.ends[a.s]=a.to;b.locks[a.s]=b.model==="global-ever-open"?!b.global.has(a.to):!b.bySide[a.s].has(a.to);}
}

function legal(b,hand){
 const out=[];for(let i=0;i<hand.length;i++)for(let s=0;s<4;s++){
  const t=hand[i],n=b.ends[s],dbl=t[0]===t[1];
  if(dbl){if(t[0]===n)out.push({i,s,t,to:n,dbl:true});}
  else if(!b.locks[s]&&has(t,n))out.push({i,s,t,to:t[0]===n?t[1]:t[0],dbl:false});
 }return out;
}

function action(b,kind){const c=clone(b);if(kind==="collapse")place(c,{t:candidate,s:0,to:3,dbl:false});else if(kind==="spread")place(c,{t:candidate,s:1,to:2,dbl:false});else throw Error("bad action");return c;}

function mix(z){z=(z>>>0)+0x9e3779b9;z=Math.imul(z^(z>>>16),0x21f0aaad);z=Math.imul(z^(z>>>15),0x735a2d97);return(z^(z>>>15))>>>0;}

function shuffle(src,seed){const x=src.slice();let z=mix(seed)||0x9e3779b9;for(let i=x.length-1;i>0;i--){z^=z<<13;z^=z>>>17;z^=z<<5;const j=Math.floor((z>>>0)/4294967296*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;}

function world(seed){const a=shuffle(pool,seed),focal=a.slice(0,4),other=shuffle(a.slice(4),mix(seed^0x1e0a75c3));assert(new Set([...played,candidate,...focal,...other].map(key)).size===28,"28 unique stones");return{focal,h1:other.slice(0,6),h2:other.slice(6)};}

function select(b,hand,policy,focal,doublesOnly=false){
 const a=legal(b,hand).filter(x=>!doublesOnly||x.dbl);
 if(!a.length)return null;
 const scored=a.map(x=>{let denial=0;if(policy==="oracle-deny"){const c=clone(b);place(c,x);denial=new Set(legal(c,focal).map(y=>y.i)).size;}return{x,denial};});
 scored.sort((a,b)=>{
  if(policy==="oracle-deny"&&a.denial!==b.denial)return a.denial-b.denial;
  if(policy==="double-first"&&a.x.dbl!==b.x.dbl)return a.x.dbl?-1:1;
  const p=policy==="low"?pip(a.x.t)-pip(b.x.t):pip(b.x.t)-pip(a.x.t);
  return p||key(a.x.t).localeCompare(key(b.x.t))||a.x.s-b.x.s;
 });
 return scored[0].x;
}

function opponentTurn(b,hand,policy,focal,allowChain){
 const h=hand.slice();let a=select(b,h,policy,focal,false);
 if(!a)return{stones:0,doubles:0,extra:0,pass:1,played3:0};
 let stones=0,doubles=0,played3=0,firstDouble=a.dbl;
 while(a){
  place(b,a);h.splice(a.i,1);stones++;doubles+=+a.dbl;played3+=+has(a.t,3);
  if(!allowChain||!firstDouble||stones>=4)break;
  a=select(b,h,policy,focal,true);
 }
 return{stones,doubles,extra:Math.max(0,stones-1),pass:0,played3};
}

function simulate(model,kind,w,policy,chain){
 const b=action(init(model),kind);
 const t1=opponentTurn(b,w.h1,policy,w.focal,chain);
 const t2=opponentTurn(b,w.h2,policy,w.focal,chain);
 const own=new Set(legal(b,w.focal).map(x=>x.i));
 return{stones:t1.stones+t2.stones,doubles:t1.doubles+t2.doubles,extra:t1.extra+t2.extra,pass1:t1.pass,pass2:t2.pass,played3:t1.played3+t2.played3,ownLegal:own.size,ownPass:+(own.size===0),ends:b.ends.join(","),locks:b.locks.join(",")};
}

function mean(x){return x.reduce((a,b)=>a+b,0)/x.length;}

function summarize(rows){
 if(!rows.length)return{n:0};
 const out={n:rows.length};
 for(const f of ["stones","doubles","extra","pass1","pass2","played3","ownLegal","ownPass"]){
  const a=rows.map(r=>r.a[f]),b=rows.map(r=>r.b[f]),d=a.map((x,i)=>x-b[i]),avg=mean(d),se=Math.sqrt(d.reduce((s,x)=>s+(x-avg)**2,0)/(d.length-1)/d.length);
  out[f]={collapse:mean(a),spread:mean(b),delta:avg,paired95:[avg-1.96*se,avg+1.96*se]};
 }
 out.collapseOnlyOwnPass=rows.filter(r=>r.a.ownPass&&!r.b.ownPass).length;
 out.spreadOnlyOwnPass=rows.filter(r=>r.b.ownPass&&!r.a.ownPass).length;
 return out;
}

function selfTest(){
 assert(pool.length===16&&played.length===11&&new Set(played.map(key)).size===11,"public tile partition");
 for(const model of ["global-ever-open","all-current-only"]){
  const b=init(model),c=action(b,"collapse"),s=action(b,"spread");
  assert(c.ends.join()==="3,3,3,3"&&s.ends.join()==="2,2,3,3","post-action ends");
  assert(c.locks[0]===(model==="all-current-only"),"late-arrival lock");
  const z=clone(c);z.ends[0]=6;z.locks[0]=true;
  assert(legal(z,[[6,6]]).length>0,"double opens locked end");
  place(z,legal(z,[[6,6]])[0]);assert(!z.locks[0],"double unlock");
  const fixture={model,ends:[0,6,2,3],locks:[true,true,false,false],global:new Set([1]),bySide:Array.from({length:4},()=>new Set([1]))};
  const d=opponentTurn(fixture,[[0,0],[6,6],[1,4]],"double-first",[],true);
  assert(d.stones===2&&d.doubles===2&&d.extra===1,"two-double chain");
  const fixture2={model,ends:[0,6,2,3],locks:[false,false,false,false],global:new Set([1]),bySide:Array.from({length:4},()=>new Set([1]))};
  const t=opponentTurn(fixture2,[[0,0],[5,6]],"high",[],true);
  assert(t.stones===1&&t.doubles===0,"no ordinary plus double");
 }
 for(let i=0;i<100;i++){
  const w=world(2749200+i),v=world(2749200+i);assert(JSON.stringify(w)===JSON.stringify(v),"deterministic replay");
  for(const model of ["global-ever-open","all-current-only"])for(const policy of ["high","low","double-first","oracle-deny"]){
   const a=simulate(model,"collapse",w,policy,true),b=simulate(model,"spread",w,policy,true);
   assert(a.stones<=8&&b.stones<=8,"double chain max four per turn");
   assert(a.ownLegal<=4&&b.ownLegal<=4,"focal hand bound");
  }
 }
 return{passed:true,worldReplays:100,models:2,policies:4,doubleChainFixture:true,ordinaryNoAppend:true};
}

function run(start=2749200,n1=12000,n2=12000){
 assert(Number.isInteger(start)&&start>=2749200&&Number.isInteger(n1)&&n1>=1000&&Number.isInteger(n2)&&n2>=1000,"seed parameters");
 const tests=selfTest(),modes={};let example=null;
 const worlds=[];for(let i=0;i<n1+n2;i++)worlds.push(world(start+i));
 const own3N=worlds.filter(w=>w.focal.some(t=>has(t,3))).length;
 for(const model of ["global-ever-open","all-current-only"])for(const policy of ["high","low","double-first","oracle-deny"]){
  const cohorts=[[],[]],strata={own3:[],noOwn3:[],opponent3AtLeast2:[],opponent3Under2:[]};
  for(let i=0;i<worlds.length;i++){
   const w=worlds[i],a=simulate(model,"collapse",w,policy,true),b=simulate(model,"spread",w,policy,true);
   const row={a,b};cohorts[i<n1?0:1].push(row);
   const own3=w.focal.some(t=>has(t,3)),op3=[...w.h1,...w.h2].filter(t=>has(t,3)).length;
   strata[own3?"own3":"noOwn3"].push(row);
   strata[op3>=2?"opponent3AtLeast2":"opponent3Under2"].push(row);
   if(!example&&own3&&a.ownPass&&!b.ownPass)example={seed:start+i,model,policy,focal:w.focal,opponents:[w.h1,w.h2],collapse:a,spread:b};
  }
  const all=cohorts[0].concat(cohorts[1]),k=model+"/"+policy;
  modes[k]={cohort1:summarize(cohorts[0]),cohort2:summarize(cohorts[1]),overall:summarize(all),strata:Object.fromEntries(Object.entries(strata).map(([k,v])=>[k,summarize(v)]))};
  for(const cohort of ["cohort1","cohort2"])for(const [field,exact] of [["collapse",.375],["spread",.0262237762237762]]){
   const p=modes[k][cohort].pass1[field],n=modes[k][cohort].n,z=(p-exact)/Math.sqrt(exact*(1-exact)/n);
   assert(Math.abs(z)<5,"exact first-pass calibration");
  }
 }
 const chainActivity=Object.entries(modes).map(([k,v])=>({mode:k,extraCollapse:v.overall.extra.collapse,extraSpread:v.overall.extra.spread}));
 return{schema:"qosha-midgame-chain-return/v1",timestampAsiaBaku:"2026-10-28 17:45 +04:00",engine:"qosa-research-0.5.3 + midgame-chain-return-1.0",rules:"recovered qosa-1.0.0 3x9; both branch models provisional",seedRange:[start,start+n1+n2-1],cohorts:[[start,start+n1-1],[start+n1,start+n1+n2-1]],deals:0,completeRounds:0,forcedFullGameContinuations:0,newHiddenAllocations:n1+n2,knownFocal3:own3N,policies:["high greedy + optional doubles","low greedy + optional doubles","double-first + optional doubles","omniscient focal-mobility-denial stress test (not human policy)"],tests,chainActivity,example,modes,limitations:["Synthetic public history; branch unlock semantics unresolved","Oracle-deny sees focal private hand and is only an adversarial bound","Uniform unknown hands not conditioned on prior choices","No complete game win rate, minus, block winner/tie, loneZero, bust or 101 scoring"],nextAction:"Use a separate physically plausible multi-double-rich trace for chain stress tests; authenticate late-arrival branch locks and block ties; examine focal 3-connector counterexamples before any win claims."};
}

const CHECKPOINT={
  "schema": "qosha-midgame-chain-return/v1",
  "timestampAsiaBaku": "2026-10-28 17:45 +04:00",
  "engine": "qosa-research-0.5.3 + midgame-chain-return-1.0",
  "rules": "recovered qosa-1.0.0 3x9; both branch models provisional",
  "seedRange": [
    2749200,
    2773199
  ],
  "cohorts": [
    [
      2749200,
      2761199
    ],
    [
      2761200,
      2773199
    ]
  ],
  "deals": 0,
  "completeRounds": 0,
  "forcedFullGameContinuations": 0,
  "newHiddenAllocations": 24000,
  "knownFocal3": 10858,
  "policies": [
    "high greedy + optional doubles",
    "low greedy + optional doubles",
    "double-first + optional doubles",
    "omniscient focal-mobility-denial stress test (not human policy)"
  ],
  "tests": {
    "passed": true,
    "worldReplays": 100,
    "models": 2,
    "policies": 4,
    "doubleChainFixture": true,
    "ordinaryNoAppend": true
  },
  "chainActivity": [
    {
      "mode": "global-ever-open/high",
      "extraCollapse": 0,
      "extraSpread": 0
    },
    {
      "mode": "global-ever-open/low",
      "extraCollapse": 0,
      "extraSpread": 0
    },
    {
      "mode": "global-ever-open/double-first",
      "extraCollapse": 0,
      "extraSpread": 0
    },
    {
      "mode": "global-ever-open/oracle-deny",
      "extraCollapse": 0,
      "extraSpread": 0
    },
    {
      "mode": "all-current-only/high",
      "extraCollapse": 0,
      "extraSpread": 0
    },
    {
      "mode": "all-current-only/low",
      "extraCollapse": 0,
      "extraSpread": 0
    },
    {
      "mode": "all-current-only/double-first",
      "extraCollapse": 0,
      "extraSpread": 0
    },
    {
      "mode": "all-current-only/oracle-deny",
      "extraCollapse": 0,
      "extraSpread": 0
    }
  ],
  "example": null,
  "modes": {
    "global-ever-open/high": {
      "cohort1": {
        "n": 12000,
        "stones": {
          "collapse": 1.38725,
          "spread": 1.9653333333333334,
          "delta": -0.5780833333333333,
          "paired95": [
            -0.5885177334977555,
            -0.5676489331689111
          ]
        },
        "doubles": {
          "collapse": 0.187,
          "spread": 0.24341666666666667,
          "delta": -0.056416666666666664,
          "paired95": [
            -0.06266814836977991,
            -0.05016518496355342
          ]
        },
        "extra": {
          "collapse": 0,
          "spread": 0,
          "delta": 0,
          "paired95": [
            0,
            0
          ]
        },
        "pass1": {
          "collapse": 0.375,
          "spread": 0.02575,
          "delta": 0.34925,
          "paired95": [
            0.34071980733273965,
            0.35778019266726035
          ]
        },
        "pass2": {
          "collapse": 0.23775,
          "spread": 0.008916666666666666,
          "delta": 0.22883333333333333,
          "paired95": [
            0.2212708018915042,
            0.23639586477516247
          ]
        },
        "played3": {
          "collapse": 1.20025,
          "spread": 0.7344166666666667,
          "delta": 0.4658333333333333,
          "paired95": [
            0.45551572788922173,
            0.4761509387774449
          ]
        },
        "ownLegal": {
          "collapse": 1.0825,
          "spread": 2.221,
          "delta": -1.1385,
          "paired95": [
            -1.1564137395371645,
            -1.1205862604628356
          ]
        },
        "ownPass": {
          "collapse": 0.24541666666666667,
          "spread": 0.025333333333333333,
          "delta": 0.22008333333333333,
          "paired95": [
            0.21239808011456388,
            0.22776858655210278
          ]
        },
        "collapseOnlyOwnPass": 2718,
        "spreadOnlyOwnPass": 77
      },
      "cohort2": {
        "n": 12000,
        "stones": {
          "collapse": 1.3856666666666666,
          "spread": 1.9636666666666667,
          "delta": -0.578,
          "paired95": [
            -0.5885389103414891,
            -0.5674610896585108
          ]
        },
        "doubles": {
          "collapse": 0.19391666666666665,
          "spread": 0.2385,
          "delta": -0.044583333333333336,
          "paired95": [
            -0.0507668912096042,
            -0.038399775457062475
          ]
        },
        "extra": {
          "collapse": 0,
          "spread": 0,
          "delta": 0,
          "paired95": [
            0,
            0
          ]
        },
        "pass1": {
          "collapse": 0.37625,
          "spread": 0.027166666666666665,
          "delta": 0.34908333333333336,
          "paired95": [
            0.34055408424525024,
            0.35761258242141647
          ]
        },
        "pass2": {
          "collapse": 0.23808333333333334,
          "spread": 0.009166666666666667,
          "delta": 0.22891666666666666,
          "paired95": [
            0.22133204346886595,
            0.23650128986446736
          ]
        },
        "played3": {
          "collapse": 1.19175,
          "spread": 0.7354166666666667,
          "delta": 0.4563333333333333,
          "paired95": [
            0.4461600894879732,
            0.4665065771786934
          ]
        },
        "ownLegal": {
          "collapse": 1.0836666666666666,
          "spread": 2.23425,
          "delta": -1.1505833333333333,
          "paired95": [
            -1.168424754698077,
            -1.1327419119685895
          ]
        },
        "ownPass": {
          "collapse": 0.24566666666666667,
          "spread": 0.026583333333333334,
          "delta": 0.21908333333333332,
          "paired95": [
            0.21139587597488133,
            0.22677079069178532
          ]
        },
        "collapseOnlyOwnPass": 2710,
        "spreadOnlyOwnPass": 81
      },
      "overall": {
        "n": 24000,
        "stones": {
          "collapse": 1.3864583333333333,
          "spread": 1.9645,
          "delta": -0.5780416666666667,
          "paired95": [
            -0.5854567892940743,
            -0.570626544039259
          ]
        },
        "doubles": {
          "collapse": 0.19045833333333334,
          "spread": 0.24095833333333333,
          "delta": -0.0505,
          "paired95": [
            -0.054897061647112916,
            -0.04610293835288709
          ]
        },
        "extra": {
          "collapse": 0,
          "spread": 0,
          "delta": 0,
          "paired95": [
            0,
            0
          ]
        },
        "pass1": {
          "collapse": 0.375625,
          "spread": 0.026458333333333334,
          "delta": 0.3491666666666667,
          "paired95": [
            0.34313536875225714,
            0.3551979645810762
          ]
        },
        "pass2": {
          "collapse": 0.23791666666666667,
          "spread": 0.009041666666666667,
          "delta": 0.228875,
          "paired95": [
            0.22351977797283787,
            0.23423022202716212
          ]
        },
        "played3": {
          "collapse": 1.196,
          "spread": 0.7349166666666667,
          "delta": 0.46108333333333335,
          "paired95": [
            0.45383844598321677,
            0.4683282206834499
          ]
        },
        "ownLegal": {
          "collapse": 1.0830833333333334,
          "spread": 2.227625,
          "delta": -1.1445416666666666,
          "paired95": [
            -1.1571830186229417,
            -1.1319003147103914
          ]
        },
        "ownPass": {
          "collapse": 0.24554166666666666,
          "spread": 0.025958333333333333,
          "delta": 0.21958333333333332,
          "paired95": [
            0.21414836888532257,
            0.22501829778134408
          ]
        },
        "collapseOnlyOwnPass": 5428,
        "spreadOnlyOwnPass": 158
      },
      "strata": {
        "own3": {
          "n": 10858,
          "stones": {
            "collapse": 1.0736783938110148,
            "spread": 1.9479646343709707,
            "delta": -0.8742862405599557,
            "paired95": [
              -0.8850924634724431,
              -0.8634800176474684
            ]
          },
          "doubles": {
            "collapse": 0.19137962792411126,
            "spread": 0.22637686498434334,
            "delta": -0.034997237060232084,
            "paired95": [
              -0.04329862527694292,
              -0.02669584884352125
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.5558113833118438,
            "spread": 0.03960213667342052,
            "delta": 0.5162092466384233,
            "paired95": [
              0.5068089226092231,
              0.5256095706676235
            ]
          },
          "pass2": {
            "collapse": 0.3705102228771413,
            "spread": 0.012433228955608768,
            "delta": 0.3580769939215325,
            "paired95": [
              0.34894366776653873,
              0.3672103200765263
            ]
          },
          "played3": {
            "collapse": 0.8822987658869037,
            "spread": 0.4464910664947504,
            "delta": 0.43580769939215325,
            "paired95": [
              0.4264802655073322,
              0.4451351332769743
            ]
          },
          "ownLegal": {
            "collapse": 1.5325105912691104,
            "spread": 2.4836065573770494,
            "delta": -0.9510959661079389,
            "paired95": [
              -0.9689474435924417,
              -0.9332444886234361
            ]
          },
          "ownPass": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "collapseOnlyOwnPass": 0,
          "spreadOnlyOwnPass": 0
        },
        "noOwn3": {
          "n": 13142,
          "stones": {
            "collapse": 1.6448790138487293,
            "spread": 1.9781616192360372,
            "delta": -0.33328260538730786,
            "paired95": [
              -0.34134230917000763,
              -0.3252229016046081
            ]
          },
          "doubles": {
            "collapse": 0.18969715416222796,
            "spread": 0.25300563080200883,
            "delta": -0.06330847663978086,
            "paired95": [
              -0.0674720966825072,
              -0.059144856597054506
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.22675391873383047,
            "spread": 0.015598843402830619,
            "delta": 0.21115507533099984,
            "paired95": [
              0.20417695516578996,
              0.21813319549620971
            ]
          },
          "pass2": {
            "collapse": 0.12836706741744028,
            "spread": 0.006239537361132248,
            "delta": 0.12212753005630803,
            "paired95": [
              0.11652912437919472,
              0.12772593573342134
            ]
          },
          "played3": {
            "collapse": 1.4551818596865014,
            "spread": 0.9732156444985542,
            "delta": 0.481966215187947,
            "paired95": [
              0.4712243742548506,
              0.49270805612104346
            ]
          },
          "ownLegal": {
            "collapse": 0.7117638106833054,
            "spread": 2.016131486836098,
            "delta": -1.3043676761527925,
            "paired95": [
              -1.321657358068308,
              -1.287077994237277
            ]
          },
          "ownPass": {
            "collapse": 0.44840967889210165,
            "spread": 0.047405265560797445,
            "delta": 0.4010044133313042,
            "paired95": [
              0.39221529751394185,
              0.40979352914866657
            ]
          },
          "collapseOnlyOwnPass": 5428,
          "spreadOnlyOwnPass": 158
        },
        "opponent3AtLeast2": {
          "n": 13142,
          "stones": {
            "collapse": 1.6448790138487293,
            "spread": 1.9781616192360372,
            "delta": -0.33328260538730786,
            "paired95": [
              -0.34134230917000763,
              -0.3252229016046081
            ]
          },
          "doubles": {
            "collapse": 0.18969715416222796,
            "spread": 0.25300563080200883,
            "delta": -0.06330847663978086,
            "paired95": [
              -0.0674720966825072,
              -0.059144856597054506
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.22675391873383047,
            "spread": 0.015598843402830619,
            "delta": 0.21115507533099984,
            "paired95": [
              0.20417695516578996,
              0.21813319549620971
            ]
          },
          "pass2": {
            "collapse": 0.12836706741744028,
            "spread": 0.006239537361132248,
            "delta": 0.12212753005630803,
            "paired95": [
              0.11652912437919472,
              0.12772593573342134
            ]
          },
          "played3": {
            "collapse": 1.4551818596865014,
            "spread": 0.9732156444985542,
            "delta": 0.481966215187947,
            "paired95": [
              0.4712243742548506,
              0.49270805612104346
            ]
          },
          "ownLegal": {
            "collapse": 0.7117638106833054,
            "spread": 2.016131486836098,
            "delta": -1.3043676761527925,
            "paired95": [
              -1.321657358068308,
              -1.287077994237277
            ]
          },
          "ownPass": {
            "collapse": 0.44840967889210165,
            "spread": 0.047405265560797445,
            "delta": 0.4010044133313042,
            "paired95": [
              0.39221529751394185,
              0.40979352914866657
            ]
          },
          "collapseOnlyOwnPass": 5428,
          "spreadOnlyOwnPass": 158
        },
        "opponent3Under2": {
          "n": 10858,
          "stones": {
            "collapse": 1.0736783938110148,
            "spread": 1.9479646343709707,
            "delta": -0.8742862405599557,
            "paired95": [
              -0.8850924634724431,
              -0.8634800176474684
            ]
          },
          "doubles": {
            "collapse": 0.19137962792411126,
            "spread": 0.22637686498434334,
            "delta": -0.034997237060232084,
            "paired95": [
              -0.04329862527694292,
              -0.02669584884352125
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.5558113833118438,
            "spread": 0.03960213667342052,
            "delta": 0.5162092466384233,
            "paired95": [
              0.5068089226092231,
              0.5256095706676235
            ]
          },
          "pass2": {
            "collapse": 0.3705102228771413,
            "spread": 0.012433228955608768,
            "delta": 0.3580769939215325,
            "paired95": [
              0.34894366776653873,
              0.3672103200765263
            ]
          },
          "played3": {
            "collapse": 0.8822987658869037,
            "spread": 0.4464910664947504,
            "delta": 0.43580769939215325,
            "paired95": [
              0.4264802655073322,
              0.4451351332769743
            ]
          },
          "ownLegal": {
            "collapse": 1.5325105912691104,
            "spread": 2.4836065573770494,
            "delta": -0.9510959661079389,
            "paired95": [
              -0.9689474435924417,
              -0.9332444886234361
            ]
          },
          "ownPass": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "collapseOnlyOwnPass": 0,
          "spreadOnlyOwnPass": 0
        }
      }
    },
    "global-ever-open/low": {
      "cohort1": {
        "n": 12000,
        "stones": {
          "collapse": 1.3891666666666667,
          "spread": 1.9654166666666666,
          "delta": -0.57625,
          "paired95": [
            -0.5867066158150708,
            -0.5657933841849293
          ]
        },
        "doubles": {
          "collapse": 0.19241666666666668,
          "spread": 0.24291666666666667,
          "delta": -0.0505,
          "paired95": [
            -0.05667977940954014,
            -0.04432022059045987
          ]
        },
        "extra": {
          "collapse": 0,
          "spread": 0,
          "delta": 0,
          "paired95": [
            0,
            0
          ]
        },
        "pass1": {
          "collapse": 0.375,
          "spread": 0.02575,
          "delta": 0.34925,
          "paired95": [
            0.34071980733273965,
            0.35778019266726035
          ]
        },
        "pass2": {
          "collapse": 0.23583333333333334,
          "spread": 0.008833333333333334,
          "delta": 0.227,
          "paired95": [
            0.21944800968384037,
            0.23455199031615964
          ]
        },
        "played3": {
          "collapse": 1.19675,
          "spread": 0.493,
          "delta": 0.70375,
          "paired95": [
            0.6925378787472751,
            0.7149621212527248
          ]
        },
        "ownLegal": {
          "collapse": 1.0939166666666666,
          "spread": 2.111666666666667,
          "delta": -1.01775,
          "paired95": [
            -1.0359396823328566,
            -0.9995603176671434
          ]
        },
        "ownPass": {
          "collapse": 0.24216666666666667,
          "spread": 0.0415,
          "delta": 0.20066666666666666,
          "paired95": [
            0.19313742207854676,
            0.20819591125478656
          ]
        },
        "collapseOnlyOwnPass": 2508,
        "spreadOnlyOwnPass": 100
      },
      "cohort2": {
        "n": 12000,
        "stones": {
          "collapse": 1.38425,
          "spread": 1.9634166666666666,
          "delta": -0.5791666666666667,
          "paired95": [
            -0.5896850508712207,
            -0.5686482824621127
          ]
        },
        "doubles": {
          "collapse": 0.18941666666666668,
          "spread": 0.23783333333333334,
          "delta": -0.04841666666666666,
          "paired95": [
            -0.05462975695930235,
            -0.04220357637403098
          ]
        },
        "extra": {
          "collapse": 0,
          "spread": 0,
          "delta": 0,
          "paired95": [
            0,
            0
          ]
        },
        "pass1": {
          "collapse": 0.37625,
          "spread": 0.027166666666666665,
          "delta": 0.34908333333333336,
          "paired95": [
            0.34055408424525024,
            0.35761258242141647
          ]
        },
        "pass2": {
          "collapse": 0.2395,
          "spread": 0.009416666666666667,
          "delta": 0.23008333333333333,
          "paired95": [
            0.22249945943062846,
            0.2376672072360382
          ]
        },
        "played3": {
          "collapse": 1.1948333333333334,
          "spread": 0.49333333333333335,
          "delta": 0.7015,
          "paired95": [
            0.6902891379067164,
            0.7127108620932836
          ]
        },
        "ownLegal": {
          "collapse": 1.0785833333333332,
          "spread": 2.11875,
          "delta": -1.0401666666666667,
          "paired95": [
            -1.0583045132866082,
            -1.0220288200467251
          ]
        },
        "ownPass": {
          "collapse": 0.24758333333333332,
          "spread": 0.04558333333333333,
          "delta": 0.202,
          "paired95": [
            0.1944291325630906,
            0.20957086743690942
          ]
        },
        "collapseOnlyOwnPass": 2531,
        "spreadOnlyOwnPass": 107
      },
      "overall": {
        "n": 24000,
        "stones": {
          "collapse": 1.3867083333333334,
          "spread": 1.9644166666666667,
          "delta": -0.5777083333333334,
          "paired95": [
            -0.5851240163129056,
            -0.5702926503537612
          ]
        },
        "doubles": {
          "collapse": 0.19091666666666668,
          "spread": 0.240375,
          "delta": -0.04945833333333333,
          "paired95": [
            -0.053839818797502464,
            -0.0450768478691642
          ]
        },
        "extra": {
          "collapse": 0,
          "spread": 0,
          "delta": 0,
          "paired95": [
            0,
            0
          ]
        },
        "pass1": {
          "collapse": 0.375625,
          "spread": 0.026458333333333334,
          "delta": 0.3491666666666667,
          "paired95": [
            0.34313536875225714,
            0.3551979645810762
          ]
        },
        "pass2": {
          "collapse": 0.23766666666666666,
          "spread": 0.009125,
          "delta": 0.22854166666666667,
          "paired95": [
            0.22319039462405751,
            0.23389293870927583
          ]
        },
        "played3": {
          "collapse": 1.1957916666666666,
          "spread": 0.49316666666666664,
          "delta": 0.702625,
          "paired95": [
            0.6946974305900282,
            0.7105525694099719
          ]
        },
        "ownLegal": {
          "collapse": 1.08625,
          "spread": 2.1152083333333334,
          "delta": -1.0289583333333334,
          "paired95": [
            -1.0418025826945452,
            -1.0161140839721217
          ]
        },
        "ownPass": {
          "collapse": 0.244875,
          "spread": 0.043541666666666666,
          "delta": 0.20133333333333334,
          "paired95": [
            0.19599472181260547,
            0.2066719448540612
          ]
        },
        "collapseOnlyOwnPass": 5039,
        "spreadOnlyOwnPass": 207
      },
      "strata": {
        "own3": {
          "n": 10858,
          "stones": {
            "collapse": 1.0736783938110148,
            "spread": 1.9479646343709707,
            "delta": -0.8742862405599557,
            "paired95": [
              -0.8850924634724431,
              -0.8634800176474684
            ]
          },
          "doubles": {
            "collapse": 0.19137962792411126,
            "spread": 0.22140357340209985,
            "delta": -0.03002394547798858,
            "paired95": [
              -0.0382296087995083,
              -0.02181828215646886
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.5558113833118438,
            "spread": 0.03960213667342052,
            "delta": 0.5162092466384233,
            "paired95": [
              0.5068089226092231,
              0.5256095706676235
            ]
          },
          "pass2": {
            "collapse": 0.3705102228771413,
            "spread": 0.012433228955608768,
            "delta": 0.3580769939215325,
            "paired95": [
              0.3489472364526901,
              0.36720675139037495
            ]
          },
          "played3": {
            "collapse": 0.8822987658869037,
            "spread": 0.2935163013446307,
            "delta": 0.588782464542273,
            "paired95": [
              0.5795266552251034,
              0.5980382738594426
            ]
          },
          "ownLegal": {
            "collapse": 1.5325105912691104,
            "spread": 2.3736415546141094,
            "delta": -0.841130963344999,
            "paired95": [
              -0.8590534196668229,
              -0.8232085070231752
            ]
          },
          "ownPass": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "collapseOnlyOwnPass": 0,
          "spreadOnlyOwnPass": 0
        },
        "noOwn3": {
          "n": 13142,
          "stones": {
            "collapse": 1.6453355653629584,
            "spread": 1.9780094353979607,
            "delta": -0.33267387003500226,
            "paired95": [
              -0.34072988518319597,
              -0.32461785488680855
            ]
          },
          "doubles": {
            "collapse": 0.19053416527164815,
            "spread": 0.2560493075635368,
            "delta": -0.0655151422918886,
            "paired95": [
              -0.06974571187183888,
              -0.06128457271193831
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.22675391873383047,
            "spread": 0.015598843402830619,
            "delta": 0.21115507533099984,
            "paired95": [
              0.20417695516578996,
              0.21813319549620971
            ]
          },
          "pass2": {
            "collapse": 0.1279105159032111,
            "spread": 0.006391721199208644,
            "delta": 0.12151879470400244,
            "paired95": [
              0.11593242302196682,
              0.12710516638603805
            ]
          },
          "played3": {
            "collapse": 1.4548014000913103,
            "spread": 0.6581190077613758,
            "delta": 0.7966823923299345,
            "paired95": [
              0.7846239396494838,
              0.8087408450103852
            ]
          },
          "ownLegal": {
            "collapse": 0.7175467965302085,
            "spread": 1.901689240602648,
            "delta": -1.1841424440724395,
            "paired95": [
              -1.2019016836484888,
              -1.1663832044963902
            ]
          },
          "ownPass": {
            "collapse": 0.4471922081874905,
            "spread": 0.07951605539491706,
            "delta": 0.36767615279257343,
            "paired95": [
              0.35889123665057604,
              0.3764610689345708
            ]
          },
          "collapseOnlyOwnPass": 5039,
          "spreadOnlyOwnPass": 207
        },
        "opponent3AtLeast2": {
          "n": 13142,
          "stones": {
            "collapse": 1.6453355653629584,
            "spread": 1.9780094353979607,
            "delta": -0.33267387003500226,
            "paired95": [
              -0.34072988518319597,
              -0.32461785488680855
            ]
          },
          "doubles": {
            "collapse": 0.19053416527164815,
            "spread": 0.2560493075635368,
            "delta": -0.0655151422918886,
            "paired95": [
              -0.06974571187183888,
              -0.06128457271193831
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.22675391873383047,
            "spread": 0.015598843402830619,
            "delta": 0.21115507533099984,
            "paired95": [
              0.20417695516578996,
              0.21813319549620971
            ]
          },
          "pass2": {
            "collapse": 0.1279105159032111,
            "spread": 0.006391721199208644,
            "delta": 0.12151879470400244,
            "paired95": [
              0.11593242302196682,
              0.12710516638603805
            ]
          },
          "played3": {
            "collapse": 1.4548014000913103,
            "spread": 0.6581190077613758,
            "delta": 0.7966823923299345,
            "paired95": [
              0.7846239396494838,
              0.8087408450103852
            ]
          },
          "ownLegal": {
            "collapse": 0.7175467965302085,
            "spread": 1.901689240602648,
            "delta": -1.1841424440724395,
            "paired95": [
              -1.2019016836484888,
              -1.1663832044963902
            ]
          },
          "ownPass": {
            "collapse": 0.4471922081874905,
            "spread": 0.07951605539491706,
            "delta": 0.36767615279257343,
            "paired95": [
              0.35889123665057604,
              0.3764610689345708
            ]
          },
          "collapseOnlyOwnPass": 5039,
          "spreadOnlyOwnPass": 207
        },
        "opponent3Under2": {
          "n": 10858,
          "stones": {
            "collapse": 1.0736783938110148,
            "spread": 1.9479646343709707,
            "delta": -0.8742862405599557,
            "paired95": [
              -0.8850924634724431,
              -0.8634800176474684
            ]
          },
          "doubles": {
            "collapse": 0.19137962792411126,
            "spread": 0.22140357340209985,
            "delta": -0.03002394547798858,
            "paired95": [
              -0.0382296087995083,
              -0.02181828215646886
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.5558113833118438,
            "spread": 0.03960213667342052,
            "delta": 0.5162092466384233,
            "paired95": [
              0.5068089226092231,
              0.5256095706676235
            ]
          },
          "pass2": {
            "collapse": 0.3705102228771413,
            "spread": 0.012433228955608768,
            "delta": 0.3580769939215325,
            "paired95": [
              0.3489472364526901,
              0.36720675139037495
            ]
          },
          "played3": {
            "collapse": 0.8822987658869037,
            "spread": 0.2935163013446307,
            "delta": 0.588782464542273,
            "paired95": [
              0.5795266552251034,
              0.5980382738594426
            ]
          },
          "ownLegal": {
            "collapse": 1.5325105912691104,
            "spread": 2.3736415546141094,
            "delta": -0.841130963344999,
            "paired95": [
              -0.8590534196668229,
              -0.8232085070231752
            ]
          },
          "ownPass": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "collapseOnlyOwnPass": 0,
          "spreadOnlyOwnPass": 0
        }
      }
    },
    "global-ever-open/double-first": {
      "cohort1": {
        "n": 12000,
        "stones": {
          "collapse": 1.38725,
          "spread": 1.9653333333333334,
          "delta": -0.5780833333333333,
          "paired95": [
            -0.5885177334977555,
            -0.5676489331689111
          ]
        },
        "doubles": {
          "collapse": 0.24016666666666667,
          "spread": 0.2728333333333333,
          "delta": -0.03266666666666666,
          "paired95": [
            -0.03969445976007191,
            -0.025638873573261414
          ]
        },
        "extra": {
          "collapse": 0,
          "spread": 0,
          "delta": 0,
          "paired95": [
            0,
            0
          ]
        },
        "pass1": {
          "collapse": 0.375,
          "spread": 0.02575,
          "delta": 0.34925,
          "paired95": [
            0.34071980733273965,
            0.35778019266726035
          ]
        },
        "pass2": {
          "collapse": 0.23775,
          "spread": 0.008916666666666666,
          "delta": 0.22883333333333333,
          "paired95": [
            0.2212708018915042,
            0.23639586477516247
          ]
        },
        "played3": {
          "collapse": 1.1470833333333332,
          "spread": 0.71675,
          "delta": 0.43033333333333335,
          "paired95": [
            0.4205196507810065,
            0.4401470158856602
          ]
        },
        "ownLegal": {
          "collapse": 1.1493333333333333,
          "spread": 2.2456666666666667,
          "delta": -1.0963333333333334,
          "paired95": [
            -1.1145401829628814,
            -1.0781264837037854
          ]
        },
        "ownPass": {
          "collapse": 0.213,
          "spread": 0.025,
          "delta": 0.188,
          "paired95": [
            0.1806408568966498,
            0.1953591431033502
          ]
        },
        "collapseOnlyOwnPass": 2355,
        "spreadOnlyOwnPass": 99
      },
      "cohort2": {
        "n": 12000,
        "stones": {
          "collapse": 1.3856666666666666,
          "spread": 1.9636666666666667,
          "delta": -0.578,
          "paired95": [
            -0.5885389103414891,
            -0.5674610896585108
          ]
        },
        "doubles": {
          "collapse": 0.245,
          "spread": 0.2669166666666667,
          "delta": -0.021916666666666668,
          "paired95": [
            -0.028891187172239867,
            -0.01494214616109347
          ]
        },
        "extra": {
          "collapse": 0,
          "spread": 0,
          "delta": 0,
          "paired95": [
            0,
            0
          ]
        },
        "pass1": {
          "collapse": 0.37625,
          "spread": 0.027166666666666665,
          "delta": 0.34908333333333336,
          "paired95": [
            0.34055408424525024,
            0.35761258242141647
          ]
        },
        "pass2": {
          "collapse": 0.23808333333333334,
          "spread": 0.009166666666666667,
          "delta": 0.22891666666666666,
          "paired95": [
            0.22133204346886595,
            0.23650128986446736
          ]
        },
        "played3": {
          "collapse": 1.1406666666666667,
          "spread": 0.7201666666666666,
          "delta": 0.4205,
          "paired95": [
            0.41077041456675883,
            0.43022958543324114
          ]
        },
        "ownLegal": {
          "collapse": 1.1443333333333334,
          "spread": 2.25725,
          "delta": -1.1129166666666668,
          "paired95": [
            -1.1311245121796447,
            -1.0947088211536888
          ]
        },
        "ownPass": {
          "collapse": 0.21633333333333332,
          "spread": 0.026083333333333333,
          "delta": 0.19025,
          "paired95": [
            0.18285687947707677,
            0.19764312052292324
          ]
        },
        "collapseOnlyOwnPass": 2383,
        "spreadOnlyOwnPass": 100
      },
      "overall": {
        "n": 24000,
        "stones": {
          "collapse": 1.3864583333333333,
          "spread": 1.9645,
          "delta": -0.5780416666666667,
          "paired95": [
            -0.5854567892940743,
            -0.570626544039259
          ]
        },
        "doubles": {
          "collapse": 0.24258333333333335,
          "spread": 0.269875,
          "delta": -0.027291666666666665,
          "paired95": [
            -0.03224263186571948,
            -0.022340701467613844
          ]
        },
        "extra": {
          "collapse": 0,
          "spread": 0,
          "delta": 0,
          "paired95": [
            0,
            0
          ]
        },
        "pass1": {
          "collapse": 0.375625,
          "spread": 0.026458333333333334,
          "delta": 0.3491666666666667,
          "paired95": [
            0.34313536875225714,
            0.3551979645810762
          ]
        },
        "pass2": {
          "collapse": 0.23791666666666667,
          "spread": 0.009041666666666667,
          "delta": 0.228875,
          "paired95": [
            0.22351977797283787,
            0.23423022202716212
          ]
        },
        "played3": {
          "collapse": 1.143875,
          "spread": 0.7184583333333333,
          "delta": 0.42541666666666667,
          "paired95": [
            0.41850687798330655,
            0.4323264553500268
          ]
        },
        "ownLegal": {
          "collapse": 1.1468333333333334,
          "spread": 2.2514583333333333,
          "delta": -1.104625,
          "paired95": [
            -1.1174996981145209,
            -1.091750301885479
          ]
        },
        "ownPass": {
          "collapse": 0.21466666666666667,
          "spread": 0.025541666666666667,
          "delta": 0.189125,
          "paired95": [
            0.18390936258696544,
            0.19434063741303453
          ]
        },
        "collapseOnlyOwnPass": 4738,
        "spreadOnlyOwnPass": 199
      },
      "strata": {
        "own3": {
          "n": 10858,
          "stones": {
            "collapse": 1.0736783938110148,
            "spread": 1.9479646343709707,
            "delta": -0.8742862405599557,
            "paired95": [
              -0.8850924634724431,
              -0.8634800176474684
            ]
          },
          "doubles": {
            "collapse": 0.19137962792411126,
            "spread": 0.25916375023024496,
            "delta": -0.06778412230613373,
            "paired95": [
              -0.07590575574294002,
              -0.059662488869327436
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.5558113833118438,
            "spread": 0.03960213667342052,
            "delta": 0.5162092466384233,
            "paired95": [
              0.5068089226092231,
              0.5256095706676235
            ]
          },
          "pass2": {
            "collapse": 0.3705102228771413,
            "spread": 0.012433228955608768,
            "delta": 0.3580769939215325,
            "paired95": [
              0.34894366776653873,
              0.3672103200765263
            ]
          },
          "played3": {
            "collapse": 0.8822987658869037,
            "spread": 0.4412414809357156,
            "delta": 0.44105728495118807,
            "paired95": [
              0.43171759837305684,
              0.4503969715293193
            ]
          },
          "ownLegal": {
            "collapse": 1.5325105912691104,
            "spread": 2.5084730152882666,
            "delta": -0.9759624240191563,
            "paired95": [
              -0.9936430345672532,
              -0.9582818134710595
            ]
          },
          "ownPass": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "collapseOnlyOwnPass": 0,
          "spreadOnlyOwnPass": 0
        },
        "noOwn3": {
          "n": 13142,
          "stones": {
            "collapse": 1.6448790138487293,
            "spread": 1.9781616192360372,
            "delta": -0.33328260538730786,
            "paired95": [
              -0.34134230917000763,
              -0.3252229016046081
            ]
          },
          "doubles": {
            "collapse": 0.28488814487901387,
            "spread": 0.2787246994369198,
            "delta": 0.00616344544209405,
            "paired95": [
              0.00016321974965966424,
              0.012163671134528434
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.22675391873383047,
            "spread": 0.015598843402830619,
            "delta": 0.21115507533099984,
            "paired95": [
              0.20417695516578996,
              0.21813319549620971
            ]
          },
          "pass2": {
            "collapse": 0.12836706741744028,
            "spread": 0.006239537361132248,
            "delta": 0.12212753005630803,
            "paired95": [
              0.11652912437919472,
              0.12772593573342134
            ]
          },
          "played3": {
            "collapse": 1.3599908689697153,
            "spread": 0.9474965758636433,
            "delta": 0.4124942931060721,
            "paired95": [
              0.40251503401818595,
              0.42247355219395827
            ]
          },
          "ownLegal": {
            "collapse": 0.8281844468117486,
            "spread": 2.039111246385634,
            "delta": -1.2109267995738853,
            "paired95": [
              -1.2291514875562974,
              -1.192702111591473
            ]
          },
          "ownPass": {
            "collapse": 0.39202556688479684,
            "spread": 0.04664434637041546,
            "delta": 0.34538122051438136,
            "paired95": [
              0.33672393148847124,
              0.3540385095402915
            ]
          },
          "collapseOnlyOwnPass": 4738,
          "spreadOnlyOwnPass": 199
        },
        "opponent3AtLeast2": {
          "n": 13142,
          "stones": {
            "collapse": 1.6448790138487293,
            "spread": 1.9781616192360372,
            "delta": -0.33328260538730786,
            "paired95": [
              -0.34134230917000763,
              -0.3252229016046081
            ]
          },
          "doubles": {
            "collapse": 0.28488814487901387,
            "spread": 0.2787246994369198,
            "delta": 0.00616344544209405,
            "paired95": [
              0.00016321974965966424,
              0.012163671134528434
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.22675391873383047,
            "spread": 0.015598843402830619,
            "delta": 0.21115507533099984,
            "paired95": [
              0.20417695516578996,
              0.21813319549620971
            ]
          },
          "pass2": {
            "collapse": 0.12836706741744028,
            "spread": 0.006239537361132248,
            "delta": 0.12212753005630803,
            "paired95": [
              0.11652912437919472,
              0.12772593573342134
            ]
          },
          "played3": {
            "collapse": 1.3599908689697153,
            "spread": 0.9474965758636433,
            "delta": 0.4124942931060721,
            "paired95": [
              0.40251503401818595,
              0.42247355219395827
            ]
          },
          "ownLegal": {
            "collapse": 0.8281844468117486,
            "spread": 2.039111246385634,
            "delta": -1.2109267995738853,
            "paired95": [
              -1.2291514875562974,
              -1.192702111591473
            ]
          },
          "ownPass": {
            "collapse": 0.39202556688479684,
            "spread": 0.04664434637041546,
            "delta": 0.34538122051438136,
            "paired95": [
              0.33672393148847124,
              0.3540385095402915
            ]
          },
          "collapseOnlyOwnPass": 4738,
          "spreadOnlyOwnPass": 199
        },
        "opponent3Under2": {
          "n": 10858,
          "stones": {
            "collapse": 1.0736783938110148,
            "spread": 1.9479646343709707,
            "delta": -0.8742862405599557,
            "paired95": [
              -0.8850924634724431,
              -0.8634800176474684
            ]
          },
          "doubles": {
            "collapse": 0.19137962792411126,
            "spread": 0.25916375023024496,
            "delta": -0.06778412230613373,
            "paired95": [
              -0.07590575574294002,
              -0.059662488869327436
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.5558113833118438,
            "spread": 0.03960213667342052,
            "delta": 0.5162092466384233,
            "paired95": [
              0.5068089226092231,
              0.5256095706676235
            ]
          },
          "pass2": {
            "collapse": 0.3705102228771413,
            "spread": 0.012433228955608768,
            "delta": 0.3580769939215325,
            "paired95": [
              0.34894366776653873,
              0.3672103200765263
            ]
          },
          "played3": {
            "collapse": 0.8822987658869037,
            "spread": 0.4412414809357156,
            "delta": 0.44105728495118807,
            "paired95": [
              0.43171759837305684,
              0.4503969715293193
            ]
          },
          "ownLegal": {
            "collapse": 1.5325105912691104,
            "spread": 2.5084730152882666,
            "delta": -0.9759624240191563,
            "paired95": [
              -0.9936430345672532,
              -0.9582818134710595
            ]
          },
          "ownPass": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "collapseOnlyOwnPass": 0,
          "spreadOnlyOwnPass": 0
        }
      }
    },
    "global-ever-open/oracle-deny": {
      "cohort1": {
        "n": 12000,
        "stones": {
          "collapse": 1.4043333333333334,
          "spread": 1.9683333333333333,
          "delta": -0.564,
          "paired95": [
            -0.5744625039641132,
            -0.5535374960358866
          ]
        },
        "doubles": {
          "collapse": 0.16883333333333334,
          "spread": 0.07691666666666666,
          "delta": 0.09191666666666666,
          "paired95": [
            0.08539610883565962,
            0.0984372244976737
          ]
        },
        "extra": {
          "collapse": 0,
          "spread": 0,
          "delta": 0,
          "paired95": [
            0,
            0
          ]
        },
        "pass1": {
          "collapse": 0.375,
          "spread": 0.02575,
          "delta": 0.34925,
          "paired95": [
            0.34071980733273965,
            0.35778019266726035
          ]
        },
        "pass2": {
          "collapse": 0.22066666666666668,
          "spread": 0.005916666666666666,
          "delta": 0.21475,
          "paired95": [
            0.20736603335185952,
            0.22213396664814047
          ]
        },
        "played3": {
          "collapse": 1.2355,
          "spread": 0.71675,
          "delta": 0.51875,
          "paired95": [
            0.5078810898122132,
            0.5296189101877868
          ]
        },
        "ownLegal": {
          "collapse": 0.98125,
          "spread": 1.4745,
          "delta": -0.49325,
          "paired95": [
            -0.5122687504262279,
            -0.47423124957377216
          ]
        },
        "ownPass": {
          "collapse": 0.32216666666666666,
          "spread": 0.12908333333333333,
          "delta": 0.19308333333333333,
          "paired95": [
            0.18415230748079334,
            0.20201435918587332
          ]
        },
        "collapseOnlyOwnPass": 2877,
        "spreadOnlyOwnPass": 560
      },
      "cohort2": {
        "n": 12000,
        "stones": {
          "collapse": 1.39975,
          "spread": 1.9674166666666666,
          "delta": -0.5676666666666667,
          "paired95": [
            -0.5782005920094927,
            -0.5571327413238406
          ]
        },
        "doubles": {
          "collapse": 0.17116666666666666,
          "spread": 0.079,
          "delta": 0.09216666666666666,
          "paired95": [
            0.08568211730853925,
            0.09865121602479407
          ]
        },
        "extra": {
          "collapse": 0,
          "spread": 0,
          "delta": 0,
          "paired95": [
            0,
            0
          ]
        },
        "pass1": {
          "collapse": 0.37625,
          "spread": 0.027166666666666665,
          "delta": 0.34908333333333336,
          "paired95": [
            0.34055408424525024,
            0.35761258242141647
          ]
        },
        "pass2": {
          "collapse": 0.224,
          "spread": 0.005416666666666667,
          "delta": 0.21858333333333332,
          "paired95": [
            0.21115960770855158,
            0.22600705895811507
          ]
        },
        "played3": {
          "collapse": 1.2285833333333334,
          "spread": 0.7179166666666666,
          "delta": 0.5106666666666667,
          "paired95": [
            0.4998089883781613,
            0.5215243449551721
          ]
        },
        "ownLegal": {
          "collapse": 0.977,
          "spread": 1.4850833333333333,
          "delta": -0.5080833333333333,
          "paired95": [
            -0.5271075278164216,
            -0.4890591388502451
          ]
        },
        "ownPass": {
          "collapse": 0.32458333333333333,
          "spread": 0.13125,
          "delta": 0.19333333333333333,
          "paired95": [
            0.1843965725111448,
            0.20227009415552186
          ]
        },
        "collapseOnlyOwnPass": 2881,
        "spreadOnlyOwnPass": 561
      },
      "overall": {
        "n": 24000,
        "stones": {
          "collapse": 1.4020416666666666,
          "spread": 1.967875,
          "delta": -0.5658333333333333,
          "paired95": [
            -0.5732566166291462,
            -0.5584100500375204
          ]
        },
        "doubles": {
          "collapse": 0.17,
          "spread": 0.07795833333333334,
          "delta": 0.09204166666666666,
          "paired95": [
            0.08744374482533528,
            0.09663958850799804
          ]
        },
        "extra": {
          "collapse": 0,
          "spread": 0,
          "delta": 0,
          "paired95": [
            0,
            0
          ]
        },
        "pass1": {
          "collapse": 0.375625,
          "spread": 0.026458333333333334,
          "delta": 0.3491666666666667,
          "paired95": [
            0.34313536875225714,
            0.3551979645810762
          ]
        },
        "pass2": {
          "collapse": 0.22233333333333333,
          "spread": 0.005666666666666667,
          "delta": 0.21666666666666667,
          "paired95": [
            0.21143139089789925,
            0.2219019424354341
          ]
        },
        "played3": {
          "collapse": 1.2320416666666667,
          "spread": 0.7173333333333334,
          "delta": 0.5147083333333333,
          "paired95": [
            0.5070268131216942,
            0.5223898535449725
          ]
        },
        "ownLegal": {
          "collapse": 0.979125,
          "spread": 1.4797916666666666,
          "delta": -0.5006666666666667,
          "paired95": [
            -0.5141169260643623,
            -0.4872164072689711
          ]
        },
        "ownPass": {
          "collapse": 0.323375,
          "spread": 0.13016666666666668,
          "delta": 0.19320833333333334,
          "paired95": [
            0.18689124786425867,
            0.199525418802408
          ]
        },
        "collapseOnlyOwnPass": 5758,
        "spreadOnlyOwnPass": 1121
      },
      "strata": {
        "own3": {
          "n": 10858,
          "stones": {
            "collapse": 1.0736783938110148,
            "spread": 1.9516485540615214,
            "delta": -0.8779701602505066,
            "paired95": [
              -0.8886945148529433,
              -0.8672458056480699
            ]
          },
          "doubles": {
            "collapse": 0.19137962792411126,
            "spread": 0.08620372075888745,
            "delta": 0.10517590716522379,
            "paired95": [
              0.09754288499452937,
              0.11280892933591821
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.5558113833118438,
            "spread": 0.03960213667342052,
            "delta": 0.5162092466384233,
            "paired95": [
              0.5068089226092231,
              0.5256095706676235
            ]
          },
          "pass2": {
            "collapse": 0.3705102228771413,
            "spread": 0.008749309265058021,
            "delta": 0.36176091361208323,
            "paired95": [
              0.35265759629654453,
              0.37086423092762194
            ]
          },
          "played3": {
            "collapse": 0.8822987658869037,
            "spread": 0.42687419414256766,
            "delta": 0.455424571744336,
            "paired95": [
              0.44605675465006495,
              0.464792388838607
            ]
          },
          "ownLegal": {
            "collapse": 1.5325105912691104,
            "spread": 1.821698286977344,
            "delta": -0.28918769570823355,
            "paired95": [
              -0.30726674677794474,
              -0.27110864463852236
            ]
          },
          "ownPass": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "collapseOnlyOwnPass": 0,
          "spreadOnlyOwnPass": 0
        },
        "noOwn3": {
          "n": 13142,
          "stones": {
            "collapse": 1.6733373915690153,
            "spread": 1.9812813879166034,
            "delta": -0.3079439963475879,
            "paired95": [
              -0.31583710997313497,
              -0.30005088272204083
            ]
          },
          "doubles": {
            "collapse": 0.15233602191447268,
            "spread": 0.07114594430071526,
            "delta": 0.08119007761375742,
            "paired95": [
              0.0756528284290838,
              0.08672732679843104
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.22675391873383047,
            "spread": 0.015598843402830619,
            "delta": 0.21115507533099984,
            "paired95": [
              0.20417695516578996,
              0.21813319549620971
            ]
          },
          "pass2": {
            "collapse": 0.09990868969715416,
            "spread": 0.003119768680566124,
            "delta": 0.09678892101658804,
            "paired95": [
              0.09173359328159703,
              0.10184424875157905
            ]
          },
          "played3": {
            "collapse": 1.5210013696545426,
            "spread": 0.9573124334195708,
            "delta": 0.5636889362349718,
            "paired95": [
              0.5520553771338796,
              0.575322495336064
            ]
          },
          "ownLegal": {
            "collapse": 0.5219144726830011,
            "spread": 1.1973063460660478,
            "delta": -0.6753918733830467,
            "paired95": [
              -0.6943792698664031,
              -0.6564044768996904
            ]
          },
          "ownPass": {
            "collapse": 0.5905493836554558,
            "spread": 0.237711155075331,
            "delta": 0.3528382285801248,
            "paired95": [
              0.3420389071070246,
              0.363637550053225
            ]
          },
          "collapseOnlyOwnPass": 5758,
          "spreadOnlyOwnPass": 1121
        },
        "opponent3AtLeast2": {
          "n": 13142,
          "stones": {
            "collapse": 1.6733373915690153,
            "spread": 1.9812813879166034,
            "delta": -0.3079439963475879,
            "paired95": [
              -0.31583710997313497,
              -0.30005088272204083
            ]
          },
          "doubles": {
            "collapse": 0.15233602191447268,
            "spread": 0.07114594430071526,
            "delta": 0.08119007761375742,
            "paired95": [
              0.0756528284290838,
              0.08672732679843104
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.22675391873383047,
            "spread": 0.015598843402830619,
            "delta": 0.21115507533099984,
            "paired95": [
              0.20417695516578996,
              0.21813319549620971
            ]
          },
          "pass2": {
            "collapse": 0.09990868969715416,
            "spread": 0.003119768680566124,
            "delta": 0.09678892101658804,
            "paired95": [
              0.09173359328159703,
              0.10184424875157905
            ]
          },
          "played3": {
            "collapse": 1.5210013696545426,
            "spread": 0.9573124334195708,
            "delta": 0.5636889362349718,
            "paired95": [
              0.5520553771338796,
              0.575322495336064
            ]
          },
          "ownLegal": {
            "collapse": 0.5219144726830011,
            "spread": 1.1973063460660478,
            "delta": -0.6753918733830467,
            "paired95": [
              -0.6943792698664031,
              -0.6564044768996904
            ]
          },
          "ownPass": {
            "collapse": 0.5905493836554558,
            "spread": 0.237711155075331,
            "delta": 0.3528382285801248,
            "paired95": [
              0.3420389071070246,
              0.363637550053225
            ]
          },
          "collapseOnlyOwnPass": 5758,
          "spreadOnlyOwnPass": 1121
        },
        "opponent3Under2": {
          "n": 10858,
          "stones": {
            "collapse": 1.0736783938110148,
            "spread": 1.9516485540615214,
            "delta": -0.8779701602505066,
            "paired95": [
              -0.8886945148529433,
              -0.8672458056480699
            ]
          },
          "doubles": {
            "collapse": 0.19137962792411126,
            "spread": 0.08620372075888745,
            "delta": 0.10517590716522379,
            "paired95": [
              0.09754288499452937,
              0.11280892933591821
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.5558113833118438,
            "spread": 0.03960213667342052,
            "delta": 0.5162092466384233,
            "paired95": [
              0.5068089226092231,
              0.5256095706676235
            ]
          },
          "pass2": {
            "collapse": 0.3705102228771413,
            "spread": 0.008749309265058021,
            "delta": 0.36176091361208323,
            "paired95": [
              0.35265759629654453,
              0.37086423092762194
            ]
          },
          "played3": {
            "collapse": 0.8822987658869037,
            "spread": 0.42687419414256766,
            "delta": 0.455424571744336,
            "paired95": [
              0.44605675465006495,
              0.464792388838607
            ]
          },
          "ownLegal": {
            "collapse": 1.5325105912691104,
            "spread": 1.821698286977344,
            "delta": -0.28918769570823355,
            "paired95": [
              -0.30726674677794474,
              -0.27110864463852236
            ]
          },
          "ownPass": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "collapseOnlyOwnPass": 0,
          "spreadOnlyOwnPass": 0
        }
      }
    },
    "all-current-only/high": {
      "cohort1": {
        "n": 12000,
        "stones": {
          "collapse": 1.38725,
          "spread": 1.87175,
          "delta": -0.4845,
          "paired95": [
            -0.49475161674747675,
            -0.4742483832525232
          ]
        },
        "doubles": {
          "collapse": 0.187,
          "spread": 0.24491666666666667,
          "delta": -0.057916666666666665,
          "paired95": [
            -0.06420207485246343,
            -0.051631258480869906
          ]
        },
        "extra": {
          "collapse": 0,
          "spread": 0,
          "delta": 0,
          "paired95": [
            0,
            0
          ]
        },
        "pass1": {
          "collapse": 0.375,
          "spread": 0.02575,
          "delta": 0.34925,
          "paired95": [
            0.34071980733273965,
            0.35778019266726035
          ]
        },
        "pass2": {
          "collapse": 0.23775,
          "spread": 0.1025,
          "delta": 0.13525,
          "paired95": [
            0.1278734442009645,
            0.14262655579903552
          ]
        },
        "played3": {
          "collapse": 1.20025,
          "spread": 0.8525,
          "delta": 0.34775,
          "paired95": [
            0.3385392391886744,
            0.3569607608113256
          ]
        },
        "ownLegal": {
          "collapse": 1.0825,
          "spread": 1.3343333333333334,
          "delta": -0.25183333333333335,
          "paired95": [
            -0.26658192557009597,
            -0.23708474109657074
          ]
        },
        "ownPass": {
          "collapse": 0.24541666666666667,
          "spread": 0.20225,
          "delta": 0.043166666666666666,
          "paired95": [
            0.037287239165082156,
            0.049046094168251175
          ]
        },
        "collapseOnlyOwnPass": 918,
        "spreadOnlyOwnPass": 400
      },
      "cohort2": {
        "n": 12000,
        "stones": {
          "collapse": 1.3856666666666666,
          "spread": 1.86825,
          "delta": -0.4825833333333333,
          "paired95": [
            -0.4929323973991042,
            -0.4722342692675624
          ]
        },
        "doubles": {
          "collapse": 0.19391666666666665,
          "spread": 0.24041666666666667,
          "delta": -0.0465,
          "paired95": [
            -0.05272849385130584,
            -0.04027150614869416
          ]
        },
        "extra": {
          "collapse": 0,
          "spread": 0,
          "delta": 0,
          "paired95": [
            0,
            0
          ]
        },
        "pass1": {
          "collapse": 0.37625,
          "spread": 0.027166666666666665,
          "delta": 0.34908333333333336,
          "paired95": [
            0.34055408424525024,
            0.35761258242141647
          ]
        },
        "pass2": {
          "collapse": 0.23808333333333334,
          "spread": 0.10458333333333333,
          "delta": 0.1335,
          "paired95": [
            0.12603242001967319,
            0.14096757998032683
          ]
        },
        "played3": {
          "collapse": 1.19175,
          "spread": 0.85525,
          "delta": 0.3365,
          "paired95": [
            0.32743026316445384,
            0.3455697368355462
          ]
        },
        "ownLegal": {
          "collapse": 1.0836666666666666,
          "spread": 1.33575,
          "delta": -0.2520833333333333,
          "paired95": [
            -0.2669844379791163,
            -0.23718222868755032
          ]
        },
        "ownPass": {
          "collapse": 0.24566666666666667,
          "spread": 0.2115,
          "delta": 0.034166666666666665,
          "paired95": [
            0.02831372731165482,
            0.04001960602167851
          ]
        },
        "collapseOnlyOwnPass": 854,
        "spreadOnlyOwnPass": 444
      },
      "overall": {
        "n": 24000,
        "stones": {
          "collapse": 1.3864583333333333,
          "spread": 1.87,
          "delta": -0.48354166666666665,
          "paired95": [
            -0.4908250470466449,
            -0.47625828628668837
          ]
        },
        "doubles": {
          "collapse": 0.19045833333333334,
          "spread": 0.24266666666666667,
          "delta": -0.052208333333333336,
          "paired95": [
            -0.05663320884187999,
            -0.047783457824786685
          ]
        },
        "extra": {
          "collapse": 0,
          "spread": 0,
          "delta": 0,
          "paired95": [
            0,
            0
          ]
        },
        "pass1": {
          "collapse": 0.375625,
          "spread": 0.026458333333333334,
          "delta": 0.3491666666666667,
          "paired95": [
            0.34313536875225714,
            0.3551979645810762
          ]
        },
        "pass2": {
          "collapse": 0.23791666666666667,
          "spread": 0.10354166666666667,
          "delta": 0.134375,
          "paired95": [
            0.12912680446513713,
            0.13962319553486285
          ]
        },
        "played3": {
          "collapse": 1.196,
          "spread": 0.853875,
          "delta": 0.342125,
          "paired95": [
            0.3356614186097352,
            0.34858858139026483
          ]
        },
        "ownLegal": {
          "collapse": 1.0830833333333334,
          "spread": 1.3350416666666667,
          "delta": -0.25195833333333334,
          "paired95": [
            -0.26244100459010145,
            -0.2414756620765652
          ]
        },
        "ownPass": {
          "collapse": 0.24554166666666666,
          "spread": 0.206875,
          "delta": 0.03866666666666667,
          "paired95": [
            0.034518333719255535,
            0.0428149996140778
          ]
        },
        "collapseOnlyOwnPass": 1772,
        "spreadOnlyOwnPass": 844
      },
      "strata": {
        "own3": {
          "n": 10858,
          "stones": {
            "collapse": 1.0736783938110148,
            "spread": 1.7390863879167435,
            "delta": -0.6654079941057285,
            "paired95": [
              -0.6773516065323912,
              -0.6534643816790657
            ]
          },
          "doubles": {
            "collapse": 0.19137962792411126,
            "spread": 0.23015288266715786,
            "delta": -0.0387732547430466,
            "paired95": [
              -0.047148848695031775,
              -0.03039766079106143
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.5558113833118438,
            "spread": 0.03960213667342052,
            "delta": 0.5162092466384233,
            "paired95": [
              0.5068089226092231,
              0.5256095706676235
            ]
          },
          "pass2": {
            "collapse": 0.3705102228771413,
            "spread": 0.22131147540983606,
            "delta": 0.14919874746730521,
            "paired95": [
              0.13979036545246037,
              0.15860712948215006
            ]
          },
          "played3": {
            "collapse": 0.8822987658869037,
            "spread": 0.6270952293240007,
            "delta": 0.25520353656290296,
            "paired95": [
              0.24700260288766135,
              0.26340447023814456
            ]
          },
          "ownLegal": {
            "collapse": 1.5325105912691104,
            "spread": 1.6503039233744705,
            "delta": -0.1177933321053601,
            "paired95": [
              -0.13144661986259482,
              -0.10414004434812536
            ]
          },
          "ownPass": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "collapseOnlyOwnPass": 0,
          "spreadOnlyOwnPass": 0
        },
        "noOwn3": {
          "n": 13142,
          "stones": {
            "collapse": 1.6448790138487293,
            "spread": 1.9781616192360372,
            "delta": -0.33328260538730786,
            "paired95": [
              -0.34134230917000763,
              -0.3252229016046081
            ]
          },
          "doubles": {
            "collapse": 0.18969715416222796,
            "spread": 0.25300563080200883,
            "delta": -0.06330847663978086,
            "paired95": [
              -0.0674720966825072,
              -0.059144856597054506
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.22675391873383047,
            "spread": 0.015598843402830619,
            "delta": 0.21115507533099984,
            "paired95": [
              0.20417695516578996,
              0.21813319549620971
            ]
          },
          "pass2": {
            "collapse": 0.12836706741744028,
            "spread": 0.006239537361132248,
            "delta": 0.12212753005630803,
            "paired95": [
              0.11652912437919472,
              0.12772593573342134
            ]
          },
          "played3": {
            "collapse": 1.4551818596865014,
            "spread": 1.0412418201187035,
            "delta": 0.4139400395677979,
            "paired95": [
              0.4044482619640275,
              0.4234318171715683
            ]
          },
          "ownLegal": {
            "collapse": 0.7117638106833054,
            "spread": 1.074570080657434,
            "delta": -0.36280626997412874,
            "paired95": [
              -0.3780148601210902,
              -0.34759767982716727
            ]
          },
          "ownPass": {
            "collapse": 0.44840967889210165,
            "spread": 0.37779637802465377,
            "delta": 0.07061330086744788,
            "paired95": [
              0.06308111002829735,
              0.07814549170659842
            ]
          },
          "collapseOnlyOwnPass": 1772,
          "spreadOnlyOwnPass": 844
        },
        "opponent3AtLeast2": {
          "n": 13142,
          "stones": {
            "collapse": 1.6448790138487293,
            "spread": 1.9781616192360372,
            "delta": -0.33328260538730786,
            "paired95": [
              -0.34134230917000763,
              -0.3252229016046081
            ]
          },
          "doubles": {
            "collapse": 0.18969715416222796,
            "spread": 0.25300563080200883,
            "delta": -0.06330847663978086,
            "paired95": [
              -0.0674720966825072,
              -0.059144856597054506
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.22675391873383047,
            "spread": 0.015598843402830619,
            "delta": 0.21115507533099984,
            "paired95": [
              0.20417695516578996,
              0.21813319549620971
            ]
          },
          "pass2": {
            "collapse": 0.12836706741744028,
            "spread": 0.006239537361132248,
            "delta": 0.12212753005630803,
            "paired95": [
              0.11652912437919472,
              0.12772593573342134
            ]
          },
          "played3": {
            "collapse": 1.4551818596865014,
            "spread": 1.0412418201187035,
            "delta": 0.4139400395677979,
            "paired95": [
              0.4044482619640275,
              0.4234318171715683
            ]
          },
          "ownLegal": {
            "collapse": 0.7117638106833054,
            "spread": 1.074570080657434,
            "delta": -0.36280626997412874,
            "paired95": [
              -0.3780148601210902,
              -0.34759767982716727
            ]
          },
          "ownPass": {
            "collapse": 0.44840967889210165,
            "spread": 0.37779637802465377,
            "delta": 0.07061330086744788,
            "paired95": [
              0.06308111002829735,
              0.07814549170659842
            ]
          },
          "collapseOnlyOwnPass": 1772,
          "spreadOnlyOwnPass": 844
        },
        "opponent3Under2": {
          "n": 10858,
          "stones": {
            "collapse": 1.0736783938110148,
            "spread": 1.7390863879167435,
            "delta": -0.6654079941057285,
            "paired95": [
              -0.6773516065323912,
              -0.6534643816790657
            ]
          },
          "doubles": {
            "collapse": 0.19137962792411126,
            "spread": 0.23015288266715786,
            "delta": -0.0387732547430466,
            "paired95": [
              -0.047148848695031775,
              -0.03039766079106143
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.5558113833118438,
            "spread": 0.03960213667342052,
            "delta": 0.5162092466384233,
            "paired95": [
              0.5068089226092231,
              0.5256095706676235
            ]
          },
          "pass2": {
            "collapse": 0.3705102228771413,
            "spread": 0.22131147540983606,
            "delta": 0.14919874746730521,
            "paired95": [
              0.13979036545246037,
              0.15860712948215006
            ]
          },
          "played3": {
            "collapse": 0.8822987658869037,
            "spread": 0.6270952293240007,
            "delta": 0.25520353656290296,
            "paired95": [
              0.24700260288766135,
              0.26340447023814456
            ]
          },
          "ownLegal": {
            "collapse": 1.5325105912691104,
            "spread": 1.6503039233744705,
            "delta": -0.1177933321053601,
            "paired95": [
              -0.13144661986259482,
              -0.10414004434812536
            ]
          },
          "ownPass": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "collapseOnlyOwnPass": 0,
          "spreadOnlyOwnPass": 0
        }
      }
    },
    "all-current-only/low": {
      "cohort1": {
        "n": 12000,
        "stones": {
          "collapse": 1.3891666666666667,
          "spread": 1.828,
          "delta": -0.43883333333333335,
          "paired95": [
            -0.4490562649177347,
            -0.428610401748932
          ]
        },
        "doubles": {
          "collapse": 0.19241666666666668,
          "spread": 0.24758333333333332,
          "delta": -0.05516666666666667,
          "paired95": [
            -0.061298951646419034,
            -0.049034381686914305
          ]
        },
        "extra": {
          "collapse": 0,
          "spread": 0,
          "delta": 0,
          "paired95": [
            0,
            0
          ]
        },
        "pass1": {
          "collapse": 0.375,
          "spread": 0.02575,
          "delta": 0.34925,
          "paired95": [
            0.34071980733273965,
            0.35778019266726035
          ]
        },
        "pass2": {
          "collapse": 0.23583333333333334,
          "spread": 0.14625,
          "delta": 0.08958333333333333,
          "paired95": [
            0.08289895286259469,
            0.09626771380407198
          ]
        },
        "played3": {
          "collapse": 1.19675,
          "spread": 0.7000833333333333,
          "delta": 0.49666666666666665,
          "paired95": [
            0.4870283988484481,
            0.5063049344848852
          ]
        },
        "ownLegal": {
          "collapse": 1.0939166666666666,
          "spread": 1.2236666666666667,
          "delta": -0.12975,
          "paired95": [
            -0.14233141061180066,
            -0.11716858938819935
          ]
        },
        "ownPass": {
          "collapse": 0.24216666666666667,
          "spread": 0.22933333333333333,
          "delta": 0.012833333333333334,
          "paired95": [
            0.007905916927355993,
            0.017760749739310674
          ]
        },
        "collapseOnlyOwnPass": 533,
        "spreadOnlyOwnPass": 379
      },
      "cohort2": {
        "n": 12000,
        "stones": {
          "collapse": 1.38425,
          "spread": 1.82775,
          "delta": -0.4435,
          "paired95": [
            -0.45378354674441007,
            -0.43321645325558994
          ]
        },
        "doubles": {
          "collapse": 0.18941666666666668,
          "spread": 0.24416666666666667,
          "delta": -0.05475,
          "paired95": [
            -0.060881305077691204,
            -0.048618694922308796
          ]
        },
        "extra": {
          "collapse": 0,
          "spread": 0,
          "delta": 0,
          "paired95": [
            0,
            0
          ]
        },
        "pass1": {
          "collapse": 0.37625,
          "spread": 0.027166666666666665,
          "delta": 0.34908333333333336,
          "paired95": [
            0.34055408424525024,
            0.35761258242141647
          ]
        },
        "pass2": {
          "collapse": 0.2395,
          "spread": 0.14508333333333334,
          "delta": 0.09441666666666666,
          "paired95": [
            0.08765820135573509,
            0.10117513197759824
          ]
        },
        "played3": {
          "collapse": 1.1948333333333334,
          "spread": 0.6985,
          "delta": 0.49633333333333335,
          "paired95": [
            0.4867311575659976,
            0.5059355091006691
          ]
        },
        "ownLegal": {
          "collapse": 1.0785833333333332,
          "spread": 1.22125,
          "delta": -0.14266666666666666,
          "paired95": [
            -0.15536498865118634,
            -0.129968344682147
          ]
        },
        "ownPass": {
          "collapse": 0.24758333333333332,
          "spread": 0.22941666666666666,
          "delta": 0.018166666666666668,
          "paired95": [
            0.013158647162787349,
            0.023174686170545987
          ]
        },
        "collapseOnlyOwnPass": 581,
        "spreadOnlyOwnPass": 363
      },
      "overall": {
        "n": 24000,
        "stones": {
          "collapse": 1.3867083333333334,
          "spread": 1.827875,
          "delta": -0.44116666666666665,
          "paired95": [
            -0.4484167423331858,
            -0.4339165910001475
          ]
        },
        "doubles": {
          "collapse": 0.19091666666666668,
          "spread": 0.245875,
          "delta": -0.05495833333333333,
          "paired95": [
            -0.05929407765945489,
            -0.050622589007211775
          ]
        },
        "extra": {
          "collapse": 0,
          "spread": 0,
          "delta": 0,
          "paired95": [
            0,
            0
          ]
        },
        "pass1": {
          "collapse": 0.375625,
          "spread": 0.026458333333333334,
          "delta": 0.3491666666666667,
          "paired95": [
            0.34313536875225714,
            0.3551979645810762
          ]
        },
        "pass2": {
          "collapse": 0.23766666666666666,
          "spread": 0.14566666666666667,
          "delta": 0.092,
          "paired95": [
            0.08724716479186792,
            0.09675283520813208
          ]
        },
        "played3": {
          "collapse": 1.1957916666666666,
          "spread": 0.6992916666666666,
          "delta": 0.4965,
          "paired95": [
            0.4896976053655533,
            0.5033023946344467
          ]
        },
        "ownLegal": {
          "collapse": 1.08625,
          "spread": 1.2224583333333334,
          "delta": -0.13620833333333332,
          "paired95": [
            -0.14514635137697565,
            -0.127270315289691
          ]
        },
        "ownPass": {
          "collapse": 0.244875,
          "spread": 0.229375,
          "delta": 0.0155,
          "paired95": [
            0.01198708852065973,
            0.01901291147934027
          ]
        },
        "collapseOnlyOwnPass": 1114,
        "spreadOnlyOwnPass": 742
      },
      "strata": {
        "own3": {
          "n": 10858,
          "stones": {
            "collapse": 1.0736783938110148,
            "spread": 1.6841038865352735,
            "delta": -0.6104254927242586,
            "paired95": [
              -0.6225970379792121,
              -0.5982539474693052
            ]
          },
          "doubles": {
            "collapse": 0.19137962792411126,
            "spread": 0.2335605083809173,
            "delta": -0.04218088045680604,
            "paired95": [
              -0.050275526029414645,
              -0.03408623488419744
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.5558113833118438,
            "spread": 0.03960213667342052,
            "delta": 0.5162092466384233,
            "paired95": [
              0.5068089226092231,
              0.5256095706676235
            ]
          },
          "pass2": {
            "collapse": 0.3705102228771413,
            "spread": 0.27629397679130596,
            "delta": 0.09421624608583533,
            "paired95": [
              0.08554259080688538,
              0.10288990136478528
            ]
          },
          "played3": {
            "collapse": 0.8822987658869037,
            "spread": 0.5197089703444465,
            "delta": 0.3625897955424572,
            "paired95": [
              0.35354667235083936,
              0.371632918734075
            ]
          },
          "ownLegal": {
            "collapse": 1.5325105912691104,
            "spread": 1.6103333947319949,
            "delta": -0.0778228034628845,
            "paired95": [
              -0.09037285190701093,
              -0.06527275501875808
            ]
          },
          "ownPass": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "collapseOnlyOwnPass": 0,
          "spreadOnlyOwnPass": 0
        },
        "noOwn3": {
          "n": 13142,
          "stones": {
            "collapse": 1.6453355653629584,
            "spread": 1.946659564754223,
            "delta": -0.30132399939126464,
            "paired95": [
              -0.30916906604885563,
              -0.29347893273367365
            ]
          },
          "doubles": {
            "collapse": 0.19053416527164815,
            "spread": 0.2560493075635368,
            "delta": -0.0655151422918886,
            "paired95": [
              -0.06974571187183888,
              -0.06128457271193831
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.22675391873383047,
            "spread": 0.015598843402830619,
            "delta": 0.21115507533099984,
            "paired95": [
              0.20417695516578996,
              0.21813319549620971
            ]
          },
          "pass2": {
            "collapse": 0.1279105159032111,
            "spread": 0.03774159184294628,
            "delta": 0.0901689240602648,
            "paired95": [
              0.08527169192487143,
              0.09506615619565818
            ]
          },
          "played3": {
            "collapse": 1.4548014000913103,
            "spread": 0.8476639780855273,
            "delta": 0.607137422005783,
            "paired95": [
              0.5976193342668346,
              0.6166555097447315
            ]
          },
          "ownLegal": {
            "collapse": 0.7175467965302085,
            "spread": 0.9019936082788008,
            "delta": -0.1844468117485923,
            "paired95": [
              -0.19699360351317965,
              -0.17190001998400492
            ]
          },
          "ownPass": {
            "collapse": 0.4471922081874905,
            "spread": 0.4188860143052808,
            "delta": 0.02830619388220971,
            "paired95": [
              0.021899047616525072,
              0.034713340147894345
            ]
          },
          "collapseOnlyOwnPass": 1114,
          "spreadOnlyOwnPass": 742
        },
        "opponent3AtLeast2": {
          "n": 13142,
          "stones": {
            "collapse": 1.6453355653629584,
            "spread": 1.946659564754223,
            "delta": -0.30132399939126464,
            "paired95": [
              -0.30916906604885563,
              -0.29347893273367365
            ]
          },
          "doubles": {
            "collapse": 0.19053416527164815,
            "spread": 0.2560493075635368,
            "delta": -0.0655151422918886,
            "paired95": [
              -0.06974571187183888,
              -0.06128457271193831
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.22675391873383047,
            "spread": 0.015598843402830619,
            "delta": 0.21115507533099984,
            "paired95": [
              0.20417695516578996,
              0.21813319549620971
            ]
          },
          "pass2": {
            "collapse": 0.1279105159032111,
            "spread": 0.03774159184294628,
            "delta": 0.0901689240602648,
            "paired95": [
              0.08527169192487143,
              0.09506615619565818
            ]
          },
          "played3": {
            "collapse": 1.4548014000913103,
            "spread": 0.8476639780855273,
            "delta": 0.607137422005783,
            "paired95": [
              0.5976193342668346,
              0.6166555097447315
            ]
          },
          "ownLegal": {
            "collapse": 0.7175467965302085,
            "spread": 0.9019936082788008,
            "delta": -0.1844468117485923,
            "paired95": [
              -0.19699360351317965,
              -0.17190001998400492
            ]
          },
          "ownPass": {
            "collapse": 0.4471922081874905,
            "spread": 0.4188860143052808,
            "delta": 0.02830619388220971,
            "paired95": [
              0.021899047616525072,
              0.034713340147894345
            ]
          },
          "collapseOnlyOwnPass": 1114,
          "spreadOnlyOwnPass": 742
        },
        "opponent3Under2": {
          "n": 10858,
          "stones": {
            "collapse": 1.0736783938110148,
            "spread": 1.6841038865352735,
            "delta": -0.6104254927242586,
            "paired95": [
              -0.6225970379792121,
              -0.5982539474693052
            ]
          },
          "doubles": {
            "collapse": 0.19137962792411126,
            "spread": 0.2335605083809173,
            "delta": -0.04218088045680604,
            "paired95": [
              -0.050275526029414645,
              -0.03408623488419744
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.5558113833118438,
            "spread": 0.03960213667342052,
            "delta": 0.5162092466384233,
            "paired95": [
              0.5068089226092231,
              0.5256095706676235
            ]
          },
          "pass2": {
            "collapse": 0.3705102228771413,
            "spread": 0.27629397679130596,
            "delta": 0.09421624608583533,
            "paired95": [
              0.08554259080688538,
              0.10288990136478528
            ]
          },
          "played3": {
            "collapse": 0.8822987658869037,
            "spread": 0.5197089703444465,
            "delta": 0.3625897955424572,
            "paired95": [
              0.35354667235083936,
              0.371632918734075
            ]
          },
          "ownLegal": {
            "collapse": 1.5325105912691104,
            "spread": 1.6103333947319949,
            "delta": -0.0778228034628845,
            "paired95": [
              -0.09037285190701093,
              -0.06527275501875808
            ]
          },
          "ownPass": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "collapseOnlyOwnPass": 0,
          "spreadOnlyOwnPass": 0
        }
      }
    },
    "all-current-only/double-first": {
      "cohort1": {
        "n": 12000,
        "stones": {
          "collapse": 1.38725,
          "spread": 1.87175,
          "delta": -0.4845,
          "paired95": [
            -0.49475161674747675,
            -0.4742483832525232
          ]
        },
        "doubles": {
          "collapse": 0.24016666666666667,
          "spread": 0.2728333333333333,
          "delta": -0.03266666666666666,
          "paired95": [
            -0.03969445976007191,
            -0.025638873573261414
          ]
        },
        "extra": {
          "collapse": 0,
          "spread": 0,
          "delta": 0,
          "paired95": [
            0,
            0
          ]
        },
        "pass1": {
          "collapse": 0.375,
          "spread": 0.02575,
          "delta": 0.34925,
          "paired95": [
            0.34071980733273965,
            0.35778019266726035
          ]
        },
        "pass2": {
          "collapse": 0.23775,
          "spread": 0.1025,
          "delta": 0.13525,
          "paired95": [
            0.1278734442009645,
            0.14262655579903552
          ]
        },
        "played3": {
          "collapse": 1.1470833333333332,
          "spread": 0.8325,
          "delta": 0.3145833333333333,
          "paired95": [
            0.305806254455643,
            0.32336041221102363
          ]
        },
        "ownLegal": {
          "collapse": 1.1493333333333333,
          "spread": 1.36625,
          "delta": -0.21691666666666667,
          "paired95": [
            -0.2326384125287281,
            -0.20119492080460524
          ]
        },
        "ownPass": {
          "collapse": 0.213,
          "spread": 0.19991666666666666,
          "delta": 0.013083333333333334,
          "paired95": [
            0.006831552892169727,
            0.01933511377449694
          ]
        },
        "collapseOnlyOwnPass": 812,
        "spreadOnlyOwnPass": 655
      },
      "cohort2": {
        "n": 12000,
        "stones": {
          "collapse": 1.3856666666666666,
          "spread": 1.86825,
          "delta": -0.4825833333333333,
          "paired95": [
            -0.4929323973991042,
            -0.4722342692675624
          ]
        },
        "doubles": {
          "collapse": 0.245,
          "spread": 0.2669166666666667,
          "delta": -0.021916666666666668,
          "paired95": [
            -0.028891187172239867,
            -0.01494214616109347
          ]
        },
        "extra": {
          "collapse": 0,
          "spread": 0,
          "delta": 0,
          "paired95": [
            0,
            0
          ]
        },
        "pass1": {
          "collapse": 0.37625,
          "spread": 0.027166666666666665,
          "delta": 0.34908333333333336,
          "paired95": [
            0.34055408424525024,
            0.35761258242141647
          ]
        },
        "pass2": {
          "collapse": 0.23808333333333334,
          "spread": 0.10458333333333333,
          "delta": 0.1335,
          "paired95": [
            0.12603242001967319,
            0.14096757998032683
          ]
        },
        "played3": {
          "collapse": 1.1406666666666667,
          "spread": 0.8379166666666666,
          "delta": 0.30275,
          "paired95": [
            0.29406511209447717,
            0.3114348879055229
          ]
        },
        "ownLegal": {
          "collapse": 1.1443333333333334,
          "spread": 1.3666666666666667,
          "delta": -0.22233333333333333,
          "paired95": [
            -0.23822592990614705,
            -0.2064407367605196
          ]
        },
        "ownPass": {
          "collapse": 0.21633333333333332,
          "spread": 0.20941666666666667,
          "delta": 0.0069166666666666664,
          "paired95": [
            0.0006532039589771128,
            0.01318012937435622
          ]
        },
        "collapseOnlyOwnPass": 777,
        "spreadOnlyOwnPass": 694
      },
      "overall": {
        "n": 24000,
        "stones": {
          "collapse": 1.3864583333333333,
          "spread": 1.87,
          "delta": -0.48354166666666665,
          "paired95": [
            -0.4908250470466449,
            -0.47625828628668837
          ]
        },
        "doubles": {
          "collapse": 0.24258333333333335,
          "spread": 0.269875,
          "delta": -0.027291666666666665,
          "paired95": [
            -0.03224263186571948,
            -0.022340701467613844
          ]
        },
        "extra": {
          "collapse": 0,
          "spread": 0,
          "delta": 0,
          "paired95": [
            0,
            0
          ]
        },
        "pass1": {
          "collapse": 0.375625,
          "spread": 0.026458333333333334,
          "delta": 0.3491666666666667,
          "paired95": [
            0.34313536875225714,
            0.3551979645810762
          ]
        },
        "pass2": {
          "collapse": 0.23791666666666667,
          "spread": 0.10354166666666667,
          "delta": 0.134375,
          "paired95": [
            0.12912680446513713,
            0.13962319553486285
          ]
        },
        "played3": {
          "collapse": 1.143875,
          "spread": 0.8352083333333333,
          "delta": 0.30866666666666664,
          "paired95": [
            0.30249251787265075,
            0.31484081546068254
          ]
        },
        "ownLegal": {
          "collapse": 1.1468333333333334,
          "spread": 1.3664583333333333,
          "delta": -0.219625,
          "paired95": [
            -0.2308023408250349,
            -0.20844765917496508
          ]
        },
        "ownPass": {
          "collapse": 0.21466666666666667,
          "spread": 0.20466666666666666,
          "delta": 0.01,
          "paired95": [
            0.0055751116478126,
            0.014424888352187401
          ]
        },
        "collapseOnlyOwnPass": 1589,
        "spreadOnlyOwnPass": 1349
      },
      "strata": {
        "own3": {
          "n": 10858,
          "stones": {
            "collapse": 1.0736783938110148,
            "spread": 1.7390863879167435,
            "delta": -0.6654079941057285,
            "paired95": [
              -0.6773516065323912,
              -0.6534643816790657
            ]
          },
          "doubles": {
            "collapse": 0.19137962792411126,
            "spread": 0.25916375023024496,
            "delta": -0.06778412230613373,
            "paired95": [
              -0.07590575574294002,
              -0.059662488869327436
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.5558113833118438,
            "spread": 0.03960213667342052,
            "delta": 0.5162092466384233,
            "paired95": [
              0.5068089226092231,
              0.5256095706676235
            ]
          },
          "pass2": {
            "collapse": 0.3705102228771413,
            "spread": 0.22131147540983606,
            "delta": 0.14919874746730521,
            "paired95": [
              0.13979036545246037,
              0.15860712948215006
            ]
          },
          "played3": {
            "collapse": 0.8822987658869037,
            "spread": 0.6169644501749861,
            "delta": 0.26533431571191746,
            "paired95": [
              0.2570292563635461,
              0.2736393750602888
            ]
          },
          "ownLegal": {
            "collapse": 1.5325105912691104,
            "spread": 1.691932215877694,
            "delta": -0.15942162460858353,
            "paired95": [
              -0.17308767437283193,
              -0.14575557484433513
            ]
          },
          "ownPass": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "collapseOnlyOwnPass": 0,
          "spreadOnlyOwnPass": 0
        },
        "noOwn3": {
          "n": 13142,
          "stones": {
            "collapse": 1.6448790138487293,
            "spread": 1.9781616192360372,
            "delta": -0.33328260538730786,
            "paired95": [
              -0.34134230917000763,
              -0.3252229016046081
            ]
          },
          "doubles": {
            "collapse": 0.28488814487901387,
            "spread": 0.2787246994369198,
            "delta": 0.00616344544209405,
            "paired95": [
              0.00016321974965966424,
              0.012163671134528434
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.22675391873383047,
            "spread": 0.015598843402830619,
            "delta": 0.21115507533099984,
            "paired95": [
              0.20417695516578996,
              0.21813319549620971
            ]
          },
          "pass2": {
            "collapse": 0.12836706741744028,
            "spread": 0.006239537361132248,
            "delta": 0.12212753005630803,
            "paired95": [
              0.11652912437919472,
              0.12772593573342134
            ]
          },
          "played3": {
            "collapse": 1.3599908689697153,
            "spread": 1.0155227514837923,
            "delta": 0.344468117485923,
            "paired95": [
              0.3355672309153864,
              0.35336900405645955
            ]
          },
          "ownLegal": {
            "collapse": 0.8281844468117486,
            "spread": 1.09754984020697,
            "delta": -0.2693653933952214,
            "paired95": [
              -0.28632377109442686,
              -0.252407015696016
            ]
          },
          "ownPass": {
            "collapse": 0.39202556688479684,
            "spread": 0.37376350631562927,
            "delta": 0.018262060569167553,
            "paired95": [
              0.010183893200630664,
              0.026340227937704443
            ]
          },
          "collapseOnlyOwnPass": 1589,
          "spreadOnlyOwnPass": 1349
        },
        "opponent3AtLeast2": {
          "n": 13142,
          "stones": {
            "collapse": 1.6448790138487293,
            "spread": 1.9781616192360372,
            "delta": -0.33328260538730786,
            "paired95": [
              -0.34134230917000763,
              -0.3252229016046081
            ]
          },
          "doubles": {
            "collapse": 0.28488814487901387,
            "spread": 0.2787246994369198,
            "delta": 0.00616344544209405,
            "paired95": [
              0.00016321974965966424,
              0.012163671134528434
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.22675391873383047,
            "spread": 0.015598843402830619,
            "delta": 0.21115507533099984,
            "paired95": [
              0.20417695516578996,
              0.21813319549620971
            ]
          },
          "pass2": {
            "collapse": 0.12836706741744028,
            "spread": 0.006239537361132248,
            "delta": 0.12212753005630803,
            "paired95": [
              0.11652912437919472,
              0.12772593573342134
            ]
          },
          "played3": {
            "collapse": 1.3599908689697153,
            "spread": 1.0155227514837923,
            "delta": 0.344468117485923,
            "paired95": [
              0.3355672309153864,
              0.35336900405645955
            ]
          },
          "ownLegal": {
            "collapse": 0.8281844468117486,
            "spread": 1.09754984020697,
            "delta": -0.2693653933952214,
            "paired95": [
              -0.28632377109442686,
              -0.252407015696016
            ]
          },
          "ownPass": {
            "collapse": 0.39202556688479684,
            "spread": 0.37376350631562927,
            "delta": 0.018262060569167553,
            "paired95": [
              0.010183893200630664,
              0.026340227937704443
            ]
          },
          "collapseOnlyOwnPass": 1589,
          "spreadOnlyOwnPass": 1349
        },
        "opponent3Under2": {
          "n": 10858,
          "stones": {
            "collapse": 1.0736783938110148,
            "spread": 1.7390863879167435,
            "delta": -0.6654079941057285,
            "paired95": [
              -0.6773516065323912,
              -0.6534643816790657
            ]
          },
          "doubles": {
            "collapse": 0.19137962792411126,
            "spread": 0.25916375023024496,
            "delta": -0.06778412230613373,
            "paired95": [
              -0.07590575574294002,
              -0.059662488869327436
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.5558113833118438,
            "spread": 0.03960213667342052,
            "delta": 0.5162092466384233,
            "paired95": [
              0.5068089226092231,
              0.5256095706676235
            ]
          },
          "pass2": {
            "collapse": 0.3705102228771413,
            "spread": 0.22131147540983606,
            "delta": 0.14919874746730521,
            "paired95": [
              0.13979036545246037,
              0.15860712948215006
            ]
          },
          "played3": {
            "collapse": 0.8822987658869037,
            "spread": 0.6169644501749861,
            "delta": 0.26533431571191746,
            "paired95": [
              0.2570292563635461,
              0.2736393750602888
            ]
          },
          "ownLegal": {
            "collapse": 1.5325105912691104,
            "spread": 1.691932215877694,
            "delta": -0.15942162460858353,
            "paired95": [
              -0.17308767437283193,
              -0.14575557484433513
            ]
          },
          "ownPass": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "collapseOnlyOwnPass": 0,
          "spreadOnlyOwnPass": 0
        }
      }
    },
    "all-current-only/oracle-deny": {
      "cohort1": {
        "n": 12000,
        "stones": {
          "collapse": 1.4043333333333334,
          "spread": 1.76,
          "delta": -0.3556666666666667,
          "paired95": [
            -0.36703027510258585,
            -0.3443030582307475
          ]
        },
        "doubles": {
          "collapse": 0.16883333333333334,
          "spread": 0.08616666666666667,
          "delta": 0.08266666666666667,
          "paired95": [
            0.07542792507098485,
            0.08990540826234848
          ]
        },
        "extra": {
          "collapse": 0,
          "spread": 0,
          "delta": 0,
          "paired95": [
            0,
            0
          ]
        },
        "pass1": {
          "collapse": 0.375,
          "spread": 0.02575,
          "delta": 0.34925,
          "paired95": [
            0.34071980733273965,
            0.35778019266726035
          ]
        },
        "pass2": {
          "collapse": 0.22066666666666668,
          "spread": 0.21425,
          "delta": 0.006416666666666667,
          "paired95": [
            -0.0006287786651823267,
            0.013462111998515661
          ]
        },
        "played3": {
          "collapse": 1.2355,
          "spread": 0.6816666666666666,
          "delta": 0.5538333333333333,
          "paired95": [
            0.5448463243319733,
            0.5628203423346932
          ]
        },
        "ownLegal": {
          "collapse": 0.98125,
          "spread": 0.7215833333333334,
          "delta": 0.25966666666666666,
          "paired95": [
            0.24799626956548743,
            0.2713370637678459
          ]
        },
        "ownPass": {
          "collapse": 0.32216666666666666,
          "spread": 0.43033333333333335,
          "delta": -0.10816666666666666,
          "paired95": [
            -0.11430790763877241,
            -0.10202542569456091
          ]
        },
        "collapseOnlyOwnPass": 128,
        "spreadOnlyOwnPass": 1426
      },
      "cohort2": {
        "n": 12000,
        "stones": {
          "collapse": 1.39975,
          "spread": 1.7650833333333333,
          "delta": -0.36533333333333334,
          "paired95": [
            -0.37663144061478104,
            -0.35403522605188564
          ]
        },
        "doubles": {
          "collapse": 0.17116666666666666,
          "spread": 0.09225,
          "delta": 0.07891666666666666,
          "paired95": [
            0.07177389012098248,
            0.08605944321235084
          ]
        },
        "extra": {
          "collapse": 0,
          "spread": 0,
          "delta": 0,
          "paired95": [
            0,
            0
          ]
        },
        "pass1": {
          "collapse": 0.37625,
          "spread": 0.027166666666666665,
          "delta": 0.34908333333333336,
          "paired95": [
            0.34055408424525024,
            0.35761258242141647
          ]
        },
        "pass2": {
          "collapse": 0.224,
          "spread": 0.20775,
          "delta": 0.01625,
          "paired95": [
            0.009183143568035873,
            0.023316856431964128
          ]
        },
        "played3": {
          "collapse": 1.2285833333333334,
          "spread": 0.6805833333333333,
          "delta": 0.548,
          "paired95": [
            0.5390172546111633,
            0.5569827453888367
          ]
        },
        "ownLegal": {
          "collapse": 0.977,
          "spread": 0.7265,
          "delta": 0.2505,
          "paired95": [
            0.23903008258794534,
            0.26196991741205466
          ]
        },
        "ownPass": {
          "collapse": 0.32458333333333333,
          "spread": 0.4310833333333333,
          "delta": -0.1065,
          "paired95": [
            -0.11259390734969618,
            -0.10040609265030381
          ]
        },
        "collapseOnlyOwnPass": 125,
        "spreadOnlyOwnPass": 1403
      },
      "overall": {
        "n": 24000,
        "stones": {
          "collapse": 1.4020416666666666,
          "spread": 1.7625416666666667,
          "delta": -0.3605,
          "paired95": [
            -0.3685122263327447,
            -0.35248777366725526
          ]
        },
        "doubles": {
          "collapse": 0.17,
          "spread": 0.08920833333333333,
          "delta": 0.08079166666666666,
          "paired95": [
            0.07570696956623427,
            0.08587636376709906
          ]
        },
        "extra": {
          "collapse": 0,
          "spread": 0,
          "delta": 0,
          "paired95": [
            0,
            0
          ]
        },
        "pass1": {
          "collapse": 0.375625,
          "spread": 0.026458333333333334,
          "delta": 0.3491666666666667,
          "paired95": [
            0.34313536875225714,
            0.3551979645810762
          ]
        },
        "pass2": {
          "collapse": 0.22233333333333333,
          "spread": 0.211,
          "delta": 0.011333333333333334,
          "paired95": [
            0.006343591639906674,
            0.016323075026759996
          ]
        },
        "played3": {
          "collapse": 1.2320416666666667,
          "spread": 0.681125,
          "delta": 0.5509166666666667,
          "paired95": [
            0.5445634240922884,
            0.557269909241045
          ]
        },
        "ownLegal": {
          "collapse": 0.979125,
          "spread": 0.7240416666666667,
          "delta": 0.25508333333333333,
          "paired95": [
            0.24690165460076918,
            0.2632650120658975
          ]
        },
        "ownPass": {
          "collapse": 0.323375,
          "spread": 0.43070833333333336,
          "delta": -0.10733333333333334,
          "paired95": [
            -0.11165906660092959,
            -0.10300760006573709
          ]
        },
        "collapseOnlyOwnPass": 253,
        "spreadOnlyOwnPass": 2829
      },
      "strata": {
        "own3": {
          "n": 10858,
          "stones": {
            "collapse": 1.0736783938110148,
            "spread": 1.6256216614477805,
            "delta": -0.5519432676367655,
            "paired95": [
              -0.5651264521862636,
              -0.5387600830872674
            ]
          },
          "doubles": {
            "collapse": 0.19137962792411126,
            "spread": 0.13234481488303554,
            "delta": 0.059034813041075704,
            "paired95": [
              0.05027416322587016,
              0.06779546285628124
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.5558113833118438,
            "spread": 0.03960213667342052,
            "delta": 0.5162092466384233,
            "paired95": [
              0.5068089226092231,
              0.5256095706676235
            ]
          },
          "pass2": {
            "collapse": 0.3705102228771413,
            "spread": 0.33477620187879903,
            "delta": 0.035734020998342234,
            "paired95": [
              0.026901176805756086,
              0.04456686519092838
            ]
          },
          "played3": {
            "collapse": 0.8822987658869037,
            "spread": 0.4994474120464174,
            "delta": 0.3828513538404863,
            "paired95": [
              0.3737078819025431,
              0.3919948257784295
            ]
          },
          "ownLegal": {
            "collapse": 1.5325105912691104,
            "spread": 1.3203168170933874,
            "delta": 0.21219377417572297,
            "paired95": [
              0.20015818729000073,
              0.2242293610614452
            ]
          },
          "ownPass": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "collapseOnlyOwnPass": 0,
          "spreadOnlyOwnPass": 0
        },
        "noOwn3": {
          "n": 13142,
          "stones": {
            "collapse": 1.6733373915690153,
            "spread": 1.8756658042915841,
            "delta": -0.20232841272256885,
            "paired95": [
              -0.21123356668372711,
              -0.1934232587614106
            ]
          },
          "doubles": {
            "collapse": 0.15233602191447268,
            "spread": 0.05356871100289149,
            "delta": 0.0987673109115812,
            "paired95": [
              0.09296824149844073,
              0.10456638032472167
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.22675391873383047,
            "spread": 0.015598843402830619,
            "delta": 0.21115507533099984,
            "paired95": [
              0.20417695516578996,
              0.21813319549620971
            ]
          },
          "pass2": {
            "collapse": 0.09990868969715416,
            "spread": 0.10873535230558515,
            "delta": -0.008826662608430985,
            "paired95": [
              -0.014259699874069214,
              -0.003393625342792757
            ]
          },
          "played3": {
            "collapse": 1.5210013696545426,
            "spread": 0.8312281235732765,
            "delta": 0.6897732460812662,
            "paired95": [
              0.6817052896323257,
              0.6978412025302068
            ]
          },
          "ownLegal": {
            "collapse": 0.5219144726830011,
            "spread": 0.23139552579516057,
            "delta": 0.2905189468878405,
            "paired95": [
              0.27940302993894306,
              0.301634863836738
            ]
          },
          "ownPass": {
            "collapse": 0.5905493836554558,
            "spread": 0.7865621670978542,
            "delta": -0.19601278344239842,
            "paired95": [
              -0.20358415100406452,
              -0.18844141588073232
            ]
          },
          "collapseOnlyOwnPass": 253,
          "spreadOnlyOwnPass": 2829
        },
        "opponent3AtLeast2": {
          "n": 13142,
          "stones": {
            "collapse": 1.6733373915690153,
            "spread": 1.8756658042915841,
            "delta": -0.20232841272256885,
            "paired95": [
              -0.21123356668372711,
              -0.1934232587614106
            ]
          },
          "doubles": {
            "collapse": 0.15233602191447268,
            "spread": 0.05356871100289149,
            "delta": 0.0987673109115812,
            "paired95": [
              0.09296824149844073,
              0.10456638032472167
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.22675391873383047,
            "spread": 0.015598843402830619,
            "delta": 0.21115507533099984,
            "paired95": [
              0.20417695516578996,
              0.21813319549620971
            ]
          },
          "pass2": {
            "collapse": 0.09990868969715416,
            "spread": 0.10873535230558515,
            "delta": -0.008826662608430985,
            "paired95": [
              -0.014259699874069214,
              -0.003393625342792757
            ]
          },
          "played3": {
            "collapse": 1.5210013696545426,
            "spread": 0.8312281235732765,
            "delta": 0.6897732460812662,
            "paired95": [
              0.6817052896323257,
              0.6978412025302068
            ]
          },
          "ownLegal": {
            "collapse": 0.5219144726830011,
            "spread": 0.23139552579516057,
            "delta": 0.2905189468878405,
            "paired95": [
              0.27940302993894306,
              0.301634863836738
            ]
          },
          "ownPass": {
            "collapse": 0.5905493836554558,
            "spread": 0.7865621670978542,
            "delta": -0.19601278344239842,
            "paired95": [
              -0.20358415100406452,
              -0.18844141588073232
            ]
          },
          "collapseOnlyOwnPass": 253,
          "spreadOnlyOwnPass": 2829
        },
        "opponent3Under2": {
          "n": 10858,
          "stones": {
            "collapse": 1.0736783938110148,
            "spread": 1.6256216614477805,
            "delta": -0.5519432676367655,
            "paired95": [
              -0.5651264521862636,
              -0.5387600830872674
            ]
          },
          "doubles": {
            "collapse": 0.19137962792411126,
            "spread": 0.13234481488303554,
            "delta": 0.059034813041075704,
            "paired95": [
              0.05027416322587016,
              0.06779546285628124
            ]
          },
          "extra": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "pass1": {
            "collapse": 0.5558113833118438,
            "spread": 0.03960213667342052,
            "delta": 0.5162092466384233,
            "paired95": [
              0.5068089226092231,
              0.5256095706676235
            ]
          },
          "pass2": {
            "collapse": 0.3705102228771413,
            "spread": 0.33477620187879903,
            "delta": 0.035734020998342234,
            "paired95": [
              0.026901176805756086,
              0.04456686519092838
            ]
          },
          "played3": {
            "collapse": 0.8822987658869037,
            "spread": 0.4994474120464174,
            "delta": 0.3828513538404863,
            "paired95": [
              0.3737078819025431,
              0.3919948257784295
            ]
          },
          "ownLegal": {
            "collapse": 1.5325105912691104,
            "spread": 1.3203168170933874,
            "delta": 0.21219377417572297,
            "paired95": [
              0.20015818729000073,
              0.2242293610614452
            ]
          },
          "ownPass": {
            "collapse": 0,
            "spread": 0,
            "delta": 0,
            "paired95": [
              0,
              0
            ]
          },
          "collapseOnlyOwnPass": 0,
          "spreadOnlyOwnPass": 0
        }
      }
    }
  },
  "limitations": [
    "Synthetic public history; branch unlock semantics unresolved",
    "Oracle-deny sees focal private hand and is only an adversarial bound",
    "Uniform unknown hands not conditioned on prior choices",
    "No complete game win rate, minus, block winner/tie, loneZero, bust or 101 scoring"
  ],
  "nextAction": "Use a separate physically plausible multi-double-rich trace for chain stress tests; authenticate late-arrival branch locks and block ties; examine focal 3-connector counterexamples before any win claims."
};
if(typeof module!=='undefined')module.exports={run,selfTest,world,simulate,CHECKPOINT};
if(typeof require!=='undefined'&&require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?selfTest():run(+(a[0]||2749200),+(a[1]||12000),+(a[2]||12000)),null,2));}
