/* CommentsTile — заполнение тайла комментариями.
   render(host, { comments, title, href }) — комментарии ({authorName, time,
   date, text}); title — заголовок тайла («Комментарии к стадии» у сделки,
   «Комментарии» у лида и клиента); href — стрелка на страницу комментариев.
   Кнопки правки и удаления — видны, по клику ничего (Р6). */
(function () {
  'use strict';

  function fmt(iso) { return window.DICT_FMT ? window.DICT_FMT.date(iso) : iso; }

  function render(host, opts) {
    var list = (opts && opts.comments) || [];
    var body = host.querySelector('[data-comments-body]');
    if (!body) return;
    if (opts && opts.title) {
      var t = host.querySelector('.tile__title');
      if (t) t.textContent = opts.title;
    }
    /* href — страница всех комментариев (у клиента — ClientComments); без
       него стрелка гасится (Р6) */
    var arrow = host.querySelector('.tile__actions a');
    if (arrow && opts && opts.href) { arrow.setAttribute('href', opts.href); arrow.removeAttribute('data-inert'); }
    var h = list.map(function (c) {
      return '<div class="lc-comments__item">'
        + '<p class="lc-comments__meta"><span class="lc-comments__author">' + c.authorName + '</span> · <span class="lc-comments__time">' + c.time + '</span> · <span class="lc-comments__date">' + fmt(c.date) + '</span></p>'
        + '<p class="lc-comments__text">' + c.text + '</p>'
        + '<div class="lc-comments__acts">'
        + '<button type="button" class="ibtn ibtn--neutral ibtn--s" aria-label="Удалить комментарий"><i data-icon="trash"></i></button>'
        + '<button type="button" class="ibtn ibtn--neutral ibtn--s" aria-label="Править комментарий"><i data-icon="edit"></i></button>'
        + '</div></div>';
    }).join('');
    h += '<button type="button" class="btn btn--transparent btn--s lc-comments__add"><i data-icon="add"></i><span class="btn__label">Добавить комментарий</span></button>';
    body.innerHTML = h;
    if (window.dsIcons) window.dsIcons.apply(body);
  }

  window.LcCommentsTile = { render: render };
})();
