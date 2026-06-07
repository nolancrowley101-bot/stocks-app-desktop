import { useEffect, useState } from "react";
import { fetchNews, fetchRemoteWatchlist } from "../lib/api";
import { Module, ModuleHeader, ModuleFooter } from "../components/ui/Module";
import { PageHeader } from "../components/ui/PageHeader";
import { timeAgo } from "../lib/format";
import { useAuth } from "../lib/auth";
import type { NewsItem } from "../types";

export function News({ onOpenArticle }: { onOpenArticle: (uuid: string) => void }) {
  const { user } = useAuth();
  const [marketNews, setMarketNews] = useState<NewsItem[]>([]);
  const [watchlistNews, setWatchlistNews] = useState<{ symbol: string; items: NewsItem[] }[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const items = await fetchNews("stock market", 20);
      if (!cancelled) setMarketNews(items);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setWatchlistNews([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const items = await fetchRemoteWatchlist();
        const symbols = items.map((i) => i.symbol).slice(0, 6);
        const groups = await Promise.all(
          symbols.map(async (s) => ({ symbol: s, items: await fetchNews(s, 4) })),
        );
        if (!cancelled) setWatchlistNews(groups);
      } catch {
        if (!cancelled) setWatchlistNews([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <main className="p-2 space-y-2">
      <PageHeader title="News" subtitle="Yahoo Finance · headlines" />

      {watchlistNews.length > 0 && (
        <Module>
          <ModuleHeader label="From your watchlist" />
          <ul className="divide-y divide-[var(--border)]">
            {watchlistNews.flatMap(({ symbol, items }) =>
              items.map((n) => <NewsRow key={`${symbol}-${n.uuid}`} n={n} tag={symbol} onOpen={onOpenArticle} />),
            )}
          </ul>
        </Module>
      )}

      <Module>
        <ModuleHeader
          label="Market news"
          actions={<span className="num text-[10px] text-[var(--fg-3)]">{marketNews.length}</span>}
        />
        <ul className="divide-y divide-[var(--border)]">
          {marketNews.map((n) => (
            <NewsRow key={n.uuid} n={n} onOpen={onOpenArticle} />
          ))}
          {marketNews.length === 0 && (
            <li className="px-3 py-4 text-[12px] text-[var(--fg-3)]">No news available.</li>
          )}
        </ul>
        <ModuleFooter>Source · Yahoo Finance</ModuleFooter>
      </Module>
    </main>
  );
}

function NewsRow({
  n,
  tag,
  onOpen,
}: {
  n: NewsItem;
  tag?: string;
  onOpen: (uuid: string) => void;
}) {
  return (
    <li>
      <button
        onClick={() => onOpen(n.uuid)}
        className="w-full text-left flex items-start gap-3 px-3 py-2 hover:bg-[var(--surface-2)]"
      >
        <span className="num text-[10px] text-[var(--fg-3)] pt-0.5 whitespace-nowrap min-w-[44px]">
          {timeAgo(n.providerPublishTime)}
        </span>
        {tag && (
          <span className="num text-[10px] uppercase border border-[var(--border-strong)] text-[var(--fg-2)] px-1.5 h-4 inline-flex items-center self-start mt-px">
            {tag}
          </span>
        )}
        <span className="flex-1 min-w-0">
          <span className="block text-[13px] line-clamp-2 leading-snug">{n.title}</span>
          <span className="block text-[10px] uppercase tracking-wider text-[var(--fg-3)] mt-0.5">
            {n.publisher ?? "—"}
          </span>
        </span>
      </button>
    </li>
  );
}
