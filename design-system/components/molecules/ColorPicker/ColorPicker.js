/* ColorPicker в Popover или в форме. SV: мышь/касание/стрелки, Hue: Slider.
   API create(root,{value,onChange,disabled}), bind(trigger,{value,onChange}). */
(function(){
  'use strict';var next=0;
  function hsv(hex){var rgb=hex.slice(1).match(/../g).map(function(v){return parseInt(v,16)/255;}),max=Math.max.apply(null,rgb),min=Math.min.apply(null,rgb),d=max-min,h=0;if(d){var i=rgb.indexOf(max);h=60*(i===0?(rgb[1]-rgb[2])/d%6:i===1?(rgb[2]-rgb[0])/d+2:(rgb[0]-rgb[1])/d+4);}return {h:(h+360)%360,s:max?d/max:0,v:max};}
  function hex(c){var h=c.h/60,s=c.s,v=c.v,i=Math.floor(h),f=h-i,p=v*(1-s),q=v*(1-f*s),t=v*(1-(1-f)*s);var rgb=[[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]][i%6];return '#'+rgb.map(function(x){return Math.round(x*255).toString(16).padStart(2,'0');}).join('').toUpperCase();}
  function create(root,opts){
    opts=opts||{};var id='cpk-'+(++next),value=/^#[\da-f]{6}$/i.test(opts.value)?opts.value:'#7F56D9',state=hsv(value);
    root.classList.add('cpk');root.innerHTML='<div class="cpk__sv" role="slider" tabindex="0" aria-label="Насыщенность и яркость" aria-valuemin="0" aria-valuemax="100"><span class="cpk__marker"></span></div>'
      +'<div class="slr" data-unit="°"><div class="slr__head"><label for="'+id+'-h">Тон</label><output class="slr__value" for="'+id+'-h"></output></div><input class="slr__input" id="'+id+'-h" type="range" min="0" max="360" step="1"></div>'
      +'<div class="inp inp--m"><label class="ds-label" for="'+id+'-hex">Hex</label><div class="inp__field"><input class="inp__control" id="'+id+'-hex" spellcheck="false" maxlength="7" aria-describedby="'+id+'-error"></div><span class="ds-helper" id="'+id+'-error" hidden>Введите цвет в формате #RRGGBB</span></div>'
      +'<div class="cpk__actions"><button type="button" class="btn btn--outline btn--s" data-pick><span class="btn__label">Пипетка</span></button><button type="button" class="btn btn--transparent btn--s" data-copy><span class="btn__label">Копировать</span></button><button type="button" class="btn btn--transparent btn--s" data-reset><span class="btn__label">Сбросить</span></button></div>';
    var sv=root.querySelector('.cpk__sv'),marker=root.querySelector('.cpk__marker'),input=root.querySelector('.inp__control'),hue=root.querySelector('.slr__input'),error=root.querySelector('.ds-helper'),pick=root.querySelector('[data-pick]');
    hue.style.setProperty('--slr-track','linear-gradient(to right, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000)');
    var slider=window.DSSlider.bind(root.querySelector('.slr'));
    function sync(notify){value=hex(state);input.value=value;hue.value=Math.round(state.h);slider.sync();sv.style.setProperty('--cpk-hue',hex({h:state.h,s:1,v:1}));marker.style.left=state.s*100+'%';marker.style.top=(1-state.v)*100+'%';sv.setAttribute('aria-valuenow',Math.round(state.s*100));sv.setAttribute('aria-valuetext','Насыщенность '+Math.round(state.s*100)+'%, яркость '+Math.round(state.v*100)+'%');input.removeAttribute('aria-invalid');root.querySelector('.inp').classList.remove('inp--error');error.hidden=true;if(notify){if(opts.onChange)opts.onChange(value);root.dispatchEvent(new CustomEvent('colorpicker:change',{bubbles:true,detail:{value:value}}));}}
    function set(v,notify){if(!/^#[\da-f]{6}$/i.test(v))return;state=hsv(v);sync(notify);}
    function point(e){if(opts.disabled)return;var r=sv.getBoundingClientRect();state.s=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));state.v=Math.max(0,Math.min(1,1-(e.clientY-r.top)/r.height));sync(true);}
    var drag=false;sv.addEventListener('pointerdown',function(e){if(e.button!==0)return;drag=true;sv.setPointerCapture(e.pointerId);sv.focus();point(e);});sv.addEventListener('pointermove',function(e){if(drag)point(e);});['pointerup','pointercancel'].forEach(function(k){sv.addEventListener(k,function(){drag=false;});});
    sv.addEventListener('keydown',function(e){if(opts.disabled)return;var n=e.shiftKey?.1:.01;if(e.key==='ArrowRight')state.s=Math.min(1,state.s+n);else if(e.key==='ArrowLeft')state.s=Math.max(0,state.s-n);else if(e.key==='ArrowUp')state.v=Math.min(1,state.v+n);else if(e.key==='ArrowDown')state.v=Math.max(0,state.v-n);else return;e.preventDefault();sync(true);});
    hue.addEventListener('input',function(){state.h=Number(hue.value)%360;sync(true);});
    input.addEventListener('input',function(){if(/^#[\da-f]{6}$/i.test(input.value))set(input.value,true);else{input.setAttribute('aria-invalid','true');root.querySelector('.inp').classList.add('inp--error');error.hidden=false;}});
    pick.hidden=!window.EyeDropper;pick.onclick=async function(){try{var r=await new EyeDropper().open();set(r.sRGBHex,true);}catch(e){if(e.name!=='AbortError'){error.textContent='Пипетка недоступна';error.hidden=false;}}};
    root.querySelector('[data-copy]').onclick=function(){window.DSCopy.write(value).then(function(){window.DSCopy.flash(root.querySelector('[data-copy]'),'Скопировано');});};
    root.querySelector('[data-reset]').hidden=!opts.onReset;
    root.querySelector('[data-reset]').onclick=function(){if(opts.onReset)opts.onReset();};
    function disabled(flag){opts.disabled=!!flag;root.classList.toggle('cpk--disabled',opts.disabled);sv.tabIndex=opts.disabled?-1:0;sv.setAttribute('aria-disabled',String(opts.disabled));root.querySelectorAll('input,button').forEach(function(el){el.disabled=opts.disabled;});}
    disabled(opts.disabled);
    sync(false);return {get:function(){return value;},set:function(v){set(v,false);},disabled:disabled,destroy:function(){root.replaceChildren();}};
  }
  function bind(trigger,opts){
    opts=opts||{};if(trigger.__dsColorPicker){trigger.__dsColorPicker.configure(opts);return trigger.__dsColorPicker;}
    var settings=Object.assign({},opts),pop=document.createElement('div');pop.className='pop pop--w-m';pop.id='cpk-pop-'+(++next);pop.setAttribute('role','dialog');pop.setAttribute('aria-label','Редактирование цвета');pop.innerHTML='<span class="pop__arrow"></span><div class="pop__body"><div class="cpk"></div></div>';
    document.body.appendChild(pop);var picker=create(pop.querySelector('.cpk'),settings),api=window.DSPopover.bind(trigger,{pop:pop});
    var result={picker:picker,open:function(){if(!pop.isConnected)document.body.appendChild(pop);return api.open();},close:api.close,destroy:function(){api.close();pop.remove();},configure:function(nextOpts){Object.assign(settings,nextOpts);picker.set(nextOpts.value);picker.disabled(settings.disabled);pop.querySelector('[data-reset]').hidden=!settings.onReset;}};
    trigger.__dsColorPicker=result;return result;
  }
  window.DSColorPicker={create:create,bind:bind,hsv:hsv,hex:hex};
})();
