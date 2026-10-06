function distance(a,b){return Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y))}
const LEVELS={1:{multiplier:1,radius:2},2:{multiplier:1.5,radius:2},3:{multiplier:2,radius:3}};
export function getLevelStats(level=1){return LEVELS[Math.max(1,Math.min(3,level))]||LEVELS[1];}
const AGE_LEVELS=[{level:1,after:0,multiplier:1},{level:2,after:120,multiplier:1.1},{level:3,after:300,multiplier:1.2},{level:4,after:600,multiplier:1.35},{level:5,after:1200,multiplier:1.5}];
export function getAgeLevel(building,now=Date.now()){
const seconds=Math.max(0,(now-(building.builtAt||now))/1000);
let current=AGE_LEVELS[0];for(const item of AGE_LEVELS){if(seconds>=item.after)current=item;else break;}return current;}
export function getAgeStats(building,now=Date.now()){return getAgeLevel(building,now)}
function effectMultiplier(building){return getLevelStats(building.level||1).multiplier*getAgeLevel(building).multiplier}
function nearbyFrom(target,buildings,type){return buildings.filter(source=>source!==target&&(!type||source.type===type)&&distance(target,source)<=getLevelStats(source.level||1).radius);}
function totalInfluence(buildings){return buildings.reduce((sum,b)=>sum+effectMultiplier(b),0);}
function fmt(value){return Number.isInteger(value)?String(value):Number(value.toFixed(2)).toString();}

export function evaluateBuilding(building,buildings){
  const upgradeMultiplier=getLevelStats(building.level||1).multiplier,ageStats=getAgeLevel(building),multiplier=upgradeMultiplier*ageStats.multiplier,effectRadius=getLevelStats(building.level||1).radius;
  let auto=0,click=0; const received=[],provided=[];
  const homes=nearbyFrom(building,buildings,'house'),shops=nearbyFrom(building,buildings,'shop'),bakeries=nearbyFrom(building,buildings,'bakery'),parks=nearbyFrom(building,buildings,'park'),farms=nearbyFrom(building,buildings,'farm'),workshops=nearbyFrom(building,buildings,'workshop');
  const homePower=totalInfluence(homes),shopPower=totalInfluence(shops),bakeryPower=totalInfluence(bakeries),parkPower=totalInfluence(parks),farmPower=totalInfluence(farms),workshopPower=totalInfluence(workshops);
  switch(building.type){
    case 'house':
      auto=1*multiplier;
      if(shopPower){auto+=shopPower*.5;received.push('مغازه‌های اطراف: +'+fmt(shopPower*.5)+' درآمد')}
      if(bakeryPower){auto+=bakeryPower*.75;received.push('نانوایی‌های اطراف: +'+fmt(bakeryPower*.75)+' درآمد')}
      if(parkPower){auto+=parkPower*.5;received.push('پارک‌های اطراف: +'+fmt(parkPower*.5)+' درآمد')}
      if(farmPower+workshopPower){const nuisance=farmPower+workshopPower;auto=Math.max(0,auto-nuisance);received.push('مزاحمت تولید اطراف: -'+fmt(nuisance)+' درآمد')}
      break;
    case 'shop':
      auto=1*multiplier;
      if(homePower){auto+=homePower*.25;provided.push('به '+homes.length+' خانه مشتری می‌دهد: +'+fmt(homePower*.25)+' درآمد برای خانه‌ها')}
      break;
    case 'bakery':
      auto=1.5*multiplier;
      if(homePower){auto+=homePower*.25;provided.push('به '+homes.length+' خانه خدمات می‌دهد: +'+fmt(homePower*.25)+' درآمد برای خانه‌ها')}
      if(farmPower){auto+=farmPower*.5;received.push('از '+farms.length+' مزرعه مواد می‌گیرد: +'+fmt(farmPower*.5)+' تولید')}
      if(shopPower){auto+=shopPower*.25;received.push('از '+shops.length+' مغازه مشتری می‌گیرد: +'+fmt(shopPower*.25)+' درآمد')}
      break;
    case 'park':
      auto=.5*multiplier;click=1*multiplier;
      if(homePower){auto+=homePower*.25;provided.push('به '+homes.length+' خانه رفاه می‌دهد: +'+fmt(homePower*.25)+' درآمد برای خانه‌ها')}
      break;
    case 'workshop':
      click=3*multiplier;
      if(farmPower){click+=farmPower*.75;received.push('با '+farms.length+' مزرعه همکاری می‌کند: +'+fmt(farmPower*.75)+' لمس')}
      if(homePower){provided.push('برای '+homes.length+' خانه مزاحمت ایجاد می‌کند: -'+fmt(homePower*multiplier)+' درآمد برای خانه‌ها')}
      break;
    case 'farm':
      click=2*multiplier;
      if(workshopPower){click+=workshopPower*.75;received.push('با '+workshops.length+' کارگاه همکاری می‌کند: +'+fmt(workshopPower*.75)+' لمس')}
      if(bakeryPower){click+=bakeryPower*.5;received.push('به '+bakeries.length+' نانوایی مواد می‌دهد: +'+fmt(bakeryPower*.5)+' لمس')}
      if(homePower){provided.push('برای '+homes.length+' خانه مزاحمت ایجاد می‌کند: -'+fmt(homePower*multiplier)+' درآمد برای خانه‌ها')}
      break;
  }
  return {autoClick:auto,clickValue:click,received,provided,effectRadius,effectMultiplier:multiplier};
}
export function calculateEconomy(buildings){
  let auto=0,click=1;
  for(const building of buildings){const result=evaluateBuilding(building,buildings);auto+=result.autoClick;click+=result.clickValue;}
  return {autoClick:Math.max(0,auto),clickValue:click,productionPenalty:0};
}