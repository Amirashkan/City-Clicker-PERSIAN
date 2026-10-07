function drawLandscape(ctx,w,h,dark=false,offsetX=0,offsetY=0){
  const margin=Math.max(80,Math.abs(offsetX)+40,Math.abs(offsetY)+40);
  const bw=w+margin*2,bh=h+margin*2;
  ctx.save();
  ctx.translate(offsetX-margin,offsetY-margin);
  w=bw;h=bh;
  // Soft illustrated backdrop: sky, distant mountains, plain, and a low city silhouette.
  const sky=ctx.createLinearGradient(0,0,0,h);
  if(dark){
    sky.addColorStop(0,'#18242a');
    sky.addColorStop(.58,'#29302d');
    sky.addColorStop(1,'#22231f');
  }else{
    sky.addColorStop(0,'#cfe1e5');
    sky.addColorStop(.58,'#e6dfcc');
    sky.addColorStop(1,'#d5cfbd');
  }
  ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);

  // Distant mountain range.
  ctx.beginPath();
  ctx.moveTo(0,h*.36);
  const peaks=[[.08,.23],[.18,.31],[.29,.20],[.40,.29],[.52,.18],[.63,.30],[.75,.21],[.88,.28],[1,.19]];
  for(const [x,y] of peaks)ctx.lineTo(w*x,h*y);
  ctx.lineTo(w,h*.47);ctx.lineTo(0,h*.47);ctx.closePath();
  ctx.fillStyle=dark?'#46534f':'#aeb8ae';ctx.fill();

  // Softer nearer mountain foothills.
  ctx.beginPath();
  ctx.moveTo(0,h*.43);
  const foothills=[[.12,.34],[.27,.40],[.43,.33],[.58,.41],[.72,.35],[.87,.42],[1,.34]];
  for(const [x,y] of foothills)ctx.lineTo(w*x,h*y);
  ctx.lineTo(w,h*.58);ctx.lineTo(0,h*.58);ctx.closePath();
  ctx.fillStyle=dark?'#3b4640':'#9eaa9a';ctx.fill();

  // Broad plain.
  ctx.fillStyle=dark?'#4a4d3d':'#c8c7a7';
  ctx.fillRect(0,h*.48,w,h*.52);
  ctx.fillStyle=dark?'#3d4335':'#b9bd98';
  ctx.fillRect(0,h*.63,w,h*.37);

  // Distant city, kept deliberately subtle so the playable city remains dominant.
  const base=h*.57;
  ctx.fillStyle=dark?'#343b37':'#8e9387';
  const buildings=[[.05,.08,.035],[.09,.13,.045],[.145,.07,.032],[.19,.18,.05],[.25,.11,.04],[.31,.16,.045],[.37,.09,.035],[.43,.14,.05],[.49,.10,.035],[.55,.19,.055],[.62,.12,.04],[.68,.16,.05],[.75,.09,.035],[.81,.14,.045],[.88,.11,.04],[.94,.17,.05]];
  for(const [x,ht,bw] of buildings){
    const bh=h*ht,bwpx=w*bw;
    ctx.fillRect(w*x,base-bh,bwpx,bh);
  }
  ctx.fillStyle=dark?'#303631':'#7d847b';
  ctx.fillRect(0,base,w,Math.max(2,h*.008));
  ctx.restore();
}

