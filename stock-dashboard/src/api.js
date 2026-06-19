const GITHUB_RAW = 'https://raw.githubusercontent.com/jackrazer0906-rgb/stock-dashboard/main/portfolio.json';
const YAHOO_PROXY = 'https://query1.finance.yahoo.com/v8/finance/chart/';

export async function fetchPortfolio() {
  const res = await fetch(`${GITHUB_RAW}?t=${Date.now()}`);
  if (!res.ok) throw new Error('無法讀取持倉資料');
  return res.json();
}

export async function fetchPrice(symbol) {
  try {
    const res = await fetch(
      `${YAHOO_PROXY}${encodeURIComponent(symbol)}?interval=1d&range=1d`,
      { headers: { 'Accept': 'application/json' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) return null;
    return {
      symbol,
      price: meta.regularMarketPrice ?? null,
      prev: meta.chartPreviousClose ?? null,
      change: meta.regularMarketPrice && meta.chartPreviousClose
        ? meta.regularMarketPrice - meta.chartPreviousClose
        : null,
      changePct: meta.regularMarketPrice && meta.chartPreviousClose
        ? ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100
        : null,
      currency: meta.currency ?? 'USD',
      marketState: meta.marketState ?? 'CLOSED',
    };
  } catch {
    return null;
  }
}

export async function fetchMultiplePrices(symbols) {
  const results = await Promise.all(symbols.map(fetchPrice));
  const map = {};
  results.forEach((r, i) => { if (r) map[symbols[i]] = r; });
  return map;
}

// 台股代號加 .TW 後綴
export function twSymbol(code) {
  return `${code}.TW`;
}

// 市場指數代號
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

// 熱門股抓取（固定觀察清單，Yahoo 不提供即時排行）
export const WATCHLIST = {
  tw: ['0050.TW', '00878.TW', '2330.TW', '2317.TW', '2454.TW'],
  us: ['NVDA', 'TSLA', 'AAPL', 'AMZN', 'GOOG', 'META', 'MSFT'],
};
