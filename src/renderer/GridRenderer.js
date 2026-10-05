export function drawGrid(ctx,iso,width,height,hover){
  const tw=iso.tileWidth,th=iso.tileHeight;
  ctx.lineWidth=1;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const p=iso.worldToScreen(x,y);
    ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+tw/2,p.y+th/2);ctx.lineTo(p.x,p.y+th);ctx.lineTo(p.x-tw/2,p.y+th/2);ctx.closePath();
    ctx.fillStyle=(x+y)%2?'#d7d0c2':'#ddd6c9';ctx.fill();
    ctx.strokeStyle='#c2baac';ctx.stroke();
  }
  if(hover&&hover.x>=0&&hover.y>=0&&hover.x<width&&hover.y<height){
    const p=iso.worldToScreen(hover.x,hover.y);
    ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+tw/2,p.y+th/2);ctx.lineTo(p.x,p.y+th);ctx.lineTo(p.x-tw/2,p.y+th/2);ctx.closePath();
    ctx.fillStyle='rgba(80,120,80,.28)';ctx.fill();ctx.strokeStyle='#64805e';ctx.stroke();
  }
}