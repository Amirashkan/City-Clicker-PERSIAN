import{generateBuilding}from'./generator.js';

export const BUILDINGS={
  house:{type:'house',name:'خانه',cost:100,generate:(p)=>generateBuilding('house',p),economy:{residential:1}},
  shop:{type:'shop',name:'مغازه',cost:220,generate:(p)=>generateBuilding('shop',p),economy:{urban:2}},
  bakery:{type:'bakery',name:'نانوایی',cost:350,generate:(p)=>generateBuilding('bakery',p),economy:{urban:3}},
  park:{type:'park',name:'پارک',cost:180,generate:(p)=>generateBuilding('park',p),economy:{urban:1,click:1}},
  workshop:{type:'workshop',name:'کارگاه',cost:450,generate:(p)=>generateBuilding('workshop',p),economy:{click:3,production:true}},
  farm:{type:'farm',name:'باغ/مزرعه',cost:300,generate:(p)=>generateBuilding('farm',p),economy:{click:2,production:true}}
};

const UPGRADE_FACTORS=[.75,1.5];
export function getUpgradeCost(type,currentLevel=1){
  const def=BUILDINGS[type];
  if(!def||currentLevel>=3)return null;
  return Math.ceil(def.cost*UPGRADE_FACTORS[currentLevel-1]);
}
export function createBuilding(type,position){
  const def=BUILDINGS[type];
  if(!def)throw new Error('Unknown building type: '+type);
  const seed=Math.random();
  return{id:crypto.randomUUID(),type,...def.generate({...position,seed}),...def.economy,builtAt:Date.now()};
}
