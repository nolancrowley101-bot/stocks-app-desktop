import { useEffect, useState } from "react";
import {
  isPermissionGranted,
  requestPermission,
} from "@tauri-apps/plugin-notification";
import { addAlert, getAlerts, removeAlert } from "../lib/store";
import { startAlertEngine } from "../lib/alertEngine";
import type { Alert } from "../types";

export function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [symbol, setSymbol] = useState("");
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [price, setPrice] = useState("");
  const [permission, setPermission] = useState<"granted" | "denied" | "default">(
    "default",
  );

  useEffect(() => {
    setAlerts(getAlerts());
    isPermissionGranted().then((g) =>
      setPermission(g ? "granted" : "default"),
    );
  }, []);

  const addOne = () => {
    const p = Number(price);
    if (!symbol.trim() || !Number.isFinite(p) || p <= 0) return;
    const next = addAlert({ symbol: symbol.trim(), direction, price: p });
    setAlerts(next);
    setSymbol("");
    setPrice("");
    // Make sure the engine is running so it'll pick this up.
    startAlertEngine();
  };

  return (
    <div className="flex flex-col gap-3">
      {permission !== "granted" && (
        <div className="rounded-md border border-amber-900 bg-amber-950/40 p-3 text-sm text-amber-200 flex items-center justify-between">
          <span>Notifications are off. Alerts can't fire without permission.</span>
          <button
            onClick={async () => {
              const r = await requestPermission();
              setPermission(r as typeof permission);
            }}
            className="px-2 py-1 text-xs rounded border border-amber-700 hover:bg-amber-900"
          >
            Enable
          </button>
        </div>
      )}

      <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-3">
        <div className="text-[11px] uppercase tracking-wider text-zinc-500 mb-2">
          New alert
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Symbol"
            className="bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1 text-sm w-32"
          />
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as "above" | "below")}
            className="bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1 text-sm"
          >
            <option value="above">crosses above</option>
            <option value="below">crosses below</option>
          </select>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
            inputMode="decimal"
            className="bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1 text-sm w-28"
          />
          <button
            onClick={addOne}
            className="px-3 py-1 text-sm rounded-md bg-zinc-100 text-zinc-900 hover:bg-white"
          >
            Add
          </button>
        </div>
      </div>

      <div className="rounded-md border border-zinc-800 bg-zinc-950/40 overflow-hidden">
        <div className="px-3 py-2 border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-500">
          Active alerts
        </div>
        {alerts.length === 0 ? (
          <div className="p-4 text-sm text-zinc-500">No alerts yet.</div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {alerts.map((a) => (
              <div
                key={a.id}
                className="grid grid-cols-[1fr_auto_auto] gap-3 items-center px-3 py-1.5 text-sm"
              >
                <div>
                  <span className="text-zinc-100 font-medium">{a.symbol}</span>{" "}
                  <span className="text-zinc-400">
                    {a.direction} {a.price}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-500">
                  {a.lastFiredAt
                    ? `last fired ${new Date(a.lastFiredAt).toLocaleString()}`
                    : "armed"}
                </div>
                <button
                  onClick={() => setAlerts(removeAlert(a.id))}
                  className="text-zinc-500 hover:text-rose-400 text-xs"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
