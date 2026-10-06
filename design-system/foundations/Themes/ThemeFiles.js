/* Файловое сохранение: только подключённая папка tokens, без черновиков.
   IndexedDB хранит handle; attach(handle) позволяет проверить ту же логику
   в OPFS встроенного браузера. Защита имён повторяется перед каждой записью. */
(function(){
  'use strict';var dir=null;
  var engine=window.DS_THEME_ENGINE;
  function db(){return new Promise(function(resolve,reject){var req=indexedDB.open('ds-theme-files',1);req.onupgradeneeded=function(){req.result.createObjectStore('handles');};req.onsuccess=function(){resolve(req.result);};req.onerror=function(){reject(req.error);};});}
  async function remember(handle){var d=await db();await new Promise(function(resolve,reject){var tx=d.transaction('handles','readwrite');tx.objectStore('handles').put(handle,'tokens');tx.oncomplete=resolve;tx.onerror=function(){reject(tx.error);};});d.close();}
  async function restore(){try{var d=await db(),h=await new Promise(function(resolve,reject){var r=d.transaction('handles').objectStore('handles').get('tokens');r.onsuccess=function(){resolve(r.result);};r.onerror=function(){reject(r.error);};});d.close();if(h&&await h.queryPermission({mode:'readwrite'})==='granted'){dir=h;return h;}}catch(e){}return null;}
  async function text(name){try{return await(await(await dir.getFileHandle(name)).getFile()).text();}catch(e){if(e.name==='NotFoundError')return null;throw e;}}
  async function read(){
    if(!dir)throw new Error('Подключите папку tokens');
    var data={version:1,bases:{},legacy:window.DS_THEMES.legacySnapshot,themes:[]};
    for await(var entry of dir.values()){
      if(entry.kind!=='file'||!entry.name.endsWith('.json'))continue;
      var value=JSON.parse(await(await entry.getFile()).text());
      if(entry.name==='base-light.json'||entry.name==='base-dark.json')data.bases[entry.name.slice(5,-5)]=value;
      else {var errors=engine.validate(value);if(errors.length||entry.name!==value.name+'.json')throw new Error(entry.name+': '+(errors.join('; ')||'имя файла расходится с темой'));data.themes.push(value);}
    }
    if(JSON.stringify(data.bases.light)!==JSON.stringify(window.DS_THEME_DATA.bases.light)||JSON.stringify(data.bases.dark)!==JSON.stringify(window.DS_THEME_DATA.bases.dark))throw new Error('Выберите папку tokens этой ДС: базовые растяжки не совпадают');
    ['ibp-legacy','ibp-neo','custom'].forEach(function(n){if(!data.themes.some(function(f){return f.name===n;}))throw new Error('В папке отсутствует '+n+'.json');});
    data.themes.sort(function(a,b){var order=['ibp-legacy','ibp-neo','custom'];return (order.indexOf(a.name)<0?99:order.indexOf(a.name))-(order.indexOf(b.name)<0?99:order.indexOf(b.name))||a.name.localeCompare(b.name);});
    return data;
  }
  async function attach(handle){var previous=dir;dir=handle;try{return await read();}catch(e){dir=previous;throw e;}}
  async function connect(){
    if(!window.showDirectoryPicker)throw new Error('Этот браузер не пишет в папку. Скачайте JSON и пересоберите зеркало командой theme-build');
    if(dir&&dir.requestPermission&&await dir.requestPermission({mode:'readwrite'})==='granted')return read();
    var handle=await showDirectoryPicker({id:'ds-theme-tokens',mode:'readwrite'});var data=await attach(handle);try{await remember(handle);}catch(e){/* Недоступный IndexedDB не мешает записи в этом сеансе. */}return data;
  }
  async function write(name,value){var h=await dir.getFileHandle(name,{create:true}),w=await h.createWritable();try{await w.write(value);await w.close();}catch(e){try{await w.abort();}catch(_){}throw e;}}
  async function save(file,opts){
    opts=opts||{};if(!dir)throw new Error('Подключите папку tokens');
    if(['ibp-legacy','ibp-neo','service','legacy','base-light','base-dark'].indexOf(file.name)>=0||file.locked)throw new Error('Базовую тему нельзя перезаписать. Используйте «Сохранить как…»');
    var errors=engine.validate(file);if(errors.length)throw new Error(errors.join('; '));
    var data=await read(),index=data.themes.findIndex(function(f){return f.name===file.name;});
    if(index>=0&&data.themes[index].locked)throw new Error('Тема закрыта для записи');
    if(opts.create&&index>=0)throw new Error('Тема с этим именем уже есть. Выберите другое имя');
    if(opts.original&&index>=0&&JSON.stringify(data.themes[index])!==JSON.stringify(opts.original))throw new Error('Файл изменён в другом окне. Перезагрузите сохранённую тему');
    ['light','dark'].forEach(function(m){if(file[m])engine.compile(file,m,data);});
    var json=JSON.stringify(file,null,2)+'\n',old=await text(file.name+'.json');
    if(index<0)data.themes.push(file);else data.themes[index]=file;
    data.themes.sort(function(a,b){var order=['ibp-legacy','ibp-neo','custom'];return (order.indexOf(a.name)<0?99:order.indexOf(a.name))-(order.indexOf(b.name)<0?99:order.indexOf(b.name))||a.name.localeCompare(b.name);});
    /* При сбое зеркала откатываем JSON: страница остаётся несохранённой. */
    await write(file.name+'.json',json);
    try{await write('tokens.data.js',engine.mirror(data));}catch(e){try{if(old!==null)await write(file.name+'.json',old);else await dir.removeEntry(file.name+'.json');}catch(_){}throw new Error('Не удалось записать зеркало: '+e.message);}
    window.DSTheme.reload(data);try{localStorage.setItem('ds.theme.saved',Date.now().toString());}catch(e){}return data;
  }
  function download(file){var errors=engine.validate(file);if(errors.length)throw new Error(errors.join('; '));var url=URL.createObjectURL(new Blob([JSON.stringify(file,null,2)+'\n'],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=file.name+'.json';a.click();setTimeout(function(){URL.revokeObjectURL(url);},1000);}
  window.DSThemeFiles={connect:connect,restore:restore,attach:attach,read:read,save:save,download:download,connected:function(){return !!dir;}};
})();
