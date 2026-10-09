/* СГЕНЕРИРОВАН из flows.yaml и comments.md — руками не править.
   Пересобрать: node .agents/tools/proto-panel.mjs */
window.ProtoPanelData = {
  "format": 1,
  "app": {
    "id": "post-reports-app",
    "title": "Post \u2014 \u041e\u0442\u0447\u0451\u0442\u044b"
  },
  "sources": {
    "flows": "3d623c8d",
    "comments": "fdfe2d9b"
  },
  "flowsHeader": [
    "# \u0421\u0446\u0435\u043d\u0430\u0440\u0438\u0438 \u043f\u043e\u043a\u0430\u0437\u0430 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430 Post \u2014 \u041e\u0442\u0447\u0451\u0442\u044b \u2014 \u043f\u0430\u043d\u0435\u043b\u044c \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430.",
    "# \u0424\u043e\u0440\u043c\u0430\u0442 \u2014 .agents/proto-panel/README.md, \u0440\u0430\u0437\u0434\u0435\u043b \u00abflows.yaml\u00bb.",
    "# \u041f\u043e\u0441\u043b\u0435 \u043f\u0440\u0430\u0432\u043a\u0438: node .agents/tools/proto-panel.mjs (\u043f\u0435\u0440\u0435\u0441\u043e\u0431\u0440\u0430\u0442\u044c \u0437\u0435\u0440\u043a\u0430\u043b\u043e)."
  ],
  "lastState": 26,
  "flows": [
    {
      "id": "register",
      "title": "\u0420\u0435\u0435\u0441\u0442\u0440 \u0440\u0430\u0441\u0447\u0435\u0442\u043e\u0432 FV",
      "desc": "\u0422\u0430\u0431\u043b\u0438\u0446\u0430 \u0440\u0430\u0441\u0447\u0435\u0442\u043e\u0432, \u0444\u0438\u043b\u044c\u0442\u0440 \u0438 \u0444\u043e\u0440\u043c\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435 \u043d\u043e\u0432\u043e\u0433\u043e \u0440\u0430\u0441\u0447\u0435\u0442\u0430",
      "steps": [
        {
          "state": 1,
          "id": "register-open",
          "title": "\u0420\u0435\u0435\u0441\u0442\u0440 \u0440\u0430\u0441\u0447\u0435\u0442\u043e\u0432",
          "page": "FairValueRegister.preview.html",
          "note": "\u041f\u0435\u0440\u0435\u0445\u043e\u0434 \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u0440\u0430\u0441\u0447\u0435\u0442\u0430 \u2014 \u0434\u0432\u043e\u0439\u043d\u044b\u043c \u043a\u043b\u0438\u043a\u043e\u043c \u043f\u043e \u0441\u0442\u0440\u043e\u043a\u0435.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 2,
          "id": "register-new",
          "title": "\u041d\u043e\u0432\u044b\u0439 \u0440\u0430\u0441\u0447\u0435\u0442",
          "page": null,
          "note": "\u0420\u0430\u0441\u0447\u0435\u0442 \u043d\u0430 \u0443\u0436\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u044e\u0449\u0443\u044e \u0434\u0430\u0442\u0443 \u043d\u0435 \u0444\u043e\u0440\u043c\u0438\u0440\u0443\u0435\u0442\u0441\u044f \u2014 Alert \u0432 \u043e\u043a\u043d\u0435.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "[data-modal=\"create-fv-scrim\"]",
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
              "target": "#create-fv-date",
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
          "state": 26,
          "id": "register-file-error",
          "title": "\u041e\u0448\u0438\u0431\u043a\u0430 \u0444\u0430\u0439\u043b\u0430 \u043f\u0440\u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0435 FV",
          "page": "FairValueRegister.preview.html?file=format",
          "note": "\u0421\u043d\u0435\u043a\u0431\u0430\u0440 \u0441 \u043e\u0448\u0438\u0431\u043a\u043e\u0439 \u0444\u0430\u0439\u043b\u0430; \u0434\u0440\u0443\u0433\u0438\u0435 \u0432\u0430\u0440\u0438\u0430\u043d\u0442\u044b \u2014 ?file=empty, ?file=structure, ?file=size.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "[data-menu=\"fv-register-menu\"]",
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
              "target": "[data-fv-upload=\"fv\"]",
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
              "target": "#upload-stub-pick",
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
              "target": ".snack--error",
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
      "id": "statuses-financier",
      "title": "\u0421\u0442\u0430\u0442\u0443\u0441\u044b \u0440\u0430\u0441\u0447\u0435\u0442\u0430, \u0444\u0438\u043d\u0430\u043d\u0441\u0438\u0441\u0442",
      "desc": "\u041a\u043d\u043e\u043f\u043a\u0438 \u0438 \u043c\u0435\u043d\u044e \u00ab\u22ee\u00bb \u043f\u043e \u0441\u0442\u0430\u0442\u0443\u0441\u0443 \u0440\u0430\u0441\u0447\u0435\u0442\u0430, \u0440\u043e\u043b\u044c \u00ab\u0424\u0438\u043d\u0430\u043d\u0441\u0438\u0441\u0442 \u0438 \u0434\u0440\u0443\u0433\u0438\u0435\u00bb",
      "steps": [
        {
          "state": 3,
          "id": "st-forming",
          "title": "\u0424\u043e\u0440\u043c\u0438\u0440\u0443\u0435\u0442\u0441\u044f",
          "page": "FairValueCalculation.preview.html?id=17&role=FINANCIER",
          "note": "\u041a\u043d\u043e\u043f\u043a\u0438 \u0438 \u043c\u0435\u043d\u044e \u0432\u044b\u043a\u043b\u044e\u0447\u0435\u043d\u044b, \u043f\u043e\u043a\u0430 \u0440\u0430\u0441\u0447\u0435\u0442 \u0444\u043e\u0440\u043c\u0438\u0440\u0443\u0435\u0442\u0441\u044f.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 4,
          "id": "st-formed",
          "title": "\u0421\u0444\u043e\u0440\u043c\u0438\u0440\u043e\u0432\u0430\u043d",
          "page": "FairValueCalculation.preview.html?id=16&role=FINANCIER",
          "note": "\u0414\u043e\u0441\u0442\u0443\u043f\u043d\u0430 \u00ab\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0432 LP\u00bb; \u0441\u0442\u0440\u043e\u043a\u0438 \u043c\u043e\u0436\u043d\u043e \u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0434\u043e \u043e\u0442\u043f\u0440\u0430\u0432\u043a\u0438 \u0438 \u043f\u043e\u0441\u043b\u0435.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 5,
          "id": "st-sent",
          "title": "\u041e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d \u0432 LP",
          "page": "FairValueCalculation.preview.html?id=15&role=FINANCIER",
          "note": "\u0412 \u043c\u0435\u043d\u044e \u00ab\u041e\u0431\u043d\u043e\u0432\u0438\u0442\u044c\u00bb, \u00ab\u0412\u044b\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0432 XML\u00bb, \u00ab\u0412\u044b\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0432 xlsx\u00bb.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 6,
          "id": "st-calculating",
          "title": "\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u044b\u0432\u0430\u0435\u0442\u0441\u044f LP",
          "page": "FairValueCalculation.preview.html?id=14&role=FINANCIER",
          "note": null,
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 7,
          "id": "st-calculated",
          "title": "\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043d",
          "page": "FairValueCalculation.preview.html?id=13&role=FINANCIER",
          "note": "\u0423 \u0444\u0438\u043d\u0430\u043d\u0441\u0438\u0441\u0442\u0430 \u043d\u0435\u0442 \u043a\u043d\u043e\u043f\u043a\u0438 \u00ab\u0423\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c\u00bb; \u043f\u043e\u0432\u0442\u043e\u0440\u043d\u0430\u044f \u043e\u0442\u043f\u0440\u0430\u0432\u043a\u0430 \u0432 LP \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043d\u0430.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 8,
          "id": "st-error",
          "title": "\u041e\u0448\u0438\u0431\u043a\u0430",
          "page": "FairValueCalculation.preview.html?id=11&role=FINANCIER",
          "note": "\u041a\u043d\u043e\u043f\u043a\u0438 \u00ab\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0432 LP\u00bb \u043d\u0435\u0442 \u2014 \u0441\u043d\u0430\u0447\u0430\u043b\u0430 \u00ab\u041f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c\u00bb.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 9,
          "id": "st-approved",
          "title": "\u0423\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d",
          "page": "FairValueCalculation.preview.html?id=12&role=FINANCIER",
          "note": null,
          "recorded": null,
          "issues": [],
          "do": []
        }
      ]
    },
    {
      "id": "statuses-risk",
      "title": "\u0420\u043e\u043b\u044c \u00ab\u0420\u0438\u0441\u043a-\u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u00bb",
      "desc": "\u0423\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u0435 \u0440\u0430\u0441\u0447\u0435\u0442\u0430",
      "steps": [
        {
          "state": 10,
          "id": "risk-calculated",
          "title": "\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043d \u2014 \u0435\u0441\u0442\u044c \u00ab\u0423\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c\u00bb",
          "page": "FairValueCalculation.preview.html?id=13&role=RISK_MANAGER",
          "note": "\u00ab\u0423\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c\u00bb \u0432\u0438\u0434\u043d\u0430 \u0442\u043e\u043b\u044c\u043a\u043e \u0440\u0438\u0441\u043a-\u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u0443 \u0438 \u0442\u043e\u043b\u044c\u043a\u043e \u0432 \u0441\u0442\u0430\u0442\u0443\u0441\u0435 \u00ab\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043d\u00bb.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 11,
          "id": "risk-approve-confirm",
          "title": "\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u0435 \u0443\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u044f",
          "page": null,
          "note": null,
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#act-approve",
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
              "target": "#confirm-ok",
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
          "state": 12,
          "id": "risk-approved",
          "title": "\u0420\u0430\u0441\u0447\u0435\u0442 \u0443\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d",
          "page": null,
          "note": null,
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#confirm-ok",
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
              "target": "#calc-chips",
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
      "id": "item-window",
      "title": "\u041e\u043a\u043d\u043e \u0424\u0418",
      "desc": "\u041f\u0440\u0430\u0432\u043a\u0430 \u0440\u0435\u0439\u0442\u0438\u043d\u0433\u0430, LGD, \u0441\u0442\u0430\u0432\u043a\u0438 \u041f\u0410\u041e \u0438 \u0444\u0430\u0439\u043b\u044b \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u043e\u0432",
      "steps": [
        {
          "state": 13,
          "id": "item-open",
          "title": "\u041e\u043a\u043d\u043e \u0424\u0418",
          "page": "FairValueCalculation.preview.html?id=16&role=FINANCIER",
          "note": "\u041e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u0434\u0432\u043e\u0439\u043d\u044b\u043c \u043a\u043b\u0438\u043a\u043e\u043c \u043f\u043e \u0441\u0442\u0440\u043e\u043a\u0435, \u043f\u043e \u043d\u0430\u0438\u043c\u0435\u043d\u043e\u0432\u0430\u043d\u0438\u044e \u0424\u0418 \u0438\u043b\u0438 \u043a\u0430\u0440\u0430\u043d\u0434\u0430\u0448\u043e\u043c.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "[data-row-edit=\"168\"]",
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
              "target": "[data-fv-save]",
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
          "id": "item-save-confirm",
          "title": "\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u0435 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u044f",
          "page": null,
          "note": "\u041f\u0440\u0430\u0432\u043a\u0438 \u043f\u043e\u043f\u0430\u0434\u0430\u044e\u0442 \u0432 \u0434\u0430\u043d\u043d\u044b\u0435 \u0442\u043e\u043b\u044c\u043a\u043e \u043f\u043e\u0441\u043b\u0435 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u044f; \u0424\u0418 \u0441\u0442\u0430\u043d\u043e\u0432\u0438\u0442\u0441\u044f \u00ab\u0421\u0444\u043e\u0440\u043c\u0438\u0440\u043e\u0432\u0430\u043d\u00bb.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "fill",
              "target": "#fv-m-rating",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "30",
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
              "target": "[data-fv-save]",
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
              "target": "#confirm-ok",
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
          "state": 15,
          "id": "item-upload-error",
          "title": "\u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u0444\u0430\u0439\u043b\u0430 \u043d\u0435 \u0443\u0434\u0430\u043b\u0430\u0441\u044c",
          "page": "FairValueCalculation.preview.html?id=16&role=FINANCIER&upload=fail",
          "note": "Alert \u00ab\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0444\u0430\u0439\u043b\u00bb \u0432 \u043e\u043a\u043d\u0435 \u0424\u0418.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "[data-row-edit=\"168\"]",
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
              "target": "[data-fv-save]",
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
              "target": "[data-fv-act=\"upload\"]",
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
              "target": "#confirm-ok",
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
      "id": "download-alfa",
      "title": "\u0412\u044b\u0433\u0440\u0443\u0437\u043a\u0430 \u0431\u0435\u0437 \u0448\u0438\u0444\u0440\u043e\u0432\u0430\u043d\u0438\u044f (\u0441\u0435\u0442\u044c \u0410\u043b\u044c\u0444\u0430)",
      "desc": "\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044f; \u043e\u0448\u0438\u0431\u043a\u0430 \u0432\u044b\u0433\u0440\u0443\u0437\u043a\u0438 \u0440\u0430\u0441\u0447\u0435\u0442\u0430 \u2014 \u0441\u043d\u0435\u043a\u0431\u0430\u0440",
      "steps": [
        {
          "state": 16,
          "id": "dl-alfa-confirm",
          "title": "\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044f",
          "page": "FairValueCalculation.preview.html?id=16&role=FINANCIER",
          "note": null,
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#act-menu-btn",
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
              "target": "[data-menu-action=\"exportXml\"]",
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
              "target": "[data-fv-dl-confirm]",
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
          "id": "dl-alfa-success",
          "title": "\u0424\u0430\u0439\u043b \u0432\u044b\u0433\u0440\u0443\u0436\u0435\u043d \u2014 \u0442\u043e\u0441\u0442",
          "page": "FairValueCalculation.preview.html?id=16&role=FINANCIER",
          "note": "\u041f\u043e\u0441\u043b\u0435 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u044f \u0432\u044b\u0433\u0440\u0443\u0437\u043a\u0430 \u0437\u0430\u0432\u0435\u0440\u0448\u0430\u0435\u0442\u0441\u044f \u0442\u043e\u0441\u0442\u043e\u043c \u00ab\u0424\u0430\u0439\u043b \u0432\u044b\u0433\u0440\u0443\u0436\u0435\u043d\u00bb.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#act-menu-btn",
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
              "target": "[data-menu-action=\"exportXml\"]",
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
              "target": "[data-fv-dl-confirm]",
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
              "target": ".snack--success",
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
          "id": "dl-alfa-error",
          "title": "\u041e\u0448\u0438\u0431\u043a\u0430 \u0432\u044b\u0433\u0440\u0443\u0437\u043a\u0438 \u2014 \u0441\u043d\u0435\u043a\u0431\u0430\u0440",
          "page": "FairValueCalculation.preview.html?id=16&role=FINANCIER&download=fail",
          "note": "\u041e\u0448\u0438\u0431\u043a\u0430 \u0432\u0441\u0435\u0433\u043e \u0440\u0430\u0441\u0447\u0435\u0442\u0430 \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0435\u0442\u0441\u044f \u0441\u043d\u0435\u043a\u0431\u0430\u0440\u043e\u043c.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#act-menu-btn",
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
              "target": "[data-menu-action=\"exportXml\"]",
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
              "target": "[data-fv-dl-confirm]",
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
              "target": ".snack--error",
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
      "id": "download-sigma",
      "title": "\u0412\u044b\u0433\u0440\u0443\u0437\u043a\u0430 \u0441 \u0448\u0438\u0444\u0440\u043e\u0432\u0430\u043d\u0438\u0435\u043c (\u0441\u0435\u0442\u044c \u0421\u0438\u0433\u043c\u0430)",
      "desc": "\u0412\u044b\u0431\u043e\u0440 \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u043e\u0432, \u043a\u043e\u0442\u043e\u0440\u044b\u043c \u0431\u0443\u0434\u0435\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d \u0444\u0430\u0439\u043b",
      "steps": [
        {
          "state": 18,
          "id": "dl-sigma-open",
          "title": "\u0412\u044b\u0433\u0440\u0443\u0437\u043a\u0430 \u0440\u0430\u0441\u0447\u0435\u0442\u0430",
          "page": "FairValueCalculation.preview.html?id=16&role=FINANCIER&net=sigma",
          "note": null,
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#act-menu-btn",
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
              "target": "[data-menu-action=\"exportXlsx\"]",
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
              "target": "[data-fv-dl-submit]",
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
          "id": "dl-sigma-email",
          "title": "\u0414\u043e\u0431\u0430\u0432\u043b\u0435\u043d \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a \u043f\u043e e-mail",
          "page": null,
          "note": "\u0410\u0434\u0440\u0435\u0441 \u0432\u043d\u0435 \u0441\u043f\u0440\u0430\u0432\u043e\u0447\u043d\u0438\u043a\u0430 \u043f\u043e\u043f\u0430\u0434\u0430\u0435\u0442 \u0432 \u043a\u043e\u043b\u043e\u043d\u043a\u0443 \u0441\u0432\u043e\u0435\u0433\u043e \u0434\u043e\u043c\u0435\u043d\u0430.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "fill",
              "target": "#fv-dl-email",
              "text": null,
              "index": 0,
              "timeout": 4000,
              "value": "PetrovAA@sberbank.ru",
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
              "target": "[data-fv-dl-add-email]",
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
          "id": "dl-sigma-error",
          "title": "\u041e\u0448\u0438\u0431\u043a\u0430 \u0432\u044b\u0433\u0440\u0443\u0437\u043a\u0438 \u0444\u0430\u0439\u043b\u0430 \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u0430",
          "page": "FairValueCalculation.preview.html?id=16&role=FINANCIER&net=sigma&download=fail",
          "note": "\u0414\u043b\u044f \u0444\u0430\u0439\u043b\u0430 \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u0430 \u043e\u0448\u0438\u0431\u043a\u0430 \u2014 Alert \u0432 \u043e\u043a\u043d\u0435 \u0424\u0418, \u0434\u043b\u044f \u0440\u0430\u0441\u0447\u0435\u0442\u0430 \u2014 \u0441\u043d\u0435\u043a\u0431\u0430\u0440.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "[data-row-edit=\"168\"]",
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
              "target": "[data-fv-save]",
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
              "target": "[data-fv-act=\"exportTemplate\"]",
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
              "target": "[data-fv-dl-confirm]",
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
              "target": "[data-fv-dl-confirm]",
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
              "target": "[data-fv-error]",
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
      "id": "lp-movement",
      "title": "\u0414\u0432\u0438\u0436\u0435\u043d\u0438\u0435 \u0441\u0442\u0430\u0442\u0443\u0441\u043e\u0432 \u043f\u043e\u0441\u043b\u0435 \u043e\u0442\u043f\u0440\u0430\u0432\u043a\u0438 \u0432 LP",
      "desc": "\u041e\u0442\u0432\u0435\u0442 LP \u0438\u043c\u0438\u0442\u0438\u0440\u0443\u0435\u0442\u0441\u044f \u043a\u043b\u0438\u043a\u043e\u043c \u043f\u043e \u0447\u0438\u043f\u0443 \u0441\u0442\u0430\u0442\u0443\u0441\u0430 \u0432 \u0448\u0430\u043f\u043a\u0435",
      "steps": [
        {
          "state": 21,
          "id": "lp-formed",
          "title": "\u0421\u0444\u043e\u0440\u043c\u0438\u0440\u043e\u0432\u0430\u043d",
          "page": "FairValueCalculation.preview.html?id=16&role=RISK_MANAGER",
          "note": "\u041d\u0430\u0436\u043c\u0438\u0442\u0435 \u00ab\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0432 LP\u00bb \u0438 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0435.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 22,
          "id": "lp-sent",
          "title": "\u041e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d \u0432 LP",
          "page": null,
          "note": "\u0427\u0438\u043f \u0441\u0442\u0430\u0442\u0443\u0441\u0430 \u0432 \u0448\u0430\u043f\u043a\u0435 \u2014 \u0434\u0435\u043c\u043e-\u0442\u0440\u0438\u0433\u0433\u0435\u0440 \u043e\u0442\u0432\u0435\u0442\u0430 LP.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#act-send",
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
              "target": "#confirm-ok",
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
              "target": "#calc-status-chip",
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
          "id": "lp-calculating",
          "title": "\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u044b\u0432\u0430\u0435\u0442\u0441\u044f LP",
          "page": null,
          "note": null,
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#calc-status-chip",
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
          "state": 24,
          "id": "lp-calculated",
          "title": "\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043d",
          "page": null,
          "note": "\u041f\u043e\u044f\u0432\u0438\u043b\u0438\u0441\u044c \u0441\u0443\u043c\u043c\u044b FV; \u0440\u0438\u0441\u043a-\u043c\u0435\u043d\u0435\u0434\u0436\u0435\u0440\u0443 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u0430 \u00ab\u0423\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c\u00bb.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#calc-status-chip",
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
              "target": "#act-approve",
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
  "comments": [
    {
      "n": 1,
      "status": "open",
      "created": "08.10.2026 17:29",
      "author": null,
      "page": "FairValueRegister.preview.html",
      "step": {
        "state": 2
      },
      "resolution": null,
      "body": "**\u041f\u0440\u0430\u0432\u0430 \u0440\u043e\u043b\u0435\u0439 \u043d\u0430 \u00ab\u041d\u043e\u0432\u044b\u0439 \u0440\u0430\u0441\u0447\u0435\u0442\u00bb \u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0443 \u0444\u0430\u0439\u043b\u043e\u0432**\n\n\u041a\u0430\u043a\u0438\u0435 \u0440\u043e\u043b\u0438 \u043c\u043e\u0433\u0443\u0442 \u0444\u043e\u0440\u043c\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0440\u0430\u0441\u0447\u0435\u0442, \u0437\u0430\u0433\u0440\u0443\u0436\u0430\u0442\u044c FV \u0438 \u043a\u043e\u043c\u043f\u043e\u043d\u0435\u043d\u0442\u044b FV? \u0412 \u043c\u0430\u043a\u0435\u0442\u0430\u0445 \u043f\u0440\u0430\u0432\u0430 \u043d\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u044b. \u0421\u0435\u0439\u0447\u0430\u0441 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e \u043e\u0431\u0435\u0438\u043c \u0440\u043e\u043b\u044f\u043c.\n\n\u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a\u0438: FairValueRegister \u00a713 \u043f. 4; CreateFairValueCalculationModal \u043f. 1; ReservesFvModal, ReservesFvComponentsModal."
    },
    {
      "n": 2,
      "status": "open",
      "created": "08.10.2026 17:29",
      "author": null,
      "page": "FairValueRegister.preview.html",
      "step": {
        "state": 2
      },
      "resolution": null,
      "body": "**\u0420\u0430\u0441\u0447\u0435\u0442 \u043d\u0430 \u0434\u0430\u0442\u0443 \u0438\u043b\u0438 \u043d\u0430 \u043a\u043e\u043d\u0435\u0446 \u043c\u0435\u0441\u044f\u0446\u0430**\n\n\u0421\u043e\u0437\u0434\u0430\u0435\u0442\u0441\u044f \u043b\u0438 \u0440\u0430\u0441\u0447\u0435\u0442 \u043d\u0430 \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u0443\u044e \u0434\u0430\u0442\u0443 \u0438\u043b\u0438 \u043d\u0430 \u043a\u043e\u043d\u0435\u0446 \u043c\u0435\u0441\u044f\u0446\u0430? \u041e\u043a\u043d\u043e \u043f\u0440\u0438\u043d\u0438\u043c\u0430\u0435\u0442 \u043b\u044e\u0431\u0443\u044e \u0434\u0430\u0442\u0443. \u041d\u0443\u0436\u043d\u043e \u0443\u0442\u043e\u0447\u043d\u0438\u0442\u044c \u0443 \u043a\u043e\u043b\u043b\u0435\u0433.\n\n\u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a\u0438: RE0012 \u0432\u043e\u043f\u0440\u043e\u0441 3; FairValueRegister \u00a713 \u043f. 5; FairValueCalculation \u00a713 \u043f. 3; CreateFairValueCalculationModal \u043f. 3."
    },
    {
      "n": 3,
      "status": "open",
      "created": "08.10.2026 17:29",
      "author": null,
      "page": "FairValueRegister.preview.html",
      "step": {
        "state": 2
      },
      "resolution": null,
      "body": "**\u0414\u0430\u0442\u0430 \u0432 \u0431\u0443\u0434\u0443\u0449\u0435\u043c \u0438\u043b\u0438 \u0432 \u0432\u044b\u0445\u043e\u0434\u043d\u043e\u0439 \u0434\u0435\u043d\u044c**\n\n\u0414\u043e\u043f\u0443\u0441\u0442\u0438\u043c\u0430 \u043b\u0438 \u0434\u0430\u0442\u0430 \u0440\u0430\u0441\u0447\u0435\u0442\u0430 \u0432 \u0431\u0443\u0434\u0443\u0449\u0435\u043c \u0438\u043b\u0438 \u0432 \u0432\u044b\u0445\u043e\u0434\u043d\u043e\u0439 \u0434\u0435\u043d\u044c? \u0412 \u043c\u0430\u043a\u0435\u0442\u0430\u0445 \u043d\u0435 \u0441\u043a\u0430\u0437\u0430\u043d\u043e, \u043e\u043a\u043d\u043e \u043f\u0440\u0438\u043d\u0438\u043c\u0430\u0435\u0442 \u043b\u044e\u0431\u0443\u044e \u0434\u0430\u0442\u0443.\n\n\u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a\u0438: CreateFairValueCalculationModal \u043f. 2."
    },
    {
      "n": 4,
      "status": "done",
      "created": "08.10.2026 17:29",
      "author": null,
      "page": "FairValueRegister.preview.html",
      "step": {
        "state": 2
      },
      "resolution": "08.10.2026 \u2014 \u0422\u0430\u043a\u043e\u0433\u043e \u043f\u0443\u0442\u0438 \u043d\u0435 \u0434\u0430\u0451\u043c: \u0447\u0442\u043e\u0431\u044b \u043f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c, \u043d\u0443\u0436\u043d\u043e \u043e\u0442\u043a\u0440\u044b\u0442\u044c \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u044e\u0449\u0438\u0439 \u0440\u0430\u0441\u0447\u0435\u0442 \u0438 \u043f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c \u0432 \u043d\u0451\u043c.",
      "body": "**\u041f\u0443\u0442\u044c \u00ab\u043f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u044e\u0449\u0438\u0439\u00bb \u0438\u0437 \u0442\u0435\u043a\u0441\u0442\u0430 \u043e\u0448\u0438\u0431\u043a\u0438**\n\n\u0412 \u043e\u0448\u0438\u0431\u043a\u0435 \u00ab\u0420\u0430\u0441\u0447\u0435\u0442 \u043d\u0430 \u044d\u0442\u0443 \u0434\u0430\u0442\u0443 \u0443\u0436\u0435 \u0441\u0444\u043e\u0440\u043c\u0438\u0440\u043e\u0432\u0430\u043d\u00bb \u0441\u043a\u0430\u0437\u0430\u043d\u043e, \u0447\u0442\u043e \u0435\u0433\u043e \u043c\u043e\u0436\u043d\u043e \u043f\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044c, \u043d\u043e \u043e\u043a\u043d\u043e \u0442\u0430\u043a\u043e\u0433\u043e \u043f\u0443\u0442\u0438 \u043d\u0435 \u043f\u0440\u0435\u0434\u043b\u0430\u0433\u0430\u0435\u0442. \u041d\u0443\u0436\u043d\u0430 \u043b\u0438 \u0441\u0441\u044b\u043b\u043a\u0430 \u0438\u043b\u0438 \u043a\u043d\u043e\u043f\u043a\u0430 \u043d\u0430 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u044e\u0449\u0438\u0439 \u0440\u0430\u0441\u0447\u0435\u0442?\n\n\u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a\u0438: CreateFairValueCalculationModal \u043f. 4."
    },
    {
      "n": 5,
      "status": "done",
      "created": "08.10.2026 17:29",
      "author": null,
      "page": "FairValueRegister.preview.html",
      "step": {
        "state": 1
      },
      "resolution": "08.10.2026 \u2014 \u041e\u0448\u0438\u0431\u043a\u0438 \u0444\u0430\u0439\u043b\u0430 \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u044e\u0442\u0441\u044f \u0441\u043d\u0435\u043a\u0431\u0430\u0440\u043e\u043c (\u043d\u0435\u0432\u0435\u0440\u043d\u044b\u0439 \u0444\u043e\u0440\u043c\u0430\u0442, \u043f\u0443\u0441\u0442\u043e\u0439 \u0444\u0430\u0439\u043b, \u043d\u0435\u0442 \u043a\u043e\u043b\u043e\u043d\u043e\u043a, \u0440\u0430\u0437\u043c\u0435\u0440); \u0434\u0435\u043c\u043e \u2014 ?file=format|empty|structure|size. \u0422\u0435\u043a\u0441\u0442\u044b \u043d\u0430\u0448\u0438.",
      "body": "**\u041e\u0448\u0438\u0431\u043a\u0438 \u0444\u0430\u0439\u043b\u0430 \u043f\u0440\u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0435 FV \u0438 \u043a\u043e\u043c\u043f\u043e\u043d\u0435\u043d\u0442\u043e\u0432**\n\n\u041e\u0448\u0438\u0431\u043a\u0438 \u0444\u0430\u0439\u043b\u0430 (\u043d\u0435\u0432\u0435\u0440\u043d\u044b\u0439 \u0444\u043e\u0440\u043c\u0430\u0442, \u043f\u0443\u0441\u0442\u043e\u0439 \u0444\u0430\u0439\u043b) \u0432 \u043c\u0430\u043a\u0435\u0442\u0430\u0445 \u043d\u0435 \u043d\u0430\u0440\u0438\u0441\u043e\u0432\u0430\u043d\u044b. \u041f\u0440\u043e\u0442\u043e\u0442\u0438\u043f \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0435\u0442 \u0442\u043e\u043b\u044c\u043a\u043e \u0443\u0441\u043f\u0435\u0448\u043d\u044b\u0439 \u043f\u0440\u0435\u0434\u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440.\n\n\u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a\u0438: ReservesFvModal \u043f. 2; ReservesFvComponentsModal \u043f. 2."
    },
    {
      "n": 6,
      "status": "done",
      "created": "08.10.2026 17:29",
      "author": null,
      "page": "FairValueRegister.preview.html",
      "step": {
        "state": 1
      },
      "resolution": "08.10.2026 \u2014 \u041e\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u0439 \u0437\u0430 \u0438\u043d\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u044b Post \u0438 \u043b\u043e\u043a\u0430\u043b\u044c\u043d\u044b\u0435 \u043a\u043e\u043c\u043f\u043e\u043d\u0435\u043d\u0442\u044b Post \u2014 \u0430\u0432\u0442\u043e\u0440 \u043f\u0440\u043e\u0435\u043a\u0442\u0430; \u0432 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430\u0446\u0438\u0438 \u0438 \u043f\u0430\u0441\u043f\u043e\u0440\u0442\u0430\u0445 \u043d\u0435 \u043e\u0442\u043c\u0435\u0447\u0430\u0435\u0442\u0441\u044f, \u043f\u0443\u043d\u043a\u0442\u044b \u0443\u0431\u0440\u0430\u043d\u044b.",
      "body": "**\u0412\u043b\u0430\u0434\u0435\u043b\u044c\u0446\u044b \u0432\u0438\u0434\u0436\u0435\u0442\u043e\u0432 \u043d\u0435 \u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d\u044b**\n\n\u0423 \u0432\u0438\u0434\u0436\u0435\u0442\u043e\u0432 \u043c\u043e\u0434\u0443\u043b\u044f (\u043e\u043a\u043d\u0430 \u0440\u0435\u0435\u0441\u0442\u0440\u0430, \u043e\u043a\u043d\u043e \u0424\u0418, \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0438 \u0438 \u0432\u044b\u0433\u0440\u0443\u0437\u043a\u0438 \u0444\u0430\u0439\u043b\u043e\u0432, \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u0435) \u043d\u0435 \u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d \u0432\u043b\u0430\u0434\u0435\u043b\u0435\u0446. \u041a\u0442\u043e \u043e\u0442\u0432\u0435\u0447\u0430\u0435\u0442 \u0437\u0430 \u043a\u0430\u0436\u0434\u044b\u0439 \u0438\u0437 \u043d\u0438\u0445?\n\n\u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a\u0438: \u041f\u0430\u0441\u043f\u043e\u0440\u0442\u0430 \u0432\u0441\u0435\u0445 \u0432\u0438\u0434\u0436\u0435\u0442\u043e\u0432 \u043c\u043e\u0434\u0443\u043b\u044f, \u043f\u0443\u043d\u043a\u0442 \u00ab\u0412\u043b\u0430\u0434\u0435\u043b\u0435\u0446\u00bb."
    },
    {
      "n": 7,
      "status": "done",
      "created": "08.10.2026 17:29",
      "author": null,
      "page": "FairValueCalculation.preview.html",
      "step": {
        "state": 3
      },
      "resolution": "08.10.2026 \u2014 \u0414\u043b\u044f \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430 \u0434\u043e\u0441\u0442\u0430\u0442\u043e\u0447\u043d\u043e 2 \u0441, \u043f\u0440\u043e\u043c\u0435\u0436\u0443\u0442\u043e\u0447\u043d\u044b\u0445 \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0439 \u043d\u0435\u0442.",
      "body": "**\u041f\u0435\u0440\u0435\u0445\u043e\u0434 \u00ab\u0424\u043e\u0440\u043c\u0438\u0440\u0443\u0435\u0442\u0441\u044f\u00bb \u2192 \u00ab\u0421\u0444\u043e\u0440\u043c\u0438\u0440\u043e\u0432\u0430\u043d\u00bb \u0447\u0435\u0440\u0435\u0437 2 \u0441**\n\n\u0412 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0435 \u0440\u0430\u0441\u0447\u0435\u0442 \u0441\u0430\u043c \u043f\u0435\u0440\u0435\u0445\u043e\u0434\u0438\u0442 \u0438\u0437 \u00ab\u0424\u043e\u0440\u043c\u0438\u0440\u0443\u0435\u0442\u0441\u044f\u00bb \u0432 \u00ab\u0421\u0444\u043e\u0440\u043c\u0438\u0440\u043e\u0432\u0430\u043d\u00bb \u0447\u0435\u0440\u0435\u0437 2 \u0441\u0435\u043a\u0443\u043d\u0434\u044b. \u042d\u0442\u043e \u0443\u0441\u043b\u043e\u0432\u043d\u043e\u0441\u0442\u044c. \u0421\u043a\u043e\u043b\u044c\u043a\u043e \u0444\u043e\u0440\u043c\u0438\u0440\u0443\u0435\u0442\u0441\u044f \u0440\u0430\u0441\u0447\u0435\u0442 \u0432 \u043f\u0440\u043e\u0434\u0443\u043a\u0442\u0435 \u0438 \u0435\u0441\u0442\u044c \u043b\u0438 \u043f\u0440\u043e\u043c\u0435\u0436\u0443\u0442\u043e\u0447\u043d\u044b\u0435 \u0441\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u044f?\n\n\u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a\u0438: FairValueRegister \u00a713 \u043f. 3; FairValueCalculation \u00a713 \u043f. 7."
    },
    {
      "n": 8,
      "status": "open",
      "created": "08.10.2026 17:29",
      "author": null,
      "page": "FairValueCalculation.preview.html",
      "step": {
        "state": 4
      },
      "resolution": null,
      "body": "**\u041a\u043e\u043b\u043e\u043d\u043a\u0438 \u00ab\u0421\u0442\u0430\u0442\u0443\u0441 \u0424\u0418\u00bb \u0438 \u00ab\u0421\u0442\u0430\u0442\u0443\u0441 \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u043e\u0432 (xml)\u00bb**\n\n\u041d\u0430 \u043c\u0430\u043a\u0435\u0442\u0430\u0445 \u043a\u043e\u043b\u043e\u043d\u043a\u0430 \u00ab\u0421\u0442\u0430\u0442\u0443\u0441 \u0424\u0418\u00bb \u043f\u0443\u0441\u0442\u0430. \u0414\u043e\u043f\u0443\u0449\u0435\u043d\u0438\u0435: \u043f\u0435\u0440\u0432\u0430\u044f \u043a\u043e\u043b\u043e\u043d\u043a\u0430 \u2014 \u0441\u0442\u0430\u0442\u0443\u0441 \u0441\u0430\u043c\u043e\u0433\u043e \u0424\u0418, \u0432\u0442\u043e\u0440\u0430\u044f \u2014 \u0441\u0432\u043e\u0434\u043d\u044b\u0439 \u0441\u0442\u0430\u0442\u0443\u0441 \u0435\u0433\u043e XML-\u0444\u0430\u0439\u043b\u043e\u0432. \u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c \u0443 \u043a\u043e\u043b\u043b\u0435\u0433.\n\n\u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a\u0438: RE0012 \u0432\u043e\u043f\u0440\u043e\u0441 1; FairValueCalculation \u00a713 \u043f. 1."
    },
    {
      "n": 9,
      "status": "open",
      "created": "08.10.2026 17:29",
      "author": null,
      "page": "FairValueCalculation.preview.html",
      "step": {
        "state": 5
      },
      "resolution": null,
      "body": "**\u041a\u043d\u043e\u043f\u043a\u0430 \u00ab\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0432 LP\u00bb \u0432 \u00ab\u041e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d \u0432 LP\u00bb \u0438 \u00ab\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u044b\u0432\u0430\u0435\u0442\u0441\u044f LP\u00bb**\n\n\u0412 \u044d\u0442\u0438\u0445 \u0441\u0442\u0430\u0442\u0443\u0441\u0430\u0445 \u043a\u043d\u043e\u043f\u043a\u0438 \u00ab\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0432 LP\u00bb \u043d\u0435\u0442, \u0442\u0430\u043a \u043a\u0430\u043a \u0432 \u043c\u0430\u043a\u0435\u0442\u0435 \u0435\u0451 \u043d\u0435\u0442. \u0414\u043e\u043f\u0443\u0449\u0435\u043d\u0438\u0435. \u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c.\n\n\u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a\u0438: FairValueCalculation \u00a713 \u043f. 4."
    },
    {
      "n": 10,
      "status": "open",
      "created": "08.10.2026 17:29",
      "author": null,
      "page": "FairValueCalculation.preview.html",
      "step": {
        "state": 10
      },
      "resolution": null,
      "body": "**\u041f\u0440\u0430\u0432\u0430 \u0440\u043e\u043b\u0435\u0439 \u043d\u0430 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044f \u0440\u0430\u0441\u0447\u0435\u0442\u0430**\n\n\u041f\u0440\u0430\u0432\u0430 \u0440\u043e\u043b\u0435\u0439 \u043d\u0430 \u0432\u0441\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044f, \u043a\u0440\u043e\u043c\u0435 \u00ab\u0423\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c\u00bb, \u0432 \u043c\u0430\u043a\u0435\u0442\u0430\u0445 \u043d\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u044b: \u043f\u0440\u0430\u0432\u043a\u0430 \u0424\u0418, \u0444\u0430\u0439\u043b\u044b \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u043e\u0432, \u043e\u0442\u043f\u0440\u0430\u0432\u043a\u0430 \u0432 LP, \u043f\u0435\u0440\u0435\u0441\u0447\u0435\u0442, \u0432\u044b\u0433\u0440\u0443\u0437\u043a\u0430. \u0421\u0435\u0439\u0447\u0430\u0441 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e \u043e\u0431\u0435\u0438\u043c \u0440\u043e\u043b\u044f\u043c.\n\n\u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a\u0438: FairValueCalculation \u00a713 \u043f. 8; FairValueUserMetricsModal \u043f. 1; \u043e\u043a\u043d\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0438 \u0438 \u0432\u044b\u0433\u0440\u0443\u0437\u043a\u0438."
    },
    {
      "n": 11,
      "status": "open",
      "created": "08.10.2026 17:29",
      "author": null,
      "page": "FairValueCalculation.preview.html",
      "step": {
        "state": 13
      },
      "resolution": null,
      "body": "**\u041f\u0440\u0430\u0432\u043a\u0430 \u0424\u0418 \u0432 \u00ab\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043d\u00bb \u0438 \u00ab\u0423\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u00bb**\n\n\u041c\u0435\u043d\u044f\u0435\u0442\u0441\u044f \u043b\u0438 \u0441\u0442\u0430\u0442\u0443\u0441 \u0441\u0430\u043c\u043e\u0433\u043e \u0440\u0430\u0441\u0447\u0435\u0442\u0430 \u043f\u0440\u0438 \u043f\u0440\u0430\u0432\u043a\u0435 \u0424\u0418 \u0432 \u00ab\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043d\u00bb \u0438 \u00ab\u0423\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u00bb? \u041a\u0430\u043a \u0438\u0441\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043d\u044b\u0439 \u0424\u0418 \u043f\u043e\u043f\u0430\u0434\u0451\u0442 \u0432 LP, \u0435\u0441\u043b\u0438 \u0432 \u00ab\u0423\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u00bb \u043d\u0435\u0442 \u00ab\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0432 LP\u00bb? \u0414\u043e\u043f\u0443\u0449\u0435\u043d\u0438\u0435: \u0441\u0442\u0430\u0442\u0443\u0441 \u0440\u0430\u0441\u0447\u0435\u0442\u0430 \u043d\u0435 \u043c\u0435\u043d\u044f\u0435\u0442\u0441\u044f, \u0432 \u00ab\u0420\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043d\u00bb \u00ab\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0432 LP\u00bb \u0432\u043a\u043b\u044e\u0447\u0435\u043d\u0430.\n\n\u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a\u0438: RE0012 \u0432\u043e\u043f\u0440\u043e\u0441 2; FairValueCalculation \u00a713 \u043f. 2; FairValueUserMetricsModal \u043f. 4."
    },
    {
      "n": 12,
      "status": "done",
      "created": "08.10.2026 17:29",
      "author": null,
      "page": "FairValueCalculation.preview.html",
      "step": {
        "state": 13
      },
      "resolution": "08.10.2026 \u2014 \u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u043e.",
      "body": "**\u0423\u0434\u0430\u043b\u0435\u043d\u0438\u0435 \u0444\u0430\u0439\u043b\u0430 \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u0430 \u043f\u0435\u0440\u0435\u0432\u043e\u0434\u0438\u0442 \u0424\u0418 \u0432 \u00ab\u041d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445\u00bb**\n\n\u0414\u043e\u043f\u0443\u0449\u0435\u043d\u0438\u0435 \u043f\u043e \u0442\u0435\u043a\u0441\u0442\u0443 \u043c\u0430\u043a\u0435\u0442\u0430: \u0443\u0434\u0430\u043b\u0435\u043d\u0438\u0435 \u0444\u0430\u0439\u043b\u0430 \u043f\u0435\u0440\u0435\u0432\u043e\u0434\u0438\u0442 \u0438 \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442, \u0438 \u0432\u0435\u0441\u044c \u0424\u0418 \u0432 \u00ab\u041d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445\u00bb. \u0417\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u0444\u0430\u0439\u043b\u0430 \u0432\u043e\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u0442 \u0424\u0418 \u0432 \u00ab\u0421\u0444\u043e\u0440\u043c\u0438\u0440\u043e\u0432\u0430\u043d\u00bb, \u0435\u0441\u043b\u0438 \u0444\u0430\u0439\u043b\u043e\u0432 \u0431\u0435\u0437 \u0434\u0430\u043d\u043d\u044b\u0445 \u043d\u0435 \u043e\u0441\u0442\u0430\u043b\u043e\u0441\u044c. \u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c.\n\n\u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a\u0438: RE0012 \u0432\u043e\u043f\u0440\u043e\u0441 5; FairValueCalculation \u00a713 \u043f. 9; FairValueUserMetricsModal \u043f. 5."
    },
    {
      "n": 13,
      "status": "done",
      "created": "08.10.2026 17:29",
      "author": null,
      "page": "FairValueCalculation.preview.html",
      "step": {
        "state": 13
      },
      "resolution": "08.10.2026 \u2014 \u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u043e.",
      "body": "**\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044f \u043d\u0430\u0434 \u0444\u0430\u0439\u043b\u043e\u043c \u0434\u043b\u044f \u00ab\u0412\u043e\u0437\u0432\u0440\u0430\u0449\u0435\u043d \u0438\u0437 LP\u00bb, \u00ab\u041e\u0448\u0438\u0431\u043a\u0430\u00bb, \u00ab\u041d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445\u00bb**\n\n\u0412 \u043c\u0430\u043a\u0435\u0442\u0430\u0445 \u043d\u0430\u0431\u043e\u0440 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0439 \u0434\u043b\u044f \u044d\u0442\u0438\u0445 \u0441\u0442\u0430\u0442\u0443\u0441\u043e\u0432 \u043d\u0435 \u043d\u0430\u0437\u0432\u0430\u043d. \u0414\u043e\u043f\u0443\u0449\u0435\u043d\u0438\u0435: \u043a\u0430\u043a \u0443 \u00ab\u0421\u0444\u043e\u0440\u043c\u0438\u0440\u043e\u0432\u0430\u043d\u00bb \u2014 \u043f\u043e\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0437\u0430\u043d\u043e\u0432\u043e.\n\n\u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a\u0438: RE0012 \u0432\u043e\u043f\u0440\u043e\u0441 5; FairValueCalculation \u00a713 \u043f. 10."
    },
    {
      "n": 14,
      "status": "done",
      "created": "08.10.2026 17:29",
      "author": null,
      "page": "FairValueCalculation.preview.html",
      "step": {
        "state": 14
      },
      "resolution": "08.10.2026 \u2014 \u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u043e.",
      "body": "**\u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u0435 \u0424\u0418 \u0431\u0435\u0437 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0439 \u0438 \u043f\u043e\u0432\u0442\u043e\u0440\u043d\u043e\u0435 \u0444\u043e\u0440\u043c\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435 XML**\n\n\u0414\u043e\u043f\u0443\u0449\u0435\u043d\u0438\u0435: \u00ab\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c\u00bb \u0431\u0435\u0437 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0439 \u0437\u0430\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u043e\u043a\u043d\u043e \u0431\u0435\u0437 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u044f, \u043b\u044e\u0431\u043e\u0435 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0435 (\u0432 \u0442\u043e\u043c \u0447\u0438\u0441\u043b\u0435 \u00ab\u041f\u0435\u0440\u0435\u0434\u0430\u0432\u0430\u0442\u044c \u0432 LP\u00bb) \u0437\u0430\u043d\u043e\u0432\u043e \u0444\u043e\u0440\u043c\u0438\u0440\u0443\u0435\u0442 XML. \u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044c.\n\n\u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a\u0438: RE0012 \u0432\u043e\u043f\u0440\u043e\u0441 5; FairValueCalculation \u00a713 \u043f. 12; FairValueUserMetricsModal \u043f. 6."
    },
    {
      "n": 15,
      "status": "open",
      "created": "08.10.2026 17:29",
      "author": null,
      "page": "FairValueCalculation.preview.html",
      "step": {
        "state": 15
      },
      "resolution": null,
      "body": "**\u041f\u0440\u043e\u0432\u0435\u0440\u043a\u0438 \u0444\u0430\u0439\u043b\u0430 \u0438\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u0430 \u0438 \u0442\u0435\u043a\u0441\u0442\u044b \u043e\u0448\u0438\u0431\u043e\u043a**\n\n\u041a\u0430\u043a\u0438\u0435 \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0438 \u043f\u0440\u043e\u0445\u043e\u0434\u0438\u0442 \u0437\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043c\u044b\u0439 \u0444\u0430\u0439\u043b \u0438 \u043a\u0430\u043a\u0438\u0435 \u0442\u0435\u043a\u0441\u0442\u044b \u043e\u0448\u0438\u0431\u043e\u043a \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0442\u044c? \u0412 \u043c\u0430\u043a\u0435\u0442\u0430\u0445 \u043d\u0435\u0442. \u0421\u0435\u0439\u0447\u0430\u0441 \u043e\u0448\u0438\u0431\u043a\u0430 \u043e\u0434\u043d\u0430: \u00ab\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044c \u0444\u0430\u0439\u043b\u00bb.\n\n\u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a\u0438: FairValueInstrumentablesUploadFileModal \u043f. 1."
    },
    {
      "n": 16,
      "status": "done",
      "created": "08.10.2026 17:29",
      "author": null,
      "page": "FairValueCalculation.preview.html",
      "step": {
        "state": 18
      },
      "resolution": "08.10.2026 \u2014 \u0418\u0437\u043d\u0430\u0447\u0430\u043b\u044c\u043d\u043e \u0442\u0430\u0431\u043b\u0438\u0446\u0430 \u043f\u043e\u043b\u0443\u0447\u0430\u0442\u0435\u043b\u0435\u0439 \u043f\u0443\u0441\u0442\u0430\u044f.",
      "body": "**\u041d\u0430\u0447\u0430\u043b\u044c\u043d\u044b\u0439 \u0441\u043f\u0438\u0441\u043e\u043a \u043f\u043e\u043b\u0443\u0447\u0430\u0442\u0435\u043b\u0435\u0439 \u0432\u044b\u0433\u0440\u0443\u0437\u043a\u0438**\n\n\u0412 \u043c\u0430\u043a\u0435\u0442\u0435 \u0432 \u0442\u0430\u0431\u043b\u0438\u0446\u0435 \u0441\u0440\u0430\u0437\u0443 \u0447\u0435\u0442\u044b\u0440\u0435 \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u0430, \u043e\u0442\u043a\u0443\u0434\u0430 \u043e\u043d\u0438 \u0431\u0435\u0440\u0443\u0442\u0441\u044f (\u043f\u0440\u043e\u0448\u043b\u0430\u044f \u0432\u044b\u0433\u0440\u0443\u0437\u043a\u0430, \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0430), \u043d\u0435 \u0441\u043a\u0430\u0437\u0430\u043d\u043e. \u0412 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0435 \u043f\u043e\u043a\u0430\u0437\u0430\u043d\u044b \u0434\u0432\u043e\u0435 \u0438\u0437 \u0441\u043f\u0440\u0430\u0432\u043e\u0447\u043d\u0438\u043a\u0430, \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u043d\u044b\u0435 \u043f\u043e\u043b\u0443\u0447\u0430\u0442\u0435\u043b\u0438 \u0441\u043e\u0445\u0440\u0430\u043d\u044f\u044e\u0442\u0441\u044f \u043c\u0435\u0436\u0434\u0443 \u043e\u0442\u043a\u0440\u044b\u0442\u0438\u044f\u043c\u0438.\n\n\u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a\u0438: DownloadReportModal \u043f. 2."
    },
    {
      "n": 17,
      "status": "done",
      "created": "08.10.2026 17:29",
      "author": null,
      "page": "FairValueCalculation.preview.html",
      "step": {
        "state": 18
      },
      "resolution": "08.10.2026 \u2014 \u0421\u0435\u0442\u044c \u2014 \u043e\u0442\u043a\u0443\u0434\u0430 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c \u0432\u0445\u043e\u0434\u0438\u0442 \u0432 \u0441\u0438\u0441\u0442\u0435\u043c\u0443: \u0421\u0438\u0433\u043c\u0430 (\u0441 \u0434\u043e\u0441\u0442\u0443\u043f\u043e\u043c \u0432 \u0438\u043d\u0442\u0435\u0440\u043d\u0435\u0442) \u2014 \u0448\u0438\u0444\u0440\u043e\u0432\u0430\u043d\u0438\u0435; \u0410\u043b\u044c\u0444\u0430 \u0438 \u041e\u043c\u0435\u0433\u0430 (\u0432\u043d\u0443\u0442\u0440\u0435\u043d\u043d\u044f\u044f \u0441\u0435\u0442\u044c \u0431\u0430\u043d\u043a\u0430) \u2014 \u0431\u0435\u0437. \u0412 \u043f\u0440\u043e\u0434\u0443\u043a\u0442\u0435 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u0435\u0442\u0441\u044f \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0438 \u043f\u043e \u043b\u043e\u0433\u0438\u043d\u0443, \u043d\u0430 \u043a\u0430\u0436\u0434\u0443\u044e \u0441\u0435\u0442\u044c \u0441\u0432\u043e\u0439 \u043b\u043e\u0433\u0438\u043d; \u0432 \u0434\u0435\u043c\u043e \u043f\u0435\u0440\u0435\u043a\u043b\u044e\u0447\u0430\u0435\u0442\u0441\u044f \u043d\u0430 \u043f\u0430\u043d\u0435\u043b\u0438.",
      "body": "**\u041f\u0435\u0440\u0435\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435 \u0441\u0435\u0442\u0438 \u0432\u044b\u0433\u0440\u0443\u0437\u043a\u0438**\n\n\u0421\u0435\u0442\u044c \u0421\u0438\u0433\u043c\u0430 (\u0441 \u0448\u0438\u0444\u0440\u043e\u0432\u0430\u043d\u0438\u0435\u043c) \u0438\u043b\u0438 \u0410\u043b\u044c\u0444\u0430 (\u0431\u0435\u0437) \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u0435\u0442 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0430: \u0432 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0435 \u043f\u0430\u0440\u0430\u043c\u0435\u0442\u0440\u043e\u043c `?net=sigma`, \u0432 \u043f\u0430\u043d\u0435\u043b\u0438 \u2014 \u043e\u0442\u0434\u0435\u043b\u044c\u043d\u044b\u043c\u0438 \u0441\u0446\u0435\u043d\u0430\u0440\u0438\u044f\u043c\u0438. \u041a\u0430\u043a \u0441\u0435\u0442\u044c \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u0435\u0442\u0441\u044f \u0432 \u043f\u0440\u043e\u0434\u0443\u043a\u0442\u0435?\n\n\u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a\u0438: FairValueCalculation \u00a713 \u043f. 13; DownloadReportModal \u043f. 1."
    },
    {
      "n": 18,
      "status": "done",
      "created": "08.10.2026 17:29",
      "author": null,
      "page": "FairValueCalculation.preview.html",
      "step": {
        "state": 19
      },
      "resolution": "08.10.2026 \u2014 \u0423 \u0432\u043d\u0443\u0442\u0440\u0435\u043d\u043d\u0438\u0445 \u0434\u043e\u043c\u0435\u043d\u043e\u0432 (\u0410\u043b\u044c\u0444\u0430, \u041e\u043c\u0435\u0433\u0430) \u0435\u0441\u0442\u044c \u0441\u0432\u043e\u0451 \u0434\u043e\u043c\u0435\u043d\u043d\u043e\u0435 \u0438\u043c\u044f, \u0432\u0441\u0435 \u043e\u0441\u0442\u0430\u043b\u044c\u043d\u044b\u0435 \u2014 \u0432\u043d\u0435\u0448\u043d\u0438\u0435.",
      "body": "**\u041e\u043f\u0440\u0435\u0434\u0435\u043b\u0435\u043d\u0438\u0435 \u0434\u043e\u043c\u0435\u043d\u0430 \u043f\u043e e-mail**\n\n\u041a\u0430\u043a \u0441\u0438\u0441\u0442\u0435\u043c\u0430 \u043f\u043e\u043d\u0438\u043c\u0430\u0435\u0442, \u0432\u043e \u0432\u043d\u0435\u0448\u043d\u0435\u043c \u0438\u043b\u0438 \u0432\u043e \u0432\u043d\u0443\u0442\u0440\u0435\u043d\u043d\u0435\u043c \u0434\u043e\u043c\u0435\u043d\u0435 \u0430\u0434\u0440\u0435\u0441, \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u043d\u044b\u0439 \u043f\u043e e-mail? \u0412 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0435 \u0430\u0434\u0440\u0435\u0441 \u0441 \u00abomega\u00bb \u0438\u043b\u0438 \u00abalfa\u00bb \u0441\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044f \u0432\u043d\u0443\u0442\u0440\u0435\u043d\u043d\u0438\u043c.\n\n\u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a\u0438: DownloadReportModal \u043f. 3."
    }
  ],
  "commentsPreamble": "# \u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438 \u043a \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0443\n\n\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438 \u043f\u0438\u0448\u0435\u0442 \u043f\u0430\u043d\u0435\u043b\u044c \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430 (Alt+Shift+P \u043d\u0430 \u043b\u044e\u0431\u043e\u0439 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430)\n\u0438 \u043f\u0440\u0430\u0432\u0438\u0442 \u0430\u0433\u0435\u043d\u0442. \u0424\u043e\u0440\u043c\u0430\u0442 \u2014 `.agents/proto-panel/README.md`, \u0440\u0430\u0437\u0434\u0435\u043b \u00abcomments.md\u00bb.",
  "commentErrors": []
};
