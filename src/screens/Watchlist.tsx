import { useEffect, useState } from "react";
import { fetchQuotes } from "../lib/api";
import { fmtCurrency } from "../lib/format";
import { Delta } from "../components/Num";
import { getWatchlist, removeFromWatchlist } from "../lib/store";
import type { Quote } from "../types";

export function Watchlist({ onPick }: { onPick: (s: string) => void }) {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    setSymbols(getWatchlist());
  }, []);

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

  if (symbols.length === 0) {
    return (
      <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-6 text-sm text-zinc-400">
        No symbols yet. Search for a ticker and add it to your watchlist.
      </div>
    );
  }

  const map = new Map(quotes.map((q) => [q.symbol.toUpperCase(), q]));

  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950/40 overflow-hidden">
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-3 py-2 border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-500">
        <div>Symbol</div>
        <div className="text-right">Last</div>
        <div className="text-right min-w-[140px]">Change</div>
        <div className="w-12"></div>
      </div>
      <div className="divide-y divide-zinc-800/60">
        {symbols.map((sym) => {
          const q = map.get(sym);
          return (
            <div
              key={sym}
              className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center px-3 py-1.5 text-sm hover:bg-zinc-900/60"
            >
              <button onClick={() => onPick(sym)} className="text-left">
                <div className="text-zinc-100 font-medium">{sym}</div>
                <div className="text-[11px] text-zinc-500">
                  {q?.shortName ?? q?.longName ?? ""}
                </div>
              </button>
              <div className="tnum text-zinc-100 text-right">
                {fmtCurrency(q?.regularMarketPrice, q?.currency)}
              </div>
              <div className="text-xs text-right min-w-[140px]">
                <Delta
                  change={q?.regularMarketChange}
                  percent={q?.regularMarketChangePercent}
                />
              </div>
              <button
                onClick={() => setSymbols(removeFromWatchlist(sym))}
                className="text-zinc-500 hover:text-rose-400 text-xs"
                title="Remove"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
