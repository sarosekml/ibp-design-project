/* Представления одного адаптера: доска, реестр, карточка и проводник.
   Геометрия компонентов — ДС; B1–B4 согласованы 12.10.2026. */
(function () {
  'use strict';
  var store = window.LEADS, stages = window.LEAD_STAGES, nav = window.IBPR_NAV;
  var page, currentId, previewId, tab = 'picks', view = 'board', listMode = 'list';
  var collapsedColumns = new Set(['PIPELINE', 'DECLINED']);
  var collapsedHoldings = new Set();
  var filters = {}, basisFilter = '', pageNumber = 1, pageSize = 20, selected = new Set(), formState, transferLeadId;
  var grid = '8px 40px 140px 240px 240px 280px 160px 240px 320px 180px 240px 120px 160px 8px';
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
  function el(id) { return document.getElementById(id); }
  function put(id, html) { var node = el(id); if (node) node.innerHTML = html; }
  function money(v) { return v == null ? '—' : Number(v).toLocaleString('ru-RU', { maximumFractionDigits: 2 }); }
  function date(v) { return v ? String(v).slice(0, 10).split('-').reverse().join('.') : '—'; }
  function days(l) { return Math.max(0, Math.floor((Date.parse('2026-10-12') - Date.parse(l.stageEnteredAt)) / 86400000)); }
  function chip(text, tone) { return '<span class="chip chip--rounded chip--s chip--' + (tone || 'grey') + '"><span class="chip__label">' + esc(text) + '</span></span>'; }
  // Основание — категория, а не статус: квадратный Chip с цветами через слоты ДС.
  function basisChip(type) {
    var b = stages.basis[type], c = b.colors;
    return '<span class="chip chip--s chip--fit" data-lead-basis-chip="' + type + '" style="--chip-fill:var(' + c[0] + ');--chip-border:var(' + c[0] + ');--chip-text:var(' + c[1] + ');--chip-icon-color:var(' + c[2] + ')"><span class="chip__label">' + esc(b.title) + '</span></span>';
  }
  function btn(text, action, id, tone, small) { return '<button type="button" class="btn btn--' + (tone || 'outline') + ' btn--' + (small ? 's' : 'm') + '" data-lead-action="' + action + '"' + (id ? ' data-lead-id="' + esc(id) + '"' : '') + (action==='reasons'?' data-popover="lead-reasons" data-reasons-for="'+esc(id)+'"':'') + '><span class="btn__label">' + esc(text) + '</span></button>'; }
  function link(text, url) { return '<a class="link" href="' + esc(url) + '">' + esc(text) + '</a>'; }
  function rof(label, value, full) { return '<div class="rof' + (full ? ' tile__grid-full' : '') + '"><span class="ds-label"><span class="ds-label__text">' + esc(label) + '</span></span><div class="rof__row"><span class="rof__value">' + value + '</span></div></div>'; }
  function fields(items, cols) { return '<div class="tile__grid" style="grid-template-columns:repeat(' + (cols || 2) + ',minmax(0,1fr))">' + items.join('') + '</div>'; }
  function empty(title, text) { return '<div class="es es--m" role="status"><span class="illu es__illu" data-illu="empty-folder" aria-hidden="true"></span><div class="es__body"><p class="es__title">' + esc(title) + '</p><p class="es__text">' + esc(text) + '</p></div></div>'; }
  function checkbox(name, title, checked, attrs) { return '<label class="cb' + (!title ? ' cb--no-content' : '') + '"><input type="checkbox" class="cb__input" name="' + esc(name) + '"' + (checked ? ' checked' : '') + ' ' + (attrs || '') + '><span class="cb__box"><span class="cb__mark"><i data-icon="check"></i></span></span>' + (title ? '<span class="cb__content"><span class="cb__label">' + esc(title) + '</span></span>' : '') + '</label>'; }
  function input(name, label, value, type) { return '<div class="inp inp--m' + (type === 'textarea' ? ' inp--multiline' : '') + '"><label class="ds-label" for="' + name + '"><span class="ds-label__text">' + esc(label) + '</span></label><div class="inp__field">' + (type === 'textarea' ? '<textarea class="inp__control" id="' + name + '" name="' + name + '" rows="3">' + esc(value) + '</textarea>' : '<input class="inp__control" id="' + name + '" name="' + name + '" type="' + (type || 'text') + '" value="' + esc(value) + '"' + (type === 'number' ? ' min="0" step="any"' : '') + '>') + '</div></div>'; }
  function select(name, label, values, value) {
    var choices = values.map(function (x) { return typeof x === 'string' ? { value: x, label: x } : x; });
    var picked = choices.find(function (x) { return String(x.value) === String(value); });
    return '<div class="inp inp--m" data-lead-select="' + name + '"><label class="ds-label" for="' + name + '"><span class="ds-label__text">' + esc(label) + '</span></label><div class="inp__field" role="combobox" aria-expanded="false" aria-controls="' + name + '-list"><input class="inp__control" name="' + name + '" id="' + name + '" value="' + esc(picked ? picked.label : value || '') + '" data-value="' + esc(value || '') + '" placeholder="Выберите или найдите"><span class="inp__acts"><button type="button" class="inp__act inp__act--chev" aria-label="Показать список"><i data-icon="chevron-down"></i></button></span></div><div class="ddl ddl--floating ddl--scroll" id="' + name + '-list" role="listbox" hidden data-lead-list><div>' + choices.map(function (x) { return '<button type="button" class="ddl__item" role="option" aria-selected="' + (String(x.value) === String(value)) + '" data-value="' + esc(x.value) + '"><span class="ddl__item-body"><span class="ddl__item-label">' + esc(x.label) + '</span></span></button>'; }).join('') + '</div></div></div>';
  }
  function bind(scope) {
    scope = scope || document;
    if (window.dsIcons) window.dsIcons.apply(scope);
    if (window.DSInput) window.DSInput.bindAll(scope);
    if (window.DSModal) window.DSModal.bindAll(scope);
    if (window.DSPopover) window.DSPopover.bindAll(scope);
    if (window.DSDrawer) window.DSDrawer.bindAll(scope);
    if (window.DSMenu) window.DSMenu.bindAll(scope);
    if (window.DSTableSettings) window.DSTableSettings.bindAll(scope);
    if (window.DSTabs) scope.querySelectorAll('[data-lead-segment]').forEach(function (root) {
      window.DSTabs.segment(root, { onChange: function (i, b) {
        var kind = root.dataset.leadSegment;
        if (kind === 'view') { if (view === b.dataset.leadView) return; view = b.dataset.leadView; }
        if (kind === 'basis') { if (basisFilter === b.dataset.basis) return; basisFilter = b.dataset.basis; pageNumber = 1; selected.clear(); }
        if (kind === 'group') { if (listMode === b.dataset.leadGroup) return; listMode = b.dataset.leadGroup; pageNumber = 1; selected.clear(); }
        render();
      } });
      window.DSTabs.positionThumb(root);
    });
    scope.querySelectorAll('[data-lead-select]').forEach(function (root) {
      if (root.dataset.leadBound) return;
      var field = root.querySelector('.inp__field'), control = root.querySelector('input'), list = root.querySelector('.ddl');
      if (!window.DSDropdownList || !list) return;
      window.DSDropdownList.bind(field, { list: list, onSelect: function (item) {
        control.value = item.querySelector('.ddl__item-label').textContent;
        control.dataset.value = item.dataset.value;
        if (window.DSInput) window.DSInput.sync(root);
      } });
      control.addEventListener('input', function () { control.dataset.value = ''; });
      root.addEventListener('ds-input:clear', function () { control.dataset.value = ''; });
      root.dataset.leadBound = 'yes';
    });
    if (window.DSTable) { window.DSTable.bindAll(scope); window.DSTable.wireAll(scope); }
  }
  function notify(title, snapshot) {
    if (!window.DSSnack) return;
    var after = snapshot ? JSON.stringify(store.snapshot()) : '';
    window.DSSnack.show({ tone: 'success', title: title, dedup:!snapshot, buttons: snapshot ? [{ label: 'Отменить', onClick: function () { if(JSON.stringify(store.snapshot())!==after){error('После этого действия данные уже изменились');return;}store.restore(snapshot); } }] : null });
  }
  function error(message) { if (window.DSSnack) window.DSSnack.show({ tone: 'warning', title: message }); }
  function basisHtml(l) { return l.basis.map(function (b) { return basisChip(b.type); }).join(' '); }
  function renderBasisPicker() {
    var root = el('lead-basis-filter'); if (!root) return;
    // Не заменяем сегменты при выборе: сохраняются фокус и клавиатурная навигация.
    if (!root.querySelector('.segctrl__item')) root.innerHTML = '<div class="segctrl__thumb"></div>' + [''].concat(Object.keys(stages.basis)).map(function (code) {
      return '<button type="button" class="segctrl__item" role="radio" data-basis="' + code + '"><span class="segctrl__label">' + esc(code ? stages.basis[code].title : 'Все основания') + '</span>' + (code ? '<span class="badge badge--text badge--s" data-basis-count="' + code + '"></span>' : '') + '</button>';
    }).join('');
    root.querySelectorAll('[data-basis]').forEach(function (b) { var active = b.dataset.basis === basisFilter; b.setAttribute('aria-checked', String(active)); b.tabIndex = active ? 0 : -1; });
    root.querySelectorAll('[data-basis-count]').forEach(function (b) { b.textContent = store.all().filter(function (l) { return l.basis.some(function (x) { return x.type === b.dataset.basisCount; }); }).length; });
  }
  function owner(l) { var p = window.IBPR.employee(l.owner); return p ? p.fullName : l.owner; }
  function leadHref(id) { return nav.href('lead', { id: id, mode: 'after' }); }
  function values(l) { return [l.id,l.clientName,l.basis.map(function (b) { return stages.basis[b.type].title + ' ' + b.sourceId; }).join('; '),l.idea,money(l.amountMln),stages.get(l.stage).title,l.reasons.join('; '),l.client.quarterPlan || '—',owner(l),date(l.createdAt),date(l.lastActivityAt)]; }
  function filtered() {
    var rows = store.all().filter(function (l) {
      if (page === 'HomeBoard') return l.picked || l.stage !== 'REVIEW' && l.stage !== 'NOT_TAKEN' && l.owner === '04127';
      if (tab === 'picks') return l.picked && l.stage === 'REVIEW';
      if (tab === 'work') return !stages.get(l.stage).final && l.stage !== 'REVIEW' && l.owner === '04127';
      if (tab === 'archive') return stages.get(l.stage).final;
      return true;
    });
    rows = rows.filter(function (l) {
      if (basisFilter && !l.basis.some(function (b) { return b.type === basisFilter; })) return false;
      return Object.keys(filters).every(function (key) {
        var v = filters[key]; if (!v) return true;
        if (key === 'plan') return l.client.inQuarterPlan;
        if (key === 'min') return l.amountMln >= Number(v);
        if (key === 'max') return l.amountMln <= Number(v);
        if (key === 'created') return String(l.createdAt).slice(0,10) >= v;
        if (key === 'stale') return days(l) > 14 && !stages.get(l.stage).final;
        var text = { client: l.clientName, holding: l.holdingName, product: l.products.join(', '), stage: l.stage, owner: l.owner, industry: l.client.industry, bank: l.client.terBank }[key];
        return String(text || '').toLowerCase().includes(String(v).toLowerCase());
      });
    });
    if (page === 'LeadsNew' && listMode === 'holdings') rows.sort(function (a,b) { return a.holdingName.localeCompare(b.holdingName, 'ru') || a.clientName.localeCompare(b.clientName, 'ru'); });
    return rows;
  }
  function card(l, picked) {
    var s = stages.get(l.stage), basis = l.basis[0];
    var actions = picked ? btn('Беру','take',l.id,'accent',true) + btn('Не беру','not-taken',l.id,null,true) + '<button type="button" class="btn btn--transparent btn--s" data-popover="lead-reasons" data-reasons-for="' + esc(l.id) + '"><span class="btn__label">Почему?</span></button>' : '<button type="button" class="ibtn ibtn--neutral ibtn--s" aria-label="Действия с лидом" data-menu="lead-card-menu" data-menu-lead="' + esc(l.id) + '"><i data-icon="more-dots"></i></button>';
    if (picked) return '<article class="tile tile--card" data-lead-id="'+esc(l.id)+'"><header class="tile__header"><div class="tile__header-main"><div class="tile__title-row"><h3 class="tile__title">'+esc(l.clientName)+'</h3></div><div class="tile__chiplist">'+basisChip(basis.type)+'</div></div></header><div class="tile__body"><div class="lead-toolbar__group"><span class="ds-body-s">'+money(l.amountMln)+' млн RUB</span>'+link(l.id,leadHref(l.id))+'</div><div class="lead-pick-footer">'+actions+'</div></div></article>';
    return '<article class="tile tile--card' + (picked ? '' : ' kbcard') + '" tabindex="0" data-lead-id="' + esc(l.id) + '"' + (picked ? '' : ' data-kb-card="' + esc(l.id) + '"') + '><header class="tile__header"><div class="tile__header-main"><div class="tile__title-row"><h3 class="tile__title">' + esc(l.clientName) + '</h3></div><div class="tile__chiplist">' + basisChip(basis.type) + (l.client.keyClient ? chip('Ключевой клиент','orange') : '') + '</div></div>' + (!picked ? '<div class="tile__actions">' + actions + '</div>' : '') + '</header><div class="tile__body"><div class="kbcard__fields">' + [['Продукт',l.products.join(', ') || l.idea],['Объём, млн RUB',money(l.amountMln)],['Следующий шаг',l.nextStep.title],['Срок',date(l.nextStep.dueDate)]].map(function (x) { return '<div class="kbcard__field"><span class="kbcard__flabel">' + esc(x[0]) + '</span><span class="kbcard__fvalue" title="' + esc(x[1]) + '">' + esc(x[1]) + '</span></div>'; }).join('') + '</div><div class="kbcard__meta"><span class="kbcard__stat">' + days(l) + ' дн. на стадии' + (days(l)>14 ? ' · Без движения' : '') + '</span><span class="kbcard__stat">Встречи: ' + l.meetings.length + '</span></div><div class="kbcard__foot"><span class="kbcard__id">' + link(l.id,leadHref(l.id)) + '</span><span class="av av--circular av--s" title="' + esc(owner(l)) + '"><span class="av__text">' + esc((window.IBPR.employee(l.owner) || {}).initials || 'КА') + '</span></span></div>' + (picked ? '<div class="lead-pick-footer">' + actions + '</div>' : '') + (l.opportunityId ? link('Сделка ' + l.opportunityId,nav.href('opportunity',{id:l.opportunityId,source:'pipeline',mode:'after'})) : '') + '</div></article>';
  }
  function renderTable(rows) {
    var oldTable = el('lead-table');
    oldTable.querySelectorAll('[data-lead-holding]').forEach(function (r) {
      if (r.querySelector('[aria-expanded]').getAttribute('aria-expanded') === 'false') collapsedHoldings.add(r.dataset.node);
      else collapsedHoldings.delete(r.dataset.node);
    });
    var headers = ['ID','Клиент','Основание','Идея / продукт','Объём, млн RUB','Стадия','Почему рекомендован','Приоритет на квартал РД','Ответственный','Появился','Последняя активность'];
    var countPages = Math.max(1,Math.ceil(rows.length/pageSize)); pageNumber = Math.min(pageNumber,countPages);
    var slice = rows.slice((pageNumber-1)*pageSize,pageNumber*pageSize);
    var html = '<div class="tbl__row tbl__row--head" style="grid-template-columns:' + grid + '"><div class="th th--separator"></div><div class="th th--select">' + checkbox('all','',false,'data-lead-select-all aria-label="Выбрать страницу"') + '</div>' + headers.map(function (h,i) {
      return window.IBPR_TABLE.headCell({ key:'c' + i,label:h,align:i === 4 ? 'right' : 'left',sortType:i === 4 ? 'number' : i > 8 ? 'date' : 'text' },false);
    }).join('') + '<div class="th th--separator"></div></div>';
    if (page === 'LeadsNew' && listMode === 'holdings') {
      var groups = new Map();
      slice.forEach(function (l) { if (!groups.has(l.holdingName)) groups.set(l.holdingName,[]); groups.get(l.holdingName).push(l); });
      groups.forEach(function (leads, name) {
        var key = 'lead-holding-' + encodeURIComponent(name), closed = collapsedHoldings.has(key);
        var volume = leads.reduce(function (sum,l) { return sum + (Number(l.amountMln) || 0); },0);
        html += '<div class="tbl__row" data-lead-holding data-node="' + key + '" data-holding-name="' + esc(name) + '" data-holding-count="' + leads.length + '" data-holding-volume="' + volume + '" style="grid-template-columns:' + grid + '"><div class="tc tc--separator"></div><div class="tc tc--select"></div>' + headers.map(function (h,i) {
          var value = i === 1 ? name : i === 4 ? volume : '';
          return '<div class="tc' + (i === 1 ? ' tc--tree' : i === 4 ? ' tc--numbers' : '') + '" data-col="c' + i + '" data-sort-value="' + esc(value) + '">' + (i === 1 ? '<button type="button" class="tc__twisty" aria-expanded="' + !closed + '" aria-label="' + (closed ? 'Развернуть' : 'Свернуть') + '"><i data-icon="chevron-right"></i></button>' : '') + '<span class="tc__row"><span class="tc__text tc__text--truncate">' + esc(i === 4 ? money(value) : value) + '</span>' + (i === 1 ? '<span class="badge badge--text badge--s">' + leads.length + '</span>' : '') + '</span></div>';
        }).join('') + '<div class="tc tc--separator"></div></div>';
        html += leads.map(function (l) { return tableRow(l,key,closed); }).join('');
      });
    } else html += slice.map(function (l) { return tableRow(l); }).join('');
    // Новый корень позволяет TableSettings работать с актуальными заголовками.
    // Вид таблицы восстанавливает штатный рантайм ДС по data-table-persist.
    var table = oldTable.cloneNode(false); table.innerHTML = html; oldTable.replaceWith(table);
    put('lead-table-count',String(rows.length));
    if (window.DSTable) window.DSTable.wire(table).rowsChanged();
    if (window.DSTableSettings) window.DSTableSettings.restore(table);
    layoutHoldingRows(table);
    el('lead-table-empty').hidden = rows.length > 0;
    put('lead-table-empty',empty('Лиды не найдены','Измените фильтр или выберите другую вкладку.'));
    if (window.DSPagination) {
      var holder = el('lead-pagination'); holder.replaceChildren(window.DSPagination.footer({ total:rows.length,page:pageNumber,pageSize:pageSize,
        onChange:function (n) { pageNumber=n; render(); }, onPageSizeChange:function (n) { pageSize=n;pageNumber=1;render(); } }));
    }
    updateBulk();
  }
  function layoutHoldingRows(table) {
    // Заголовок группы занимает левую часть строки, до колонки объёма.
    // Все ячейки и ключи остаются на месте для штатных Settings / Resize / Reorder.
    table.querySelectorAll('[data-lead-holding]').forEach(function (row) {
      // Reorder измеряет ячейки каждой строки: объединённый заголовок берёт треки шапки.
      row.style.gridTemplateColumns = table.querySelector('.tbl__row--head').style.gridTemplateColumns;
      var cells = Array.from(row.children), volume = cells.find(function (c) { return c.dataset.col === 'c4'; });
      var title = cells.find(function (c) { return /^c\d+$/.test(c.dataset.col || '') && c !== volume; }) || cells[1];
      var volumeTrack = volume ? cells.indexOf(volume) + 1 : 0;
      if (volumeTrack && volumeTrack < 4) volumeTrack = cells.length - 1;
      var closed = collapsedHoldings.has(row.dataset.node);
      cells.forEach(function (cell, i) {
        cell.style.removeProperty('grid-column');
        if (cell.classList.contains('tc--separator')) { cell.style.gridColumn = i === 0 ? '1' : '-2'; return; }
        cell.hidden = cell !== title && cell !== volume;
        cell.classList.toggle('tc--tree', cell === title);
        cell.innerHTML = '';
      });
      title.style.gridColumn = '2 / ' + (volumeTrack || '-2');
      title.innerHTML = '<button type="button" class="tc__twisty" aria-expanded="' + !closed + '" aria-label="' + (closed ? 'Развернуть' : 'Свернуть') + '"><i data-icon="chevron-right"></i></button><span class="tc__row"><span class="tc__text tc__text--truncate">' + esc(row.dataset.holdingName) + '</span><span class="badge badge--text badge--s">' + row.dataset.holdingCount + '</span></span>';
      if (volume) { volume.style.gridColumn = String(volumeTrack); volume.innerHTML = '<span class="tc__row"><span class="tc__text">' + money(Number(row.dataset.holdingVolume)) + '</span></span>'; }
    });
  }
  function tableRow(l,parent,closed) {
    return '<div class="tbl__row' + (selected.has(l.id) ? ' tbl__row--selected' : '') + '" data-lead-row="' + esc(l.id) + '"' + (parent ? ' data-parent="' + parent + '"' : '') + (closed ? ' hidden' : '') + ' style="grid-template-columns:' + grid + '"><div class="tc tc--separator"></div><div class="tc tc--select">' + checkbox('select','',selected.has(l.id),'data-lead-check="' + esc(l.id) + '" aria-label="Выбрать ' + esc(l.id) + '"') + '</div>' + values(l).map(function (v,i) {
      var inside = i === 0 ? link(v,leadHref(l.id)) : i === 2 ? basisHtml(l) : i === 5 ? chip(v,stages.get(l.stage).tone) : esc(v);
      return '<div class="tc' + (i === 4 ? ' tc--numbers' : parent && i === 1 ? ' tc--tree' : '') + '"' + (parent && i === 1 ? ' style="--tc-level:1"' : '') + ' data-col="c' + i + '" data-sort-value="' + esc(i === 4 ? l.amountMln : i === 9 ? l.createdAt : i === 10 ? l.lastActivityAt : v) + '">' + (parent && i === 1 ? '<span class="tc__twisty tc__twisty--leaf" aria-hidden="true"></span>' : '') + '<span class="tc__row"><span class="tc__text tc__text--truncate">' + inside + '</span></span></div>';
    }).join('') + '<div class="tc tc--separator"></div></div>';
  }
  function updateBulk() { if (!el('lead-bulk')) return; el('lead-bulk').hidden = !selected.size; put('lead-bulk-count','Выбрано: ' + selected.size); }
  function renderBoard(rows) {
    // Штатное меню Kanban меняет DOM: сохраняем выбор пользователя перед перерисовкой.
    el('lead-board').querySelectorAll('[data-kb-col]').forEach(function (col) {
      if (col.classList.contains('kbcol--collapsed')) collapsedColumns.add(col.dataset.kbCol);
      else collapsedColumns.delete(col.dataset.kbCol);
    });
    /* Отложено пользователем: подборка недели. Сохранено для дальнейшей проработки.
    var picks = rows.filter(function (l) { return l.stage === 'REVIEW'; });
    put('lead-picks-count',String(picks.length)); put('lead-picks',picks.length ? picks.slice(0,3).map(function (l) { return card(l,true); }).join('') : empty('Подборка разобрана','Все лиды доступны в разделе «Лиды».'));
    */
    var cols = stages.working.concat([stages.get('PIPELINE'),stages.get('DECLINED')]);
    put('lead-board-track',cols.map(function (s) {
      var cards = rows.filter(function (l) { return l.stage === s.code; });
      var tone = s.tone === 'red' ? 'primary' : s.tone;
      var volume = cards.reduce(function (sum,l) { return sum + (Number(l.amountMln) || 0); },0);
      var unknown = cards.filter(function (l) { return l.amountMln == null; }).length;
      return '<section class="kbcol kbcol--' + tone + (collapsedColumns.has(s.code) ? ' kbcol--collapsed' : '') + '" data-kb-col="' + s.code + '" data-kb-name="' + esc(s.title) + '"><header class="kbcol__head"><span class="kbcol__marker" aria-hidden="true"></span><span class="kbcol__name">' + esc(s.title) + '</span><span class="kbcol__vname" aria-hidden="true">' + esc(s.title) + '</span><span class="badge badge--text badge--s" data-kb-count>' + cards.length + '</span><span class="kbcol__acts"><button type="button" class="ibtn ibtn--neutral ibtn--s" data-menu="lead-column-menu" aria-label="Действия с колонкой «' + esc(s.title) + '»"><i data-icon="more-dots"></i></button></span></header><div class="kbcol__body" data-kb-body>' + (cards.length ? cards.map(function (l) { return card(l,false); }).join('') : empty('Нет лидов','Переместите сюда подходящий лид.')) + '</div><div class="lead-colsum" data-lead-column-total="' + volume + '"><div class="lead-colsum__row"><span class="lead-colsum__label">Объём, млн RUB</span><span class="lead-colsum__value">' + money(volume) + '</span></div>' + (unknown ? '<span class="lead-colsum__label">Без оценки: ' + unknown + '</span>' : '') + '</div></section>';
    }).join(''));
    /* Отложено пользователем: сводка и план квартала. Сохранено для дальнейшей проработки.
    var all = store.all(), active = all.filter(function (l) { return l.owner === '04127' && l.stage !== 'REVIEW' && !stages.get(l.stage).final; });
    var summary = [['В подборке',all.filter(function (l) { return l.picked && l.stage === 'REVIEW'; }).length,'picks'],['В работе',active.length,'work'],['Без движения более 14 дней',active.filter(function (l) { return days(l)>14; }).length,'stale']];
    put('lead-summary',summary.map(function (x) { return '<section class="tile col-4" style="grid-column:span 4"><header class="tile__header"><div class="tile__header-main"><div class="tile__title-row"><h3 class="tile__title">' + esc(x[0]) + '</h3></div></div></header><div class="tile__body">' + fields([rof('Неделя 42', '<span class="ds-h3-strong">' + x[1] + '</span>'),rof('Действие',btn('Показать','summary-' + x[2],null,null,true))],2) + '</div></section>'; }).join(''));
    var plan = window.IBPR.clients().filter(function (c) { return c.inQuarterPlan; });
    var withLeads = plan.filter(function (c) { return active.some(function (l) { return l.clientId === c.id; }); }).length;
    var meetings = window.IBPR.meetings('MY').filter(function (m) { return m.date >= '2026-10-12' && m.date <= '2026-10-18'; }).length;
    var transferred = all.filter(function (l) { return l.stage === 'PIPELINE'; });
    put('lead-quarter-plan','Клиенты плана Q4: ' + plan.length + ' · с лидами в работе ' + withLeads + ' · без лидов ' + (plan.length-withLeads) + ' · Встречи недели: ' + meetings + ' · Передано за Q4: ' + transferred.length + ' · ' + money(transferred.reduce(function (sum,l) { return sum+(l.amountMln||0); },0)) + ' млн RUB · ' + link('Открыть клиентов',nav.href('clients',{mode:'after'})));
    */
    if (window.DSKanban) { window.DSKanban.bind(el('lead-board')); window.DSKanban.sync(el('lead-board')); }
  }
  function renderBasis(l) {
    return fields(l.basis.map(function (b) { var src = b.type === 'MEETING' ? window.IBPR.meeting(b.sourceId) : stages.basis[b.type].page === 'opportunity' ? window.IBPR.opportunity(b.sourceId) : window.IBPR.potential(b.sourceId);
      return rof(stages.basis[b.type].title,link(String(b.sourceId),store.basisHref(b)),true) + rof('Создан',date(src.createdAt)) + rof('Автор',esc((window.IBPR.employee(src.createdBy) || {}).fullName || 'Система'));
    }).concat([rof('ТБ / ГОСБ',esc(window.IBPR.lbl.terBank(l.client.terBank) + ' / ' + l.client.gosb),true),rof('Продукты источника',esc((l.source.productLabels || l.products).join(', ') || '—'),true)]),2);
  }
  function stageIndex(l) { var code=l.stage;if(code==='DECLINED'||code==='NOT_TAKEN')code=l.history.length?l.history[l.history.length-1].from:'REVIEW';return stages.all.findIndex(function(s){return s.code===code;}); }
  function stageMark(s,i,current,failed) { var status = i<current ? 'done' : i===current ? failed?'error':'current' : ''; return '<span class="stepmark stepmark--s' + (status ? ' stepmark--'+status : '') + '" aria-hidden="true"><span class="stepmark__num">'+(i+1)+'</span><i class="stepmark__icon" data-icon="check"></i><i class="stepmark__icon stepmark__icon--error" data-icon="alert-circle"></i></span>'; }
  function renderLead(l) {
    if (!l) { put('lead-page-title','Лид не найден'); put('lead-page-actions','');put('lead-crumb','Лид не найден');var main=document.querySelector('main');Array.from(main.children).forEach(function(c){if(!c.classList.contains('phead'))c.hidden=true;});if(el('lead-path'))el('lead-path').hidden=true;main.insertAdjacentHTML('beforeend',empty('Лид не найден','Вернитесь в реестр лидов.'));return; }
    var s = stages.get(l.stage), index = stageIndex(l);
    put('lead-page-title',esc(l.id+' · '+l.clientName)); put('lead-crumb',esc(l.id));
    put('lead-page-chips',chip(s.title,s.tone)+basisHtml(l));
    put('lead-page-subtitle','<span class="phead__meta">Ответственный: '+esc(owner(l))+' · Появился '+date(l.createdAt)+' · '+days(l)+' дн. на стадии</span>');
    put('lead-page-actions',btn('Путь лида','path-expand')+(!s.final ? btn('Клиент отказался','decline') : '')+btn(l.stage==='MEETING_DONE' && l.repeatNeeded && l.meetings.some(function(m){return m.statusCode==='SCHEDULED';})?'Итоги повторной встречи':s.action,'primary',l.id,'accent'));
    put('lead-stage-track',stages.workflow.map(function (stage,i) { return '<span class="lead-stage-track__item">'+stageMark(stage,i,index)+'<span class="ds-body-s">'+esc(stage.title)+'</span></span>'; }).join(''));
    put('lead-client-body',fields([rof('Клиент',link(l.clientName,nav.href('client',{id:l.clientId,mode:'after'})),true),rof('Холдинг',esc(l.holdingName),true),rof('ИНН',esc(l.client.inn)),rof('Приоритет',esc(l.client.quarterPlan || '—'))]));
    document.querySelector('[data-lead-basis-body]').innerHTML = renderBasis(l);
    document.querySelector('[data-lead-stage-body]').innerHTML = fields([rof('Стадия',chip(s.title,s.tone)),rof('Дней на стадии',String(days(l))),rof('Следующий шаг',esc(l.nextStep.title),true),rof('Срок',date(l.nextStep.dueDate)),rof('Подборка',l.picked?'Неделя 42':'Все лиды')]) + '<div class="lead-pick-footer">'+btn('Почему рекомендован','reasons',l.id,null,true)+'</div>';
    put('lead-idea-body',fields([rof('Идея сделки',esc(l.idea||'—'),true),rof('Продукты',l.products.map(function (p) { return chip(p,'lblue'); }).join(' ') || '—',true),rof('Объём, млн RUB',money(l.amountMln)),rof('Валюта',chip('RUB','grey'))],4));
    put('lead-timing-body',fields([rof('Появился',date(l.createdAt)),rof('Последняя активность',date(l.lastActivityAt)),rof('Срок следующего шага',date(l.nextStep.dueDate),true)]));
    put('lead-meetings-body',(l.meetings.length ? simpleTable(['Встреча','Дата','Статус','Повестка'],l.meetings.map(function (m) { return [link(m.id,nav.href('meetings',{id:m.id,mode:'after'})),date(m.date),esc(window.IBPR.lbl.meetingStatus(m.statusCode)),esc(m.agenda.map(function (x) { return x.title; }).join('; '))]; })) : empty('Встреч пока нет','Назначьте встречу из карточки лида.')) + (l.protocol ? '<p class="ds-body-s">Итоги: '+esc(l.protocol)+'</p>' : '') + (l.stage==='MEETING_DONE' ? btn('Повторная встреча','repeat',l.id) : ''));
    put('lead-tasks-body',simpleTable(['Задача клиента','Статус'],l.tasks.map(function (t) { return [link(t.title||t.name||String(t.id),nav.href('tasks',{id:t.id,mode:'after'})),esc(window.IBPR.lbl.taskStatus(t.statusCode))]; }))+(l.comments.length ? l.comments.map(function (c) { return '<p class="ds-body-s">'+esc(c)+'</p>'; }).join('') : '<p class="note note--s"><span class="note__text">Комментариев по лиду пока нет. Задачи выше показаны в контексте клиента.</span></p>'));
    var f = l.source.financials;
    put('lead-finance-body',f ? fields([rof('Общий объём, млн RUB',money(f.totalVolume)),rof('Итоговый доход, млн RUB',money(f.totalIncome)),rof('Процентный доход, млн RUB',money(f.interestIncome)),rof('Комиссионный доход, млн RUB',money(f.commissionIncome))],2) : '<p class="note note--s"><span class="note__text">В источнике нет финансовых метрик. '+link('Открыть финпоказатели клиента',nav.href('client',{id:l.clientId,tab:'ClientInfoFinancials',mode:'after'}))+'</span></p>');
    put('lead-team-body',fields([rof('Ответственный',esc(owner(l)),true),rof('Дески',esc((l.source.desks||[]).map(function (d) { return window.IBPR.lbl.desk(d.deskId); }).join('; ') || 'SMB Природные ресурсы +6'),true),rof('Связи',l.opportunityId ? link('Сделка '+l.opportunityId,nav.href('opportunity',{id:l.opportunityId,source:'pipeline',mode:'after'})) : 'Передачи в Pipeline пока нет',true)]));
    document.querySelector('[data-lead-history-table]').innerHTML = l.history.length ? simpleTable(['Дата','Событие','Стадия'],l.history.map(function (h) { return [date(h.date),esc(h.title),esc(stages.get(h.to).title)]; })) : empty('Нет событий','История появится после первого решения по лиду.');
    document.querySelectorAll('[data-lead-action="edit"],[data-lead-action="meeting"],[data-lead-action="repeat"]').forEach(function(b){b.disabled=!!s.final;});
    put('lead-live','Текущая стадия: '+esc(s.title)); renderPath(l);
  }
  function simpleTable(headers,rows) {
    if (!rows.length) return empty('Нет записей','Связанные записи появятся по мере работы.');
    var cols = '8px '+headers.map(function () { return 'minmax(0,1fr)'; }).join(' ')+' 8px';
    return '<div class="dtable"><div class="dtable__body"><div class="tbl" data-table><div class="tbl__row tbl__row--head" style="grid-template-columns:'+cols+'"><div class="th th--separator"></div>'+headers.map(function (h,i) { return window.IBPR_TABLE.headCell({key:'s'+i,label:h,sort:false},false); }).join('')+'<div class="th th--separator"></div></div>'+rows.map(function (row) { return '<div class="tbl__row" style="grid-template-columns:'+cols+'"><div class="tc tc--separator"></div>'+row.map(function (cell,i) { return '<div class="tc" data-col="s'+i+'"><span class="tc__row"><span class="tc__text tc__text--truncate">'+cell+'</span></span></div>'; }).join('')+'<div class="tc tc--separator"></div></div>'; }).join('')+'</div></div></div>';
  }
  function pathState(value) {
    var root = el('lead-path'); if (!root) return;
    if (value) { root.dataset.pathState=value; try { localStorage.setItem('ibp-redesign-v2-path',value); } catch(e) {} }
    root.hidden=root.dataset.pathState==='hidden'; root.querySelector('[data-path-pill]').hidden=root.dataset.pathState!=='collapsed'; root.querySelector('[data-path-expanded]').hidden=root.dataset.pathState!=='expanded';
  }
  function renderPath(l) {
    if (!el('lead-path')) return;
    var current=stageIndex(l), check=stages.checks(l), missing=check.filter(function (c) { return !c.done && !c.optional; });
    var pathStages=stages.workflow.filter(function (s) { return !s.final; });
    document.querySelector('[data-path-label]').textContent='Путь лида · '+Math.min(current+1,pathStages.length)+' из '+pathStages.length+' · '+stages.get(l.stage).title+' · '+missing.length+' осталось';
    document.querySelector('[data-path-body]').innerHTML=pathStages.map(function (s,i) { return '<div class="lc-lead-path__step">'+stageMark(s,i,current)+'<div><div class="ds-body-s-strong">'+esc(s.title)+'</div>'+(i===current ? '<p class="ds-body-s">'+esc(s.goal)+'</p>'+check.map(function (c) { return '<p class="ds-body-s">'+(c.done?'✓ ':'○ ')+esc(c.title)+' '+(!c.done?btn('Заполнить',c.action,l.id,'transparent',true):'')+'</p>'; }).join('') : '')+'</div></div>'; }).join('');
    var button=document.querySelector('[data-path-next]'), next=stages.next(l);
    button.disabled=stages.get(l.stage).final || missing.length>0 || !next;
    button.querySelector('.btn__label').textContent=next?'К «'+stages.get(next).title+'»':'Работа завершена';
    button.title=missing.length?'Не выполнено: '+missing.map(function (c) { return c.title; }).join(', '):'';
    if(l.stage==='MEETING_DONE') document.querySelector('[data-path-body]').insertAdjacentHTML('beforeend',btn('Назначить повторную встречу','repeat',l.id));
    pathState();
  }
  function preview(id) {
    var l=store.get(id); if(!l) return; previewId=id;
    put('lead-preview-title',esc(l.clientName)); put('lead-preview-path',esc(l.id+' · '+stages.get(l.stage).title));
    put('lead-preview-body','<section class="drawer__sec"><div class="drawer__grid">'+rof('Идея',esc(l.idea),true)+rof('Объём, млн RUB',money(l.amountMln))+rof('Следующий шаг',esc(l.nextStep.title),true)+'</div></section><section class="drawer__sec"><h3 class="drawer__sectitle">Основания</h3>'+renderBasis(l)+'</section><section class="drawer__sec"><h3 class="drawer__sectitle">Путь лида</h3><p class="ds-body-s">'+esc(stages.get(l.stage).goal)+'</p>'+stages.checks(l).map(function (c) {return '<p class="ds-body-s">'+(c.done?'✓ ':'○ ')+esc(c.title)+'</p>';}).join('')+'</section>');
    put('lead-preview-actions',btn(stages.get(l.stage).action,'primary',id,'accent')+link('Открыть лид',leadHref(id)));
    bind(el('lead-preview')); if(window.DSDrawer) window.DSDrawer.open(el('lead-preview'));
  }
  function renderFilter() {
    var defs = [['filter-client','Клиент',window.IBPR.clients().map(function(c){return c.name;}),'client'],['filter-holding','Холдинг',window.IBPR.clients().map(function(c){return c.holdingName;}),'holding'],['filter-owner','Ответственный',window.IBPR.employees().map(function(e){return {value:e.id,label:e.fullName};}),'owner'],['filter-stage','Стадия',stages.all.map(function(s){return {value:s.code,label:s.title};}),'stage']];
    put('lead-filter-fields',defs.map(function (x) { return select(x[0],x[1],x[2],filters[x[3]]); }).join(''));
    put('lead-filter-parameters-fields',select('filter-product','Продукт',[...new Set(store.all().flatMap(function(l){return l.products;}))],filters.product)+select('filter-industry','Отрасль',[...new Set(window.IBPR.clients().map(function(c){return c.industry;}))],filters.industry)+select('filter-bank','ТБ',Object.keys(window.DICT_TER_BANKS).map(function(k){return {value:k,label:window.DICT_TER_BANKS[k]};}),filters.bank)+input('filter-min','Объём от, млн RUB',filters.min||'','number')+input('filter-max','Объём до, млн RUB',filters.max||'','number')+input('filter-created','Появился с',filters.created||'','date')+checkbox('filter-plan','Клиент в плане Q4',filters.plan));
    bind(el('lead-filter'));
  }
  function fieldValue(id) { var node=el(id); return node ? node.dataset.value || node.value.trim() : ''; }
  function openForm(action,id,ids) {
    var l=id?store.get(id):null; formState={action:action,id:id,ids:ids};
    if(l && stages.get(l.stage).final && ['edit','meeting','repeat','outcome','documents'].includes(action))throw new Error('Сначала верните лид в работу');
    var html='',title='Работа с лидом',submit='Сохранить';
    if(action==='create') { title=page==='HomeBoard'?'Новый проект':'Новый лид'; html=select('form-client','Клиент',window.IBPR.clients().map(function(c){return {value:c.id,label:c.name};}),null); }
    if(action==='create'||action==='edit') { title=action==='edit'?'Идея и продукты':title; html+=input('form-idea','Идея сделки',l?l.idea:'','textarea')+input('form-product','Продукт',l?l.products.join(', '):'')+input('form-amount','Объём, млн RUB',l?l.amountMln||'':'','number')+input('form-due','Срок следующего шага',l?l.nextStep.dueDate:'2026-10-16','date'); }
    if(action==='meeting'||action==='repeat') { title=action==='repeat'?'Повторная встреча':'Назначить встречу'; submit='Назначить'; html=input('form-date','Дата','2026-10-15','date')+input('form-time','Время','10:00','time')+input('form-participant','Участник клиента','')+input('form-agenda','Повестка',l.idea,'textarea'); }
    if(action==='outcome') { title='Итоги встречи'; html=input('form-protocol','Итоги и договорённости',l.protocol||'','textarea'); submit='Зафиксировать итоги'; }
    if(action==='documents') { title='Подготовка документов'; html=['onePager','termSheet','clientDocs'].map(function(k,i){return checkbox('form-'+k,['One Pager согласован','Term Sheet направлен','Документы клиента проверены'][i],l.documents[k]);}).join('')+'<p class="note note--s"><span class="note__text">Демо фиксирует готовность; файлы хранятся в карточке клиента.</span></p>'; }
    if(['not-taken','decline','bulk-decline'].includes(action)) { title=action==='decline'?'Клиент отказался':'Не беру'; html=select('form-reason','Причина',stages.reasons[action==='decline'?'DECLINED':'NOT_TAKEN'],'')+input('form-comment','Комментарий','','textarea'); submit='Подтвердить'; }
    if(action==='comment') { title='Комментарий по лиду'; html=input('form-comment','Комментарий','','textarea'); }
    if(action==='bulk-owner') { title='Назначить ответственного'; html=select('form-owner','Ответственный',window.IBPR.employees().map(function(e){return {value:e.id,label:e.fullName};}),null); }
    document.querySelectorAll('.ddl[id^="form-"]').forEach(function(n){n.remove();});
    put('lead-modal-title',title); put('lead-form-fields','<div class="lead-form-fields">'+html+'</div>');
    el('lead-form-error').hidden=true; el('lead-form-submit').querySelector('.btn__label').textContent=submit;
    bind(el('lead-actions-modal'));
    if(window.DSModal) window.DSModal.open(el('lead-actions-modal'),{nested:!!window.DSModal.current()});
  }
  function transfer(id) {
    var l=store.get(id),missing=store.missing(id,'PIPELINE'); formState={action:'transfer',id:id};transferLeadId=id;
    put('lead-transfer-body','<p class="ds-body-m">'+esc(l.id+' · '+l.clientName)+'</p><p class="note note--s"><span class="note__text">Будет создана сделка в Pipeline со стадией «Проработка идеи сделки».</span></p>'+stages.checks(Object.assign({},l,{stage:'DOCUMENTS'})).map(function(c){return '<p class="ds-body-s">'+(c.done?'✓ ':'○ ')+esc(c.title)+(c.done?'':' '+btn('Заполнить',c.action,id,'transparent',true))+'</p>';}).join(''));
    el('lead-transfer-confirm').disabled=missing.length>0;
    bind(el('lead-transfer-modal')); if(window.DSModal) window.DSModal.open(el('lead-transfer-modal'),{nested:!!window.DSModal.current()});
  }
  function move(id,target,reason) { var snapshot=store.snapshot(); store.move(id,target,reason); notify('Лид '+id+' → '+stages.get(target).title,snapshot); }
  function primary(id) {
    var l=store.get(id); if(!l) return;
    if(l.stage==='MEETING_DONE' && l.repeatNeeded && l.meetings.some(function(m){return m.statusCode==='SCHEDULED';})) return openForm('outcome',id);
    var actions={REVIEW:'take',IDEA:'edit',RESEARCH:'meeting',MEETING_PLANNED:'outcome',MEETING_DONE:'advance',DOCUMENTS:'transfer',PIPELINE:'open-deal',DECLINED:'revive',NOT_TAKEN:'revive'};
    act(actions[l.stage],id);
  }
  function act(action,id) {
    id=id||currentId||previewId;
    var l=id?store.get(id):null;
    if(action==='take') return move(id,'IDEA');
    if(action==='primary') return primary(id);
    if(action==='preview') return preview(id);
    if(action==='transfer') return transfer(id);
    if(action==='transfer-confirm') { var targetId=formState.id; move(targetId,'PIPELINE'); window.DSModal.closeTop(); return; }
    if(action==='advance') {
      var next=stages.next(l); if(!next) return;
      if(next==='PIPELINE') return transfer(id);
      var needed=store.missing(id,next); if(needed.length) return openForm(needed[0].action,id);
      return move(id,next);
    }
    if(action==='revive') { var shot=store.snapshot(); store.revive(id);notify('Лид возвращён в работу',shot);return; }
    if(action==='open-deal') { window.location.href=nav.href('opportunity',{id:l.opportunityId,source:'pipeline',mode:'after'});return; }
    if(action==='basis') { store.markBasis(id); window.location.href=store.basisHref(l.basis[0]);return; }
    if(action==='reasons') { put('lead-reasons-body',l.reasons.map(function(r){return '<p class="ds-body-s">'+esc(r)+'</p>';}).join('')); return; }
    if(action==='path-expand'||action==='path-collapse'||action==='path-hide') { pathState(action==='path-expand'?'expanded':action==='path-hide'?'hidden':'collapsed');if(action==='path-expand') el('lead-path').querySelector('[data-lead-action="path-collapse"]').focus();else if(action==='path-collapse')el('lead-path').querySelector('[data-lead-action="path-expand"]').focus();else document.querySelector('#lead-page-actions [data-lead-action="path-expand"]').focus();return; }
    if(action==='filter-clear') { el('lead-filter').querySelectorAll('input').forEach(function(n){n.value='';n.dataset.value='';n.checked=false;});if(window.DSInput)window.DSInput.syncAll(el('lead-filter'));return; }
    if(action==='filter-apply') { filters={};['client','holding','owner','stage','product','industry','bank','min','max','created'].forEach(function(k){var value=fieldValue('filter-'+k);if(value)filters[k]=value;});if(el('lead-filter').querySelector('[name="filter-plan"]').checked)filters.plan=true;pageNumber=1;selected.clear();window.DSModal.closeTop();render();return; }
    if(action==='filter-reset') { filters={};basisFilter='';selected.clear();pageNumber=1;renderFilter();render();return; }
    if(action.startsWith('summary-')) { var key=action.slice(8); if(key==='stale'){filters.stale=true;view='table';render();}else window.location.href=nav.href('leadsNew',{tab:key,mode:'after'});return; }
    if(action.startsWith('bulk-')) {
      var ids=[...selected]; if(!ids.length)return;
      if(action==='bulk-take') { if(ids.some(function(x){return store.get(x).stage!=='REVIEW';}))throw new Error('Выберите только лиды в Рассмотрении');var shot=store.snapshot();ids.forEach(function(x){store.move(x,'IDEA');});selected.clear();notify('Лиды взяты в работу',shot);render();return; }
      if(action==='bulk-decline'&&ids.some(function(x){return store.get(x).stage!=='REVIEW';}))throw new Error('«Не беру» доступно только в Рассмотрении');
      return openForm(action,null,ids);
    }
    return openForm(action,id);
  }
  function submit(e) {
    e.preventDefault(); var f=formState,l=f.id?store.get(f.id):null,shot=store.snapshot();
    try {
      if(f.action==='create'||f.action==='edit') {
        var idea=fieldValue('form-idea'),products=fieldValue('form-product').split(',').map(function(s){return s.trim();}).filter(Boolean),amount=Number(fieldValue('form-amount'));
        if(!idea||!products.length||amount<=0)throw new Error('Заполните идею, продукт и положительный объём');
        if(f.action==='create'){var clientId=fieldValue('form-client');if(!window.IBPR.client(clientId))throw new Error('Выберите клиента из списка');var created=store.create({clientId:clientId,idea:idea,product:products[0],amountMln:amount});window.DSModal.closeTop();window.location.href=leadHref(created.id);return;}
        store.patch(f.id,{idea:idea,products:products,amountMln:amount,dueDate:fieldValue('form-due')});
      } else if(f.action==='meeting'||f.action==='repeat') {
        if(!fieldValue('form-participant')||!fieldValue('form-agenda')||!fieldValue('form-date'))throw new Error('Укажите дату, участника и повестку');
        store.schedule(f.id,{date:fieldValue('form-date'),time:fieldValue('form-time'),participant:fieldValue('form-participant'),agenda:fieldValue('form-agenda')});
        if(l.stage==='RESEARCH')store.move(f.id,'MEETING_PLANNED');
        if(f.action==='repeat')store.patch(f.id,{repeatNeeded:true});
      } else if(f.action==='outcome') {
        if(!fieldValue('form-protocol'))throw new Error('Запишите итоги встречи');
        store.outcome(f.id,fieldValue('form-protocol'));
        if(l.stage==='MEETING_PLANNED')store.move(f.id,'MEETING_DONE');
      } else if(f.action==='documents') {
        var flags={};['onePager','termSheet','clientDocs'].forEach(function(k){flags[k]=el('lead-actions-modal').querySelector('[name="form-'+k+'"]').checked;});store.documents(f.id,flags);
      } else if(f.action==='comment') {
        if(!fieldValue('form-comment'))throw new Error('Введите комментарий');store.comment(f.id,fieldValue('form-comment'));
      } else if(f.action==='bulk-owner') {
        var employeeId=fieldValue('form-owner');if(!window.IBPR.employee(employeeId))throw new Error('Выберите сотрудника');f.ids.forEach(function(id){store.patch(id,{owner:employeeId});});selected.clear();
      } else {
        var reason=fieldValue('form-reason');if(!reason)throw new Error('Выберите причину');
        var target=f.action==='decline'?'DECLINED':'NOT_TAKEN';(f.ids||[f.id]).forEach(function(id){store.move(id,target,reason+(fieldValue('form-comment')?' · '+fieldValue('form-comment'):''));});selected.clear();
      }
      window.DSModal.closeTop();notify('Изменения сохранены',shot);render();
    } catch(err) { el('lead-form-error').hidden=false;el('lead-form-error').querySelector('.note__text').textContent=err.message; }
  }
  function render() {
    if (transferLeadId && el('lead-transfer-modal') && !el('lead-transfer-modal').hidden) {
      var transferLead=store.get(transferLeadId);
      el('lead-transfer-confirm').disabled=store.missing(transferLeadId,'PIPELINE').length>0;
      put('lead-transfer-body','<p class="ds-body-m">'+esc(transferLead.id+' · '+transferLead.clientName)+'</p>'+stages.checks(Object.assign({},transferLead,{stage:'DOCUMENTS'})).map(function(c){return '<p class="ds-body-s">'+(c.done?'✓ ':'○ ')+esc(c.title)+(c.done?'':' '+btn('Заполнить',c.action,transferLeadId,'transparent',true))+'</p>';}).join(''));
    }
    if(page==='Lead'){renderLead(store.get(currentId));bind();return;}
    var rows=filtered();
    if(page==='HomeBoard') { renderBoard(rows);el('lead-board').hidden=view!=='board';el('lead-table-wrap').hidden=view==='board'; }
    else { el('lead-table-wrap').hidden=false; }
    renderTable(rows);
    put('lead-filter-chips',Object.keys(filters).length||basisFilter?'<span class="chip chip--edit chip--m tfilter__applied" tabindex="0"><span class="chip__label">Применено: '+(Object.keys(filters).length+(basisFilter?1:0))+'</span><span class="chip__remove" role="button" tabindex="0" aria-label="Сбросить все фильтры" data-lead-action="filter-reset"><i data-icon="close"></i></span></span>':'');
    if(page==='LeadsNew') {
      renderBasisPicker();
      document.querySelectorAll('[data-lead-tab]').forEach(function(b){var active=b.dataset.leadTab===tab;b.classList.toggle('tab--selected',active);b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
    }
    document.querySelectorAll('[data-lead-view],[data-lead-group]').forEach(function(b){var active=b.hasAttribute('data-lead-view')?b.dataset.leadView===view:b.dataset.leadGroup===listMode;b.setAttribute('aria-checked',String(active));b.tabIndex=active?0:-1;});
    bind();
  }
  function mount(name) {
    page=name;var params=new URLSearchParams(window.location.search);currentId=params.get('id')||'L-O166092';tab=params.get('tab')||'picks';
    if(page==='Lead'){try{el('lead-path').dataset.pathState=localStorage.getItem('ibp-redesign-v2-path')||'collapsed';}catch(e){}}
    document.body.insertAdjacentHTML('beforeend','<div class="menu" id="lead-card-menu" role="menu" hidden></div>');
    renderFilter();render();store.on(render);
    document.addEventListener('treetoggle',function(e){
      if(!e.target.matches('#lead-table') || !e.detail || !e.detail.node) return;
      if(e.detail.open) collapsedHoldings.delete(e.detail.node); else collapsedHoldings.add(e.detail.node);
    });
    ['columnsettings','columnreorder'].forEach(function(type){document.addEventListener(type,function(e){
      if(!e.target.matches('#lead-table') || page!=='LeadsNew' || listMode!=='holdings') return;
      layoutHoldingRows(e.target);if(window.dsIcons)window.dsIcons.apply(e.target);
    });});
    if(window.DSTabs){
      var tabs=el('lead-list-tabs');
      if(tabs)window.DSTabs.tabs(tabs,{onChange:function(i,b){tab=b.dataset.leadTab;pageNumber=1;selected.clear();render();}});
    }
    document.addEventListener('click',function(e){
      var columnButton=e.target.closest('[data-menu="lead-column-menu"]');
      if(columnButton){var col=columnButton.closest('[data-kb-col]');el('lead-column-collapse-label').textContent=col.classList.contains('kbcol--collapsed')?'Развернуть колонку':'Свернуть колонку';}
      var menuButton=e.target.closest('[data-menu-lead]');if(!menuButton)return;var menuId=menuButton.dataset.menuLead;put('lead-card-menu',[['Открыть предпросмотр','preview'],['Следующий шаг','primary'],['Клиент отказался','decline']].map(function(item){return '<button type="button" class="menu__item" role="menuitem" data-lead-action="'+item[1]+'" data-lead-id="'+esc(menuId)+'"><span class="menu__item-label">'+item[0]+'</span></button>';}).join(''));
    },true);
    el('lead-action-form').addEventListener('submit',submit);
    document.addEventListener('click',function(e){
      var action=e.target.closest('[data-lead-action]'),row=e.target.closest('[data-lead-row]'),reason=e.target.closest('[data-reasons-for]');
      if(reason){put('lead-reasons-body',store.get(reason.dataset.reasonsFor).reasons.map(function(r){return '<p class="ds-body-s">'+esc(r)+'</p>';}).join(''));}
      if(action){e.preventDefault();e.stopPropagation();try{act(action.dataset.leadAction,action.dataset.leadId);}catch(err){error(err.message);}return;}
      if(row&&!e.target.closest('a,button,input,label'))preview(row.dataset.leadRow);
    });
    document.addEventListener('dblclick',function(e){var r=e.target.closest('[data-lead-row]');if(r)window.location.href=leadHref(r.dataset.leadRow);});
    document.addEventListener('change',function(e){if(e.target.dataset.leadCheck){if(e.target.checked)selected.add(e.target.dataset.leadCheck);else selected.delete(e.target.dataset.leadCheck);updateBulk();}if(e.target.hasAttribute('data-lead-select-all')){document.querySelectorAll('[data-lead-check]').forEach(function(n){n.checked=e.target.checked;if(n.checked)selected.add(n.dataset.leadCheck);else selected.delete(n.dataset.leadCheck);});updateBulk();}});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&el('lead-path')&&!window.DSModal.current()){pathState('collapsed');document.querySelector('[data-lead-action="path-expand"]').focus();}});
    document.addEventListener('keydown',function(e){var reset=e.target.closest('.chip__remove[data-lead-action="filter-reset"]');if(reset&&(e.key==='Enter'||e.key===' ')){e.preventDefault();act('filter-reset');}});
    var board=el('lead-board');
    if(board){board.addEventListener('kanban:beforemove',function(e){e.preventDefault();var id=e.detail.card.dataset.kbCard,target=e.detail.to.dataset.kbCol;setTimeout(function(){try{if(target==='PIPELINE')transfer(id);else if(target==='DECLINED')openForm('decline',id);else{var missing=store.missing(id,target);if(missing.length)openForm(missing[0].action,id);else move(id,target);}}catch(err){error(err.message);}},0);});board.addEventListener('kanban:open',function(e){preview(e.detail.card.dataset.kbCard);});}
  }
  window.LeadUI={mount:mount,preview:preview,render:render,clientTable:function(host,clientId){
    function draw(){var rows=store.all().filter(function(l){return l.clientId===clientId;});host.innerHTML='<header class="tile__header"><div class="tile__header-main"><div class="tile__title-row"><h3 class="tile__title">Лиды клиента</h3><span class="badge badge--text badge--s">'+rows.length+'</span></div></div></header><div class="tile__body">'+simpleTable(['Лид','Основание','Идея','Стадия','Объём, млн RUB'],rows.map(function(l){return [link(l.id,leadHref(l.id)),basisHtml(l),esc(l.idea),chip(stages.get(l.stage).title,stages.get(l.stage).tone),money(l.amountMln)];}))+'</div>';bind(host);}
    draw();store.on(draw);
  }};
})();
