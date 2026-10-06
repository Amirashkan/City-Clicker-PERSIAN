function mulberry32(seed){
  let t=Math.floor(seed*0xffffffff);
  return()=>{t+=0x6D2B79F5;let r=Math.imul(t^t>>>15,1|t);r^=r+Math.imul(r^r>>>7,61|r);return((r^r>>>14)>>>0)/4294967296};
}

function pick(rand,values){return values[Math.floor(rand()*values.length)]}
function range(rand,min,max){return min+rand()*(max-min)}

// Every building gets a deterministic visual identity from its seed. The
// geometry stays inside the tile, while proportions/details vary by archetype.
export function generateBuilding(type,{x,y,seed=.42,level=1}={}){
  const rand=mulberry32(seed);
  const base={x,y,seed,level,w:range(rand,.70,.84),d:range(rand,.70,.84),h:range(rand,28,42)};

  if(type==='house'){
    const floors=pick(rand,[1,1,1,2]);
    return {...base,
      w:range(rand,.70,.82),d:range(rand,.70,.82),h:28+floors*10+range(rand,0,7),
      floors,roof:pick(rand,['flat','gable','gable']),wall:pick(rand,['brick','stucco','stone']),
      windows:pick(rand,[2,2,3,4]),balcony:rand()>.52,tank:rand()>.42,
      awning:rand()>.62,antenna:rand()>.78
    };
  }
  if(type==='shop'){
    return {...base,w:range(rand,.74,.88),d:range(rand,.70,.84),h:range(rand,26,38),
      facade:pick(rand,['warm','cream','dark']),windows:pick(rand,[2,3,4]),
      awning:rand()>.35,signStyle:pick(rand,['wide','wide','compact']),upperFloor:rand()>.72};
  }
  if(type==='bakery'){
    return {...base,w:range(rand,.76,.88),d:range(rand,.72,.84),h:range(rand,29,40),
      facade:pick(rand,['cream','terracotta','cream']),windows:pick(rand,[2,3]),
      awning:true,chimney:rand()>.45,ovenGlow:rand()>.5};
  }
  if(type==='workshop'){
    return {...base,w:range(rand,.76,.90),d:range(rand,.74,.88),h:range(rand,25,36),
      facade:pick(rand,['metal','concrete','metal']),windows:pick(rand,[2,2,3]),
      roof:pick(rand,['shed','flat']),vent:rand()>.35,doorSide:pick(rand,['left','right','center']),
      stack:rand()>.7};
  }
  if(type==='park'){
    return {...base,w:range(rand,.76,.90),d:range(rand,.76,.90),h:0,
      trees:pick(rand,[1,2,2,3]),bench:rand()>.3,path:rand()>.4,fountain:rand()>.8};
  }
  if(type==='farm'){
    return {...base,w:range(rand,.76,.92),d:range(rand,.76,.92),h:0,
      rows:pick(rand,[3,4,4,5]),shed:rand()>.55,tree:rand()>.45,fence:rand()>.4};
  }
  return base;
}
