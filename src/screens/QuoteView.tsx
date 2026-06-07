import { useEffect, useState } from "react";
import { fetchChart, fetchQuote } from "../lib/api";
import { fmtCompact, fmtCurrency, fmtNumber } from "../lib/format";
import { Delta } from "../components/Num";
import { PriceChart } from "../components/Chart";
import { addToWatchlist, getWatchlist, removeFromWatchlist } from "../lib/store";
import type { ChartPoint, ChartRange, Quote } from "../types";

const RANGES: ChartRange[] = ["1d", "5d", "1mo", "6mo", "1y", "5y", "max"];

export function QuoteView({ symbol }: { symbol: string }) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [range, setRange] = useState<ChartRange>("1mo");
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    setInWatchlist(getWatchlist().includes(symbol.toUpperCase()));
  }, [symbol]);

  useEffect(() => {
    let cancelled = false;
    fetchQuote(symbol).then((q) => {
      if (!cancelled) setQuote(q);
    });
    return () => {
      cancelled = true;
    };
  }, [symbol]);

  useEffect(() => {
    let cancelled = false;
    fetchChart(symbol, range).then((p) => {
      if (!cancelled) setPoints(p);
    });
    return () => {
      cancelled = true;
    };
  }, [symbol, range]);

  const stats: { label: string; value: string }[] = [
    { label: "Previous close", value: fmtCurrency(quote?.regularMarketPreviousClose, quote?.currency) },
    { label: "Open", value: fmtCurrency(quote?.regularMarketOpen, quote?.currency) },
    { label: "Day range", value: `${fmtNumber(quote?.regularMarketDayLow)} – ${fmtNumber(quote?.regularMarketDayHigh)}` },
    { label: "52w range", value: `${fmtNumber(quote?.fiftyTwoWeekLow)} – ${fmtNumber(quote?.fiftyTwoWeekHigh)}` },
    { label: "Volume", value: fmtCompact(quote?.regularMarketVolume) },
    { label: "Avg vol (3m)", value: fmtCompact(quote?.averageDailyVolume3Month) },
    { label: "Market cap", value: fmtCompact(quote?.marketCap) },
    { label: "P/E (TTM)", value: fmtNumber(quote?.trailingPE) },
    { label: "Fwd P/E", value: fmtNumber(quote?.forwardPE) },
    { label: "Div yield", value: quote?.dividendYield != null ? `${(quote.dividendYield * 100).toFixed(2)}%` : "—" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-md border border-zinc-800 bg-zinc-950/40 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-zinc-500">
              {quote?.exchange ?? "—"} · {quote?.marketState ?? "—"}
            </div>
            <div className="text-xl font-semibold tracking-tight">
              {symbol.toUpperCase()}
              <span className="ml-2 text-zinc-400 font-normal text-base">
                {quote?.shortName ?? quote?.longName ?? ""}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-3">
              <div className="tnum text-3xl font-semibold">
                {fmtCurrency(quote?.regularMarketPrice, quote?.currency)}
              </div>
              <div className="text-sm">
                <Delta
                  change={quote?.regularMarketChange}
                  percent={quote?.regularMarketChangePercent}
                />
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              if (inWatchlist) removeFromWatchlist(symbol);
              else addToWatchlist(symbol);
              setInWatchlist(!inWatchlist);
            }}
            className="self-start px-2.5 py-1 text-xs rounded-md border border-zinc-700 hover:bg-zinc-800"
          >
            {inWatchlist ? "Remove from watchlist" : "+ Watchlist"}
          </button>
        </div>
      </div>

      <div className="rounded-md border border-zinc-800 bg-zinc-950/40">
        <div className="px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-wider text-zinc-500">
            Chart
          </div>
          <div className="flex gap-1">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2 py-0.5 text-xs rounded ${
                  r === range
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[360px] p-2">
          <PriceChart points={points} />
        </div>
      </div>

      <div className="rounded-md border border-zinc-800 bg-zinc-950/40">
        <div className="px-3 py-2 border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-500">
          Key statistics
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-y divide-zinc-800/60 text-sm">
          {stats.map((s) => (
            <div key={s.label} className="px-3 py-2">
              <div className="text-[11px] text-zinc-500">{s.label}</div>
              <div className="tnum text-zinc-100">{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
