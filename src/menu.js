const menu=document.querySelector('#start-menu');
const continueBtn=document.querySelector('#start-continue');
const newBtn=document.querySelector('#start-new');
const settingsBtn=document.querySelector('#start-settings');
const hasSave=()=>!!localStorage.getItem('city-clicker-save-v1');
const STARTED_KEY='city-clicker-started';
function enterGame(){menu.classList.add('hidden');menu.setAttribute('aria-hidden','true');sessionStorage.setItem(STARTED_KEY,'1');}
function syncMenu(){
  if(sessionStorage.getItem(STARTED_KEY)==='1'){enterGame();return}
  const saved=hasSave();
  continueBtn.hidden=!saved;
  newBtn.textContent=saved?'بازی جدید':'شروع بازی';
}
continueBtn.addEventListener('click',enterGame);
newBtn.addEventListener('click',()=>{
  if(hasSave()&&!confirm('بازی فعلی پاک شود و از ابتدا شروع شود؟'))return;
  localStorage.setItem('city-clicker-new-game','1');
  sessionStorage.setItem(STARTED_KEY,'1');
  location.reload();
});
settingsBtn.addEventListener('click',()=>{enterGame();document.querySelector('#settings-button')?.click();});
syncMenu();