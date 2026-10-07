export function drawBuilding(ctx,iso,b,hover=false){
 if(b.type==='park')return drawPark(ctx,iso,b,hover);
 if(b.type==='farm')return drawFarm(ctx,iso,b,hover);
 const p=iso.worldToScreen(b.x+.5,b.y+.5),tw=iso.tileWidth,th=iso.tileHeight;
 const level=Math.max(1,b.level||1);
 const sx=Math.max(.58,Math.min(.88,b.w||.78)),sy=Math.max(.58,Math.min(.88,b.d||.78));
 const hw=tw*sx/2,hh=th*sy/2;
 const baseHeight=b.height!=null?b.height*th:(b.h||34)*(th/27);
 const h=baseHeight+(level-1)*th*.32;
 const pal={house:['#bd8158','#a96d4c','#d9a06e'],shop:['#b69a68','#987d53','#d0b37b'],bakery:['#c99462','#a8754e','#e0b37f'],workshop:['#7f8983','#68716c','#9da79f']}[b.type]||['#bd8158','#a96d4c','#d9a06e'];
 ctx.save();
 if(hover){ctx.shadowColor='rgba(40,30,20,.22)';ctx.shadowBlur=7;ctx.shadowOffsetY=2}
 const g=drawBlock(ctx,p,hw,hh,h,pal);
 drawWindows(ctx,g,b.type,b.windows||2,b.upperFloor);
 if(b.type==='shop'||b.type==='bakery')drawSign(ctx,p.x,g.top.y+hh*.65,b.type==='bakery'?'نان':'فروش',b.signStyle,hh);
 if(b.type==='house'&&b.tank)drawTank(ctx,p.x-hw*.28,g.top.y-3);
 if(b.type==='house'&&b.antenna)drawAntenna(ctx,p.x+hw*.25,g.top.y-2);
 if(b.type==='workshop')drawWorkshop(ctx,p.x+hw*.15,g.top.y-3,b);
 if(b.type==='bakery'&&b.chimney)drawChimney(ctx,p.x+hw*.25,g.top.y-2);
 drawLevelBadge(ctx,p.x,g.top.y-10,level);ctx.restore();
}

function drawBlock(c,p,hw,hh,h,pal){
 const baseTop={x:p.x,y:p.y-hh},baseR={x:p.x+hw,y:p.y},baseB={x:p.x,y:p.y+hh},baseL={x:p.x-hw,y:p.y};
 const topY=baseTop.y-h;
 const top={x:p.x,y:topY},topR={x:p.x+hw,y:topY+hh},topB={x:p.x,y:topY+hh*2},topL={x:p.x-hw,y:topY+hh};
 face(c,[topL,topB,baseB,baseL],pal[0]);face(c,[topR,baseR,baseB,topB],pal[1]);face(c,[top,topR,topB,topL],pal[2]);
 c.beginPath();c.moveTo(baseL.x,baseL.y);c.lineTo(baseB.x,baseB.y);c.lineTo(baseR.x,baseR.y);c.strokeStyle='#785d4b';c.lineWidth=1;c.stroke();
 return {baseL,baseR,baseB,topL,topR,topB,top};
}
function face(c,a,f){c.fillStyle=f;c.beginPath();c.moveTo(a[0].x,a[0].y);for(let i=1;i<a.length;i++)c.lineTo(a[i].x,a[i].y);c.closePath();c.fill()}

function drawWindows(c,g,type,count,upper){
 const n=Math.max(2,Math.min(4,count)),pairs=[[.32,.26],[.68,.26],[.32,.58],[.68,.58]];
 for(let i=0;i<n;i++){
  const u=pairs[i],side=i%2===0?'L':'R',a=side==='L'?g.baseL:g.baseR,b=g.baseB,t=side==='L'?g.topL:g.topR;
  const q1={x:a.x+(b.x-a.x)*u[0],y:a.y+(b.y-a.y)*u[0]},q2={x:t.x+(g.topB.x-t.x)*u[0],y:t.y+(g.topB.y-t.y)*u[0]},yy=u[1];
  const x1=q1.x+(q2.x-q1.x)*yy,y1=q1.y+(q2.y-q1.y)*yy,x2=x1+(b.x-a.x)*.09,y2=y1+(b.y-a.y)*.09,x3=x2+(q2.x-q1.x)*.18,y3=y2+(q2.y-q1.y)*.18,x4=x1+(q2.x-q1.x)*.18,y4=y1+(q2.y-q1.y)*.18;
  c.fillStyle=type==='bakery'?'#d9bd74':'#557a84';c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.lineTo(x3,y3);c.lineTo(x4,y4);c.closePath();c.fill();
 }
 if(upper){c.fillStyle='#557a84';c.fillRect(g.top.x-4,g.top.y+4,8,7)}
}

