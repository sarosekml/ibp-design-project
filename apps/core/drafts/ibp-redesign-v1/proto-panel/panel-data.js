/* СГЕНЕРИРОВАН из flows.yaml и comments.md — руками не править.
   Пересобрать: node .agents/tools/proto-panel.mjs */
window.ProtoPanelData = {
  "format": 1,
  "app": {
    "id": "ibp-redesign-v1",
    "title": "\u0422\u0435\u043a\u0443\u0449\u0430\u044f \u0441\u0438\u0441\u0442\u0435\u043c\u0430 - \u0410\u043d\u0430\u043b\u0438\u0442\u0438\u043a \u0414\u0418\u0414"
  },
  "sources": {
    "flows": "3d7b2574",
    "comments": "e533f5f9"
  },
  "flowsHeader": [
    "# \u0421\u0446\u0435\u043d\u0430\u0440\u0438\u0438 \u043f\u043e\u043a\u0430\u0437\u0430 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430 IBP Redesign v1 \u2014 \u0447\u0430\u0441\u0442\u044c 1 (MS0014, \u0438\u043c\u0435\u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446 \u2014 MS0014a).",
    "# \u0424\u043e\u0440\u043c\u0430\u0442 \u2014 .agents/proto-panel/README.md, \u0440\u0430\u0437\u0434\u0435\u043b \u00abflows.yaml\u00bb.",
    "# \u0421\u0446\u0435\u043d\u0430\u0440\u0438\u0438 1\u20132 \u0438\u0437 \u0440\u0430\u0437\u0434\u0435\u043b\u0430 9 \u0437\u0430\u0434\u0430\u0447\u0438 MS0014 (\u0440\u0435\u0448\u0435\u043d\u0438\u0435 \u04208); \u043e\u0441\u0442\u0430\u043b\u044c\u043d\u044b\u0435 \u2014 \u043f\u043e\u0437\u0436\u0435.",
    "# \u041f\u043e\u0441\u043b\u0435 \u043f\u0440\u0430\u0432\u043a\u0438: node .agents/tools/proto-panel.mjs (\u043f\u0435\u0440\u0435\u0441\u043e\u0431\u0440\u0430\u0442\u044c \u0437\u0435\u0440\u043a\u0430\u043b\u043e)."
  ],
  "lastState": 9,
  "flows": [
    {
      "id": "analyst-week",
      "title": "\u041d\u0435\u0434\u0435\u043b\u044f \u0430\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0430 \u0441\u0435\u0433\u043e\u0434\u043d\u044f",
      "desc": "\u0411\u0430\u0437\u043e\u0432\u0430\u044f \u043b\u0438\u043d\u0438\u044f \u00ab\u043a\u0430\u043a \u0441\u0435\u0439\u0447\u0430\u0441\u00bb \u0434\u043b\u044f \u0441\u0440\u0430\u0432\u043d\u0435\u043d\u0438\u044f \u0441 MS0015 \u2014 \u0441\u043a\u043e\u043b\u044c\u043a\u043e \u0440\u0430\u0437\u0434\u0435\u043b\u043e\u0432 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u0430\u043d\u0430\u043b\u0438\u0442\u0438\u043a, \u0447\u0442\u043e\u0431\u044b \u043e\u0445\u0432\u0430\u0442\u0438\u0442\u044c \u043e\u0434\u043d\u043e\u0433\u043e \u043a\u043b\u0438\u0435\u043d\u0442\u0430",
      "steps": [
        {
          "state": 1,
          "id": "home",
          "title": "\u0413\u043b\u0430\u0432\u043d\u0430\u044f",
          "page": "HomePage.html",
          "note": "\u041f\u043b\u0438\u0442\u043a\u0438 \u0440\u043e\u043b\u0438 \u00ab\u0410\u043d\u0430\u043b\u0438\u0442\u0438\u043a \u0414\u0418\u0414\u00bb. \u0414\u0430\u043b\u044c\u0448\u0435 \u043f\u043e \u043f\u0443\u0442\u0438: \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u0430\u044f \u0441\u0434\u0435\u043b\u043a\u0430 \u2192 Pipeline \u2192 \u043f\u0440\u043e\u0435\u043a\u0442\u044b CIB \u2192 \u043b\u0438\u0434\u044b \u2192 \u043a\u043b\u0438\u0435\u043d\u0442. \u0420\u0430\u0437\u0434\u0435\u043b\u043e\u0432 \u043e\u0442\u043a\u0440\u044b\u0442\u043e: 1.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 2,
          "id": "binding",
          "title": "\u041e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u044b\u0435 \u0441\u0434\u0435\u043b\u043a\u0438 \u2192 \u0441\u0434\u0435\u043b\u043a\u0430",
          "page": "BindingActiveNewOpportunities.preview.html?tab=BindingActiveNewOpportunities",
          "note": "\u041d\u0435\u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0435\u043d\u043d\u044b\u0435 \u0441\u0442\u0440\u043e\u043a\u0438 \u043f\u043e\u0434\u0441\u0432\u0435\u0447\u0435\u043d\u044b. \u041f\u0435\u0440\u0435\u0445\u043e\u0434 \u043f\u043e ID \u0432\u0435\u0434\u0451\u0442 \u043d\u0430 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u0441\u0434\u0435\u043b\u043a\u0438. \u0420\u0430\u0437\u0434\u0435\u043b\u043e\u0432 \u043e\u0442\u043a\u0440\u044b\u0442\u043e: 2.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#nav .nav__item[href=\"BindingActiveNewOpportunities.preview.html\"]",
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
          "state": 3,
          "id": "deal",
          "title": "\u0421\u0434\u0435\u043b\u043a\u0430 166092 \u2014 \u0432\u0437\u044f\u0442\u044c \u0432 \u0440\u0430\u0431\u043e\u0442\u0443",
          "page": "Opportunity.preview.html?source=binding&id=166092&tab=active-new",
          "note": "\u00ab\u0412\u0437\u044f\u0442\u044c \u0432 \u0440\u0430\u0431\u043e\u0442\u0443\u00bb (\u04207): \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u0435 \u2192 \u0441\u0434\u0435\u043b\u043a\u0430 \u0443\u0445\u043e\u0434\u0438\u0442 \u0432 Pipeline \u00ab\u0421\u0434\u0435\u043b\u043a\u0438 \u043c\u043e\u0435\u0433\u043e \u0434\u0435\u0441\u043a\u0430\u00bb. \u0420\u0430\u0437\u0434\u0435\u043b\u043e\u0432 \u043e\u0442\u043a\u0440\u044b\u0442\u043e: 3.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 4,
          "id": "pipeline",
          "title": "Pipeline \u2014 \u0441\u0434\u0435\u043b\u043a\u0430 \u043f\u043e\u044f\u0432\u0438\u043b\u0430\u0441\u044c",
          "page": "MyDeskOpportunities.preview.html?tab=MyDeskOpportunities",
          "note": "\u0412\u0437\u044f\u0442\u0430\u044f \u0441\u0434\u0435\u043b\u043a\u0430 \u0432\u0438\u0434\u043d\u0430 \u0432 \u0440\u0435\u0435\u0441\u0442\u0440\u0435 Pipeline. \u0422\u043e\u0442 \u0436\u0435 \u043a\u043b\u0438\u0435\u043d\u0442 \u0432 CIB \u2014 \u0434\u0443\u0431\u043b\u044c \u043d\u0430\u043c\u0435\u0440\u0435\u043d\u043d\u044b\u0439. \u0420\u0430\u0437\u0434\u0435\u043b\u043e\u0432 \u043e\u0442\u043a\u0440\u044b\u0442\u043e: 4.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#nav .nav__item[href=\"MyDeskOpportunities.preview.html\"]",
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
          "id": "cib",
          "title": "\u041f\u0440\u043e\u0435\u043a\u0442\u044b \u043f\u0440\u043e\u0434\u0430\u0436 CIB \u2014 \u0442\u043e\u0442 \u0436\u0435 \u043a\u043b\u0438\u0435\u043d\u0442",
          "page": "OpportunityActiveSalesProjects.preview.html?tab=OpportunityActiveSalesProjects",
          "note": "\u041a\u043b\u0438\u0435\u043d\u0442 \u0432\u0442\u043e\u0440\u043e\u0439 \u0440\u0430\u0437 \u0432 \u0434\u0440\u0443\u0433\u043e\u043c \u0440\u0435\u0435\u0441\u0442\u0440\u0435 \u2014 \u0431\u043e\u043b\u044c, \u0441 \u043a\u043e\u0442\u043e\u0440\u043e\u0439 \u0440\u0430\u0431\u043e\u0442\u0430\u0435\u0442 \u0447\u0430\u0441\u0442\u044c 2. \u0420\u0430\u0437\u0434\u0435\u043b\u043e\u0432 \u043e\u0442\u043a\u0440\u044b\u0442\u043e: 5.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#nav .nav__item[href=\"OpportunityActiveSalesProjects.preview.html\"]",
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
          "state": 6,
          "id": "leads",
          "title": "\u041b\u0438\u0434\u044b \u2192 \u043b\u0438\u0434 \u2192 \u041f\u0435\u0440\u0435\u043c\u0435\u0441\u0442\u0438\u0442\u044c \u0432 Pipeline",
          "page": "LeadsPage.preview.html?tab=LeadsPage",
          "note": "L-44: \u00ab\u041f\u0435\u0440\u0435\u043c\u0435\u0441\u0442\u0438\u0442\u044c \u0432 Pipeline\u00bb (\u04207) \u0441\u043e\u0437\u0434\u0430\u0451\u0442 \u0441\u0434\u0435\u043b\u043a\u0443 \u0432 Pipeline; \u043b\u0438\u0434 \u0443\u0445\u043e\u0434\u0438\u0442 \u0438\u0437 \u0440\u0435\u0435\u0441\u0442\u0440\u0430. \u0420\u0430\u0437\u0434\u0435\u043b\u043e\u0432 \u043e\u0442\u043a\u0440\u044b\u0442\u043e: 6.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#nav .nav__item[href=\"LeadsPage.preview.html\"]",
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
          "id": "client",
          "title": "\u041a\u043b\u0438\u0435\u043d\u0442 \u2192 \u0421\u0434\u0435\u043b\u043a\u0438 \u2014 \u0447\u0435\u0442\u044b\u0440\u0435 \u0442\u0430\u0431\u043b\u0438\u0446\u044b \u043b\u0438\u0434\u043e\u0432",
          "page": "ClientInfoPage.preview.html?id=3000012345&tab=ClientInfoDealsPage",
          "note": "\u0412\u043a\u043b\u0430\u0434\u043a\u0430 \u00ab\u0421\u0434\u0435\u043b\u043a\u0438 \u2192 \u041b\u0438\u0434\u044b\u00bb: \u043b\u0438\u0434\u044b \u043a\u043b\u0438\u0435\u043d\u0442\u0430 \u0440\u0430\u0437\u043b\u043e\u0436\u0435\u043d\u044b \u043f\u043e \u0447\u0435\u0442\u044b\u0440\u0451\u043c \u0442\u0430\u0431\u043b\u0438\u0446\u0430\u043c \u2014 \u0442\u043e, \u0447\u0442\u043e \u0447\u0430\u0441\u0442\u044c 2 \u0437\u0430\u043c\u0435\u043d\u044f\u0435\u0442 \u0435\u0434\u0438\u043d\u044b\u043c \u0440\u0430\u0437\u0434\u0435\u043b\u043e\u043c. \u0420\u0430\u0437\u0434\u0435\u043b\u043e\u0432 \u043e\u0442\u043a\u0440\u044b\u0442\u043e: 7.",
          "recorded": null,
          "issues": [],
          "do": [
            {
              "verb": "click",
              "target": "#nav .nav__item[href=\"MyClientsPage.preview.html\"]",
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
      "id": "meeting-born-lead",
      "title": "\u0412\u0441\u0442\u0440\u0435\u0447\u0430 \u0440\u043e\u0434\u0438\u043b\u0430 \u043b\u0438\u0434",
      "desc": "\u0412\u0441\u0442\u0440\u0435\u0447\u0438 \u2192 \u043f\u0440\u0435\u0434\u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440 \u2192 \u0438\u0441\u0442\u043e\u0447\u043d\u0438\u043a \u0432\u0441\u0442\u0440\u0435\u0447\u0438 L-\u2026 \u2192 \u043b\u0438\u0434 (\u0441\u0446\u0435\u043d\u0430\u0440\u0438\u0439 2 \u0440\u0430\u0437\u0434\u0435\u043b\u0430 9 \u0422\u0417)",
      "steps": [
        {
          "state": 8,
          "id": "meetings",
          "title": "\u0412\u0441\u0442\u0440\u0435\u0447\u0438 \u2014 \u043f\u0440\u0435\u0434\u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440 M-8904",
          "page": "MeetingsProtocolsPage.preview.html?id=M-8904",
          "note": "\u0412\u044b\u0431\u043e\u0440 \u0441\u0442\u0440\u043e\u043a\u0438 \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0435\u0442 \u043a\u0430\u0440\u0442\u043e\u0447\u043a\u0443: \u0438\u0441\u0442\u043e\u0447\u043d\u0438\u043a \u0432\u0441\u0442\u0440\u0435\u0447\u0438 \u2014 \u041f\u043e\u0442\u0435\u043d\u0446\u0438\u0430\u043b, \u0447\u0438\u043f-\u0441\u0441\u044b\u043b\u043a\u0430 L-118846.",
          "recorded": null,
          "issues": [],
          "do": []
        },
        {
          "state": 9,
          "id": "lead",
          "title": "\u041b\u0438\u0434 L-118846",
          "page": "PotentialPage.preview.html?id=L-118846",
          "note": "\u041f\u0435\u0440\u0435\u0445\u043e\u0434 \u043f\u043e \u0438\u0441\u0442\u043e\u0447\u043d\u0438\u043a\u0443 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0435\u0442 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u043b\u0438\u0434\u0430 \u2014 \u0432\u0441\u0442\u0440\u0435\u0447\u0430 \u0438 \u043b\u0438\u0434 \u0441\u0432\u044f\u0437\u0430\u043d\u044b.",
          "recorded": null,
          "issues": [],
          "do": []
        }
      ]
    }
  ],
  "flowErrors": [],
  "comments": [],
  "commentsPreamble": "# \u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438 \u043a \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0443\n\n\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438 \u043f\u0438\u0448\u0435\u0442 \u043f\u0430\u043d\u0435\u043b\u044c \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430 (Alt+Shift+P \u043d\u0430 \u043b\u044e\u0431\u043e\u0439 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0435 \u043f\u0440\u043e\u0442\u043e\u0442\u0438\u043f\u0430)\n\u0438 \u043f\u0440\u0430\u0432\u0438\u0442 \u0430\u0433\u0435\u043d\u0442. \u0424\u043e\u0440\u043c\u0430\u0442 \u2014 `.agents/proto-panel/README.md`, \u0440\u0430\u0437\u0434\u0435\u043b \u00abcomments.md\u00bb.",
  "commentErrors": []
};
