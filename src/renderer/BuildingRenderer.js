export function drawBuilding(ctx,iso,b,hover=false){
 if(b.type==='park')return drawPark(ctx,iso,b,hover);
 if(b.type==='farm')return drawFarm(ctx,iso,b,hover);
 const p=iso.worldToScreen(b.x+.5,b.y+.5),tw=iso.tileWidth,th=iso.tileHeight;
 const sx=Math.max(.58,Math.min(.88,b.w||.78)),sy=Math.max(.58,Math.min(.88,b.d||.78));
 const hw=tw*sx/2,hh=th*sy/2,h=(b.h||34)+(Math.max(1,b.level||1)-1)*7;
 const baseTop={x:p.x,y:p.y-hh},baseR={x:p.x+hw,y:p.y},baseB={x:p.x,y:p.y+hh},baseL={x:p.x-hw,y:p.y};
 const topY=baseTop.y-h;
 const top={x:p.x,y:topY},topR={x:p.x+hw,y:topY+hh},topB={x:p.x,y:topY+hh*2},topL={x:p.x-hw,y:topY+hh};
 const pal={house:['#bd8158','#a96d4c','#d9a06e'],shop:['#b69a68','#987d53','#d0b37b'],bakery:['#c99462','#a8754e','#e0b37f'],workshop:['#7f8983','#68716c','#9da79f']}[b.type]||['#bd8158','#a96d4c','#d9a06e'];
 ctx.save();
 if(hover){ctx.shadowColor='rgba(40,30,20,.22)';ctx.shadowBlur=7;ctx.shadowOffsetY=2}
 face(ctx,[topL,topB,baseB,baseL],pal[0]);
 face(ctx,[topR,baseR,baseB,topB],pal[1]);
 face(ctx,[top,topR,topB,topL],pal[2]);
 ctx.beginPath();ctx.moveTo(baseL.x,baseL.y);ctx.lineTo(baseB.x,baseB.y);ctx.lineTo(baseR.x,baseR.y);ctx.strokeStyle='#785d4b';ctx.lineWidth=1;ctx.stroke();
 drawWindows(ctx,{p,baseL,baseR,baseB,topL,topR,topB,top},b.type,b.windows||2,b.upperFloor);
 if(b.type==='shop'||b.type==='bakery')drawSign(ctx,p.x,topY+hh*.65,b.type==='bakery'?'نان':'فروش',b.signStyle,hh);
 if(b.type==='house'&&b.tank)drawTank(ctx,p.x-hw*.28,topY-3);
 if(b.type==='house'&&b.antenna)drawAntenna(ctx,p.x+hw*.25,topY-2);
 if(b.type==='workshop')drawWorkshop(ctx,p.x+hw*.15,topY-3,b);
 if(b.type==='bakery'&&b.chimney)drawChimney(ctx,p.x+hw*.25,topY-2);
 drawLevelBadge(ctx,p.x,topY-10,b.level||1);ctx.restore();
}
function face(c,a,f){c.fillStyle=f;c.beginPath();c.moveTo(a[0].x,a[0].y);for(let i=1;i<a.length;i++)c.lineTo(a[i].x,a[i].y);c.closePath();c.fill()}
function drawWindows(c,g,type,count,upper){
 const n=Math.max(2,Math.min(4,count));
 const pairs=[[.32,.26],[.68,.26],[.32,.58],[.68,.58]];
 for(let i=0;i<n;i++){
  const u=pairs[i], side=i%2===0?'L':'R';
  const a=side==='L'?g.baseL:g.baseR, b=g.baseB;
  const t=side==='L'?g.topL:g.topR;
  const q1={x:a.x+(b.x-a.x)*u[0],y:a.y+(b.y-a.y)*u[0]};
  const q2={x:t.x+(g.topB.x-t.x)*u[0],y:t.y+(g.topB.y-t.y)*u[0]};
  const yy=u[1];
  const x1=q1.x+(q2.x-q1.x)*yy,y1=q1.y+(q2.y-q1.y)*yy;
  const x2=x1+(b.x-a.x)*.09,y2=y1+(b.y-a.y)*.09;
  const x3=x2+(q2.x-q1.x)*.18,y3=y2+(q2.y-q1.y)*.18;
  const x4=x1+(q2.x-q1.x)*.18,y4=y1+(q2.y-q1.y)*.18;
  c.fillStyle=type==='bakery'?'#d9bd74':'#557a84';c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.lineTo(x3,y3);c.lineTo(x4,y4);c.closePath();c.fill();
 }
 if(upper){c.fillStyle='#557a84';c.beginPath();c.moveTo(g.top.x-3,g.top.y+hhSafe(g));c.lineTo(g.top.x+3,g.top.y+hhSafe(g));c.lineTo(g.top.x+4,g.top.y+hhSafe(g)+8);c.lineTo(g.top.x-4,g.top.y+hhSafe(g)+8);c.closePath();c.fill()}
}
function hhSafe(g){return Math.max(4,(g.topR.y-g.top.y)*.22)}
function drawSign(c,x,y,text,style='wide',hh=10){const w=style==='compact'?24:32,h=Math.max(8,Math.min(12,hh*.34));c.save();c.fillStyle='#ead9ad';c.fillRect(x-w/2,y-h/2,w,h);c.fillStyle='#493d2f';c.font='8px Vazirmatn';c.textAlign='center';c.fillText(text,x,y+3);c.restore()}
function drawTank(c,x,y){c.fillStyle='#587875';c.beginPath();c.ellipse(x,y-5,6,2.5,0,0,Math.PI*2);c.fill();c.fillRect(x-6,y-5,12,6)}
function drawAntenna(c,x,y){c.strokeStyle='#555';c.lineWidth=1;c.beginPath();c.moveTo(x,y);c.lineTo(x,y-10);c.lineTo(x+3,y-13);c.stroke()}
function drawChimney(c,x,y){c.fillStyle='#8c6650';c.fillRect(x-3,y-7,6,10)}
function drawWorkshop(c,x,y,b){c.fillStyle='#404944';c.fillRect(x-7,y-5,14,5);if(b.vent)c.fillRect(x+8,y-8,4,8);if(b.stack){c.fillStyle='#777';c.fillRect(x-11,y-12,4,9)}}
function drawLevelBadge(c,x,y,level){if(level<2)return;c.fillStyle='rgba(247,241,231,.92)';c.beginPath();c.arc(x,y,8,0,Math.PI*2);c.fill();c.fillStyle='#5d5144';c.font='bold 9px Vazirmatn';c.textAlign='center';c.textBaseline='middle';c.fillText(String(level),x,y+.5);c.textBaseline='alphabetic'}
function drawPark(ctx,iso,b,hover){
 const p=iso.worldToScreen(b.x+.5,b.y+.5),tw=iso.tileWidth,th=iso.tileHeight,scale=1+(Math.max(1,b.level||1)-1)*.12;
 const hw=tw*.34,hh=th*.34;
 ctx.save();
 ctx.fillStyle=hover?'#a5b57f':'#91a16e';ctx.beginPath();ctx.moveTo(p.x,p.y-hh);ctx.lineTo(p.x+hw,p.y);ctx.lineTo(p.x,p.y+hh);ctx.lineTo(p.x-hw,p.y);ctx.closePath();ctx.fill();
 ctx.fillStyle='#6d7f55';ctx.fillRect(p.x-2*scale,p.y-16*scale,4*scale,16*scale);ctx.beginPath();ctx.arc(p.x,p.y-21*scale,8*scale,0,Math.PI*2);ctx.fill();
 for(let i=1;i<(b.trees||1);i++){const ox=(i%2?-.24:.24)*tw;ctx.beginPath();ctx.arc(p.x+ox,p.y-12*scale,6*scale,0,Math.PI*2);ctx.fill()}
 if(b.bench){ctx.fillStyle='#725b43';ctx.fillRect(p.x-tw*.18,p.y+th*.12,tw*.36,3)}
 drawLevelBadge(ctx,p.x,p.y-32*scale,b.level||1);ctx.restore()
}
function drawFarm(ctx,iso,b,hover){
 const p=iso.worldToScreen(b.x+.5,b.y+.5),tw=iso.tileWidth,th=iso.tileHeight,scale=1+(Math.max(1,b.level||1)-1)*.06;
 ctx.save();ctx.fillStyle=hover?'#c3aa70':'#b49a61';ctx.beginPath();ctx.moveTo(p.x,p.y-th*.36);ctx.lineTo(p.x+tw*.34,p.y);ctx.lineTo(p.x,p.y+th*.36);ctx.lineTo(p.x-tw*.34,p.y);ctx.closePath();ctx.fill();
 ctx.strokeStyle='#8f794b';ctx.lineWidth=1;const rows=b.rows||4;for(let i=1;i<rows;i++){const t=i/rows,ly=p.y-th*.36+(th*.72*t);ctx.beginPath();ctx.moveTo(p.x-tw*.34*(1-Math.abs(2*t-1)),ly);ctx.lineTo(p.x+tw*.34*(1-Math.abs(2*t-1)),ly);ctx.stroke()}
 if(b.shed){ctx.fillStyle='#7c6648';ctx.fillRect(p.x+tw*.08,p.y+th*.04,tw*.16,th*.12)}drawLevelBadge(ctx,p.x,p.y+th*.08,b.level||1);ctx.restore()
}
