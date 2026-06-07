import type { Route } from "../App";

type Item = { route: Route; label: string; hint: string };

const ITEMS: Item[] = [
  { route: "home", label: "Markets", hint: "Overview" },
  { route: "watchlist", label: "Watchlist", hint: "Live prices" },
  { route: "alerts", label: "Alerts", hint: "Price triggers" },
  { route: "download", label: "Get the app", hint: "Install for others" },
  { route: "settings", label: "Settings", hint: "API + refresh" },
];

export function Sidebar({
  route,
  onRoute,
}: {
  route: Route;
  onRoute: (r: Route) => void;
}) {
  return (
    <aside className="w-56 shrink-0 border-r border-zinc-800 bg-zinc-950/60 px-3 py-4 flex flex-col gap-1">
      <div className="px-2 pb-3 mb-2 border-b border-zinc-800">
        <div className="text-sm font-semibold tracking-tight">Stocks Services</div>
        <div className="text-[11px] text-zinc-500">Desktop · v0.1.0</div>
      </div>
      {ITEMS.map((item) => {
        const active = route === item.route;
        return (
          <button
            key={item.route}
            onClick={() => onRoute(item.route)}
            className={`text-left px-2 py-1.5 rounded-md text-sm transition ${
              active
                ? "bg-zinc-800/80 text-zinc-100"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
            }`}
          >
            <div>{item.label}</div>
            <div className="text-[11px] text-zinc-500">{item.hint}</div>
          </button>
        );
      })}
    </aside>
  );
}
