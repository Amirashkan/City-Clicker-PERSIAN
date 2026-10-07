const menu=document.querySelector('#start-menu');
const continueBtn=document.querySelector('#start-continue');
const newBtn=document.querySelector('#start-new');
const settingsBtn=document.querySelector('#start-settings');
const hasSave=()=>!!localStorage.getItem('city-clicker-save-v1');
function syncMenu(){const saved=hasSave();continueBtn.hidden=!saved;newBtn.textContent=saved?'بازی جدید':'شروع بازی';}
function enterGame(){menu.classList.add('hidden');menu.setAttribute('aria-hidden','true');}
continueBtn.addEventListener('click',enterGame);
newBtn.addEventListener('click',()=>{if(hasSave()&&!confirm('بازی فعلی پاک شود و از ابتدا شروع شود؟'))return;localStorage.removeItem('city-clicker-save-v1');localStorage.removeItem('city-clicker-regions');location.reload();});
settingsBtn.addEventListener('click',()=>{enterGame();document.querySelector('#settings-button')?.click();});
syncMenu();