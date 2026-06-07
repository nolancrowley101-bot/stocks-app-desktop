import { useEffect, useState } from "react";
import { fetchQuotes, fetchMovers, fetchNews } from "../lib/api";
import { fmtCurrency, fmtPercent, timeAgo } from "../lib/format";
import { Module, ModuleHeader, ModuleFooter } from "../components/ui/Module";
import { Num, Delta } from "../components/ui/Num";
import { Heatmap, type HeatmapCell } from "../components/ui/Heatmap";
import {
  DataTable,
  tableHead,
  tableHeadNum,
  tableCell,
  tableCellNum,
  tableRow,
} from "../components/ui/DataTable";
import { PageHeader } from "../components/ui/PageHeader";
import type { Mover, NewsItem, Quote } from "../types";

const INDEX_GROUP = [
  { symbol: "^GSPC", label: "S&P 500" },
  { symbol: "^IXIC", label: "Nasdaq" },
  { symbol: "^DJI", label: "Dow Jones" },
  { symbol: "^RUT", label: "Russell 2K" },
  { symbol: "^VIX", label: "VIX" },
  { symbol: "^FTSE", label: "FTSE 100" },
  { symbol: "^N225", label: "Nikkei" },
  { symbol: "^HSI", label: "Hang Seng" },
];
const COMMODITY_GROUP = [
  { symbol: "CL=F", label: "WTI Crude" },
  { symbol: "BZ=F", label: "Brent" },
  { symbol: "NG=F", label: "Nat Gas" },
  { symbol: "GC=F", label: "Gold" },
  { symbol: "SI=F", label: "Silver" },
  { symbol: "HG=F", label: "Copper" },
];
const CURRENCY_GROUP = [
  { symbol: "DX-Y.NYB", label: "DXY" },
  { symbol: "EURUSD=X", label: "EUR/USD" },
  { symbol: "USDJPY=X", label: "USD/JPY" },
  { symbol: "GBPUSD=X", label: "GBP/USD" },
  { symbol: "USDCAD=X", label: "USD/CAD" },
  { symbol: "AUDUSD=X", label: "AUD/USD" },
];
const TREASURY_GROUP = [
  { symbol: "^IRX", label: "13W" },
  { symbol: "^FVX", label: "5Y" },
  { symbol: "^TNX", label: "10Y" },
  { symbol: "^TYX", label: "30Y" },
];
const CRYPTO_GROUP = [
  { symbol: "BTC-USD", label: "Bitcoin" },
  { symbol: "ETH-USD", label: "Ethereum" },
  { symbol: "SOL-USD", label: "Solana" },
  { symbol: "DOGE-USD", label: "Doge" },
];
const SECTOR_GROUP = [
  { symbol: "XLK", label: "Tech" },
  { symbol: "XLF", label: "Financials" },
  { symbol: "XLV", label: "Health" },
  { symbol: "XLE", label: "Energy" },
  { symbol: "XLI", label: "Industrial" },
  { symbol: "XLY", label: "Cons. Disc." },
  { symbol: "XLP", label: "Cons. Stap." },
  { symbol: "XLU", label: "Utilities" },
  { symbol: "XLB", label: "Materials" },
  { symbol: "XLRE", label: "Real Estate" },
  { symbol: "XLC", label: "Comm." },
];

