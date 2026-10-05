import {IsoProjection} from './map/IsoProjection.js';
import {generateHouse} from './buildings/residential.js';
import {drawHouse} from './renderer/BuildingRenderer.js';
import {drawGrid} from './renderer/GridRenderer.js';

const canvas=document.querySelector('#city'),ctx=canvas.getContext('2d');
const moneyEl=document.querySelector('#money'),incomeEl=document.querySelector('#income'),hint=document.querySelector('#hint');
const GRID=15,state={money:500,buildMode:false,hover:null,buildings:[],clickValue:1};
let iso;

function resize(){
  const dpr=Math.min(devicePixelRatio||1,2),r=canvas.getBoundingClientRect();
  canvas.width=r.width*dpr;canvas.height=r.height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
  iso=new IsoProjection({tileWidth:72,tileHeight:36,originX:r.width/2,originY:55});
  render();
}
function income(){return state.buildings.length}
function render(){
  const r=canvas.getBoundingClientRect();ctx.clearRect(0,0,r.width,r.height);
  drawGrid(ctx,iso,GRID,GRID,state.hover);
  [...state.buildings].sort((a,b)=>(a.x+a.y)-(b.x+b.y)).forEach(b=>drawHouse(ctx,iso,b));
  moneyEl.textContent=Math.floor(state.money).toLocaleString('fa-IR');
  incomeEl.textContent=income().toLocaleString('fa-IR');
}
function validTile(x,y){return x>=0&&y>=0&&x<GRID&&y<GRID&&!state.buildings.some(b=>b.x===x&&b.y===y)}
document.querySelector('#build-house').onclick=()=>{
  state.buildMode=!state.buildMode;
  document.querySelector('#build-house').classList.toggle('active',state.buildMode);
  canvas.style.cursor=state.buildMode?'crosshair':'default';
  hint.textContent=state.buildMode?'روی یک خانه خالی کلیک کن.':'یک خانه انتخاب کن و روی زمین کلیک کن.';
};
document.querySelector('#earn').onclick=()=>{state.money+=state.clickValue;render()};
canvas.addEventListener('mousemove',e=>{
  const r=canvas.getBoundingClientRect(),p=iso.tileAt(e.clientX-r.left,e.clientY-r.top);
  state.hover=validTile(p.x,p.y)?p:null;render();
});
canvas.addEventListener('click',e=>{
  if(!state.buildMode)return;
  const r=canvas.getBoundingClientRect(),p=iso.tileAt(e.clientX-r.left,e.clientY-r.top);
  if(!validTile(p.x,p.y)){hint.textContent='این زمین خالی نیست.';return}
  if(state.money<100){hint.textContent='پول کافی نیست.';return}
  state.money-=100;state.buildings.push({...generateHouse({x:p.x,y:p.y,seed:Math.random()}),id:crypto.randomUUID()});
  hint.textContent='خانه ساخته شد.';
  render();
});
setInterval(()=>{state.money+=income();render()},1000);
window.addEventListener('resize',resize);resize();