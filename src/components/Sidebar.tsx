import type { Route } from "../App";
import { useAuth } from "../lib/auth";

type Item = { route: Route; label: string; hint: string };

const NAV_ITEMS: Item[] = [
  { route: "home", label: "Markets", hint: "Indices · sectors · movers" },
  { route: "news", label: "News", hint: "Headlines + watchlist" },
  { route: "watchlist", label: "Watchlist", hint: "Live prices" },
  { route: "portfolio", label: "Portfolio", hint: "Holdings + P/L" },
  { route: "alerts", label: "Alerts", hint: "Price triggers" },
];

const META_ITEMS: Item[] = [
  { route: "download", label: "Get the app", hint: "Share installer" },
  { route: "settings", label: "Settings", hint: "API + refresh" },
];

export function Sidebar({
  route,
  onRoute,
}: {
  route: Route;
  onRoute: (r: Route) => void;
}) {
  const { user, signOut } = useAuth();

  return (
    <aside className="w-56 shrink-0 border-r border-[var(--border)] bg-[var(--bg)] px-3 py-4 flex flex-col gap-1">
      <div className="px-2 pb-3 mb-2 border-b border-[var(--border)]">
        <div className="text-sm font-semibold tracking-tight text-[var(--fg)]">Stocks Services</div>
        <div className="text-[10px] uppercase tracking-wider text-[var(--fg-3)]">Desktop · v0.2.0</div>
      </div>

      <NavSection items={NAV_ITEMS} route={route} onRoute={onRoute} />

      <div className="mt-2 mb-1 px-2 label">More</div>
      <NavSection items={META_ITEMS} route={route} onRoute={onRoute} />

      <div className="mt-auto pt-3 border-t border-[var(--border)]">
        {user ? (
          <div className="px-2 py-1">
            <div className="text-[10px] uppercase tracking-wider text-[var(--fg-3)]">Signed in</div>
            <div className="text-[12px] text-[var(--fg)] truncate" title={user.email}>
              {user.name || user.email}
            </div>
            <button
              onClick={signOut}
              className="mt-2 text-[10px] uppercase tracking-wider text-[var(--fg-3)] hover:text-[var(--loss)]"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex gap-1.5 px-1">
            <button
              onClick={() => onRoute("signin")}
              className={`flex-1 text-[11px] uppercase tracking-wider h-7 border ${
                route === "signin"
                  ? "border-[var(--fg-2)] text-[var(--fg)]"
                  : "border-[var(--border-strong)] text-[var(--fg-2)] hover:border-[var(--fg-3)]"
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => onRoute("register")}
              className={`flex-1 text-[11px] uppercase tracking-wider h-7 border ${
                route === "register"
                  ? "border-[var(--fg-2)] text-[var(--fg)]"
                  : "border-[var(--border-strong)] text-[var(--fg-2)] hover:border-[var(--fg-3)]"
              }`}
            >
              Register
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

function NavSection({
  items,
  route,
  onRoute,
}: {
  items: Item[];
  route: Route;
  onRoute: (r: Route) => void;
}) {
  return (
    <>
      {items.map((item) => {
        const active = route === item.route;
        return (
          <button
            key={item.route}
            onClick={() => onRoute(item.route)}
            className={`text-left px-2 py-1.5 rounded-sm text-sm transition ${
              active
                ? "bg-[var(--surface-2)] text-[var(--fg)]"
                : "text-[var(--fg-2)] hover:bg-[var(--surface)] hover:text-[var(--fg)]"
            }`}
          >
            <div>{item.label}</div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--fg-3)]">{item.hint}</div>
          </button>
        );
      })}
    </>
  );
}
