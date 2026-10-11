/* СГЕНЕРИРОВАН screen-map.mjs из map.yaml — руками не править; пересобрать:
   node .agents/tools/screen-map.mjs (сверка — --check).
   Карта экранов раздела: экраны, связи «откуда куда» и ключевые состояния.
   Адреса — от каталога apps/; обычный <script>: по file:// fetch не работает. */
(window.ScreenMaps = window.ScreenMaps || {})["postrade"] = {
  "format": 1,
  "section": "postrade",
  "title": "\u041a\u0430\u0440\u0442\u0430 \u044d\u043a\u0440\u0430\u043d\u043e\u0432 Post",
  "desc": "\u0412\u0441\u0435 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b Post \u0432 \u043e\u0434\u0438\u043d \u043a\u043b\u0438\u043a \u2014 \u043e\u0442 \u0433\u043b\u0430\u0432\u043d\u043e\u0439 \u0434\u043e \u0442\u0440\u0430\u043d\u0448\u0430 \u0438 \u0440\u0430\u0441\u0447\u0435\u0442\u0430 FV",
  "apps": [
    {
      "dir": "postrade/deals-app",
      "id": "deals-app",
      "title": "Post \u2014 \u0414\u0418\u0414",
      "track": "product",
      "panel": false
    },
    {
      "dir": "postrade/post-reports-app",
      "id": "post-reports-app",
      "title": "Post \u2014 \u041e\u0442\u0447\u0451\u0442\u044b",
      "track": "product",
      "panel": true
    }
  ],
  "nodes": [
    {
      "id": "main",
      "app": "postrade/deals-app",
      "title": "\u0413\u043b\u0430\u0432\u043d\u0430\u044f",
      "page": "MainPage.html",
      "href": "postrade/deals-app/pages/MainPage.html",
      "parent": null,
      "note": null,
      "states": []
    },
    {
      "id": "portfolio",
      "app": "postrade/deals-app",
      "title": "\u0422\u0435\u043a\u0443\u0449\u0438\u0439 \u043f\u043e\u0440\u0442\u0444\u0435\u043b\u044c",
      "page": "Portfolio.html",
      "href": "postrade/deals-app/pages/Portfolio.html",
      "parent": "main",
      "note": null,
      "states": [
        {
          "id": "deal-new",
          "kind": "do",
          "title": "\u041d\u043e\u0432\u0430\u044f \u0441\u0434\u0435\u043b\u043a\u0430",
          "page": "Portfolio.html",
          "href": "postrade/deals-app/pages/Portfolio.html#ppmap=portfolio/deal-new",
          "note": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "[data-modal=\"new-deal-scrim\"]",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": null,
              "block": null,
              "ms": null
            },
            {
              "verb": "waitFor",
              "target": "#new-deal-title",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": null,
              "key": null,
              "mods": {
                "alt": false,
                "shift": false,
                "ctrl": false,
                "meta": false
              },
              "state": "visible",
              "block": null,
              "ms": null
            }
          ]
        }
      ]
    },
    {
      "id": "deal",
      "app": "postrade/deals-app",
      "title": "\u0421\u0434\u0435\u043b\u043a\u0430",
      "page": "Deal.preview.html?id=1024",
      "href": "postrade/deals-app/pages/Deal.preview.html?id=1024",
      "parent": "portfolio",
      "note": null,
      "states": []
    },
    {
      "id": "tranche",
      "app": "postrade/deals-app",
      "title": "\u0422\u0440\u0430\u043d\u0448",
      "page": "Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1",
      "href": "postrade/deals-app/pages/Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1",
      "parent": "deal",
      "note": null,
      "states": [
        {
          "id": "hards-locked",
          "kind": "do",
          "title": "\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044f \u0440\u0430\u0441\u0447\u0451\u0442 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0445 \u043f\u043b\u0430\u0442\u0435\u0436\u0435\u0439",
          "page": "Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1&hardsState=locked",
          "href": "postrade/deals-app/pages/Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1&hardsState=locked",
          "note": null,
          "issues": [],
          "do": []
        },
        {
          "id": "hards-none",
          "kind": "do",
          "title": "\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u044e\u0442",
          "page": "Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1&hardsState=none",
          "href": "postrade/deals-app/pages/Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1&hardsState=none",
          "note": null,
          "issues": [],
          "do": []
        },
        {
          "id": "hards-filled",
          "kind": "do",
          "title": "\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u0432\u043d\u0435\u0441\u0435\u043d\u044b",
          "page": "Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1&hardsState=filled",
          "href": "postrade/deals-app/pages/Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1&hardsState=filled",
          "note": null,
          "issues": [],
          "do": []
        }
      ]
    },
    {
      "id": "rsbu",
      "app": "postrade/deals-app",
      "title": "\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u0420\u0421\u0411\u0423",
      "page": "RsbuInterestAdjustments.preview.html?id=1024&tr=1024.d1.p1.i1.t1",
      "href": "postrade/deals-app/pages/RsbuInterestAdjustments.preview.html?id=1024&tr=1024.d1.p1.i1.t1",
      "parent": "tranche",
      "note": null,
      "states": [
        {
          "id": "adjustment-new",
          "kind": "do",
          "title": "\u041d\u043e\u0432\u0430\u044f \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0430",
          "page": "RsbuInterestAdjustments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&open=add",
          "href": "postrade/deals-app/pages/RsbuInterestAdjustments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&open=add",
          "note": null,
          "issues": [],
          "do": []
        },
        {
          "id": "filled",
          "kind": "do",
          "title": "\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u0432\u043d\u0435\u0441\u0435\u043d\u044b",
          "page": "RsbuInterestAdjustments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=filled",
          "href": "postrade/deals-app/pages/RsbuInterestAdjustments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=filled",
          "note": null,
          "issues": [],
          "do": []
        }
      ]
    },
    {
      "id": "fin-instrument",
      "app": "postrade/deals-app",
      "title": "\u0424\u0438\u043d\u0430\u043d\u0441\u043e\u0432\u044b\u0439 \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442",
      "page": "FinInstrument.preview.html?id=1024&fi=FI-1024-1",
      "href": "postrade/deals-app/pages/FinInstrument.preview.html?id=1024&fi=FI-1024-1",
      "parent": "deal",
      "note": null,
      "states": []
    },
    {
      "id": "fv-register",
      "app": "postrade/post-reports-app",
      "title": "\u0420\u0435\u0435\u0441\u0442\u0440 \u0440\u0430\u0441\u0447\u0435\u0442\u043e\u0432 FV",
      "page": "FairValueRegister.preview.html",
      "href": "postrade/post-reports-app/pages/FairValueRegister.preview.html",
      "parent": "main",
      "note": null,
      "states": [
        {
          "id": "register/register-new",
          "kind": "flow",
          "title": "\u041d\u043e\u0432\u044b\u0439 \u0440\u0430\u0441\u0447\u0435\u0442",
          "page": "FairValueRegister.preview.html",
          "href": "postrade/post-reports-app/pages/FairValueRegister.preview.html#pp=02",
          "note": "\u0420\u0430\u0441\u0447\u0435\u0442 \u043d\u0430 \u0443\u0436\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u044e\u0449\u0443\u044e \u0434\u0430\u0442\u0443 \u043d\u0435 \u0444\u043e\u0440\u043c\u0438\u0440\u0443\u0435\u0442\u0441\u044f \u2014 Alert \u0432 \u043e\u043a\u043d\u0435.",
          "flow": "register",
          "step": "register-new",
          "state": 2
        },
        {
          "id": "register/register-file-error",
          "kind": "flow",
          "title": "\u041e\u0448\u0438\u0431\u043a\u0430 \u0444\u0430\u0439\u043b\u0430 \u043f\u0440\u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0435 FV",
          "page": "FairValueRegister.preview.html?file=format",
          "href": "postrade/post-reports-app/pages/FairValueRegister.preview.html?file=format#pp=26",
          "note": "\u0421\u043d\u0435\u043a\u0431\u0430\u0440 \u0441 \u043e\u0448\u0438\u0431\u043a\u043e\u0439 \u0444\u0430\u0439\u043b\u0430; \u0434\u0440\u0443\u0433\u0438\u0435 \u0432\u0430\u0440\u0438\u0430\u043d\u0442\u044b \u2014 ?file=empty, ?file=structure, ?file=size.",
          "flow": "register",
          "step": "register-file-error",
          "state": 26
        }
      ]
    },
    {
      "id": "fv-calc",
      "app": "postrade/post-reports-app",
      "title": "\u0420\u0430\u0441\u0447\u0435\u0442 FV",
      "page": "FairValueCalculation.preview.html?id=16&role=FINANCIER",
      "href": "postrade/post-reports-app/pages/FairValueCalculation.preview.html?id=16&role=FINANCIER",
      "parent": "fv-register",
      "note": null,
      "states": [
        {
          "id": "statuses-financier/st-forming",
          "kind": "flow",
          "title": "\u0424\u043e\u0440\u043c\u0438\u0440\u0443\u0435\u0442\u0441\u044f",
          "page": "FairValueCalculation.preview.html?id=17&role=FINANCIER",
          "href": "postrade/post-reports-app/pages/FairValueCalculation.preview.html?id=17&role=FINANCIER#pp=03",
          "note": "\u041a\u043d\u043e\u043f\u043a\u0438 \u0438 \u043c\u0435\u043d\u044e \u0432\u044b\u043a\u043b\u044e\u0447\u0435\u043d\u044b, \u043f\u043e\u043a\u0430 \u0440\u0430\u0441\u0447\u0435\u0442 \u0444\u043e\u0440\u043c\u0438\u0440\u0443\u0435\u0442\u0441\u044f.",
          "flow": "statuses-financier",
          "step": "st-forming",
          "state": 3
        },
        {
          "id": "statuses-financier/st-formed",
          "kind": "flow",
          "title": "\u0421\u0444\u043e\u0440\u043c\u0438\u0440\u043e\u0432\u0430\u043d",
          "page": "FairValueCalculation.preview.html?id=16&role=FINANCIER",
          "href": "postrade/post-reports-app/pages/FairValueCalculation.preview.html?id=16&role=FINANCIER#pp=04",
          "note": "\u0414\u043e\u0441\u0442\u0443\u043f\u043d\u0430 \u00ab\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0432 LP\u00bb; \u0441\u0442\u0440\u043e\u043a\u0438 \u043c\u043e\u0436\u043d\u043e \u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0434\u043e \u043e\u0442\u043f\u0440\u0430\u0432\u043a\u0438 \u0438 \u043f\u043e\u0441\u043b\u0435.",
          "flow": "statuses-financier",
          "step": "st-formed",
          "state": 4
        },
        {
          "id": "statuses-financier/st-sent",
          "kind": "flow",
          "title": "\u041e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d \u0432 LP",
          "page": "FairValueCalculation.preview.html?id=15&role=FINANCIER",
          "href": "postrade/post-reports-app/pages/FairValueCalculation.preview.html?id=15&role=FINANCIER#pp=05",
          "note": "\u0412 \u043c\u0435\u043d\u044e \u00ab\u041e\u0431\u043d\u043e\u0432\u0438\u0442\u044c\u00bb, \u00ab\u0412\u044b\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0432 XML\u00bb, \u00ab\u0412\u044b\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0432 xlsx\u00bb.",
          "flow": "statuses-financier",
          "step": "st-sent",
          "state": 5
        },
        {
          "id": "statuses-financier/st-calculating",
          "kind": "flow",
          "title": "\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u044b\u0432\u0430\u0435\u0442\u0441\u044f LP",
          "page": "FairValueCalculation.preview.html?id=14&role=FINANCIER",
          "href": "postrade/post-reports-app/pages/FairValueCalculation.preview.html?id=14&role=FINANCIER#pp=06",
          "note": null,
          "flow": "statuses-financier",
          "step": "st-calculating",
          "state": 6
        },
        {
          "id": "statuses-financier/st-calculated",
          "kind": "flow",
          "title": "\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043d",
          "page": "FairValueCalculation.preview.html?id=13&role=FINANCIER",
          "href": "postrade/post-reports-app/pages/FairValueCalculation.preview.html?id=13&role=FINANCIER#pp=07",
          "note": "\u0423 \u0444\u0438\u043d\u0430\u043d\u0441\u0438\u0441\u0442\u0430 \u043d\u0435\u0442 \u043a\u043d\u043e\u043f\u043a\u0438 \u00ab\u0423\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c\u00bb; \u043f\u043e\u0432\u0442\u043e\u0440\u043d\u0430\u044f \u043e\u0442\u043f\u0440\u0430\u0432\u043a\u0430 \u0432 LP \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043d\u0430.",
          "flow": "statuses-financier",
          "step": "st-calculated",
          "state": 7
        },
        {
          "id": "statuses-financier/st-error",
          "kind": "flow",
          "title": "\u041e\u0448\u0438\u0431\u043a\u0430",
          "page": "FairValueCalculation.preview.html?id=11&role=FINANCIER",
          "href": "postrade/post-reports-app/pages/FairValueCalculation.preview.html?id=11&role=FINANCIER#pp=08",
          "note": "\u041a\u043d\u043e\u043f\u043a\u0438 \u00ab\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0432 LP\u00bb \u043d\u0435\u0442 \u2014 \u0441\u043d\u0430\u0447\u0430\u043b\u0430 \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c\u00bb.",
          "flow": "statuses-financier",
          "step": "st-error",
          "state": 8
        },
        {
          "id": "statuses-financier/st-approved",
          "kind": "flow",
          "title": "\u0423\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d",
          "page": "FairValueCalculation.preview.html?id=12&role=FINANCIER",
          "href": "postrade/post-reports-app/pages/FairValueCalculation.preview.html?id=12&role=FINANCIER#pp=09",
          "note": null,
          "flow": "statuses-financier",
          "step": "st-approved",
          "state": 9
        }
      ]
    }
  ]
};
