export function drawBuilding(ctx,iso,b,hover=false){
 if(b.type==='park')return drawPark(ctx,iso,b,hover);
 if(b.type==='farm')return drawFarm(ctx,iso,b,hover);
 const p=iso.worldToScreen(b.x+.5,b.y+.5),tw=iso.tileWidth,th=iso.tileHeight;
 const level=Math.max(1,b.level||1);
 const sx=Math.max(.58,Math.min(.88,b.w||.78)),sy=Math.max(.58,Math.min(.88,b.d||.78));
 const hw=tw*sx/2,hh=th*sy/2;
 const baseHeight=b.height!=null?b.height*th:(b.h||34)*(th/27);
 const h=baseHeight+(level-1)*th*.24;
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
 if(level>=2)drawUpperModel(ctx,p,tw,th,g,b,pal,level);
 if(level>=3)drawRooftopModel(ctx,p,tw,th,g,b,pal);
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
 // The lower point of an added floor is exactly the roof of the floor below.
 // No arbitrary vertical offset: this keeps the stack watertight at every zoom.
 const ux=level===2?p.x:p.x+tw*.035;
 const uy=g.top.y;
 const pal=[basePal[0],basePal[1],basePal[2]];
 const u=drawBlock(c,{x:ux,y:uy},tw*s/2,th*s*.28,upH,pal);
 const count=level===2?2:3;
 drawWindows(c,u,b.type,count,false);
 if(b.type==='house'){
  drawRoofCap(c,u,level===2?tw*.18:tw*.24,level===2?th*.10:th*.13);
 }else if(b.type==='shop'){
  drawSign(c,ux,u.top.y+th*.09,'فروش',level===2?'wide':'compact',th*.28);
 }else if(b.type==='bakery'){
  drawSign(c,ux,u.top.y+th*.09,'نان','compact',th*.28);
  drawChimney(c,ux+tw*.16,u.top.y-2);
 }else if(b.type==='workshop'){
  drawWorkshop(c,ux+tw*.08,u.top.y-2,{vent:true,stack:level>=3});
 }
 return u;
}

