const PEOPLE_COUNT=12;
const CARS_COUNT=5;

function candidates(buildings,types){
  return buildings.filter(b=>types.includes(b.type)).map(b=>({x:b.x+.5,y:b.y+.5}));
}

function buildRoute(from,to){
  const dx=Math.abs(from.x-to.x),dy=Math.abs(from.y-to.y);
  // When buildings touch or are directly adjacent, walk straight through the
  // shared edge instead of making an artificial L-shaped detour.
  if(dx<=1.01 && dy<=1.01){
    const sharedX=Math.abs(from.x-to.x)<=1.01;
    const ox=(Math.random()-.5)*.18,oy=(Math.random()-.5)*.18;
    if(sharedX){
      const y=(from.y+to.y)/2+oy;
      return [{x:from.x,y},{x:to.x,y}];
    }
    const x=(from.x+to.x)/2+ox;
    return [{x,y:from.y},{x,y:to.y}];
  }

  const ox=(Math.random()-.5)*.32,oy=(Math.random()-.5)*.32;
  const x1=from.x+ox,y1=from.y+oy,x2=to.x+ox,y2=to.y+oy;
  return [{x:x1,y:y1},{x:x2,y:y1},{x:x2,y:y2}];
}

function routeLength(route){
  let n=0;
  for(let i=1;i<route.length;i++)n+=Math.hypot(route[i].x-route[i-1].x,route[i].y-route[i-1].y);
  return n;
}
function routePoint(route,t){
  const total=route._length||(route._length=routeLength(route));
  let d=Math.max(0,Math.min(1,t))*total;
  for(let i=1;i<route.length;i++){
    const a=route[i-1],b=route[i],len=Math.hypot(b.x-a.x,b.y-a.y);
    if(d<=len){const k=len?d/len:0;return {x:a.x+(b.x-a.x)*k,y:a.y+(b.y-a.y)*k};}
    d-=len;
  }
  return route[route.length-1];
}

function makePeople(buildings){
  const homes=candidates(buildings,['house']);
  const destinations=candidates(buildings,['shop','bakery','workshop','park']);
  if(!homes.length||!destinations.length)return [];
  const routes=[];
  for(let i=0;i<PEOPLE_COUNT;i++){
    const toHome=i%2===1;
    const from=toHome?destinations[(i*2+1)%destinations.length]:homes[i%homes.length];
    const to=toHome?homes[(i+1)%homes.length]:destinations[(i*2+1)%destinations.length];
    routes.push({route:buildRoute(from,to),t:(i*.17)%1,speed:.000035+(i%4)*.000006,wait:0,active:true});
  }
  return routes;
}

function makeCars(buildings){
  const places=candidates(buildings,['house','shop','bakery','workshop']);
  if(places.length<2)return [];
  return Array.from({length:Math.min(CARS_COUNT,Math.max(2,places.length))},(_,i)=>{
    const from=places[i%places.length],to=places[(i+2)%places.length];
    return {route:buildRoute(from,to),t:(i*.23)%1,speed:.000050+(i%3)*.000008,wait:0,active:true};
  });
}

let people=[],cars=[],signature='',lastTime=performance.now();

function sync(buildings){
  const sig=buildings.map(b=>b.type+':'+b.x+','+b.y).join('|');
  if(sig===signature)return;
  signature=sig;
  people=makePeople(buildings);
  cars=makeCars(buildings);
}

function advance(actor,dt){
  if(!actor.active){
    actor.wait-=dt;
    if(actor.wait<=0){actor.t=0;actor.active=true;}
    return;
  }
  actor.t+=actor.speed*dt;
  if(actor.t>=1){actor.active=false;actor.wait=500+Math.random()*1000;}
}

function drawPerson(ctx,iso,p,now){
  const q=routePoint(p.route,p.t),s=iso.worldToScreen(q.x,q.y);
  ctx.save();
  ctx.translate(s.x,s.y-2);
  ctx.fillStyle='#51483d';
  ctx.beginPath();ctx.arc(0,0,2.2,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function drawCar(ctx,iso,c){
  const q=routePoint(c.route,c.t),s=iso.worldToScreen(q.x,q.y);
  ctx.save();
  ctx.translate(s.x,s.y-2);
  ctx.fillStyle='#51483d';
  ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

export function drawAmbientLife(ctx,iso,now,buildings=[]){
  sync(buildings);
  const dt=Math.min(40,Math.max(0,now-lastTime));lastTime=now;
  for(const p of people){advance(p,dt);if(p.active)drawPerson(ctx,iso,p,now);}
  for(const c of cars){advance(c,dt);if(c.active)drawCar(ctx,iso,c);}
}