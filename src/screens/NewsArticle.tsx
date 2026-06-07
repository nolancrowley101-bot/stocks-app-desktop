import { useEffect, useState } from "react";
import { fetchNews, fetchNewsArticle } from "../lib/api";
import { Module, ModuleHeader, ModuleFooter } from "../components/ui/Module";
import { timeAgo } from "../lib/format";
import type { NewsArticleResponse, NewsItem } from "../types";

export function NewsArticle({
  uuid,
  onBackToNews,
  onOpenArticle,
}: {
  uuid: string;
  onBackToNews: () => void;
  onOpenArticle: (uuid: string) => void;
}) {
  const [data, setData] = useState<NewsArticleResponse | null>(null);
  const [related, setRelated] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    Promise.all([fetchNewsArticle(uuid), fetchNews("stock market", 8)]).then(([res, more]) => {
      if (cancelled) return;
      if (!res) {
        setNotFound(true);
        setData(null);
      } else {
        setData(res);
      }
      setRelated(more);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [uuid]);

  if (loading) {
    return (
      <main className="p-2">
        <Module>
          <ModuleHeader label="Loading article…" />
          <div className="px-4 py-8 text-[12px] text-[var(--fg-3)]">Fetching from Yahoo Finance…</div>
        </Module>
      </main>
    );
  }
  if (notFound || !data) {
    return (
      <main className="p-2">
        <Module>
          <ModuleHeader
            label={
              <button onClick={onBackToNews} className="hover:text-[var(--fg)]">
                ← News
              </button>
            }
          />
          <div className="px-4 py-8 text-[12px] text-[var(--fg-2)]">Article not found.</div>
        </Module>
      </main>
    );
  }

  const { item, article } = data;

  return (
    <main className="p-2 space-y-2">
      <Module>
        <ModuleHeader
          label={
            <span className="flex items-center gap-2">
              <button onClick={onBackToNews} className="hover:text-[var(--fg)]">
                News
              </button>
              <span className="text-[var(--border-strong)]">/</span>
              <span className="num normal-case tracking-normal text-[var(--fg-2)]">
                {item.publisher ?? "Article"}
              </span>
              <span className="text-[var(--border-strong)]">·</span>
              <span className="num normal-case tracking-normal text-[var(--fg-3)]">
                {timeAgo(item.providerPublishTime)}
              </span>
            </span>
          }
          actions={
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer noopener"
              className="text-[10px] uppercase tracking-wider hover:text-[var(--accent)]"
            >
              Open original ↗
            </a>
          }
        />
        <div className="px-4 py-5 max-w-3xl">
          <h1 className="text-[22px] leading-tight font-semibold tracking-tight">{item.title}</h1>
          <div className="mt-2 text-[11px] uppercase tracking-wider text-[var(--fg-3)]">
            <span>{item.publisher ?? "—"}</span>
            <span className="mx-2 text-[var(--border-strong)]">·</span>
            <span className="num normal-case tracking-normal">{timeAgo(item.providerPublishTime)}</span>
          </div>

          {article.ok ? (
            <article
              className="article-body mt-5 text-[14px] leading-relaxed text-[var(--fg)]"
              dangerouslySetInnerHTML={{ __html: article.contentHtml }}
            />
          ) : (
            <div className="mt-5 p-4 border border-[var(--border)] bg-[var(--surface-2)] rounded-sm">
              <p className="text-[13px] text-[var(--fg-2)]">
                {article.reason === "fetch"
                  ? "Couldn't fetch this article server-side."
                  : "Couldn't extract a readable article body from this page."}{" "}
                Read it at the publisher:
              </p>
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer noopener"
                className="block mt-2 num text-[12px] text-[var(--accent)] truncate"
              >
                {item.link} ↗
              </a>
            </div>
          )}
        </div>
        <ModuleFooter>
          Source · {item.publisher ?? "—"} · via Yahoo Finance
          {article.ok && article.length ? (
            <>
              <span className="mx-2 text-[var(--border-strong)]">·</span>
              <span className="num normal-case tracking-normal">
                ~{Math.round(article.length / 1000)}k chars
              </span>
            </>
          ) : null}
        </ModuleFooter>
      </Module>

      <Module>
        <ModuleHeader
          label="More market news"
          actions={
            <button onClick={onBackToNews} className="text-[10px] uppercase tracking-wider hover:text-[var(--fg)]">
              All →
            </button>
          }
        />
        <ul className="divide-y divide-[var(--border)]">
          {related
            .filter((n) => n.uuid !== item.uuid)
            .slice(0, 8)
            .map((n) => (
              <li key={n.uuid}>
                <button
                  onClick={() => onOpenArticle(n.uuid)}
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
        </ul>
      </Module>
    </main>
  );
}
