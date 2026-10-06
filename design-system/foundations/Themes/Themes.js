/* MS0013 — темы из файлов. Выбор — конструктор/панель.
   Совместимость: get/set/list; дополнения files/selection/preview/reload. */
(function () {
  'use strict';
  if (window.DSTheme) return;
  var data=window.DS_THEME_DATA,engine=window.DS_THEME_ENGINE;
  if(!data||!engine)return;
  var style=document.createElement('style');style.id='ds-theme-runtime';document.head.appendChild(style);
  var selection={name:'ibp-legacy',mode:'light'};
  function normalize(id,mode){
    if(id==='ibp-light')id='ibp-neo-light';if(id==='ibp-dark')id='ibp-neo-dark';
    if(!id||id==='legacy'||id==='ibp-legacy')return {name:'ibp-legacy',mode:'light',id:'legacy'};
    if(id==='service')return {name:'service',mode:'dark',id:id};
    var file=data.themes.find(function(f){return f.name===id||f.name+'-light'===id||f.name+'-dark'===id;});
    if(!file)return null;
    mode=mode||(id.slice(-5)==='-dark'?'dark':'light');mode=mode==='dark'&&file.dark?'dark':'light';
    return {name:file.name,mode:mode,id:file.name+'-'+mode};
  }
  function apply(s,file){
    selection=s;
    style.textContent=s.id==='legacy'||s.id==='service'?'':engine.css(engine.compile(file||data.themes.find(function(f){return f.name===s.name;}),s.mode,data));
    if(s.id==='legacy')document.documentElement.removeAttribute('data-theme');else document.documentElement.setAttribute('data-theme',s.id);
  }
  function emit(){document.dispatchEvent(new CustomEvent('ds:themechange',{detail:{theme:get(),name:selection.name,mode:selection.mode}}));}
  function get(){return document.documentElement.getAttribute('data-theme')||'legacy';}
  function set(id,mode){var s=normalize(id,mode);if(!s){console.warn('DSTheme: неизвестная тема '+id);return get();}apply(s);try{if(s.id==='legacy')localStorage.removeItem('ds.theme');else localStorage.setItem('ds.theme',s.id);}catch(e){}emit();return get();}
  function files(){return data.themes.map(function(f){return {name:f.name,label:f.label,locked:!!f.locked,modes:f.dark?['light','dark']:['light']};});}
  function list(){var result=[];files().forEach(function(f){f.modes.forEach(function(m){result.push({id:f.name==='ibp-legacy'?'legacy':f.name+'-'+m,name:f.name,mode:m,label:f.label+(f.modes.length>1?' · '+(m==='dark'?'Тёмная':'Светлая'):'' )});});});return result;}
  function preview(file,mode){var s=normalize(file.name,mode)||{name:file.name,mode:mode,id:file.name+'-'+mode};apply(s,file);emit();}
  function reload(next){data=next;window.DS_THEME_DATA=next;document.dispatchEvent(new CustomEvent('ds:themelistchange'));}
  window.DSTheme={get:get,set:set,list:list,files:files,selection:function(){return Object.assign({},selection);},preview:preview,reload:reload,normalize:normalize};
  var id='';try{var q=new URLSearchParams(window.location.search).get('theme');id=q||localStorage.getItem('ds.theme')||'';}catch(e){}
  var initial=normalize(id)||normalize('legacy');apply(initial);
  if(id&&id!==initial.id)try{localStorage.setItem('ds.theme',initial.id);}catch(e){}
  /* Между страницами передаётся сигнал сохранения, черновики не сохраняются. */
  addEventListener('storage',function(e){if(e.key==='ds.theme.saved'){var script=document.createElement('script');script.src=(window.__DS_ROOT||new URL('../../',document.querySelector('script[src$="Themes.js"]').src).href)+'foundations/Themes/tokens/tokens.data.js?'+Date.now();script.onload=function(){reload(window.DS_THEME_DATA);var s=normalize(get());if(s)apply(s);emit();script.remove();};document.head.appendChild(script);}});
})();
