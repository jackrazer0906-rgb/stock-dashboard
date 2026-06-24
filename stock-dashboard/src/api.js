const GITHUB_RAW = 'https://raw.githubusercontent.com/jackrazer0906-rgb/stock-dashboard/main/portfolio.json';

export async function fetchPortfolio() {
  const res = await fetch(`${GITHUB_RAW}?t=${Date.now()}`);
  if (!res.ok) throw new Error('無法讀取持倉資料');
  return res.json();
}

export async function fetchMultiplePrices(symbols) {
  if (!symbols || symbols.length === 0) return {};

  try {
    const joined = symbols.map(encodeURIComponent).join(',');
    const res = await fetch(`/api/quote?symbols=${joined}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const quotes = data?.quoteResponse?.result ?? [];

    const map = {};
    quotes.forEach(q => {
      const prev = q.regularMarketPreviousClose ?? null;
      const price = q.regularMarketPrice ?? null;
      map[q.symbol] = {
        symbol: q.symbol,
        price,
        prev,
        change: price != null && prev != null ? price - prev : null,
        changePct: q.regularMarketChangePercent ?? null,
        currency: q.currency ?? 'USD',
        marketState: q.marketState ?? 'CLOSED',
      };
    });

    return map;
  } catch (err) {
    console.error('[fetchMultiplePrices] 失敗:', err);
    return {};
  }
}

export async function fetchPrice(symbol) {
  const map = await fetchMultiplePrices([symbol]);
  return map[symbol] ?? null;
}

export function twSymbol(code) {
  return `${code}.TW`;
}

export const INDICES = {
  tw: [
    { symbol: '^TWII', label: '加權指數' },
    { symbol: '^TWOII', label: '櫃買指數' },
  ],
  us: [
    { symbol: '^GSPC', label: 'S&P 500' },
    { symbol: 'QQQ', label: 'QQQ' },
    { symbol: '^SOX', label: '費半 SOX' },
  ],
};

export const WATCHLIST = {
  tw: ['0050.TW', '00878.TW', '2330.TW', '2317.TW', '2454.TW'],
  us: ['NVDA', 'TSLA', 'AAPL', 'AMZN', 'GOOG', 'META', 'MSFT'],
};
