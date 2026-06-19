import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import './Portfolio.css';

const COLORS = ['#5b8af5', '#2dd4a0', '#f5a623', '#f06a6a', '#a78bfa', '#34d399', '#fb923c'];

function PnlBadge({ pct }) {
  if (pct == null) return <span className="badge muted">—</span>;
  const up = pct >= 0;
  return (
    <span className={`badge ${up ? 'green' : 'red'}`}>
      {up ? '+' : ''}{pct.toFixed(2)}%
    </span>
  );
}

export default function Portfolio({ portfolio, prices }) {
  const usStocks = portfolio?.us_stocks ?? [];
  const twStocks = portfolio?.tw_stocks ?? [];

  // 計算每筆損益
  function enriched(stocks, isTW) {
    return stocks.map(s => {
      const sym = isTW ? `${s.symbol}.TW` : s.symbol;
      const p = prices?.[sym];
      const currentPrice = p?.price ?? null;
      const currentValue = currentPrice != null ? currentPrice * s.shares : null;
      const pnlAmt = currentValue != null ? currentValue - s.total_cost : null;
      const pnlPct = pnlAmt != null ? (pnlAmt / s.total_cost) * 100 : null;
      return { ...s, currentPrice, currentValue, pnlAmt, pnlPct };
    });
  }

  const usEnriched = enriched(usStocks, false);
  const twEnriched = enriched(twStocks, true);
  const allEnriched = [...usEnriched, ...twEnriched];

  // 圓餅圖資料（用總成本）
  const pieData = allEnriched.map(s => ({
    name: s.symbol,
    value: s.currentValue ?? s.total_cost,
  }));

  const totalCost = allEnriched.reduce((a, s) => a + s.total_cost, 0);
  const totalValue = allEnriched.reduce((a, s) => a + (s.currentValue ?? s.total_cost), 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  function StockRow({ s }) {
    return (
      <div className="stock-row">
        <div className="stock-info">
          <span className="stock-symbol">{s.symbol}</span>
          <span className="stock-name">{s.name}</span>
        </div>
        <div className="stock-shares">{s.shares} 股</div>
        <div className="stock-cost mono">${s.avg_cost.toFixed(2)}</div>
        <div className="stock-price mono">
          {s.currentPrice != null ? `$${s.currentPrice.toFixed(2)}` : '—'}
        </div>
        <div className="stock-pnl">
          <PnlBadge pct={s.pnlPct} />
        </div>
      </div>
    );
  }

  return (
    <section className="portfolio-section">
      <div className="section-header">
        <h2 className="section-title">持倉 & 損益</h2>
        <div className="summary-badges">
          <span className="summary-label">總市值</span>
          <span className="summary-value mono">${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
          <PnlBadge pct={totalPnlPct} />
        </div>
      </div>

      <div className="portfolio-layout">
        {/* 圓餅圖 */}
        <div className="pie-card">
          <p className="card-label">配置比例</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`$${value.toFixed(0)}`, '']}
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            {pieData.map((d, i) => (
              <div key={d.name} className="legend-item">
                <span className="legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="legend-name">{d.name}</span>
                <span className="legend-pct mono">
                  {totalValue > 0 ? ((d.value / totalValue) * 100).toFixed(1) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 損益表格 */}
        <div className="table-card">
          {usEnriched.length > 0 && (
            <>
              <p className="card-label">美股</p>
              <div className="table-header">
                <span>標的</span>
                <span>股數</span>
                <span>成本</span>
                <span>現價</span>
                <span>損益</span>
              </div>
              {usEnriched.map(s => <StockRow key={s.symbol} s={s} />)}
            </>
          )}
          {twEnriched.length > 0 && (
            <>
              <p className="card-label" style={{ marginTop: '1rem' }}>台股</p>
              <div className="table-header">
                <span>標的</span>
                <span>股數</span>
                <span>成本</span>
                <span>現價</span>
                <span>損益</span>
              </div>
              {twEnriched.map(s => <StockRow key={s.symbol} s={s} />)}
            </>
          )}
          {twEnriched.length === 0 && (
            <p className="empty-hint">台股持倉尚未建立</p>
          )}
        </div>
      </div>
    </section>
  );
}
