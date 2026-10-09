(function(){
  'use strict';var root=document.querySelector('#pg-stage .slr'),slider=DSSlider.bind(root),value=document.getElementById('cfg-value');
  value.oninput=function(){slider.set(value.value);};slider.input.addEventListener('input',function(){value.value=slider.input.value;});
  document.getElementById('cfg-disabled').onchange=function(){slider.input.disabled=this.checked;};
  document.getElementById('cfg-gradient').onchange=function(){if(this.checked)slider.input.style.setProperty('--slr-track','linear-gradient(to right, var(--cgrey-500), var(--primary))');else slider.input.style.removeProperty('--slr-track');};
  var s=getComputedStyle(slider.input);document.getElementById('redline').textContent='Область ввода: '+s.height+' · Трек: '+s.getPropertyValue('--slr-track-height')+' · Бегунок: '+s.getPropertyValue('--slr-thumb-size');
})();
