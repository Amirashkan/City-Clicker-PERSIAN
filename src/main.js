import{IsoProjection}from'./map/IsoProjection.js';
import{BUILDINGS,createBuilding,getUpgradeCost}from'./buildings/registry.js';
import{calculateEconomy,evaluateBuilding,getLevelStats,getAgeStats}from'./core/Rules.js';
import{drawBuilding}from'./renderer/BuildingRenderer.js';
import{drawGrid}from'./renderer/GridRenderer.js';
import{drawAmbientLife}from'./renderer/AmbientLife.js';
import{generateMapMask}from'./map/MapGenerator.js';
import{audio}from'./core/AudioManager.js';

const canvas=document.querySelector('#city'),ctx=canvas.getContext('2d');
const moneyEl=document.querySelector('#money'),incomeEl=document.querySelector('#income'),clickEl=document.querySelector('#click-value');
const hint=document.querySelector('#hint'),tools=document.querySelector('#building-tools'),feedback=document.querySelector('#click-feedback');
const buildingPanel=document.querySelector('#building-panel');
const cityStatusPanel=document.querySelector('#city-status-panel');
const cityStatusButton=document.querySelector('#city-status-button');
const constructionInfoToggle=document.querySelector('#construction-info-toggle');

// --- User settings ---------------------------------------------------------
const SETTINGS_KEY='city-clicker-settings';
const SAVE_KEY='city-clicker-save-v1';
const uiSettings={theme:'light',uiSize:'normal',sounds:true,music:true};
try{
  const saved=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}');
  if(saved.theme==='dark'||saved.theme==='light')uiSettings.theme=saved.theme;
  if(['small','normal','large'].includes(saved.uiSize))uiSettings.uiSize=saved.uiSize;
  if(typeof saved.sounds==='boolean')uiSettings.sounds=saved.sounds;
  if(typeof saved.music==='boolean')uiSettings.music=saved.music;
}catch{}

