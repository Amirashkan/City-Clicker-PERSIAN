export function drawGrid(ctx,iso,width,height,hover,mask=null,unlockedMask=null){
  const tw=iso.tileWidth,th=iso.tileHeight;
  ctx.lineWidth=1;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    if(mask&&!mask[y]?.[x])continue;
    const p=iso.worldToScreen(x,y);
    const unlocked=!unlockedMask||unlockedMask[y]?.[x];
    ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+tw/2,p.y+th/2);ctx.lineTo(p.x,p.y+th);ctx.lineTo(p.x-tw/2,p.y+th/2);ctx.closePath();
    ctx.fillStyle=unlocked?((x+y)%2?'#d7d0c2':'#ddd6c9'):'rgba(120,116,106,.18)';ctx.fill();
    ctx.strokeStyle=unlocked?'#c2baac':'rgba(100,96,88,.42)';ctx.stroke();
    if(!unlocked){ctx.beginPath();ctx.moveTo(p.x-tw*.16,p.y+th*.5);ctx.lineTo(p.x+tw*.16,p.y+th*.5);ctx.moveTo(p.x,p.y+th*.34);ctx.lineTo(p.x,p.y+th*.66);ctx.strokeStyle='rgba(82,78,70,.55)';ctx.lineWidth=2;ctx.stroke();ctx.lineWidth=1;}
  }
  if(hover&&hover.x>=0&&hover.y>=0&&hover.x<width&&hover.y<height&&(!mask||mask[hover.y]?.[hover.x])&&(!unlockedMask||unlockedMask[hover.y]?.[hover.x])){
    const p=iso.worldToScreen(hover.x,hover.y);
    ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+tw/2,p.y+th/2);ctx.lineTo(p.x,p.y+th);ctx.lineTo(p.x-tw/2,p.y+th/2);ctx.closePath();
    ctx.fillStyle='rgba(80,120,80,.28)';ctx.fill();ctx.strokeStyle='#64805e';ctx.stroke();
  }
}
