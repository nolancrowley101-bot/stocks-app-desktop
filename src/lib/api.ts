import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { getSettings } from "./settings";
import { getToken } from "./auth";
import type {
  ChartPoint,
  ChartRange,
  Mover,
  NewsArticleResponse,
  NewsItem,
  Quote,
  SearchResult,
  SummaryModules,
} from "../types";

type Method = "GET" | "POST" | "DELETE" | "PATCH";

type RequestOpts = {
  method?: Method;
  body?: unknown;
  auth?: boolean;
};

function baseUrl(): string {
  return getSettings().apiBase.replace(/\/$/, "");
}

async function request<T>(path: string, opts: RequestOpts = {}): Promise<T> {
  const url = `${baseUrl()}${path}`;
  const headers: Record<string, string> = {};
  if (opts.body != null) headers["content-type"] = "application/json";
  if (opts.auth) {
    const t = getToken();
    if (t) headers["authorization"] = `Bearer ${t}`;
  }
  const res = await tauriFetch(url, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body != null ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    let detail = "";
    try {
      const j = (await res.json()) as { error?: string };
      detail = j?.error ?? "";
    } catch {
      // ignore body parse errors
    }
    const err = new Error(`${res.status} ${res.statusText}${detail ? ` — ${detail}` : ""}`) as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  return (await res.json()) as T;
}

// ---------- Public market data ----------

export async function fetchQuote(symbol: string): Promise<Quote | null> {
  try {
    const data = await request<{ quote?: Quote }>(`/api/quote/${encodeURIComponent(symbol)}`);
    return data.quote ?? null;
  } catch {
    return null;
  }
}

export async function fetchQuotes(symbols: string[]): Promise<Quote[]> {
  if (symbols.length === 0) return [];
  try {
    const csv = symbols.map(encodeURIComponent).join(",");
    const data = await request<{ quotes: Quote[] }>(`/api/quote/batch?symbols=${csv}`);
    return data.quotes ?? [];
  } catch {
    return [];
  }
}

export async function fetchChart(symbol: string, range: ChartRange): Promise<ChartPoint[]> {
  try {
    const data = await request<{ points: ChartPoint[] }>(
      `/api/quote/${encodeURIComponent(symbol)}/chart?range=${range}`,
    );
    return data.points ?? [];
  } catch {
    return [];
  }
}

export async function fetchSummary(symbol: string): Promise<SummaryModules | null> {
  try {
    const data = await request<{ summary: SummaryModules }>(
      `/api/quote/${encodeURIComponent(symbol)}/summary`,
    );
    return data.summary ?? null;
  } catch {
    return null;
  }
}

export async function searchSymbols(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  try {
    const data = await request<{ results: SearchResult[] }>(
      `/api/search?q=${encodeURIComponent(query)}`,
    );
    return data.results ?? [];
  } catch {
    return [];
  }
}

export async function fetchMovers(
  type: "day_gainers" | "day_losers" | "most_actives" = "day_gainers",
  count = 10,
): Promise<Mover[]> {
  try {
    const data = await request<{ items: Mover[] }>(`/api/movers?type=${type}&count=${count}`);
    return data.items ?? [];
  } catch {
    return [];
  }
}

export async function fetchNews(query = "stock market", limit = 20): Promise<NewsItem[]> {
  try {
    const data = await request<{ items: NewsItem[] }>(
      `/api/news?q=${encodeURIComponent(query)}&limit=${limit}`,
    );
    return data.items ?? [];
  } catch {
    return [];
  }
}

export async function fetchNewsArticle(uuid: string): Promise<NewsArticleResponse | null> {
  try {
    return await request<NewsArticleResponse>(`/api/news/article/${encodeURIComponent(uuid)}`);
  } catch {
    return null;
  }
}

// ---------- Auth ----------

export type AuthUser = { id: string; email: string; name?: string | null };

export async function apiSignIn(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
  return await request<{ token: string; user: AuthUser }>(`/api/auth/token`, {
    method: "POST",
    body: { email, password },
  });
}

export async function apiRegister(
  email: string,
  password: string,
  name?: string,
): Promise<{ token: string; user: AuthUser }> {
  const data = await request<{ token: string; user: AuthUser }>(`/api/register`, {
    method: "POST",
    body: { email, password, name },
  });
  return data;
}

export async function apiMe(): Promise<AuthUser | null> {
  try {
    const data = await request<{ user: AuthUser }>(`/api/auth/me`, { auth: true });
    return data.user ?? null;
  } catch {
    return null;
  }
}

// ---------- Watchlist (server-backed when signed in) ----------

export type RemoteWatchlistItem = { symbol: string; addedAt: string };

export async function fetchRemoteWatchlist(): Promise<RemoteWatchlistItem[]> {
  const data = await request<{ items: RemoteWatchlistItem[] }>(`/api/watchlist/items`, { auth: true });
  return data.items ?? [];
}

export async function addRemoteWatchlist(symbol: string): Promise<void> {
  await request<{ ok: true }>(`/api/watchlist/items`, { method: "POST", body: { symbol }, auth: true });
}

export async function removeRemoteWatchlist(symbol: string): Promise<void> {
  await request<{ ok: true }>(
    `/api/watchlist/items?symbol=${encodeURIComponent(symbol)}`,
    { method: "DELETE", auth: true },
  );
}

// ---------- Portfolio ----------

export type RemoteHolding = {
  id: string;
  symbol: string;
  shares: number;
  costBasis: number;
  purchasedAt: string;
  notes?: string | null;
};

export async function fetchRemoteHoldings(): Promise<RemoteHolding[]> {
  const data = await request<{ holdings: RemoteHolding[] }>(`/api/portfolio/holdings`, { auth: true });
  return data.holdings ?? [];
}

export async function addRemoteHolding(h: {
  symbol: string;
  shares: number;
  costBasis: number;
  purchasedAt: string;
  notes?: string;
}): Promise<void> {
  await request<{ ok: true }>(`/api/portfolio/holdings`, {
    method: "POST",
    body: h,
    auth: true,
  });
}

export async function removeRemoteHolding(id: string): Promise<void> {
  await request<{ ok: true }>(
    `/api/portfolio/holdings?id=${encodeURIComponent(id)}`,
    { method: "DELETE", auth: true },
  );
}
