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

  return {
    STEPS: STEPS, SCALES: SCALES,
    LIGHT_L: SCALES.light.L, CHROMA: SCALES.light.chroma,
    lch: lch, tone: tone, build: build,
    hexToRgb: hexToRgb, luminance: luminance, contrast: contrast
  };
})();
