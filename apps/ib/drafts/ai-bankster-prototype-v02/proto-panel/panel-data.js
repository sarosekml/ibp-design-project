/* СГЕНЕРИРОВАН из flows.yaml и comments.md — руками не править.
   Пересобрать: node .agents/tools/proto-panel.mjs */
window.ProtoPanelData = {
  "format": 1,
  "app": {
    "id": "ai-bankster-prototype-v02",
    "title": "AI Pitcher ver. 02"
  },
  "sources": {
    "flows": "db481bc7",
    "comments": "e533f5f9"
  },
  "flowsHeader": [
    "# \u0421\u0446\u0435\u043d\u0430\u0440\u0438\u0438 \u043f\u043e\u043a\u0430\u0437\u0430 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430 AI Pitcher ver. 02 \u2014 \u043f\u0430\u043d\u0435\u043b\u044c \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430.",
    "# \u0424\u043e\u0440\u043c\u0430\u0442 \u2014 .agents/proto-panel/README.md, \u0440\u0430\u0437\u0434\u0435\u043b \u00abflows.yaml\u00bb.",
    "# \u041f\u043e\u0441\u043b\u0435 \u043f\u0440\u0430\u0432\u043a\u0438: node .agents/tools/proto-panel.mjs (\u043f\u0435\u0440\u0435\u0441\u043e\u0431\u0440\u0430\u0442\u044c \u0437\u0435\u0440\u043a\u0430\u043b\u043e)."
  ],
  "lastState": 11,
  "flows": [
    {
      "id": "report-from-builder",
      "title": "\u041e\u0442\u0447\u0451\u0442 \u0438\u0437 \u043a\u043e\u043d\u0441\u0442\u0440\u0443\u043a\u0442\u043e\u0440\u0430",
      "desc": "\u041d\u043e\u0432\u044b\u0439 \u0447\u0430\u0442 \u2192 \u043a\u043e\u043d\u0441\u0442\u0440\u0443\u043a\u0442\u043e\u0440 \u2192 \u043f\u043e\u0434\u0433\u043e\u0442\u043e\u0432\u043a\u0430 \u2192 \u0433\u043e\u0442\u043e\u0432\u044b\u0439 \u043e\u0442\u0447\u0451\u0442 \u2192 \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440 \u0432 split view \u2192 \u0432\u044b\u0433\u0440\u0443\u0437\u043a\u0430",
      "steps": [
        {
          "state": 1,
          "id": "home",
          "title": "\u0413\u043b\u0430\u0432\u043d\u0430\u044f",
          "page": "index.html",
          "note": "\u0422\u043e\u0447\u043a\u0430 \u0432\u0445\u043e\u0434\u0430 \u2014 \u043f\u043b\u0438\u0442\u043a\u0430 \u00abAI Pitcher\u00bb \u0432 \u0433\u0440\u0443\u043f\u043f\u0435 Origination.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 2,
          "id": "new-chat",
          "title": "\u041d\u043e\u0432\u044b\u0439 \u0447\u0430\u0442",
          "page": "RequestThread.html",
          "note": "\u041f\u0443\u0441\u0442\u0430\u044f \u043d\u0438\u0442\u044c \u2014 \u0442\u043e\u0447\u043a\u0430 \u0432\u0445\u043e\u0434\u0430 \u0432 \u0440\u0430\u0437\u0434\u0435\u043b. \u0421\u043b\u0435\u0432\u0430 \u043d\u0435\u0434\u0430\u0432\u043d\u0438\u0435 \u0437\u0430\u043f\u0440\u043e\u0441\u044b, \u043f\u043e \u0446\u0435\u043d\u0442\u0440\u0443 \u043f\u043e\u043b\u0435 \u0437\u0430\u043f\u0440\u043e\u0441\u0430.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 3,
          "id": "builder-open",
          "title": "\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043a\u043e\u043d\u0441\u0442\u0440\u0443\u043a\u0442\u043e\u0440",
          "page": null,
          "note": "\u041a\u043e\u043d\u0441\u0442\u0440\u0443\u043a\u0442\u043e\u0440 \u0432\u044b\u0435\u0437\u0436\u0430\u0435\u0442 \u0432\u043d\u0443\u0442\u0440\u0438 \u043f\u043e\u043b\u044f \u0437\u0430\u043f\u0440\u043e\u0441\u0430 \u0438 \u043d\u0435 \u0443\u0432\u043e\u0434\u0438\u0442 \u0441\u043e \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#btnBuilder",
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
              "target": "#cmpDrawer.is-open",
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
          "state": 4,
          "id": "builder-filled",
          "title": "\u0417\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u044c \u043a\u043e\u043d\u0441\u0442\u0440\u0443\u043a\u0442\u043e\u0440",
          "page": null,
          "note": "\u041e\u0431\u044a\u0435\u043a\u0442 \u2014 \u0413\u041a \u00ab\u0421\u0435\u0432\u0435\u0440\u043d\u044b\u0439 \u0430\u0433\u0440\u043e\u0445\u043e\u043b\u0434\u0438\u043d\u0433\u00bb, \u0444\u043e\u043a\u0443\u0441\u044b \u2014 \u0434\u043e\u043b\u0433\u043e\u0432\u0430\u044f \u043d\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u0438 \u0438\u0434\u0435\u0438 \u043a \u0432\u0441\u0442\u0440\u0435\u0447\u0435.\n\u041a\u0430\u0436\u0434\u044b\u0439 \u0432\u044b\u0431\u043e\u0440 \u0434\u043e\u043f\u0438\u0441\u044b\u0432\u0430\u0435\u0442 \u0433\u043e\u0442\u043e\u0432\u044b\u0439 \u0444\u0440\u0430\u0433\u043c\u0435\u043d\u0442 \u0432 \u0442\u0435\u043a\u0441\u0442 \u0437\u0430\u043f\u0440\u043e\u0441\u0430.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "fill",
              "target": "#bldFind",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "\u0421\u0435\u0432\u0435\u0440\u043d\u044b\u0439",
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
              "target": "[data-obj=\"sah\"]",
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
              "target": "[data-focus=\"debt\"]",
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
              "target": "[data-focus=\"ideas\"]",
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
          "state": 5,
          "id": "waiting",
          "title": "\u041e\u0436\u0438\u0434\u0430\u043d\u0438\u0435 \u043e\u0442\u0447\u0451\u0442\u0430",
          "page": null,
          "note": "\u0417\u0430\u043f\u0440\u043e\u0441 \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d, \u0438\u0434\u0451\u0442 \u043f\u043e\u0434\u0433\u043e\u0442\u043e\u0432\u043a\u0430 \u2014 \u0434\u043e 30 \u043c\u0438\u043d\u0443\u0442. \u0412 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0435 \u0435\u0451 \u0437\u0430\u0432\u0435\u0440\u0448\u0430\u0435\u0442 \u043a\u043b\u0438\u043a \u043f\u043e \u0438\u043d\u0434\u0438\u043a\u0430\u0442\u043e\u0440\u0443.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#btnSend",
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
              "target": "[data-act=\"finish\"]",
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
          "state": 6,
          "id": "report-ready",
          "title": "\u041e\u0442\u0447\u0451\u0442 \u0433\u043e\u0442\u043e\u0432",
          "page": null,
          "note": "\u0412 \u043d\u0438\u0442\u0438 \u2014 \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0430 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u0430, \u0441\u043f\u0440\u0430\u0432\u0430 \u0432\u0432\u0435\u0440\u0445\u0443 \u2014 \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0435 \u00ab\u041c\u0430\u0442\u0435\u0440\u0438\u0430\u043b \u0433\u043e\u0442\u043e\u0432\u00bb.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "[data-act=\"finish\"]",
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
              "target": ".doc [data-act=\"open\"]",
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
          "state": 7,
          "id": "split-view",
          "title": "\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440 \u0432 split view",
          "page": null,
          "note": "\u041c\u0430\u0442\u0435\u0440\u0438\u0430\u043b \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u043f\u0430\u043d\u0435\u043b\u044c\u044e \u0441\u043f\u0440\u0430\u0432\u0430 \u043e\u0442 \u043d\u0438\u0442\u0438; \u0435\u0451 \u0448\u0438\u0440\u0438\u043d\u0443 \u043c\u043e\u0436\u043d\u043e \u0442\u044f\u043d\u0443\u0442\u044c \u0438 \u0440\u0430\u0437\u0432\u0435\u0440\u043d\u0443\u0442\u044c.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": ".doc .btn[data-act=\"open\"]",
              "text": null,
              "index": -1,
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
              "target": "#pv:not([hidden])",
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
          "id": "export",
          "title": "\u0412\u044b\u0433\u0440\u0443\u0437\u043a\u0430 \u043e\u0442\u0447\u0451\u0442\u0430",
          "page": null,
          "note": "\u041c\u0435\u043d\u044e \u0444\u043e\u0440\u043c\u0430\u0442\u043e\u0432. \u00ab\u041a\u0440\u0430\u0442\u043a\u0438\u0439 \u2014 PDF\u00bb \u0441\u043a\u0430\u0447\u0438\u0432\u0430\u0435\u0442 \u0444\u0430\u0439\u043b-\u043f\u0440\u0438\u043c\u0435\u0440 \u0438\u0437 refs/.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#pv [data-menu=\"doc-menu\"]",
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
              "target": "#doc-menu.is-open",
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
      "id": "report-from-history",
      "title": "\u0413\u043e\u0442\u043e\u0432\u044b\u0439 \u043e\u0442\u0447\u0451\u0442 \u0438\u0437 \u0438\u0441\u0442\u043e\u0440\u0438\u0438",
      "desc": "\u0417\u0430\u043f\u0440\u043e\u0441 \u0441 \u0433\u043e\u0442\u043e\u0432\u044b\u043c \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u043e\u043c \u2192 \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440 \u2192 \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440 \u043d\u0430 \u0432\u0441\u044e \u0448\u0438\u0440\u0438\u043d\u0443",
      "steps": [
        {
          "state": 9,
          "id": "ready-thread",
          "title": "\u0417\u0430\u043f\u0440\u043e\u0441 \u0441 \u0433\u043e\u0442\u043e\u0432\u044b\u043c \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u043e\u043c",
          "page": "RequestThread.html?id=1",
          "note": "\u0413\u041a \u00ab\u0421\u0435\u0432\u0435\u0440\u043d\u044b\u0439 \u0430\u0433\u0440\u043e\u0445\u043e\u043b\u0434\u0438\u043d\u0433\u00bb \u2014 \u0432\u044b\u0445\u043e\u0434 \u043c\u0438\u043d\u043e\u0440\u0438\u0442\u0430\u0440\u0438\u044f, \u0434\u0432\u0435 \u0432\u0435\u0440\u0441\u0438\u0438 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u0430.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 10,
          "id": "preview",
          "title": "\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u0430",
          "page": null,
          "note": null,
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": ".doc .btn[data-act=\"open\"]",
              "text": null,
              "index": -1,
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
              "target": "#pv:not([hidden])",
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
          "id": "preview-wide",
          "title": "\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440 \u043d\u0430 \u0432\u0441\u044e \u0448\u0438\u0440\u0438\u043d\u0443",
          "page": null,
          "note": null,
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#pvWide",
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
              "verb": "wait",
              "target": null,
              "text": null,
              "index": 0,
              "timeout": null,
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
              "ms": 300
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
