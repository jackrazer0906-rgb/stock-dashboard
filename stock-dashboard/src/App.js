import { useState, useEffect } from 'react';
import { fetchPortfolio, fetchMultiplePrices, twSymbol } from './api';
import MarketOverview from './components/MarketOverview';
import Portfolio from './components/Portfolio';
import DCA from './components/DCA';
import './App.css';

export default function App() {
  const [portfolio, setPortfolio] = useState(null);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        const p = await fetchPortfolio();
        setPortfolio(p);

        const usSymbols = (p.us_stocks ?? []).map(s => s.symbol);
        const twSymbols = (p.tw_stocks ?? []).map(s => twSymbol(s.symbol));
        const allSymbols = [...usSymbols, ...twSymbols];

        if (allSymbols.length > 0) {
          const priceData = await fetchMultiplePrices(allSymbols);
          setPrices(priceData);
        }
      } catch (e) {
        setError('資料載入失敗，請稍後再試');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-dot" />
            <span className="brand-name">台股策略室</span>
          </div>
          <div className="header-meta">
            {portfolio?.meta?.last_updated && (
              <span className="meta-date">資料更新 {portfolio.meta.last_updated}</span>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner">{error}</div>
        )}

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>載入中...</p>
          </div>
        ) : (
          <>
            <MarketOverview />
            <Portfolio portfolio={portfolio} prices={prices} />
            <DCA schedule={portfolio?.dca_schedule} />
          </>
        )}
      </main>

      <footer className="app-footer">
        <span>股價資料來源：Yahoo Finance（延遲 15 分鐘）</span>
      </footer>
    </div>
  );
}
