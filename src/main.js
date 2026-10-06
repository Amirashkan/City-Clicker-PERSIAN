import {IsoProjection} from './map/IsoProjection.js';
import {BUILDINGS,createBuilding} from './buildings/registry.js';
import {calculateEconomy} from './core/Rules.js';
import {drawBuilding} from './renderer/BuildingRenderer.js';
import {drawGrid} from './renderer/GridRenderer.js';

const canvas=document.querySelector('#city'),ctx=canvas.getContext('2d');
const moneyEl=document.querySelector('#money'),incomeEl=document.querySelector('#income'),clickEl=document.querySelector('#click-value');
const hint=document.querySelector('#hint'),tools=document.querySelector('#building-tools'),stage=document.querySelector('.city-stage'),feedback=document.querySelector('#click-feedback');
const GRID=15,state={money:500,buildMode:false,selected:'house',hover:null,buildings:[],economy:{autoClick:0,clickValue:1}};
let iso;

function resize(){const dpr=Math.min(devicePixelRatio||1,2),r=canvas.getBoundingClientRect();canvas.width=r.width*dpr;canvas.height=r.height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);iso=new IsoProjection({tileWidth:72,tileHeight:36,originX:r.width/2,originY:80});render()}
function validTile(x,y){return x>=0&&y>=0&&x<GRID&&y<GRID&&!state.buildings.some(b=>b.x===x&&b.y===y)}
function refreshEconomy(){state.economy=calculateEconomy(state.buildings)}
function render(){if(!iso)return;const r=canvas.getBoundingClientRect();ctx.clearRect(0,0,r.width,r.height);drawGrid(ctx,iso,GRID,GRID,state.hover);[...state.buildings].sort((a,b)=>(a.x+a.y)-(b.x+b.y)).forEach(b=>drawBuilding(ctx,iso,b,state.hover?.x===b.x&&state.hover?.y===b.y));moneyEl.textContent=Math.floor(state.money).toLocaleString('fa-IR');incomeEl.textContent=state.economy.autoClick.toLocaleString('fa-IR',{maximumFractionDigits:1});clickEl.textContent=state.economy.clickValue.toLocaleString('fa-IR')}

function choose(type){state.selected=type;state.buildMode=true;document.querySelectorAll('[data-building]').forEach(b=>b.classList.toggle('active',b.dataset.building===type));canvas.style.cursor='crosshair';hint.textContent='روی زمین خالی کلیک کن؛ هزینه '+BUILDINGS[type].cost.toLocaleString('fa-IR')+' تومان است.'}
Object.keys(BUILDINGS).forEach(type=>{const def=BUILDINGS[type],button=document.createElement('button');button.dataset.building=type;button.innerHTML=def.name+' <small>'+def.cost.toLocaleString('fa-IR')+'</small>';button.onclick=()=>choose(type);tools.appendChild(button)});

function showClickFeedback(x,y){const pop=document.createElement('span');pop.className='click-pop';pop.textContent='+'+state.economy.clickValue.toLocaleString('fa-IR')+' تومان';pop.style.left=x+'px';pop.style.top=y+'px';feedback.appendChild(pop);setTimeout(()=>pop.remove(),700)}
function manualClick(x,y){state.money+=state.economy.clickValue;showClickFeedback(x,y);render()}

document.querySelector('#cancel-build').onclick=()=>{state.buildMode=false;document.querySelectorAll('[data-building]').forEach(b=>b.classList.remove('active'));canvas.style.cursor='default';hint.textContent='ساختمان انتخاب کن.'};

stage.addEventListener('click',e=>{
 if(e.target.closest('#building-tools,#cancel-build'))return;
 const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
 if(!state.buildMode){manualClick(x,y);return}
 const p=iso.tileAt(x,y),def=BUILDINGS[state.selected];
 if(!validTile(p.x,p.y)){hint.textContent='این زمین خالی نیست.';return}
 if(state.money<def.cost){hint.textContent='پول کافی نیست.';return}
 state.money-=def.cost;state.buildings.push(createBuilding(state.selected,{x:p.x,y:p.y}));refreshEconomy();hint.textContent=def.name+' ساخته شد.';render();
});

canvas.addEventListener('mousemove',e=>{const r=canvas.getBoundingClientRect(),p=iso.tileAt(e.clientX-r.left,e.clientY-r.top);state.hover=validTile(p.x,p.y)?p:null;render()});
setInterval(()=>{refreshEconomy();state.money+=state.economy.autoClick;render()},1000);
window.addEventListener('resize',resize);refreshEconomy();resize();