function distance(a,b){return Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y))}

const LEVELS={
  1:{multiplier:1,radius:2},
  2:{multiplier:1.5,radius:2},
  3:{multiplier:2,radius:3}
};

export function getLevelStats(level=1){
  return LEVELS[Math.max(1,Math.min(3,level))]||LEVELS[1];
}

function effectMultiplier(building){return getLevelStats(building.level||1).multiplier}
function nearbyFrom(target,buildings,type){
  return buildings.filter(source=>
    source!==target &&
    (!type||source.type===type) &&
    distance(target,source)<=getLevelStats(source.level||1).radius
  );
}
function totalInfluence(buildings){
  return buildings.reduce((sum,b)=>sum+effectMultiplier(b),0);
}
function fmt(value){
  return Number.isInteger(value)?String(value):Number(value.toFixed(2)).toString();
}

export function evaluateBuilding(building,buildings){
  const multiplier=effectMultiplier(building);
  const effectRadius=getLevelStats(building.level||1).radius;
  let auto=0,click=0;
  const received=[],provided=[];

  switch(building.type){
    case 'house':{
      auto=1*multiplier;
      const shops=nearbyFrom(building,buildings,'shop');
      const bakeries=nearbyFrom(building,buildings,'bakery');
      const parks=nearbyFrom(building,buildings,'park');
      const producers=buildings.filter(source=>
        source!==building &&
        source.production &&
        distance(building,source)<=getLevelStats(source.level||1).radius
      );
      const shopPower=totalInfluence(shops);
      const bakeryPower=totalInfluence(bakeries);
      const parkPower=totalInfluence(parks);
      const producerPower=totalInfluence(producers);

      if(shopPower){auto+=shopPower*.5;received.push('مغازه‌های اطراف: +'+fmt(shopPower*.5)+' درآمد')}
      if(bakeryPower){auto+=bakeryPower*.75;received.push('نانوایی‌های اطراف: +'+fmt(bakeryPower*.75)+' درآمد')}
      if(parkPower){auto+=parkPower*.5;received.push('پارک‌های اطراف: +'+fmt(parkPower*.5)+' درآمد')}
      if(producerPower){
        auto=Math.max(0,auto-producerPower);
        received.push('آلودگی/مزاحمت تولید: -'+fmt(producerPower)+' درآمد');
      }
      break;
    }

    case 'shop':{
      auto=1*multiplier;
      const homes=nearbyFrom(building,buildings,'house');
      const homePower=totalInfluence(homes);
      if(homePower){
        auto+=homePower*.25;
        provided.push('به '+homes.length+' خانه مشتری می‌دهد: +'+fmt(homePower*.25)+' درآمد');
      }
      break;
    }

    case 'bakery':{
      auto=1.5*multiplier;
      const homes=nearbyFrom(building,buildings,'house');
      const farms=nearbyFrom(building,buildings,'farm');
      const shops=nearbyFrom(building,buildings,'shop');
      const homePower=totalInfluence(homes);
      const farmPower=totalInfluence(farms);
      const shopPower=totalInfluence(shops);

      if(homePower){
        auto+=homePower*.25;
        provided.push('به '+homes.length+' خانه خدمات می‌دهد: +'+fmt(homePower*.25)+' درآمد');
      }
      if(farmPower){
        auto+=farmPower*.5;
        received.push('مزرعه‌های اطراف: +'+fmt(farmPower*.5)+' تولید');
      }
      if(shopPower){
        auto+=shopPower*.25;
        received.push('مغازه‌های اطراف: +'+fmt(shopPower*.25)+' درآمد');
      }
      break;
    }

    case 'park':{
      auto=.5*multiplier;
      click=1*multiplier;
      const homes=nearbyFrom(building,buildings,'house');
      const homePower=totalInfluence(homes);
      if(homePower){
        auto+=homePower*.25;
        provided.push('به '+homes.length+' خانه رفاه می‌دهد: +'+fmt(homePower*.25)+' درآمد');
      }
      break;
    }

    case 'workshop':{
      click=3*multiplier;
      const farms=nearbyFrom(building,buildings,'farm');
      const farmPower=totalInfluence(farms);
      if(farmPower){
        click+=farmPower*.75;
        provided.push('با '+farms.length+' مزرعه همکاری می‌کند: +'+fmt(farmPower*.75)+' لمس');
      }
      break;
    }

    case 'farm':{
      click=2*multiplier;
      const workshops=nearbyFrom(building,buildings,'workshop');
      const bakeries=nearbyFrom(building,buildings,'bakery');
      const workshopPower=totalInfluence(workshops);
      const bakeryPower=totalInfluence(bakeries);
      if(workshopPower){
        click+=workshopPower*.75;
        provided.push('با '+workshops.length+' کارگاه همکاری می‌کند: +'+fmt(workshopPower*.75)+' لمس');
      }
      if(bakeryPower){
        click+=bakeryPower*.5;
        provided.push('به '+bakeries.length+' نانوایی مواد می‌دهد: +'+fmt(bakeryPower*.5)+' لمس');
      }
      break;
    }
  }

  return {
    autoClick:auto,
    clickValue:click,
    received,
    provided,
    effectRadius,
    effectMultiplier:multiplier
  };
}

export function calculateEconomy(buildings){
  let auto=0,click=1;
  for(const building of buildings){
    const result=evaluateBuilding(building,buildings);
    auto+=result.autoClick;
    click+=result.clickValue;
  }
  return {autoClick:Math.max(0,auto),clickValue:click,productionPenalty:0};
}
