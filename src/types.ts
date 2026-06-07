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
