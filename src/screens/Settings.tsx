import { useState } from "react";
import { getSettings, setSettings } from "../lib/settings";
import { startAlertEngine } from "../lib/alertEngine";

export function Settings() {
  const [s, setS] = useState(getSettings());
  const [saved, setSaved] = useState(false);

  const save = () => {
    const merged = setSettings(s);
    setS(merged);
    startAlertEngine();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-4 max-w-lg">
      <div className="text-[11px] uppercase tracking-wider text-zinc-500 mb-3">
        Settings
      </div>
      <div className="flex flex-col gap-3 text-sm">
        <label className="flex flex-col gap-1">
          <span className="text-zinc-400">API base</span>
          <input
            value={s.apiBase}
            onChange={(e) => setS({ ...s, apiBase: e.target.value })}
            className="bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1"
          />
          <span className="text-[11px] text-zinc-500">
            The desktop app calls this origin for quotes, charts, and search. Defaults
            to https://stocks-services.com.
          </span>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-zinc-400">Refresh interval (seconds)</span>
          <input
            value={s.refreshSeconds}
            onChange={(e) =>
              setS({ ...s, refreshSeconds: Number(e.target.value) || 30 })
            }
            type="number"
            min={15}
            className="bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1 w-32"
          />
          <span className="text-[11px] text-zinc-500">
            How often the alert engine checks prices. Minimum 15s.
          </span>
        </label>
        <div className="flex items-center gap-3">
          <button
            onClick={save}
            className="px-3 py-1 text-sm rounded-md bg-zinc-100 text-zinc-900 hover:bg-white"
          >
            Save
          </button>
          {saved && <span className="text-emerald-400 text-xs">Saved.</span>}
        </div>
      </div>
    </div>
  );
}
