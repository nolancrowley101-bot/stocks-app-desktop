import type { Alert } from "../types";

const WATCHLIST_KEY = "stocks-app-desktop:watchlist";
const ALERTS_KEY = "stocks-app-desktop:alerts";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getWatchlist(): string[] {
  return read<string[]>(WATCHLIST_KEY, ["AAPL", "MSFT", "NVDA", "GOOGL", "TSLA"]);
}

export function setWatchlist(symbols: string[]) {
  write(WATCHLIST_KEY, Array.from(new Set(symbols.map((s) => s.toUpperCase()))));
}

export function addToWatchlist(symbol: string) {
  const next = Array.from(new Set([...getWatchlist(), symbol.toUpperCase()]));
  setWatchlist(next);
  return next;
}

export function removeFromWatchlist(symbol: string) {
  const next = getWatchlist().filter((s) => s !== symbol.toUpperCase());
  setWatchlist(next);
  return next;
}

export function getAlerts(): Alert[] {
  return read<Alert[]>(ALERTS_KEY, []);
}

export function setAlerts(alerts: Alert[]) {
  write(ALERTS_KEY, alerts);
}

export function addAlert(alert: Omit<Alert, "id" | "createdAt">): Alert[] {
  const full: Alert = {
    ...alert,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    symbol: alert.symbol.toUpperCase(),
  };
  const next = [...getAlerts(), full];
  setAlerts(next);
  return next;
}

export function removeAlert(id: string): Alert[] {
  const next = getAlerts().filter((a) => a.id !== id);
  setAlerts(next);
  return next;
}

export function markAlertFired(id: string): Alert[] {
  const next = getAlerts().map((a) =>
    a.id === id ? { ...a, lastFiredAt: Date.now() } : a,
  );
  setAlerts(next);
  return next;
}
