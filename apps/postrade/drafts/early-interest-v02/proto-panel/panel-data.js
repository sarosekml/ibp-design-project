/* СГЕНЕРИРОВАН из flows.yaml и comments.md — руками не править.
   Пересобрать: node .agents/tools/proto-panel.mjs */
window.ProtoPanelData = {
  "format": 1,
  "app": {
    "id": "early-interest-v02",
    "title": "Post \u2014 \u0414\u043e\u0441\u0440\u043e\u0447\u043d\u043e\u0435 \u043f\u043e\u0433\u0430\u0448\u0435\u043d\u0438\u0435 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043e\u0432 v2"
  },
  "sources": {
    "flows": "a03d4345",
    "comments": "633b4386"
  },
  "flowsHeader": [
    "# \u0421\u0446\u0435\u043d\u0430\u0440\u0438\u0438 \u043f\u043e\u043a\u0430\u0437\u0430 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430 Post \u2014 \u0414\u043e\u0441\u0440\u043e\u0447\u043d\u043e\u0435 \u043f\u043e\u0433\u0430\u0448\u0435\u043d\u0438\u0435 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043e\u0432 v2 \u2014 \u043f\u0430\u043d\u0435\u043b\u044c \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430.",
    "# \u0424\u043e\u0440\u043c\u0430\u0442 \u2014 .agents/proto-panel/README.md, \u0440\u0430\u0437\u0434\u0435\u043b \u00abflows.yaml\u00bb.",
    "# \u041f\u043e\u0441\u043b\u0435 \u043f\u0440\u0430\u0432\u043a\u0438: node .agents/tools/proto-panel.mjs (\u043f\u0435\u0440\u0435\u0441\u043e\u0431\u0440\u0430\u0442\u044c \u0437\u0435\u0440\u043a\u0430\u043b\u043e)."
  ],
  "lastState": 31,
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
      "title": "\u0422\u0430\u0439\u043b \u00ab\u0414\u043e\u0441\u0440\u043e\u0447\u043d\u043e\u0435 \u043f\u043e\u0433\u0430\u0448\u0435\u043d\u0438\u0435 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043e\u0432\u00bb \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435 \u0442\u0440\u0430\u043d\u0448\u0430",
      "desc": "\u041f\u044f\u0442\u044c \u0432\u0438\u0434\u043e\u0432 \u043b\u0438\u0441\u0442\u0430 \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0439 \u2014 \u0443\u0441\u043b\u043e\u0432\u0438\u0435, \u0434\u0430\u043d\u043d\u044b\u0435, \u043f\u0440\u0430\u0432\u0430 \u2014 \u0438 \u043f\u043e\u043c\u0435\u0442\u043a\u0438 \u043e \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0435",
      "steps": [
        {
          "state": 2,
          "id": "ei-tile-locked",
          "title": "\u041d\u0435\u0442 \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043d\u043d\u044b\u0445 \u043f\u043b\u0430\u0442\u0435\u0436\u0435\u0439",
          "page": "Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1&eiState=locked",
          "note": "\u00ab\u0414\u043b\u044f \u0432\u043d\u0435\u0441\u0435\u043d\u0438\u044f \u0434\u043e\u0441\u0440\u043e\u0447\u043d\u044b\u0445 \u043f\u043b\u0430\u0442\u0435\u0436\u0435\u0439 \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0439\u0442\u0435 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0435 \u043f\u043b\u0430\u0442\u0435\u0436\u0438\u00bb \u2014 \u0431\u0435\u0437 \u0441\u0442\u0440\u0435\u043b\u043a\u0438 \u0438 \u043a\u043d\u043e\u043f\u043a\u0438; \u0443 \u00ab\u041f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0445 \u043f\u043b\u0430\u0442\u0435\u0436\u0435\u0439\u00bb \u2014 \u00ab\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0442\u044c\u00bb.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 3,
          "id": "ei-tile-none-edit",
          "title": "\u041d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445, \u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e",
          "page": "Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1&eiState=none",
          "note": "\u0421\u0442\u0440\u0435\u043b\u043a\u0430 \u0432 \u0448\u0430\u043f\u043a\u0435 \u0432\u0435\u0434\u0451\u0442 \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443, \u00ab\u041d\u043e\u0432\u044b\u0439 \u043f\u043b\u0430\u0442\u0435\u0436 \u2192\u00bb \u2014 \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u0441 \u043f\u043e\u0434\u043d\u044f\u0442\u044b\u043c \u043e\u043a\u043d\u043e\u043c \u043d\u043e\u0432\u043e\u0433\u043e \u043f\u043b\u0430\u0442\u0435\u0436\u0430.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 4,
          "id": "ei-tile-none-view",
          "title": "\u041d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445, \u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e",
          "page": "Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1&eiState=none&mode=view",
          "note": "\u0411\u0435\u0437 \u043f\u0440\u0430\u0432\u0430 \u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f \u0438 \u0431\u0435\u0437 \u0434\u0430\u043d\u043d\u044b\u0445 \u043d\u0435\u0442 \u043d\u0438 \u043a\u043d\u043e\u043f\u043a\u0438, \u043d\u0438 \u0441\u0442\u0440\u0435\u043b\u043a\u0438.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 5,
          "id": "ei-tile-data-edit",
          "title": "\u0415\u0441\u0442\u044c \u0434\u0430\u043d\u043d\u044b\u0435, \u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e",
          "page": "Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1&eiState=filled",
          "note": "\u0421\u0432\u043e\u0434\u043a\u0430 \u043f\u043e \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u0430\u043d\u043d\u044b\u043c \u043f\u043b\u0430\u0442\u0435\u0436\u0430\u043c \u2014 \u0447\u0438\u0441\u043b\u043e, \u043e\u0431\u0449\u0430\u044f \u0441\u0443\u043c\u043c\u0430, \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0439 \u043f\u043b\u0430\u0442\u0451\u0436 \u0438 \u0435\u0433\u043e \u0441\u0443\u043c\u043c\u0430; \u043f\u043b\u0430\u0442\u0435\u0436\u0438 \u00ab\u0412 \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u043a\u0435\u00bb \u0438 \u00ab\u041d\u0435 \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u0430\u043d\u00bb \u0432 \u0441\u0447\u0451\u0442 \u043d\u0435 \u0438\u0434\u0443\u0442.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 6,
          "id": "ei-tile-data-view",
          "title": "\u0415\u0441\u0442\u044c \u0434\u0430\u043d\u043d\u044b\u0435, \u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435 \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e",
          "page": "Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1&eiState=filled&mode=view",
          "note": "\u0421\u0432\u043e\u0434\u043a\u0430 \u0438 \u0441\u0442\u0440\u0435\u043b\u043a\u0430 \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443; \u043a\u043d\u043e\u043f\u043a\u0438 \u00ab\u041d\u043e\u0432\u044b\u0439 \u043f\u043b\u0430\u0442\u0435\u0436\u00bb \u043d\u0435\u0442.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 7,
          "id": "ei-tile-calc",
          "title": "\u041f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0435 \u043f\u043b\u0430\u0442\u0435\u0436\u0438 \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043d\u044b",
          "page": "Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1&eiState=locked",
          "note": "\u00ab\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0442\u044c\u00bb \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u0442\u0430\u0439\u043b \u2014 \u043e\u043d \u0441\u0442\u0430\u043d\u043e\u0432\u0438\u0442\u0441\u044f \u00ab\u041d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445\u00bb.",
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
          "state": 8,
          "id": "ei-tile-recalc",
          "title": "\u041d\u0443\u0436\u0435\u043d \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442",
          "page": "Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1&eiState=filled&recalc=1",
          "note": "\u041f\u041e\u0414 \u0412\u041e\u041f\u0420\u041e\u0421\u041e\u041c (\u043a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0439 \u041a-1): \u0430\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0438 \u0445\u043e\u0442\u044f\u0442 \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0438\u0439 \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442 \u043f\u043e\u0441\u043b\u0435 \u00ab\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c\u00bb / \u00ab\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c\u00bb \u2014 \u0442\u043e\u0433\u0434\u0430 \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435 \u0438 \u043f\u043e\u043c\u0435\u0442\u043a\u0438 \u043d\u0435 \u043d\u0443\u0436\u043d\u044b. \u0421\u0435\u0439\u0447\u0430\u0441: \u0434\u043e\u0441\u0440\u043e\u0447\u043d\u043e\u0435 \u043f\u043e\u0433\u0430\u0448\u0435\u043d\u0438\u0435 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u043e \u2014 \u043f\u043e\u043c\u0435\u0442\u043a\u0438 Note \u043d\u0430 \u00ab\u041f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0445\u00bb \u0438 \u00ab\u041f\u043b\u0430\u043d\u043e\u0432\u044b\u0445 \u043f\u043b\u0430\u0442\u0435\u0436\u0430\u0445\u00bb; \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c\u00bb \u0438\u0445 \u0441\u043d\u0438\u043c\u0430\u0435\u0442.",
          "recorded": null,
          "issues": [],
          "do": []
        }
      ]
    },
    {
      "id": "ei-page",
      "title": "\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u00ab\u0414\u043e\u0441\u0440\u043e\u0447\u043d\u043e\u0435 \u043f\u043e\u0433\u0430\u0448\u0435\u043d\u0438\u0435 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043e\u0432\u00bb",
      "desc": "\u0422\u0430\u0431\u043b\u0438\u0446\u0430 \u043f\u043b\u0430\u0442\u0435\u0436\u0435\u0439 \u0441\u043e \u0441\u0442\u0430\u0442\u0443\u0441\u0430\u043c\u0438, \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044f, \u0440\u0435\u0436\u0438\u043c \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0430 \u0438 \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u043a\u0430 \u043f\u043b\u0430\u0442\u0435\u0436\u0430",
      "steps": [
        {
          "state": 9,
          "id": "ei-page-empty",
          "title": "\u041f\u043b\u0430\u0442\u0435\u0436\u0435\u0439 \u043d\u0435\u0442",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1",
          "note": "\u0428\u0430\u043f\u043a\u0430 \u0442\u0430\u0431\u043b\u0438\u0446\u044b \u0438 \u00ab\u041d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445\u00bb; \u0441\u043f\u0440\u0430\u0432\u0430 \u2014 \u043f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442 \u043f\u043e\u0433\u0430\u0448\u0435\u043d\u0438\u044f.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 10,
          "id": "ei-page-filled",
          "title": "\u041f\u043b\u0430\u0442\u0435\u0436\u0438 \u0441\u043e \u0441\u0442\u0430\u0442\u0443\u0441\u0430\u043c\u0438",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=filled",
          "note": "\u00ab\u0412 \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u043a\u0435\u00bb, \u00ab\u041e\u0431\u0440\u0430\u0431\u043e\u0442\u0430\u043d\u00bb, \u00ab\u041d\u0435 \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u0430\u043d\u00bb; \u0443 \u00ab\u0412 \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u043a\u0435\u00bb \u043a\u0430\u0440\u0430\u043d\u0434\u0430\u0448 \u0438 \u043a\u043e\u0440\u0437\u0438\u043d\u0430 \u0432\u044b\u043a\u043b\u044e\u0447\u0435\u043d\u044b.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 11,
          "id": "ei-page-view",
          "title": "\u0422\u043e\u043b\u044c\u043a\u043e \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=filled&mode=view",
          "note": "\u0411\u0435\u0437 \u00ab\u041d\u043e\u0432\u044b\u0439 \u043f\u043b\u0430\u0442\u0435\u0436\u00bb, \u043a\u043e\u043b\u043e\u043d\u043a\u0438 \u00ab\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044f\u00bb \u0438 \u043a\u0430\u0440\u0430\u043d\u0434\u0430\u0448\u0430 \u043f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442\u0430.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 12,
          "id": "ei-page-edit",
          "title": "\u0418\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0435 \u043f\u043b\u0430\u0442\u0435\u0436\u0430",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=edit",
          "note": "\u041a\u0430\u0440\u0430\u043d\u0434\u0430\u0448\u043e\u043c \u0432 \u043a\u043e\u043b\u043e\u043d\u043a\u0435 \u00ab\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044f\u00bb \u0438\u043b\u0438 \u0434\u0432\u043e\u0439\u043d\u044b\u043c \u043a\u043b\u0438\u043a\u043e\u043c; \u043f\u043e\u0441\u043b\u0435 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u044f \u043f\u043b\u0430\u0442\u0451\u0436 \u0441\u043d\u043e\u0432\u0430 \u00ab\u0412 \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u043a\u0435\u00bb.",
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
          "note": "\u041f\u043e\u0441\u043b\u0435 \u00ab\u0423\u0434\u0430\u043b\u0438\u0442\u044c\u00bb \u2014 \u0442\u043e\u0441\u0442 \u00ab\u041f\u043b\u0430\u0442\u0435\u0436 \u0443\u0434\u0430\u043b\u0435\u043d. \u041f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0435 \u0438 \u043f\u043b\u0430\u043d\u043e\u0432\u044b\u0435 \u043f\u043b\u0430\u0442\u0435\u0436\u0438 \u0431\u0443\u0434\u0443\u0442 \u043f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u043d\u044b\u00bb.",
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
          "id": "ei-page-process-ok",
          "title": "\u041f\u043b\u0430\u0442\u0451\u0436 \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u0430\u043d",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&open=add",
          "note": "\u00ab\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c\u00bb \u2014 \u00ab\u0412 \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u043a\u0435\u00bb \u0438 \u0442\u043e\u0441\u0442; \u0447\u0435\u0440\u0435\u0437 3 \u0441\u0435\u043a\u0443\u043d\u0434\u044b \u00ab\u041e\u0431\u0440\u0430\u0431\u043e\u0442\u0430\u043d\u00bb \u0438 \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0435 \u043e\u0431 \u0443\u0441\u043f\u0435\u0445\u0435.",
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
            },
            {
              "verb": "fill",
              "target": "#ei-pay-date",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "31.03.2025",
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
              "verb": "fill",
              "target": "#ei-pay-amt",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "100000",
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
              "verb": "click",
              "target": "[data-ei-calc]",
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
              "verb": "click",
              "target": "[data-ei-submit]",
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
          "state": 15,
          "id": "ei-page-process-fail",
          "title": "\u041f\u043b\u0430\u0442\u0451\u0436 \u043d\u0435 \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u0430\u043d",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&open=add&outcome=fail",
          "note": "\u0422\u043e\u0442 \u0436\u0435 \u043f\u0443\u0442\u044c, \u043d\u043e \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u043a\u0430 \u0437\u0430\u043a\u0430\u043d\u0447\u0438\u0432\u0430\u0435\u0442\u0441\u044f \u00ab\u041d\u0435 \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u0430\u043d\u00bb \u0438 \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0435\u043c \u043e\u0431 \u043e\u0448\u0438\u0431\u043a\u0435.",
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
            },
            {
              "verb": "fill",
              "target": "#ei-pay-date",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "31.03.2025",
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
              "verb": "fill",
              "target": "#ei-pay-amt",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "100000",
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
              "verb": "click",
              "target": "[data-ei-calc]",
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
              "verb": "click",
              "target": "[data-ei-submit]",
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
        }
      ]
    },
    {
      "id": "ei-modal",
      "title": "\u041e\u043a\u043d\u043e \u00ab\u041d\u043e\u0432\u044b\u0439 \u043f\u043b\u0430\u0442\u0435\u0436\u00bb",
      "desc": "\u0420\u0430\u0441\u0447\u0451\u0442 \u0437\u0430\u0434\u043e\u043b\u0436\u0435\u043d\u043d\u043e\u0441\u0442\u0438 \u043d\u0430 \u0434\u0430\u0442\u0443, \u0440\u0443\u0447\u043d\u0430\u044f \u043f\u0440\u0430\u0432\u043a\u0430 \u0438 \u0432\u0441\u0435 \u043e\u0448\u0438\u0431\u043a\u0438 \u043c\u0430\u043a\u0435\u0442\u0430 \u0438 \u0440\u0435\u0448\u0435\u043d\u0438\u0439 \u0447\u0435\u043b\u043e\u0432\u0435\u043a\u0430",
      "steps": [
        {
          "state": 16,
          "id": "ei-modal-empty",
          "title": "\u041f\u0443\u0441\u0442\u043e\u0435 \u043e\u043a\u043d\u043e",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=pay-empty",
          "note": "\u00ab\u041d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445\u00bb \u0432 \u0442\u0430\u0431\u043b\u0438\u0446\u0435 \u00ab\u0417\u0430\u0434\u043e\u043b\u0436\u0435\u043d\u043d\u043e\u0441\u0442\u044c \u043d\u0430 \u0434\u0430\u0442\u0443\u00bb.",
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
          "state": 17,
          "id": "ei-modal-validate",
          "title": "\u041d\u0435 \u0437\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u044b \u043f\u043e\u043b\u044f",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=pay-validate",
          "note": "\u00ab\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0442\u044c \u043f\u043b\u0430\u0442\u0435\u0436\u0438\u00bb \u0431\u0435\u0437 \u0434\u0430\u0442\u044b \u0438 \u0441\u0443\u043c\u043c\u044b \u2014 \u043a\u0440\u0430\u0441\u043d\u044b\u0435 \u0440\u0430\u043c\u043a\u0438 \u043f\u043e\u043b\u0435\u0439.",
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
          "state": 18,
          "id": "ei-modal-calc",
          "title": "\u041f\u043b\u0430\u0442\u0435\u0436\u0438 \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043d\u044b",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=pay-calc",
          "note": "\u0421\u0443\u043c\u043c\u0430 \u0433\u0430\u0441\u0438\u0442 \u0432\u0438\u0434\u044b \u043f\u043e \u043f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442\u0443 \u2014 \u043f\u0435\u0440\u0432\u044b\u0439 \u0446\u0435\u043b\u0438\u043a\u043e\u043c, \u043e\u0441\u0442\u0430\u0442\u043e\u043a \u0432\u043e \u0432\u0442\u043e\u0440\u043e\u0439.",
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
          "state": 19,
          "id": "ei-modal-manual",
          "title": "\u0420\u0443\u0447\u043d\u0430\u044f \u043f\u0440\u0430\u0432\u043a\u0430 \u0434\u043e\u0441\u0440\u043e\u0447\u043d\u043e\u0439 \u0441\u0443\u043c\u043c\u044b",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=pay-manual",
          "note": "\u041f\u043e\u043b\u0435 \u0432 \u043a\u0430\u0436\u0434\u043e\u0439 \u0441\u0442\u0440\u043e\u043a\u0435; \u043b\u044e\u0431\u0443\u044e \u0441\u0442\u0440\u043e\u043a\u0443, \u043d\u043e \u043d\u0435 \u0431\u043e\u043b\u044c\u0448\u0435 \u0435\u0451 \u043d\u0430\u0447\u0438\u0441\u043b\u0435\u043d\u043d\u043e\u0439 \u0441\u0443\u043c\u043c\u044b. \u00ab\u041e\u0431\u0449\u0430\u044f \u0434\u043e\u0441\u0440\u043e\u0447\u043d\u0430\u044f \u0441\u0443\u043c\u043c\u0430\u00bb \u043f\u043e\u0434 \u0442\u0430\u0431\u043b\u0438\u0446\u0435\u0439 \u043f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u043f\u043e\u0441\u043b\u0435 \u0443\u0445\u043e\u0434\u0430 \u0444\u043e\u043a\u0443\u0441\u0430 \u0441 \u043f\u043e\u043b\u044f.",
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
            },
            {
              "verb": "fill",
              "target": "[data-early-input][data-idx=\"1\"]",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "50000",
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
              "verb": "click",
              "target": "#ei-pay-title",
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
          "state": 20,
          "id": "ei-modal-nodebt",
          "title": "\u041d\u0435\u0442 \u043d\u0430\u0447\u0438\u0441\u043b\u0435\u043d\u0438\u0439 \u043d\u0430 \u0434\u0430\u0442\u0443",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=pay-err-nodebt",
          "note": "\u00ab\u041d\u0430 \u0443\u043a\u0430\u0437\u0430\u043d\u043d\u0443\u044e \u0434\u0430\u0442\u0443 \u043d\u0430\u0447\u0438\u0441\u043b\u0435\u043d\u0438\u044f \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u044e\u0442\u00bb \u2014 \u043e\u0448\u0438\u0431\u043a\u0430 \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u0442\u043e\u043b\u044c\u043a\u043e \u0432 \u0441\u0446\u0435\u043d\u0430\u0440\u0438\u0438 \u043f\u0430\u043d\u0435\u043b\u0438: \u043d\u0430 \u043e\u0431\u044b\u0447\u043d\u043e\u0439 \u0434\u0430\u0442\u0435 \u0440\u0430\u0441\u0447\u0451\u0442 \u043f\u0440\u043e\u0445\u043e\u0434\u0438\u0442.",
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
          "state": 21,
          "id": "ei-modal-excess",
          "title": "\u0421\u0443\u043c\u043c\u0430 \u0431\u043e\u043b\u044c\u0448\u0435 \u0437\u0430\u0434\u043e\u043b\u0436\u0435\u043d\u043d\u043e\u0441\u0442\u0438",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=pay-err-excess",
          "note": "\u00ab\u0421\u0443\u043c\u043c\u0430 \u043f\u043b\u0430\u0442\u0435\u0436\u0430 \u043f\u0440\u0435\u0432\u044b\u0448\u0430\u0435\u0442 \u043e\u0431\u0449\u0443\u044e \u0441\u0443\u043c\u043c\u0443 \u0437\u0430\u0434\u043e\u043b\u0436\u0435\u043d\u043d\u043e\u0441\u0442\u0438\u00bb; \u0442\u0430\u0431\u043b\u0438\u0446\u0430 \u0437\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u0430 \u043d\u0430\u0447\u0438\u0441\u043b\u0435\u043d\u043d\u044b\u043c\u0438 \u0441\u0443\u043c\u043c\u0430\u043c\u0438.",
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
          "state": 22,
          "id": "ei-modal-notcalc",
          "title": "\u041f\u043b\u0430\u0442\u0435\u0436\u0438 \u043d\u0435 \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043d\u044b",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=pay-err-notcalc",
          "note": "\u00ab\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c\u00bb \u0431\u0435\u0437 \u0440\u0430\u0441\u0447\u0451\u0442\u0430 \u2014 \u00ab\u041d\u0435 \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043d\u044b \u043f\u043b\u0430\u0442\u0435\u0436\u0438\u00bb.",
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
          "state": 23,
          "id": "ei-modal-partial",
          "title": "\u0420\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0430 \u043d\u0435 \u043f\u043e\u043b\u043d\u043e\u0441\u0442\u044c\u044e",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=pay-err-partial",
          "note": "\u0421\u0443\u043c\u043c\u0430 \u0441\u0442\u0440\u043e\u043a \u043c\u0435\u043d\u044c\u0448\u0435 \u0441\u0443\u043c\u043c\u044b \u043f\u043b\u0430\u0442\u0435\u0436\u0430 \u2014 \u00ab\u0421\u0443\u043c\u043c\u0430 \u043f\u043b\u0430\u0442\u0435\u0436\u0430 \u0440\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0430 \u043d\u0435 \u043f\u043e\u043b\u043d\u043e\u0441\u0442\u044c\u044e\u00bb.",
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
          "state": 24,
          "id": "ei-modal-row",
          "title": "\u0421\u0442\u0440\u043e\u043a\u0430 \u0431\u043e\u043b\u044c\u0448\u0435 \u043d\u0430\u0447\u0438\u0441\u043b\u0435\u043d\u043d\u043e\u0439",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=pay-err-row",
          "note": "\u00ab\u0414\u043e\u0441\u0440\u043e\u0447\u043d\u0430\u044f \u0441\u0443\u043c\u043c\u0430 \u043f\u0440\u0435\u0432\u044b\u0448\u0430\u0435\u0442 \u043d\u0430\u0447\u0438\u0441\u043b\u0435\u043d\u043d\u0443\u044e \u0441\u0443\u043c\u043c\u0443 \u0437\u0430\u0434\u043e\u043b\u0436\u0435\u043d\u043d\u043e\u0441\u0442\u0438\u00bb.",
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
          "state": 25,
          "id": "ei-modal-over",
          "title": "\u0421\u0443\u043c\u043c\u0430 \u0441\u0442\u0440\u043e\u043a \u0431\u043e\u043b\u044c\u0448\u0435 \u043f\u043b\u0430\u0442\u0435\u0436\u0430",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=pay-err-over",
          "note": "\u00ab\u0421\u0443\u043c\u043c\u0430 \u0434\u043e\u0441\u0440\u043e\u0447\u043d\u044b\u0445 \u043f\u043b\u0430\u0442\u0435\u0436\u0435\u0439 \u043f\u0440\u0435\u0432\u044b\u0448\u0430\u0435\u0442 \u0441\u0443\u043c\u043c\u0443 \u043f\u043b\u0430\u0442\u0435\u0436\u0430\u00bb.",
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
        }
      ]
    },
    {
      "id": "repay-order",
      "title": "\u041f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442 \u043f\u043e\u0433\u0430\u0448\u0435\u043d\u0438\u044f",
      "desc": "\u041e\u043a\u043d\u043e \u0441 \u043f\u0435\u0440\u0435\u0441\u0442\u0430\u043d\u043e\u0432\u043a\u043e\u0439 \u0441\u0442\u0440\u0435\u043b\u043a\u0430\u043c\u0438 \u0432\u0432\u0435\u0440\u0445 \u0438 \u0432\u043d\u0438\u0437",
      "steps": [
        {
          "state": 26,
          "id": "repay-order-open",
          "title": "\u041e\u043a\u043d\u043e \u00ab\u041f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442 \u043f\u043e\u0433\u0430\u0448\u0435\u043d\u0438\u044f\u00bb",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=filled,order",
          "note": "\u0412\u0441\u0435 \u0432\u0438\u0434\u044b \u0437\u0430\u0434\u043e\u043b\u0436\u0435\u043d\u043d\u043e\u0441\u0442\u0438, \u043f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442 1 \u0441\u0432\u0435\u0440\u0445\u0443; \u0432\u0438\u0434 \u043f\u0435\u0440\u0435\u0441\u0442\u0430\u0432\u043b\u044f\u044e\u0442 \u043f\u0435\u0440\u0435\u0442\u0430\u0441\u043a\u0438\u0432\u0430\u043d\u0438\u0435\u043c \u0437\u0430 \u0433\u0440\u0438\u043f (\u043b\u0438\u043d\u0438\u044f \u0432\u0441\u0442\u0430\u0432\u043a\u0438) \u0438\u043b\u0438 \u0441\u0442\u0440\u0435\u043b\u043a\u0430\u043c\u0438 \u043d\u0430 \u043e\u0434\u043d\u043e \u043c\u0435\u0441\u0442\u043e.",
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
          "state": 27,
          "id": "repay-order-move",
          "title": "\u0412\u0438\u0434 \u043e\u043f\u0443\u0449\u0435\u043d \u043d\u0438\u0436\u0435",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=filled,order",
          "note": "\u041f\u0435\u0440\u0432\u044b\u0439 \u0432\u0438\u0434 \u0441\u0442\u0430\u043b \u0432\u0442\u043e\u0440\u044b\u043c, \u043d\u043e\u043c\u0435\u0440\u0430 \u043f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u043b\u0438\u0441\u044c; \u00ab\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c\u00bb \u043e\u0431\u043d\u043e\u0432\u0438\u0442 \u0442\u0430\u0439\u043b \u0438 \u043f\u043e\u043a\u0430\u0436\u0435\u0442 \u0442\u043e\u0441\u0442 \u00ab\u041f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442 \u043f\u043e\u0433\u0430\u0448\u0435\u043d\u0438\u044f \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u00bb.",
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
          "state": 28,
          "id": "repay-order-save",
          "title": "\u041f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442 \u0438\u0437\u043c\u0435\u043d\u0451\u043d",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=filled,order",
          "note": "\u041f\u043e\u0441\u043b\u0435 \u00ab\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c\u00bb \u0442\u0430\u0439\u043b \u0441\u043f\u0440\u0430\u0432\u0430 \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0435\u0442 \u043d\u043e\u0432\u044b\u0439 \u043f\u043e\u0440\u044f\u0434\u043e\u043a.",
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
            },
            {
              "verb": "click",
              "target": "[data-repay-save]",
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
          "state": 29,
          "id": "repay-order-view",
          "title": "\u0422\u0430\u0439\u043b \u0431\u0435\u0437 \u043f\u0440\u0430\u0432\u0430 \u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=filled&mode=view",
          "note": "\u0421\u043f\u0438\u0441\u043e\u043a \u043f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442\u0430 \u0431\u0435\u0437 \u043a\u0430\u0440\u0430\u043d\u0434\u0430\u0448\u0430.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 30,
          "id": "repay-order-modal-view",
          "title": "\u041e\u043a\u043d\u043e \u043d\u0430 \u0447\u0442\u0435\u043d\u0438\u0435",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=filled,order&mode=view",
          "note": "\u0420\u0435\u0436\u0438\u043c \u0432\u0438\u0434\u0436\u0435\u0442\u0430 \u0431\u0435\u0437 \u0441\u0442\u0440\u0435\u043b\u043e\u043a \u0438 \u0441 \u043a\u043d\u043e\u043f\u043a\u043e\u0439 \u00ab\u0417\u0430\u043a\u0440\u044b\u0442\u044c\u00bb; \u0438\u0437 \u0442\u0430\u0439\u043b\u0430 \u0431\u0435\u0437 \u043f\u0440\u0430\u0432\u0430 \u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f \u043d\u0435 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442\u0441\u044f (\u0432\u043e\u043f\u0440\u043e\u0441 4 \u043f\u0430\u0441\u043f\u043e\u0440\u0442\u0430 \u043e\u043a\u043d\u0430).",
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
          "state": 31,
          "id": "repay-order-default",
          "title": "\u041f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442 \u043f\u043e \u0443\u043c\u043e\u043b\u0447\u0430\u043d\u0438\u044e",
          "page": "EarlyInterestPayments.preview.html?id=1024&tr=1024.d1.p1.i1.t1",
          "note": "\u041f\u043e\u0440\u044f\u0434\u043e\u043a \u043f\u043e \u0443\u043c\u043e\u043b\u0447\u0430\u043d\u0438\u044e \u2014 \u043a\u0430\u043a \u0432 \u0441\u043f\u0440\u0430\u0432\u043e\u0447\u043d\u0438\u043a\u0435 \u0432\u0438\u0434\u043e\u0432 \u0437\u0430\u0434\u043e\u043b\u0436\u0435\u043d\u043d\u043e\u0441\u0442\u0438.",
          "recorded": null,
          "issues": [],
          "do": []
        }
      ]
    }
  ],
  "flowErrors": [],
  "comments": [
    {
      "n": 1,
      "status": "open",
      "created": "16.10.2026 18:00",
      "author": null,
      "page": "Tranche.preview.html",
      "step": {
        "state": 8
      },
      "resolution": null,
      "body": "**\u041e\u0442\u043a\u0440\u044b\u0442\u044b\u0439 \u0432\u043e\u043f\u0440\u043e\u0441: \u043d\u0443\u0436\u043d\u043e \u043b\u0438 \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435 \u00ab\u041d\u0443\u0436\u0435\u043d \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u00bb.** \u0421\u0435\u0439\u0447\u0430\u0441 \u043f\u043e\u0441\u043b\u0435 \u0432\u043d\u0435\u0441\u0435\u043d\u0438\u044f, \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f \u0438\u043b\u0438 \u0443\u0434\u0430\u043b\u0435\u043d\u0438\u044f \u0434\u043e\u0441\u0440\u043e\u0447\u043d\u043e\u0433\u043e \u043f\u043b\u0430\u0442\u0435\u0436\u0430 (\u0438 \u0441\u043c\u0435\u043d\u044b \u043f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442\u0430) \u043d\u0430 \u0442\u0430\u0439\u043b\u0430\u0445 \u00ab\u041f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0435 \u043f\u043b\u0430\u0442\u0435\u0436\u0438\u00bb \u0438 \u00ab\u041f\u043b\u0430\u043d\u043e\u0432\u044b\u0435 \u043f\u043b\u0430\u0442\u0435\u0436\u0438\u00bb \u043f\u043e\u044f\u0432\u043b\u044f\u044e\u0442\u0441\u044f \u043f\u043e\u043c\u0435\u0442\u043a\u0438 \u043e \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442\u0435, \u043f\u043e\u043a\u0430 \u043d\u0435 \u043d\u0430\u0436\u0430\u0442\u0430 \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c\u00bb. \u0410\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0438 \u0445\u043e\u0442\u044f\u0442 \u0441\u0434\u0435\u043b\u0430\u0442\u044c \u043f\u0435\u0440\u0435\u0441\u0447\u0451\u0442 \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0438\u043c \u0441\u0440\u0430\u0437\u0443 \u043f\u043e\u0441\u043b\u0435 \u00ab\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c\u00bb / \u00ab\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c\u00bb \u0432 \u043e\u043a\u043d\u0435 \u043f\u043b\u0430\u0442\u0435\u0436\u0430. \u0422\u043e\u0433\u0434\u0430 \u044d\u0442\u043e \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435, \u043f\u043e\u043c\u0435\u0442\u043a\u0438 \u043d\u0430 \u0442\u0430\u0439\u043b\u0430\u0445 \u0442\u0440\u0430\u043d\u0448\u0430 \u0438 \u0441\u0441\u044b\u043b\u043a\u0430 `recalc=1` \u043d\u0430 \u0432\u043e\u0437\u0432\u0440\u0430\u0442\u0435 \u043d\u0435 \u043d\u0443\u0436\u043d\u044b. \u0414\u043e \u0440\u0435\u0448\u0435\u043d\u0438\u044f \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435 \u043e\u0441\u0442\u0430\u0432\u043b\u0435\u043d\u043e \u043a\u0430\u043a \u0440\u0430\u0431\u043e\u0447\u0435\u0435 \u0434\u043e\u043f\u0443\u0449\u0435\u043d\u0438\u0435."
    }
  ],
  "commentsPreamble": "# \u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438 \u043a \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0443\n\n\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438 \u043f\u0438\u0448\u0435\u0442 \u043f\u0430\u043d\u0435\u043b\u044c \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430 (Alt+Shift+P \u043d\u0430 \u043b\u044e\u0431\u043e\u0439 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430)\n\u0438 \u043f\u0440\u0430\u0432\u0438\u0442 \u0430\u0433\u0435\u043d\u0442. \u0424\u043e\u0440\u043c\u0430\u0442 \u2014 `.agents/proto-panel/README.md`, \u0440\u0430\u0437\u0434\u0435\u043b \u00abcomments.md\u00bb.",
  "commentErrors": []
};
