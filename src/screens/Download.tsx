import { openUrl } from "@tauri-apps/plugin-opener";
import { getSettings } from "../lib/settings";

const PLATFORMS = [
  { os: "Windows", file: ".exe installer", path: "/downloads/Stocks.Services_latest_x64-setup.exe" },
  { os: "macOS", file: ".dmg disk image", path: "/downloads/Stocks.Services_latest_x64.dmg" },
  { os: "Linux", file: ".AppImage", path: "/downloads/Stocks.Services_latest_amd64.AppImage" },
];

export function Download() {
  const apiBase = getSettings().apiBase.replace(/\/$/, "");
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-4 max-w-xl">
      <div className="text-[11px] uppercase tracking-wider text-zinc-500 mb-3">
        Share the app
      </div>
      <p className="text-sm text-zinc-400 mb-4">
        Direct download links for each platform. These are the same files served from
        the website's <code className="text-zinc-200">/download</code> page.
      </p>
      <div className="flex flex-col gap-2">
        {PLATFORMS.map((p) => {
          const url = `${apiBase}${p.path}`;
          return (
            <div
              key={p.os}
              className="flex items-center justify-between border border-zinc-800 rounded-md px-3 py-2"
            >
              <div>
                <div className="text-sm text-zinc-100">{p.os}</div>
                <div className="text-[11px] text-zinc-500">{p.file}</div>
              </div>
              <button
                onClick={() => openUrl(url)}
                className="px-3 py-1 text-xs rounded-md border border-zinc-700 hover:bg-zinc-800"
              >
                Open download
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
