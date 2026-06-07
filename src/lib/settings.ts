const KEY = "stocks-app-desktop:settings";

export type Settings = {
  apiBase: string;
  refreshSeconds: number;
};

const DEFAULTS: Settings = {
  apiBase: "https://stocks-services.com",
  refreshSeconds: 30,
};

export function getSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function setSettings(next: Partial<Settings>): Settings {
  const merged = { ...getSettings(), ...next };
  localStorage.setItem(KEY, JSON.stringify(merged));
  return merged;
}
