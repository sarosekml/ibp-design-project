(function(){
  'use strict';var trigger=document.getElementById('demo-picker'),inline=document.getElementById('demo-inline'),color=document.getElementById('cfg-color'),picker=null;
  function render(){if(picker)picker.destroy();var embedded=document.getElementById('cfg-inline').checked,opts={value:color.value,disabled:document.getElementById('cfg-disabled').checked,onChange:function(v){document.getElementById('demo-value').textContent=v;color.value=v;}};trigger.hidden=embedded;inline.hidden=!embedded;trigger.disabled=opts.disabled;picker=embedded?DSColorPicker.create(inline,opts):DSColorPicker.bind(trigger,opts);document.getElementById('demo-value').textContent=color.value;var s=getComputedStyle(inline);document.getElementById('redline').textContent='SV: квадрат во всю ширину'+' · Маркер: '+s.getPropertyValue('--cpk-marker-size')+' · Поповер M: '+s.getPropertyValue('--pop-w-m');}
  color.onchange=function(){if(/^#[\da-f]{6}$/i.test(this.value))render();};document.getElementById('cfg-disabled').onchange=render;document.getElementById('cfg-inline').onchange=render;render();
})();

/* Демо разделов «Анатомия», «Варианты», «Состояния». */
(function(){
  'use strict';
  function el(id){return document.getElementById(id);}
  var resetTo='#00AA9B',anatomy=DSColorPicker.create(el('cpk-anatomy'),{value:'#7F56D9',footer:document.createTextNode('Слот потребителя'),onReset:function(){anatomy.set(resetTo);}});
  DSColorPicker.bind(el('cpk-variant-trigger'),{value:'#00AA9B'});
  DSColorPicker.create(el('cpk-variant-inline'),{value:'#00AA9B'});
  DSColorPicker.create(el('cpk-state-default'),{value:'#617C7C'});
  DSColorPicker.create(el('cpk-state-disabled'),{value:'#617C7C',disabled:true});
  DSColorPicker.create(el('cpk-state-error'),{value:'#617C7C'});
  var hex=el('cpk-state-error').querySelector('.cpk__hex .inp__control');
  hex.value='#61C7';
  hex.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
})();
