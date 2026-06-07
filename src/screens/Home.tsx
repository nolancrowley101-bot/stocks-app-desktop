import { useEffect, useState } from "react";
import { fetchQuotes } from "../lib/api";
import { fmtCurrency } from "../lib/format";
import { Delta } from "../components/Num";
import type { Quote } from "../types";

const INDEX_GROUP = [
  { symbol: "^GSPC", label: "S&P 500" },
  { symbol: "^IXIC", label: "Nasdaq" },
  { symbol: "^DJI", label: "Dow Jones" },
  { symbol: "^RUT", label: "Russell 2K" },
  { symbol: "^VIX", label: "VIX" },
  { symbol: "^FTSE", label: "FTSE 100" },
];

const CRYPTO_GROUP = [
  { symbol: "BTC-USD", label: "Bitcoin" },
  { symbol: "ETH-USD", label: "Ethereum" },
  { symbol: "SOL-USD", label: "Solana" },
  { symbol: "DOGE-USD", label: "Doge" },
];

const COMMODITY_GROUP = [
  { symbol: "CL=F", label: "WTI Crude" },
  { symbol: "GC=F", label: "Gold" },
  { symbol: "SI=F", label: "Silver" },
  { symbol: "HG=F", label: "Copper" },
];

const FX_GROUP = [
  { symbol: "DX-Y.NYB", label: "DXY" },
  { symbol: "EURUSD=X", label: "EUR/USD" },
  { symbol: "USDJPY=X", label: "USD/JPY" },
  { symbol: "GBPUSD=X", label: "GBP/USD" },
];

function Module({
  title,
  group,
  quotes,
  onPick,
}: {
  title: string;
  group: { symbol: string; label: string }[];
  quotes: Map<string, Quote>;
  onPick: (s: string) => void;
}) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950/40">
      <div className="px-3 py-2 border-b border-zinc-800 text-[11px] uppercase tracking-wider text-zinc-500">
        {title}
      </div>
      <div className="divide-y divide-zinc-800/60">
        {group.map((g) => {
          const q = quotes.get(g.symbol);
          return (
            <button
              key={g.symbol}
              onClick={() => onPick(g.symbol)}
              className="w-full grid grid-cols-[1fr_auto_auto] items-center gap-3 px-3 py-1.5 hover:bg-zinc-900/60 text-left text-sm"
            >
              <div>
                <div className="text-zinc-100">{g.label}</div>
                <div className="text-[11px] text-zinc-500">{g.symbol}</div>
              </div>
              <div className="tnum text-zinc-100">
                {fmtCurrency(q?.regularMarketPrice, q?.currency)}
              </div>
              <div className="text-xs min-w-[120px] text-right">
                <Delta
                  change={q?.regularMarketChange}
                  percent={q?.regularMarketChangePercent}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Home({ onPickSymbol }: { onPickSymbol: (s: string) => void }) {
  const [quotes, setQuotes] = useState<Map<string, Quote>>(new Map());

  useEffect(() => {
    const all = [
      ...INDEX_GROUP,
      ...CRYPTO_GROUP,
      ...COMMODITY_GROUP,
      ...FX_GROUP,
    ].map((g) => g.symbol);
    let cancelled = false;
    const load = async () => {
      const list = await fetchQuotes(all);
      if (cancelled) return;
      setQuotes(new Map(list.map((q) => [q.symbol, q])));
    };
    load();
    const t = window.setInterval(load, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3">
      <Module title="Indices" group={INDEX_GROUP} quotes={quotes} onPick={onPickSymbol} />
      <Module title="Crypto" group={CRYPTO_GROUP} quotes={quotes} onPick={onPickSymbol} />
      <Module
        title="Commodities"
        group={COMMODITY_GROUP}
        quotes={quotes}
        onPick={onPickSymbol}
      />
      <Module title="FX" group={FX_GROUP} quotes={quotes} onPick={onPickSymbol} />
    </div>
  );
}
