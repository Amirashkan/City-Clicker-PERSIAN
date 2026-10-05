export function drawHouse(ctx,iso,b){
  const p=iso.worldToScreen(b.x+.5,b.y+.5,0);
  const tw=iso.tileWidth, th=iso.tileHeight;
  const hw=b.w*tw/2, hd=b.d*th/2;
  const topY=p.y-b.h;
  const left={x:p.x-hw,y:topY+hd*.2}, right={x:p.x+hw,y:topY+hd*.2};
  const top={x:p.x,y:topY-hd*.8}, bottom={x:p.x,y:topY+hd};
  ctx.save();
  ctx.lineJoin='round';
  ctx.fillStyle='#d9a16e';
  ctx.beginPath();ctx.moveTo(left.x,left.y);ctx.lineTo(bottom.x,bottom.y);ctx.lineTo(bottom.x,p.y+th/2);ctx.lineTo(left.x,p.y);ctx.closePath();ctx.fill();
  ctx.fillStyle='#bd8359';
  ctx.beginPath();ctx.moveTo(right.x,right.y);ctx.lineTo(bottom.x,bottom.y);ctx.lineTo(bottom.x,p.y+th/2);ctx.lineTo(right.x,p.y);ctx.closePath();ctx.fill();
  ctx.fillStyle='#c98e61';
  ctx.beginPath();ctx.moveTo(top.x,top.y);ctx.lineTo(right.x,right.y);ctx.lineTo(bottom.x,bottom.y);ctx.lineTo(left.x,left.y);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#9b6c4e';ctx.lineWidth=1;ctx.stroke();
  // windows
  const rows=2;
  for(let row=0;row<rows;row++){
    const yy=topY+13+row*17;
    const lx=p.x-hw*.72, rx=p.x+hw*.72;
    for(const xx of [lx,rx]){
      ctx.fillStyle='#5d8390';ctx.fillRect(xx-4,yy-3,8,9);
      ctx.strokeStyle='#385761';ctx.strokeRect(xx-4,yy-3,8,9);
    }
  }
  // rooftop parapet
  ctx.fillStyle='#b87850';
  ctx.beginPath();ctx.moveTo(top.x,top.y-2);ctx.lineTo(right.x,right.y-2);ctx.lineTo(bottom.x,bottom.y-2);ctx.lineTo(left.x,left.y-2);ctx.closePath();ctx.stroke();
  // Iranian evaporative cooler
  if(b.cooler) drawCooler(ctx,p.x+hw*.32,topY-5,iso);
  if(b.tank) drawTank(ctx,p.x-hw*.28,topY-3,iso);
  ctx.restore();
}
function drawCooler(ctx,x,y,iso){
  const w=12,h=9;
  ctx.fillStyle='#bfc5bd';ctx.strokeStyle='#7e857e';ctx.lineWidth=1;
  ctx.beginPath();ctx.rect(x-w/2,y-h,w,h);ctx.fill();ctx.stroke();
  ctx.fillStyle='#90988f';
  for(let i=0;i<3;i++)ctx.fillRect(x-w/2+2+i*3,y-h+2,1,5);
  ctx.fillStyle='#e1e3dc';ctx.fillRect(x-w/2+1,y-h-2,w-2,2);
  ctx.strokeStyle='#6d746d';ctx.beginPath();ctx.moveTo(x+3,y-h);ctx.lineTo(x+6,y-h-5);ctx.stroke();
}
function drawTank(ctx,x,y,iso){
  ctx.fillStyle='#4e7775';ctx.strokeStyle='#345552';ctx.lineWidth=1;
  ctx.beginPath();ctx.ellipse(x,y-7,7,3,0,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.fillRect(x-7,y-7,14,7);ctx.beginPath();ctx.ellipse(x,y,7,3,0,0,Math.PI*2);ctx.fill();ctx.stroke();
}