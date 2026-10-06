/* ============================================================
   Ramp.tokens.js — алгоритм цветовых рамп тем (RE0005).

   Один модуль для Node и браузера: генератор тем
   (tools/theme-build.mjs) считает рампы здесь, и тот же файл
   подключается тегом на странице, где Ф2 пересчитывает кастомный
   акцент. Формат — как у icons-data.js / Themes.tokens.js:
   window.DS_RAMP; Node читает файл через vm.

   Две шкалы:
   - light — светлая тема: шаг 50 почти белый, 950 почти чёрный;
   - dark  — тёмная тема: шаг 50 самый тёмный, 950 светлый; роли
     остаются на своих шагах (bg-page = neutral-50 → тёмная страница,
     fg-default = neutral-900 → светлый текст).
   Профиль темы задаёт её семя (`profile`); `tone(seed)` без профиля —
   светлая шкала (обратная совместимость, Ф2).

   Семя тона — одно из двух:
   - `{ h, c }` — ступени считаются по кривой профиля (как раньше);
   - `{ values: { '50': '#…', …, '950': '#…' } }` — явные ступени:
     эталонная шкала (напр. slate или акцент с закреплённой ступенью),
     профиль на неё не влияет.

   Считаются новые тона темы (accent, neutral, grey, а в тёмной —
   все тона); базовые тона светлой темы генератор переносит из
   Colors.css как есть.

   Экспорт:
     STEPS           — шаги рамп, к которым привязаны роли
     SCALES          — { light, dark } кривые светлоты и хромы
     lch(L,C,H)      — OKLCH → #rrggbb (gamut-clamp)
     tone(seed,prof) — { h, c } → { '50': '#…', …, '950': '#…' }
     build(seeds,prof)— { тон: { шаг: hex } }
     hexToRgb / luminance / contrast(a,b) — WCAG 2.0, для --check
   ============================================================ */
