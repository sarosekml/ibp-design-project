/* MS0013 — один компилятор файлов тем для браузера и theme-build. */
window.DS_THEME_ENGINE = (function () {
  'use strict';
  var R=window.DS_RAMP, T=window.DS_THEMES;
  function clone(x){return JSON.parse(JSON.stringify(x));}
  function validHex(x){return typeof x==='string'&&/^#[0-9a-f]{6}$/i.test(x);}
  function validate(file) {
    var errors=[];
    if(!file||!/^[a-z][a-z0-9-]{0,47}$/.test(file.name||''))errors.push('Имя файла: латинские буквы, цифры и дефис');
    if(file&&(/^(base-|service$|legacy$|ibp-light$|ibp-dark$)/.test(file.name)||/-(light|dark)$/.test(file.name)))errors.push('Это имя зарезервировано для профиля или базы');
    if(file&&(!file.label||typeof file.label!=='string'||file.label.length>80))errors.push('Название темы — от 1 до 80 символов');
    if(file&&!file.light)errors.push('Нужен светлый профиль');
    ['light','dark'].forEach(function(mode){
      var p=file&&file[mode];if(!p)return;
      if(!validHex(p.brand)||!validHex(p.neutral))errors.push(mode+': цвета должны быть #RRGGBB');
      Object.keys(p.overrides||{}).forEach(function(k){
        var known=Object.prototype.hasOwnProperty.call(T.roles,k)||T.ramps.tones.some(function(t){return T.ramps.steps.some(function(s){return k==='--ramp-'+t+'-'+s;});});
        if(!known)errors.push('Неизвестная роль: '+k);
        var value=p.overrides[k];
        if(typeof value!=='string'||/[;{}<>\n\r]/.test(value)||(!validHex(value)&&!/^color-mix\([^;{}]+\)$|^rgba?\([\d\s.,%/]+\)$|^var\(--[\w-]+\)$/.test(value)))errors.push('Недопустимое значение: '+k);
      });
      ['hue','saturation','temperature'].forEach(function(k){var v=(p.adjust||{})[k];if(v!=null&&(!Number.isFinite(v)||Math.abs(v)>(k==='hue'?180:100)))errors.push('Недопустимая настройка '+k);});
    });
    return errors;
  }
  function resolve(expr,vars,seen) {
    seen=seen||[];if(seen.length>30)return null;
    if(!expr)return null;
    var m=/^var\((--[\w-]+)\)$/.exec(expr);
    if(m){if(seen.indexOf(m[1])>=0)return null;return resolve(vars[m[1]],vars,seen.concat(m[1]));}
    return expr;
  }
  function compile(file,mode,data) {
    var errors=validate(file);if(errors.length)throw new Error(errors.join('; '));
    mode=mode==='dark'&&file.dark?'dark':'light';
    var p=file[mode],ramps=clone(data.bases[mode].ramps),roles=Object.assign({},T.values,T.profiles[mode]),overrides=p.overrides||{};
    T.ramps.tones.filter(function(t){return t!=='accent'&&t!=='neutral';}).forEach(function(t){R.STEPS.forEach(function(s){if(!ramps[t]||!validHex(ramps[t][s]))throw new Error('База '+mode+': нет '+t+'-'+s);});});
    ramps.accent=R.from500(p.brand,'accent',mode,p.adjust);
    ramps.neutral=R.from500(p.neutral,'neutral',mode,p.adjust);
    /* Акцентные статусы идут за brand, фиксированные статусы и графики — за базой. */
    Object.keys(roles).forEach(function(k){if(k.indexOf('--color-status-accent-')===0)roles[k]=roles[k].replace(/--emerald-/g,'--ramp-accent-');});
    if(mode==='light')roles['--color-accent-fill']='var(--ramp-accent-600)';
    roles['--color-fg-on-fill']=p.onFill==='dark'?'#111112':'#FFFFFF';
    var vars=Object.assign({},data.legacy.variables),manual=Object.keys(overrides);
    Object.keys(ramps).forEach(function(tone){R.STEPS.forEach(function(s){var k='--ramp-'+tone+'-'+s;if(overrides[k])ramps[tone][s]=overrides[k];vars[k]=ramps[tone][s];});});
    Object.keys(overrides).forEach(function(k){if(k.indexOf('--color-')===0)roles[k]=overrides[k];});Object.assign(vars,roles);
    /* Сначала алгоритм держит контраст; ручной override остаётся видимым и
       намеренно не переписывается — провал показывается в отчёте. */
    if(file.name!=='ibp-legacy'){
      (T.contrast||[]).forEach(function(pair){
        var fg=resolve(vars[pair.fg],vars),bg=resolve(vars[pair.bg],vars);
        if(!validHex(fg)||!validHex(bg)||pair.required===false)return;
        if(pair.fg.indexOf('--color-danger-')===0||pair.fg.indexOf('--color-warning-')===0||pair.fg.indexOf('--color-success-')===0||pair.fg.indexOf('--color-info-')===0)return;
        if(pair.fg==='--color-fg-on-fill'&&pair.bg!=='--color-accent-fill')return;
        if(manual.indexOf(pair.fg)>=0||manual.indexOf(pair.bg)>=0)return;
        if(R.contrast(fg,bg)<pair.min){
          var target=pair.fg==='--color-fg-on-fill'?pair.bg:pair.fg;
          roles[target]=R.fitContrast(target===pair.bg?bg:fg,target===pair.bg?fg:bg,pair.min);
          vars[target]=roles[target];
        }
      });
    }
    var graph=Object.assign({},vars),done={},active={};
    if(file.name!=='ibp-legacy')Object.keys(T.map).forEach(function(k){graph[k]='var('+T.map[k]+')';});
    function visit(k){if(active[k])throw new Error('Цикл цвета: '+k);if(done[k])return;active[k]=true;var refs=String(graph[k]).match(/var\((--[\w-]+)/g)||[];refs.forEach(function(ref){var key=ref.slice(4);if(!Object.prototype.hasOwnProperty.call(graph,key))throw new Error('Неизвестная переменная цвета: '+key);visit(key);});delete active[k];done[k]=true;}
    Object.keys(roles).forEach(visit);
    var colors={};Object.keys(roles).forEach(function(k){colors[k]=resolve(roles[k],vars)||roles[k];});
    var old={};Object.keys(T.map).forEach(function(k){old[k]=file.name==='ibp-legacy'?data.legacy.variables[k]:colors[T.map[k]];});
    var contrast=(T.contrast||[]).map(function(pair){var fg=colors[pair.fg],bg=colors[pair.bg];return Object.assign({},pair,{ratio:validHex(fg)&&validHex(bg)?R.contrast(fg,bg):null});});
    return {name:file.name,mode:mode,id:file.name==='ibp-legacy'?'legacy':file.name+'-'+mode,ramps:ramps,roles:roles,colors:colors,old:old,contrast:contrast,manual:manual};
  }
  function css(model) {
    if(model.id==='legacy')return '';
    var lines=[':root[data-theme="'+model.id+'"], [data-theme="'+model.id+'"] {','  color-scheme: '+model.mode+';'];
    Object.keys(model.ramps).forEach(function(tone){R.STEPS.forEach(function(step){lines.push('  --ramp-'+tone+'-'+step+': '+model.ramps[tone][step]+';');});});
    Object.keys(model.roles).forEach(function(k){if(k.indexOf('--color-')===0)lines.push('  '+k+': '+model.roles[k]+';');});
    Object.keys(T.map).forEach(function(k){lines.push('  '+k+': var('+T.map[k]+');');});
    (T.elevation||[]).forEach(function(e){lines.push('  '+e.name+': '+e.value+';');});
    (T.rules||[]).forEach(function(rule){if(rule.selector===':root')lines.push('  '+rule.prop+': '+rule.value+';');});
    lines.push('}');return lines.join('\n');
  }
  function sources(data) {
    var out=clone(T);out.themes=['service'];out.seeds={service:clone(T.seeds.service)};out.themeValues={service:clone(T.themeValues.service)};
    data.themes.forEach(function(file){if(file.name==='ibp-legacy')return;['light','dark'].forEach(function(mode){if(!file[mode])return;var m=compile(file,mode,data);out.themes.push(m.id);out.seeds[m.id]={profile:mode,fixedBase:true,ramps:{}};Object.keys(m.ramps).forEach(function(k){out.seeds[m.id].ramps[k]={values:m.ramps[k]};});out.themeValues[m.id]=m.roles;});});
    /* Сохраняем исторические исключения фиксированных статусов; brand,
       ссылки и границы новых тем проверяются, custom-dark — ручная база. */
    out.contrast=out.contrast.map(function(p){var v=clone(p);v.exempt=(v.exempt||[]).filter(function(x){return x==='service';});
      if(p.exempt&&p.exempt.indexOf('ibp-light')>=0&&(p.fg.indexOf('--color-fg-on-fill')===0&&p.bg!=='--color-accent-fill'||/--color-(danger|warning|success|info)-/.test(p.fg)))data.themes.forEach(function(f){if(f.light)v.exempt.push(f.name+'-light');if(f.dark)v.exempt.push(f.name+'-dark');});
      if(p.exempt&&p.exempt.indexOf('service')>=0)v.exempt.push('custom-dark');return v;});
    return out;
  }
  function mirror(data){return '/* Генерат theme-build.mjs / сохранения конструктора. */\nwindow.DS_THEME_DATA = '+JSON.stringify(data,null,2)+';\n';}
  return {validate:validate,compile:compile,css:css,sources:sources,resolve:resolve,mirror:mirror};
})();
