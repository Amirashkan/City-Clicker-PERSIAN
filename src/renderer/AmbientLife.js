const PEOPLE_COUNT=12;
const CARS_COUNT=6;

// Ambient paths live on tile boundaries/intersections rather than cutting through buildings.
// Each route is a small, believable sidewalk/street corridor with an entrance and exit.
const PEOPLE_ROUTES=[
  [{x:-.5,y:2},{x:4,y:2},{x:4,y:6},{x:9,y:6},{x:9,y:10},{x:15.5,y:10}],
  [{x:15.5,y:4},{x:11,y:4},{x:11,y:8},{x:6,y:8},{x:6,y:12},{x:-.5,y:12}],
  [{x:2,y:-.5},{x:2,y:3},{x:5,y:3},{x:5,y:9},{x:12,y:9},{x:12,y:15.5}],
  [{x:13,y:15.5},{x:13,y:11},{x:9,y:11},{x:9,y:5},{x:3,y:5},{x:3,y:-.5}],
  [{x:-.5,y:7},{x:4,y:7},{x:4,y:2},{x:10,y:2},{x:10,y:7},{x:15.5,y:7}]
];

const CAR_ROUTES=[
  [{x:-.7,y:4.5},{x:5,y:4.5},{x:5,y:9.5},{x:15.7,y:9.5}],
  [{x:15.7,y:6.5},{x:10,y:6.5},{x:10,y:11.5},{x:-.7,y:11.5}],
  [{x:7.5,y:-.7},{x:7.5,y:4.5},{x:12.5,y:4.5},{x:12.5,y:15.7}],
  [{x:3.5,y:15.7},{x:3.5,y:10},{x:8.5,y:10},{x:8.5,y:-.7}],
  [{x:-.7,y:13},{x:4.5,y:13},{x:4.5,y:6},{x:15.7,y:6}]
];

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
    if(d<=len){
      const k=len?d/len:0;
      return {x:a.x+(b.x-a.x)*k,y:a.y+(b.y-a.y)*k};
    }
    d-=len;
  }
  return route[route.length-1];
}

function makeActors(count,routes,speedMin,speedMax){
  return Array.from({length:count},(_,i)=>({
    route:routes[i%routes.length],
    t:(i/count*.82),
    speed:speedMin+(i%4)*(speedMax-speedMin)/3,
    phase:i*1.73,
    active:true,
    wait:0,
    type:i%3
  }));
}

const people=makeActors(PEOPLE_COUNT,PEOPLE_ROUTES,.000018,.000030);
const cars=makeActors(CARS_COUNT,CAR_ROUTES,.000032,.000046);

function advance(actor,dt){
  if(!actor.active){
    actor.wait-=dt;
    if(actor.wait<=0){
      actor.t=0;
      actor.active=true;
    }
    return;
  }
  actor.t+=actor.speed*dt;
  // They leave the city at the end of the route, then re-enter after a short pause.
  if(actor.t>=1){
    actor.active=false;
    actor.wait=700+((actor.phase*137)%900);
    actor.t=1;
  }
}

function drawPerson(ctx,iso,p,now){
  const q=routePoint(p.route,p.t),s=iso.worldToScreen(q.x,q.y);
  const bob=Math.sin(now*.008+p.phase)*.8;
  ctx.save();
  ctx.translate(s.x,s.y+bob-3);
  ctx.fillStyle='rgba(45,38,30,.15)';
  ctx.beginPath();ctx.ellipse(0,4,2.8,1.2,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#5b5148';
  ctx.beginPath();ctx.arc(0,-4,2,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#5b5148';ctx.lineWidth=1.5;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(0,-1.5);ctx.lineTo(0,3);ctx.moveTo(0,.5);ctx.lineTo(-1.8,3.5);ctx.moveTo(0,.5);ctx.lineTo(1.8,3.5);ctx.stroke();
  ctx.restore();
}

function drawCar(ctx,iso,c){
  const q=routePoint(c.route,c.t);
  const q2=routePoint(c.route,Math.min(1,c.t+.0015));
  const s=iso.worldToScreen(q.x,q.y),n=iso.worldToScreen(q2.x,q2.y);
  const angle=Math.atan2(n.y-s.y,n.x-s.x);
  ctx.save();
  ctx.translate(s.x,s.y-2);
  ctx.rotate(angle);
  ctx.fillStyle='rgba(45,38,30,.17)';
  ctx.beginPath();ctx.ellipse(0,4,7,2.2,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=['#756b61','#5d746f','#8a6658'][c.type];
  ctx.beginPath();ctx.roundRect(-6,-3,12,6,1.8);ctx.fill();
  ctx.fillStyle='#d8d0c4';ctx.fillRect(-2.8,-2.2,5.6,2.1);
  ctx.fillStyle='#413b35';ctx.fillRect(-4.5,2,2.4,1.8);ctx.fillRect(2.1,2,2.4,1.8);
  ctx.restore();
}

let lastTime=performance.now();

export function drawAmbientLife(ctx,iso,now){
  const dt=Math.min(40,Math.max(0,now-lastTime));
  lastTime=now;
  for(const p of people){
    advance(p,dt);
    if(p.active)drawPerson(ctx,iso,p,now);
  }
  for(const c of cars){
    advance(c,dt);
    if(c.active)drawCar(ctx,iso,c);
  }
}
