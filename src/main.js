import {IsoProjection} from './map/IsoProjection.js';
import {BUILDINGS,createBuilding} from './buildings/registry.js';
import {calculateEconomy} from './core/Rules.js';
import {drawBuilding} from './renderer/BuildingRenderer.js';
import {drawGrid} from './renderer/GridRenderer.js';

const canvas=document.querySelector('#city'),ctx=canvas.getContext('2d');
const moneyEl=document.querySelector('#money'),incomeEl=document.querySelector('#income'),clickEl=document.querySelector('#click-value');
const hint=document.querySelector('#hint'),tools=document.querySelector('#building-tools'),feedback=document.querySelector('#click-feedback');
const buildingPanel=document.querySelector('#building-panel');
const GRID=15;
const state={
  money:500,buildMode:false,selected:'house',hover:null,buildings:[],
  economy:{autoClick:0,clickValue:1},
  panX:0,panY:0,pointer:null
};
let iso;

function resize(){
  const dpr=Math.min(devicePixelRatio||1,2),r=canvas.getBoundingClientRect();
  canvas.width=r.width*dpr;canvas.height=r.height*dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const tileWidth=Math.max(34,Math.min(54,r.width/8.2));
  const tileHeight=tileWidth/2;
  iso=new IsoProjection({
    tileWidth,tileHeight,
    originX:r.width/2+state.panX,
    originY:Math.max(55,r.height*.20)+state.panY
  });
  render();
}
function buildingAtTile(x,y){return state.buildings.find(b=>b.x===x&&b.y===y)||null}
function validTile(x,y){return x>=0&&y>=0&&x<GRID&&y<GRID&&!buildingAtTile(x,y)}
function refreshEconomy(){state.economy=calculateEconomy(state.buildings)}
function render(){
  if(!iso)return;
  const r=canvas.getBoundingClientRect();
  ctx.clearRect(0,0,r.width,r.height);
  drawGrid(ctx,iso,GRID,GRID,state.hover);
  [...state.buildings].sort((a,b)=>(a.x+a.y)-(b.x+b.y))
    .forEach(b=>drawBuilding(ctx,iso,b,state.hover?.x===b.x&&state.hover?.y===b.y));
  moneyEl.textContent=Math.floor(state.money).toLocaleString('fa-IR');
  incomeEl.textContent=state.economy.autoClick.toLocaleString('fa-IR',{maximumFractionDigits:1});
  clickEl.textContent=state.economy.clickValue.toLocaleString('fa-IR');
}
function choose(type){
  state.selected=type;state.buildMode=true;
  document.querySelectorAll('[data-building]').forEach(b=>b.classList.toggle('active',b.dataset.building===type));
  hint.textContent=BUILDINGS[type].name+' را روی یک خانه خالی بگذار.';
}
Object.keys(BUILDINGS).forEach(type=>{
  const def=BUILDINGS[type],button=document.createElement('button');
  button.dataset.building=type;
  button.innerHTML=def.name+' <small>'+def.cost.toLocaleString('fa-IR')+'</small>';
  button.type='button';
  button.addEventListener('click',()=>choose(type));
  tools.appendChild(button);
});
function showClickFeedback(x,y){
  const pop=document.createElement('span');
  pop.className='click-pop';
  pop.textContent='+'+state.economy.clickValue.toLocaleString('fa-IR')+' تومان';
  pop.style.left=x+'px';pop.style.top=y+'px';
  feedback.appendChild(pop);
  setTimeout(()=>pop.remove(),700);
}
function buildingAt(screenX,screenY){
  const tile=iso.tileAt(screenX,screenY);
  const onTile=buildingAtTile(tile.x,tile.y);
  if(onTile)return onTile;

  // Also allow tapping the raised body of a nearby building.
  for(const b of [...state.buildings].sort((a,b)=>(b.x+b.y)-(a.x+a.y))){
    const p=iso.worldToScreen(b.x+.5,b.y+.5),tw=iso.tileWidth,th=iso.tileHeight;
    const w=(b.w||.78)*tw,d=(b.d||.78)*th,h=b.h||34;
    const dx=Math.abs(screenX-p.x),dy=screenY-p.y;
    if(b.type==='park'){
      if(dx<=tw*.42&&dy>=-32&&dy<=th*.62)return b;
    }else if(b.type==='farm'){
      if(dx<=tw*.42&&dy>=-5&&dy<=th*1.08)return b;
    }else if(dx<=w*.72&&dy>=-h-d*.8&&dy<=th*.72){
      return b;
    }
  }
  return null;
}
function showBuildingStatus(b){
  const def=BUILDINGS[b.type]; let effects=[]; let penalty=0;
  if(b.residential)effects.push('درآمد +'+b.residential+' در ثانیه');
  if(b.urban)effects.push('درآمد شهری +'+b.urban+' در ثانیه');
  if(b.click)effects.push('ارزش هر لمس +'+b.click);
  if(b.production)effects.push('تولیدکننده');
  if(b.type==='house'){
    for(const producer of state.buildings){if(!producer.production)continue;const d=Math.max(Math.abs(b.x-producer.x),Math.abs(b.y-producer.y));if(d<=1)penalty+=1;else if(d===2)penalty+=.5;}
    if(penalty)effects.push('کاهش فعلی درآمد: '+penalty);
  }
  const status=penalty?'تحت تأثیر تولید':'فعال';
  buildingPanel.innerHTML='<button class="building-close" type="button" aria-label="بستن">×</button>'+
    '<div class="building-panel-title">'+def.name+'</div>'+
    '<div class="building-panel-meta">سطح '+(b.level||1)+' · وضعیت: '+status+'</div>'+
    '<div class="building-panel-grid"><span>هزینه ساخت</span><b>'+def.cost.toLocaleString('fa-IR')+' تومان</b>'+
    effects.map(e=>'<span class="building-effect">'+e+'</span>').join('')+'</div>';
  buildingPanel.classList.add('visible');
  buildingPanel.querySelector('.building-close').onclick=()=>buildingPanel.classList.remove('visible');
}
function manualClick(x,y){
  state.money+=state.economy.clickValue;
  showClickFeedback(x,y);
  render();
}
function cancelBuild(){
  state.buildMode=false;
  document.querySelectorAll('[data-building]').forEach(b=>b.classList.remove('active'));
  hint.textContent='برای درآمد روی شهر بزن.';
}
document.querySelector('#cancel-build').addEventListener('click',cancelBuild);

