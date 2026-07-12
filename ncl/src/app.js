import { checklistData } from "./data/checklist-data.js";
import {
  loadState, saveState, resetAllState,
  loadFlightLog, saveFlightLog,
  loadSettings, saveSettings
} from "./checklist/storage.js";
import {
  getPhaseProgress, getNextPendingItem, getItemStatus,
  toggleItem, markSkipped, resetPhase
} from "./checklist/engine.js";

const app = document.querySelector("#app");
let state = loadState();
let settings = loadSettings();
if (settings.nightMode) document.body.classList.add('night');

// ─── Integração AW139 Companion — contexto compartilhado ────────────────────
// Preenche matrícula e observações (rota) a partir do módulo Pesos por Perna,
// sem sobrescrever o que já estiver preenchido.
(function importFromCompanionContext() {
  try {
    const ctx = JSON.parse(localStorage.getItem("aw139_companion_shared_context_v1") || "{}");
    if (!settings.registration && ctx.pesoMatricula) {
      settings = { ...settings, registration: ctx.pesoMatricula };
      saveSettings(settings);
    }
    if (!state.flightRemarks && !state.profileId) {
      const pesoForm = JSON.parse(localStorage.getItem("aw139_pesos_form_v2") || "null");
      const route = pesoForm && pesoForm.route ? String(pesoForm.route).trim() : "";
      if (route) state = saveState({ ...state, flightRemarks: route });
    }
  } catch (e) { /* localStorage indisponível */ }
})();

let currentView = "groups"; // "groups" | "checklist"
let showingInitial = false;
let lastAutoScrolledId = null;
let legPicker = null; // { profile: string, count: number } | null
let flightBuilder = null; // { startup, stops:[{type}], final } | null
let settingsOpen = false;
let viewMode = "pdf"; // "cockpit" | "pdf"

if (state.profileId && !state.completedAt) {
  currentView = state.selectedStepId ? "checklist" : "groups";
}

// ─── Utilities ─────────────────────────────────────────────────────────────

