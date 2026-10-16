/* СГЕНЕРИРОВАН из flows.yaml и comments.md — руками не править.
   Пересобрать: node .agents/tools/proto-panel.mjs */
window.ProtoPanelData = {
  "format": 1,
  "app": {
    "id": "early-interest",
    "title": "Post \u2014 \u0414\u043e\u0441\u0440\u043e\u0447\u043d\u044b\u0435 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u044b"
  },
  "sources": {
    "flows": "4fa5ca4c",
    "comments": "e533f5f9"
  },
  "flowsHeader": [
    "# \u0421\u0446\u0435\u043d\u0430\u0440\u0438\u0438 \u043f\u043e\u043a\u0430\u0437\u0430 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430 Post \u2014 \u0414\u043e\u0441\u0440\u043e\u0447\u043d\u044b\u0435 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u044b \u2014 \u043f\u0430\u043d\u0435\u043b\u044c \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430.",
    "# \u0424\u043e\u0440\u043c\u0430\u0442 \u2014 .agents/proto-panel/README.md, \u0440\u0430\u0437\u0434\u0435\u043b \u00abflows.yaml\u00bb.",
    "# \u041f\u043e\u0441\u043b\u0435 \u043f\u0440\u0430\u0432\u043a\u0438: node .agents/tools/proto-panel.mjs (\u043f\u0435\u0440\u0435\u0441\u043e\u0431\u0440\u0430\u0442\u044c \u0437\u0435\u0440\u043a\u0430\u043b\u043e)."
  ],
  "lastState": 17,
  "flows": [
    {
      "id": "main",
      "title": "\u041e\u0441\u043d\u043e\u0432\u043d\u043e\u0439 \u043f\u0443\u0442\u044c",
      "desc": null,
      "steps": [
        {
          "state": 1,
          "id": "start",
          "title": "\u0421\u0442\u0430\u0440\u0442\u043e\u0432\u0430\u044f \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u2014 \u0442\u0440\u0430\u043d\u0448",
          "page": "Tranche.preview.html",
          "note": null,
          "recorded": null,
          "issues": [],
          "do": []
        }
      ]
    },
    {
      "id": "ei-tile",
      "title": "\u041a\u0430\u0440\u0442\u043e\u0447\u043a\u0430 \u00ab\u0414\u043e\u0441\u0440\u043e\u0447\u043d\u044b\u0435 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u044b\u00bb \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435 \u0442\u0440\u0430\u043d\u0448\u0430",
      "desc": "\u0422\u0440\u0438 \u0432\u0438\u0434\u0430 \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0438 \u043f\u043e \u0442\u0440\u0435\u0431\u043e\u0432\u0430\u043d\u0438\u044e, \u0440\u0435\u0436\u0438\u043c \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0430 \u0438 \u043f\u043e\u043c\u0435\u0442\u043a\u0438 \u043e \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0435 \u043d\u0430 \u00ab\u041f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0445\u00bb \u0438 \u00ab\u041f\u043b\u0430\u043d\u043e\u0432\u044b\u0445 \u043f\u043b\u0430\u0442\u0435\u0436\u0430\u0445\u00bb",
      "steps": [
        {
          "state": 2,
          "id": "ei-tile-locked",
          "title": "\u041d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430 \u043a \u0437\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u044e",
          "page": "Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1&eiState=locked",
          "note": "\u041f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0435 \u043f\u043b\u0430\u0442\u0435\u0436\u0438 \u043d\u0435 \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043d\u044b \u2014 \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0430 \u0431\u0435\u0437 \u0441\u0442\u0440\u0435\u043b\u043a\u0438 \u0438 \u043a\u043d\u043e\u043f\u043a\u0438; \u0443 \u00ab\u041f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0445 \u043f\u043b\u0430\u0442\u0435\u0436\u0435\u0439\u00bb \u2014 \u00ab\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0442\u044c\u00bb.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 3,
          "id": "ei-tile-calc",
          "title": "\u041f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0435 \u043f\u043b\u0430\u0442\u0435\u0436\u0438 \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043d\u044b",
          "page": "Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1&eiState=locked",
          "note": "\u00ab\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0442\u044c\u00bb \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0443 \u2014 \u043e\u043d\u0430 \u0441\u0442\u0430\u043d\u043e\u0432\u0438\u0442\u0441\u044f \u00ab\u041d\u0435 \u0437\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u0430\u00bb.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#tr-interest-calc",
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
            }
          ]
        },
        {
          "state": 4,
          "id": "ei-tile-none",
          "title": "\u041d\u0435 \u0437\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u0430",
          "page": "Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1&eiState=none",
          "note": "\u0421\u0442\u0440\u0435\u043b\u043a\u0430 \u2014 \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u00ab\u0414\u043e\u0441\u0440\u043e\u0447\u043d\u044b\u0435 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u044b\u00bb, \u00ab\u0417\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u044c\u00bb \u2014 \u0442\u0443\u0434\u0430 \u0436\u0435 \u0441 \u043f\u043e\u0434\u043d\u044f\u0442\u044b\u043c \u043e\u043a\u043d\u043e\u043c \u00ab\u041d\u043e\u0432\u044b\u0435 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u044b\u00bb.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 5,
          "id": "ei-tile-filled",
          "title": "\u0417\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u0430",
          "page": "Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1&eiState=filled",
          "note": "\u0421\u0432\u043e\u0434\u043a\u0430 \u2014 \u0447\u0438\u0441\u043b\u043e \u043f\u043b\u0430\u0442\u0435\u0436\u0435\u0439, \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0439 \u043f\u043b\u0430\u0442\u0451\u0436 \u0438 \u043e\u0431\u0449\u0430\u044f \u0441\u0443\u043c\u043c\u0430 \u0432 \u0432\u0430\u043b\u044e\u0442\u0435 \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u0430.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 6,
          "id": "ei-tile-view",
          "title": "\u0422\u043e\u043b\u044c\u043a\u043e \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440",
          "page": "Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1&eiState=none&mode=view",
          "note": "\u0411\u0435\u0437 \u043f\u0440\u0430\u0432\u0430 \u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f \u00ab\u0417\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u044c\u00bb \u043d\u0435\u0442, \u0441\u0442\u0440\u0435\u043b\u043a\u0430 \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u043e\u0441\u0442\u0430\u0451\u0442\u0441\u044f.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 7,
          "id": "ei-tile-recalc",
          "title": "\u041d\u0443\u0436\u0435\u043d \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442",
          "page": "Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1&eiState=filled&recalc=1",
          "note": "\u0414\u043e\u0441\u0440\u043e\u0447\u043d\u044b\u0435 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u044b \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u044b \u2014 \u043f\u043e\u043c\u0435\u0442\u043a\u0438 Note \u043d\u0430 \u00ab\u041f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0445\u00bb \u0438 \u00ab\u041f\u043b\u0430\u043d\u043e\u0432\u044b\u0445 \u043f\u043b\u0430\u0442\u0435\u0436\u0430\u0445\u00bb; \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c\u00bb \u0438\u0445 \u0441\u043d\u0438\u043c\u0430\u0435\u0442.",
          "recorded": null,
          "issues": [],
          "do": []
        }
      ]
    },
    {
      "id": "ei-page",
      "title": "\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u00ab\u0414\u043e\u0441\u0440\u043e\u0447\u043d\u044b\u0435 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u044b\u00bb",
      "desc": "\u0422\u0430\u0431\u043b\u0438\u0446\u0430 \u0434\u043e\u0441\u0440\u043e\u0447\u043d\u044b\u0445 \u043f\u043b\u0430\u0442\u0435\u0436\u0435\u0439, \u043e\u043a\u043d\u043e \u00ab\u041d\u043e\u0432\u044b\u0435 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u044b\u00bb, \u043f\u0440\u0430\u0432\u043a\u0430, \u0443\u0434\u0430\u043b\u0435\u043d\u0438\u0435, \u0440\u0435\u0436\u0438\u043c \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0430",
      "steps": [
        {
          "state": 8,
          "id": "ei-page-empty",
          "title": "\u041f\u043b\u0430\u0442\u0435\u0436\u0435\u0439 \u043d\u0435\u0442",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1",
          "note": "\u041f\u0443\u0441\u0442\u0430\u044f \u0442\u0430\u0431\u043b\u0438\u0446\u0430 \u0441 \u043a\u043d\u043e\u043f\u043a\u043e\u0439 \u00ab\u041d\u043e\u0432\u044b\u0435 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u044b\u00bb; \u043d\u0430\u0434 \u043d\u0435\u0439 \u2014 \u043f\u0435\u0440\u0432\u044b\u0435 \u0442\u0440\u0438 \u0442\u0438\u043f\u0430 \u043f\u043e\u0440\u044f\u0434\u043a\u0430 \u043f\u043e\u0433\u0430\u0448\u0435\u043d\u0438\u044f.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 9,
          "id": "ei-page-add",
          "title": "\u041d\u043e\u0432\u044b\u0435 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u044b",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&open=add",
          "note": "\u0422\u0430\u043a \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u0441 \u043a\u043d\u043e\u043f\u043a\u0438 \u00ab\u0417\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u044c\u00bb \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0438. \u0414\u0430\u0442\u0430 \u2014 \u0438\u0437 \u0434\u0430\u0442 \u043f\u043e\u0433\u0430\u0448\u0435\u043d\u0438\u044f \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043e\u0432, \u0442\u0438\u043f \u043f\u043b\u0430\u0442\u0435\u0436\u0430 \u043d\u0435 \u043c\u0435\u043d\u044f\u0435\u0442\u0441\u044f.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "waitFor",
              "target": "#ei-pay-scrim:not([hidden])",
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
        },
        {
          "state": 10,
          "id": "ei-page-error",
          "title": "\u041e\u0448\u0438\u0431\u043a\u0430 \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0438",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=error",
          "note": "\u0411\u0435\u0437 \u0434\u0430\u0442\u044b \u0438 \u0441\u0443\u043c\u043c\u044b \u043e\u043a\u043d\u043e \u043d\u0435 \u0441\u043e\u0445\u0440\u0430\u043d\u044f\u0435\u0442\u0441\u044f \u2014 Alert \u0432\u0432\u0435\u0440\u0445\u0443 \u0438 \u043f\u043e\u0434\u0441\u0432\u0435\u0447\u0435\u043d\u043d\u044b\u0435 \u043f\u043e\u043b\u044f.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "waitFor",
              "target": "#ei-pay-scrim:not([hidden])",
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
        },
        {
          "state": 11,
          "id": "ei-page-filled",
          "title": "\u041f\u043b\u0430\u0442\u0435\u0436\u0438 \u0432\u043d\u0435\u0441\u0435\u043d\u044b",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=filled",
          "note": "\u0428\u0435\u0441\u0442\u044c \u043f\u043b\u0430\u0442\u0435\u0436\u0435\u0439, \u0434\u0432\u0430 \u0438\u0437 \u043d\u0438\u0445 \u2014 \u043d\u0430 \u043e\u0434\u043d\u0443 \u0434\u0430\u0442\u0443; \u0441\u043e\u0440\u0442\u0438\u0440\u043e\u0432\u043a\u0430 \u043f\u043e \u0434\u0430\u0442\u0435 \u0438 \u0441\u0443\u043c\u043c\u0435.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 12,
          "id": "ei-page-edit",
          "title": "\u041f\u0440\u0430\u0432\u043a\u0430 \u043f\u043b\u0430\u0442\u0435\u0436\u0430",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=edit",
          "note": "\u041f\u0440\u0430\u0432\u043a\u0430 \u2014 \u043a\u0430\u0440\u0430\u043d\u0434\u0430\u0448\u043e\u043c \u0432 \u043a\u043e\u043b\u043e\u043d\u043a\u0435 \u00ab\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044f\u00bb \u0438\u043b\u0438 \u0434\u0432\u043e\u0439\u043d\u044b\u043c \u043a\u043b\u0438\u043a\u043e\u043c \u043f\u043e \u0441\u0442\u0440\u043e\u043a\u0435.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "waitFor",
              "target": "#ei-pay-scrim:not([hidden])",
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
        },
        {
          "state": 13,
          "id": "ei-page-delete",
          "title": "\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u0435 \u0443\u0434\u0430\u043b\u0435\u043d\u0438\u044f",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=delete",
          "note": "\u0423\u0434\u0430\u043b\u0435\u043d\u0438\u0435 \u2014 \u043a\u043e\u0440\u0437\u0438\u043d\u0430 \u0432 \u0441\u0442\u0440\u043e\u043a\u0435 \u0438 \u043e\u043a\u043d\u043e \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u044f \u0441 \u0434\u0430\u0442\u043e\u0439 \u0438 \u0441\u0443\u043c\u043c\u043e\u0439.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "waitFor",
              "target": "#ei-delete-scrim:not([hidden])",
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
        },
        {
          "state": 14,
          "id": "ei-page-view",
          "title": "\u0422\u043e\u043b\u044c\u043a\u043e \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=filled&mode=view",
          "note": "\u0411\u0435\u0437 \u043f\u0440\u0430\u0432\u0430 \u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f \u043d\u0435\u0442 \u00ab\u041d\u043e\u0432\u044b\u0435 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u044b\u00bb \u0438 \u043a\u043e\u043b\u043e\u043d\u043a\u0438 \u00ab\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044f\u00bb; \u043f\u043e\u0440\u044f\u0434\u043e\u043a \u043f\u043e\u0433\u0430\u0448\u0435\u043d\u0438\u044f \u2014 \u00ab\u041f\u043e\u0441\u043c\u043e\u0442\u0440\u0435\u0442\u044c\u00bb.",
          "recorded": null,
          "issues": [],
          "do": []
        }
      ]
    },
    {
      "id": "repay-order",
      "title": "\u041f\u043e\u0440\u044f\u0434\u043e\u043a \u043f\u043e\u0433\u0430\u0448\u0435\u043d\u0438\u044f",
      "desc": "\u041e\u043a\u043d\u043e \u0441 \u043f\u0435\u0440\u0435\u0441\u0442\u0430\u043d\u043e\u0432\u043a\u043e\u0439 \u0441\u0442\u0440\u0435\u043b\u043a\u0430\u043c\u0438 \u0438 \u043e\u043a\u043d\u043e \u043d\u0430 \u0447\u0442\u0435\u043d\u0438\u0435",
      "steps": [
        {
          "state": 15,
          "id": "repay-order-open",
          "title": "\u041e\u043a\u043d\u043e \u00ab\u041f\u043e\u0440\u044f\u0434\u043e\u043a \u043f\u043e\u0433\u0430\u0448\u0435\u043d\u0438\u044f\u00bb",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=filled,order",
          "note": "\u0412\u0441\u0435 \u0442\u0438\u043f\u044b \u0437\u0430\u0434\u043e\u043b\u0436\u0435\u043d\u043d\u043e\u0441\u0442\u0438, \u043f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442 1 \u0441\u0432\u0435\u0440\u0445\u0443; \u0441\u0442\u0440\u0435\u043b\u043a\u0438 \u0434\u0432\u0438\u0433\u0430\u044e\u0442 \u0442\u0438\u043f \u043d\u0430 \u043e\u0434\u043d\u043e \u043c\u0435\u0441\u0442\u043e.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "waitFor",
              "target": "#repay-order-scrim:not([hidden])",
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
        },
        {
          "state": 16,
          "id": "repay-order-move",
          "title": "\u0422\u0438\u043f \u043e\u043f\u0443\u0449\u0435\u043d \u043d\u0438\u0436\u0435",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=filled,order",
          "note": "\u041f\u0435\u0440\u0432\u044b\u0439 \u0442\u0438\u043f \u0441\u0442\u0430\u043b \u0432\u0442\u043e\u0440\u044b\u043c, \u043d\u043e\u043c\u0435\u0440\u0430 \u043f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u043b\u0438\u0441\u044c; \u00ab\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c\u00bb \u043e\u0431\u043d\u043e\u0432\u0438\u0442 \u0442\u0430\u0439\u043b \u043d\u0430\u0434 \u0442\u0430\u0431\u043b\u0438\u0446\u0435\u0439.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "waitFor",
              "target": "#repay-order-scrim:not([hidden])",
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
            },
            {
              "verb": "click",
              "target": "[data-move=\"down\"]",
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
            }
          ]
        },
        {
          "state": 17,
          "id": "repay-order-view",
          "title": "\u041f\u043e\u0440\u044f\u0434\u043e\u043a \u043d\u0430 \u0447\u0442\u0435\u043d\u0438\u0435",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=filled,order&mode=view",
          "note": "\u0420\u043e\u043b\u044c \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0430 \u0432\u0438\u0434\u0438\u0442 \u043f\u043e\u0440\u044f\u0434\u043e\u043a \u0431\u0435\u0437 \u0441\u0442\u0440\u0435\u043b\u043e\u043a, \u0432 \u043f\u043e\u0434\u0432\u0430\u043b\u0435 \u0442\u043e\u043b\u044c\u043a\u043e \u00ab\u0417\u0430\u043a\u0440\u044b\u0442\u044c\u00bb.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "waitFor",
              "target": "#repay-order-scrim:not([hidden])",
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
    }
  ],
  "flowErrors": [],
  "comments": [],
  "commentsPreamble": "# \u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438 \u043a \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0443\n\n\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438 \u043f\u0438\u0448\u0435\u0442 \u043f\u0430\u043d\u0435\u043b\u044c \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430 (Alt+Shift+P \u043d\u0430 \u043b\u044e\u0431\u043e\u0439 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430)\n\u0438 \u043f\u0440\u0430\u0432\u0438\u0442 \u0430\u0433\u0435\u043d\u0442. \u0424\u043e\u0440\u043c\u0430\u0442 \u2014 `.agents/proto-panel/README.md`, \u0440\u0430\u0437\u0434\u0435\u043b \u00abcomments.md\u00bb.",
  "commentErrors": []
};
