export type Quote = {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketPreviousClose?: number;
  regularMarketOpen?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  averageDailyVolume3Month?: number;
  regularMarketVolume?: number;
  marketCap?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  trailingPE?: number;
  forwardPE?: number;
  dividendYield?: number;
  currency?: string;
  exchange?: string;
  marketState?: string;
};

export type ChartPoint = {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v?: number;
};

export type ChartRange = "1d" | "5d" | "1mo" | "6mo" | "1y" | "5y" | "max";

export type SearchResult = {
  symbol: string;
  shortname?: string;
  longname?: string;
  exchange?: string;
  quoteType?: string;
};

export type Alert = {
  id: string;
  symbol: string;
  direction: "above" | "below";
  price: number;
  createdAt: number;
  lastFiredAt?: number;
};

export type Mover = {
  symbol: string;
  shortName?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
};

export type NewsItem = {
  uuid: string;
  title: string;
  publisher?: string;
  link: string;
  providerPublishTime: number;
  type?: string;
  thumbnail?: string;
};

export type NewsArticleResponse = {
  item: NewsItem;
  article:
    | {
        ok: true;
        title?: string;
        byline?: string;
        contentHtml: string;
        textContent: string;
        excerpt?: string;
        publishedTime?: string;
        length: number;
      }
    | { ok: false; reason: "fetch" | "parse" | "blocked"; status?: number };
};

export type SummaryModules = {
  price?: Record<string, unknown>;
  summaryDetail?: Record<string, unknown>;
  assetProfile?: Record<string, unknown>;
  financialData?: Record<string, unknown>;
  recommendationTrend?: Record<string, unknown>;
  defaultKeyStatistics?: Record<string, unknown>;
  earnings?: Record<string, unknown>;
};