canvas.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;
  canvas.setPointerCapture?.(e.pointerId);
  state.pointer={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false,panX:state.panX,panY:state.panY};
});
canvas.addEventListener('pointermove',e=>{
  const p=state.pointer;
  const r=canvas.getBoundingClientRect();
  const x=e.clientX-r.left,y=e.clientY-r.top;
  const tile=iso.tileAt(x,y);
  state.hover=validTile(tile.x,tile.y)?tile:null;
  if(!p||p.id!==e.pointerId){render();return}
  const dx=e.clientX-p.x,dy=e.clientY-p.y;
  if(Math.abs(dx)+Math.abs(dy)>8)p.moved=true;
  if(p.moved){
    state.panX=p.panX+dx;state.panY=p.panY+dy;
    resize();
    return;
  }
  render();
});
canvas.addEventListener('pointerup',e=>{
  const p=state.pointer;
  state.pointer=null;
  if(!p||p.moved)return;
  const r=canvas.getBoundingClientRect();
  const x=e.clientX-r.left,y=e.clientY-r.top;
  const tile=iso.tileAt(x,y);

  // A building always wins over build mode: tapping any part of its tile opens its status.
  const clickedBuilding=buildingAt(x,y)||buildingAtTile(tile.x,tile.y);
  if(clickedBuilding){
    showBuildingStatus(clickedBuilding);
    return;
  }

  buildingPanel.classList.remove('visible');
  if(!state.buildMode){
    manualClick(x,y);
    return;
  }

  const def=BUILDINGS[state.selected];
  if(!validTile(tile.x,tile.y)){
    hint.textContent='این خانه قابل ساخت نیست.';
    return;
  }
  if(state.money<def.cost){
    hint.textContent='پول کافی نیست.';
    return;
  }

  state.money-=def.cost;
  const building=createBuilding(state.selected,{x:tile.x,y:tile.y});
  state.buildings.push(building);
  refreshEconomy();

  // Construction is a one-shot action. Return immediately to the normal tap-to-earn state.
  state.buildMode=false;
  document.querySelectorAll('[data-building]').forEach(button=>button.classList.remove('active'));
  hint.textContent=def.name+' ساخته شد؛ برای درآمد روی شهر بزن.';
  render();
});
canvas.addEventListener('pointercancel',()=>{state.pointer=null});
setInterval(()=>{
  refreshEconomy();
  state.money+=state.economy.autoClick;
  render();
},1000);
window.addEventListener('resize',resize);
refreshEconomy();
resize();