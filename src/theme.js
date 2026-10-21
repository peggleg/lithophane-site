import './theme.css';
const key='design-studio-theme',media=matchMedia('(prefers-color-scheme: dark)'),root=document.documentElement;
const label=document.createElement('label');label.className='theme-control';label.append('Theme ');
const select=document.createElement('select');select.setAttribute('aria-label','Colour theme');
for(const [value,text]of [['system','System'],['light','Light'],['dark','Dark']]){const option=document.createElement('option');option.value=value;option.textContent=text;select.append(option);}
select.value=root.dataset.themePreference||'system';label.append(select);document.querySelector('header')?.append(label);
function apply(preference){if(!['light','dark','system'].includes(preference))preference='system';root.dataset.themePreference=preference;root.dataset.theme=preference==='dark'||preference==='system'&&media.matches?'dark':'light';select.value=preference;}
select.addEventListener('change',()=>{apply(select.value);try{localStorage.setItem(key,select.value);}catch{}});
media.addEventListener('change',()=>{if(root.dataset.themePreference==='system')apply('system');});
window.addEventListener('storage',e=>{if(e.key===key)apply(e.newValue||'system');});
apply(select.value);
