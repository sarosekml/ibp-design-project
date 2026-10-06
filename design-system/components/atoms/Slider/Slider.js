(function(){
  'use strict';
  function bind(root){
    if(root.__dsSlider)return root.__dsSlider;
    var input=root.querySelector('.slr__input'),out=root.querySelector('.slr__value');if(!input)return;
    function sync(){var min=input.min===''?0:Number(input.min),max=input.max===''?100:Number(input.max),span=max-min;input.style.setProperty('--slr-progress',(span>0?(Number(input.value)-min)/span*100:0)+'%');if(out)out.textContent=input.value+(root.getAttribute('data-unit')||'');}
    input.addEventListener('input',sync);input.addEventListener('change',sync);sync();
    root.__dsSlider={sync:sync,set:function(v){input.value=v;sync();},input:input};return root.__dsSlider;
  }
  function bindAll(root){(root||document).querySelectorAll('.slr').forEach(bind);}
  window.DSSlider={bind:bind,bindAll:bindAll};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){bindAll();});else bindAll();
})();
