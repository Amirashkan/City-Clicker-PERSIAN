import {IsoProjection} from './map/IsoProjection.js';
import {BUILDINGS,createBuilding} from './buildings/registry.js';
import {calculateEconomy} from './core/Rules.js';
import {drawBuilding} from './renderer/BuildingRenderer.js';
import {drawGrid} from './renderer/GridRenderer.js';

const canvas=document.querySelector('#city'),ctx=canvas.getContext('2d');
const moneyEl=document.querySelector('#money'),incomeEl=document.querySelector('#income'),clickEl=document.querySelector('#click-value');
const hint=document.querySelector('#hint'),tools=document.querySelector('#building-tools'),feedback=document.querySelector('#click-feedback');
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
function validTile(x,y){return x>=0&&y>=0&&x<GRID&&y<GRID&&!state.buildings.some(b=>b.x===x&&b.y===y)}
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
  hint.textContent='خانه را روی یک خانه خالی بگذار.';
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
  if(!state.buildMode){manualClick(x,y);return}
  const tile=iso.tileAt(x,y),def=BUILDINGS[state.selected];
  if(!validTile(tile.x,tile.y)){
    hint.textContent='این خانه قابل ساخت نیست.';
    return;
  }
  if(state.money<def.cost){
    hint.textContent='پول کافی نیست.';
    return;
  }
  state.money-=def.cost;
  state.buildings.push(createBuilding(state.selected,{x:tile.x,y:tile.y}));
  refreshEconomy();
  hint.textContent=def.name+' ساخته شد.';
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