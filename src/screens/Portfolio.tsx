import { useCallback, useEffect, useState } from "react";
import {
  addRemoteHolding,
  fetchQuotes,
  fetchRemoteHoldings,
  removeRemoteHolding,
} from "../lib/api";
import { fmtCurrency, fmtNumber, fmtPercent } from "../lib/format";
import { Module, ModuleHeader } from "../components/ui/Module";
import { Num, Delta } from "../components/ui/Num";
import {
  DataTable,
  tableHead,
  tableHeadNum,
  tableCell,
  tableCellNum,
  tableRow,
} from "../components/ui/DataTable";
import { useAuth } from "../lib/auth";
import type { RemoteHolding } from "../lib/api";

type Row = RemoteHolding & {
  price: number;
  marketValue: number;
  costTotal: number;
  gain: number;
  gainPct: number;
};

export function Portfolio({
  onPickSymbol,
  onSignIn,
}: {
  onPickSymbol: (s: string) => void;
  onSignIn: () => void;
}) {
  const { user } = useAuth();
  const [holdings, setHoldings] = useState<RemoteHolding[]>([]);
  const [prices, setPrices] = useState<Map<string, number>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await fetchRemoteHoldings();
      setHoldings(list);
      setError(null);
      const unique = Array.from(new Set(list.map((h) => h.symbol)));
      if (unique.length > 0) {
        const quotes = await fetchQuotes(unique);
        setPrices(new Map(quotes.map((q) => [q.symbol, q.regularMarketPrice ?? 0])));
      } else {
        setPrices(new Map());
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!user) {
    return (
      <main className="p-2">
        <Module>
          <ModuleHeader label="Portfolio" />
          <div className="p-8 text-center">
            <p className="text-[13px] text-[var(--fg-2)] mb-3">Sign in to track holdings across devices.</p>
            <button
              onClick={onSignIn}
              className="text-[11px] uppercase tracking-wider px-3 py-1.5 border border-[var(--border-strong)] hover:border-[var(--fg-2)]"
            >
              Sign in
            </button>
          </div>
        </Module>
      </main>
    );
  }

  const rows: Row[] = holdings.map((h) => {
    const price = prices.get(h.symbol) ?? 0;
    const marketValue = h.shares * price;
    const costTotal = h.shares * h.costBasis;
    const gain = marketValue - costTotal;
    const gainPct = costTotal > 0 ? (gain / costTotal) * 100 : 0;
    return { ...h, price, marketValue, costTotal, gain, gainPct };
  });

  const totalMV = rows.reduce((s, r) => s + r.marketValue, 0);
  const totalCost = rows.reduce((s, r) => s + r.costTotal, 0);
  const totalGain = totalMV - totalCost;
  const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
  const winners = rows.filter((r) => r.gain > 0).length;
  const losers = rows.filter((r) => r.gain < 0).length;

  return (
    <main className="p-2 space-y-2">
      <header className="flex items-end justify-between gap-3 px-1 pt-1 pb-2">
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight">Portfolio</h1>
          <p className="text-[11px] text-[var(--fg-3)] uppercase tracking-wider mt-0.5">
            Cost vs market value
          </p>
        </div>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <Kpi label="Market value" value={<Num className="block text-[16px] sm:text-[20px] truncate">{fmtCurrency(totalMV)}</Num>} />
        <Kpi label="Cost basis" value={<Num className="block text-[16px] sm:text-[20px] text-[var(--fg-2)] truncate">{fmtCurrency(totalCost)}</Num>} />
        <Kpi
          label="Unrealized P/L"
          value={
            <span className="block text-[16px] sm:text-[20px] truncate">
              <Delta value={totalGain} pct={totalGainPct} />
            </span>
          }
        />
        <Kpi
          label="Positions"
          value={
            <span className="block text-[16px] sm:text-[20px] num truncate">
              {rows.length}
              <span className="ml-2 text-[12px]">
                <span className="text-[var(--gain)]">{winners}</span>
                <span className="text-[var(--fg-3)] mx-1">/</span>
                <span className="text-[var(--loss)]">{losers}</span>
              </span>
            </span>
          }
        />
      </section>

      <Module>
        <ModuleHeader label="Holdings" actions={<span className="num text-[10px] text-[var(--fg-3)]">{rows.length}</span>} />
        {error ? (
          <div className="p-8 text-center text-[12px] text-[var(--loss)]">{error}</div>
        ) : loading ? (
          <div className="p-8 text-center text-[12px] text-[var(--fg-3)]">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-[12px] text-[var(--fg-2)]">No holdings yet.</div>
        ) : (
          <DataTable>
            <thead>
              <tr>
                <th className={tableHead}>Sym</th>
                <th className={tableHeadNum}>Shares</th>
                <th className={tableHeadNum}>Cost</th>
                <th className={tableHeadNum}>Price</th>
                <th className={tableHeadNum}>Market val</th>
                <th className={tableHeadNum}>P/L</th>
                <th className={tableHeadNum}>%</th>
                <th className={tableHeadNum}>Wt</th>
                <th className={tableHead}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={tableRow}>
                  <td className={`${tableCell} num font-medium`}>
                    <button onClick={() => onPickSymbol(r.symbol)} className="hover:text-[var(--accent)]">
                      {r.symbol}
                    </button>
                  </td>
                  <td className={tableCellNum}>{fmtNumber(r.shares, 4)}</td>
                  <td className={`${tableCellNum} text-[var(--fg-2)]`}>{fmtCurrency(r.costBasis)}</td>
                  <td className={tableCellNum}>{fmtCurrency(r.price)}</td>
                  <td className={`${tableCellNum} font-medium`}>{fmtCurrency(r.marketValue)}</td>
                  <td className={tableCellNum}>
                    <Num delta={r.gain}>{fmtCurrency(r.gain)}</Num>
                  </td>
                  <td className={tableCellNum}>
                    <Num delta={r.gainPct}>{fmtPercent(r.gainPct)}</Num>
                  </td>
                  <td className={`${tableCellNum} text-[var(--fg-2)]`}>
                    {totalMV > 0 ? `${((r.marketValue / totalMV) * 100).toFixed(1)}%` : "—"}
                  </td>
                  <td className={`${tableCell} text-right w-8`}>
                    <button
                      onClick={async () => {
                        try {
                          await removeRemoteHolding(r.id);
                          await refresh();
                        } catch (e) {
                          setError(e instanceof Error ? e.message : "Failed to remove");
                        }
                      }}
                      className="text-[var(--fg-3)] hover:text-[var(--loss)] text-xs"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        )}
      </Module>

      <Module>
        <ModuleHeader label="Add holding" />
        <AddHoldingForm onAdded={refresh} />
      </Module>
    </main>
  );
}

