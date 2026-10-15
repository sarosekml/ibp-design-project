/* СГЕНЕРИРОВАН из flows.yaml и comments.md — руками не править.
   Пересобрать: node .agents/tools/proto-panel.mjs */
window.ProtoPanelData = {
  "format": 1,
  "app": {
    "id": "dashboard-app",
    "title": "\u0414\u0430\u0448\u0431\u043e\u0440\u0434 \u0410\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430"
  },
  "sources": {
    "flows": "ff08d319",
    "comments": "e533f5f9"
  },
  "flowsHeader": [
    "# \u0421\u0446\u0435\u043d\u0430\u0440\u0438\u0438 \u043f\u043e\u043a\u0430\u0437\u0430 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430 \u0413\u043b\u0430\u0432\u043d\u0430\u044f \u2014 \u0434\u0430\u0448\u0431\u043e\u0440\u0434 (MVP) \u2014 \u043f\u0430\u043d\u0435\u043b\u044c \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430.",
    "# \u0424\u043e\u0440\u043c\u0430\u0442 \u2014 .agents/proto-panel/README.md, \u0440\u0430\u0437\u0434\u0435\u043b \u00abflows.yaml\u00bb.",
    "# \u041f\u043e\u0441\u043b\u0435 \u043f\u0440\u0430\u0432\u043a\u0438: node .agents/tools/proto-panel.mjs (\u043f\u0435\u0440\u0435\u0441\u043e\u0431\u0440\u0430\u0442\u044c \u0437\u0435\u0440\u043a\u0430\u043b\u043e)."
  ],
  "lastState": 4,
  "flows": [
    {
      "id": "main",
      "title": "\u0423\u0442\u0440\u043e \u0430\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430",
      "desc": "\u0413\u043b\u0430\u0432\u043d\u0430\u044f \u2192 \u0437\u0430\u0434\u0430\u0447\u0430 \u0432 \u0440\u0430\u0431\u043e\u0442\u0443 \u2192 \u043d\u043e\u0432\u0430\u044f \u0432\u0441\u0442\u0440\u0435\u0447\u0430 \u0432 \u043f\u043b\u0430\u043d\u0435 \u0434\u043d\u044f",
      "steps": [
        {
          "state": 1,
          "id": "start",
          "title": "\u0413\u043b\u0430\u0432\u043d\u0430\u044f",
          "page": "HomePage.preview.html",
          "note": "\u0422\u0430\u0439\u043b\u044b \u0437\u0430\u0433\u0440\u0443\u0436\u0430\u044e\u0442\u0441\u044f \u043a\u0430\u0441\u043a\u0430\u0434\u043e\u043c, \u043a\u0430\u0436\u0434\u044b\u0439 \u043f\u043e \u043e\u0442\u0432\u0435\u0442\u0443 \u0441\u0432\u043e\u0435\u0433\u043e \u0441\u0435\u0440\u0432\u0438\u0441\u0430. \u041f\u0440\u043e\u0444\u0438\u043b\u044c, \u0432\u0441\u0442\u0440\u0435\u0447\u0438, \u0437\u0430\u0434\u0430\u0447\u0438 \u0438 \u043d\u043e\u0432\u043e\u0441\u0442\u0438 \u2014 \u043d\u0430 \u043e\u0434\u043d\u043e\u043c \u044d\u043a\u0440\u0430\u043d\u0435.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "waitFor",
              "target": "#tile-news[data-state=\"data\"]",
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
          "state": 2,
          "id": "take",
          "title": "\u0417\u0430\u0434\u0430\u0447\u0430 \u0432\u0437\u044f\u0442\u0430 \u0432 \u0440\u0430\u0431\u043e\u0442\u0443",
          "page": null,
          "note": "\u041c\u0435\u043d\u044e \u0441\u0442\u0440\u043e\u043a\u0438 \u0437\u0430\u0434\u0430\u0447\u0438 \u2014 \u00ab\u0412\u0437\u044f\u0442\u044c \u0432 \u0440\u0430\u0431\u043e\u0442\u0443\u00bb: \u0441\u0442\u0430\u0442\u0443\u0441 \u043c\u0435\u043d\u044f\u0435\u0442\u0441\u044f \u043d\u0430 \u043c\u0435\u0441\u0442\u0435, \u0443\u0432\u0435\u0434\u043e\u043c\u043b\u0435\u043d\u0438\u0435 \u0434\u0430\u0451\u0442 \u043e\u0442\u043c\u0435\u043d\u0438\u0442\u044c.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#tile-tasks [data-task-id=\"T-1002\"] [data-menu=\"lc-tasks-row-menu\"]",
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
              "target": "#lc-tasks-row-menu [data-task-act=\"take\"]",
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
              "target": "#tile-tasks [data-task-id=\"T-1002\"] .chip--dpurple",
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
          "id": "meeting",
          "title": "\u041d\u043e\u0432\u0430\u044f \u0432\u0441\u0442\u0440\u0435\u0447\u0430 \u0432 \u043f\u043b\u0430\u043d\u0435 \u0434\u043d\u044f",
          "page": null,
          "note": "\u0411\u044b\u0441\u0442\u0440\u043e\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u0438\u0437 \u043f\u0440\u043e\u0444\u0438\u043b\u044f. \u0412\u0441\u0442\u0440\u0435\u0447\u0430 \u043d\u0430 \u0441\u0435\u0433\u043e\u0434\u043d\u044f \u0441\u0440\u0430\u0437\u0443 \u0432\u0441\u0442\u0430\u0451\u0442 \u0432 \u00ab\u041c\u043e\u0438 \u0432\u0441\u0442\u0440\u0435\u0447\u0438\u00bb.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#tile-profile [data-modal=\"meeting-create-scrim\"]",
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
              "target": "#meeting-create-scrim",
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
              "target": "[data-ddl=\"meeting-create-client-list\"]",
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
              "target": "[data-code=\"\u0413\u041a \u00ab\u0412\u043e\u043b\u0433\u0430 \u0422\u0435\u0445\u00bb\"]",
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
              "verb": "fill",
              "target": "#meeting-create-topic",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "\u041f\u043e\u0432\u0435\u0441\u0442\u043a\u0430 \u043f\u043e \u043a\u043e\u0432\u0435\u043d\u0430\u043d\u0442\u0430\u043c",
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
              "target": "[data-meeting-create-save]",
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
              "target": "#meeting-create-scrim",
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
              "state": "hidden",
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
