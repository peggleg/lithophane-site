import './theme.css';
const key='design-studio-theme',root=document.documentElement;
const toggle=document.createElement('button');toggle.className='theme-control quiet';toggle.type='button';document.querySelector('header')?.append(toggle);
function apply(value){const theme=value==='dark'?'dark':'light';root.dataset.theme=root.dataset.themePreference=theme;toggle.textContent=theme==='dark'?'Dark':'Light';toggle.setAttribute('aria-label','Dark theme');toggle.setAttribute('aria-pressed',String(theme==='dark'));}
toggle.onclick=()=>{apply(root.dataset.theme==='dark'?'light':'dark');try{localStorage.setItem(key,root.dataset.theme);}catch{}};
window.addEventListener('storage',e=>{if(e.key===key)apply(e.newValue);});apply(root.dataset.theme);
const nav=document.querySelector('header nav');
if(nav){
 const desk=nav.querySelector('a[href*="desk/"]');if(desk&&!nav.querySelector('a[href*="mounts/"]')){const a=document.createElement('a');a.href=desk.getAttribute('href').replace('desk/','mounts/');a.textContent='Desk mounts';nav.append(a);}
 const button=document.createElement('button');button.type='button';button.className='nav-toggle quiet';button.textContent='Menu';button.setAttribute('aria-expanded','false');nav.id='site-navigation';button.setAttribute('aria-controls',nav.id);nav.before(button);
 const close=(focus=false)=>{nav.classList.remove('is-open');button.setAttribute('aria-expanded','false');if(focus)button.focus();};
 button.onclick=()=>{const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);};
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){event.preventDefault();close(true);}});
 document.addEventListener('click',event=>{if(!nav.contains(event.target)&&!button.contains(event.target))close();});
 document.addEventListener('focusin',event=>{if(!nav.contains(event.target)&&event.target!==button)close();});
 nav.addEventListener('click',event=>{if(event.target.closest('a'))close();});
}