function applySettings(){
  document.documentElement.classList.toggle('dark',uiSettings.theme==='dark');
  const scales={small:.88,normal:1,large:1.14};
  document.documentElement.style.setProperty('--ui-scale',scales[uiSettings.uiSize]);
  document.querySelectorAll('[data-theme]').forEach(b=>b.classList.toggle('active',b.dataset.theme===uiSettings.theme));
  document.querySelectorAll('[data-ui-size]').forEach(b=>b.classList.toggle('active',b.dataset.uiSize===uiSettings.uiSize));
  document.querySelectorAll('[data-sound-toggle]').forEach(b=>b.classList.toggle('active',b.dataset.soundToggle==='sounds' ? uiSettings.sounds : uiSettings.music));
  document.querySelectorAll('[data-sound-toggle]').forEach(b=>{const on=b.dataset.soundToggle==='sounds'?uiSettings.sounds:uiSettings.music;b.setAttribute('aria-pressed',String(on));b.textContent=(b.dataset.soundToggle==='sounds'?'صداهای بازی: ':'موسیقی: ')+(on?'روشن':'خاموش')});
  audio.toggleSounds(uiSettings.sounds);
  audio.toggleMusic(uiSettings.music);
  try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(uiSettings))}catch{}
}
const cityStatusEls={
  money:document.querySelector('#city-status-money'),income:document.querySelector('#city-status-income'),click:document.querySelector('#city-status-click'),
  total:document.querySelector('#city-status-total'),houses:document.querySelector('#city-status-houses'),shops:document.querySelector('#city-status-shops'),
  bakeries:document.querySelector('#city-status-bakeries'),parks:document.querySelector('#city-status-parks'),workshops:document.querySelector('#city-status-workshops'),
  farms:document.querySelector('#city-status-farms'),land:document.querySelector('#city-status-land'),level:document.querySelector('#city-status-level'),
  maxed:document.querySelector('#city-status-maxed'),influence:document.querySelector('#city-status-influence'),radius:document.querySelector('#city-status-radius')
};
function updateCityStatus(){
  const counts={house:0,shop:0,bakery:0,park:0,workshop:0,farm:0};
  let levelSum=0,maxed=0,influence=0,radius=0;
  for(const b of state.buildings){
    counts[b.type]=(counts[b.type]||0)+1;
    const level=b.level||1;
    levelSum+=level;
    if(level>=3)maxed++;
    const stats=getLevelStats(level);
    influence+=stats.multiplier;
    radius+=stats.radius;
  }
  const total=state.buildings.length;
  const land=Math.round(total/(GRID*GRID)*100);
  cityStatusEls.money.textContent=Math.floor(state.money).toLocaleString('fa-IR');
  cityStatusEls.income.textContent=state.economy.autoClick.toLocaleString('fa-IR',{maximumFractionDigits:1});
  cityStatusEls.click.textContent=state.economy.clickValue.toLocaleString('fa-IR',{maximumFractionDigits:1});
  cityStatusEls.total.textContent=total.toLocaleString('fa-IR');
  cityStatusEls.houses.textContent=counts.house.toLocaleString('fa-IR');
  cityStatusEls.shops.textContent=counts.shop.toLocaleString('fa-IR');
  cityStatusEls.bakeries.textContent=counts.bakery.toLocaleString('fa-IR');
  cityStatusEls.parks.textContent=counts.park.toLocaleString('fa-IR');
  cityStatusEls.workshops.textContent=counts.workshop.toLocaleString('fa-IR');
  cityStatusEls.farms.textContent=counts.farm.toLocaleString('fa-IR');
  cityStatusEls.land.textContent=land.toLocaleString('fa-IR')+'٪';
  cityStatusEls.level.textContent=(total?levelSum/total:1).toLocaleString('fa-IR',{maximumFractionDigits:2});
  cityStatusEls.maxed.textContent=maxed.toLocaleString('fa-IR');
  cityStatusEls.influence.textContent=influence.toLocaleString('fa-IR',{maximumFractionDigits:1});
  cityStatusEls.radius.textContent=radius.toLocaleString('fa-IR');
}
cityStatusButton.addEventListener('click',()=>{
  updateCityStatus();
  cityStatusPanel.classList.add('visible');
  cityStatusPanel.setAttribute('aria-hidden','false');
});
function closeCityStatus(){
  cityStatusPanel.classList.remove('visible');
  cityStatusPanel.setAttribute('aria-hidden','true');
}
document.querySelector('#city-status-close').addEventListener('click',closeCityStatus);
cityStatusPanel.addEventListener('click',e=>{if(e.target===cityStatusPanel)closeCityStatus()});

const settingsPanel=document.querySelector('#settings-panel');
document.querySelector('#settings-button').addEventListener('click',()=>{audio.play('ui-open');
  settingsPanel.classList.add('visible');
  settingsPanel.setAttribute('aria-hidden','false');
});
function closeSettings(){
  settingsPanel.classList.remove('visible');
  settingsPanel.setAttribute('aria-hidden','true');
}
document.querySelector('#settings-close').addEventListener('click',closeSettings);
settingsPanel.addEventListener('click',e=>{if(e.target===settingsPanel)closeSettings()});
document.querySelectorAll('[data-theme]').forEach(button=>{
  button.addEventListener('click',()=>{uiSettings.theme=button.dataset.theme;applySettings()});
});
document.querySelectorAll('[data-ui-size]').forEach(button=>{
  button.addEventListener('click',()=>{uiSettings.uiSize=button.dataset.uiSize;applySettings()});
});
document.querySelectorAll('[data-sound-toggle]').forEach(button=>{
  button.addEventListener('click',()=>{
    if(button.dataset.soundToggle==='sounds')uiSettings.sounds=!uiSettings.sounds;
    else uiSettings.music=!uiSettings.music;
    applySettings();
  });
});
document.querySelector('#reset-game').addEventListener('click',resetGame);

function setupInfoPanel(buttonId,panelId,closeId){
  const panel=document.querySelector(panelId);
  document.querySelector(buttonId).addEventListener('click',()=>{
    settingsPanel.classList.remove('visible');
    settingsPanel.setAttribute('aria-hidden','true');
    panel.classList.add('visible');
    panel.setAttribute('aria-hidden','false');
  });
  const close=()=>{panel.classList.remove('visible');panel.setAttribute('aria-hidden','true')};
  document.querySelector(closeId).addEventListener('click',close);
  panel.addEventListener('click',e=>{if(e.target===panel)close()});
}
setupInfoPanel('#game-guide-button','#game-guide-panel','#game-guide-close');
setupInfoPanel('#about-game-button','#about-game-panel','#about-game-close');