function Kpi({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Module>
      <ModuleHeader label={label} />
      <div className="px-3 py-2">{value}</div>
    </Module>
  );
}

function AddHoldingForm({ onAdded }: { onAdded: () => void }) {
  const [symbol, setSymbol] = useState("");
  const [shares, setShares] = useState("");
  const [costBasis, setCostBasis] = useState("");
  const [purchasedAt, setPurchasedAt] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const sharesNum = parseFloat(shares);
    const costNum = parseFloat(costBasis);
    if (!symbol.trim()) return setErr("Symbol is required");
    if (!Number.isFinite(sharesNum) || sharesNum <= 0) return setErr("Shares must be positive");
    if (!Number.isFinite(costNum) || costNum < 0) return setErr("Cost basis must be a number");

    setSubmitting(true);
    try {
      await addRemoteHolding({
        symbol: symbol.trim().toUpperCase(),
        shares: sharesNum,
        costBasis: costNum,
        purchasedAt: new Date(purchasedAt).toISOString(),
        notes: notes.trim() || undefined,
      });
      setSymbol("");
      setShares("");
      setCostBasis("");
      setNotes("");
      onAdded();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to add holding");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--border-strong)] focus:border-[var(--accent)] focus:outline-none px-2 h-8 text-[12px] num rounded-sm w-full";

  return (
    <form onSubmit={submit} className="p-3 grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
      <label className="block">
        <span className="label block mb-1">Symbol</span>
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="AAPL"
          className={inputCls}
        />
      </label>
      <label className="block">
        <span className="label block mb-1">Shares</span>
        <input
          value={shares}
          onChange={(e) => setShares(e.target.value)}
          placeholder="0"
          inputMode="decimal"
          className={inputCls}
        />
      </label>
      <label className="block">
        <span className="label block mb-1">Cost / share</span>
        <input
          value={costBasis}
          onChange={(e) => setCostBasis(e.target.value)}
          placeholder="0.00"
          inputMode="decimal"
          className={inputCls}
        />
      </label>
      <label className="block">
        <span className="label block mb-1">Purchased</span>
        <input
          type="date"
          value={purchasedAt}
          onChange={(e) => setPurchasedAt(e.target.value)}
          className={inputCls}
        />
      </label>
      <div className="flex flex-col gap-1">
        {err && <span className="text-[11px] text-[var(--loss)]">{err}</span>}
        <button
          type="submit"
          disabled={submitting}
          className="text-[11px] uppercase tracking-wider h-8 px-3 border border-[var(--border-strong)] hover:border-[var(--fg-2)] disabled:opacity-50"
        >
          {submitting ? "Adding…" : "Add holding"}
        </button>
      </div>
      <label className="md:col-span-5 block">
        <span className="label block mb-1">Notes (optional)</span>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tax lot / strategy / etc."
          className={inputCls}
        />
      </label>
    </form>
  );
}