window.DS_RAMP = (function () {
  var STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

  var SCALES = {
    light: {
      /* Светлота OKLCH (0..1): от почти белого к почти чёрному. */
      L: { '50': 0.977, '100': 0.955, '200': 0.918, '300': 0.858, '400': 0.740, '500': 0.625, '600': 0.525, '700': 0.452, '800': 0.363, '900': 0.268, '950': 0.185 },
      /* Доля пиковой хромы (c семени) на каждом шаге. */
      chroma: { '50': 0.10, '100': 0.22, '200': 0.42, '300': 0.65, '400': 0.88, '500': 1.00, '600': 0.96, '700': 0.86, '800': 0.72, '900': 0.58, '950': 0.48 }
    },
    dark: {
      /* Тёмная тема: светлota растёт по шагам — поверхности тёмные,
         текст светлый; шаг 600 — заливка под тёмным текстом. */
      L: { '50': 0.180, '100': 0.230, '200': 0.280, '300': 0.350, '400': 0.450, '500': 0.560, '600': 0.650, '700': 0.740, '800': 0.830, '900': 0.900, '950': 0.960 },
      chroma: { '50': 0.28, '100': 0.45, '200': 0.62, '300': 0.80, '400': 0.94, '500': 1.00, '600': 0.98, '700': 0.92, '800': 0.84, '900': 0.70, '950': 0.52 }
    }
  };

  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function srgb(x) { return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055; }

  /* OKLCH → sRGB hex. Out-of-gamut — зажимаем каналы (черновая механика). */
  function lch(L, C, Hdeg) {
    var h = (Hdeg || 0) * Math.PI / 180;
    var a = C * Math.cos(h), b = C * Math.sin(h);
    var l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    var m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    var s_ = L - 0.0894841775 * a - 1.2914855480 * b;
    var l = l_ * l_ * l_, m = m_ * m_ * m_, s = s_ * s_ * s_;
    var r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    var g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    var bb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
    return hex([srgb(r), srgb(g), srgb(bb)]);
  }

  function hex(rgb) {
    return '#' + rgb.map(function (v) {
      return ('0' + Math.round(clamp01(v) * 255).toString(16)).slice(-2);
    }).join('').toUpperCase();
  }

  /** Рампа одного тона.
      Семя `{ h — тон, c — пиковая хрома }` считается по кривой профиля
      ('light' | 'dark'); семя `{ values: { '50': '#…', …, '950': '#…' } }`
      возвращается как есть (эталонная шкала, профиль не влияет). */
  function tone(seed, profile) {
    var sc = SCALES[profile] || SCALES.light;
    var out = {};
    for (var i = 0; i < STEPS.length; i++) {
      var s = STEPS[i];
      var fixed = seed && seed.values && seed.values[s];
      out[s] = fixed
        ? String(fixed).toUpperCase()
        : lch(sc.L[s], (seed.c || 0) * sc.chroma[s], seed.h || 0);
    }
    return out;
  }

  /** Рампы из семян: { тон: { h, c } } → { тон: { шаг: hex } }. */
  function build(seeds, profile) {
    var out = {};
    for (var k in seeds) out[k] = tone(seeds[k], profile);
    return out;
  }

  function hexToRgb(h) {
    var s = String(h).replace('#', '');
    if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
  }

  /* Относительная яркость WCAG 2.0. */
  function luminance(h) {
    var c = hexToRgb(h).map(function (v) { return v / 255; }).map(function (v) {
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  /** Контраст пары цветов (1..21). */
  function contrast(a, b) {
    var la = luminance(a), lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  /* MS0013: эталон Colors / Core, 07.10.2026. Ступень 25 не используется;
     950 продолжает светлоту 800→900. Старый tone() оставлен для service. */
  var CORE = {
    accent: ['#E8F7F5','#D1EFEB','#A5E3DC','#76D5CC','#39C6BB','#18A59E','#118E8C','#117173','#105A5F','#12494F','#0A3036'],
    neutral: ['#F0F4F4','#E2E8E9','#D1D9DB','#A5B1B5','#75848A','#617179','#57656B','#465459','#3F4D50','#273235','#182225']
  };
  function hexToOklch(value) {
    if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error('Цвет должен быть #RRGGBB');
    var v = hexToRgb(value).map(function (x) { x/=255; return x<=0.04045?x/12.92:Math.pow((x+0.055)/1.055,2.4); });
    var l = Math.cbrt(0.4122214708*v[0]+0.5363325363*v[1]+0.0514459929*v[2]);
    var m = Math.cbrt(0.2119034982*v[0]+0.6806995451*v[1]+0.1073969566*v[2]);
    var s = Math.cbrt(0.0883024619*v[0]+0.2817188376*v[1]+0.6299787005*v[2]);
    var L=0.2104542553*l+0.793617785*m-0.0040720468*s;
    var a=1.9779984951*l-2.428592205*m+0.4505937099*s;
    var b=0.0259040371*l+0.7827717662*m-0.808675766*s;
    return {l:L,c:Math.hypot(a,b),h:(Math.atan2(b,a)*180/Math.PI+360)%360};
  }
  function rgbLinear(L,C,H) {
    var h=H*Math.PI/180,a=C*Math.cos(h),b=C*Math.sin(h);
    var l=Math.pow(L+0.3963377774*a+0.2158037573*b,3);
    var m=Math.pow(L-0.1055613458*a-0.0638541728*b,3);
    var s=Math.pow(L-0.0894841775*a-1.291485548*b,3);
    return [4.0767416621*l-3.3077115913*m+0.2309699292*s,-1.2684380046*l+2.6097574011*m-0.3413193965*s,-0.0041960863*l-0.7034186147*m+1.707614701*s];
  }
  function fromOklch(L,C,H) {
    L=clamp01(L); C=Math.max(0,C);
    var fits=function(c){return rgbLinear(L,c,H).every(function(v){return v>=-0.0000001&&v<=1.0000001;});};
    if (!fits(C)) {
      var lo=0,hi=C;
      for(var i=0;i<24;i++){var mid=(lo+hi)/2;if(fits(mid))lo=mid;else hi=mid;}
      C=lo;
    }
    return hex(rgbLinear(L,C,H).map(srgb));
  }
  function hueDiff(a,b){return ((a-b+540)%360)-180;}
  function adjustHex(color,adj) {
    adj=adj||{}; var v=hexToOklch(color);
    v.h+=(Number(adj.hue)||0);
    v.c*=Math.max(0,1+(Number(adj.saturation)||0)/100);
    var temp=Number(adj.temperature)||0;
    v.h+=hueDiff(temp>0?45:240,v.h)*Math.min(1,Math.abs(temp)/100)*0.35;
    if(!adj.hue&&!adj.saturation&&!adj.temperature)return color.toUpperCase();
    return fromOklch(v.l,v.c,v.h);
  }
  function from500(color,kind,profile,adj) {
    color=adjustHex(color,adj); var input=hexToOklch(color);
    kind=kind==='neutral'?'neutral':'accent';
    var ref=CORE[kind].map(hexToOklch),anchor=ref[5],out={},last=null;
    for(var i=0;i<STEPS.length;i++) {
      var step=STEPS[i],v=ref[i],weight=1-Math.abs(i-5)/6;
      var L=profile==='dark'?SCALES.dark.L[step]:v.l+(input.l-anchor.l)*weight;
      if(profile!=='dark') {
        /* Держим 500 входом даже при очень светлом/тёмном цвете. */
        L=i<5?input.l+(1-input.l)*(v.l-anchor.l)/(1-anchor.l):input.l*v.l/anchor.l;
      }
      var C=Math.min(kind==='neutral'?0.04:0.4,input.c)*(profile==='dark'?SCALES.dark.chroma[step]:v.c/anchor.c);
      var H=input.h+(profile==='dark'?0:hueDiff(v.h,anchor.h));
      var value=profile!=='dark'&&step==='500'?color:fromOklch(L,C,H);
      /* Квантование hex не должно склеивать соседние ступени. */
      var lum=luminance(value),sign=profile==='dark'?1:-1;
      if(last!==null&&sign*(lum-last)<=0) {
        for(var n=1;n<=100&&sign*(lum-last)<=0;n++){L=clamp01(L+sign*0.002);value=fromOklch(L,C,H);lum=luminance(value);}
      }
      out[step]=value;last=lum;
    }
    return out;
  }
  var METHODS=['auto','monochromatic','analogous','complementary','split-complementary','triadic','tetradic','square'];
  function generate(method,random) {
    var rnd=random||Math.random,h=rnd()*360,c=0.08+rnd()*0.13,L=0.48+rnd()*0.22;
    var shift={auto:0,monochromatic:0,analogous:30,complementary:180,'split-complementary':150,triadic:120,tetradic:60,square:90}[method]||0;
    return {brand:fromOklch(L,c,h),neutral:fromOklch(0.52,method==='auto'?0.014:0.025,h+shift)};
  }
  function fitContrast(fg,bg,min) {
    if(contrast(fg,bg)>=min)return fg;
    var v=hexToOklch(fg),dark=contrast('#000000',bg)>=contrast('#FFFFFF',bg),out=fg;
    for(var i=1;i<=200;i++){out=fromOklch(clamp01(v.l+(dark?-1:1)*i/200),v.c,v.h);if(contrast(out,bg)>=min)return out;}
    return dark?'#000000':'#FFFFFF';
  }
  function deltaE(a,b) {
    var x=hexToOklch(a),y=hexToOklch(b);
    return Math.hypot(x.l-y.l,x.c*Math.cos(x.h*Math.PI/180)-y.c*Math.cos(y.h*Math.PI/180),x.c*Math.sin(x.h*Math.PI/180)-y.c*Math.sin(y.h*Math.PI/180));
  }

  return {
    STEPS: STEPS, SCALES: SCALES,
    LIGHT_L: SCALES.light.L, CHROMA: SCALES.light.chroma,
    lch: lch, tone: tone, build: build,
    hexToRgb: hexToRgb, luminance: luminance, contrast: contrast
    ,hexToOklch:hexToOklch, fromOklch:fromOklch, from500:from500, adjustHex:adjustHex,
    generate:generate, METHODS:METHODS, CORE:CORE, fitContrast:fitContrast, deltaE:deltaE
  };
})();
