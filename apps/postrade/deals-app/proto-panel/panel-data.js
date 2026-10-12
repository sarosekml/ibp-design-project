/* СГЕНЕРИРОВАН из flows.yaml и comments.md — руками не править.
   Пересобрать: node .agents/tools/proto-panel.mjs */
window.ProtoPanelData = {
  "format": 1,
  "app": {
    "id": "deals-app",
    "title": "Post \u2014 \u0414\u0418\u0414"
  },
  "sources": {
    "flows": "3b065793",
    "comments": "e533f5f9"
  },
  "flowsHeader": [
    "# \u0421\u0446\u0435\u043d\u0430\u0440\u0438\u0438 \u043f\u043e\u043a\u0430\u0437\u0430 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430 Post \u2014 \u0414\u0418\u0414 \u2014 \u043f\u0430\u043d\u0435\u043b\u044c \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430.",
    "# \u0424\u043e\u0440\u043c\u0430\u0442 \u2014 .agents/proto-panel/README.md, \u0440\u0430\u0437\u0434\u0435\u043b \u00abflows.yaml\u00bb.",
    "# \u041f\u043e\u0441\u043b\u0435 \u043f\u0440\u0430\u0432\u043a\u0438: node .agents/tools/proto-panel.mjs (\u043f\u0435\u0440\u0435\u0441\u043e\u0431\u0440\u0430\u0442\u044c \u0437\u0435\u0440\u043a\u0430\u043b\u043e)."
  ],
  "lastState": 10,
  "flows": [
    {
      "id": "main",
      "title": "\u041e\u0441\u043d\u043e\u0432\u043d\u043e\u0439 \u043f\u0443\u0442\u044c",
      "desc": null,
      "steps": [
        {
          "state": 1,
          "id": "start",
          "title": "\u0421\u0442\u0430\u0440\u0442\u043e\u0432\u0430\u044f \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430",
          "page": "MainPage.html",
          "note": null,
          "recorded": null,
          "issues": [],
          "do": []
        }
      ]
    },
    {
      "id": "rsbu-tile",
      "title": "\u0422\u0430\u0439\u043b \u00ab\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043e\u0432 \u0420\u0421\u0411\u0423\u00bb",
      "desc": "\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u0442\u0440\u0430\u043d\u0448\u0430 \u2014 \u0432\u0438\u0434 \u0442\u0430\u0439\u043b\u0430 \u043f\u043e \u0443\u0441\u043b\u043e\u0432\u0438\u044f\u043c, \u0434\u0430\u043d\u043d\u044b\u043c \u0438 \u043f\u0440\u0430\u0432\u0430\u043c",
      "steps": [
        {
          "state": 2,
          "id": "rsbu-tile-locked",
          "title": "\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044f \u0440\u0430\u0441\u0447\u0451\u0442",
          "page": "Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1&hardsState=locked",
          "note": "\u0423\u0441\u043b\u043e\u0432\u0438\u044f \u043d\u0435 \u0432\u044b\u043f\u043e\u043b\u043d\u0435\u043d\u044b \u2014 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0435 \u043f\u043b\u0430\u0442\u0435\u0436\u0438 \u043d\u0435 \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043d\u044b. \u00ab\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044f \u0440\u0430\u0441\u0447\u0451\u0442 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043d\u044b\u0445 \u043f\u043b\u0430\u0442\u0435\u0436\u0435\u0439\u00bb, \u0441\u0442\u0440\u0435\u043b\u043a\u0438 \u0438 \u043a\u043d\u043e\u043f\u043a\u0438 \u043d\u0435\u0442.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 3,
          "id": "rsbu-tile-none",
          "title": "\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u043d\u0435\u0442",
          "page": "Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1&hardsState=none",
          "note": "\u00ab\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u044e\u0442\u00bb; \u043a\u043d\u043e\u043f\u043a\u0430 \u00ab\u0412\u043d\u0435\u0441\u0442\u0438 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0443\u00bb \u0432\u0435\u0434\u0451\u0442 \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u0441 \u043f\u043e\u0434\u043d\u044f\u0442\u044b\u043c \u043e\u043a\u043d\u043e\u043c.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 4,
          "id": "rsbu-tile-filled",
          "title": "\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u0432\u043d\u0435\u0441\u0435\u043d\u044b",
          "page": "Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1&hardsState=filled",
          "note": "\u00ab\u0412\u043d\u0435\u0441\u0435\u043d\u043e \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a: N\u00bb; \u0441\u0442\u0440\u0435\u043b\u043a\u0430 \u0438 \u043a\u043d\u043e\u043f\u043a\u0430 \u043e\u0441\u0442\u0430\u044e\u0442\u0441\u044f.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 5,
          "id": "rsbu-tile-view",
          "title": "\u0411\u0435\u0437 \u043f\u0440\u0430\u0432\u0430 \u0440\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f",
          "page": "Tranche.preview.html?id=1024&tr=1024.d1.p1.i1.t1&hardsState=filled&hardsMode=view",
          "note": "\u041a\u043d\u043e\u043f\u043a\u0438 \u00ab\u0412\u043d\u0435\u0441\u0442\u0438 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0443\u00bb \u043d\u0435\u0442, \u0441\u0442\u0440\u0435\u043b\u043a\u0430 \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u043e\u0441\u0442\u0430\u0451\u0442\u0441\u044f \u2014 \u0441\u043c\u043e\u0442\u0440\u0435\u0442\u044c \u043c\u043e\u0436\u043d\u043e.",
          "recorded": null,
          "issues": [],
          "do": []
        }
      ]
    },
    {
      "id": "rsbu-page",
      "title": "\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u00ab\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u043f\u0440\u043e\u0446\u0435\u043d\u0442\u043e\u0432 \u0420\u0421\u0411\u0423\u00bb",
      "desc": "\u0422\u0430\u0431\u043b\u0438\u0446\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a, \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u0438\u0435, \u043f\u0440\u0430\u0432\u043a\u0430, \u0443\u0434\u0430\u043b\u0435\u043d\u0438\u0435, \u0432\u043e\u0437\u0432\u0440\u0430\u0442 \u0432 \u0442\u0440\u0430\u043d\u0448",
      "steps": [
        {
          "state": 6,
          "id": "rsbu-page-empty",
          "title": "\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043e\u043a \u043d\u0435\u0442",
          "page": "RsbuInterestAdjustments.preview.html?id=1024&tr=1024.d1.p1.i1.t1",
          "note": "\u041f\u0443\u0441\u0442\u0430\u044f \u0442\u0430\u0431\u043b\u0438\u0446\u0430 \u2014 \u0442\u043e\u043b\u044c\u043a\u043e \u043a\u043e\u043b\u043e\u043d\u043a\u0438; \u00ab\u0412 \u0442\u0440\u0430\u043d\u0448\u00bb \u0438 \u00ab\u0412\u043d\u0435\u0441\u0442\u0438 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0443\u00bb \u0432 \u0448\u0430\u043f\u043a\u0435 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 7,
          "id": "rsbu-page-modal",
          "title": "\u041d\u043e\u0432\u0430\u044f \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0430",
          "page": "RsbuInterestAdjustments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&open=add",
          "note": "\u0422\u0430\u043a \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u0441 \u043a\u043d\u043e\u043f\u043a\u0438 \u043d\u0430 \u0442\u0430\u0439\u043b\u0435. \u0418\u0441\u0445\u043e\u0434\u043d\u0430\u044f \u0434\u0430\u0442\u0430 \u2014 \u0432\u044b\u043f\u0430\u0434\u0430\u044e\u0449\u0438\u0439 \u0441\u043f\u0438\u0441\u043e\u043a, \u0446\u0435\u043b\u0435\u0432\u0430\u044f \u2014 \u0440\u0443\u0447\u043d\u043e\u0439 \u0432\u0432\u043e\u0434; \u0441\u0443\u043c\u043c\u0430 \u043c\u043e\u0436\u0435\u0442 \u0431\u044b\u0442\u044c \u043e\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043b\u044c\u043d\u043e\u0439.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "waitFor",
              "target": "#rsbu-adj-scrim:not([hidden])",
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
          "state": 8,
          "id": "rsbu-page-filled",
          "title": "\u041a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438 \u0432\u043d\u0435\u0441\u0435\u043d\u044b",
          "page": "RsbuInterestAdjustments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=filled",
          "note": "\u041f\u043e\u0441\u043b\u0435 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u044f \u0432 \u043e\u043a\u043d\u0435 \u0441\u0442\u0440\u043e\u043a\u0430 \u043f\u043e\u044f\u0432\u043b\u044f\u0435\u0442\u0441\u044f \u0432 \u0442\u0430\u0431\u043b\u0438\u0446\u0435. \u041e\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043b\u044c\u043d\u0430\u044f \u0441\u0443\u043c\u043c\u0430 \u2014 \u0441\u043e \u0437\u043d\u0430\u043a\u043e\u043c \u043c\u0438\u043d\u0443\u0441.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 9,
          "id": "rsbu-page-edit",
          "title": "\u041f\u0440\u0430\u0432\u043a\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u043a\u0438",
          "page": "RsbuInterestAdjustments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=edit",
          "note": "\u041f\u0440\u0430\u0432\u043a\u0430 \u2014 \u043a\u0430\u0440\u0430\u043d\u0434\u0430\u0448\u043e\u043c \u0432 \u043a\u043e\u043b\u043e\u043d\u043a\u0435 \u00ab\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044f\u00bb \u0438\u043b\u0438 \u0434\u0432\u043e\u0439\u043d\u044b\u043c \u043a\u043b\u0438\u043a\u043e\u043c \u043f\u043e \u0441\u0442\u0440\u043e\u043a\u0435.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "waitFor",
              "target": "#rsbu-adj-scrim:not([hidden])",
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
          "id": "rsbu-page-delete",
          "title": "\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u0435 \u0443\u0434\u0430\u043b\u0435\u043d\u0438\u044f",
          "page": "RsbuInterestAdjustments.preview.html?id=1024&tr=1024.d1.p1.i1.t1&demo=delete",
          "note": "\u0423\u0434\u0430\u043b\u0435\u043d\u0438\u0435 \u2014 \u043a\u043e\u0440\u0437\u0438\u043d\u0430 \u0432 \u043a\u043e\u043b\u043e\u043d\u043a\u0435 \u00ab\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044f\u00bb \u0438 \u043e\u043a\u043d\u043e \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u044f.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "waitFor",
              "target": "#rh-delete-scrim:not([hidden])",
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
