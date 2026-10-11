/* =========================================================================
   Статусная модель сделки ДИД — единственный источник (window.DEAL_STATUS_MODEL).

   Четыре дорожки — Сделка, ЦУП, Operations, Мониторинг: статусы каждой, переходы
   между ними (кто, кнопка или пункт меню, окно навигатора, условие), степперы тайла
   «Заведение сделки» (Navigator) и открытые вопросы по макетам. Читают:
     - DealsStore (deals-store.js) — тоны статусных чипов и статусы, в которых
       сущности сделки не правятся;
     - тайл Navigator (виджет страницы сделки) — степпер, кнопки, переходы;
     - генератор схемы: node .agents/tools/status-model.mjs <этот файл> пишет рядом
       deal-status-model.md — схему Mermaid, таблицы, несостыковки и вопросы.
       Его руками не править: правка — здесь, затем перезапуск генератора;
     - витрина локальных компонентов (kit-build.mjs, задача RE0014): страница
       «Статусная модель сделки» в категории «Сделка» — интерактивная схема
       (kit-model.js читает этот файл), описание из meta.about, связи из
       meta.related, таблицы и вопросы. После правки — node .agents/tools/kit-build.mjs.

   Обычный <script>, а не JSON: страницы открываются по file://. Подключается ДО
   deals-store.js: <script src="../data/deal-status-model.js"></script>.

   Источники: макеты дизайнера «Статусы сделки» (схема по дорожкам с легендой
   «терминальный / конечный / целевой» и линиями «ручное / автоматическое действие»)
   и «screenflow» (у статусов — вид тайла и пояснение), требования
   refs/Текущий портфель.md (таблицы статусов, смысл и цвета). Макеты расходятся;
   расхождения не закрываются догадкой — они в openQuestions, у статуса и
   перехода — номерами в questions. Где прототипу нужен один вариант, он взят и
   помечен в note словом «допущение».

   label статуса — ровно то значение, что лежит в поле записи сделки
   (mock-deals.js) и видно в чипе; вариант подписи со схемы — в note и вопросе.
   ========================================================================= */

/**
 * Модель целиком.
 * Source: invented (09.10.2026) — DTO статусов нет; заменить, когда придёт.
 * @typedef {Object} StatusModel
 * @property {StatusModelMeta} meta
 * @property {StatusLane[]} lanes
 * @property {DealStatus[]} statuses
 * @property {StatusTransition[]} transitions
 * @property {LaneStepper[]} steppers
 * @property {StatusOpenQuestion[]} openQuestions
 */

/**
 * Заголовок модели и откуда генератор берёт записи для сверки значений.
 * Source: invented (09.10.2026).
 * @typedef {Object} StatusModelMeta
 * @property {string} title                    заголовок схемы
 * @property {{file: string, global: string}} records  файл демо-данных рядом
 *           с моделью и глобальная переменная с массивом записей
 * @property {string} name                     пункт меню и заголовок страницы модели
 *                                             в витрине локальных компонентов
 * @property {string} category                 категория витрины (project.json →
 *                                             localKit.categories)
 * @property {string} purpose                  одна строка: карточка обзора витрины
 * @property {{title: string, text: string}[]} about  «Как работает» — разделы
 *           описания; только из note и when модели, допущения и вопросы названы
 * @property {{label: string, ref: string}[]} related  связанные объекты, кроме окон
 *           (окна — из transitions[].modal): id виджета или путь от файла модели
 */

/**
 * Дорожка — подразделение со своим статусом сделки.
 * Source: invented (09.10.2026).
 * @typedef {Object} StatusLane
 * @property {StatusLaneCode} id
 * @property {string} label                    подпись вкладки и дорожки схемы
 * @property {string|null} avatar              буква аватарки чипа; у общего статуса нет
 * @property {string} field                    поле записи сделки со статусом дорожки
 * @property {'general'|'mon'} toneScope       словарь тонов стора (DealsStore.statusTone)
 */

/** Source: invented (09.10.2026). @typedef {'deal'|'tsup'|'ops'|'mon'} StatusLaneCode */

/**
 * Статус дорожки.
 * Source: invented (09.10.2026).
 * @typedef {Object} DealStatus
 * @property {string} id                       уникален в модели: <дорожка>_<имя>
 * @property {StatusLaneCode} lane
 * @property {string} label                    значение поля записи и текст чипа
 * @property {StatusKindCode|null} kind        вид по легенде схемы; null — на схеме нет
 * @property {string|null} tone                класс тона чипа ДС; null — тон не задан
 * @property {boolean|null} editable           правятся ли сущности сделки (только у
 *                                             дорожки deal; null — не задано)
 * @property {string} note                     пояснение со screenflow и из требований
 * @property {number[]} [questions]            номера открытых вопросов
 */

/**
 * Вид статуса по легенде схемы. Разница между terminal, final и target на макете
 * не определена (вопрос 13).
 * Source: invented (09.10.2026).
 * @typedef {'initial'|'intermediate'|'target'|'final'|'terminal'} StatusKindCode
 */

/**
 * Переход между статусами одной дорожки. Порядок переходов из одного статуса —
 * порядок кнопок в подвале тайла Navigator: первая — Accent, остальные — Outline
 * (на области один Accent — правило Button ДС).
 * Source: invented (09.10.2026).
 * @typedef {Object} StatusTransition
 * @property {string} id
 * @property {string} from                     id статуса
 * @property {string} to                       id статуса; равен from — действие без
 *                                             смены статуса (отметка внутри статуса)
 * @property {'manual'|'auto'|null} trigger    ручное действие или автоматическое;
 *                                             null — макеты не говорят
 * @property {string|null} actor               кто нажимает
 * @property {'button'|'menu'|null} via        кнопка подвала тайла или пункт кебаба
 * @property {string|null} action              подпись кнопки или пункта меню
 * @property {string|null} modal               окно навигатора (widgets/modals/<Имя>)
 * @property {string|null} when                условие словами
 * @property {{any?: string[], all?: string[]}} [after]  автопереход срабатывает
 *           после любого (any) или всех (all) перечисленных переходов
 * @property {string[]} [requires]             и только если запись стоит во всех
 *                                             этих статусах
 * @property {string} [note]
 * @property {number[]} [questions]
 */

/**
 * Степпер тайла на вкладке дорожки. Вариантов несколько, если макеты показывают
 * разный путь (у мониторинга — ГК СБИ, ПАО, изменения).
 * Source: invented (09.10.2026).
 * @typedef {Object} LaneStepper
 * @property {StatusLaneCode} lane
 * @property {string} variant
 * @property {'checklist'|'statuses'} mode     чек-лист заполнения или путь статусов
 * @property {string[]} shownIn                id статусов, в которых виден вариант
 * @property {StepperStep[]} steps
 * @property {{label: string, shownIn: string[], note: string}[]} [extraButtons]
 * @property {string} [note]
 * @property {number[]} [questions]
 */

