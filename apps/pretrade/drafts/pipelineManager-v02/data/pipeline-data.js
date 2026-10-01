/* =========================================================================
   Pipeline Management — демо-данные прототипа («рыба»).
   Обычный <script>, а не JSON: страницы открываются по file://.

   Экспорт: window.PMData = {
     desks     — дески (отделы/команды по отраслям),
     leadStages, dealStages — стадии лидов и сделок pipeline (порядок = порядок колонок),
     people    — сотрудники, из которых собираются команды,
     items     — сделки и лиды: { id, kind: 'deal'|'lead', project, client, holding,
                 potentialId, crmId, desk, industry, macroIndustry, subIndustry,
                 regionBank, gosb, stage, probability, kpki, closeDate, key, star,
                 lead, team[], products[], volume, profit, docs, tasksDone,
                 tasksTotal, created, updated, desc, comments[], meetings[], linked }
   }
   Значения сгенерированы детерминированно (сид), чтобы экран был одинаковым
   при каждом открытии. Коды десков взяты из прототипов в Pixso; расшифровки
   — допущение прототипа (см. «Открытые вопросы» в спеке экрана).
   ========================================================================= */
(function () {
  'use strict';

  var DESKS = [
    { code: 'NRS', name: 'Pipe NRS', title: 'Природные ресурсы' },
    { code: 'TMT', name: 'Pipe TMT', title: 'Телеком, медиа, технологии' },
    { code: 'CNS', name: 'Pipe CNS', title: 'Потребительский сектор' },
    { code: 'IND', name: 'Pipe IND', title: 'Промышленность' },
    { code: 'RE',  name: 'Pipe RE',  title: 'Недвижимость' },
    { code: 'CE',  name: 'Pipe CE',  title: '' }
  ];

  /* tone — тон маркера колонки Kanban (kbcol--<tone>), пусто = серый
     Стадии лидов = группа «Лиды» (26.09.2026: перенесены «Обязательные сделки»
     и «Из маршрутизации» из сделок; порядок задан по ТЗ, «Из маршрутизации» — в конец) */
  var LEAD_STAGES = [
    { key: 'mandatory-lead', name: 'Обязательные лиды',      tone: 'orange' },
    { key: 'possible-lead',  name: 'Возможные лиды',         tone: 'lblue' },
    { key: 'idea',           name: 'Идея',                   tone: 'primary' },
    { key: 'lead-work',      name: 'В работе',               tone: 'green' },
    { key: 'mandatory',      name: 'Обязательные сделки',    tone: 'orange' },
    { key: 'possible-deal',  name: 'Возможные сделки',       tone: 'dpurple' },
    { key: 'routing',        name: 'Из маршрутизации',       tone: 'lblue' }
  ];
  var DEAL_STAGES = [
    { key: 'indicative', name: 'Направлен индикатив',        tone: 'dpurple' },
    { key: 'termsheet',  name: 'Направлен Term Sheet',       tone: 'primary' },
    { key: 'uw',         name: 'Направлена в Андеррайтинг',  tone: 'orange' },
    { key: 'kpki',       name: 'Пройден КПКИ / Закрытие',    tone: 'green' }
  ];

  var PEOPLE = [
    { id: 'pkk', short: 'Петров К.К.',    name: 'Петров Кирилл Константинович', ini: 'ПК', role: 'Директор' },
    { id: 'iai', short: 'Иванов А.И.',    name: 'Иванов Александр Иванович',    ini: 'ИА', role: 'VP' },
    { id: 'bvs', short: 'Белова В.С.',    name: 'Белова Виктория Сергеевна',     ini: 'БВ', role: 'Консультант-аналитик' },
    { id: 'ima', short: 'Ильина М.А.',    name: 'Ильина Мария Андреевна',        ini: 'ИМ', role: 'Старший аналитик' },
    { id: 'sro', short: 'Слепцов Р.О.',   name: 'Слепцов Роман Олегович',        ini: 'СР', role: 'Региональный директор' },
    { id: 'kdn', short: 'Кузнецова Д.Н.', name: 'Кузнецова Дарья Николаевна',    ini: 'КД', role: 'Юрист' },
    { id: 'gev', short: 'Громов Е.В.',    name: 'Громов Евгений Витальевич',     ini: 'ГЕ', role: 'Риск-менеджер' },
    { id: 'aps', short: 'Орлов П.С.',     name: 'Орлов Павел Сергеевич',         ini: 'ОП', role: 'VP' }
  ];

  var CLIENTS = [
    ['ООО «Ромашка»', 'ГК Ромашка'], ['ООО «Одуванчик Медиа»', 'ГК Одуванчик'],
    ['АО «Северсталь-Инвест»', 'ГК Северный металл'], ['ПАО «Волга-Телеком»', 'ГК Волга'],
    ['ООО «Гранд-Девелопмент»', 'ГК Гранд'], ['АО «Сибагро»', 'Агрохолдинг Сибирь'],
    ['ООО «Каспий-Порт»', 'ГК Каспий'], ['АО «Промлизинг»', 'ГК Промфинанс'],
    ['ООО «ЮгСтрой»', 'ГК ЮгСтрой'], ['ПАО «Уралсталь»', 'ГК Урал'],
    ['АО «Балтэнерго»', 'ГК Балтика'], ['ООО «Мосэлектро»', 'ГК Мосэлектро'],
    ['АО «Кубань-Зерно»', 'Агрохолдинг Юг'], ['ООО «ТехноСфера»', 'ГК ТехноСфера'],
    ['АО «Северный проект»', 'ГК Северный проект'], ['ООО «Лента-Логистик»', 'ГК Лента'],
    ['ПАО «НефтеХимПром»', 'ГК НХП'], ['ООО «Дата-Центр Урал»', 'ГК Урал'],
    ['АО «Белгород-Мясо»', 'Агрохолдинг Черноземье'], ['ООО «Арктик Газ»', 'ГК Арктика'],
    ['АО «Невский Квартал»', 'ГК Невский'], ['ООО «Фарм-Лайн»', 'ГК Фарм'],
    ['АО «Цифровые решения»', 'ГК Цифра'], ['ООО «Алтай-Молоко»', 'Агрохолдинг Алтай']
  ];

  var PRODUCTS = ['Акционерный мезонин', 'Кредитный мезонин', 'Выкуп доли', 'Опцион',
    'Акционерное финансирование', 'Проектное финансирование', 'Бридж-кредит'];

  /* Краткое наименование продукта для карточки канбана. Полное наименование —
     только в предпросмотре сделки (см. спеку экрана). */
  var PRODUCT_SHORT = {
    'Акционерный мезонин': 'акц.мез.',
    'Кредитный мезонин': 'кред.мез.',
    'Выкуп доли': 'выкуп доли',
    'Опцион': 'опц.',
    'Акционерное финансирование': 'акц.фин.',
    'Проектное финансирование': 'проект.фин.',
    'Бридж-кредит': 'бридж-кр.'
  };

  var PROJECTS = ['Модернизация производств', 'Расширение присутствия в регионах',
    'Цифровая трансформация', 'Развитие сети продаж', 'Программа импортозамещения',
    'Строительство логистического хаба', 'Реструктуризация долга', 'M&A сделка'];

  var INDUSTRIES = [
    { macro: 'Промышленность',     industry: 'Металлургия',          sub: 'Чёрная металлургия' },
    { macro: 'Промышленность',     industry: 'Нефтехимия',           sub: 'Нефтепереработка' },
    { macro: 'Промышленность',     industry: 'Машиностроение',       sub: 'Автокомпоненты' },
    { macro: 'Телеком и медиа',    industry: 'Телекоммуникации',     sub: 'Фиксированная связь' },
    { macro: 'Телеком и медиа',    industry: 'Медиа и развлечения',  sub: 'Онлайн-платформы' },
    { macro: 'Потребительский',    industry: 'Ретейл',               sub: 'Продуктовый ретейл' },
    { macro: 'Потребительский',    industry: 'FMCG',                 sub: 'Пищевые продукты' },
    { macro: 'Недвижимость',       industry: 'Девелопмент',          sub: 'Жилая недвижимость' },
    { macro: 'Недвижимость',       industry: 'Коммерческая аренда',  sub: 'Бизнес-центры' },
    { macro: 'АПК',                industry: 'Сельское хозяйство',   sub: 'Растениеводство' },
    { macro: 'АПК',                industry: 'Пищевая промышленность', sub: 'Переработка' },
    { macro: 'Энергетика',         industry: 'Электроэнергетика',    sub: 'Генерация' },
    { macro: 'Энергетика',         industry: 'Нефтегаз',             sub: 'Добыча' }
  ];

  var REGION_BANKS = ['Московский банк', 'Северо-Западный банк', 'Центрально-Чернозёмный банк',
    'Поволжский банк', 'Уральский банк', 'Сибирский банк', 'Дальневосточный банк',
    'Юго-Западный банк'];
  var GOSB_CODES = ['Московский', 'Нижегородский', 'Ростовский', 'Екатеринбургский',
    'Новосибирский', 'Красноярский', 'Приморский', 'Краснодарский'];

  var MEETING_TOPICS = ['Первичная встреча с клиентом', 'Обсуждение структуры сделки',
    'Согласование индикативных условий', 'Созвон по Term Sheet', 'Встреча с акционерами'];

  var MEETING_DESCS = ['Обсуждены текущие потребности клиента в финансировании и предварительные условия.',
    'Согласована предварительная структура сделки, определены ключевые параметры.',
    'Рассмотрены индикативные условия, сформирован план дальнейших шагов.',
    'Согласован текст Term Sheet, определены ответственные за подготовку документов.',
    'Обсуждены вопросы участия акционеров и корпоративных процедур.'];

  var CLIENT_PEOPLE = [
    { name: 'Смирнов Алексей Викторович', ini: 'СА', role: 'Генеральный директор' },
    { name: 'Козлова Елена Николаевна',    ini: 'КЕ', role: 'Финансовый директор' },
    { name: 'Попов Дмитрий Сергеевич',     ini: 'ПД', role: 'Бенефициарный владелец' },
    { name: 'Морозова Ирина Андреевна',    ini: 'МИ', role: 'Руководитель юридического отдела' },
    { name: 'Волков Кирилл Михайлович',    ini: 'ВК', role: 'Директор по развитию' }
  ];

  var TASK_PRIORITIES = ['Средний', 'Низкий'];
  var TASK_STATUSES = ['Запланирована', 'Завершена', 'Отменена'];
  var TASK_ACTIONS = ['Подготовить проект документации', 'Согласовать условия', 'Направить запрос клиенту',
    'Подготовить заключение', 'Обновить финансовую модель'];
  var TASK_DESCS = ['Подготовить и направить клиенту пакет документов по сделке.',
    'Свериться с коллегами из смежного подразделения по условиям финансирования.',
    'Запросить у клиента актуальную финансовую отчётность для оценки.',
    'Согласовать условия с риск-подразделением до конца недели.',
    'Обновить финансовую модель с учётом новых вводных от клиента.',
    'Подготовить проект заключения для внутреннего комитета.'];

  /* детерминированный генератор: mulberry32 */
  var seed = 20260916;
  function rnd() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
  function pick(a) { return a[Math.floor(rnd() * a.length)]; }
  function int(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function date(dayFrom, dayTo) {
    var d = new Date(2026, 0, 1);
    d.setDate(d.getDate() + int(dayFrom, dayTo));
    return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear();
  }

  /* распределение по стадиям — «воронка»: ранних стадий больше */
  var LEAD_WEIGHTS = [12, 11, 8, 5, 16, 10, 15];
  var DEAL_WEIGHTS = [12, 10, 8, 12];

  var items = [];
  var dealNo = 10412, leadNo = 20107;

  /* участник встречи: {name, ini, role}, role — должность-субтайтл */
  function clientPerson() { return pick(CLIENT_PEOPLE); }
  function didPerson() { var p = pick(PEOPLE); return { name: p.name, ini: p.ini, role: p.role }; }
  function meetingPeople() {
    var client = [clientPerson()];
    if (rnd() > 0.5) { var c2 = clientPerson(); if (c2.ini !== client[0].ini) client.push(c2); }
    var did = [didPerson()];
    if (rnd() > 0.5) { var d2 = didPerson(); if (d2.ini !== did[0].ini) did.push(d2); }
    return { client: client, did: did };
  }
  function flags() {
    return {
      stratDialogue: rnd() > 0.4,
      km: rnd() > 0.5,
      sponsor: rnd() > 0.6
    };
  }
  /* задача: появляется только у завершённых встреч, 0–2 шт. */
  function makeTasks() {
    var n = int(0, 2), out = [];
    for (var i = 0; i < n; i++) {
      var done = rnd() > 0.5;
      var a = pick(PEOPLE);
      out.push({
        id: int(10000, 99999),
        action: pick(TASK_ACTIONS),
        desc: pick(TASK_DESCS),
        priority: pick(TASK_PRIORITIES),
        status: done ? 'Завершена' : 'Запланирована',
        due: date(258, 295) + ' · ' + int(9, 18) + ':00',
        assignee: a.short,
        assigneeName: a.name,
        assigneeIni: a.ini,
        done: done
      });
    }
    return out;
  }
  function makeMeetings() {
    function one(status) {
      var ppl = meetingPeople();
      var completed = status === 'completed';
      return {
        id: 'M-' + int(10000, 99999),
        status: status,
        statusLabel: completed ? 'Завершена' : 'Запланирована',
        date: date(180, 230),
        timeText: (function () { var s = int(9, 16), e = int(s + 1, 18); return s + ':00-' + e + ':30 (Москва UTC+3)'; })(),
        topic: pick(MEETING_TOPICS),
        desc: pick(MEETING_DESCS),
        client: ppl.client,
        did: ppl.did,
        flags: flags(),
        tasks: completed ? makeTasks() : []
      };
    }
    var list = [];
    list.push(one('planned'));
    list.push(one('completed'));
    if (rnd() > 0.5) list.push(one(rnd() > 0.5 ? 'planned' : 'completed'));
    return list;
  }

  function makeItem(kind, stageKey) {
    var c = pick(CLIENTS);
    var lead = pick(PEOPLE);
    var teamSize = int(1, 5);
    var team = [lead.id];
    while (team.length < teamSize) {
      var p = pick(PEOPLE).id;
      if (team.indexOf(p) < 0) team.push(p);
    }
    var prods = [pick(PRODUCTS)];
    if (rnd() > 0.6) { var p2 = pick(PRODUCTS); if (p2 !== prods[0]) prods.push(p2); }
    var volume = kind === 'lead' ? int(2, 60) * 50 : int(4, 120) * 50;       /* млн RUB */
    var profit = Math.round(volume * (0.012 + rnd() * 0.035) * 10) / 10;     /* млн RUB */
    var tasksTotal = int(2, 8);
    var ind = pick(INDUSTRIES);
    /* вероятность заключения и ключевые даты — оценка прототипа */
    var probability = int(10, 90);
    var kpki = date(100, 230);
    var closeDate = date(240, 340);
    return {
      id: kind === 'lead' ? 'L-' + (leadNo++) : 'D-' + (dealNo++),
      kind: kind,
      project: pick(PROJECTS),
      client: c[0],
      holding: c[1],
      potentialId: 'P-' + int(3000, 9999),
      crmId: int(1000000, 9999999),
      desk: pick(DESKS).code,
      industry: ind.industry,
      macroIndustry: ind.macro,
      subIndustry: ind.sub,
      regionBank: pick(REGION_BANKS),
      gosb: pick(GOSB_CODES),
      stage: stageKey,
      probability: probability,
      kpki: kpki,
      closeDate: closeDate,
      key: kind === 'deal' && rnd() > 0.78,
      star: rnd() > 0.75,
      lead: lead.id,
      team: team,
      products: prods,
      volume: volume,
      profit: profit,
      docs: int(0, 9),
      tasksDone: int(0, tasksTotal),
      tasksTotal: tasksTotal,
      created: date(0, 200),
      updated: date(200, 258),
      desc: 'Компания рассматривает привлечение финансирования под программу развития: модернизация производственных мощностей и расширение присутствия в регионах. Банк предлагает структуру с участием в капитале и опционом обратного выкупа.',
      comments: rnd() > 0.4 ? [{ author: 'Слепцов Р.О.', at: '14:00 ' + date(220, 258), text: pick(['Принята в работу', 'Клиент запросил индикатив до конца месяца', 'Ждём финансовую модель от клиента', 'Согласовали состав команды']) }] : [],
      meetings: makeMeetings(),
      linked: kind === 'deal' && rnd() > 0.5 ? 'L-' + int(19800, 20100) : null
    };
  }

  LEAD_STAGES.forEach(function (s, i) {
    for (var n = 0; n < LEAD_WEIGHTS[i]; n++) items.push(makeItem('lead', s.key));
  });
  DEAL_STAGES.forEach(function (s, i) {
    for (var n = 0; n < DEAL_WEIGHTS[i]; n++) items.push(makeItem('deal', s.key));
  });

  window.PMData = {
    desks: DESKS,
    leadStages: LEAD_STAGES,
    dealStages: DEAL_STAGES,
    people: PEOPLE,
    products: PRODUCTS,
    productShort: PRODUCT_SHORT,
    items: items
  };
})();