export function Home({
  onPickSymbol,
  onOpenNewsArticle,
  onOpenNews,
}: {
  onPickSymbol: (s: string) => void;
  onOpenNewsArticle: (uuid: string) => void;
  onOpenNews: () => void;
}) {
  const [quotes, setQuotes] = useState<Map<string, Quote>>(new Map());
  const [gainers, setGainers] = useState<Mover[]>([]);
  const [losers, setLosers] = useState<Mover[]>([]);
  const [actives, setActives] = useState<Mover[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    const all = [
      ...INDEX_GROUP,
      ...COMMODITY_GROUP,
      ...CURRENCY_GROUP,
      ...TREASURY_GROUP,
      ...CRYPTO_GROUP,
      ...SECTOR_GROUP,
    ].map((g) => g.symbol);

    let cancelled = false;
    const loadQuotes = async () => {
      const list = await fetchQuotes(all);
      if (cancelled) return;
      setQuotes(new Map(list.map((q) => [q.symbol, q])));
    };
    const loadMovers = async () => {
      const [g, l, a] = await Promise.all([
        fetchMovers("day_gainers", 10),
        fetchMovers("day_losers", 10),
        fetchMovers("most_actives", 10),
      ]);
      if (cancelled) return;
      setGainers(g);
      setLosers(l);
      setActives(a);
    };
    const loadNews = async () => {
      const items = await fetchNews("stock market", 12);
      if (!cancelled) setNews(items);
    };

    loadQuotes();
    loadMovers();
    loadNews();
    const t = window.setInterval(loadQuotes, 30_000);
    const t2 = window.setInterval(loadMovers, 120_000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
      window.clearInterval(t2);
    };
  }, []);

  const get = (s: string) => quotes.get(s);
  const totalSymbols =
    INDEX_GROUP.length +
    COMMODITY_GROUP.length +
    CURRENCY_GROUP.length +
    TREASURY_GROUP.length +
    CRYPTO_GROUP.length +
    SECTOR_GROUP.length;

  return (
    <main className="p-2 space-y-2">
      <PageHeader
        title="Markets"
        subtitle={
          <>
            <span className="num">
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </span>
            <span className="mx-2 text-[var(--border-strong)]">·</span>
            <span>Delayed quotes — Yahoo Finance</span>
          </>
        }
        right={
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--fg-3)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--gain)] animate-pulse" />
              Live
            </span>
            <span className="text-[var(--border-strong)]">·</span>
            <span className="num">{totalSymbols} symbols</span>
          </div>
        }
      />

      {/* Equity indices — large tiles */}
      <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-px bg-[var(--border)]">
        {INDEX_GROUP.map((g) => (
          <IndexTile key={g.symbol} symbol={g.symbol} label={g.label} q={get(g.symbol)} onPick={onPickSymbol} />
        ))}
      </section>

      {/* Asset class strips */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <StripModule label="Treasuries" group={TREASURY_GROUP} get={get} onPick={onPickSymbol} suffix="%" />
        <StripModule label="Currencies" group={CURRENCY_GROUP} get={get} onPick={onPickSymbol} />
      </section>
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <StripModule label="Commodities" group={COMMODITY_GROUP} get={get} onPick={onPickSymbol} />
        <StripModule label="Crypto" group={CRYPTO_GROUP} get={get} onPick={onPickSymbol} />
      </section>

      {/* Sector heatmap */}
      <Module>
        <ModuleHeader
          label="Sectors"
          actions={<span className="num text-[10px] text-[var(--fg-3)]">SPDR · day %</span>}
        />
        <Heatmap
          cols={4}
          onPick={onPickSymbol}
          cells={SECTOR_GROUP.map((s): HeatmapCell => {
            const q = get(s.symbol);
            return {
              label: s.label,
              symbol: s.symbol,
              value: q?.regularMarketChangePercent ?? null,
              sub: <span className="num">{s.symbol}</span>,
            };
          })}
        />
      </Module>

      {/* Movers */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <MoverTable label="Top gainers" items={gainers} onPick={onPickSymbol} />
        <MoverTable label="Top losers" items={losers} onPick={onPickSymbol} />
        <MoverTable label="Most active" items={actives} onPick={onPickSymbol} />
      </section>

      {/* News + snapshot */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <Module className="lg:col-span-2">
          <ModuleHeader
            label="Market news"
            actions={
              <button
                onClick={onOpenNews}
                className="text-[10px] uppercase tracking-wider hover:text-[var(--fg)]"
              >
                All →
              </button>
            }
          />
          <ul className="divide-y divide-[var(--border)]">
            {news.slice(0, 10).map((n) => (
              <li key={n.uuid}>
                <button
                  onClick={() => onOpenNewsArticle(n.uuid)}
                  className="w-full text-left flex items-start gap-3 px-3 py-2 hover:bg-[var(--surface-2)]"
                >
                  <span className="num text-[10px] text-[var(--fg-3)] pt-0.5 whitespace-nowrap min-w-[44px]">
                    {timeAgo(n.providerPublishTime)}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] line-clamp-2 leading-snug">{n.title}</span>
                    <span className="block text-[10px] uppercase tracking-wider text-[var(--fg-3)] mt-0.5">
                      {n.publisher ?? "—"}
                    </span>
                  </span>
                </button>
              </li>
            ))}
            {news.length === 0 && (
              <li className="px-3 py-4 text-[var(--fg-3)] text-[12px]">News unavailable.</li>
            )}
          </ul>
          <ModuleFooter>Source · Yahoo Finance</ModuleFooter>
        </Module>

        <Module>
          <ModuleHeader label="Snapshot · indices" />
          <ul className="divide-y divide-[var(--border)]">
            {INDEX_GROUP.slice(0, 4).map((g) => {
              const q = get(g.symbol);
              return (
                <SnapshotRow key={g.symbol} label={g.label} symbol={g.symbol} q={q} onPick={onPickSymbol} />
              );
            })}
          </ul>
          <ModuleHeader label="Snapshot · crypto" className="border-t border-[var(--border)]" />
          <ul className="divide-y divide-[var(--border)]">
            {CRYPTO_GROUP.map((g) => {
              const q = get(g.symbol);
              return (
                <SnapshotRow key={g.symbol} label={g.label} symbol={g.symbol} q={q} onPick={onPickSymbol} />
              );
            })}
          </ul>
        </Module>
      </section>
    </main>
  );
}

