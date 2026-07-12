const STORAGE_KEY = "aw139-checklist-state-v3-rev23";
const LOG_KEY = "aw139-flight-log-v2-rev23";
const SETTINGS_KEY = "aw139-app-settings-v1";

const defaultState = {
  profileId: null,
  profileParams: {},
  flightRegistration: "",
  flightRemarks: "",
  selectedStepId: null,
  activeItemId: null,
  completed: {},
  skipped: {},
  completedTimestamps: {},
  completedAt: null,
  lastUpdatedAt: null,
  flightSessionStartedAt: null,
  flightTimes: { acionamento: null, decolagens: [], pousos: [], corte: null },
  unitCodes: []
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : { ...defaultState };
  } catch {
    return { ...defaultState };
  }
}

export function saveState(state) {
  const next = { ...state, lastUpdatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function resetAllState() {
  localStorage.removeItem(STORAGE_KEY);
  return { ...defaultState };
}

export function loadFlightLog() {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveFlightLog(log) {
  localStorage.setItem(LOG_KEY, JSON.stringify(log));
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const defaults = { registration: "", nightMode: false, barriersDisabled: true, timingEnabled: false };
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return { registration: "", nightMode: false, barriersDisabled: true, timingEnabled: false };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