applySettings();
audio.init();
// ---------------------------------------------------------------------------

const GRID=15;
const baseMapMask=generateMapMask(GRID,GRID);
const mapMask=baseMapMask.map(row=>row.slice());

// --- Purchasable map expansion --------------------------------------------
// The initial city occupies the generated central land mass. The four edge
// chunks are deliberately part of the map mask, but remain locked until the
// player buys them. This makes expansion visible and keeps each purchase as
// a real extension of the buildable city rather than merely a cosmetic flag.
const REGION_KEY='city-clicker-regions';
const REGION_DEFS=[
  {id:'north',name:'منطقه شمالی',cost:2500,tiles:[[6,0],[7,0],[8,0],[5,1],[6,1],[7,1],[8,1],[9,1],[5,2],[6,2],[7,2],[8,2],[9,2]]},
  {id:'east',name:'منطقه شرقی',cost:5000,tiles:[[12,5],[13,5],[14,5],[12,6],[13,6],[14,6],[12,7],[13,7],[14,7],[12,8],[13,8],[14,8],[12,9],[13,9],[14,9]]},
  {id:'south',name:'منطقه جنوبی',cost:8500,tiles:[[5,12],[6,12],[7,12],[8,12],[9,12],[5,13],[6,13],[7,13],[8,13],[9,13],[6,14],[7,14],[8,14]]},
  {id:'west',name:'منطقه غربی',cost:12000,tiles:[[0,6],[1,6],[2,6],[0,7],[1,7],[2,7],[0,8],[1,8],[2,8],[0,9],[1,9],[2,9],[0,5],[1,5],[2,5]]}
];

// Expansion tiles are rendered as locked land even when the generated
// organic mask would otherwise exclude them.
for(const region of REGION_DEFS){
  for(const [x,y] of region.tiles){
    if(mapMask[y]&&x>=0&&x<GRID) mapMask[y][x]=true;
  }
}
let purchasedRegions=[];
try{purchasedRegions=JSON.parse(localStorage.getItem(REGION_KEY)||'[]').filter(id=>REGION_DEFS.some(r=>r.id===id));}catch{}
function saveRegions(){try{localStorage.setItem(REGION_KEY,JSON.stringify(purchasedRegions))}catch{}}
function regionAtTile(x,y){if(baseMapMask[y]?.[x])return null;return REGION_DEFS.find(r=>r.tiles.some(([tx,ty])=>tx===x&&ty===y))||null}
function isRegionPurchased(r){return purchasedRegions.includes(r.id)}
function isUnlockedTile(x,y){if(baseMapMask[y]?.[x])return true;const region=regionAtTile(x,y);return !!region&&isRegionPurchased(region)}
function getUnlockedMask(){return mapMask.map((row,y)=>row.map((cell,x)=>cell&&isUnlockedTile(x,y)))}
function showRegionPurchase(region){
 buildingPanel.innerHTML='<button class="building-close" type="button" aria-label="بستن">×</button><div class="building-panel-title">'+region.name+'</div><div class="building-panel-meta">این منطقه هنوز خریداری نشده است.</div><div class="building-panel-grid"><span>هزینه خرید</span><b>'+region.cost.toLocaleString('fa-IR')+' تومان</b><span class="building-effect">بعد از خرید، خانه‌های این منطقه برای ساخت‌وساز باز می‌شوند.</span></div><button class="upgrade-building" type="button" '+(state.money<region.cost?'disabled':'')+'>خرید منطقه · '+region.cost.toLocaleString('fa-IR')+' تومان</button>';
 buildingPanel.classList.add('visible');buildingPanel.querySelector('.building-close').onclick=()=>buildingPanel.classList.remove('visible');buildingPanel.querySelector('.upgrade-building').onclick=()=>{if(state.money>=region.cost){state.money-=region.cost;purchasedRegions.push(region.id);saveRegions();saveGame();audio.play('unlock');buildingPanel.classList.remove('visible');hint.textContent=region.name+' خریداری شد.';render()}};
}

