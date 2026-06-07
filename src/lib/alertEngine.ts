import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { fetchQuotes } from "./api";
import { getAlerts, markAlertFired } from "./store";
import { getSettings } from "./settings";

const COOLDOWN_MS = 1000 * 60 * 60 * 4; // re-fire same alert at most every 4h

async function ensurePermission(): Promise<boolean> {
  let granted = await isPermissionGranted();
  if (!granted) {
    const result = await requestPermission();
    granted = result === "granted";
  }
  return granted;
}

async function tick() {
  const alerts = getAlerts();
  if (alerts.length === 0) return;

  const granted = await ensurePermission();
  if (!granted) return;

  const symbols = Array.from(new Set(alerts.map((a) => a.symbol)));
  const quotes = await fetchQuotes(symbols);
  const priceBySymbol = new Map(
    quotes.map((q) => [q.symbol.toUpperCase(), q.regularMarketPrice]),
  );

  const now = Date.now();
  for (const alert of alerts) {
    const price = priceBySymbol.get(alert.symbol.toUpperCase());
    if (price == null) continue;
    const hit =
      alert.direction === "above" ? price >= alert.price : price <= alert.price;
    if (!hit) continue;
    if (alert.lastFiredAt && now - alert.lastFiredAt < COOLDOWN_MS) continue;

    sendNotification({
      title: `${alert.symbol} ${alert.direction} ${alert.price}`,
      body: `Now ${price.toFixed(2)} — alert triggered.`,
    });
    markAlertFired(alert.id);
  }
}

let timer: number | null = null;

export function startAlertEngine() {
  stopAlertEngine();
  const { refreshSeconds } = getSettings();
  const intervalMs = Math.max(15, refreshSeconds) * 1000;
  // Run once at start, then on interval.
  void tick();
  timer = window.setInterval(() => {
    void tick();
  }, intervalMs);
}

export function stopAlertEngine() {
  if (timer != null) {
    window.clearInterval(timer);
    timer = null;
  }
}
