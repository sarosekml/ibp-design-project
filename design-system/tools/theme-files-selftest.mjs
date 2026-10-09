/* Файловые гарантии конструктора без доступа к папке пользователя. */
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=new URL('../foundations/Themes/',import.meta.url);
const context=vm.createContext({window:{},localStorage:{setItem(){}},console});
for(const name of ['Ramp.tokens.js','Themes.runtime.js','tokens/tokens.data.js','ThemeEngine.js','ThemeFiles.js'])vm.runInContext(fs.readFileSync(new URL(name,root),'utf8'),context);
const win=context.window,copy=x=>JSON.parse(JSON.stringify(x));let reloads=0;
win.DSTheme={reload(data){reloads++;win.DS_THEME_DATA=data;}};
class Directory{
 constructor(){this.files=new Map();this.failMirror=false;for(const name of ['base-light','base-dark','ibp-legacy','ibp-neo','custom'])this.files.set(name+'.json',fs.readFileSync(new URL('tokens/'+name+'.json',root),'utf8'));}
 handle(name){return {kind:'file',name,getFile:async()=>({text:async()=>this.files.get(name)}),createWritable:async()=>{let pending;return {write:async value=>{if(this.failMirror&&name==='tokens.data.js')throw Error('fixture: зеркало недоступно');pending=value;},close:async()=>this.files.set(name,pending),abort:async()=>{}};}};}
 async getFileHandle(name,{create=false}={}){if(!this.files.has(name)){if(!create)throw Object.assign(Error('нет файла'),{name:'NotFoundError'});this.files.set(name,'');}return this.handle(name);}
 async *values(){for(const name of this.files.keys())yield this.handle(name);}
 async removeEntry(name){this.files.delete(name);}
}
const dir=new Directory(),api=win.DSThemeFiles;await api.attach(dir);
const original=copy(win.DS_THEME_DATA.themes.find(f=>f.name==='custom')),custom=copy(original);custom.light.brand='#2563EB';
await api.save(custom,{original});assert.equal(JSON.parse(dir.files.get('custom.json')).light.brand,'#2563EB');assert.equal(reloads,1);
const legacy=dir.files.get('ibp-legacy.json'),neo=dir.files.get('ibp-neo.json');
for(const name of ['ibp-legacy','ibp-neo']){const file=JSON.parse(dir.files.get(name+'.json'));file.locked=false;await assert.rejects(api.save(file),/нельзя перезаписать/);}
assert.equal(dir.files.get('ibp-legacy.json'),legacy);assert.equal(dir.files.get('ibp-neo.json'),neo);
await assert.rejects(api.save(custom,{create:true}),/уже есть/);
await assert.rejects(api.save(custom,{original}),/другом окне/);
const changed=copy(custom);changed.light.brand='#E5484D';const before=dir.files.get('custom.json');dir.failMirror=true;
await assert.rejects(api.save(changed),/записать зеркало/);assert.equal(dir.files.get('custom.json'),before);assert.equal(reloads,1);
const fresh=copy(changed);fresh.name='new-theme';fresh.label='Новая';
await assert.rejects(api.save(fresh,{create:true}),/записать зеркало/);assert.equal(dir.files.has('new-theme.json'),false);assert.equal(reloads,1);
dir.failMirror=false;
for(const name of ['zz-theme','aa-theme']){fresh.name=name;await api.save(copy(fresh),{create:true});}
const mirrorContext={window:{}};vm.runInNewContext(dir.files.get('tokens.data.js'),mirrorContext);assert.deepEqual(copy(mirrorContext.window.DS_THEME_DATA.themes.map(f=>f.name)),['ibp-legacy','ibp-neo','custom','aa-theme','zz-theme']);
const wrong=new Directory();wrong.files.set('base-light.json','{}');await assert.rejects(api.attach(wrong),/не совпадают/);assert.equal((await api.read()).themes.length,5);
const engine=win.DS_THEME_ENGINE;
for(const name of ['service','ibp-dark','base-foo','orbit-light']){fresh.name=name;assert(engine.validate(fresh).length>0);}
fresh.name='orbit';fresh.light.overrides={'--color-bg-page':'var(--bg-page)'};assert.throws(()=>engine.compile(fresh,'light',win.DS_THEME_DATA),/Цикл цвета/);
fresh.light.overrides={'--color-bg-page':'var(--unknown-color)'};assert.throws(()=>engine.compile(fresh,'light',win.DS_THEME_DATA),/Неизвестная переменная/);
/* 08.10.2026: список — всё, что лежит в папке. */
const repoMirror=fs.readFileSync(new URL('tokens/tokens.data.js',root),'utf8');
const clean=new Directory();await api.attach(clean);
assert.equal(engine.mirror(await api.read()),repoMirror,'зеркало из папки побайтно как у theme-build');
assert.equal(await api.syncMirror(await api.read()),true,'в папке нет зеркала — пишется');
assert.equal(await api.syncMirror(await api.read()),false,'зеркало совпало — не переписывается');
const folder=new Directory();
folder.files.set('custom2.json',folder.files.get('custom.json'));
folder.files.set('broken.json','{');
folder.files.set('bad name.json',folder.files.get('custom.json'));
const listed=await api.attach(folder);
const dup=listed.themes.find(f=>f.name==='custom2');
assert(dup,'копия custom.json под именем custom2.json видна в списке');
assert.deepEqual(copy(dup.light),JSON.parse(folder.files.get('custom.json')).light);
assert.deepEqual(copy(api.renamed()),[{file:'custom2.json',from:'custom'}]);
assert.deepEqual(copy(api.problems().map(p=>p.file)),['bad name.json','broken.json'],'битые файлы — в problems(), остальное читается');
assert.equal(listed.themes.length,4);
assert.equal(await api.syncMirror(listed),true);
const mirrored={window:{}};vm.runInNewContext(folder.files.get('tokens.data.js'),mirrored);
assert(mirrored.window.DS_THEME_DATA.themes.some(f=>f.name==='custom2'),'новая тема попала в зеркало');
await api.save(copy(dup),{original:dup});
assert.equal(JSON.parse(folder.files.get('custom2.json')).name,'custom2','при сохранении имя внутри = имя файла');
assert.deepEqual(copy(api.renamed()),[],'после сохранения расхождения нет');
console.log('ВЕРДИКТ: OK — запись, защита базы, дубликат, конфликт, два отката, сортировка зеркала, неверная папка, имена, циклы и ссылки; список из папки: копия под именем файла, битые файлы, зеркало из папки = theme-build, синхронизация, имя при сохранении');
