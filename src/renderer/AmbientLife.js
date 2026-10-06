const PEOPLE_COUNT=14;
const CARS_COUNT=7;

function makePeople(){
  const routes=[
    [{x:.2,y:3.2},{x:14.8,y:3.2}],
    [{x:14.8,y:7.1},{x:.2,y:7.1}],
    [{x:.2,y:11.2},{x:14.8,y:11.2}],
    [{x:4.2,y:.2},{x:4.2,y:14.8}],
    [{x:10.5,y:14.8},{x:10.5,y:.2}]
  ];
  return Array.from({length:PEOPLE_COUNT},(_,i)=>({
    route:routes[i%routes.length],
    t:(i/PEOPLE_COUNT+(i%3)*.17)%1,
    speed:.000018+(i%4)*.000003,
    phase:i*1.73
  }));
}

function makeCars(){
  const routes=[
    [{x:-.5,y:4.7},{x:15.5,y:4.7}],
    [{x:15.5,y:8.7},{x:-.5,y:8.7}],
    [{x:2.7,y:-.5},{x:2.7,y:15.5}],
    [{x:8.1,y:15.5},{x:8.1,y:-.5}],
    [{x:12.4,y:-.5},{x:12.4,y:15.5}]
  ];
  return Array.from({length:CARS_COUNT},(_,i)=>({
    route:routes[i%routes.length],
    t:(i/CARS_COUNT+.31)%1,
    speed:.000032+(i%3)*.000005,
    phase:i*2.1,
    type:i%3
  }));
}

const people=makePeople();
const cars=makeCars();

function point(route,t){
  const a=route[0],b=route[route.length-1];
  return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};
}

function drawPerson(ctx,iso,p,now){
  const q=point(p.route,p.t),s=iso.worldToScreen(q.x,q.y);
  const bob=Math.sin(now*.008+p.phase)*1.1;
  ctx.save();
  ctx.translate(s.x,s.y+bob-4);
  ctx.fillStyle='rgba(45,38,30,.16)';
  ctx.beginPath();ctx.ellipse(0,5,3.2,1.4,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#5b5148';
  ctx.beginPath();ctx.arc(0,-4,2.2,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#5b5148';ctx.lineWidth=1.7;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(0,-1);ctx.lineTo(0,4);ctx.moveTo(0,1);ctx.lineTo(-2,4);ctx.moveTo(0,1);ctx.lineTo(2,4);ctx.stroke();
  ctx.restore();
}

function drawCar(ctx,iso,c){
  const q=point(c.route,c.t),q2=point(c.route,Math.min(1,c.t+.001));
  const s=iso.worldToScreen(q.x,q.y),n=iso.worldToScreen(q2.x,q2.y);
  const angle=Math.atan2(n.y-s.y,n.x-s.x);
  ctx.save();
  ctx.translate(s.x,s.y-2);
  ctx.rotate(angle);
  ctx.fillStyle='rgba(45,38,30,.18)';
  ctx.beginPath();ctx.ellipse(0,4,7,2.4,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=['#756b61','#5d746f','#8a6658'][c.type];
  ctx.beginPath();ctx.roundRect(-6,-3,12,6,1.8);ctx.fill();
  ctx.fillStyle='#d8d0c4';
  ctx.fillRect(-2.8,-2.2,5.6,2.1);
  ctx.fillStyle='#413b35';
  ctx.fillRect(-4.5,2,2.4,1.8);ctx.fillRect(2.1,2,2.4,1.8);
  ctx.restore();
}

export function drawAmbientLife(ctx,iso,now){
  for(const p of people){
    p.t=(p.t+p.speed*16)%1;
    drawPerson(ctx,iso,p,now);
  }
  for(const c of cars){
    c.t=(c.t+c.speed*16)%1;
    drawCar(ctx,iso,c);
  }
}
