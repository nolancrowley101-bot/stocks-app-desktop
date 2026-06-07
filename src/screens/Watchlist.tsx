import { useCallback, useEffect, useState } from "react";
import {
  fetchQuotes,
  fetchRemoteWatchlist,
  addRemoteWatchlist,
  removeRemoteWatchlist,
} from "../lib/api";
import { fmtChange, fmtCompact, fmtCurrency, fmtPercent } from "../lib/format";
import { Module, ModuleHeader } from "../components/ui/Module";
import { Num } from "../components/ui/Num";
import {
  DataTable,
  tableHead,
  tableHeadNum,
  tableCell,
  tableCellNum,
  tableRow,
} from "../components/ui/DataTable";
import { useAuth } from "../lib/auth";
import {
  addToWatchlist as addLocalWatchlist,
  getWatchlist as getLocalWatchlist,
  removeFromWatchlist as removeLocalWatchlist,
} from "../lib/store";
import type { Quote } from "../types";

export function Watchlist({ onPick }: { onPick: (s: string) => void }) {
  const { user } = useAuth();
  const [symbols, setSymbols] = useState<string[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSymbols = useCallback(async () => {
    if (user) {
      setLoading(true);
      try {
        const items = await fetchRemoteWatchlist();
        setSymbols(items.map((i) => i.symbol));
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load watchlist");
      } finally {
        setLoading(false);
      }
    } else {
      setSymbols(getLocalWatchlist());
    }
  }, [user]);

  useEffect(() => {
    refreshSymbols();
  }, [refreshSymbols]);

  useEffect(() => {
    if (symbols.length === 0) {
      setQuotes([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      const list = await fetchQuotes(symbols);
      if (!cancelled) setQuotes(list);
    };
    load();
    const t = window.setInterval(load, 15_000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, [symbols]);

  const remove = async (sym: string) => {
    if (user) {
      try {
        await removeRemoteWatchlist(sym);
        setSymbols((prev) => prev.filter((s) => s !== sym));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to remove");
      }
    } else {
      setSymbols(removeLocalWatchlist(sym));
    }
  };

  const bySym = new Map(quotes.map((q) => [q.symbol.toUpperCase(), q]));
  const totalUp = quotes.filter((q) => (q.regularMarketChangePercent ?? 0) > 0).length;
  const totalDown = quotes.filter((q) => (q.regularMarketChangePercent ?? 0) < 0).length;

  return (
    <main className="p-2 space-y-2">
      <header className="flex items-end justify-between gap-3 px-1 pt-1 pb-2">
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight">Watchlist</h1>
          <p className="text-[11px] text-[var(--fg-3)] uppercase tracking-wider mt-0.5">
            {symbols.length} {symbols.length === 1 ? "symbol" : "symbols"}
            {symbols.length > 0 && (
              <>
                <span className="mx-2 text-[var(--border-strong)]">·</span>
                <span className="text-[var(--gain)]">{totalUp} up</span>
                <span className="mx-1">/</span>
                <span className="text-[var(--loss)]">{totalDown} down</span>
              </>
            )}
            <span className="mx-2 text-[var(--border-strong)]">·</span>
            <span>{user ? `Synced · ${user.email}` : "Local only · sign in to sync"}</span>
          </p>
        </div>
      </header>

      <Module>
        <ModuleHeader label="My watchlist" />
        {error ? (
          <div className="p-8 text-center text-[12px] text-[var(--loss)]">{error}</div>
        ) : loading ? (
          <div className="p-8 text-center text-[12px] text-[var(--fg-3)]">Loading…</div>
        ) : symbols.length === 0 ? (
          <div className="p-8 text-center text-[12px] text-[var(--fg-2)]">
            Empty. Use the search bar above to find a ticker and tap{" "}
            <span className="num">+ Watchlist</span> on its quote page.
          </div>
        ) : (
          <DataTable>
            <thead>
              <tr>
                <th className={tableHead}>Sym</th>
                <th className={tableHead}>Name</th>
                <th className={tableHeadNum}>Last</th>
                <th className={tableHeadNum}>Δ</th>
                <th className={tableHeadNum}>%</th>
                <th className={tableHeadNum}>Mkt cap</th>
                <th className={tableHead}></th>
              </tr>
            </thead>
            <tbody>
              {symbols.map((sym) => {
                const q = bySym.get(sym);
                return (
                  <tr key={sym} className={tableRow}>
                    <td className={`${tableCell} num font-medium`}>
                      <button onClick={() => onPick(sym)} className="hover:text-[var(--accent)]">
                        {sym}
                      </button>
                    </td>
                    <td className={`${tableCell} text-[var(--fg-2)] max-w-[280px] truncate`}>
                      {q?.shortName ?? q?.longName ?? "—"}
                    </td>
                    <td className={tableCellNum}>
                      {fmtCurrency(q?.regularMarketPrice, q?.currency ?? "USD")}
                    </td>
                    <td className={tableCellNum}>
                      <Num delta={q?.regularMarketChange}>{fmtChange(q?.regularMarketChange)}</Num>
                    </td>
                    <td className={tableCellNum}>
                      <Num delta={q?.regularMarketChangePercent}>
                        {fmtPercent(q?.regularMarketChangePercent)}
                      </Num>
                    </td>
                    <td className={`${tableCellNum} text-[var(--fg-2)]`}>
                      {fmtCompact(q?.marketCap)}
                    </td>
                    <td className={`${tableCell} text-right w-8`}>
                      <button
                        onClick={() => remove(sym)}
                        className="text-[var(--fg-3)] hover:text-[var(--loss)] text-xs"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </DataTable>
        )}
      </Module>
    </main>
  );
}

// Helpers exposed for the quote view to add/remove a symbol while respecting auth state.
export async function addToActiveWatchlist(symbol: string, signedIn: boolean): Promise<void> {
  const s = symbol.toUpperCase();
  if (signedIn) {
    await addRemoteWatchlist(s);
  } else {
    addLocalWatchlist(s);
  }
}

export async function removeFromActiveWatchlist(symbol: string, signedIn: boolean): Promise<void> {
  const s = symbol.toUpperCase();
  if (signedIn) {
    await removeRemoteWatchlist(s);
  } else {
    removeLocalWatchlist(s);
  }
}

export async function isInActiveWatchlist(symbol: string, signedIn: boolean): Promise<boolean> {
  const s = symbol.toUpperCase();
  if (signedIn) {
    try {
      const items = await fetchRemoteWatchlist();
      return items.some((i) => i.symbol.toUpperCase() === s);
    } catch {
      return false;
    }
  } else {
    return getLocalWatchlist().includes(s);
  }
}