const state={
  money:500,buildMode:false,demolishMode:false,selected:'house',hover:null,buildings:[],
  zoom:1,
  economy:{autoClick:0,clickValue:1},
  panX:0,panY:0,pointer:null,effectRadiusBuilding:null,effectRadiusVisible:false
};
let iso;

function saveGame(){try{localStorage.setItem(SAVE_KEY,JSON.stringify({money:state.money,buildings:state.buildings,purchasedRegions,savedAt:Date.now()}))}catch{}}
function loadGame(){try{const saved=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(!saved)return;if(Number.isFinite(saved.money))state.money=Math.max(0,saved.money);if(Array.isArray(saved.buildings)){state.buildings=saved.buildings.filter(b=>b&&BUILDINGS[b.type]&&Number.isInteger(b.x)&&Number.isInteger(b.y));state.buildings.forEach(b=>{b.level=Math.max(1,Math.min(3,Number(b.level)||1))})}if(Array.isArray(saved.purchasedRegions)){purchasedRegions=[...new Set(saved.purchasedRegions.filter(id=>REGION_DEFS.some(r=>r.id===id)))];saveRegions()}}catch{}}
function resetGame(){if(!confirm('همه پیشرفت شهر، ساختمان‌ها و مناطق خریداری‌شده پاک شود؟'))return;localStorage.removeItem(SAVE_KEY);localStorage.removeItem(REGION_KEY);state.money=500;state.buildings=[];state.buildMode=false;state.selected='house';state.effectRadiusBuilding=null;state.effectRadiusVisible=false;purchasedRegions=[];refreshEconomy();constructionInfoToggle.classList.remove('visible');buildingPanel.classList.remove('visible');document.querySelectorAll('[data-building]').forEach(b=>b.classList.remove('active'));hint.textContent='شهر از نو شروع شد.';closeSettings();render();saveGame()}
const NEW_GAME_KEY='city-clicker-new-game';
if(localStorage.getItem(NEW_GAME_KEY)==='1'){
  localStorage.removeItem(NEW_GAME_KEY);
  localStorage.removeItem(SAVE_KEY);
  localStorage.removeItem(REGION_KEY);
  state.money=500;
  state.buildings=[];
  purchasedRegions=[];
}else{
  loadGame();
}

