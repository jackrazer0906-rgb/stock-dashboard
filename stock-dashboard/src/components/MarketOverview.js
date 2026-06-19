import { useState, useEffect } from 'react';
import { fetchMultiplePrices, INDICES, WATCHLIST } from '../api';
import './MarketOverview.css';

function PriceTag({ change, changePct }) {
  if (change == null) return <span className="tag muted">—</span>;
  const up = change >= 0;
  return (
    <span className={`tag ${up ? 'green' : 'red'}`}>
      {up ? '+' : ''}{changePct.toFixed(2)}%
    </span>
  );
}

function IndexCard({ label, data, loading }) {
  return (
    <div className="index-card">
      <p className="index-label">{label}</p>
      {loading || !data ? (
        <p className="index-price skeleton">——</p>
      ) : (
        <>
          <p className="index-price">{data.price?.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
          <PriceTag change={data.change} changePct={data.changePct} />
        </>
      )}
    </div>
  );
}

function WatchRow({ symbol, data }) {
  const label = symbol.replace('.TW', '');
  if (!data) return null;
  const up = (data.change ?? 0) >= 0;
  return (
    <div className="watch-row">
      <span className="watch-symbol">{label}</span>
      <span className="watch-price mono">{data.price?.toFixed(2)}</span>
      <span className={`watch-change ${up ? 'green' : 'red'}`}>
        {up ? '+' : ''}{data.changePct?.toFixed(2)}%
      </span>
    </div>
  );
}

export default function MarketOverview() {
  const [tab, setTab] = useState('tw');
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const allSymbols = [
        ...INDICES.tw.map(i => i.symbol),
        ...INDICES.us.map(i => i.symbol),
        ...WATCHLIST.tw,
        ...WATCHLIST.us,
      ];
      const data = await fetchMultiplePrices(allSymbols);
      setPrices(data);
      setLastUpdate(new Date());
      setLoading(false);
    }
    load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const indices = tab === 'tw' ? INDICES.tw : INDICES.us;
  const watchlist = tab === 'tw' ? WATCHLIST.tw : WATCHLIST.us;

  return (
    <section className="market-section">
      <div className="section-header">
        <h2 className="section-title">市場概況</h2>
        <div className="header-right">
          {lastUpdate && (
            <span className="update-time">
              {lastUpdate.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })} 更新
            </span>
          )}
          <div className="tab-group">
            <button className={tab === 'tw' ? 'active' : ''} onClick={() => setTab('tw')}>台股</button>
            <button className={tab === 'us' ? 'active' : ''} onClick={() => setTab('us')}>美股</button>
          </div>
        </div>
      </div>

      <div className="index-grid">
        {indices.map(({ symbol, label }) => (
          <IndexCard key={symbol} label={label} data={prices[symbol]} loading={loading} />
        ))}
      </div>

      <div className="watch-table">
        <div className="watch-header">
          <span>標的</span>
          <span>現價</span>
          <span>漲跌幅</span>
        </div>
        {watchlist.map(sym => (
          <WatchRow key={sym} symbol={sym} data={prices[sym]} />
        ))}
      </div>
    </section>
  );
}