function drawUpperModel(c,p,tw,th,g,b,basePal,level){
 const s=level===2?.72:.60;
 const upH=th*(level===2?.27:.31);
 // Keep the added floor exactly attached to the roof below; no floating offset.
 const ux=level===2?p.x:p.x+tw*.035;
 const uy=g.top.y;
 const pal=[basePal[0],basePal[1],basePal[2]];
 const u=drawBlock(c,{x:ux,y:uy},tw*s/2,th*s*.28,upH,pal);
 const count=level===2?2:3;
 drawWindows(c,u,b.type,count,false);
 if(b.type==='house'){
  if(level===2)drawRoofCap(c,u,tw*.18,th*.10);
  else drawRoofCap(c,u,tw*.24,th*.13);
 }else if(b.type==='shop'){
  drawSign(c,ux,u.top.y+th*.09,'فروش',level===2?'wide':'compact',th*.28);
 }else if(b.type==='bakery'){
  drawSign(c,ux,u.top.y+th*.09,'نان','compact',th*.28);
  drawChimney(c,ux+tw*.16,u.top.y-2);
 }else if(b.type==='workshop'){
  drawWorkshop(c,ux+tw*.08,u.top.y-2,{vent:true,stack:level>=3});
 }
}

function drawRooftopModel(c,p,tw,th,g,b,pal){
 const roofY=g.top.y-th*.25;
 if(b.type==='house'){
  drawRoofCap(c,{top:{x:p.x,y:roofY}},tw*.26,th*.14);
  if(b.tank)drawTank(c,p.x-tw*.13,roofY-2);
 }else if(b.type==='shop'){
  c.fillStyle='#6e5b42';c.fillRect(p.x-tw*.22,roofY-3,tw*.44,3);
  c.fillStyle='#d0b37b';c.fillRect(p.x-tw*.13,roofY-8,tw*.26,5);
 }else if(b.type==='bakery'){
  drawChimney(c,p.x+tw*.17,roofY-3);
  c.fillStyle='#7e624d';c.fillRect(p.x-tw*.18,roofY-5,tw*.36,3);
 }else if(b.type==='workshop'){
  c.fillStyle='#5e6863';c.fillRect(p.x-tw*.22,roofY-5,tw*.44,5);
  c.fillStyle='#8b9690';c.fillRect(p.x-tw*.08,roofY-11,tw*.16,6);
 }
}

function drawRoofCap(c,g,w,h){
 const x=g.top?.x??0,y=g.top?.y??0;
 c.fillStyle='#765744';c.beginPath();c.moveTo(x,y-h);c.lineTo(x+w,y);c.lineTo(x,y+h*.45);c.lineTo(x-w,y);c.closePath();c.fill();
}

function drawSign(c,x,y,text,style='wide',hh=10){const w=style==='compact'?24:32,h=Math.max(8,Math.min(12,hh*.34));c.save();c.fillStyle='#ead9ad';c.fillRect(x-w/2,y-h/2,w,h);c.fillStyle='#493d2f';c.font='8px Vazirmatn';c.textAlign='center';c.fillText(text,x,y+3);c.restore()}
function drawTank(c,x,y){c.fillStyle='#587875';c.beginPath();c.ellipse(x,y-5,6,2.5,0,0,Math.PI*2);c.fill();c.fillRect(x-6,y-5,12,6)}
function drawAntenna(c,x,y){c.strokeStyle='#555';c.lineWidth=1;c.beginPath();c.moveTo(x,y);c.lineTo(x,y-10);c.lineTo(x+3,y-13);c.stroke()}
function drawChimney(c,x,y){c.fillStyle='#8c6650';c.fillRect(x-3,y-7,6,10)}
function drawWorkshop(c,x,y,b){c.fillStyle='#404944';c.fillRect(x-7,y-5,14,5);if(b.vent)c.fillRect(x+8,y-8,4,8);if(b.stack){c.fillStyle='#777';c.fillRect(x-11,y-12,4,9)}}
function drawLevelBadge(c,x,y,level){if(level<2)return;c.fillStyle='rgba(247,241,231,.92)';c.beginPath();c.arc(x,y,8,0,Math.PI*2);c.fill();c.fillStyle='#5d5144';c.font='bold 9px Vazirmatn';c.textAlign='center';c.textBaseline='middle';c.fillText(String(level),x,y+.5);c.textBaseline='alphabetic'}

