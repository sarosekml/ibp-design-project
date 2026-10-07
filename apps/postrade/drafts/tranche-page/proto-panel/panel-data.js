/* СГЕНЕРИРОВАН из flows.yaml и comments.md — руками не править.
   Пересобрать: node .agents/tools/proto-panel.mjs */
window.ProtoPanelData = {
  "format": 1,
  "app": {
    "id": "tranche-page",
    "title": "Post \u2014 \u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u0442\u0440\u0430\u043d\u0448\u0430"
  },
  "sources": {
    "flows": "811e9f3e",
    "comments": "e533f5f9"
  },
  "flowsHeader": [
    "# \u0421\u0446\u0435\u043d\u0430\u0440\u0438\u0438 \u043f\u043e\u043a\u0430\u0437\u0430 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430 Post \u2014 \u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u0442\u0440\u0430\u043d\u0448\u0430 \u2014 \u043f\u0430\u043d\u0435\u043b\u044c \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430.",
    "# \u0424\u043e\u0440\u043c\u0430\u0442 \u2014 .agents/proto-panel/README.md, \u0440\u0430\u0437\u0434\u0435\u043b \u00abflows.yaml\u00bb.",
    "# \u041f\u043e\u0441\u043b\u0435 \u043f\u0440\u0430\u0432\u043a\u0438: node .agents/tools/proto-panel.mjs (\u043f\u0435\u0440\u0435\u0441\u043e\u0431\u0440\u0430\u0442\u044c \u0437\u0435\u0440\u043a\u0430\u043b\u043e)."
  ],
  "lastState": 11,
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
          "page": "Tranche.html",
          "note": null,
          "recorded": null,
          "issues": [],
          "do": []
        }
      ]
    },
    {
      "id": "rsbu-tile",
      "title": "\u0422\u0430\u0439\u043b \u00ab\u0425\u0430\u0440\u0434\u044b \u0432 \u0420\u0421\u0411\u0423\u00bb \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435 \u0442\u0440\u0430\u043d\u0448\u0430",
      "desc": "\u0422\u0440\u0438 \u0432\u0438\u0434\u0430 \u0442\u0430\u0439\u043b\u0430 \u043f\u043e \u043a\u0440\u0438\u0442\u0435\u0440\u0438\u044f\u043c \u043f\u0440\u0438\u0451\u043c\u043a\u0438 \u2014 \u043d\u0435 \u0437\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u0430, \u0437\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u0430, \u043d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430",
      "steps": [
        {
          "state": 2,
          "id": "rsbu-tile-empty",
          "title": "\u041d\u0435 \u0437\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u0430",
          "page": "Tranche.html?hardsState=empty",
          "note": "\u041a\u043d\u043e\u043f\u043a\u0430 \u00ab\u0417\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u044c\u00bb \u0438 \u0441\u0442\u0440\u0435\u043b\u043a\u0430 \u0432\u0435\u0434\u0443\u0442 \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u00ab\u0425\u0430\u0440\u0434\u044b \u0432 \u0420\u0421\u0411\u0423\u00bb.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 3,
          "id": "rsbu-tile-filled",
          "title": "\u0417\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u0430",
          "page": "Tranche.html?hardsState=filled",
          "note": "\u041f\u043e\u043a\u0430\u0437\u0430\u043d \u0441\u0442\u0430\u0442\u0443\u0441 \u00ab\u0417\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u0430\u00bb; \u043a\u043d\u043e\u043f\u043a\u0438 \u0437\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u044f \u043d\u0435\u0442, \u0441\u0442\u0440\u0435\u043b\u043a\u0430 \u0432\u0435\u0434\u0451\u0442 \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 4,
          "id": "rsbu-tile-locked",
          "title": "\u041d\u0435\u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430",
          "page": "Tranche.html?hardsState=locked",
          "note": "\u0421\u043d\u0430\u0447\u0430\u043b\u0430 \u043d\u0443\u0436\u043d\u043e \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0442\u044c \u00ab\u041f\u043b\u0430\u043d\u043e\u0432\u044b\u0435 \u043f\u043b\u0430\u0442\u0435\u0436\u0438\u00bb; \u0441\u0442\u0440\u0435\u043b\u043a\u0430 \u043e\u0442\u043a\u043b\u044e\u0447\u0435\u043d\u0430.",
          "recorded": null,
          "issues": [],
          "do": []
        }
      ]
    },
    {
      "id": "rsbu-page",
      "title": "\u0421\u0442\u0440\u0430\u043d\u0438\u0446\u0430 \u00ab\u0425\u0430\u0440\u0434\u044b \u0432 \u0420\u0421\u0411\u0423\u00bb",
      "desc": "\u0420\u0430\u0441\u0447\u0451\u0442, \u0434\u0432\u0430 \u0442\u0430\u0431\u0430 \u0438 \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u0438\u0435 \u043d\u043e\u0432\u043e\u0433\u043e \u043f\u0435\u0440\u0438\u043e\u0434\u0430",
      "steps": [
        {
          "state": 5,
          "id": "rsbu-page-current",
          "title": "\u0422\u0435\u043a\u0443\u0449\u0438\u0439 \u0440\u0430\u0441\u0447\u0451\u0442",
          "page": "RsbuHards.html",
          "note": "\u0422\u0430\u0431\u043b\u0438\u0446\u0430 \u0442\u043e\u043b\u044c\u043a\u043e \u0434\u043b\u044f \u0447\u0442\u0435\u043d\u0438\u044f, \u0441\u043e\u0440\u0442\u0438\u0440\u043e\u0432\u043a\u0430 \u043f\u043e \u043b\u044e\u0431\u043e\u0439 \u043a\u043e\u043b\u043e\u043d\u043a\u0435.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 6,
          "id": "rsbu-page-calculated",
          "title": "\u041f\u043e\u0441\u043b\u0435 \u0440\u0430\u0441\u0447\u0451\u0442\u0430",
          "page": null,
          "note": "\u0412 \u043f\u043e\u0434\u0437\u0430\u0433\u043e\u043b\u043e\u0432\u043a\u0435 \u043f\u043e\u044f\u0432\u043b\u044f\u044e\u0442\u0441\u044f \u0434\u0430\u0442\u0430 \u0438 \u0432\u0440\u0435\u043c\u044f \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0435\u0433\u043e \u0440\u0430\u0441\u0447\u0451\u0442\u0430.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#rh-calc",
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
          "state": 7,
          "id": "rsbu-page-hard",
          "title": "\u0425\u0430\u0440\u0434\u043e\u0432\u044b\u0439 \u0440\u0430\u0441\u0447\u0451\u0442",
          "page": null,
          "note": "\u0421\u0442\u0440\u043e\u043a\u0430 \u043f\u0440\u0430\u0432\u0438\u0442\u0441\u044f \u0434\u0432\u043e\u0439\u043d\u044b\u043c \u043a\u043b\u0438\u043a\u043e\u043c \u0438\u043b\u0438 \u043a\u0430\u0440\u0430\u043d\u0434\u0430\u0448\u043e\u043c \u0432 \u0441\u0442\u0440\u043e\u043a\u0435; \u0438\u0437\u043c\u0435\u043d\u0451\u043d\u043d\u044b\u0435 \u044f\u0447\u0435\u0439\u043a\u0438 \u0437\u0430\u043b\u0438\u0442\u044b, \u0442\u0443\u043b\u0442\u0438\u043f \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0435\u0442 \u0440\u0430\u0441\u0447\u0451\u0442\u043d\u043e\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "[data-pane=\"rh-pane-hard\"]",
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
          "id": "rsbu-page-new-period",
          "title": "\u041d\u043e\u0432\u044b\u0439 \u043f\u0435\u0440\u0438\u043e\u0434",
          "page": null,
          "note": "\u0424\u043e\u0440\u043c\u0430 \u043d\u0435 \u0437\u0430\u043a\u0440\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u043a\u043b\u0438\u043a\u043e\u043c \u043f\u043e \u0437\u0430\u0442\u0435\u043c\u043d\u0435\u043d\u0438\u044e; \u043f\u0435\u0440\u0438\u043e\u0434\u044b \u043d\u0435 \u0434\u043e\u043b\u0436\u043d\u044b \u043f\u0435\u0440\u0435\u0441\u0435\u043a\u0430\u0442\u044c\u0441\u044f.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#rh-new-period",
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
              "target": "#rh-period-scrim:not([hidden])",
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
          "state": 9,
          "id": "rsbu-page-edits",
          "title": "\u0425\u0430\u0440\u0434\u043e\u0432\u044b\u0439 \u0440\u0430\u0441\u0447\u0451\u0442 \u0441 \u043f\u0440\u0430\u0432\u043a\u0430\u043c\u0438",
          "page": "RsbuHards.html?demo=edits",
          "note": "\u0418\u0437\u043c\u0435\u043d\u0451\u043d\u043d\u044b\u0435 \u044f\u0447\u0435\u0439\u043a\u0438 \u0437\u0430\u043b\u0438\u0442\u044b, \u0443 \u043d\u0438\u0445 \u0442\u0443\u043b\u0442\u0438\u043f \u0441 \u0440\u0430\u0441\u0447\u0451\u0442\u043d\u044b\u043c \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435\u043c; \u043d\u043e\u0432\u044b\u0439 \u043f\u0435\u0440\u0438\u043e\u0434 \u0437\u0430\u043b\u0438\u0442 \u0446\u0435\u043b\u0438\u043a\u043e\u043c.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "[data-pane=\"rh-pane-hard\"]",
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
          "state": 10,
          "id": "rsbu-page-subtext",
          "title": "\u0418\u0441\u0445\u043e\u0434\u043d\u043e\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0432 \u044f\u0447\u0435\u0439\u043a\u0435",
          "page": "RsbuHards.html?demo=edits&variant=subtext",
          "note": "\u0412\u0430\u0440\u0438\u0430\u043d\u0442 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b \u2014 \u0440\u0430\u0441\u0447\u0451\u0442\u043d\u043e\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0432\u0442\u043e\u0440\u043e\u0439 \u0441\u0442\u0440\u043e\u043a\u043e\u0439 \u0432 \u044f\u0447\u0435\u0439\u043a\u0435, \u043c\u0435\u043d\u044c\u0448\u0438\u043c \u0448\u0440\u0438\u0444\u0442\u043e\u043c \u0438 \u0446\u0432\u0435\u0442\u043e\u043c \u043d\u0435\u0430\u043a\u0442\u0438\u0432\u043d\u043e\u0433\u043e \u0442\u0435\u043a\u0441\u0442\u0430; \u0442\u0443\u043b\u0442\u0438\u043f \u043e\u0441\u0442\u0430\u0451\u0442\u0441\u044f.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "[data-pane=\"rh-pane-hard\"]",
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
          "state": 11,
          "id": "rsbu-page-delete",
          "title": "\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u0435 \u0443\u0434\u0430\u043b\u0435\u043d\u0438\u044f",
          "page": "RsbuHards.html?demo=edits,delete",
          "note": "\u0423\u0434\u0430\u043b\u0435\u043d\u0438\u0435 \u043f\u0435\u0440\u0438\u043e\u0434\u0430 \u2014 \u043a\u043d\u043e\u043f\u043a\u0430-\u043a\u043e\u0440\u0437\u0438\u043d\u0430 \u0432 \u0441\u043a\u0440\u044b\u0442\u044b\u0445 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044f\u0445 \u0441\u0442\u0440\u043e\u043a\u0438 \u0438 \u043c\u043e\u0434\u0430\u043b\u043a\u0430 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u044f.",
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