function escapeHtml(v = "") {
  return String(v)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDuration(ms) {
  if (!ms || ms < 0) return "—";
  const m = Math.round(ms / 60000);
  if (m < 1) return "< 1 min";
  const h = Math.floor(m / 60), min = m % 60;
  if (h === 0) return `${min} min`;
  return min === 0 ? `${h}h` : `${h}h ${min}min`;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

// ─── SVG Icons ─────────────────────────────────────────────────────────────

const ICON_HOME = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>`;
const ICON_RESET = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1,4 1,10 7,10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/></svg>`;
const ICON_SEEK = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="15"/><polyline points="8,11 12,15 16,11"/><circle cx="12" cy="20" r="2" fill="currentColor" stroke="none"/></svg>`;
const ICON_GRID = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>`;
const ICON_NEXT = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9,18 15,12 9,6"/></svg>`;
const ICON_PDF = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`;
const ICON_COCKPIT = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>`;
const ICON_MOON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
const ICON_SUN = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;

function renderViewToggle() {
  const isPDF = viewMode === "pdf";
  return `<button class="view-toggle ${isPDF ? "pdf-mode" : "cockpit-mode"}" data-action="toggle-view">${isPDF ? ICON_COCKPIT : ICON_PDF} ${isPDF ? "PROG" : "NCL"}</button>`;
}

// ─── PDF document layout (faithful recreation of NCL AW 139 REV. 23) ────────
// Each page mirrors the company PDF: two columns, fixed section order.

const PDF_DOC_PAGES = [
  {
    num: "1/2",
    cols: [
      { phases: ["normal-cockpit-checks", "normal-before-engine-start", "normal-system-checks"] },
      { phases: ["normal-first-engine-start", "normal-second-engine-start", "normal-flight-configuration", "normal-taxing", "normal-before-take-off", "normal-after-take-off"] }
    ]
  },
  {
    num: "2/2",
    cols: [
      { phases: ["normal-cruise", "normal-before-descent", "normal-before-landing", "normal-final-approach", "normal-after-landing", "normal-engines-shut-down", "normal-after-rotor-stops"] },
      { boxTitle: "OFFSHORE CHECK LIST", phases: ["offshore-before-descent", "offshore-before-landing", "offshore-traffic-pattern", "offshore-final-approach", "offshore-after-landing", "offshore-before-takeoff", "offshore-after-take-off"] }
    ]
  }
];

// ─── Mission profiles ───────────────────────────────────────────────────────

function buildMissionSteps(profileId, params = {}) {
  const all = checklistData.phases;
  const byId = id => all.find(p => p.id === id);
  const step = (id, phaseId, label = null) => ({ stepId: id, phaseId, phase: byId(phaseId), label });

  const DEP = [
    "normal-cockpit-checks", "normal-before-engine-start", "normal-system-checks",
    "normal-first-engine-start", "normal-second-engine-start", "normal-flight-configuration",
    "normal-taxing", "normal-before-take-off", "normal-after-take-off"
  ];
  const CRUISE = "normal-cruise";
  const N_INTERM = [
    "normal-before-descent", "normal-before-landing", "normal-final-approach", "normal-after-landing"
  ];
  const N_IDEP = ["normal-before-take-off", "normal-after-take-off"];
  const N_ARR = [
    "normal-before-descent", "normal-before-landing", "normal-final-approach",
    "normal-after-landing", "normal-engines-shut-down", "normal-after-rotor-stops"
  ];
  const O_ARR = [
    "offshore-before-descent", "offshore-before-landing", "offshore-traffic-pattern",
    "offshore-final-approach", "offshore-after-landing"
  ];
  const O_DEP = ["offshore-before-takeoff", "offshore-after-take-off"];

  const steps = [];

  if (profileId === "normal") {
    all.filter(p => p.categoryId === "normal").forEach((p, i) => steps.push(step(`n${i}`, p.id)));

  } else if (profileId === "offshore") {
    all.filter(p => p.categoryId === "offshore").forEach((p, i) => steps.push(step(`o${i}`, p.id)));

  } else if (profileId === "normal_offshore") {
    const legs = params.offshoreLegs || 1;
    DEP.forEach((id, i) => steps.push(step(`no_d${i}`, id)));
    for (let l = 0; l < legs; l++) {
      const cLabel = legs === 1 ? "CRUISE — IDA" : `CRUISE — IDA ${l + 1}`;
      steps.push(step(`no_ci${l}`, CRUISE, cLabel));
      O_ARR.forEach((id, i) => steps.push(step(`no_oa${l}_${i}`, id)));
      O_DEP.forEach((id, i) => steps.push(step(`no_od${l}_${i}`, id)));
    }
    steps.push(step(`no_cr`, CRUISE, "CRUISE — RETORNO"));
    N_ARR.forEach((id, i) => steps.push(step(`no_a${i}`, id)));

  } else if (profileId === "normal_stops") {
    const stops = params.stops || 1;
    DEP.forEach((id, i) => steps.push(step(`ns_d${i}`, id)));
    for (let s = 0; s < stops; s++) {
      const cLabel = stops === 1 ? "CRUISE" : `CRUISE — TRECHO ${s + 1}`;
      steps.push(step(`ns_c${s}`, CRUISE, cLabel));
      N_INTERM.forEach((id, i) => steps.push(step(`ns_ia${s}_${i}`, id)));
      N_IDEP.forEach((id, i) => steps.push(step(`ns_id${s}_${i}`, id)));
    }
    steps.push(step(`ns_cr`, CRUISE, "CRUISE — RETORNO"));
    N_ARR.forEach((id, i) => steps.push(step(`ns_a${i}`, id)));

  } else if (profileId === "custom") {
    const startup  = params.startup || "onshore";
    const legList  = params.stops  || [];
    const finalDst = params.final  || "onshore";

    // ── Startup ──────────────────────────────────────────────────────
    const COMMON_START = [
      "normal-cockpit-checks", "normal-before-engine-start", "normal-system-checks",
      "normal-first-engine-start", "normal-second-engine-start", "normal-flight-configuration"
    ];
    COMMON_START.forEach((id, i) => steps.push(step(`cs${i}`, id)));
    if (startup === "onshore") {
      steps.push(step("cs_tx", "normal-taxing"));
      steps.push(step("cs_bt", "normal-before-take-off"));
      steps.push(step("cs_at", "normal-after-take-off"));
    } else {
      // Offshore startup: sem táxi, usa before/after takeoff offshore
      steps.push(step("cs_bt", "offshore-before-takeoff"));
      steps.push(step("cs_at", "offshore-after-take-off"));
    }

    // ── Escalas intermediárias ────────────────────────────────────────
    legList.forEach((leg, li) => {
      const cLabel = legList.length === 1 ? "CRUISE — IDA" : `CRUISE — TRECHO ${li + 1}`;
      steps.push(step(`cl${li}_c`, CRUISE, cLabel));
      if (leg.type === "onshore") {
        N_INTERM.forEach((id, i) => steps.push(step(`cl${li}_a${i}`, id)));
        steps.push(step(`cl${li}_bt`, "normal-before-take-off"));
        steps.push(step(`cl${li}_at`, "normal-after-take-off"));
      } else {
        O_ARR.forEach((id, i)  => steps.push(step(`cl${li}_a${i}`, id)));
        O_DEP.forEach((id, i)  => steps.push(step(`cl${li}_d${i}`, id)));
      }
    });

    // ── Pouso final + shutdown ────────────────────────────────────────
    const finalCruiseLabel = legList.length > 0 ? "CRUISE — RETORNO" : "CRUISE";
    steps.push(step("cf_c", CRUISE, finalCruiseLabel));
    if (finalDst === "onshore") {
      N_ARR.forEach((id, i) => steps.push(step(`cf_a${i}`, id)));
    } else {
      // Offshore final: aproximação offshore → shutdown normal
      O_ARR.forEach((id, i) => steps.push(step(`cf_a${i}`, id)));
      steps.push(step("cf_sd0", "normal-engines-shut-down"));
      steps.push(step("cf_sd1", "normal-after-rotor-stops"));
    }
  }

  return steps;
}

function getMissionSteps() {
  if (!state.profileId) return [];
  return buildMissionSteps(state.profileId, state.profileParams || {});
}

function isStepAccessible(steps, stepIdx) {
  if (settings.barriersDisabled) return true;
  for (let i = 0; i < stepIdx; i++) {
    if (!getPhaseProgress(steps[i].phase, state, steps[i].stepId).isComplete) return false;
  }
  return true;
}

function getProfileLabelFor(profileId, params = {}) {
  if (profileId === "normal") return "NORMAL CHECK LIST";
  if (profileId === "offshore") return "OFFSHORE CHECK LIST";
  if (profileId === "normal_offshore") {
    const legs = params.offshoreLegs || 1;
    return legs === 1 ? "NCL + OCL" : `NCL + OCL (${legs}× offshore)`;
  }
  if (profileId === "normal_stops") {
    const stops = params.stops || 1;
    return stops === 1 ? "NORMAL c/ PARADA" : `NORMAL c/ ${stops} PARADAS`;
  }
  if (profileId === "custom") {
    const { startup = "onshore", stops = [], final: fin = "onshore" } = params;
    const parts = [];
    if (startup === "offshore") parts.push("partida OFF");
    stops.forEach((s, i) => { if (s.type === "offshore") parts.push(`escala ${i + 1} OFF`); });
    if (fin === "offshore") parts.push("pouso OFF");
    return parts.length ? `NCL MISTO (${parts.join(" · ")})` : "NORMAL CHECK LIST";
  }
  return "CHECK LIST";
}

function getProfileLabel() {
  return getProfileLabelFor(state.profileId, state.profileParams || {});
}

function getLogTypeLabel(entry) {
  if (!entry.profileId) {
    return entry.flightType === "offshore" ? "OCL" : "NCL";
  }
  if (entry.profileId === "offshore") return "OCL";
  if (entry.profileId === "normal_offshore") {
    const legs = entry.profileParams?.offshoreLegs || 1;
    return legs > 1 ? `NCL+OCL ×${legs}` : "NCL+OCL";
  }
  if (entry.profileId === "normal_stops") {
    const stops = entry.profileParams?.stops || 1;
    return stops > 1 ? `NCL+${stops}P` : "NCL+PAR";
  }
  if (entry.profileId === "custom") {
    const { startup = "onshore", stops = [], final: fin = "onshore" } = entry.profileParams || {};
    const hasOff = startup === "offshore" || stops.some(s => s.type === "offshore") || fin === "offshore";
    return hasOff ? "NCL MX" : "NCL";
  }
  return "NCL";
}

// ─── State helpers ──────────────────────────────────────────────────────────

const selectedStep = () => {
  const steps = getMissionSteps();
  if (!steps.length) return null;
  if (state.selectedStepId) {
    const found = steps.find(s => s.stepId === state.selectedStepId);
    if (found) return found;
  }
  return steps[0] || null;
};

function persist(nextState) {
  state = saveState(nextState);
  render();
}

// ─── Navigation ────────────────────────────────────────────────────────────

function selectStep(stepId) {
  const steps = getMissionSteps();
  const stepIdx = steps.findIndex(s => s.stepId === stepId);
  if (stepIdx < 0) return;
  if (!isStepAccessible(steps, stepIdx)) return;
  const step = steps[stepIdx];
  currentView = "checklist";
  lastAutoScrolledId = null;
  const active = getNextPendingItem(step.phase, state, stepId);
  persist({
    ...state,
    selectedStepId: stepId,
    activeItemId: active?.id || step.phase.items[0]?.id || null,
    flightSessionStartedAt: state.flightSessionStartedAt || new Date().toISOString()
  });
}

function handleSelectProfile(profileId, params = {}) {
  legPicker = null;
  flightBuilder = null;
  const regInput = document.getElementById("reg-input");
  const registration = (regInput ? regInput.value.trim().toUpperCase() : settings.registration) || "";
  const remarksInput = document.getElementById("remarks-input");
  const remarks = remarksInput ? remarksInput.value.trim() : (state.flightRemarks || "");

  const hasProgress = state.profileId &&
    Object.values(state.completed || {}).some(a => a.length > 0);
  if (hasProgress) {
    const ok = window.confirm(
      `Iniciar ${getProfileLabelFor(profileId, params)}? O progresso atual será perdido.`
    );
    if (!ok) return;
  }

  settings = { ...settings, registration };
  saveSettings(settings);
  showingInitial = false;
  currentView = "groups";
  lastAutoScrolledId = null;

  const steps = buildMissionSteps(profileId, params);
  const first = steps[0];
  persist({
    profileId,
    profileParams: params,
    flightRegistration: registration,
    flightRemarks: remarks,
    selectedStepId: first?.stepId || null,
    activeItemId: first?.phase.items[0]?.id || null,
    completed: {},
    skipped: {},
    completedAt: null,
    lastUpdatedAt: null,
    flightSessionStartedAt: new Date().toISOString(),
    flightTimes: { acionamento: null, decolagens: [], pousos: [], corte: null },
    unitCodes: []
  });
}

function handleHome() { showingInitial = true; legPicker = null; render(); }

// ─── Flight times ────────────────────────────────────────────────────────────

function handleMarkTime(marker) {
  const now = Date.now();
  const ft = state.flightTimes || { acionamento: null, decolagens: [], pousos: [], corte: null };
  let next;
  if (marker === "acionamento") next = { ...ft, acionamento: now };
  else if (marker === "decolagem") next = { ...ft, decolagens: [...ft.decolagens, now] };
  else if (marker === "pouso")     next = { ...ft, pousos: [...ft.pousos, now] };
  else if (marker === "corte")     next = { ...ft, corte: now };
  else return;
  state = saveState({ ...state, flightTimes: next });
  render();
}

function fmtHHMM(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function fmtDuration(ms) {
  if (!ms || ms <= 0) return "—";
  const m = Math.round(ms / 60000);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return h > 0 ? `${h}h${String(mm).padStart(2, "0")}` : `${mm}min`;
}

function renderTimingMarker(marker, label, recordedTs) {
  const done = recordedTs != null;
  return `
    <div class="timing-marker timing-${marker}${done ? " timing-done" : ""}">
      <button class="timing-tap" data-action="mark-time" data-marker="${marker}">
        <span class="timing-tap-label">${label}</span>
        <span class="timing-tap-val">${done ? fmtHHMM(recordedTs) : "Registrar"}</span>
      </button>
    </div>`;
}

function renderUnitInput(legIdx, value) {
  return `
    <div class="unit-row">
      <span class="unit-row-lbl">INDICATIVO</span>
      <input type="text" class="unit-input" data-action="unit-code" data-leg="${legIdx}"
        value="${escapeHtml(value)}" placeholder="—"
        maxlength="12" autocomplete="off" autocapitalize="characters" spellcheck="false"
        enterkeyhint="done">
    </div>`;
}

function renderFlightTimesSection() {
  const ft = state.flightTimes;
  if (!ft) return "";
  const { acionamento, decolagens, pousos, corte } = ft;
  if (!acionamento && !decolagens.length && !corte) return "";

  const nLegs = Math.max(decolagens.length, pousos.length);
  let flightMs = 0;
  let legsHtml = "";
  for (let i = 0; i < nLegs; i++) {
    const dep = decolagens[i] ?? null;
    const arr = pousos[i] ?? null;
    const legMs = dep && arr ? arr - dep : null;
    if (legMs) flightMs += legMs;
    const suffix = nLegs > 1 ? ` ${i + 1}` : "";
    legsHtml += `
      <div class="ft-leg-row">
        <div class="ft-cell"><span class="ft-cell-lbl">Decolagem${suffix}</span><span class="ft-cell-val">${fmtHHMM(dep)}</span></div>
        <div class="ft-cell"><span class="ft-cell-lbl">Pouso${suffix}</span><span class="ft-cell-val">${fmtHHMM(arr)}</span></div>
        ${legMs ? `<div class="ft-cell ft-cell-dur"><span class="ft-cell-val ft-dur">${fmtDuration(legMs)}</span></div>` : ""}
      </div>`;
  }

  const lastPouso = pousos.length > 0 ? pousos[pousos.length - 1] : null;
  const totalStart = acionamento ?? (corte && lastPouso ? lastPouso : null);
  const totalEnd   = corte ?? (acionamento && lastPouso ? lastPouso : null);
  const totalMs    = totalStart && totalEnd ? totalEnd - totalStart : null;
  const totalsHtml = (totalMs || flightMs) ? `
    <div class="ft-totals">
      ${totalMs ? `<div class="ft-total-item"><span class="ft-total-lbl">Total</span><span class="ft-total-val">${fmtDuration(totalMs)}</span></div>` : ""}
      ${flightMs ? `<div class="ft-total-item"><span class="ft-total-lbl">Voo</span><span class="ft-total-val">${fmtDuration(flightMs)}</span></div>` : ""}
    </div>` : "";

  return `
    <div class="initial-section-label">Tempos do voo</div>
    <div class="ft-card">
      ${acionamento ? `<div class="ft-main-row"><span class="ft-cell-lbl">Acionamento</span><span class="ft-cell-val">${fmtHHMM(acionamento)}</span></div>` : ""}
      ${legsHtml}
      ${corte ? `<div class="ft-main-row"><span class="ft-cell-lbl">Corte</span><span class="ft-cell-val">${fmtHHMM(corte)}</span></div>` : ""}
      ${totalsHtml}
    </div>`;
}

function handleToggleNightMode() {
  const isNight = document.body.classList.toggle('night');
  settings = { ...settings, nightMode: isNight };
  saveSettings(settings);
  render();
}

function handleShowGroups() { currentView = "groups"; viewMode = "cockpit"; render(); }
function handleShowNCL()    { currentView = "groups"; viewMode = "pdf";     render(); }
function handleContinueFlight() {
  showingInitial = false;
  currentView = state.selectedStepId ? "checklist" : "groups";
  render();
}

function handleNextFromBar() {
  if (currentView === "groups") {
    const steps = getMissionSteps();
    const next = steps.find(s => !getPhaseProgress(s.phase, state, s.stepId).isComplete);
    if (next) { selectStep(next.stepId); return; }
    if (isMissionComplete()) { handleCompleteFlight(); return; }
    return;
  }
  handleNextGroup();
}

function handleResetGroupFromBar() {
  if (currentView !== "checklist") return;
  handleResetPhase();
}

function handleNextPendingFromBar() {
  if (currentView !== "checklist") return;
  handleGoNextPending();
}

// ─── Checklist handlers ────────────────────────────────────────────────────

function isMissionComplete() {
  const steps = getMissionSteps();
  return steps.length > 0 && steps.every(s => getPhaseProgress(s.phase, state, s.stepId).isComplete);
}

function getMissionStats() {
  const steps = getMissionSteps();
  const totalGroups = steps.length;
  const totalItems = steps.reduce((s, step) => s + step.phase.items.filter(i => i.required !== false).length, 0);
  const doneGroups = steps.filter(s => getPhaseProgress(s.phase, state, s.stepId).isComplete).length;
  const doneItems = steps.reduce((s, step) => {
    const done = new Set(state.completed?.[step.stepId] || []);
    return s + step.phase.items.filter(i => i.required !== false && done.has(i.id)).length;
  }, 0);
  const startedAt = state.flightSessionStartedAt;
  const completedAt = new Date().toISOString();
  const durationMs = startedAt ? new Date(completedAt) - new Date(startedAt) : 0;
  return { totalGroups, totalItems, doneGroups, doneItems, startedAt, completedAt, durationMs };
}

function handleCompleteFlight() {
  const stats = getMissionStats();
  const log = loadFlightLog();
  log.unshift({
    id: stats.completedAt,
    profileId: state.profileId,
    profileParams: state.profileParams || {},
    flightType: state.profileId === "offshore" ? "offshore" : "normal",
    registration: state.flightRegistration || settings.registration || "",
    remarks: state.flightRemarks || "",
    startedAt: stats.startedAt,
    completedAt: stats.completedAt,
    durationMs: stats.durationMs,
    totalGroups: stats.totalGroups,
    totalItems: stats.totalItems,
    doneGroups: stats.doneGroups,
    doneItems: stats.doneItems,
    completed: { ...state.completed },
    skipped: { ...state.skipped },
    completedTimestamps: { ...(state.completedTimestamps || {}) }
  });
  saveFlightLog(log.slice(0, 10));
  persist({ ...state, completedAt: stats.completedAt });
}

function handleToggleItem(id) {
  const step = selectedStep();
  if (!step) return;
  persist(toggleItem(step.phase, id, state, step.stepId, new Date().toISOString()));
}

function handleSkipItem(id) {
  const ok = window.confirm("Marcar este item como ATENÇÃO / NÃO CUMPRIDO? Ele continuará impedindo o avanço até ser cumprido.");
  if (!ok) return;
  const step = selectedStep();
  if (!step) return;
  persist(markSkipped(step.phase, id, state, step.stepId));
}

function handleResetPhase() {
  const step = selectedStep();
  if (!step) return;
  const ok = window.confirm(`Resetar o grupo ${step.label || step.phase.title}?`);
  if (!ok) return;
  lastAutoScrolledId = null;
  persist(resetPhase(step.phase, state, step.stepId));
}

function handleResetAll() {
  const ok = window.confirm("Resetar todo o progresso e iniciar novo voo?");
  if (!ok) return;
  showingInitial = true;
  currentView = "groups";
  lastAutoScrolledId = null;
  state = resetAllState();
  render();
}

function handleReviewChecklist() {
  currentView = "checklist";
  persist({ ...state, completedAt: null });
}

function autoScrollToActiveItem() {
  const id = state.activeItemId;
  if (!id) return;
  requestAnimationFrame(() => {
    const el = document.querySelector(`[data-item-id="${id}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: "instant", block: "center" });
    lastAutoScrolledId = id;
  });
}

function scrollToItem(id) {
  requestAnimationFrame(() => {
    document.querySelector(`[data-item-id="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

function handleGoNextPending() {
  const step = selectedStep();
  if (!step) return;
  const next = getNextPendingItem(step.phase, state, step.stepId);
  if (!next) return;
  persist({ ...state, selectedStepId: step.stepId, activeItemId: next.id });
  scrollToItem(next.id);
}

function handleNextGroup() {
  const step = selectedStep();
  if (!step) return;
  const progress = getPhaseProgress(step.phase, state, step.stepId);
  const nextPending = getNextPendingItem(step.phase, state, step.stepId);

  if (!progress.isComplete) {
    if (nextPending) {
      persist({ ...state, activeItemId: nextPending.id });
      scrollToItem(nextPending.id);
    }
    return;
  }

  const steps = getMissionSteps();
  const idx = steps.findIndex(s => s.stepId === step.stepId);
  const next = steps[idx + 1];
  if (!next) { handleCompleteFlight(); return; }
  selectStep(next.stepId);
}

function getStatusLabel(s) {
  return s === "completed" ? "DONE" : s === "active" ? "NEXT" : s === "skipped" ? "ATTN" : "PENDING";
}

// ─── PDF generation ────────────────────────────────────────────────────────

function generateFlightPDF(flightId) {
  const log = loadFlightLog();
  const entry = log.find(e => e.id === flightId);
  if (!entry) return;

  let steps;
  if (entry.profileId) {
    steps = buildMissionSteps(entry.profileId, entry.profileParams || {});
  } else {
    steps = checklistData.phases
      .filter(p => p.categoryId === entry.flightType)
      .map((p, i) => ({ stepId: `${entry.flightType[0]}${i}`, phaseId: p.id, phase: p, label: null }));
  }

  const doneMap = entry.completed || {};
  const skipMap = entry.skipped || {};
  const tsMap = entry.completedTimestamps || {};
  const typeLabel = entry.profileId
    ? getProfileLabelFor(entry.profileId, entry.profileParams || {})
    : (entry.flightType === "offshore" ? "OFFSHORE CHECK LIST" : "NORMAL CHECK LIST");

  const fmtTime = iso => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const groupsHTML = steps.map(step => {
    const items = step.phase.items.filter(i => i.required !== false);
    const done = new Set(doneMap[step.stepId] || []);
    const skip = new Set(skipMap[step.stepId] || []);
    const stepTs = tsMap[step.stepId] || {};
    const cnt = items.filter(i => done.has(i.id)).length;
    const title = step.label ? `${step.phase.title} — ${step.label}` : step.phase.title;
    const rows = items.map(item => {
      const isDone = done.has(item.id), isSkip = skip.has(item.id);
      const ic = isDone ? "✓" : (isSkip ? "⚠" : "○");
      const cl = isDone ? "done" : (isSkip ? "attn" : "pend");
      const ts = isDone && stepTs[item.id] ? `<td class="ts">${fmtTime(stepTs[item.id])}</td>` : `<td class="ts"></td>`;
      return `<tr class="${cl}"><td class="ic">${ic}</td><td class="ch">${item.challenge}</td><td class="rs">${item.response}</td>${ts}</tr>`;
    }).join("");
    return `<div class="grp"><div class="gh"><span>${title}</span><span>${cnt}/${items.length}</span></div><table><tbody>${rows}</tbody></table></div>`;
  }).join("");

  const doneGroups = entry.doneGroups ?? entry.totalGroups;
  const doneItems  = entry.doneItems  ?? entry.totalItems;

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>AW139 ${typeLabel} — ${entry.registration || "—"} — ${formatDate(entry.completedAt)}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,Helvetica,sans-serif;font-size:9pt;color:#000;background:#fff}
.nop{padding:8px 15mm;background:#f0f0f0;border-bottom:1px solid #ccc;display:flex;gap:8px;align-items:center}
.nop button{padding:6px 14px;cursor:pointer;font-size:8.5pt;border:1px solid #888;background:#fff;border-radius:4px}
.hdr{padding:10mm 15mm 7mm;border-bottom:2px solid #000}
.htitle{font-size:15pt;font-weight:700;letter-spacing:.04em;text-transform:uppercase}
.hmeta{margin-top:6px;display:flex;flex-wrap:wrap;gap:16px;font-size:8.5pt;color:#333}
.body{padding:6mm 15mm 12mm}
.grp{margin:7mm 0 0;break-inside:avoid}
.gh{display:flex;justify-content:space-between;padding:4px 7px;background:#e8e8e8;font-weight:700;font-size:8.5pt;text-transform:uppercase;border-bottom:1px solid #ccc}
table{width:100%;border-collapse:collapse;font-size:8pt}
td{padding:2.5px 6px;border-bottom:1px solid #f0f0f0;vertical-align:top;line-height:1.35}
.ic{width:16px;text-align:center;font-weight:700}
.ch{width:48%;font-weight:600}
.rs{color:#555}
.ts{width:52px;text-align:right;color:#888;font-size:7.5pt;white-space:nowrap}
.done .ic{color:#007700}.attn .ic{color:#cc6600}.pend .ic{color:#bbb}
.done .ts{color:#007700}
.ftr{margin:10mm 15mm 0;padding-top:4mm;border-top:1px solid #ddd;font-size:7.5pt;color:#888;text-align:center}
@page{margin:10mm 12mm;size:A4}
@media print{.nop{display:none!important}}
</style></head><body>
<div class="nop">
  <button onclick="window.print()">🖨 Imprimir / Salvar PDF</button>
  <button onclick="window.close()">✕ Fechar</button>
</div>
<div class="hdr">
  <div class="htitle">AW139 ${typeLabel}</div>
  <div class="hmeta">
    <span><strong>Matrícula:</strong> ${entry.registration || "—"}</span>
    <span><strong>Data:</strong> ${formatDate(entry.completedAt)}</span>
    <span><strong>Duração:</strong> ${formatDuration(entry.durationMs)}</span>
    ${entry.remarks ? `<span><strong>Obs.:</strong> ${escapeHtml(entry.remarks)}</span>` : ""}
    <span><strong>Grupos:</strong> ${doneGroups}/${entry.totalGroups}</span>
    <span><strong>Itens:</strong> ${doneItems}/${entry.totalItems}</span>
    <span><strong>Rev.:</strong> ${checklistData.revision.sourceRevision} (${checklistData.revision.effectiveDate})</span>
  </div>
</div>
<div class="body">${groupsHTML}</div>
<div class="ftr">${checklistData.revision.source} • Rev. ${checklistData.revision.sourceRevision} • ${checklistData.revision.sourceBasis} • Dataset: ${checklistData.revision.datasetVersion}</div>
</body></html>`;

  const win = window.open("", "_blank");
  if (win) { win.document.write(html); win.document.close(); }
}

// ─── Rendering ────────────────────────────────────────────────────────────

function renderBottomBar() {
  const steps = getMissionSteps();
  const completedGroups = steps.filter(s => getPhaseProgress(s.phase, state, s.stepId).isComplete).length;
  const isGroupsView = currentView === "groups";
  const onChecklist = currentView === "checklist";
  const step = onChecklist ? selectedStep() : null;
  const hasNextPending = onChecklist && step ? !!getNextPendingItem(step.phase, state, step.stepId) : false;

  return `
    <nav class="bottom-bar">
      <button class="bottom-btn" data-action="nav-home" title="Início">
        ${ICON_HOME}
        <span class="bottom-label">Início</span>
      </button>
      <button class="bottom-btn ${!onChecklist ? "bb-dim" : ""}" data-action="nav-reset-group" ${!onChecklist ? "disabled" : ""} title="Reset grupo">
        ${ICON_RESET}
        <span class="bottom-label">Reset</span>
      </button>
      <button class="bottom-btn ${hasNextPending ? "bb-seek" : "bb-dim"}" data-action="nav-next-pending" ${!hasNextPending ? "disabled" : ""} title="Próximo pendente">
        ${ICON_SEEK}
        <span class="bottom-label">Pendente</span>
      </button>
      <button class="bottom-btn ${isGroupsView && viewMode === "cockpit" ? "bb-active" : ""}" data-action="nav-groups" title="Grupos PROG">
        ${ICON_GRID}
        <span class="bottom-label">Grupos</span>
      </button>
      <button class="bottom-btn ${isGroupsView && viewMode === "pdf" ? "bb-active" : ""}" data-action="nav-ncl" title="NCL — visualização documento">
        ${ICON_PDF}
        <span class="bottom-label">NCL</span>
      </button>
    </nav>
  `;
}

function renderLegButtons(profile, paramKey, max = 5) {
  if (legPicker?.profile === profile) {
    const n = legPicker.count;
    const params = JSON.stringify({ [paramKey]: n });
    return `
      <div class="mission-legs-picker">
        <button class="leg-stepper" data-action="leg-dec" data-profile="${profile}" ${n <= 1 ? "disabled" : ""}>−</button>
        <span class="leg-stepper-val">${n}</span>
        <button class="leg-stepper" data-action="leg-inc" data-profile="${profile}" ${n >= max ? "disabled" : ""}>+</button>
        <button class="leg-btn leg-start" data-action="select-profile" data-profile="${profile}" data-params='${params}'>OK</button>
      </div>
    `;
  }
  const p1 = JSON.stringify({ [paramKey]: 1 });
  const cls = profile === "normal_offshore" ? " offshore" : "";
  return `
    <div class="mission-legs-btns">
      <button class="leg-btn${cls}" data-action="select-profile" data-profile="${profile}" data-params='${p1}'>1</button>
      <button class="leg-btn${cls} leg-more" data-action="expand-legs" data-profile="${profile}">+</button>
    </div>
  `;
}

function renderFlightBuilder() {
  const { startup, stops, final: fin } = flightBuilder;

  const tog = (action, val, current, extra = "") => {
    const active = current === val;
    const cls = active
      ? (val === "offshore" ? "fb-tog fb-tog-amber" : "fb-tog fb-tog-blue")
      : "fb-tog";
    const label = val === "offshore" ? "Offshore" : "Onshore";
    return `<button class="${cls}" data-action="${action}" data-val="${val}"${extra}>${label}</button>`;
  };

  const stopRows = stops.map((s, i) => `
    <div class="fb-stop-row">
      <span class="fb-stop-num">Escala ${i + 1}</span>
      <div class="fb-toggles">
        ${tog("fb-stop-type", "onshore", s.type, ` data-idx="${i}"`)}
        ${tog("fb-stop-type", "offshore", s.type, ` data-idx="${i}"`)}
      </div>
      <button class="fb-del-btn" data-action="fb-del-stop" data-idx="${i}">×</button>
    </div>
  `).join("");

  return `
    <div class="fb-section">
      <span class="fb-label">Acionamento</span>
      <div class="fb-toggles">${tog("fb-startup", "onshore", startup)}${tog("fb-startup", "offshore", startup)}</div>
    </div>
    <div class="fb-section">
      <span class="fb-label">Escalas intermediárias</span>
      ${stopRows}
      <button class="fb-add-btn" data-action="fb-add-stop">+ Escala</button>
    </div>
    <div class="fb-section">
      <span class="fb-label">Pouso final · Shutdown</span>
      <div class="fb-toggles">${tog("fb-final", "onshore", fin)}${tog("fb-final", "offshore", fin)}</div>
    </div>
    <button class="fb-start-btn" data-action="fb-start">Iniciar →</button>
  `;
}

function renderInitialScreen() {
  const hasFlight = !!state.profileId && !state.completedAt;
  const log = loadFlightLog();

  const historyRows = log.slice(0, 10).map(entry => {
    const typeLabel = getLogTypeLabel(entry);
    const isOff = entry.profileId === "offshore" || entry.profileId === "normal_offshore";
    return `
      <div class="history-entry">
        <span class="history-type ${isOff ? "offshore" : ""}">${typeLabel}</span>
        <span class="history-reg">${escapeHtml(entry.registration || "—")}</span>
        <span class="history-date">${formatDate(entry.completedAt)}</span>
        <span class="history-dur">${formatDuration(entry.durationMs)}</span>
        <button class="history-pdf" data-action="export-pdf" data-flight-id="${escapeHtml(entry.id)}">PDF</button>
      </div>
    `;
  }).join("");

  return `
    <div class="initial-screen">
      <div class="initial-inner">
        <div class="initial-toprow">
          <div class="initial-brand">
            <div class="brand-title">${escapeHtml(checklistData.title)}</div>
            <div class="initial-sub">Rev. ${escapeHtml(checklistData.revision.sourceRevision)} • ${escapeHtml(checklistData.revision.source)}</div>
          </div>
          <div class="toprow-actions">
            <button class="night-toggle-btn" data-action="toggle-night" title="${settings.nightMode ? "Modo dia" : "Modo noite"}">
              ${settings.nightMode ? ICON_SUN : ICON_MOON}
            </button>
            <button class="settings-gear-btn${settingsOpen ? " settings-gear-open" : ""}" data-action="toggle-settings" title="Configurações">⚙</button>
          </div>
        </div>

        ${settingsOpen ? `
        <div class="settings-panel">
          <div class="settings-row">
            <span class="settings-row-label">Barreiras de avanço</span>
            <button class="sw-toggle${settings.barriersDisabled ? "" : " sw-on"}" data-action="toggle-barriers" role="switch" aria-checked="${!settings.barriersDisabled}">
              <span class="sw-thumb"></span>
            </button>
          </div>
          <div class="settings-divider"></div>
          <div class="settings-row">
            <span class="settings-row-label">Marcação de tempos</span>
            <button class="sw-toggle${settings.timingEnabled ? " sw-on" : ""}" data-action="toggle-timing" role="switch" aria-checked="${settings.timingEnabled}">
              <span class="sw-thumb"></span>
            </button>
          </div>
        </div>
        ` : ""}

        <div class="reg-field">
          <label class="reg-label" for="reg-input">Matrícula</label>
          <input type="text" id="reg-input" class="reg-input"
            value="${escapeHtml(settings.registration)}"
            placeholder="PP-MHT"
            maxlength="8"
            autocomplete="off"
            autocapitalize="characters"
            spellcheck="false">
        </div>

        <div class="reg-field">
          <label class="reg-label" for="remarks-input">Observações</label>
          <input type="text" id="remarks-input" class="reg-input remarks-input"
            value="${escapeHtml(state.flightRemarks || '')}"
            placeholder="Nº do voo, rota…"
            maxlength="60"
            autocomplete="off"
            spellcheck="false">
        </div>

        ${hasFlight ? `
          <button class="continue-flight-btn" data-action="continue-flight">
            ← Continuar ${escapeHtml(getProfileLabel())}
          </button>
        ` : ""}

        <div class="initial-section-label">Iniciar voo</div>
        <div class="mission-grid">

          <button class="mission-btn" data-action="select-profile" data-profile="normal">
            <span class="mission-btn-label">Normal</span>
            <span class="mission-btn-desc">Partida e pouso onshore</span>
          </button>

          <div class="mission-btn mission-multi offshore">
            <span class="mission-btn-label">Normal + Offshore</span>
            <div class="mission-legs">
              <span class="mission-legs-label">Pousos offshore</span>
              ${renderLegButtons("normal_offshore", "offshoreLegs", 5)}
            </div>
          </div>

          <div class="mission-btn mission-builder${flightBuilder ? " mission-builder-open" : ""}">
            <div class="fb-header">
              <span class="mission-btn-label">Configurar voo</span>
              ${flightBuilder
                ? `<button class="fb-close-btn" data-action="fb-close">✕</button>`
                : `<button class="fb-open-btn" data-action="fb-open">Configurar →</button>`
              }
            </div>
            ${flightBuilder ? renderFlightBuilder() : ""}
          </div>

        </div>

        ${settings.timingEnabled ? renderFlightTimesSection() : ""}

        ${log.length > 0 ? `
          <div class="initial-section-label">Últimos voos</div>
          <div class="history-list">${historyRows}</div>
        ` : ""}

        ${hasFlight ? `
          <button class="action-btn danger initial-reset" data-action="reset-all">Reset voo</button>
        ` : ""}
      </div>
    </div>
  `;
}

// ─── Group section helpers ──────────────────────────────────────────────────

function buildGroupSections() {
  const steps = getMissionSteps();
  const sections = [];
  steps.forEach((step, idx) => {
    const cat = step.phase.categoryId;
    if (!sections.length || sections[sections.length - 1].cat !== cat) {
      sections.push({ cat, items: [] });
    }
    sections[sections.length - 1].items.push({ step, idx });
  });
  return sections;
}

function getGroupSectionLabel(sections, sec, si) {
  if (sections.length <= 1) return null;
  const offCount = sections.filter(s => s.cat === "offshore").length;
  if (sec.cat === "offshore") {
    if (offCount === 1) return "OFFSHORE";
    const n = sections.slice(0, si + 1).filter(s => s.cat === "offshore").length;
    return `OFFSHORE — PERNA ${n}`;
  }
  if (si === 0) return "SAÍDA NORMAL";
  if (si === sections.length - 1) return "RETORNO NORMAL";
  return "NORMAL";
}

// ─── Cockpit groups page ────────────────────────────────────────────────────

function renderGroupsPage() {
  if (viewMode === "pdf") return renderGroupsPagePDF();

  const steps = getMissionSteps();
  const sections = buildGroupSections();
  const doneCount = steps.filter(s => getPhaseProgress(s.phase, state, s.stepId).isComplete).length;
  const label = getProfileLabel();
  const reg = state.flightRegistration || settings.registration;

  let cardsHtml = "";
  sections.forEach((sec, si) => {
    const secLabel = getGroupSectionLabel(sections, sec, si);
    if (secLabel) {
      const cls = sec.cat === "offshore" ? "section-offshore" : "section-normal";
      cardsHtml += `<div class="groups-section-label ${cls}">${secLabel}</div>`;
    }
    sec.items.forEach(({ step, idx }) => {
      const progress = getPhaseProgress(step.phase, state, step.stepId);
      const isActive = step.stepId === state.selectedStepId;
      const isLocked = !isStepAccessible(steps, idx);
      const title = step.label || step.phase.title;
      const offCls = sec.cat === "offshore" ? " offshore-card" : "";
      cardsHtml += `
        <button class="group-card${progress.isComplete ? " complete" : ""}${isActive ? " active-group" : ""}${isLocked ? " locked" : ""}${offCls}"
          data-action="select-step" data-step-id="${escapeHtml(step.stepId)}"${isLocked ? ' disabled aria-disabled="true"' : ""}>
          <div class="group-card-num">${isLocked ? "🔒" : idx + 1}</div>
          <div class="group-card-title">${escapeHtml(title)}</div>
          <div class="group-card-footer">
            <span class="group-card-progress">${progress.done}/${progress.total}</span>
            <div class="group-card-bar"><div class="group-card-fill" style="width:${progress.percent}%"></div></div>
          </div>
        </button>
      `;
    });
  });

  return `
    <div class="groups-page">
      <header class="groups-header">
        <div>
          <div class="brand-title">${escapeHtml(label)}</div>
          <div class="groups-meta">
            ${reg ? `<span class="groups-reg">${escapeHtml(reg)}</span> • ` : ""}
            ${doneCount}/${steps.length} grupos concluídos
          </div>
        </div>
      </header>
      <div class="groups-grid">${cardsHtml}</div>
      ${renderBottomBar()}
    </div>
  `;
}

function renderTags(item) {
  if (!item.tags?.length && !item.callout) return "";
  const tags = [...(item.callout ? ["●"] : []), ...(item.tags || [])];
  return `<span class="tag-row">${tags.map(t => `<span class="item-tag">${escapeHtml(t)}</span>`).join("")}</span>`;
}

function renderChecklist() {
  const step = selectedStep();
  if (!step) return `<div class="empty-state">Nenhuma checklist carregada.</div>`;

  const steps = getMissionSteps();
  const fi = steps.findIndex(s => s.stepId === step.stepId);
  const progress = getPhaseProgress(step.phase, state, step.stepId);
  const nextPending = getNextPendingItem(step.phase, state, step.stepId);
  const title = step.label || step.phase.title;
  const groupKicker = `Grupo ${fi + 1}/${steps.length} • ${escapeHtml(step.phase.categoryTitle)} • PDF p.${escapeHtml(String(step.phase.pdfPage))}`;
  const resumeText = nextPending
    ? `Próximo item pendente: <strong>${escapeHtml(nextPending.challenge)}</strong> — ${escapeHtml(nextPending.response)}`
    : `Grupo completo. Conferir visualmente e avançar para o próximo grupo.`;

  const rows = step.phase.items.map((item, i) => {
    const status = getItemStatus(step.phase, item, state, step.stepId);
    const symbol = status === "completed" ? "✓" : String(i + 1).padStart(2, "0");
    const note = item.note ? `<span class="item-note">${escapeHtml(item.note)}</span>` : "";
    return `
      <button class="check-row ${status}" data-action="toggle-item" data-item-id="${escapeHtml(item.id)}">
        <span class="check-index">${escapeHtml(symbol)}</span>
        <span class="check-main">
          <span class="challenge">${escapeHtml(item.challenge)}</span>
          <span class="response">${escapeHtml(item.response)}</span>
          ${renderTags(item)}
          ${note}
        </span>
        <span class="status-chip">${getStatusLabel(status)}</span>
      </button>
    `;
  }).join("");

  return `
    <div class="card checklist-card">
      <div class="card-header sticky-header">
        <div class="checklist-header-main">
          <div>
            <div class="page-kicker">${groupKicker}</div>
            <h2 class="card-title">${escapeHtml(title)}</h2>
          </div>
          <div class="progress-block">
            <div class="progress-count">${progress.done}/${progress.total}</div>
            <div class="progress-label">Itens</div>
          </div>
        </div>
        <div class="progress-bar" aria-label="Progresso da checklist">
          <div class="progress-fill" style="width:${progress.percent}%"></div>
        </div>
      </div>
      <div class="checklist-items">
        ${checklistData.contentStatus !== "APPROVED" ? `<div class="warning-banner">CHECKLIST DATASET: ${escapeHtml(checklistData.contentStatus)} — REV. ${escapeHtml(checklistData.revision.sourceRevision)}. CONFERIR ANTES DE USO OPERACIONAL.</div>` : ""}
        <div class="resume-banner ${progress.isComplete ? "complete" : ""}">${resumeText}</div>
        ${rows}
        <div class="checklist-end-spacer"></div>
      </div>
    </div>
  `;
}

function renderChecklistPage() {
  return renderChecklistPagePDF(); // detail is always PDF-faithful

  const statusClass = checklistData.contentStatus === "APPROVED" ? "ok" : "draft";
  const reg = state.flightRegistration || settings.registration;
  const label = getProfileLabel();
  const step = selectedStep();
  const progress = step ? getPhaseProgress(step.phase, state, step.stepId) : null;
  const groupTitle = step ? (step.label || step.phase.title) : "";

  const completionBanner = progress?.isComplete ? `
    <div class="group-complete-banner">
      <div class="gcb-inner">
        <div class="gcb-check">✓</div>
        <div class="gcb-text">
          <div class="gcb-title">${escapeHtml(groupTitle)} — CONCLUÍDO</div>
          <div class="gcb-sub">Avançar para o próximo grupo?</div>
        </div>
        <button class="gcb-btn" data-action="nav-next">Próximo →</button>
      </div>
    </div>
  ` : "";

  return `
    <main class="app-shell checklist-view">
      <header class="topbar">
        <div class="brand">
          <div class="brand-title">${escapeHtml(checklistData.title)}</div>
          <div class="brand-subtitle">
            ${reg ? `${escapeHtml(reg)} • ` : ""}${escapeHtml(label)}
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
          ${renderViewToggle()}
          <div class="badge ${statusClass}">${escapeHtml(checklistData.contentStatus)}</div>
        </div>
      </header>
      <div class="checklist-wrapper">
        ${renderChecklist()}
      </div>
      ${completionBanner}
      ${renderBottomBar()}
    </main>
  `;
}

function renderCompletion() {
  const steps = getMissionSteps();
  const totalGroups = steps.length;
  const totalItems = steps.reduce((s, step) => s + step.phase.items.filter(i => i.required !== false).length, 0);
  const doneGroups = steps.filter(s => getPhaseProgress(s.phase, state, s.stepId).isComplete).length;
  const doneItems = steps.reduce((s, step) => {
    const done = new Set(state.completed?.[step.stepId] || []);
    return s + step.phase.items.filter(i => i.required !== false && done.has(i.id)).length;
  }, 0);
  const durationMs = state.flightSessionStartedAt && state.completedAt
    ? new Date(state.completedAt) - new Date(state.flightSessionStartedAt) : 0;
  const label = getProfileLabel();
  const reg = state.flightRegistration || settings.registration;
  const log = loadFlightLog();
  const currentEntry = log[0];

  const logRows = log.slice(0, 6).map((entry, i) => {
    const typeLabel = getLogTypeLabel(entry);
    const isOff = entry.profileId === "offshore" || entry.profileId === "normal_offshore";
    return `
      <div class="log-entry ${i === 0 ? "current-entry" : ""} ${isOff ? "offshore-entry" : ""}">
        <span class="log-type">${typeLabel}</span>
        <span class="log-date">${formatDate(entry.completedAt)}</span>
        <span class="log-duration">${formatDuration(entry.durationMs)}</span>
        <span class="log-items">${entry.doneItems ?? entry.totalItems}/${entry.totalItems} itens</span>
        <button class="log-pdf-btn" data-action="export-pdf" data-flight-id="${escapeHtml(entry.id)}">PDF</button>
      </div>
    `;
  }).join("");

  return `
    <div class="completion-screen">
      <div class="completion-inner">
        <div class="completion-icon">✓</div>
        <h1 class="completion-title">VOO CONCLUÍDO</h1>
        <div class="completion-meta">
          ${reg ? `<strong>${escapeHtml(reg)}</strong> • ` : ""}${escapeHtml(label)} • Rev. ${escapeHtml(checklistData.revision.sourceRevision)} • ${formatDate(state.completedAt)}
          ${state.flightRemarks ? `<br><span class="completion-remarks">${escapeHtml(state.flightRemarks)}</span>` : ""}
        </div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${formatDuration(durationMs)}</div>
            <div class="stat-label">Duração</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${doneGroups}/${totalGroups}</div>
            <div class="stat-label">Grupos</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${doneItems}/${totalItems}</div>
            <div class="stat-label">Itens</div>
          </div>
        </div>
        ${log.length > 0 ? `
          <div class="flight-log">
            <div class="flight-log-title">Histórico de voos</div>
            ${logRows}
          </div>
        ` : ""}
        <div class="completion-actions">
          ${currentEntry ? `<button class="action-btn" data-action="export-pdf" data-flight-id="${escapeHtml(currentEntry.id)}">Exportar PDF</button>` : ""}
          <button class="action-btn" data-action="review-checklist">Rever</button>
          <button class="action-btn primary" data-action="reset-all">Novo voo</button>
        </div>
      </div>
    </div>
  `;
}

// ─── PDF view render functions ───────────────────────────────────────────────

function renderGroupsPagePDF() {
  const steps = getMissionSteps();
  const label = getProfileLabel();
  const reg = state.flightRegistration || settings.registration;
  const rev = checklistData.revision;

  // Group mission steps by phase (multi-leg missions repeat phases)
  const stepsByPhase = {};
  steps.forEach(step => {
    (stepsByPhase[step.phaseId] = stepsByPhase[step.phaseId] || []).push(step);
  });

  // For a phase with several legs, the "current" leg is the first incomplete one
  const currentStepFor = phaseSteps => {
    const pending = phaseSteps.find(s => !getPhaseProgress(s.phase, state, s.stepId).isComplete);
    return pending || phaseSteps[phaseSteps.length - 1];
  };

  const renderItem = (phase, item, stepId) => {
    const status = stepId ? getItemStatus(phase, item, state, stepId) : "pending";
    const sym = status === "completed" ? "✓" : status === "skipped" ? "⚠" : "";
    const bullet = item.callout ? `<span class="pdfd-bullet">●</span>` : "";

    // Highlighted rows reproduced from the company PDF
    if (item.highlight === "yellow") {
      const text = item.response
        ? `${escapeHtml(item.challenge)}. ${escapeHtml(item.response)}.`
        : `${escapeHtml(item.challenge)}.`;
      return `<div class="pdfd-item pdfd-yellowblock ${status}">
        <span>${text}</span>
        <span class="pdfd-state-sym">${sym}</span>
      </div>`;
    }

    const greenDeck = (item.tags || []).includes("GREEN DECK");
    const resp = greenDeck
      ? `<span class="pdfd-hl-green">${escapeHtml(item.response)}</span>`
      : escapeHtml(item.response);
    return `<div class="pdfd-item ${status}">
      <span class="pdfd-name">${bullet}${escapeHtml(item.challenge)}</span>
      <span class="pdfd-dots"></span>
      <span class="pdfd-resp">${resp}</span>
      <span class="pdfd-state-sym">${sym}</span>
    </div>`;
  };

  const renderSection = (phaseId, inBox) => {
    const phase = checklistData.phases.find(p => p.id === phaseId);
    if (!phase) return "";

    const phaseSteps = stepsByPhase[phaseId] || [];
    const inMission = phaseSteps.length > 0;
    const current = inMission ? currentStepFor(phaseSteps) : null;
    const allDone = inMission && phaseSteps.every(s => getPhaseProgress(s.phase, state, s.stepId).isComplete);
    const isActive = inMission && phaseSteps.some(s => s.stepId === state.selectedStepId);

    const titleHtml = escapeHtml(phase.title);

    const legChips = phaseSteps.length > 1 ? `<span class="pdfd-legs">${phaseSteps.map((s, i) => {
      const done = getPhaseProgress(s.phase, state, s.stepId).isComplete;
      const cur = s.stepId === current.stepId;
      return `<button class="pdfd-leg-chip${done ? " done" : ""}${cur ? " cur" : ""}" data-action="select-step" data-step-id="${escapeHtml(s.stepId)}" title="${escapeHtml(s.label || phase.title)}">${i + 1}</button>`;
    }).join("")}</span>` : "";

    const currentIdx = current ? steps.findIndex(s => s.stepId === current.stepId) : -1;
    const isLocked = inMission && currentIdx >= 0 && !isStepAccessible(steps, currentIdx);

    const stateChip = allDone ? `<span class="pdfd-sec-check">✓</span>` : "";
    const hdrCls = inBox ? "pdfd-sub-hdr" : "pdfd-sec-hdr";

    const cls = [
      "pdfd-sec",
      !inMission ? "pdfd-off" : "",
      isLocked ? "pdfd-locked" : "",
      allDone ? "pdfd-done" : "",
      isActive ? "pdfd-active" : ""
    ].filter(Boolean).join(" ");

    const interactive = inMission && !isLocked ? ` data-action="select-step" data-step-id="${escapeHtml(current.stepId)}" role="button" tabindex="0"` : "";

    return `<div class="${cls}"${interactive}>
      <div class="${hdrCls}">${titleHtml}${stateChip}${legChips}</div>
      ${phase.items.map(item => renderItem(phase, item, current ? current.stepId : null)).join("")}
    </div>`;
  };

  const renderCol = col => {
    const sections = col.phases.map(id => renderSection(id, !!col.boxTitle)).join("");
    return col.boxTitle
      ? `<div class="pdfd-col"><div class="pdfd-offshore-box"><div class="pdfd-box-title">${escapeHtml(col.boxTitle)}</div>${sections}</div></div>`
      : `<div class="pdfd-col">${sections}</div>`;
  };

  const pagesHtml = PDF_DOC_PAGES.map(page => `
    <div class="pdfd-page">
      <div class="pdfd-header">
        <div class="pdfd-h-logo"><img src="./assets/omni-logo.png" alt="OMNI Táxi Aéreo"></div>
        <div class="pdfd-h-title">${escapeHtml(rev.sourceDocumentTitle)}</div>
        <div class="pdfd-h-cell"><span class="pdfd-h-navy">ÁREA:</span><span class="pdfd-h-navy">${escapeHtml(rev.sourceArea)}</span></div>
        <div class="pdfd-h-cell"><span class="pdfd-h-navy">PÁGINA</span><span>${escapeHtml(page.num)}</span></div>
      </div>
      <div class="pdfd-cols">${page.cols.map(renderCol).join("")}</div>
      <div class="pdfd-footer">
        <div class="pdfd-f-cell">REVISÃO: <span class="pdfd-f-num">${escapeHtml(rev.sourceRevision)}</span></div>
        <div class="pdfd-f-cell">DATA: ${escapeHtml(rev.effectiveDate)}</div>
        <div class="pdfd-f-cell pdfd-f-wide">${escapeHtml(rev.sourceBasis)}</div>
      </div>
    </div>
  `).join("");

  return `
    <div class="pdf-view-page">
      <div class="pdf-topbar">
        <div class="pdf-topbar-info">
          <div class="pdf-doc-kicker">AW139 • Rev. ${escapeHtml(rev.sourceRevision)}</div>
          <div class="pdf-doc-mission">${escapeHtml(label)}</div>
          <div class="pdf-doc-kicker">${reg ? `${escapeHtml(reg)} • ` : ""}Toque numa seção para abrir</div>
        </div>
      </div>
      <div class="pdf-body" style="padding-bottom:calc(var(--bar-h) + 20px)">
        ${pagesHtml}
      </div>
      ${renderBottomBar()}
    </div>
  `;
}

function renderChecklistPagePDF() {
  const step = selectedStep();
  if (!step) return `<div class="pdf-view-page"><div class="empty-state">Nenhuma checklist.</div></div>`;

  const steps = getMissionSteps();
  const fi = steps.findIndex(s => s.stepId === step.stepId);
  const progress = getPhaseProgress(step.phase, state, step.stepId);
  const title = step.label || step.phase.title;
  const rev = checklistData.revision;
  const phase = step.phase;

  const titleHtml = escapeHtml(title);
  const hdrCls = phase.categoryId === "offshore" ? "pdfd-sub-hdr" : "pdfd-sec-hdr";

  // Timing context
  const ft = state.flightTimes || { acionamento: null, decolagens: [], pousos: [], corte: null };
  const phaseId = phase.id;
  const isBeforeTakeoff = ["normal-before-take-off", "offshore-before-takeoff"].includes(phaseId);
  const isAfterLanding  = ["normal-after-landing",   "offshore-after-landing"].includes(phaseId);
  const decoIdx = isBeforeTakeoff
    ? steps.slice(0, fi + 1).filter(s => ["normal-before-take-off", "offshore-before-takeoff"].includes(s.phase.id)).length - 1
    : -1;
  const pousoIdx = isAfterLanding
    ? steps.slice(0, fi + 1).filter(s => ["normal-after-landing", "offshore-after-landing"].includes(s.phase.id)).length - 1
    : -1;

  // Unit code (indicativo da unidade marítima) — one per offshore leg.
  // Traffic pattern leg N and final approach leg N share the same index.
  const unitLegIdx = ["offshore-traffic-pattern", "offshore-final-approach"].includes(phaseId)
    ? steps.slice(0, fi + 1).filter(s => s.phase.id === phaseId).length - 1
    : -1;
  const unitCode = unitLegIdx >= 0 ? ((state.unitCodes || [])[unitLegIdx] || "") : "";

  const buildItemHtml = item => {
    const status = getItemStatus(phase, item, state, step.stepId);
    const sym = status === "completed" ? "✓" : status === "skipped" ? "⚠" : "";
    const btn = `data-action="toggle-item" data-item-id="${escapeHtml(item.id)}"`;

    if (item.highlight === "yellow") {
      const text = item.response
        ? `${escapeHtml(item.challenge)}. ${escapeHtml(item.response)}.`
        : `${escapeHtml(item.challenge)}.`;
      return `<button class="pdfd-item pdfd-yellowblock pdfd-item-tap ${status}" ${btn}>
        <span>${text}</span>
        <span class="pdfd-state-sym">${sym}</span>
      </button>`;
    }
    const bullet  = item.callout ? `<span class="pdfd-bullet">●</span>` : "";
    const greenDeck = (item.tags || []).includes("GREEN DECK");
    const resp = greenDeck
      ? `<span class="pdfd-hl-green">${escapeHtml(item.response)}</span>`
      : escapeHtml(item.response);
    const unitChip = item.unitDisplay && unitCode
      ? ` <span class="unit-chip">${escapeHtml(unitCode)}</span>`
      : "";
    return `<button class="pdfd-item pdfd-item-tap ${status}" ${btn}>
      <span class="pdfd-name">${bullet}${escapeHtml(item.challenge)}${unitChip}</span>
      <span class="pdfd-dots"></span>
      <span class="pdfd-resp">${resp}</span>
      <span class="pdfd-state-sym">${sym}</span>
    </button>`;
  };

  const pousoPrefix = (settings.timingEnabled && isAfterLanding)
    ? renderTimingMarker("pouso", "POUSO", ft.pousos[pousoIdx] ?? null)
    : "";

  const itemRows = [
    pousoPrefix,
    ...phase.items.map((item, idx) => {
      let row = buildItemHtml(item);
      if (item.unitInput) row += renderUnitInput(unitLegIdx, unitCode);
      if (!settings.timingEnabled) return row;
      const isLast = idx === phase.items.length - 1;
      if (phaseId === "normal-first-engine-start" && item.id === "nfes-003")
        return row + renderTimingMarker("acionamento", "ACIONAMENTO", ft.acionamento);
      if (phaseId === "normal-engines-shut-down" && item.id === "nesd-010")
        return row + renderTimingMarker("corte", "CORTE", ft.corte);
      if (isBeforeTakeoff && isLast)
        return row + renderTimingMarker("decolagem", "DECOLAGEM", ft.decolagens[decoIdx] ?? null);
      return row;
    })
  ].join("");

  const completionBanner = progress.isComplete ? `
    <div class="group-complete-banner">
      <div class="gcb-inner">
        <div class="gcb-check">✓</div>
        <div class="gcb-text">
          <div class="gcb-title">${escapeHtml(title)} — CONCLUÍDO</div>
          <div class="gcb-sub">Avançar para o próximo grupo?</div>
        </div>
        <button class="gcb-btn" data-action="nav-next">Próximo →</button>
      </div>
    </div>
  ` : "";

  return `
    <div class="pdf-view-page">
      <div class="pdf-topbar pdf-topbar-detail">
        <button class="pdfd-back-btn" data-action="nav-ncl">← NCL</button>
        <div class="pdf-topbar-info">
          <div class="pdf-doc-kicker">${fi + 1}/${steps.length} • ${escapeHtml(phase.categoryTitle)}</div>
          <div class="pdfd-detail-prog">${progress.done}/${progress.total} itens${progress.isComplete ? " ✓" : ""}</div>
          <div class="pdfd-detail-progbar"><div class="pdfd-detail-progfill" style="width:${progress.percent}%"></div></div>
        </div>
      </div>
      <div class="pdf-body" style="padding-bottom:calc(var(--bar-h) + ${progress.isComplete ? "88px" : "20px"})">
        <div class="pdfd-cutout">
          <div class="pdfd-cutout-header">
            <img src="./assets/omni-logo.png" alt="OMNI" class="pdfd-cutout-logo">
            <span class="pdfd-cutout-doctitle">${escapeHtml(rev.sourceDocumentTitle)}</span>
            <span class="pdfd-cutout-page">Pág. ${checklistData.phases.find(p => p.id === phase.id)?.pdfPage || "?"}</span>
          </div>
          <div class="pdfd-sec pdfd-cutout-sec">
            <div class="${hdrCls}">${titleHtml}</div>
            ${itemRows}
          </div>
          <div class="pdfd-cutout-footer">
            REVISÃO: ${escapeHtml(rev.sourceRevision)} &nbsp;|&nbsp; ${escapeHtml(rev.effectiveDate)} &nbsp;|&nbsp; ${escapeHtml(rev.sourceBasis)}
          </div>
        </div>
      </div>
      ${completionBanner}
      ${renderBottomBar()}
    </div>
  `;
}

// ─── Main render ─────────────────────────────────────────────────────────────

function render() {
  if (!state.profileId || showingInitial) {
    app.innerHTML = renderInitialScreen();
    bindEvents();
    return;
  }
  if (state.completedAt) {
    app.innerHTML = renderCompletion();
    bindEvents();
    return;
  }
  app.innerHTML = currentView === "groups" ? renderGroupsPage() : renderChecklistPage();
  bindEvents();
  if (currentView === "checklist") autoScrollToActiveItem();
}

// ─── Events ──────────────────────────────────────────────────────────────────

function bindEvents() {
  document.querySelectorAll("[data-action='select-step']").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      selectStep(btn.dataset.stepId);
    });
  });

  document.querySelectorAll("[data-action='select-profile']").forEach(btn => {
    btn.addEventListener("click", () => {
      const profileId = btn.dataset.profile;
      const params = btn.dataset.params ? JSON.parse(btn.dataset.params) : {};
      handleSelectProfile(profileId, params);
    });
  });

  document.querySelectorAll("[data-action='expand-legs']").forEach(btn => {
    btn.addEventListener("click", () => {
      legPicker = { profile: btn.dataset.profile, count: 2 };
      app.innerHTML = renderInitialScreen();
      bindEvents();
    });
  });

  document.querySelectorAll("[data-action='leg-dec']").forEach(btn => {
    btn.addEventListener("click", () => {
      if (legPicker) legPicker = { ...legPicker, count: Math.max(1, legPicker.count - 1) };
      app.innerHTML = renderInitialScreen();
      bindEvents();
    });
  });

  document.querySelectorAll("[data-action='leg-inc']").forEach(btn => {
    btn.addEventListener("click", () => {
      if (legPicker) legPicker = { ...legPicker, count: Math.min(legPicker.profile === "normal_stops" ? 4 : 5, legPicker.count + 1) };
      app.innerHTML = renderInitialScreen();
      bindEvents();
    });
  });

  document.querySelectorAll("[data-action='toggle-item']").forEach(btn => {
    let x0 = 0, y0 = 0, didSwipe = false;
    const id = btn.dataset.itemId;

    btn.addEventListener("pointerdown", e => {
      x0 = e.clientX; y0 = e.clientY; didSwipe = false;
      btn.style.transition = "none";
    });

    btn.addEventListener("pointermove", e => {
      const dx = e.clientX - x0, dy = e.clientY - y0;
      if (dx < 0 && Math.abs(dx) > Math.abs(dy)) {
        const t = Math.min(Math.abs(dx), 100);
        btn.style.transform = `translateX(${-t}px)`;
        btn.style.background = `rgba(255,92,92,${(t / 100) * 0.28})`;
      }
    });

    const release = e => {
      const dx = (e.clientX ?? x0) - x0;
      const dy = (e.clientY ?? y0) - y0;
      btn.style.transition = "transform 220ms ease, background 220ms ease";
      btn.style.transform = "";
      btn.style.background = "";
      if (dx < -60 && Math.abs(dy) < 50) {
        didSwipe = true;
        handleSkipItem(id);
      }
    };

    btn.addEventListener("pointerup", release);
    btn.addEventListener("pointercancel", () => {
      btn.style.transition = "transform 220ms ease, background 220ms ease";
      btn.style.transform = "";
      btn.style.background = "";
    });
    btn.addEventListener("click", e => {
      if (didSwipe) { e.preventDefault(); didSwipe = false; return; }
      handleToggleItem(id);
    });
  });

  document.querySelectorAll("[data-action='export-pdf']").forEach(btn => {
    btn.addEventListener("click", () => generateFlightPDF(btn.dataset.flightId));
  });

  document.querySelector("[data-action='nav-home']")?.addEventListener("click", handleHome);
  document.querySelector("[data-action='nav-reset-group']")?.addEventListener("click", handleResetGroupFromBar);
  document.querySelector("[data-action='nav-next-pending']")?.addEventListener("click", handleNextPendingFromBar);
  document.querySelectorAll("[data-action='nav-groups']").forEach(btn =>
    btn.addEventListener("click", handleShowGroups)
  );
  document.querySelectorAll("[data-action='nav-ncl']").forEach(btn =>
    btn.addEventListener("click", handleShowNCL)
  );
  document.querySelector("[data-action='nav-next']")?.addEventListener("click", handleNextFromBar);
  document.querySelector("[data-action='continue-flight']")?.addEventListener("click", handleContinueFlight);
  document.querySelector("[data-action='review-checklist']")?.addEventListener("click", handleReviewChecklist);
  document.querySelector("[data-action='reset-all']")?.addEventListener("click", handleResetAll);
  document.querySelector("[data-action='toggle-night']")?.addEventListener("click", handleToggleNightMode);
  document.querySelector("[data-action='toggle-settings']")?.addEventListener("click", () => {
    settingsOpen = !settingsOpen;
    app.innerHTML = renderInitialScreen();
    bindEvents();
  });
  document.querySelector("[data-action='toggle-barriers']")?.addEventListener("click", () => {
    settings = { ...settings, barriersDisabled: !settings.barriersDisabled };
    saveSettings(settings);
    app.innerHTML = renderInitialScreen();
    bindEvents();
  });
  document.querySelector("[data-action='toggle-timing']")?.addEventListener("click", () => {
    settings = { ...settings, timingEnabled: !settings.timingEnabled };
    saveSettings(settings);
    app.innerHTML = renderInitialScreen();
    bindEvents();
  });
  // Note: mark-time clicks are handled by a single delegated listener on `app`
  // (see bottom of file) so they work reliably across checklist re-renders.
  const reRenderInitial = () => { app.innerHTML = renderInitialScreen(); bindEvents(); };

  document.querySelector("[data-action='fb-open']")?.addEventListener("click", () => {
    flightBuilder = { startup: "onshore", stops: [], final: "onshore" };
    reRenderInitial();
  });
  document.querySelector("[data-action='fb-close']")?.addEventListener("click", () => {
    flightBuilder = null; reRenderInitial();
  });
  document.querySelectorAll("[data-action='fb-startup']").forEach(btn =>
    btn.addEventListener("click", () => { if (flightBuilder) flightBuilder = { ...flightBuilder, startup: btn.dataset.val }; reRenderInitial(); })
  );
  document.querySelectorAll("[data-action='fb-final']").forEach(btn =>
    btn.addEventListener("click", () => { if (flightBuilder) flightBuilder = { ...flightBuilder, final: btn.dataset.val }; reRenderInitial(); })
  );
  document.querySelector("[data-action='fb-add-stop']")?.addEventListener("click", () => {
    if (flightBuilder) flightBuilder = { ...flightBuilder, stops: [...flightBuilder.stops, { type: "onshore" }] };
    reRenderInitial();
  });
  document.querySelectorAll("[data-action='fb-stop-type']").forEach(btn =>
    btn.addEventListener("click", () => {
      if (flightBuilder) {
        const idx = parseInt(btn.dataset.idx);
        flightBuilder = { ...flightBuilder, stops: flightBuilder.stops.map((s, i) => i === idx ? { type: btn.dataset.val } : s) };
      }
      reRenderInitial();
    })
  );
  document.querySelectorAll("[data-action='fb-del-stop']").forEach(btn =>
    btn.addEventListener("click", () => {
      if (flightBuilder) {
        const idx = parseInt(btn.dataset.idx);
        flightBuilder = { ...flightBuilder, stops: flightBuilder.stops.filter((_, i) => i !== idx) };
      }
      reRenderInitial();
    })
  );
  document.querySelector("[data-action='fb-start']")?.addEventListener("click", () => {
    if (flightBuilder) handleSelectProfile("custom", { ...flightBuilder });
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .catch(err => console.warn("Service worker registration failed", err));
  });
}

// ─── Integração AW139 Companion — query params ?embed=1 / ?back=1&return=<url> ──
function initCompanionBridge() {
  const params = new URLSearchParams(location.search);
  if (params.get("embed") === "1") document.body.classList.add("embed");
  if (!params.has("back") && !params.has("return")) return;
  const returnUrl = params.get("return");
  const style = document.createElement("style");
  style.textContent = `
    #nclBackBar{position:fixed;top:max(10px, env(safe-area-inset-top));left:10px;z-index:10000}
    #nclBackBar button{width:38px;height:38px;border-radius:10px;border:1px solid #263445;background:rgba(13,20,29,.92);color:#e8f0f8;font-size:18px;font-weight:800;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.28)}
  `;
  document.head.appendChild(style);
  const bar = document.createElement("div");
  bar.id = "nclBackBar";
  bar.innerHTML = '<button type="button" aria-label="Voltar">←</button>';
  bar.querySelector("button").addEventListener("click", () => {
    if (returnUrl) location.href = returnUrl;
    else if (history.length > 1) history.back();
  });
  document.body.appendChild(bar);
}
initCompanionBridge();

// Global delegation for mark-time — works even when checklist re-renders
app.addEventListener("click", e => {
  const btn = e.target.closest("[data-action='mark-time']");
  if (btn) handleMarkTime(btn.dataset.marker);
});

// Unit code typing — save without re-render so the keyboard keeps focus;
// the FINAL APPROACH chip picks the value up on its next render.
app.addEventListener("input", e => {
  const inp = e.target.closest("input[data-action='unit-code']");
  if (!inp) return;
  const leg = parseInt(inp.dataset.leg);
  if (isNaN(leg) || leg < 0) return;
  const codes = [...(state.unitCodes || [])];
  codes[leg] = inp.value.toUpperCase().trim();
  state = saveState({ ...state, unitCodes: codes });
});

render();