export function drawGrid(ctx,iso,width,height,hover,mask=null,unlockedMask=null){
  const tw=iso.tileWidth,th=iso.tileHeight;
  const rect=ctx.canvas.getBoundingClientRect();
  const canvasW=rect.width,canvasH=rect.height;
  const dark=document.documentElement.classList.contains('dark');
  // Give the landscape a subtle parallax response to map panning: the backdrop follows
  // the map, but much more slowly, so it feels like a distant landscape rather than UI.
  const baseOriginX=canvasW/2;
  const baseOriginY=Math.max(55,canvasH*.20);
  const parallaxX=(iso.originX-baseOriginX)*.18;
  const parallaxY=(iso.originY-baseOriginY)*.10;
  drawLandscape(ctx,canvasW,canvasH,dark,parallaxX,parallaxY);

  // Extrude the actual map footprint downward. Each exposed lower edge of the
  // playable mask becomes the top edge of a ground/base face, so the base follows
  // irregular map shapes instead of becoming a rectangle.
  const baseFill=dark?'#252722':'#a8a78f';
  const baseEdge=dark?'#1d1f1b':'#8f907c';
  const baseBottom=canvasH+Math.max(28,canvasH*.06);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    if(mask&&!mask[y]?.[x])continue;
    const below=mask ? !!mask[y+1]?.[x] : y<height-1;
    const rightOpen=mask ? !mask[y]?.[x+1] : x===width-1;
    if(below && !rightOpen)continue;

    const p=iso.worldToScreen(x,y);
    const left={x:p.x-tw/2,y:p.y+th/2};
    const bottom={x:p.x,y:p.y+th};
    const right={x:p.x+tw/2,y:p.y+th/2};

    // Downward-facing exposed edge.
    if(!below){
      ctx.beginPath();
      ctx.moveTo(left.x,left.y);
      ctx.lineTo(bottom.x,bottom.y);
      ctx.lineTo(bottom.x,baseBottom);
      ctx.lineTo(left.x,baseBottom);
      ctx.closePath();
      ctx.fillStyle=baseFill;
      ctx.fill();
      ctx.strokeStyle=baseEdge;
      ctx.lineWidth=1;
      ctx.stroke();
    }

    // Right-facing exposed edge. It is extruded separately so stepped/right
    // boundaries of an irregular map remain visible.
    if(rightOpen){
      ctx.beginPath();
      ctx.moveTo(bottom.x,bottom.y);
      ctx.lineTo(right.x,right.y);
      ctx.lineTo(right.x,baseBottom);
      ctx.lineTo(bottom.x,baseBottom);
      ctx.closePath();
      ctx.fillStyle=dark?'#20221e':'#999a83';
      ctx.fill();
      ctx.strokeStyle=baseEdge;
      ctx.lineWidth=1;
      ctx.stroke();
    }

    // Small contact shadow under the exposed corner makes each break in the
    // outline readable without turning the whole base into a heavy shadow.
    if(!below || rightOpen){
      ctx.fillStyle=dark?'rgba(0,0,0,.18)':'rgba(45,40,30,.12)';
      ctx.beginPath();
      ctx.moveTo(p.x,p.y+th);
      ctx.lineTo(p.x+tw*.16,p.y+th*.16+th);
      ctx.lineTo(p.x+tw*.28,p.y+th*.16+th);
      ctx.lineTo(p.x+tw*.16,p.y+th*.16+th);
      ctx.closePath();
      ctx.fill();
    }
  }

  ctx.lineWidth=1;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    if(mask&&!mask[y]?.[x])continue;
    const p=iso.worldToScreen(x,y);
    const unlocked=!unlockedMask||unlockedMask[y]?.[x];
    ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+tw/2,p.y+th/2);ctx.lineTo(p.x,p.y+th);ctx.lineTo(p.x-tw/2,p.y+th/2);ctx.closePath();
    ctx.fillStyle=unlocked?(dark?((x+y)%2?'#35342f':'#3b3933'):((x+y)%2?'#d7d0c2':'#ddd6c9')):'rgba(120,116,106,.18)';ctx.fill();
    ctx.strokeStyle=unlocked?(dark?'#514d45':'#c2baac'):'rgba(100,96,88,.42)';ctx.stroke();
    if(!unlocked){ctx.beginPath();ctx.moveTo(p.x-tw*.16,p.y+th*.5);ctx.lineTo(p.x+tw*.16,p.y+th*.5);ctx.moveTo(p.x,p.y+th*.34);ctx.lineTo(p.x,p.y+th*.66);ctx.strokeStyle='rgba(82,78,70,.55)';ctx.lineWidth=2;ctx.stroke();ctx.lineWidth=1;}
  }
  if(hover&&hover.x>=0&&hover.y>=0&&hover.x<width&&hover.y<height&&(!mask||mask[hover.y]?.[hover.x])&&(!unlockedMask||unlockedMask[hover.y]?.[hover.x])){
    const p=iso.worldToScreen(hover.x,hover.y);
    ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+tw/2,p.y+th/2);ctx.lineTo(p.x,p.y+th);ctx.lineTo(p.x-tw/2,p.y+th/2);ctx.closePath();
    ctx.fillStyle='rgba(80,120,80,.28)';ctx.fill();ctx.strokeStyle='#64805e';ctx.stroke();
  }
}
