import './DCA.css';

function daysUntilNext(dayOfMonth) {
  const today = new Date();
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
  if (thisMonth <= today) {
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, dayOfMonth);
    return Math.ceil((nextMonth - today) / (1000 * 60 * 60 * 24));
  }
  return Math.ceil((thisMonth - today) / (1000 * 60 * 60 * 24));
}

function urgencyClass(days) {
  if (days <= 3) return 'urgent';
  if (days <= 7) return 'soon';
  return 'normal';
}

export default function DCA({ schedule }) {
  if (!schedule || schedule.length === 0) {
    return (
      <section className="dca-section">
        <div className="section-header">
          <h2 className="section-title">定期定額</h2>
        </div>
        <div className="dca-empty">
          <p>尚未設定定期定額計畫</p>
          <p className="dca-hint">告訴我你的扣款標的、金額與日期，我來幫你設定</p>
        </div>
      </section>
    );
  }

  return (
    <section className="dca-section">
      <div className="section-header">
        <h2 className="section-title">定期定額</h2>
      </div>
      <div className="dca-grid">
        {schedule.map((item, i) => {
          const days = item.day_of_month ? daysUntilNext(item.day_of_month) : null;
          const urg = days != null ? urgencyClass(days) : 'normal';
          return (
            <div key={i} className={`dca-card ${urg}`}>
              <div className="dca-top">
                <span className="dca-symbol">{item.symbol}</span>
                <span className={`dca-badge ${urg}`}>
                  {days != null ? `${days} 天後` : item.note ?? '—'}
                </span>
              </div>
              <div className="dca-detail">
                <span className="dca-amount">${item.amount_usd ?? item.amount_twd?.toLocaleString() ?? '—'}</span>
                <span className="dca-freq">每月 {item.day_of_month} 日</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