function resize(){
  const dpr=Math.min(devicePixelRatio||1,2),r=canvas.getBoundingClientRect();
  canvas.width=r.width*dpr;canvas.height=r.height*dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const baseTileWidth=Math.max(34,Math.min(54,r.width/8.2));
  const tileWidth=baseTileWidth*state.zoom;
  const tileHeight=(baseTileWidth/2)*state.zoom;
  iso=new IsoProjection({
    tileWidth,tileHeight,
    originX:r.width/2+state.panX,
    originY:Math.max(55,r.height*.20)+state.panY
  });
  render();
}
function buildingAtTile(x,y){return state.buildings.find(b=>b.x===x&&b.y===y)||null}
function validTile(x,y){return x>=0&&y>=0&&x<GRID&&y<GRID&&isUnlockedTile(x,y)&&!buildingAtTile(x,y)}
function refreshEconomy(){state.economy=calculateEconomy(state.buildings)}
function render(){
  if(!iso)return;
  const r=canvas.getBoundingClientRect();
  ctx.clearRect(0,0,r.width,r.height);
  drawGrid(ctx,iso,GRID,GRID,state.hover,mapMask,getUnlockedMask());if(state.effectRadiusVisible&&state.effectRadiusBuilding)drawEffectRadius(state.effectRadiusBuilding);
  drawAmbientLife(ctx,iso,performance.now(),state.buildings);
  [...state.buildings].sort((a,b)=>(a.x+a.y)-(b.x+b.y))
    .forEach(b=>drawBuilding(ctx,iso,b,state.hover?.x===b.x&&state.hover?.y===b.y));
  moneyEl.textContent=Math.floor(state.money).toLocaleString('fa-IR');
  incomeEl.textContent=state.economy.autoClick.toLocaleString('fa-IR',{maximumFractionDigits:1});
  clickEl.textContent=state.economy.clickValue.toLocaleString('fa-IR');
  if(cityStatusPanel.classList.contains('visible'))updateCityStatus();
}
function choose(type){
  state.selected=type;state.buildMode=true;state.demolishMode=false;
  document.querySelector('#demolish-mode')?.classList.remove('active');
  document.querySelectorAll('[data-building]').forEach(b=>b.classList.toggle('active',b.dataset.building===type));
  constructionInfoToggle.classList.add('visible');
  buildingPanel.classList.remove('visible');
  hint.textContent=BUILDINGS[type].name+' را روی یک خانه خالی بگذار.';
}
function showConstructionInfo(type){
  const def=BUILDINGS[type];
  const effects={
    house:[['اثر پایه: +1 درآمد','good'],['از مغازه‌های اطراف: +0.5 درآمد به ازای هر قدرت','good'],['از نانوایی‌های اطراف: +0.75 درآمد به ازای هر قدرت','good'],['از پارک‌های اطراف: +0.5 درآمد به ازای هر قدرت','good'],['از مزاحمت مزرعه/کارگاه اطراف: -1 درآمد به ازای هر قدرت','bad']],
    shop:[['اثر پایه: +1 درآمد','good'],['به خانه‌های اطراف: +0.25 درآمد به ازای هر قدرت','good']],
    bakery:[['اثر پایه: +1.5 درآمد','good'],['به خانه‌های اطراف: +0.25 درآمد به ازای هر قدرت','good'],['از مزرعه‌های اطراف: +0.5 تولید به ازای هر قدرت','good'],['از مغازه‌های اطراف: +0.25 درآمد به ازای هر قدرت','good']],
    park:[['اثر پایه: +0.5 درآمد','good'],['اثر پایه: +1 لمس','good'],['به خانه‌های اطراف: +0.25 درآمد به ازای هر قدرت','good']],
    workshop:[['اثر پایه: +3 لمس','good'],['از مزرعه‌های اطراف: +0.75 لمس به ازای هر قدرت','good'],['مزاحمت برای خانه‌های اطراف: -1 درآمد به ازای هر قدرت','bad']],
    farm:[['اثر پایه: +2 لمس','good'],['از کارگاه‌های اطراف: +0.75 لمس به ازای هر قدرت','good'],['به نانوایی‌های اطراف: +0.5 لمس به ازای هر قدرت','good'],['مزاحمت برای خانه‌های اطراف: -1 درآمد به ازای هر قدرت','bad']]
  }[type]||[];
  buildingPanel.innerHTML='<button class="building-close" type="button" aria-label="بستن">×</button>'+
    '<div class="building-panel-title">'+def.name+'</div>'+
    '<div class="building-panel-meta">اثر پایه و تمام اثرهای اطراف</div>'+
    '<div class="construction-effects">'+effects.map(([text,kind])=>'<div class="construction-effect '+kind+'">'+text+'</div>').join('')+'</div>';
  buildingPanel.classList.add('construction-info','visible');
  buildingPanel.querySelector('.building-close').onclick=()=>{buildingPanel.classList.remove('visible');state.effectRadiusVisible=false;state.effectRadiusBuilding=null;render()};
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
function pointInDiamond(px,py,cx,cy,halfW,halfH){
  return Math.abs(px-cx)/halfW + Math.abs(py-cy)/halfH <= 1;
}
function buildingAt(screenX,screenY){
  const ordered=[...state.buildings].sort((a,b)=>{
    const az=a.x+a.y,bz=b.x+b.y;
    return bz-az;
  });

  // First hit the visible building body. This prevents a tall building beside
  // another tile from selecting the neighboring house underneath it.
  for(const b of ordered){
    const p=iso.worldToScreen(b.x+.5,b.y+.5);
    const tw=iso.tileWidth,th=iso.tileHeight,h=(b.height!=null?b.height*th:(b.h||34)*(th/27))+(Math.max(1,b.level||1)-1)*th*.24;
    const halfW=(b.w||.78)*tw*.72;
    const halfH=(b.d||.78)*th*.85;
    if(b.type==='park'){
      if(pointInDiamond(screenX,screenY,p.x,p.y-.02*th,tw*.42,th*.72) ||
         pointInDiamond(screenX,screenY,p.x,p.y-16,tw*.30,th*.55)) return b;
    }else if(b.type==='farm'){
      if(pointInDiamond(screenX,screenY,p.x,p.y,tw*.42,th*.62)) return b;
    }else{
      const bodyCenterY=p.y-h*.42;
      if(pointInDiamond(screenX,screenY,p.x,bodyCenterY,halfW,Math.max(th*.62,h*.58))) return b;
    }
  }

  // Then fall back to the exact occupied grid cell.
  const tile=iso.tileAt(screenX,screenY);
  return buildingAtTile(tile.x,tile.y);
}
function drawEffectRadius(b){
const radius=getLevelStats(b.level||1).radius;
ctx.save();
for(let y=Math.max(0,b.y-radius);y<=Math.min(GRID-1,b.y+radius);y++)for(let x=Math.max(0,b.x-radius);x<=Math.min(GRID-1,b.x+radius);x++){
if(Math.max(Math.abs(x-b.x),Math.abs(y-b.y))>radius||!mapMask[y]?.[x])continue;
const p1=iso.worldToScreen(x,y),p2=iso.worldToScreen(x+1,y),p3=iso.worldToScreen(x+1,y+1),p4=iso.worldToScreen(x,y+1);
ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.lineTo(p3.x,p3.y);ctx.lineTo(p4.x,p4.y);ctx.closePath();ctx.fillStyle='rgba(82,118,91,.16)';ctx.strokeStyle='rgba(82,118,91,.42)';ctx.lineWidth=1;ctx.fill();ctx.stroke();
}
const top=iso.worldToScreen(b.x+.5,b.y-radius),right=iso.worldToScreen(b.x+radius+1,b.y+.5),bottom=iso.worldToScreen(b.x+.5,b.y+radius+1),left=iso.worldToScreen(b.x-radius,b.y+.5);
ctx.beginPath();ctx.moveTo(top.x,top.y);ctx.lineTo(right.x,right.y);ctx.lineTo(bottom.x,bottom.y);ctx.lineTo(left.x,left.y);ctx.closePath();ctx.strokeStyle='rgba(58,91,69,.78)';ctx.lineWidth=2;ctx.setLineDash([6,4]);ctx.stroke();ctx.restore();
}
function showBuildingStatus(b){
  const def=BUILDINGS[b.type];
  const result=evaluateBuilding(b,state.buildings);
  const level=b.level||1;
  const stats=getLevelStats(level);
  const age=getAgeStats(b);
  const effectLines=[...result.received,...result.provided];
  const contribution=[];
  if(result.autoClick)contribution.push('درآمد این ساختمان: +'+result.autoClick.toLocaleString('fa-IR',{maximumFractionDigits:2})+' در ثانیه');
  if(result.clickValue)contribution.push('ارزش لمس از این ساختمان: +'+result.clickValue.toLocaleString('fa-IR',{maximumFractionDigits:2}));

  const radiusButton=state.effectRadiusVisible&&state.effectRadiusBuilding===b
    ? '<button class="effect-radius-toggle active" type="button">پنهان کردن شعاع اثر</button>'
    : '<button class="effect-radius-toggle" type="button">نمایش شعاع اثر</button>';
  state.effectRadiusBuilding=b;

  const upgradeCost=getUpgradeCost(b.type,level);
  const downgradeCost=level>1?getUpgradeCost(b.type,level-1):null;
  const downgradeMarkup=downgradeCost?'<button class="downgrade-building" type="button">تنزل به سطح '+(level-1)+' · بازگشت '+Math.floor(downgradeCost*.5).toLocaleString('fa-IR')+' تومان</button>':'';
  const upgradeMarkup=upgradeCost
    ? '<button class="upgrade-building" type="button" '+(state.money<upgradeCost?'disabled':'')+'>ارتقا به سطح '+(level+1)+' · '+upgradeCost.toLocaleString('fa-IR')+' تومان</button>'
    : '<div class="building-maxed">این ساختمان به حداکثر سطح رسیده است.</div>';

  buildingPanel.innerHTML='<button class="building-close" type="button" aria-label="بستن">×</button>'+
    '<div class="building-panel-title">'+def.name+'</div>'+
    '<div class="building-panel-meta">سطح ارتقا '+level+' · سطح عمر '+age.level+' از ۵ · شعاع اثر '+stats.radius+' خانه</div>'+
    '<div class="building-panel-grid"><span>هزینه ساخت</span><b>'+def.cost.toLocaleString('fa-IR')+' تومان</b>'+
    contribution.map(e=>'<span class="building-effect">'+e+'</span>').join('')+
    effectLines.map(e=>'<span class="building-effect">'+e+'</span>').join('')+
    '</div>'+
    '<div class="effect-radius-wrap">'+radiusButton+'</div>'+'<div class="upgrade-wrap">'+upgradeMarkup+downgradeMarkup+'</div>';

  buildingPanel.classList.add('visible');buildingPanel.querySelector('.effect-radius-toggle').onclick=()=>{state.effectRadiusVisible=!state.effectRadiusVisible;showBuildingStatus(b);render()};
  buildingPanel.querySelector('.building-close').onclick=()=>buildingPanel.classList.remove('visible');
  const downgradeButton=buildingPanel.querySelector('.downgrade-building');
  if(downgradeButton)downgradeButton.onclick=()=>{const freshCost=getUpgradeCost(b.type,(b.level||1)-1);if(!freshCost||b.level<=1)return;state.money+=Math.floor(freshCost*.5);b.level=Math.max(1,b.level-1);audio.play('upgrade');refreshEconomy();saveGame();hint.textContent=def.name+' به سطح '+b.level+' برگشت.';showBuildingStatus(b);render()};
  const upgradeButton=buildingPanel.querySelector('.upgrade-building');
  if(upgradeButton){
    upgradeButton.onclick=()=>{
      const freshCost=getUpgradeCost(b.type,b.level||1);
      if(!freshCost||state.money<freshCost)return;
      state.money-=freshCost;
      b.level=Math.min(3,(b.level||1)+1);
      audio.play('upgrade');
      refreshEconomy();
      saveGame();
      hint.textContent=def.name+' به سطح '+b.level+' رسید.';
      showBuildingStatus(b);
      render();
    };
  }
}
function manualClick(x,y){
  audio.play('click');
  state.money+=state.economy.clickValue;
  saveGame();
  showClickFeedback(x,y);
  render();
}
function cancelBuild(){
  state.effectRadiusVisible=false;state.demolishMode=false;
  document.querySelector('#demolish-mode')?.classList.remove('active');state.effectRadiusBuilding=null;state.buildMode=false;
  constructionInfoToggle.classList.remove('visible');
  buildingPanel.classList.remove('visible');
  document.querySelectorAll('[data-building]').forEach(b=>b.classList.remove('active'));
  hint.textContent='برای درآمد روی شهر بزن.';
}
document.querySelector('#cancel-build').addEventListener('click',cancelBuild);
const demolishButton=document.querySelector('#demolish-mode');
demolishButton.addEventListener('click',()=>{
  state.demolishMode=!state.demolishMode;state.buildMode=false;constructionInfoToggle.classList.remove('visible');buildingPanel.classList.remove('visible');
  document.querySelectorAll('[data-building]').forEach(b=>b.classList.remove('active'));demolishButton.classList.toggle('active',state.demolishMode);
  hint.textContent=state.demolishMode?'بولدوزر فعال است؛ روی ساختمان بزن تا حذف شود.':'برای درآمد روی شهر بزن.';
});
constructionInfoToggle.addEventListener('click',()=>{
  if(!state.buildMode)return;
  if(buildingPanel.classList.contains('visible')) buildingPanel.classList.remove('visible');
  else showConstructionInfo(state.selected);
});

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
  const region=regionAtTile(tile.x,tile.y);
  if(region&&!isRegionPurchased(region)){showRegionPurchase(region);return;}

  const clickedBuilding=buildingAt(x,y)||buildingAtTile(tile.x,tile.y);
  if(clickedBuilding){
    if(state.demolishMode){
      const level=clickedBuilding.level||1;let invested=BUILDINGS[clickedBuilding.type].cost;
      for(let l=1;l<level;l++)invested+=getUpgradeCost(clickedBuilding.type,l)||0;
      const refund=Math.floor(invested*.75);state.money+=refund;state.buildings=state.buildings.filter(item=>item!==clickedBuilding);audio.play('money');refreshEconomy();saveGame();buildingPanel.classList.remove('visible');hint.textContent=BUILDINGS[clickedBuilding.type].name+' حذف شد؛ '+refund.toLocaleString('fa-IR')+' تومان بازگشت.';render();
    }else showBuildingStatus(clickedBuilding);
    return;
  }

  buildingPanel.classList.remove('visible');state.effectRadiusVisible=false;state.effectRadiusBuilding=null;
  if(!state.buildMode){
    manualClick(x,y);
    return;
  }

  const def=BUILDINGS[state.selected];
  if(!validTile(tile.x,tile.y)){
    audio.play('error');
    hint.textContent='این خانه قابل ساخت نیست.';
    return;
  }
  if(state.money<def.cost){
    audio.play('error');
    hint.textContent='پول کافی نیست.';
    return;
  }

  state.money-=def.cost;
  const building=createBuilding(state.selected,{x:tile.x,y:tile.y});
  state.buildings.push(building);
  audio.play('buy');
  refreshEconomy();
  saveGame();

  // Construction is a one-shot action. Return immediately to the normal tap-to-earn state.
  state.buildMode=false;
  constructionInfoToggle.classList.remove('visible');
  buildingPanel.classList.remove('visible');
  document.querySelectorAll('[data-building]').forEach(button=>button.classList.remove('active'));
  hint.textContent=def.name+' ساخته شد؛ برای درآمد روی شهر بزن.';
  render();
});
canvas.addEventListener('pointercancel',()=>{state.pointer=null});

