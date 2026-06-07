import { useEffect, useRef, useState } from "react";
import { searchSymbols } from "../lib/api";
import type { SearchResult } from "../types";

export function SearchBar({ onPick }: { onPick: (symbol: string) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const debounce = useRef<number | null>(null);

  useEffect(() => {
    if (debounce.current) window.clearTimeout(debounce.current);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    debounce.current = window.setTimeout(async () => {
      const r = await searchSymbols(q).catch(() => []);
      setResults(r);
    }, 180);
    return () => {
      if (debounce.current) window.clearTimeout(debounce.current);
    };
  }, [q]);

  return (
    <div className="relative w-full max-w-md">
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        placeholder="Search symbol or company…"
        className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-zinc-600"
      />
      {open && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden shadow-xl">
          {results.slice(0, 8).map((r) => (
            <button
              key={`${r.symbol}-${r.exchange ?? ""}`}
              onMouseDown={() => {
                onPick(r.symbol);
                setQ("");
                setResults([]);
              }}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-zinc-800 flex items-center justify-between gap-3"
            >
              <span className="font-medium">{r.symbol}</span>
              <span className="text-zinc-500 truncate">
                {r.shortname ?? r.longname ?? r.quoteType}
              </span>
              <span className="text-[11px] text-zinc-600">{r.exchange}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