function drawPark(ctx,iso,b,hover){
 const p=iso.worldToScreen(b.x+.5,b.y+.5),tw=iso.tileWidth,th=iso.tileHeight,level=Math.max(1,b.level||1);
 const hw=tw*(level===1?.34:level===2?.38:.42),hh=th*(level===1?.34:level===2?.38:.42);
 ctx.save();ctx.fillStyle=hover?'#a5b57f':'#91a16e';ctx.beginPath();ctx.moveTo(p.x,p.y-hh);ctx.lineTo(p.x+hw,p.y);ctx.lineTo(p.x,p.y+hh);ctx.lineTo(p.x-hw,p.y);ctx.closePath();ctx.fill();
 ctx.fillStyle='#6d7f55';drawTree(ctx,p.x,p.y-10,level>=3?1.15:1);
 const trees=(b.trees||1)+(level-1)*2;for(let i=1;i<trees;i++){const ox=((i%3)-1)*.22*tw,oy=((i%2)-.5)*.12*th;drawTree(ctx,p.x+ox,p.y+oy-5,.75+(level-1)*.08)}
 if(b.bench||level>=2){ctx.fillStyle='#725b43';ctx.fillRect(p.x-tw*.18,p.y+th*.12,tw*.36,3)}
 if(level>=3){ctx.fillStyle='#777';ctx.fillRect(p.x+tw*.16,p.y-th*.08,2,th*.16);ctx.beginPath();ctx.arc(p.x+tw*.17,p.y-th*.10,3,0,Math.PI*2);ctx.fill()}
 drawLevelBadge(ctx,p.x,p.y-th*.45,level);ctx.restore()
}
function drawTree(c,x,y,s=1){c.fillStyle='#6d7f55';c.fillRect(x-2*s,y,4*s,15*s);c.beginPath();c.arc(x,y-6*s,8*s,0,Math.PI*2);c.fill()}

function drawFarm(ctx,iso,b,hover){
 const p=iso.worldToScreen(b.x+.5,b.y+.5),tw=iso.tileWidth,th=iso.tileHeight,level=Math.max(1,b.level||1);
 const scale=1+(level-1)*.08,hw=tw*(level===1?.34:level===2?.39:.43),hh=th*(level===1?.36:level===2?.40:.44);
 ctx.save();ctx.fillStyle=hover?'#c3aa70':'#b49a61';ctx.beginPath();ctx.moveTo(p.x,p.y-hh);ctx.lineTo(p.x+hw,p.y);ctx.lineTo(p.x,p.y+hh);ctx.lineTo(p.x-hw,p.y);ctx.closePath();ctx.fill();
 ctx.strokeStyle='#8f794b';ctx.lineWidth=1;const rows=(b.rows||4)+(level-1)*2;for(let i=1;i<rows;i++){const t=i/rows,ly=p.y-hh+(hh*2*t);ctx.beginPath();ctx.moveTo(p.x-hw*(1-Math.abs(2*t-1)),ly);ctx.lineTo(p.x+hw*(1-Math.abs(2*t-1)),ly);ctx.stroke()}
 if(b.shed||level>=2){ctx.fillStyle='#7c6648';ctx.fillRect(p.x+tw*.08,p.y+th*.04,tw*(level>=3?.22:.16),th*(level>=3?.15:.12))}
 if(level>=3){ctx.fillStyle='#6d5a43';ctx.fillRect(p.x-tw*.24,p.y-th*.05,tw*.12,th*.10);ctx.fillStyle='#5e774b';ctx.beginPath();ctx.arc(p.x-tw*.18,p.y-th*.11,6*scale,0,Math.PI*2);ctx.fill()}
 drawLevelBadge(ctx,p.x,p.y+th*.08,b.level||1);ctx.restore()
}