let pinch=null;
const touches=new Map();

function zoomAt(screenX,screenY,nextZoom){
  if(!iso)return;
  const before=iso.screenToWorld(screenX,screenY);
  state.zoom=Math.max(.65,Math.min(1.8,nextZoom));
  resize();
  const after=iso.worldToScreen(before.x,before.y);
  state.panX+=screenX-after.x;
  state.panY+=screenY-after.y;
  resize();
}

canvas.addEventListener('wheel',e=>{
  e.preventDefault();
  const r=canvas.getBoundingClientRect();
  const x=e.clientX-r.left,y=e.clientY-r.top;
  const factor=Math.exp(-e.deltaY*.0015);
  zoomAt(x,y,state.zoom*factor);
},{passive:false});

canvas.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='touch')return;
  touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(touches.size===2){
    const p=[...touches.values()];
    const cx=(p[0].x+p[1].x)/2,cy=(p[0].y+p[1].y)/2;
    const r=canvas.getBoundingClientRect();
    pinch={
      distance:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),
      zoom:state.zoom,
      centerX:cx-r.left,
      centerY:cy-r.top,
      panX:state.panX,
      panY:state.panY
    };
    state.pointer=null;
  }
});

canvas.addEventListener('pointermove',e=>{
  if(e.pointerType!=='touch'||!touches.has(e.pointerId)||!pinch)return;
  touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
  const p=[...touches.values()];
  if(p.length!==2)return;
  const d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);
  const cx=(p[0].x+p[1].x)/2,cy=(p[0].y+p[1].y)/2;
  const r=canvas.getBoundingClientRect();
  const ratio=d/pinch.distance;
  state.zoom=Math.max(.65,Math.min(1.8,pinch.zoom*ratio));
  state.panX=pinch.panX+(cx-r.left-pinch.centerX);
  state.panY=pinch.panY+(cy-r.top-pinch.centerY);
  resize();
});

function endTouch(e){
  if(e.pointerType!=='touch')return;
  touches.delete(e.pointerId);
  if(touches.size<2)pinch=null;
}
canvas.addEventListener('pointerup',endTouch);
canvas.addEventListener('pointercancel',endTouch);
setInterval(()=>{
  refreshEconomy();
  state.money+=state.economy.autoClick;
  saveGame();
  render();
},1000);
window.addEventListener('resize',resize);
window.addEventListener('beforeunload',saveGame);
refreshEconomy();
resize();

// Ambient life is purely visual: it never touches economy, building rules or input.
function animate(){
  render();
  requestAnimationFrame(animate);
}
animate();
