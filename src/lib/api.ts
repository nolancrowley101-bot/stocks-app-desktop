import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { getSettings } from "./settings";
import type { ChartPoint, ChartRange, Quote, SearchResult } from "../types";

// Use the Tauri HTTP plugin so requests go through Rust (no CORS, real User-Agent).
async function getJSON<T>(path: string): Promise<T> {
  const { apiBase } = getSettings();
  const url = `${apiBase.replace(/\/$/, "")}${path}`;
  const res = await tauriFetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${path}`);
  return (await res.json()) as T;
}

export async function fetchQuote(symbol: string): Promise<Quote | null> {
  try {
    const data = await getJSON<{ quote?: Quote; error?: string }>(
      `/api/quote/${encodeURIComponent(symbol)}`,
    );
    return data.quote ?? null;
  } catch {
    return null;
  }
}

export async function fetchQuotes(symbols: string[]): Promise<Quote[]> {
  const results = await Promise.all(symbols.map(fetchQuote));
  return results.filter((q): q is Quote => q != null);
}

export async function fetchChart(symbol: string, range: ChartRange): Promise<ChartPoint[]> {
  const data = await getJSON<{ points: ChartPoint[] }>(
    `/api/quote/${encodeURIComponent(symbol)}/chart?range=${range}`,
  );
  return data.points ?? [];
}

export async function searchSymbols(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  const data = await getJSON<{ results: SearchResult[] }>(
    `/api/search?q=${encodeURIComponent(query)}`,
  );
  return data.results ?? [];
}
