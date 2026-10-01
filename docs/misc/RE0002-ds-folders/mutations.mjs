#!/usr/bin/env node
// RE0002 Э2 — мутации (разовый скрипт, удаляется на Э3): каждое правило, которое
// включается по папке, имени файла или виду файла, обязано сработать на новой
// раскладке. Порча файла → прогон → в выводе есть код правила и признак мутации →
// файл восстанавливается байт в байт (не git checkout: проверка идёт и до коммита).
//
//   node docs/misc/RE0002-ds-folders/mutations.mjs

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const DS = path.join(ROOT, 'design-system');

const lint = (...args) => ({ cwd: DS, args: ['tools/ds-lint-cli.mjs', ...args] });
const sensor = (screen) => ({ cwd: ROOT, args: ['.agents/tools/layout-check.mjs', screen] });
const ds = (rel) => path.join(DS, rel);

/* file — что портим; from → to — замена (обязана найтись); run — что гоняем;
   expect — регулярка, которой обязана совпасть хотя бы одна строка вывода. */
const CASES = [
  { name: 'контракт разделов · атом', file: ds('components/atoms/Badge/Badge.html'),
    from: '<h2>Анатомия</h2>', to: '<h2>Мутация</h2>',
    run: lint('components/atoms/Badge/Badge.html'), expect: /C4 .*нет h2: .*Анатомия/ },
  { name: 'контракт разделов · молекула из Inputs/', file: ds('components/molecules/Inputs/InputText/InputText.html'),
    from: '<h2>Анатомия</h2>', to: '<h2>Мутация</h2>',
    run: lint('components/molecules/Inputs/InputText/InputText.html'), expect: /C4 .*нет h2: .*Анатомия/ },
  { name: 'контракт разделов · организм', file: ds('components/organisms/Table/Table.html'),
    from: '<h2>Анатомия</h2>', to: '<h2>Мутация</h2>',
    run: lint('components/organisms/Table/Table.html'), expect: /C4 .*нет h2: .*Анатомия/ },
  { name: 'D2 · пункт страницы в ds-nav.js', file: ds('docs-kit/ds-nav.js'),
    from: "href: 'components/atoms/Badge/Badge.html'", to: "href: 'components/atoms/Badge/Mutant.html'",
    run: lint('components/atoms/Badge/Badge.html'), expect: /D2 .*docs-kit\/ds-nav\.js/ },
  { name: 'A8 · __DS_ROOT на странице группы Inputs/', file: ds('components/molecules/Inputs/InputText/InputText.html'),
    from: "<script>window.__DS_ROOT = '../../../../';</script>", to: '',
    run: lint('components/molecules/Inputs/InputText/InputText.html'), expect: /A8 .*'\.\.\/\.\.\/\.\.\/\.\.\/'/ },
  { name: 'D5 · строка компонента в _index.md', file: ds('specs/_index.md'),
    from: '| Badge | components/atoms/Badge/Badge.md |', to: '| Badge | components/atoms/Badge/Mutant.md |',
    run: lint('components/atoms/Badge/Badge.html'), expect: /D5 .*нет строки в specs\/_index\.md/ },
  { name: 'D6 · блок компонента в чит-шите', file: ds('specs/_cheatsheet.md'),
    from: '\n## Badge', to: '\n## Mutant',
    run: lint('components/atoms/Badge/Badge.html'), expect: /D6 .*## Badge/ },
  { name: 'D7 · версия спеки ≠ страницы', file: ds('components/atoms/Badge/Badge.md'),
    from: 'version: "1.003"', to: 'version: "9.999"',
    run: lint('components/atoms/Badge/Badge.html'), expect: /D7 .*9\.999/ },
  { name: 'B10 · запись геометрии на scroll в рантайме', file: ds('components/molecules/Splitter/Splitter.js'),
    from: /$/, to: "\nwindow.addEventListener('scroll', function () { document.body.style.top = '1px'; });\n",
    run: lint(), expect: /B10 .*Splitter\.js/ },
  { name: 'P1 · класс сниппета спеки без CSS', file: ds('components/atoms/Badge/Badge.md'),
    from: /$/, to: '\n```html\n<span class="zz-mutant"></span>\n```\n',
    run: lint('--parity'), expect: /P1 .*Badge\.md.*zz-mutant/ },
  { name: 'Б1 · поштучный CSS компонента на экране', file: path.join(ROOT, 'apps/postrade/deals-app/pages/MainPage.html'),
    from: '</head>', to: '<link rel="stylesheet" href="../../../../design-system/components/atoms/Chip/Chip.css">\n</head>',
    run: sensor('apps/postrade/deals-app/pages/MainPage.html'), expect: /^FAIL\s+Б1 нет поштучных CSS ДС/ },
  { name: 'Б1 · поштучный рантайм на экране', file: path.join(ROOT, 'apps/postrade/deals-app/pages/MainPage.html'),
    from: '</body>', to: '<script src="../../../../design-system/components/organisms/Table/TableResize.js"></script>\n</body>',
    run: sensor('apps/postrade/deals-app/pages/MainPage.html'), expect: /^FAIL\s+Б1 нет поштучных рантаймов ДС/ },
];

function runIt({ cwd, args }) {
  try {
    return execFileSync(process.execPath, args, { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) { return String(e.stdout || '') + String(e.stderr || ''); }
}

let bad = 0;
for (const c of CASES) {
  const orig = readFileSync(c.file);
  const text = orig.toString('utf8');
  const mutated = typeof c.from === 'string' ? text.replace(c.from, c.to) : text.replace(c.from, c.to);
  let verdict;
  if (mutated === text) verdict = 'НЕ ПРИМЕНИЛАСЬ';
  else {
    // до мутации правило молчит — иначе «сработало» ничего не доказывает
    const before = runIt(c.run).split('\n').some((l) => c.expect.test(l));
    writeFileSync(c.file, mutated);
    let out;
    try { out = runIt(c.run); } finally { writeFileSync(c.file, orig); }
    const hit = out.split('\n').find((l) => c.expect.test(l));
    verdict = before ? 'ШУМ: правило срабатывает и без мутации' : hit ? 'сработало: ' + hit.trim().slice(0, 150) : 'НЕ СРАБОТАЛО';
  }
  if (Buffer.compare(readFileSync(c.file), orig) !== 0) throw new Error('файл не восстановлен: ' + c.file);
  const ok = verdict.startsWith('сработало');
  if (!ok) bad++;
  console.log((ok ? 'ok    ' : 'FAIL  ') + c.name + ' — ' + verdict);
}
console.log('ВЕРДИКТ: ' + (bad ? 'FAIL (' + bad + ' из ' + CASES.length + ')' : 'OK (мутаций: ' + CASES.length + ')'));
process.exit(bad ? 1 : 0);