function IndexTile({
  symbol,
  label,
  q,
  onPick,
}: {
  symbol: string;
  label: string;
  q?: Quote;
  onPick: (s: string) => void;
}) {
  return (
    <button
      onClick={() => onPick(symbol)}
      className="text-left bg-[var(--surface)] hover:bg-[var(--surface-2)] px-3 py-2.5 h-full transition-colors"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium truncate">{label}</span>
        <span className="num text-[10px] text-[var(--fg-3)]">{symbol}</span>
      </div>
      <Num className="block text-[16px] mt-1">
        {fmtCurrency(q?.regularMarketPrice, q?.currency ?? "USD")}
      </Num>
      <div className="text-[11px] mt-0.5">
        <Delta value={q?.regularMarketChange} pct={q?.regularMarketChangePercent} />
      </div>
    </button>
  );
}

function StripModule({
  label,
  group,
  get,
  onPick,
  suffix,
}: {
  label: string;
  group: { symbol: string; label: string }[];
  get: (s: string) => Quote | undefined;
  onPick: (s: string) => void;
  suffix?: string;
}) {
  const desktopCols =
    group.length <= 4 ? "lg:grid-cols-4" : group.length <= 6 ? "lg:grid-cols-6" : "lg:grid-cols-8";
  return (
    <Module>
      <ModuleHeader
        label={label}
        actions={<span className="num text-[10px] text-[var(--fg-3)]">{group.length}</span>}
      />
      <div className={`grid grid-cols-2 sm:grid-cols-3 ${desktopCols} gap-px bg-[var(--border)]`}>
        {group.map((g) => {
          const q = get(g.symbol);
          return (
            <button
              key={g.symbol}
              onClick={() => onPick(g.symbol)}
              className="text-left px-2.5 py-2 bg-[var(--surface)] hover:bg-[var(--surface-2)]"
            >
              <div className="text-[10px] uppercase tracking-wider text-[var(--fg-3)] truncate">{g.label}</div>
              <Num className="block text-[13px] mt-0.5">
                {q?.regularMarketPrice != null
                  ? `${q.regularMarketPrice.toFixed(suffix === "%" ? 3 : 4)}${suffix ?? ""}`
                  : "—"}
              </Num>
              <Num delta={q?.regularMarketChangePercent} className="block text-[10px]">
                {fmtPercent(q?.regularMarketChangePercent)}
              </Num>
            </button>
          );
        })}
      </div>
    </Module>
  );
}

function MoverTable({
  label,
  items,
  onPick,
}: {
  label: string;
  items: Mover[];
  onPick: (s: string) => void;
}) {
  return (
    <Module>
      <ModuleHeader
        label={label}
        actions={<span className="num text-[10px] text-[var(--fg-3)]">{items.length}</span>}
      />
      <DataTable>
        <thead>
          <tr>
            <th className={tableHead}>Sym</th>
            <th className={tableHead}>Name</th>
            <th className={tableHeadNum}>Last</th>
            <th className={tableHeadNum}>%</th>
          </tr>
        </thead>
        <tbody>
          {items.map((m) => (
            <tr key={m.symbol} className={tableRow}>
              <td className={`${tableCell} num font-medium`}>
                <button
                  onClick={() => onPick(m.symbol)}
                  className="hover:text-[var(--accent)]"
                >
                  {m.symbol}
                </button>
              </td>
              <td className={`${tableCell} text-[var(--fg-2)] max-w-[140px] truncate`}>
                {m.shortName ?? ""}
              </td>
              <td className={tableCellNum}>{fmtCurrency(m.regularMarketPrice)}</td>
              <td className={tableCellNum}>
                <Num delta={m.regularMarketChangePercent}>
                  {fmtPercent(m.regularMarketChangePercent)}
                </Num>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={4} className="px-3 py-4 text-center text-[var(--fg-3)] text-[12px]">
                Unavailable.
              </td>
            </tr>
          )}
        </tbody>
      </DataTable>
    </Module>
  );
}

function SnapshotRow({
  label,
  symbol,
  q,
  onPick,
}: {
  label: string;
  symbol: string;
  q?: Quote;
  onPick: (s: string) => void;
}) {
  return (
    <li>
      <button
        onClick={() => onPick(symbol)}
        className="w-full text-left flex items-center justify-between px-3 h-9 hover:bg-[var(--surface-2)]"
      >
        <span>
          <span className="block text-[12px]">{label}</span>
          <span className="block num text-[10px] text-[var(--fg-3)]">{symbol}</span>
        </span>
        <span className="text-right">
          <Num className="block text-[12px]">{fmtCurrency(q?.regularMarketPrice, q?.currency ?? "USD")}</Num>
          <Num delta={q?.regularMarketChangePercent} className="block text-[11px]">
            {fmtPercent(q?.regularMarketChangePercent)}
          </Num>
        </span>
      </button>
    </li>
  );
}