/**
 * Шаг степпера: статус пути или пункт чек-листа; group — вложенная рамка шагов.
 * Source: invented (09.10.2026).
 * @typedef {Object} StepperStep
 * @property {string} label
 * @property {string|null} [status]            id статуса, если шаг — статус
 * @property {{title: string, items: string[]}} [group]
 */

/**
 * Открытый вопрос по макетам и требованиям.
 * Source: invented (09.10.2026).
 * @typedef {Object} StatusOpenQuestion
 * @property {number} n
 * @property {string[]} about                  id статусов и переходов
 * @property {string} text
 * @property {string} since                    ДД.ММ.ГГГГ
 */

/** @type {StatusModel} */
window.DEAL_STATUS_MODEL = {
  meta: {
    title: 'Статусная модель сделки ДИД',
    records: { file: 'mock-deals.js', global: 'MOCK_DEALS' },
    name: 'Статусная модель сделки',
    category: 'Сделка',
    purpose: 'Статусы сделки по дорожкам Сделка, ЦУП, Operations и Мониторинг: как и при каких условиях они переходят друг в друга',
    about: [
      { title: 'Дорожки',
        text: 'У сделки четыре статуса сразу — по дорожке на каждого участника процесса: общий статус сделки (поле status), ЦУП (statusTsup), Operations (statusOps) и Мониторинг (statusMon). Дорожки — вкладки тайла «Заведение сделки» (Navigator); на каждой — степпер и кнопки переходов из текущего статуса. Чипы шапки сделки и реестра портфеля показывают те же значения. Сплошная стрелка — ручной переход (кнопка подвала тайла или пункт кебаба), пунктир — автоматический: он срабатывает после переходов других дорожек.' },
      { title: 'Первый цикл',
        text: 'Новая сделка — «Черновик» на всех дорожках, кроме мониторинга («На утверждении»). Сущности правятся. Когда нажат шаг «Согласование» степпера, включается «Передать на сопровождение»: сделка уходит в «Ожидает подтверждения», ЦУП — в «Ожидает назначения ответственного», Operations — в «Ожидает подтверждения». ЦУП назначает ответственного (окно назначения), затем утверждает; Operations подтверждает. Подтверждение одного меняет только его статус. Когда ЦУП утвердил и Operations подтвердил, сделка автоматически становится «Активной», а мониторинг — «Утверждена».' },
      { title: 'Корректировка',
        text: 'ЦУП или Operations могут вернуть сделку «На корректировку»: сделка автоматически переходит в «Корректировку», сущности снова правятся. Исправленную сделку снова передают на сопровождение той же кнопкой — допущение, в требованиях «вновь отправить на подтверждение». Меняется ли статус второй команды, когда возвращает одна, — вопрос 23. На схеме макета у дорожки «Сделка» «Корректировки» нет — вопрос 2.' },
      { title: 'Цикл изменений',
        text: '«Ввести изменения» в кебабе «Активной» сделки открывает окно причины и переводит сделку в «Ввод изменений»; ЦУП и Operations переходят туда же автоматически. После правок снова нажимают «Согласование» и передают на сопровождение — «Подтверждение изменений». Дальше как в первом цикле, но без назначения ответственного. Когда ЦУП и Operations приняли изменения, сделка снова «Активная» (допущение: автоматически, на схеме линия сплошная — вопрос 10); вернуть изменения можно «На корректировку» — «Корректировка изменений».' },
      { title: 'Мониторинг',
        text: 'После утверждения ЦУП мониторинг — «Утверждена». Сотрудник ЦУП отправляет сделку на мониторинг: «На мониторинг (ПАО Сбербанк)» ставит её на мониторинг сразу; «На мониторинг (ГК СБИ)» ведёт в «Ожидает передачи на мониторинг», затем «Направить на передачу» с датой. В «Передана» три подразделения — РМ, ПМ и ПМЗ — подтверждают приём (окно подтверждения); это отметки внутри статуса, а не статусы (допущение, вопрос 9). Когда приняли все трое — «На мониторинге ГК СБИ». Как сделка попадает из «Направлена на передачу» в «Передана», макеты не показывают — вопрос 19. Изменения на мониторинг передаются пунктом кебаба тем же путём (вопрос 7).' },
      { title: 'Погашение и возврат',
        text: '«Погасить» в кебабе «Активной» сделки открывает окно с датой погашения; дата встаёт в карточку «Сроки сделки». Сделка — «Погашена», остальные дорожки гасятся автоматически. Погашение обратимо: «Вернуть в действующие» возвращает сделку в «Активную», инструменты остаются погашенными (вопросы 1 и 24).' },
      { title: 'Удаление',
        text: 'Черновик можно удалить пунктом кебаба. Удалённой сделки нет в портфеле, статусы трёх других ролей не отображаются, восстановить её нельзя. Статуса «Удалена» нет в требованиях и данных — вопрос 12.' }
    ],
    related: [
      { label: 'Тайл «Заведение сделки» — степпер, кнопки и переходы по модели', ref: 'Navigator' },
      { label: 'DealsStore — тоны статусных чипов и статусы только для просмотра', ref: 'deals-store.js' },
      { label: 'Демо-данные сделок — значения статусов в записях', ref: 'mock-deals.js' },
      { label: 'Страница сделки — тайл и чипы шапки', ref: '../pages/Deal.html' },
      { label: 'Текущий портфель — чипы статусов в реестре', ref: '../pages/Portfolio.html' },
      { label: 'Требования: таблицы статусов, смысл и цвета', ref: '../refs/Текущий портфель.md' },
      { label: 'Схема и таблицы для репозитория (генерат)', ref: 'deal-status-model.md' },
      { label: 'Задача RE0013 — тайл, окна навигатора и статусная модель', ref: '../../../../docs/tasks/RE0013-deal-navigator.md' },
      { label: 'Задача RE0014 — эта страница', ref: '../../../../docs/tasks/RE0014-deal-status-model-page.md' }
    ]
  },

  lanes: [
    { id: 'deal', label: 'Сделка', avatar: null, field: 'status', toneScope: 'general' },
    { id: 'tsup', label: 'ЦУП', avatar: 'Ц', field: 'statusTsup', toneScope: 'general' },
    { id: 'ops', label: 'Operations', avatar: 'O', field: 'statusOps', toneScope: 'general' },
    { id: 'mon', label: 'Мониторинг', avatar: 'М', field: 'statusMon', toneScope: 'mon' }
  ],

  statuses: [
    /* ---- Сделка ---- */
    { id: 'deal_draft', lane: 'deal', label: 'Черновик', kind: 'initial', tone: 'chip--dark', editable: true,
      note: 'Все новые сделки создаются с этим статусом. Минимум для передачи на сопровождение: дата заключения и один из инструментов (акция, транш…); остальные карточки можно оставить пустыми. Кнопка «Передать на сопровождение» неактивна, пока не нажат шаг «Согласование» степпера.' },
    { id: 'deal_deleted', lane: 'deal', label: 'Удалена', kind: 'terminal', tone: null, editable: null,
      note: 'Статусы трёх других ролей не отображаются. Удалённой сделки нет в «Текущем портфеле ДИД», открыть её можно только по прямой ссылке. Восстановить нельзя — только завести новую с теми же данными.',
      questions: [12] },
    { id: 'deal_awaiting', lane: 'deal', label: 'Ожидает подтверждения', kind: 'intermediate', tone: 'chip--warning', editable: false,
      note: 'ЦУП и Operations проверяют данные: ЦУП — контрагентов, даты, корпдоговоры и обеспечение; Operations — продукты и инструменты, даты покупки и продажи, суммы, комиссии. Каждый принимает сделку или отправляет на корректировку; подтверждение одного меняет только его статус. Подвал тайла — строка статуса, кнопок нет.' },
    { id: 'deal_correction', lane: 'deal', label: 'Корректировка', kind: null, tone: 'chip--info', editable: true,
      note: 'Сделка не прошла утверждение и возвращена на корректировку (требования). На схеме у дорожки «Сделка» этого статуса нет.',
      questions: [2, 3] },
    { id: 'deal_active', lane: 'deal', label: 'Активная', kind: 'final', tone: 'chip--success', editable: false,
      note: 'Обе команды (ЦУП и Operations) утвердили сделку. Дальше — погасить или ввести изменения, проходя цикл утверждения заново. Сущности не правятся.',
      questions: [13] },
    { id: 'deal_repaid', lane: 'deal', label: 'Погашена', kind: 'terminal', tone: 'chip--dpurple', editable: false,
      note: 'Гасится из кебаба навигатора с датой погашения; дата встаёт в карточку «Сроки сделки». Все инструменты и все статусы сделки тоже погашаются. Погашение обратимо: сделку можно вернуть в действующие, инструменты останутся погашенными.',
      questions: [1, 14] },
    { id: 'deal_changes_input', lane: 'deal', label: 'Ввод изменений', kind: 'intermediate', tone: 'chip--info', editable: true,
      note: 'Изменения вносятся через кебаб навигатора; сущности снова правятся. Изменение может влиять на финметрики (пришёл платёж, пересчитаны проценты) или не влиять (команда, описание). В подвале — «Список изменений» и «Передать на сопровождение».' },
    { id: 'deal_changes_confirm', lane: 'deal', label: 'Подтверждение изменений', kind: 'intermediate', tone: 'chip--warning', editable: false,
      note: 'После ввода изменений снова нажимают шаг «Согласование» и передают на сопровождение. Дальше как в первом цикле, но без назначения ответственного от ЦУП.' },
    { id: 'deal_changes_correction', lane: 'deal', label: 'Корректировка изменений', kind: null, tone: 'chip--info', editable: true,
      note: 'Изменения не прошли подтверждение и возвращены на корректировку (требования). На схеме у дорожки «Сделка» этого статуса нет.',
      questions: [2] },

    /* ---- ЦУП ---- */
    { id: 'tsup_draft', lane: 'tsup', label: 'Черновик', kind: 'initial', tone: 'chip--dark', editable: null,
      note: 'Пока сделку не передали на согласование.' },
    { id: 'tsup_awaiting_responsible', lane: 'tsup', label: 'Ожидает назначения ответственного', kind: 'intermediate', tone: 'chip--warning', editable: null,
      note: 'Директор ЦУП или сотрудник ЦУП выбирает ответственного за сделку; выбранный сотрудник попадает в команду сделки. В окне — ГСЗ из описания сделки, сделки этой ГСЗ и их ответственные.' },
    { id: 'tsup_awaiting', lane: 'tsup', label: 'Ожидает подтверждения', kind: 'intermediate', tone: 'chip--warning', editable: null,
      note: 'ЦУП проверяет контрагентов, даты, корпдоговоры и обеспечение; утверждает или возвращает на корректировку.' },
    { id: 'tsup_correction', lane: 'tsup', label: 'Корректировка', kind: 'intermediate', tone: 'chip--info', editable: null,
      note: 'ЦУП или Operations вернули сделку: данные исправляют и снова отправляют на подтверждение.',
      questions: [3, 23] },
    { id: 'tsup_approved', lane: 'tsup', label: 'Утверждена', kind: 'target', tone: 'chip--success', editable: null,
      note: 'Сотрудник ЦУП утвердил сделку или корректировку.' },
    { id: 'tsup_changes_input', lane: 'tsup', label: 'Ввод изменений', kind: 'intermediate', tone: 'chip--info', editable: null,
      note: 'Сотрудник ЦУП или иной сотрудник вводит изменения.' },
    { id: 'tsup_changes_confirm', lane: 'tsup', label: 'Подтверждение изменений', kind: 'intermediate', tone: 'chip--warning', editable: null,
      note: 'ЦУП проверяет изменения: принимает или отправляет на корректировку.',
      questions: [11, 18] },
    { id: 'tsup_changes_correction', lane: 'tsup', label: 'Корректировка изменений', kind: 'intermediate', tone: 'chip--info', editable: null,
      note: 'На схеме узел подписан «Корректировка».',
      questions: [4] },
    { id: 'tsup_repaid', lane: 'tsup', label: 'Погашена', kind: null, tone: 'chip--dpurple', editable: null,
      note: 'Как у сделки: если сделка гасится, она гасится для всех.',
      questions: [14] },

    /* ---- Operations ---- */
    { id: 'ops_draft', lane: 'ops', label: 'Черновик', kind: 'initial', tone: 'chip--dark', editable: null,
      note: 'Пока сделку не передали на согласование.' },
    { id: 'ops_awaiting', lane: 'ops', label: 'Ожидает подтверждения', kind: 'intermediate', tone: 'chip--warning', editable: null,
      note: 'Operations проверяет продукты и инструменты, даты покупки и продажи, суммы, комиссии; подтверждает или возвращает на корректировку.' },
    { id: 'ops_correction', lane: 'ops', label: 'Корректировка', kind: 'intermediate', tone: 'chip--info', editable: null,
      note: 'ЦУП или Operations вернули сделку: данные исправляют и снова отправляют на согласование (сопровождение).',
      questions: [3, 23] },
    { id: 'ops_on_support', lane: 'ops', label: 'На сопровождении', kind: 'target', tone: 'chip--success', editable: null,
      note: 'Сотрудник Operations всё проверил и принял сделку.' },
    { id: 'ops_changes_input', lane: 'ops', label: 'Ввод изменений', kind: 'intermediate', tone: 'chip--info', editable: null,
      note: 'Сделка переведена в ввод изменений.' },
    { id: 'ops_changes_confirm', lane: 'ops', label: 'Подтверждение изменений', kind: 'intermediate', tone: 'chip--warning', editable: null,
      note: 'Неверные изменения ЦУП или Operations возвращают на корректировку изменений.' },
    { id: 'ops_changes_correction', lane: 'ops', label: 'Корректировка изменений', kind: 'intermediate', tone: 'chip--info', editable: null,
      note: 'На схеме узел подписан «Корректировка».',
      questions: [4] },
    { id: 'ops_repaid', lane: 'ops', label: 'Погашена', kind: null, tone: 'chip--dpurple', editable: null,
      note: 'Как у сделки: если сделка гасится, она гасится для всех.',
      questions: [14] },

    /* ---- Мониторинг ---- */
    { id: 'mon_on_approval', lane: 'mon', label: 'На утверждении', kind: 'initial', tone: 'chip--dark', editable: null,
      note: 'Первый статус вкладки мониторинга у только что созданной сделки (требования). На схеме его нет.',
      questions: [5] },
    { id: 'mon_approved', lane: 'mon', label: 'Утверждена', kind: 'intermediate', tone: 'chip--dark', editable: null,
      note: 'Первый статус вкладки мониторинга, ставится автоматически после утверждения ЦУП (screenflow). На мониторинг отправляет сотрудник ЦУП: ГК СБИ — если есть кредиты, акции, опционы с баланса ГК СБИ; ПАО Сбербанк — если их нет, а есть корпдоговор и НКЛ с баланса ПАО.',
      questions: [5, 16] },
    { id: 'mon_awaiting_transfer', lane: 'mon', label: 'Ожидает передачи на мониторинг', kind: 'intermediate', tone: 'chip--warning', editable: null,
      note: 'Промежуточный статус после «На мониторинг (ГК СБИ)». Когда документы готовы, сделку направляют на передачу с датой.' },
    { id: 'mon_sent_to_transfer', lane: 'mon', label: 'Направлена на передачу', kind: 'intermediate', tone: 'chip--warning', editable: null,
      note: 'Три подразделения (ПМ, РМ, ПМЗ) подтверждают, что всё проверили и приняли сделку; кнопки нажимает сотрудник ЦУП. На схеме узел подписан «Направлено на передачу».',
      questions: [17, 19] },
    { id: 'mon_transferred', lane: 'mon', label: 'Передана', kind: 'intermediate', tone: 'chip--warning', editable: null,
      note: 'На схеме узел «Передача»; в этом статусе тайл показывает кнопки «РМ принял», «ПМ принял», «ПМЗ принял».',
      questions: [6, 9, 19] },
    { id: 'mon_on_mon_sbi', lane: 'mon', label: 'На мониторинге ГК СБИ', kind: 'final', tone: 'chip--success', editable: null,
      note: 'После принятия всеми тремя подразделениями сделка встаёт на мониторинг. Дальше можно передавать изменения на мониторинг.',
      questions: [8] },
    { id: 'mon_on_mon_pao', lane: 'mon', label: 'На мониторинге ПАО Сбербанк', kind: 'final', tone: 'chip--success', editable: null,
      note: 'Кнопка «На мониторинг (ПАО Сбербанк)» ставит на мониторинг сразу, без дополнительных шагов. Есть технический переход с ПАО на передачу в ГК СБИ и обратно.',
      questions: [8, 25] },
    { id: 'mon_changes_awaiting', lane: 'mon', label: 'Изменения ожидают передачи на мониторинг', kind: null, tone: 'chip--warning', editable: null,
      note: 'Пункт кебаба «Передать изменения на мониторинг». На схеме цикл изменений — один узел «Передача изменений на мониторинг».',
      questions: [7] },
    { id: 'mon_changes_sent', lane: 'mon', label: 'Изменения направлены на передачу', kind: null, tone: 'chip--warning', editable: null,
      note: 'Дальше те же шаги, что при первой передаче на мониторинг.',
      questions: [7, 19] },
    { id: 'mon_changes_transfer', lane: 'mon', label: 'Передача изменений', kind: 'intermediate', tone: 'chip--warning', editable: null,
      note: 'На screenflow узел «Передача изменений на мониторинг», на схеме «Статусы сделки» цикла изменений мониторинга нет; в этом статусе тайл показывает кнопки «РМ принял», «ПМ принял», «ПМЗ принял».',
      questions: [7, 20] },
    { id: 'mon_repaid', lane: 'mon', label: 'Погашена', kind: 'intermediate', tone: 'chip--dpurple', editable: null,
      note: 'После погашения в навигаторе соответствующий статус. На screenflow узел «Погашение», серый (промежуточный); на схеме «Статусы сделки» его нет.',
      questions: [8, 14] }
  ],

  transitions: [
    /* ---- Сделка ---- */
    { id: 'deal_delete', from: 'deal_draft', to: 'deal_deleted', trigger: 'manual', actor: null, via: 'menu', action: 'Удалить', modal: null, when: null,
      note: 'Подпись пункта меню — из задачи RE0013 (§4), на макетах её нет.', questions: [12] },
    { id: 'deal_submit', from: 'deal_draft', to: 'deal_awaiting', trigger: 'manual', actor: null, via: 'button', action: 'Передать на сопровождение', modal: null,
      when: 'нажат шаг «Согласование» степпера' },
    { id: 'deal_return_to_correction', from: 'deal_awaiting', to: 'deal_correction', trigger: 'auto', actor: null, via: null, action: null, modal: null,
      when: 'ЦУП или Operations вернули на корректировку', after: { any: ['tsup_to_correction', 'ops_to_correction'] },
      note: 'По требованиям; на схеме перехода нет.', questions: [2, 3, 23] },
    { id: 'deal_resubmit', from: 'deal_correction', to: 'deal_awaiting', trigger: 'manual', actor: null, via: 'button', action: 'Передать на сопровождение', modal: null,
      when: 'нажат шаг «Согласование» степпера',
      note: 'Допущение: та же кнопка, что у черновика; в требованиях — «вновь отправить на подтверждение».', questions: [2] },
    { id: 'deal_activate', from: 'deal_awaiting', to: 'deal_active', trigger: 'auto', actor: null, via: null, action: null, modal: null,
      when: 'ЦУП утвердил и Operations подтвердил', after: { any: ['tsup_approve', 'ops_confirm'] }, requires: ['tsup_approved', 'ops_on_support'] },
    { id: 'deal_repay', from: 'deal_active', to: 'deal_repaid', trigger: 'manual', actor: null, via: 'menu', action: 'Погасить', modal: 'NavigatorDealCloseModal',
      when: 'указана дата погашения', questions: [14] },
    { id: 'deal_unrepay', from: 'deal_repaid', to: 'deal_active', trigger: 'manual', actor: null, via: 'menu', action: 'Вернуть в действующие', modal: null, when: null,
      note: 'По пояснению «погашение обратимо»; на схеме перехода нет. Подпись пункта — из задачи RE0013 (§4).', questions: [1, 24] },
    { id: 'deal_start_changes', from: 'deal_active', to: 'deal_changes_input', trigger: 'manual', actor: null, via: 'menu', action: 'Ввести изменения', modal: 'NavigatorChangeReasonModal', when: null,
      note: 'Окно причины — пара фронтенда; на макетах окна нет.' },
    { id: 'deal_submit_changes', from: 'deal_changes_input', to: 'deal_changes_confirm', trigger: 'manual', actor: null, via: 'button', action: 'Передать на сопровождение', modal: null,
      when: 'нажат шаг «Согласование» степпера' },
    { id: 'deal_changes_to_correction', from: 'deal_changes_confirm', to: 'deal_changes_correction', trigger: 'auto', actor: null, via: null, action: null, modal: null,
      when: 'ЦУП или Operations вернули изменения на корректировку', after: { any: ['tsup_changes_to_correction', 'ops_changes_to_correction'] },
      note: 'По требованиям; на схеме перехода нет.', questions: [2] },
    { id: 'deal_resubmit_changes', from: 'deal_changes_correction', to: 'deal_changes_confirm', trigger: 'manual', actor: null, via: 'button', action: 'Передать на сопровождение', modal: null,
      when: 'нажат шаг «Согласование» степпера',
      note: 'Допущение: та же кнопка, что при вводе изменений.', questions: [2] },
    { id: 'deal_changes_accepted', from: 'deal_changes_confirm', to: 'deal_active', trigger: 'auto', actor: null, via: null, action: null, modal: null,
      when: 'ЦУП и Operations приняли изменения', after: { any: ['tsup_changes_approve', 'ops_changes_confirm'] }, requires: ['tsup_approved', 'ops_on_support'],
      note: 'Допущение: автоматический; на схеме линия к «Активной» сплошная (ручная).', questions: [10] },

    /* ---- ЦУП ---- */
    { id: 'tsup_await_responsible', from: 'tsup_draft', to: 'tsup_awaiting_responsible', trigger: 'auto', actor: null, via: null, action: null, modal: null,
      when: 'сделку передали на сопровождение', after: { any: ['deal_submit'] } },
    { id: 'tsup_appoint', from: 'tsup_awaiting_responsible', to: 'tsup_awaiting', trigger: 'manual', actor: 'ЦУП', via: 'button', action: 'Назначить ответственного', modal: 'NavigatorAppointmentOfResponsibleModal',
      when: 'выбран ответственный от ЦУП' },
    { id: 'tsup_approve', from: 'tsup_awaiting', to: 'tsup_approved', trigger: 'manual', actor: 'ЦУП', via: 'button', action: 'Утвердить', modal: null, when: null,
      questions: [15] },
    { id: 'tsup_to_correction', from: 'tsup_awaiting', to: 'tsup_correction', trigger: 'manual', actor: 'ЦУП', via: 'button', action: 'На корректировку', modal: null, when: null },
    { id: 'tsup_back_from_correction', from: 'tsup_correction', to: 'tsup_awaiting', trigger: 'auto', actor: null, via: null, action: null, modal: null,
      when: 'исправленную сделку снова передали на сопровождение', after: { any: ['deal_resubmit'] },
      note: 'Допущение: автоматический; на схеме стрелка сплошная, без подписи.', questions: [22] },
    { id: 'tsup_start_changes', from: 'tsup_approved', to: 'tsup_changes_input', trigger: 'auto', actor: null, via: null, action: null, modal: null,
      when: 'по сделке начат ввод изменений', after: { any: ['deal_start_changes'] } },
    { id: 'tsup_submit_changes', from: 'tsup_changes_input', to: 'tsup_changes_confirm', trigger: 'auto', actor: null, via: null, action: null, modal: null,
      when: 'изменения передали на сопровождение', after: { any: ['deal_submit_changes'] },
      note: 'Допущение: автоматический; на схеме линия без стрелки.', questions: [11] },
    { id: 'tsup_changes_approve', from: 'tsup_changes_confirm', to: 'tsup_approved', trigger: 'manual', actor: 'ЦУП', via: 'button', action: 'Утвердить', modal: null, when: null,
      note: 'Допущение: на схеме возврата в «Утверждена» нет, подпись — как в первом цикле.', questions: [10, 18] },
    { id: 'tsup_changes_to_correction', from: 'tsup_changes_confirm', to: 'tsup_changes_correction', trigger: 'manual', actor: 'ЦУП', via: 'button', action: 'На корректировку', modal: null, when: null,
      questions: [4, 18] },
    { id: 'tsup_changes_back', from: 'tsup_changes_correction', to: 'tsup_changes_confirm', trigger: 'auto', actor: null, via: null, action: null, modal: null,
      when: 'исправленные изменения снова передали на сопровождение', after: { any: ['deal_resubmit_changes'] },
      note: 'Допущение: автоматический; на схеме стрелка сплошная, без подписи.', questions: [4, 22] },
    { id: 'tsup_repay', from: 'tsup_approved', to: 'tsup_repaid', trigger: 'auto', actor: null, via: null, action: null, modal: null,
      when: 'сделку погасили', after: { any: ['deal_repay'] },
      note: 'По пояснению «все статусы так же будут погашены»; на схеме перехода нет.', questions: [14] },

    /* ---- Operations ---- */
    { id: 'ops_await', from: 'ops_draft', to: 'ops_awaiting', trigger: 'auto', actor: null, via: null, action: null, modal: null,
      when: 'сделку передали на сопровождение', after: { any: ['deal_submit'] } },
    { id: 'ops_confirm', from: 'ops_awaiting', to: 'ops_on_support', trigger: 'manual', actor: 'Operations', via: 'button', action: 'Подтвердить', modal: null, when: null,
      questions: [15] },
    { id: 'ops_to_correction', from: 'ops_awaiting', to: 'ops_correction', trigger: 'manual', actor: 'Operations', via: 'button', action: 'На корректировку', modal: null, when: null },
    { id: 'ops_back_from_correction', from: 'ops_correction', to: 'ops_awaiting', trigger: 'auto', actor: null, via: null, action: null, modal: null,
      when: 'исправленную сделку снова передали на сопровождение', after: { any: ['deal_resubmit'] },
      note: 'Допущение: автоматический; на схеме стрелка сплошная, без подписи.', questions: [22] },
    { id: 'ops_start_changes', from: 'ops_on_support', to: 'ops_changes_input', trigger: 'auto', actor: null, via: null, action: null, modal: null,
      when: 'по сделке начат ввод изменений', after: { any: ['deal_start_changes'] } },
    { id: 'ops_submit_changes', from: 'ops_changes_input', to: 'ops_changes_confirm', trigger: 'auto', actor: null, via: null, action: null, modal: null,
      when: 'изменения передали на сопровождение', after: { any: ['deal_submit_changes'] },
      note: 'Допущение: автоматический; на схеме линия сплошная (ручная), без подписи.', questions: [22] },
    { id: 'ops_changes_confirm', from: 'ops_changes_confirm', to: 'ops_on_support', trigger: 'manual', actor: 'Operations', via: 'button', action: 'Подтвердить', modal: null, when: null,
      note: 'Возврат в «На сопровождении» показывает степпер Operations; на схеме перехода нет.', questions: [10] },
    { id: 'ops_changes_to_correction', from: 'ops_changes_confirm', to: 'ops_changes_correction', trigger: 'manual', actor: 'Operations', via: 'button', action: 'На корректировку', modal: null, when: null,
      questions: [4] },
    { id: 'ops_changes_back', from: 'ops_changes_correction', to: 'ops_changes_confirm', trigger: 'auto', actor: null, via: null, action: null, modal: null,
      when: 'исправленные изменения снова передали на сопровождение', after: { any: ['deal_resubmit_changes'] },
      note: 'Допущение: автоматический; на схеме стрелка сплошная, без подписи.', questions: [4, 22] },
    { id: 'ops_repay', from: 'ops_on_support', to: 'ops_repaid', trigger: 'auto', actor: null, via: null, action: null, modal: null,
      when: 'сделку погасили', after: { any: ['deal_repay'] },
      note: 'По пояснению «все статусы так же будут погашены»; на схеме перехода нет.', questions: [14] },

    /* ---- Мониторинг ---- */
    { id: 'mon_approve', from: 'mon_on_approval', to: 'mon_approved', trigger: 'auto', actor: null, via: null, action: null, modal: null,
      when: 'ЦУП утвердил сделку', after: { any: ['tsup_approve'] }, questions: [5, 16] },
    { id: 'mon_to_sbi', from: 'mon_approved', to: 'mon_awaiting_transfer', trigger: 'manual', actor: 'ЦУП', via: 'button', action: 'На мониторинг (ГК СБИ)', modal: null, when: null },
    { id: 'mon_to_pao', from: 'mon_approved', to: 'mon_on_mon_pao', trigger: 'manual', actor: 'ЦУП', via: 'button', action: 'На мониторинг (ПАО Сбербанк)', modal: null, when: null,
      questions: [25] },
    { id: 'mon_awaiting_to_pao', from: 'mon_awaiting_transfer', to: 'mon_on_mon_pao', trigger: 'manual', actor: 'ЦУП', via: null, action: null, modal: null, when: null,
      note: 'Технический переход; подпись действия на макетах не показана.', questions: [25] },
    { id: 'mon_pao_to_sbi', from: 'mon_on_mon_pao', to: 'mon_awaiting_transfer', trigger: 'manual', actor: 'ЦУП', via: 'menu', action: 'На мониторинг (ГК СБИ)', modal: null, when: null,
      note: 'Технический переход; пункт кебаба — со screenflow.', questions: [25] },
    { id: 'mon_forward', from: 'mon_awaiting_transfer', to: 'mon_sent_to_transfer', trigger: 'manual', actor: 'ЦУП', via: 'button', action: 'Направить на передачу', modal: 'NavigatorForwardToTransferModal',
      when: 'документы готовы, указана дата передачи' },
    { id: 'mon_transfer', from: 'mon_sent_to_transfer', to: 'mon_transferred', trigger: null, actor: null, via: null, action: null, modal: null, when: null,
      note: 'Как сделка попадает в «Передана», макеты не показывают.', questions: [6, 19] },
    { id: 'mon_rm_accept', from: 'mon_transferred', to: 'mon_transferred', trigger: 'manual', actor: 'ЦУП', via: 'button', action: 'РМ принял', modal: 'NavigatorApprovalModal', when: null,
      note: 'Отметка внутри статуса: согласующий и дата согласования.', questions: [9] },
    { id: 'mon_pm_accept', from: 'mon_transferred', to: 'mon_transferred', trigger: 'manual', actor: 'ЦУП', via: 'button', action: 'ПМ принял', modal: 'NavigatorApprovalModal', when: null,
      note: 'Отметка внутри статуса: согласующий и дата согласования.', questions: [9] },
    { id: 'mon_pmz_accept', from: 'mon_transferred', to: 'mon_transferred', trigger: 'manual', actor: 'ЦУП', via: 'button', action: 'ПМЗ принял', modal: 'NavigatorApprovalModal', when: null,
      note: 'Отметка внутри статуса: сначала Switch «С обеспечением», затем согласующий и дата.', questions: [9] },
    { id: 'mon_on_monitoring', from: 'mon_transferred', to: 'mon_on_mon_sbi', trigger: 'auto', actor: null, via: null, action: null, modal: null,
      when: 'РМ, ПМ и ПМЗ приняли', after: { all: ['mon_rm_accept', 'mon_pm_accept', 'mon_pmz_accept'] },
      note: 'Допущение: ПМ, РМ и ПМЗ — отметки внутри статуса, а не статусы.', questions: [9] },
    { id: 'mon_start_changes', from: 'mon_on_mon_sbi', to: 'mon_changes_awaiting', trigger: 'manual', actor: 'ЦУП', via: 'menu', action: 'Передать изменения на мониторинг', modal: null, when: null,
      questions: [7, 28] },
    { id: 'mon_changes_forward', from: 'mon_changes_awaiting', to: 'mon_changes_sent', trigger: 'manual', actor: 'ЦУП', via: 'button', action: 'Направить на передачу', modal: 'NavigatorForwardToTransferModal',
      when: 'указана дата передачи', questions: [7] },
    { id: 'mon_changes_transfer', from: 'mon_changes_sent', to: 'mon_changes_transfer', trigger: null, actor: null, via: null, action: null, modal: null, when: null,
      note: 'Как сделка попадает в «Передача изменений», макеты не показывают.', questions: [7, 19] },
    { id: 'mon_changes_rm_accept', from: 'mon_changes_transfer', to: 'mon_changes_transfer', trigger: 'manual', actor: 'ЦУП', via: 'button', action: 'РМ принял', modal: 'NavigatorApprovalModal', when: null,
      questions: [9] },
    { id: 'mon_changes_pm_accept', from: 'mon_changes_transfer', to: 'mon_changes_transfer', trigger: 'manual', actor: 'ЦУП', via: 'button', action: 'ПМ принял', modal: 'NavigatorApprovalModal', when: null,
      questions: [9] },
    { id: 'mon_changes_pmz_accept', from: 'mon_changes_transfer', to: 'mon_changes_transfer', trigger: 'manual', actor: 'ЦУП', via: 'button', action: 'ПМЗ принял', modal: 'NavigatorApprovalModal', when: null,
      questions: [9] },
    { id: 'mon_changes_done', from: 'mon_changes_transfer', to: 'mon_on_mon_sbi', trigger: 'auto', actor: null, via: null, action: null, modal: null,
      when: 'РМ, ПМ и ПМЗ приняли изменения', after: { all: ['mon_changes_rm_accept', 'mon_changes_pm_accept', 'mon_changes_pmz_accept'] },
      questions: [7, 9] },
    { id: 'mon_repay_sbi', from: 'mon_on_mon_sbi', to: 'mon_repaid', trigger: 'auto', actor: null, via: null, action: null, modal: null,
      when: 'сделку погасили', after: { any: ['deal_repay'] },
      note: 'Допущение: автоматический; на screenflow линия к «Погашению» идёт от «Передачи изменений на мониторинг», на схеме «Статусы сделки» узла нет.', questions: [14] },
    { id: 'mon_repay_pao', from: 'mon_on_mon_pao', to: 'mon_repaid', trigger: 'auto', actor: null, via: null, action: null, modal: null,
      when: 'сделку погасили', after: { any: ['deal_repay'] },
      note: 'По пояснению «все статусы так же будут погашены»; на схеме перехода нет.', questions: [14] }
  ],

  steppers: [
    { lane: 'deal', variant: 'Заполнение сделки', mode: 'checklist',
      shownIn: ['deal_draft', 'deal_awaiting', 'deal_correction', 'deal_active', 'deal_repaid', 'deal_changes_input', 'deal_changes_confirm', 'deal_changes_correction'],
      steps: [
        { label: 'Общая информация' },
        { label: 'Продукты ДИД' },
        { label: 'Финансовые инструменты' },
        { label: 'Расчёт метрик' },
        { label: 'Согласование' }
      ],
      extraButtons: [
        { label: 'Список изменений', shownIn: ['deal_changes_input', 'deal_changes_confirm'], note: 'Куда ведёт — не решено.' }
      ],
      note: 'Отметка шага — заполненность раздела; у «Продуктов ДИД» счётчик «1 из 1». Шаг «Согласование» нажимается и включает «Передать на сопровождение».',
      questions: [26] },
    { lane: 'tsup', variant: 'Первый цикл', mode: 'statuses',
      shownIn: ['tsup_draft', 'tsup_awaiting_responsible', 'tsup_awaiting', 'tsup_correction', 'tsup_approved'],
      steps: [
        { label: 'Черновик', status: 'tsup_draft' },
        { label: 'Ожидает назначения ответственного', status: 'tsup_awaiting_responsible' },
        { label: 'Ожидает подтверждения', status: 'tsup_awaiting' },
        { label: 'Утверждена', status: 'tsup_approved' }
      ] },
    { lane: 'tsup', variant: 'Цикл изменений', mode: 'statuses',
      shownIn: ['tsup_changes_input', 'tsup_changes_confirm', 'tsup_changes_correction'],
      steps: [],
      note: 'На screenflow у ЦУП в цикле изменений показан тайл вкладки Operations.',
      questions: [18] },
    { lane: 'ops', variant: 'Первый цикл', mode: 'statuses',
      shownIn: ['ops_draft', 'ops_awaiting', 'ops_correction', 'ops_on_support'],
      steps: [
        { label: 'Черновик', status: 'ops_draft' },
        { label: 'Ожидает подтверждения', status: 'ops_awaiting' },
        { label: 'На сопровождении', status: 'ops_on_support' }
      ] },
    { lane: 'ops', variant: 'Цикл изменений', mode: 'statuses',
      shownIn: ['ops_changes_input', 'ops_changes_confirm', 'ops_changes_correction'],
      steps: [
        { label: 'На сопровождении', status: 'ops_on_support' },
        { label: 'Ввод изменений', status: 'ops_changes_input' },
        { label: 'Подтверждение изменений', status: 'ops_changes_confirm' },
        { label: 'На сопровождении', status: 'ops_on_support' }
      ] },
    { lane: 'mon', variant: 'Мониторинг ГК СБИ', mode: 'statuses',
      shownIn: ['mon_on_approval', 'mon_approved', 'mon_awaiting_transfer', 'mon_sent_to_transfer', 'mon_transferred', 'mon_on_mon_sbi'],
      steps: [
        { label: 'Утверждена', status: 'mon_approved' },
        { label: 'Ожидает передачи на мониторинг', status: 'mon_awaiting_transfer' },
        { label: 'Направлена на передачу', status: 'mon_sent_to_transfer' },
        { label: 'Передача', status: 'mon_transferred', group: { title: 'Передача', items: ['РМ', 'ПМ', 'Залоги'] } },
        { label: 'На мониторинге (ГК СБИ)', status: 'mon_on_mon_sbi' }
      ],
      note: 'Порядок в рамке «Передача» — РМ · ПМ · Залоги; на схеме — ПМ · РМ · ПМЗ.',
      questions: [9, 21] },
    { lane: 'mon', variant: 'Мониторинг ПАО Сбербанк', mode: 'statuses',
      shownIn: ['mon_on_mon_pao'],
      steps: [
        { label: 'Утверждена', status: 'mon_approved' },
        { label: 'На мониторинге (ПАО Сбербанк)', status: 'mon_on_mon_pao' }
      ],
      questions: [21] },
    { lane: 'mon', variant: 'Передача изменений', mode: 'statuses',
      shownIn: ['mon_changes_awaiting', 'mon_changes_sent', 'mon_changes_transfer'],
      steps: [
        { label: 'Изменения ожидают передачи на мониторинг', status: 'mon_changes_awaiting' },
        { label: 'Изменения направлены на передачу', status: 'mon_changes_sent' },
        { label: 'Передача изменений', status: 'mon_changes_transfer', group: { title: 'Передача изменений', items: ['РМ', 'ПМ', 'Залоги'] } },
        { label: 'На мониторинге (ГК СБИ)', status: 'mon_on_mon_sbi' }
      ],
      questions: [20, 21] },
    { lane: 'mon', variant: 'Погашена', mode: 'statuses',
      shownIn: ['mon_repaid'],
      steps: [
        { label: 'На мониторинге (ПАО Сбербанк)', status: 'mon_on_mon_pao' },
        { label: 'Погашена', status: 'mon_repaid' }
      ],
      note: 'На screenflow — путь через ПАО; путь через ГК СБИ кончается тем же шагом «Погашена».',
      questions: [21] }
  ],

  openQuestions: [
    { n: 1, about: ['deal_repaid', 'deal_unrepay'], since: '09.10.2026',
      text: '«Погашена» — терминальный статус, но в пояснении: «погашение обратимо, можно вновь перевести сделку в действующую».' },
    { n: 2, about: ['deal_correction', 'deal_changes_correction'], since: '09.10.2026',
      text: 'На дорожке «Сделка» нет «Корректировки» и «Корректировки изменений», а в требованиях и данных они есть. Из каких действий они возникают и как сделка из них выходит — на схеме не показано.' },
    { n: 3, about: ['tsup_correction', 'ops_correction', 'deal_correction'], since: '09.10.2026',
      text: 'В пояснении к первому циклу ЦУП и Operations: «сделка попадёт в статус „Корректировка изменений“». В схеме и требованиях здесь «Корректировка».' },
    { n: 4, about: ['tsup_changes_correction', 'ops_changes_correction'], since: '09.10.2026',
      text: 'В цикле изменений узел называется «Корректировка», в требованиях и данных — «Корректировка изменений».' },
    { n: 5, about: ['mon_on_approval', 'mon_approved'], since: '09.10.2026',
      text: 'Первый статус мониторинга: в схеме и screenflow — «Утверждена» (после утверждения ЦУП), в требованиях и в DealsStore.create — «На утверждении». В требованиях есть оба.' },
    { n: 6, about: ['mon_transferred'], since: '09.10.2026',
      text: '«Передача» в схеме против «Передана» в требованиях и данных. В степпере «Передача» — заголовок рамки РМ · ПМ · Залоги, а не шаг.' },
    { n: 7, about: ['mon_changes_awaiting', 'mon_changes_sent', 'mon_changes_transfer', 'mon_start_changes'], since: '09.10.2026',
      text: 'Цикл изменений мониторинга: в схеме один узел «Передача изменений на мониторинг», в требованиях три статуса. Старт — пункт кебаба «Передать изменения на мониторинг» (screenflow), связь с «Вводом изменений» сделки не показана.' },
    { n: 8, about: ['mon_repaid', 'mon_on_mon_sbi', 'mon_on_mon_pao'], since: '09.10.2026',
      text: '«Погашение» (узел мониторинга) против «Погашена». «На мониторинге (ПАО)» против «На мониторинге ПАО Сбербанк» в данных и «(ПАО Сбербанк)» в степпере; то же у ГК СБИ — скобки в степпере, без скобок в данных.' },
    { n: 9, about: ['mon_rm_accept', 'mon_pm_accept', 'mon_pmz_accept', 'mon_on_monitoring'], since: '09.10.2026',
      text: 'ПМ, РМ и ПМЗ нарисованы как статусы, а по смыслу это три параллельных подтверждения. Порядок в степпере — «РМ · ПМ · Залоги», в схеме — «ПМ · РМ · ПМЗ». В модели — отметки внутри статуса (допущение).' },
    { n: 10, about: ['deal_changes_accepted', 'tsup_changes_approve', 'ops_changes_confirm'], since: '09.10.2026',
      text: 'После «Подтверждения изменений» нет возврата ЦУП в «Утверждена» и Operations в «На сопровождении», хотя степпер Operations его показывает. Линия к «Активной» сплошная (ручная), хотя переход по смыслу автоматический.' },
    { n: 11, about: ['tsup_submit_changes', 'tsup_changes_confirm'], since: '09.10.2026',
      text: 'ЦУП «Ввод изменений» → «Подтверждение изменений» — линия без стрелки.' },
    { n: 12, about: ['deal_deleted', 'deal_delete'], since: '09.10.2026',
      text: 'Статуса «Удалена» нет в требованиях, данных и словаре тонов. Тон чипа и подпись пункта меню не заданы.' },
    { n: 13, about: ['deal_active', 'mon_on_mon_sbi', 'mon_on_mon_pao'], since: '09.10.2026',
      text: 'Легенда: «Активная» помечена конечным статусом, хотя из неё есть выходы (изменения, погашение). Разница между терминальным, конечным и целевым статусом не определена.' },
    { n: 14, about: ['deal_repay', 'tsup_repaid', 'ops_repaid', 'mon_repaid'], since: '09.10.2026',
      text: '«Погашена» для ЦУП, Operations и мониторинга («все статусы так же будут погашены») на схеме не нарисована. Из каких статусов, кроме «Активной», можно погасить сделку — не сказано.' },
    { n: 15, about: ['tsup_approve', 'ops_confirm', 'deal_submit'], since: '09.10.2026',
      text: 'Подписи действий: у ЦУП «Утвердить», у Operations «Подтвердить». Кнопка «Передать на сопровождение» стоит при шаге «Согласование».' },
    { n: 16, about: ['mon_approve', 'mon_approved'], since: '09.10.2026',
      text: 'Пунктир к «Утверждена» мониторинга проходит через колонку Operations. По пояснению переход запускает утверждение ЦУП, по линии — неоднозначно.' },
    { n: 17, about: ['mon_sent_to_transfer'], since: '09.10.2026',
      text: 'Узел схемы «Направлено на передачу», в степпере, требованиях и данных — «Направлена на передачу».' },
    { n: 18, about: ['tsup_changes_confirm', 'tsup_changes_to_correction', 'tsup_changes_approve'], since: '09.10.2026',
      text: 'В цикле изменений у ЦУП screenflow показывает тайл вкладки Operations (степпер «На сопровождении…», кнопка «Подтвердить»). Степпер и кнопки ЦУП в цикле изменений не показаны.' },
    { n: 19, about: ['mon_transfer', 'mon_changes_transfer', 'mon_sent_to_transfer'], since: '09.10.2026',
      text: 'Как сделка переходит из «Направлена на передачу» в «Передана» (и из «Изменения направлены на передачу» в «Передача изменений») — действие не показано: на схеме сплошная стрелка без подписи, кнопки «РМ/ПМ/ПМЗ принял» видны уже в «Передаче».' },
    { n: 20, about: ['mon_changes_transfer'], since: '09.10.2026',
      text: 'Степпер цикла изменений на двух тайлах screenflow разный: рамка подписана «Передача изменений» или «На мониторинге (ГК СБИ)», между шагами то есть «На мониторинге (ГК СБИ)», то нет.' },
    { n: 21, about: ['mon_on_mon_pao', 'mon_repaid'], since: '09.10.2026',
      text: 'Степпер мониторинга — история пройденного или план пути? На тайлах есть размытые шаги (в т. ч. «Погашена» до «На мониторинге»), путь ПАО показан по-разному на трёх тайлах.' },
    { n: 22, about: ['tsup_back_from_correction', 'ops_back_from_correction', 'tsup_changes_back', 'ops_changes_back', 'ops_submit_changes'], since: '09.10.2026',
      text: 'Возврат из «Корректировки» в «Ожидает подтверждения» у ЦУП и Operations нарисован сплошной (ручной) стрелкой без подписи, а по требованиям сделку снова отправляет сотрудник, исправивший данные (дорожка «Сделка»). В модели — автопереход (допущение).' },
    { n: 23, about: ['tsup_correction', 'ops_correction', 'deal_return_to_correction'], since: '09.10.2026',
      text: 'Когда на корректировку возвращает одна команда, меняется ли статус второй? В демо-данных у таких сделок все три статуса — «Корректировка».' },
    { n: 24, about: ['deal_unrepay'], since: '09.10.2026',
      text: '«Вернуть в действующие»: в какие статусы возвращаются ЦУП, Operations и мониторинг и нужно ли окно подтверждения.' },
    { n: 25, about: ['mon_to_pao', 'mon_awaiting_to_pao', 'mon_pao_to_sbi'], since: '09.10.2026',
      text: 'ПАО Сбербанк: по схеме — из «Утверждена», по требованиям — из «Ожидает передачи на мониторинг». Технический переход ПАО ↔ «Ожидает передачи»: подпись действия из «Ожидает передачи» в ПАО не показана.' },
    { n: 26, about: ['deal_changes_input', 'deal_changes_confirm'], since: '09.10.2026',
      text: 'Куда ведёт кнопка «Список изменений» (у фронтенда есть страница ChangesList и виджет DetailedChanges).' },
    { n: 27, about: ['tsup_appoint', 'tsup_approve', 'ops_confirm', 'mon_forward'], since: '09.10.2026',
      text: 'Кто из ролей видит какие кнопки (ЦУП, Operations, ЦУП за ПМ/РМ/ПМЗ); у переходов дорожки «Сделка» роль не указана. В прототипе все кнопки видны одной роли (допущение).' },
    { n: 28, about: ['mon_start_changes', 'mon_on_mon_pao'], since: '09.10.2026',
      text: 'Пункт кебаба «Передать изменения на мониторинг» на screenflow показан у сделки на мониторинге ПАО, а цикл изменений кончается «На мониторинге (ГК СБИ)». Есть ли цикл изменений у ПАО.' }
  ]
};
