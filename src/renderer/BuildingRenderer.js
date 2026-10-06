export function drawBuilding(ctx,iso,b,hover=false){
 if(b.type==='park')return drawPark(ctx,iso,b,hover);
 if(b.type==='farm')return drawFarm(ctx,iso,b,hover);
 const p=iso.worldToScreen(b.x+.5,b.y+.5),tw=iso.tileWidth,th=iso.tileHeight;
 const hw=(b.w||.78)*tw/2,hd=(b.d||.78)*th/2;
 const h=(b.h||34)+(Math.max(1,b.level||1)-1)*7;
 const topY=p.y-h;
 const pal={house:['#bd8158','#a96d4c','#d9a06e'],shop:['#b69a68','#987d53','#d0b37b'],bakery:['#c99462','#a8754e','#e0b37f'],workshop:['#7f8983','#68716c','#9da79f']}[b.type]||['#bd8158','#a96d4c','#d9a06e'];
 const l={x:p.x-hw,y:topY+hd*.15},r={x:p.x+hw,y:topY+hd*.15},t={x:p.x,y:topY-hd*.72},bt={x:p.x,y:topY+hd};
 ctx.save();
 if(hover){ctx.shadowColor='rgba(40,30,20,.22)';ctx.shadowBlur=7;ctx.shadowOffsetY=2}
 face(ctx,[l,bt,{x:bt.x,y:p.y+th/2},{x:l.x,y:p.y}],pal[0]);
 face(ctx,[r,bt,{x:bt.x,y:p.y+th/2},{x:r.x,y:p.y}],pal[1]);
 face(ctx,[t,r,bt,l],pal[2]);
 ctx.strokeStyle='#785d4b';ctx.lineWidth=1;ctx.stroke();
 drawWindows(ctx,p,hw,topY,b.type);
 if(b.type==='shop'||b.type==='bakery')drawSign(ctx,p.x,topY+18,b.type==='bakery'?'نان':'فروش');
 if(b.type==='house'&&b.tank)drawTank(ctx,p.x-hw*.28,topY-3);
 if(b.type==='workshop')drawWorkshop(ctx,p.x+hw*.15,topY-3);
 drawLevelBadge(ctx,p.x,topY-10,b.level||1);
 ctx.restore();
}
function face(c,a,f){c.fillStyle=f;c.beginPath();c.moveTo(a[0].x,a[0].y);for(let i=1;i<a.length;i++)c.lineTo(a[i].x,a[i].y);c.closePath();c.fill()}
function drawWindows(c,p,hw,y,type){
 const rows=type==='house'?1:1;
 for(let row=0;row<rows;row++)for(const s of[-1,1]){
  const x=p.x+s*hw*.68,yy=y+15+row*16;
  c.fillStyle=type==='bakery'?'#d9bd74':'#557a84';
  c.fillRect(x-3.5,yy-3,7,8);
 }
}
function drawSign(c,x,y,text){
 c.fillStyle='#ead9ad';c.fillRect(x-16,y-6,32,12);
 c.fillStyle='#493d2f';c.font='8px Vazirmatn';c.textAlign='center';c.fillText(text,x,y+3);
}
function drawTank(c,x,y){
 c.fillStyle='#587875';c.beginPath();c.ellipse(x,y-5,6,2.5,0,0,Math.PI*2);c.fill();c.fillRect(x-6,y-5,12,6);
}
function drawWorkshop(c,x,y){
 c.fillStyle='#404944';c.fillRect(x-7,y-5,14,5);
}
function drawLevelBadge(c,x,y,level){
 if(level<2)return;
 c.fillStyle='rgba(247,241,231,.92)';
 c.beginPath();c.arc(x,y,8,0,Math.PI*2);c.fill();
 c.fillStyle='#5d5144';c.font='bold 9px Vazirmatn';c.textAlign='center';c.textBaseline='middle';
 c.fillText(String(level),x,y+.5);
 c.textBaseline='alphabetic';
}
function drawPark(ctx,iso,b,hover){
 const p=iso.worldToScreen(b.x+.5,b.y+.5),tw=iso.tileWidth,th=iso.tileHeight;
 const scale=1+(Math.max(1,b.level||1)-1)*.12;
 ctx.save();
 ctx.fillStyle=hover?'#a5b57f':'#91a16e';
 ctx.beginPath();ctx.moveTo(p.x,p.y-9*scale);ctx.lineTo(p.x+tw*.38*scale,p.y+th*.12);ctx.lineTo(p.x,p.y+th*.44);ctx.lineTo(p.x-tw*.38*scale,p.y+th*.12);ctx.closePath();ctx.fill();
 ctx.fillStyle='#6d7f55';ctx.fillRect(p.x-2*scale,p.y-16*scale,4*scale,16*scale);ctx.beginPath();ctx.arc(p.x,p.y-21*scale,8*scale,0,Math.PI*2);ctx.fill();
 drawLevelBadge(ctx,p.x,p.y-32*scale,b.level||1);
 ctx.restore();
}
function drawFarm(ctx,iso,b,hover){
 const p=iso.worldToScreen(b.x+.5,b.y+.5),tw=iso.tileWidth,th=iso.tileHeight;
 const scale=1+(Math.max(1,b.level||1)-1)*.06;
 ctx.save();ctx.fillStyle=hover?'#c3aa70':'#b49a61';
 ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+tw*.38*scale,p.y+th*.5);ctx.lineTo(p.x,p.y+th);ctx.lineTo(p.x-tw*.38*scale,p.y+th*.5);ctx.closePath();ctx.fill();
 drawLevelBadge(ctx,p.x,p.y+th*.08,b.level||1);
 ctx.restore();
}
