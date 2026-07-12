export const checklistData = {
  "moduleId": "aw139-checklist",
  "title": "AW139 Checklist",
  "aircraft": "AW139",
  "contentStatus": "APPROVED",
  "revision": {
    "source": "NCL AW 139 REV. 24.pdf",
    "sourceRevision": "24",
    "effectiveDate": "26/06/2026",
    "sourceDocumentTitle": "AW-139 NORMAL CHECK LIST",
    "sourceArea": "OPR",
    "sourceBasis": "ROTORCRAFT FLIGHT MANUAL, Issue 2 (AW139 OMNI)",
    "datasetVersion": "v2.0.0-rev24",
    "validatedBy": "APPROVED",
    "notes": "Conteúdo validado item a item contra NCL AW 139 REV. 24.pdf."
  },
  "flowRules": {
    "oneGroupPerPage": true,
    "blockNextGroupUntilComplete": true,
    "resumeLastGroup": true,
    "saveProgressOffline": true
  },
  "phases": [
    {
      "id": "normal-cockpit-checks",
      "title": "COCKPIT CHECKS",
      "categoryId": "normal",
      "categoryTitle": "NORMAL CHECK LIST",
      "pdfPage": 1,
      "items": [
        {
          "id": "ncc-001",
          "challenge": "EFBs / FLIGHT DOCUMENTATION",
          "response": "ON BOARD",
          "required": true
        },
        {
          "id": "ncc-002",
          "challenge": "PEDALS AND SEATS",
          "response": "ADJUSTED",
          "required": true
        },
        {
          "id": "ncc-003",
          "challenge": "SEAT BELTS / LIFE JACKETS",
          "response": "FASTENED",
          "required": true
        },
        {
          "id": "ncc-004",
          "challenge": "CIRCUIT BREAKERS",
          "response": "ALL IN",
          "required": true
        },
        {
          "id": "ncc-005",
          "challenge": "ECL’s",
          "response": "FLIGHT",
          "required": true
        },
        {
          "id": "ncc-006",
          "challenge": "ROTOR BRAKE",
          "response": "OFF POSITION",
          "required": true
        },
        {
          "id": "ncc-007",
          "challenge": "OVERHEAD SWITCHES",
          "response": "A/R",
          "required": true
        },
        {
          "id": "ncc-008",
          "challenge": "STATIC SOURCES",
          "response": "GUARDED",
          "required": true
        },
        {
          "id": "ncc-009",
          "challenge": "STAND BY COMPASS",
          "response": "CHECKED",
          "required": true
        },
        {
          "id": "ncc-010",
          "challenge": "FIRE EXT. PANEL",
          "response": "CHECKED",
          "required": true
        },
        {
          "id": "ncc-011",
          "challenge": "COMPASS CONTROL",
          "response": "MAG",
          "required": true
        },
        {
          "id": "ncc-012",
          "challenge": "ENG FUEL & FUEL PUMP / XFEED",
          "response": "OFF / NORMAL",
          "required": true
        },
        {
          "id": "ncc-013",
          "challenge": "ENG MODE SWITCHES",
          "response": "OFF",
          "required": true
        },
        {
          "id": "ncc-014",
          "challenge": "MISC PANEL",
          "response": "A/R",
          "required": true
        },
        {
          "id": "ncc-015",
          "challenge": "RCP PANEL",
          "response": "NORM",
          "required": true
        },
        {
          "id": "ncc-016",
          "challenge": "DIM PANEL",
          "response": "ALL MAX",
          "required": true
        },
        {
          "id": "ncc-017",
          "challenge": "RADAR / VHF FM",
          "response": "OFF",
          "required": true
        },
        {
          "id": "ncc-018",
          "challenge": "COND & HTR / SOV",
          "response": "OFF / NORM",
          "required": true
        },
        {
          "id": "ncc-019",
          "challenge": "HYD CONTROL PANEL",
          "response": "CENTERED / GUARDED",
          "required": true
        },
        {
          "id": "ncc-020",
          "challenge": "COCKPIT & CABIN LIGHTS",
          "response": "A/R",
          "required": true
        },
        {
          "id": "ncc-021",
          "challenge": "SKYTRAC / CPI CONTROLLER",
          "response": "NORM / GUARDED",
          "required": true
        },
        {
          "id": "ncc-022",
          "challenge": "EMERG. FLOAT PANEL SWITCH",
          "response": "OFF",
          "required": true
        },
        {
          "id": "ncc-023",
          "challenge": "WIPER PANEL",
          "response": "A/R",
          "required": true
        },
        {
          "id": "ncc-024",
          "challenge": "AVCS (IF INSTALLED)",
          "response": "ON",
          "required": true
        },
        {
          "id": "ncc-025",
          "challenge": "EAPS (IF INSTALLED)",
          "response": "A/R",
          "required": true
        },
        {
          "id": "ncc-026",
          "challenge": "LANDING GEAR HANDLE",
          "response": "DOWN",
          "required": true
        },
        {
          "id": "ncc-027",
          "challenge": "FLOAT SWITCHES (COLL)",
          "response": "GUARDED",
          "required": true
        },
        {
          "id": "ncc-028",
          "challenge": "ENG GOV SWITCHES",
          "response": "AUTO",
          "required": true
        },
        {
          "id": "ncc-029",
          "challenge": "RPM SWITCH",
          "response": "100% NR",
          "required": true
        }
      ]
    },
    {
      "id": "normal-before-engine-start",
      "title": "BEFORE ENGINE START",
      "categoryId": "normal",
      "categoryTitle": "NORMAL CHECK LIST",
      "pdfPage": 1,
      "items": [
        {
          "id": "nbes-001",
          "challenge": "BATTERY MASTER",
          "response": "ON",
          "required": true
        },
        {
          "id": "nbes-002",
          "challenge": "BATTERY MAIN & AUX",
          "response": "ON / ___ VOLTS",
          "required": true,
          "callout": true
        },
        {
          "id": "nbes-003",
          "challenge": "EPU (IF USED)",
          "response": "ON",
          "required": true
        },
        {
          "id": "nbes-004",
          "challenge": "GEN 1 & 2",
          "response": "ON",
          "required": true,
          "callout": true
        },
        {
          "id": "nbes-005",
          "challenge": "BUS TIE",
          "response": "A/R",
          "required": true,
          "callout": true
        },
        {
          "id": "nbes-006",
          "challenge": "ANTI-COLL & POSITION LIGHTS",
          "response": "ON",
          "required": true,
          "callout": true
        },
        {
          "id": "nbes-007",
          "challenge": "MFD & CAS",
          "response": "CHECKED",
          "required": true,
          "callout": true
        },
        {
          "id": "nbes-008",
          "challenge": "FUEL QTY",
          "response": "CROSS-CHECKED",
          "required": true,
          "callout": true
        },
        {
          "id": "nbes-009",
          "challenge": "LDG GEAR / NOSE WHEEL / PARK BRK",
          "response": "3 GREEN / LOCKED / ON",
          "required": true,
          "callout": true
        },
        {
          "id": "nbes-010",
          "challenge": "POS INIT",
          "response": "LOADED",
          "required": true
        },
        {
          "id": "nbes-011",
          "challenge": "AFCS",
          "response": "NOT ENGAGED",
          "required": true
        },
        {
          "id": "nbes-012",
          "challenge": "EMERG LIGHTS",
          "response": "ARMED",
          "required": true
        },
        {
          "id": "nbes-013",
          "challenge": "FLIGHT CONTROLS",
          "response": "CENTERED / FULL DOWN",
          "required": true
        },
        {
          "id": "nbes-014",
          "challenge": "ATC CLEARANCE",
          "response": "OBTAINED",
          "required": true
        },
        {
          "id": "nbes-015",
          "challenge": "ALTIMETER SETTING",
          "response": "SET ___ / CROSS-CHECKED",
          "required": true
        },
        {
          "id": "nbes-016",
          "challenge": "POWER CHECK TARGET",
          "response": "NOTED",
          "required": true
        }
      ]
    },
    {
      "id": "normal-system-checks",
      "title": "SYSTEM CHECKS",
      "categoryId": "normal",
      "categoryTitle": "NORMAL CHECK LIST",
      "pdfPage": 1,
      "items": [
        {
          "id": "nsc-001",
          "challenge": "FLIGHT CONTROLS (1st Flight)",
          "response": "CHECKED",
          "required": true
        },
        {
          "id": "nsc-002",
          "challenge": "TEST CONTROL PANEL",
          "response": "CHECKED",
          "required": true,
          "callout": true
        },
        {
          "id": "nsc-003",
          "challenge": "EMERG FLOATS",
          "response": "NO FLOAT ON CAS / CHECKED",
          "required": true
        },
        {
          "id": "nsc-004",
          "challenge": "ENG BEEP TRIM",
          "response": "CHECKED",
          "required": true,
          "callout": true
        },
        {
          "id": "nsc-005",
          "challenge": "ENG GOV SWITCHES",
          "response": "AUTO",
          "required": true
        }
      ]
    },
    {
      "id": "normal-first-engine-start",
      "title": "FIRST ENGINE START",
      "categoryId": "normal",
      "categoryTitle": "NORMAL CHECK LIST",
      "pdfPage": 1,
      "items": [
        {
          "id": "nfes-001",
          "challenge": "MAIN BUS VOLTAGE",
          "response": "ABOVE 23V",
          "required": true
        },
        {
          "id": "nfes-002",
          "challenge": "ENGINE FUEL / FUEL PUMP",
          "response": "ON / CHECK PRESS",
          "required": true
        },
        {
          "id": "nfes-003",
          "challenge": "ENG MODE SWITCH",
          "response": "IDLE / TIMING",
          "required": true
        },
        {
          "id": "nfes-004",
          "challenge": "GEN (BATTERY START)",
          "response": "ON",
          "required": true
        },
        {
          "id": "nfes-005",
          "challenge": "ENG MODE SWITCH",
          "response": "FLT",
          "required": true
        },
        {
          "id": "nfes-006",
          "challenge": "POWERPLANT",
          "response": "ALL GREEN / NORMAL CAS",
          "required": true
        }
      ]
    },
    {
      "id": "normal-second-engine-start",
      "title": "SECOND ENGINE START",
      "categoryId": "normal",
      "categoryTitle": "NORMAL CHECK LIST",
      "pdfPage": 1,
      "items": [
        {
          "id": "nses-001",
          "challenge": "BUS TIE (BATTERY START)",
          "response": "ON",
          "required": true
        },
        {
          "id": "nses-002",
          "challenge": "GENERATOR LOAD (BATTERY START)",
          "response": "GREEN ARC",
          "required": true
        },
        {
          "id": "nses-003",
          "challenge": "ENGINE FUEL / FUEL PUMP",
          "response": "ON / CHECK PRESS",
          "required": true
        },
        {
          "id": "nses-004",
          "challenge": "ENG MODE SWITCH",
          "response": "IDLE / TIMING",
          "required": true
        },
        {
          "id": "nses-005",
          "challenge": "EPU (IF USED)",
          "response": "OFF / DISCONNECTED",
          "required": true
        },
        {
          "id": "nses-006",
          "challenge": "GEN 1 & 2",
          "response": "ON",
          "required": true
        },
        {
          "id": "nses-007",
          "challenge": "BUS TIE",
          "response": "AUTO",
          "required": true
        },
        {
          "id": "nses-008",
          "challenge": "RADIO MASTER",
          "response": "ON",
          "required": true
        },
        {
          "id": "nses-009",
          "challenge": "COND & HTR",
          "response": "A/R",
          "required": true
        },
        {
          "id": "nses-010",
          "challenge": "POWERPLANT",
          "response": "ALL GREEN / NORMAL CAS",
          "required": true
        }
      ]
    },
    {
      "id": "normal-flight-configuration",
      "title": "FLIGHT CONFIGURATION",
      "categoryId": "normal",
      "categoryTitle": "NORMAL CHECK LIST",
      "pdfPage": 1,
      "items": [
        {
          "id": "nfc-001",
          "challenge": "MCDU PRE-FLIGHT",
          "response": "COMPLETED",
          "required": true
        },
        {
          "id": "nfc-002",
          "challenge": "DC PANNEL CONFIG (NAV/BRGs)",
          "response": "SET / CROSS-CHECKED",
          "required": true
        },
        {
          "id": "nfc-003",
          "challenge": "ALT SEL",
          "response": "SET ___ FT",
          "required": true
        },
        {
          "id": "nfc-004",
          "challenge": "DH",
          "response": "CHECKED / SET 200FT",
          "required": true
        },
        {
          "id": "nfc-005",
          "challenge": "RADAR / VHF FM",
          "response": "STBY / ON",
          "required": true
        },
        {
          "id": "nfc-006",
          "challenge": "LIGHTS (INT & EXT)",
          "response": "A/R",
          "required": true
        },
        {
          "id": "nfc-007",
          "challenge": "ENG MODE SWITCHES",
          "response": "FLIGHT",
          "required": true
        },
        {
          "id": "nfc-008",
          "challenge": "FUEL XFEED & FUEL PUMPS",
          "response": "CHECKED / NORM / ON",
          "required": true
        },
        {
          "id": "nfc-009",
          "challenge": "AFCS",
          "response": "CHECKED / AP1 & AP2 ON / ATT",
          "required": true
        },
        {
          "id": "nfc-010",
          "challenge": "INSTRUMENTS CHECK",
          "response": "ALL GREEN / NORMAL CAS",
          "required": true
        }
      ]
    },
    {
      "id": "normal-taxing",
      "title": "TAXING",
      "categoryId": "normal",
      "categoryTitle": "NORMAL CHECK LIST",
      "pdfPage": 1,
      "items": [
        {
          "id": "ntx-001",
          "challenge": "ATC CLEARANCE",
          "response": "OBTAINED",
          "required": true
        },
        {
          "id": "ntx-002",
          "challenge": "NOSE WHEEL",
          "response": "UNLOCKED (IF NECESSARY)",
          "required": true
        },
        {
          "id": "ntx-003",
          "challenge": "PARK BRK",
          "response": "OFF",
          "required": true
        },
        {
          "id": "ntx-004",
          "challenge": "PEDAL BRAKES",
          "response": "CHECKED",
          "required": true
        },
        {
          "id": "ntx-005",
          "challenge": "HSI & SLIP & COMPASS",
          "response": "CHECKED",
          "required": true
        },
        {
          "id": "ntx-006",
          "challenge": "TAKE OFF BRIEFING",
          "response": "PERFORMED",
          "required": true
        }
      ]
    },
    {
      "id": "normal-before-take-off",
      "title": "BEFORE TAKE OFF",
      "categoryId": "normal",
      "categoryTitle": "NORMAL CHECK LIST",
      "pdfPage": 1,
      "items": [
        {
          "id": "nbto-001",
          "challenge": "POWER CHECK",
          "response": "PERFORMED",
          "required": true
        },
        {
          "id": "nbto-002",
          "challenge": "FUEL QTY",
          "response": "CROSS-CHECKED",
          "required": true
        },
        {
          "id": "nbto-003",
          "challenge": "ENG MODE SWITCHES",
          "response": "CHECK FLT",
          "required": true
        },
        {
          "id": "nbto-004",
          "challenge": "ATC CLEARANCE",
          "response": "OBTAINED",
          "required": true
        },
        {
          "id": "nbto-005",
          "challenge": "STROBE LIGHTS / LANDING",
          "response": "ON",
          "required": true
        },
        {
          "id": "nbto-006",
          "challenge": "XPONDER & TCAS",
          "response": "ON",
          "required": true
        },
        {
          "id": "nbto-007",
          "challenge": "RADAR",
          "response": "ON",
          "required": true
        },
        {
          "id": "nbto-008",
          "challenge": "FLOATS",
          "response": "A/R",
          "required": true
        },
        {
          "id": "nbto-009",
          "challenge": "CAT A",
          "response": "A/R",
          "required": true
        },
        {
          "id": "nbto-010",
          "challenge": "NOSE WHEEL",
          "response": "LOCKED",
          "required": true
        },
        {
          "id": "nbto-011",
          "challenge": "POWER PLANT",
          "response": "ALL GREEN / NORMAL CAS",
          "required": true
        }
      ]
    },
    {
      "id": "normal-after-take-off",
      "title": "AFTER TAKE OFF",
      "categoryId": "normal",
      "categoryTitle": "NORMAL CHECK LIST",
      "pdfPage": 1,
      "items": [
        {
          "id": "nato-001",
          "challenge": "LDG GEAR",
          "response": "UP AND LOCKED",
          "required": true
        },
        {
          "id": "nato-002",
          "challenge": "RPM SWITCH (≤ 90KT)",
          "response": "100% NR",
          "required": true
        },
        {
          "id": "nato-003",
          "challenge": "FD MODES",
          "response": "A/R",
          "required": true
        },
        {
          "id": "nato-004",
          "challenge": "DH",
          "response": "SET ___ FT",
          "required": true
        },
        {
          "id": "nato-005",
          "challenge": "PARK BRK",
          "response": "OFF",
          "required": true
        }
      ]
    },
    {
      "id": "normal-cruise",
      "title": "CRUISE",
      "categoryId": "normal",
      "categoryTitle": "NORMAL CHECK LIST",
      "pdfPage": 2,
      "items": [
        {
          "id": "ncr-001",
          "challenge": "ALTIMETER SETTING",
          "response": "SET",
          "required": true
        },
        {
          "id": "ncr-002",
          "challenge": "FD MODES",
          "response": "CHECKED",
          "required": true
        },
        {
          "id": "ncr-003",
          "challenge": "RADIOS / NAV",
          "response": "SET / CHECKED",
          "required": true
        },
        {
          "id": "ncr-004",
          "challenge": "ESIS",
          "response": "CROSS-CHECKED",
          "required": true
        },
        {
          "id": "ncr-005",
          "challenge": "LANDING / STROBE LIGHTS",
          "response": "A/R",
          "required": true
        },
        {
          "id": "ncr-006",
          "challenge": "POWER PLANT",
          "response": "ALL GREEN / NORMAL CAS",
          "required": true
        }
      ]
    },
    {
      "id": "normal-before-descent",
      "title": "BEFORE DESCENT",
      "categoryId": "normal",
      "categoryTitle": "NORMAL CHECK LIST",
      "pdfPage": 2,
      "items": [
        {
          "id": "nbd-001",
          "challenge": "ALTIMETER SETTING",
          "response": "SET",
          "required": true
        },
        {
          "id": "nbd-002",
          "challenge": "ALT SEL",
          "response": "SET ___ FT",
          "required": true
        },
        {
          "id": "nbd-003",
          "challenge": "LANDING / STROBE LIGHTS",
          "response": "ON",
          "required": true
        },
        {
          "id": "nbd-004",
          "challenge": "EGPWS / RADAR",
          "response": "CONFIGURED / ON",
          "required": true
        },
        {
          "id": "nbd-005",
          "challenge": "APPROACH BRIEFING",
          "response": "PERFORMED",
          "required": true
        }
      ]
    },
    {
      "id": "normal-before-landing",
      "title": "BEFORE LANDING",
      "categoryId": "normal",
      "categoryTitle": "NORMAL CHECK LIST",
      "pdfPage": 2,
      "items": [
        {
          "id": "nbl-001",
          "challenge": "LDG GEAR / NOSE WHEEL",
          "response": "DOWN / 3 GREEN / LOCKED",
          "required": true
        },
        {
          "id": "nbl-002",
          "challenge": "PARK BRK",
          "response": "A/R",
          "required": true
        },
        {
          "id": "nbl-003",
          "challenge": "DH",
          "response": "SET ___ FT",
          "required": true
        },
        {
          "id": "nbl-004",
          "challenge": "FLOATS (AFTER SHORELINE)",
          "response": "OFF",
          "required": true
        },
        {
          "id": "nbl-005",
          "challenge": "LANDING BRIEFING",
          "response": "PERFORMED",
          "required": true
        }
      ]
    },
    {
      "id": "normal-final-approach",
      "title": "FINAL APPROACH",
      "categoryId": "normal",
      "categoryTitle": "NORMAL CHECK LIST",
      "pdfPage": 2,
      "items": [
        {
          "id": "nfa-001",
          "challenge": "LDG GEAR",
          "response": "DOWN / 3 GREEN",
          "required": true
        },
        {
          "id": "nfa-002",
          "challenge": "RPM SWITCH (≤ 90KT)",
          "response": "A/R",
          "required": true
        },
        {
          "id": "nfa-003",
          "challenge": "AUTHORIZATION",
          "response": "CLEARED",
          "required": true
        }
      ]
    },
    {
      "id": "normal-after-landing",
      "title": "AFTER LANDING",
      "categoryId": "normal",
      "categoryTitle": "NORMAL CHECK LIST",
      "pdfPage": 2,
      "items": [
        {
          "id": "nal-001",
          "challenge": "NOSE WHEEL / PARK BRK",
          "response": "UNLOCKED / OFF",
          "required": true
        },
        {
          "id": "nal-002",
          "challenge": "RPM SWITCH",
          "response": "100% NR",
          "required": true
        },
        {
          "id": "nal-003",
          "challenge": "LANDING / STROBE LIGHTS",
          "response": "OFF",
          "required": true
        },
        {
          "id": "nal-004",
          "challenge": "RADAR / XPONDER",
          "response": "STBY",
          "required": true
        }
      ]
    },
    {
      "id": "normal-engines-shut-down",
      "title": "ENGINES SHUT DOWN",
      "categoryId": "normal",
      "categoryTitle": "NORMAL CHECK LIST",
      "pdfPage": 2,
      "items": [
        {
          "id": "nesd-001",
          "challenge": "NOSE WHEEL / PARK BRK",
          "response": "LOCKED / ON",
          "required": true
        },
        {
          "id": "nesd-002",
          "challenge": "FLIGHT CONTROLS",
          "response": "CENTERED / FULL DOWN",
          "required": true
        },
        {
          "id": "nesd-003",
          "challenge": "BUS TIE",
          "response": "ON",
          "required": true
        },
        {
          "id": "nesd-004",
          "challenge": "ENG MODE SWITCHES",
          "response": "IDLE / TIMING",
          "required": true
        },
        {
          "id": "nesd-005",
          "challenge": "RADIO MASTER",
          "response": "GND",
          "required": true
        },
        {
          "id": "nesd-006",
          "challenge": "AFCS",
          "response": "DISENGAGED",
          "required": true
        },
        {
          "id": "nesd-007",
          "challenge": "VHF FM / EMERG LIGHTS / RADAR",
          "response": "OFF",
          "required": true
        },
        {
          "id": "nesd-008",
          "challenge": "COND & HTR",
          "response": "OFF",
          "required": true
        },
        {
          "id": "nesd-009",
          "challenge": "FUEL PUMPS (AFTER 1’)",
          "response": "OFF",
          "required": true
        },
        {
          "id": "nesd-010",
          "challenge": "VENT & ENG MODE SWITCHES",
          "response": "OFF",
          "required": true
        },
        {
          "id": "nesd-011",
          "challenge": "ENG FUEL (≤ 10%NG)",
          "response": "OFF",
          "required": true
        },
        {
          "id": "nesd-012",
          "challenge": "FUEL XFEED",
          "response": "CLOSED",
          "required": true
        },
        {
          "id": "nesd-013",
          "challenge": "ROTOR BRAKE (≤ 40%NR)",
          "response": "APPLY A/R",
          "required": true
        }
      ]
    },
    {
      "id": "normal-after-rotor-stops",
      "title": "AFTER ROTOR STOPS",
      "categoryId": "normal",
      "categoryTitle": "NORMAL CHECK LIST",
      "pdfPage": 2,
      "items": [
        {
          "id": "nars-001",
          "challenge": "INTERNAL LIGHTS",
          "response": "OFF",
          "required": true
        },
        {
          "id": "nars-002",
          "challenge": "FUEL QTY",
          "response": "NOTED",
          "required": true
        },
        {
          "id": "nars-003",
          "challenge": "BUS TIE / BATTERY MASTER and GEN (NG 0%)",
          "response": "AUTO / OFF",
          "required": true
        },
        {
          "id": "nars-004",
          "challenge": "BATTERY MAIN and AUX and ANTI COLL",
          "response": "OFF",
          "required": true
        }
      ]
    },
    {
      "id": "offshore-before-descent",
      "title": "BEFORE DESCENT",
      "categoryId": "offshore",
      "categoryTitle": "OFFSHORE CHECK LIST",
      "pdfPage": 2,
      "items": [
        {
          "id": "obd-001",
          "challenge": "ALTIMETER SETTING",
          "response": "SET",
          "required": true
        },
        {
          "id": "obd-002",
          "challenge": "PARK BRK",
          "response": "ON",
          "required": true
        },
        {
          "id": "obd-003",
          "challenge": "ALT SEL",
          "response": "SET ____ FT",
          "required": true
        },
        {
          "id": "obd-004",
          "challenge": "LANDING / STROBE LIGHTS",
          "response": "A/R",
          "required": true
        },
        {
          "id": "obd-005",
          "challenge": "APPROACH BRIEFING",
          "response": "PERFORMED",
          "required": true
        },
        {
          "id": "obd-006",
          "challenge": "HELIDECK CONTACT",
          "response": "DONE",
          "required": true
        }
      ]
    },
    {
      "id": "offshore-before-landing",
      "title": "BEFORE LANDING",
      "categoryId": "offshore",
      "categoryTitle": "OFFSHORE CHECK LIST",
      "pdfPage": 2,
      "items": [
        {
          "id": "obl-001",
          "challenge": "LDG GEAR / NOSE WHEEL",
          "response": "DOWN / 3 GREEN / LOCKED",
          "required": true
        },
        {
          "id": "obl-002",
          "challenge": "PARK BRK",
          "response": "ON",
          "required": true
        },
        {
          "id": "obl-004",
          "challenge": "DH",
          "response": "SET LDP",
          "required": true,
          "tags": [
            "LDP"
          ]
        },
        {
          "id": "obl-005",
          "challenge": "COMPASS",
          "response": "DG",
          "required": true
        },
        {
          "id": "obl-006",
          "challenge": "RADAR",
          "response": "STBY",
          "required": true
        },
        {
          "id": "obl-007",
          "challenge": "FLOATS",
          "response": "ARMED",
          "required": true
        },
        {
          "id": "obl-008",
          "challenge": "POWERPLANT",
          "response": "ALL GREEN / NO CAS",
          "required": true
        },
        {
          "id": "obl-009",
          "challenge": "LANDING BRIEFING",
          "response": "PERFORMED",
          "required": true
        }
      ]
    },
    {
      "id": "offshore-traffic-pattern",
      "title": "TRAFFIC PATTERN",
      "categoryId": "offshore",
      "categoryTitle": "OFFSHORE CHECK LIST",
      "pdfPage": 2,
      "items": [
        {
          "id": "otp-001",
          "challenge": "LANDING SITE",
          "response": "UNIT CONFIRMATION",
          "required": true,
          "unitInput": true,
          "tags": [
            "UNIT"
          ]
        },
        {
          "id": "otp-002",
          "challenge": "PF CALLS HELIDECK ICAO CODE FROM VISUAL AIDS",
          "response": "PM CROSS CHECK AGAINST FLIGHT PREVIEW AND READBACK THE NAME",
          "required": true,
          "note": "Linha destacada no checklist offshore para evitar confirmação incorreta da unidade.",
          "highlight": "yellow"
        }
      ]
    },
    {
      "id": "offshore-final-approach",
      "title": "FINAL APPROACH",
      "categoryId": "offshore",
      "categoryTitle": "OFFSHORE CHECK LIST",
      "pdfPage": 2,
      "items": [
        {
          "id": "ofa-001",
          "challenge": "LDG GEAR",
          "response": "DOWN / 3 GREEN",
          "required": true
        },
        {
          "id": "ofa-002",
          "challenge": "RPM SWITCH (≤ 90KT)",
          "response": "102% NR",
          "required": true
        },
        {
          "id": "ofa-003",
          "challenge": "LANDING AREA",
          "response": "IDENTIFIED & GREEN DECK",
          "required": true
        },
        {
          "id": "ofa-004",
          "challenge": "LANDING SITE",
          "response": "RECONFIRMED",
          "required": true,
          "unitDisplay": true
        },
        {
          "id": "ofa-005",
          "challenge": "PF CALLS HELIDECK ICAO CODE AND PM READBACK",
          "response": "",
          "required": true,
          "highlight": "yellow"
        }
      ]
    },
    {
      "id": "offshore-after-landing",
      "title": "AFTER LANDING",
      "categoryId": "offshore",
      "categoryTitle": "OFFSHORE CHECK LIST",
      "pdfPage": 2,
      "items": [
        {
          "id": "oal-001",
          "challenge": "COLLECTIVE",
          "response": "FULL DOWN",
          "required": true
        },
        {
          "id": "oal-002",
          "challenge": "RPM SWITCH",
          "response": "100% NR",
          "required": true
        },
        {
          "id": "oal-003",
          "challenge": "FLOATS",
          "response": "OFF",
          "required": true
        },
        {
          "id": "oal-004",
          "challenge": "ANTI COLL & EXTERNAL LIGHTS",
          "response": "OFF",
          "required": true
        }
      ]
    },
    {
      "id": "offshore-before-takeoff",
      "title": "BEFORE TAKEOFF",
      "categoryId": "offshore",
      "categoryTitle": "OFFSHORE CHECK LIST",
      "pdfPage": 2,
      "items": [
        {
          "id": "obto-001",
          "challenge": "ALT SEL",
          "response": "SET ___ FT",
          "required": true
        },
        {
          "id": "obto-002",
          "challenge": "FUEL QTY",
          "response": "CROSS-CHECKED",
          "required": true
        },
        {
          "id": "obto-003",
          "challenge": "MCDU PREFLIGHT",
          "response": "COMPLETED",
          "required": true
        },
        {
          "id": "obto-004",
          "challenge": "ENG MODE SWITCHES",
          "response": "FLIGHT",
          "required": true
        },
        {
          "id": "obto-005",
          "challenge": "AFCS 1/2",
          "response": "ON / ATT",
          "required": true
        },
        {
          "id": "obto-006",
          "challenge": "FLOATS",
          "response": "ARMED",
          "required": true
        },
        {
          "id": "obto-007",
          "challenge": "CAT A",
          "response": "102% NR",
          "required": true
        },
        {
          "id": "obto-008",
          "challenge": "TAKE OFF BRIEFING",
          "response": "PERFORMED",
          "required": true
        },
        {
          "id": "obto-009",
          "challenge": "ANTI COLL & EXTERNAL LIGHTS",
          "response": "ON",
          "required": true
        },
        {
          "id": "obto-010",
          "challenge": "HLO",
          "response": "THUMBS UP",
          "required": true
        },
        {
          "id": "obto-011",
          "challenge": "POWERPLANT",
          "response": "ALL GREEN / NORMAL CAS",
          "required": true
        }
      ]
    },
    {
      "id": "offshore-after-take-off",
      "title": "AFTER TAKE OFF",
      "categoryId": "offshore",
      "categoryTitle": "OFFSHORE CHECK LIST",
      "pdfPage": 2,
      "items": [
        {
          "id": "oato-001",
          "challenge": "COMPASS",
          "response": "MAG",
          "required": true
        },
        {
          "id": "oato-002",
          "challenge": "LDG GEAR",
          "response": "UP",
          "required": true
        },
        {
          "id": "oato-003",
          "challenge": "RPM SWITCH (≤ 90KT)",
          "response": "100% NR",
          "required": true
        },
        {
          "id": "oato-004",
          "challenge": "RADAR",
          "response": "A/R",
          "required": true
        },
        {
          "id": "oato-005",
          "challenge": "FD MODES",
          "response": "A/R",
          "required": true
        },
        {
          "id": "oato-006",
          "challenge": "PARK BRK",
          "response": "A/R",
          "required": true
        },
        {
          "id": "oato-007",
          "challenge": "DH",
          "response": "SET ___ FT",
          "required": true
        }
      ]
    }
  ]
};
