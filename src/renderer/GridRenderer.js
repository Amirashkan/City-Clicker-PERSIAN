function drawLandscape(ctx,w,h){
  // Soft illustrated backdrop: sky, distant mountains, plain, and a low city silhouette.
  const sky=ctx.createLinearGradient(0,0,0,h);
  sky.addColorStop(0,'#cfe1e5');
  sky.addColorStop(.58,'#e6dfcc');
  sky.addColorStop(1,'#d5cfbd');
  ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);

  // Distant mountain range.
  ctx.beginPath();
  ctx.moveTo(0,h*.36);
  const peaks=[[.08,.23],[.18,.31],[.29,.20],[.40,.29],[.52,.18],[.63,.30],[.75,.21],[.88,.28],[1,.19]];
  for(const [x,y] of peaks)ctx.lineTo(w*x,h*y);
  ctx.lineTo(w,h*.47);ctx.lineTo(0,h*.47);ctx.closePath();
  ctx.fillStyle='#aeb8ae';ctx.fill();

  // Softer nearer mountain foothills.
  ctx.beginPath();
  ctx.moveTo(0,h*.43);
  const foothills=[[.12,.34],[.27,.40],[.43,.33],[.58,.41],[.72,.35],[.87,.42],[1,.34]];
  for(const [x,y] of foothills)ctx.lineTo(w*x,h*y);
  ctx.lineTo(w,h*.58);ctx.lineTo(0,h*.58);ctx.closePath();
  ctx.fillStyle='#9eaa9a';ctx.fill();

  // Broad plain.
  ctx.fillStyle='#c8c7a7';
  ctx.fillRect(0,h*.48,w,h*.52);
  ctx.fillStyle='#b9bd98';
  ctx.fillRect(0,h*.63,w,h*.37);

  // Distant city, kept deliberately subtle so the playable city remains dominant.
  const base=h*.57;
  ctx.fillStyle='#8e9387';
  const buildings=[[.05,.08,.035],[.09,.13,.045],[.145,.07,.032],[.19,.18,.05],[.25,.11,.04],[.31,.16,.045],[.37,.09,.035],[.43,.14,.05],[.49,.10,.035],[.55,.19,.055],[.62,.12,.04],[.68,.16,.05],[.75,.09,.035],[.81,.14,.045],[.88,.11,.04],[.94,.17,.05]];
  for(const [x,ht,bw] of buildings){
    const bh=h*ht,bwpx=w*bw;
    ctx.fillRect(w*x,base-bh,bwpx,bh);
  }
  ctx.fillStyle='#7d847b';
  ctx.fillRect(0,base,w,Math.max(2,h*.008));
}

export function drawGrid(ctx,iso,width,height,hover,mask=null,unlockedMask=null){
  const tw=iso.tileWidth,th=iso.tileHeight;
  const canvasW=ctx.canvas.width/(devicePixelRatio||1),canvasH=ctx.canvas.height/(devicePixelRatio||1);
  drawLandscape(ctx,canvasW,canvasH);
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
