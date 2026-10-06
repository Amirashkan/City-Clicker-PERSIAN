function distance(a,b){return Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y))}
function nearby(building,buildings,type,maxDistance=2){return buildings.filter(other=>other!==building&&(!type||other.type===type)&&distance(building,other)<=maxDistance)}

export function evaluateBuilding(building,buildings){
  let auto=0,click=0;
  const received=[],provided=[];

  switch(building.type){
    case 'house':{
      auto=1;
      const shops=nearby(building,buildings,'shop');
      const bakeries=nearby(building,buildings,'bakery');
      const parks=nearby(building,buildings,'park');
      const producers=buildings.filter(b=>b.production&&distance(building,b)<=2);
      if(shops.length){auto+=shops.length*.5;received.push('مغازه‌های اطراف: +'+shops.length*.5+' درآمد')}
      if(bakeries.length){auto+=bakeries.length*.75;received.push('نانوایی‌های اطراف: +'+bakeries.length*.75+' درآمد')}
      if(parks.length){auto+=parks.length*.5;received.push('پارک‌های اطراف: +'+parks.length*.5+' درآمد')}
      let penalty=0;
      for(const p of producers){const d=distance(building,p);penalty+=d<=1?1:.5}
      if(penalty){auto=Math.max(0,auto-penalty);received.push('آلودگی/مزاحمت تولید: -'+penalty+' درآمد')}
      break;
    }
    case 'shop':{
      auto=1;
      const homes=nearby(building,buildings,'house');
      if(homes.length){auto+=homes.length*.25;provided.push('به '+homes.length+' خانه مشتری می‌دهد');}
      break;
    }
    case 'bakery':{
      auto=1.5;
      const homes=nearby(building,buildings,'house');
      const farms=nearby(building,buildings,'farm');
      const shops=nearby(building,buildings,'shop');
      if(homes.length){auto+=homes.length*.25;provided.push('به '+homes.length+' خانه خدمات می‌دهد')}
      if(farms.length){auto+=farms.length*.5;received.push('مزرعه‌های اطراف: +'+farms.length*.5+' تولید')}
      if(shops.length){auto+=shops.length*.25;received.push('مغازه‌های اطراف: +'+shops.length*.25+' درآمد')}
      break;
    }
    case 'park':{
      auto=.5;click=1;
      const homes=nearby(building,buildings,'house');
      if(homes.length){auto+=homes.length*.25;provided.push('به '+homes.length+' خانه رفاه می‌دهد')}
      break;
    }
    case 'workshop':{
      click=3;
      const farms=nearby(building,buildings,'farm');
      if(farms.length){click+=farms.length*.75;provided.push('با '+farms.length+' مزرعه همکاری می‌کند')}
      break;
    }
    case 'farm':{
      click=2;
      const workshops=nearby(building,buildings,'workshop');
      const bakeries=nearby(building,buildings,'bakery');
      if(workshops.length){click+=workshops.length*.75;provided.push('با '+workshops.length+' کارگاه همکاری می‌کند')}
      if(bakeries.length){click+=bakeries.length*.5;provided.push('به '+bakeries.length+' نانوایی مواد می‌دهد')}
      break;
    }
  }
  return {autoClick:auto,clickValue:click,received,provided};
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