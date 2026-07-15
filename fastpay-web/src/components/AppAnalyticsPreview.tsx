type BudgetPeriod = "weekly" | "monthly" | "yearly";

export type AnalyticsPreviewData = {
  label: string;
  spent: string;
  budget: string;
  remaining: string;
  usedPct: number;
  bars: number[];
  goal: string;
  goalPct: number;
};

type AppAnalyticsPreviewProps = {
  period: BudgetPeriod;
  onPeriodChange: (period: BudgetPeriod) => void;
  data: AnalyticsPreviewData;
};

const periods: BudgetPeriod[] = ["weekly", "monthly", "yearly"];

export function AppAnalyticsPreview({
  period,
  onPeriodChange,
  data,
}: AppAnalyticsPreviewProps) {
  const maxBar = Math.max(...data.bars);

  return (
    <div className="app-analytics">
      <div className="app-analytics__header">
        <h3>Analytics</h3>
        <span>Track spending</span>
      </div>

      <div className="app-analytics__tabs" role="tablist">
        {periods.map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={period === p}
            className={`app-analytics__tab${period === p ? " active" : ""}`}
            onClick={() => onPeriodChange(p)}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <div className="app-analytics__panel">
        <span className="app-analytics__panel-label">Budget / Spending</span>
        <strong className="app-analytics__spent">{data.spent}</strong>
        <small>{data.label} · {data.usedPct}% of budget used</small>

        <div className="app-analytics__bars">
          {data.bars.map((h, i) => (
            <span
              key={i}
              className={h === maxBar ? "active" : ""}
              style={{ height: `${(h / maxBar) * 100}%` }}
            />
          ))}
        </div>
      </div>

      <div className="app-analytics__overview">
        <div>
          <small>Budget</small>
          <strong>{data.budget}</strong>
        </div>
        <div>
          <small>Remaining</small>
          <strong className="positive">{data.remaining}</strong>
        </div>
      </div>

      <div className="app-analytics__progress">
        <span style={{ width: `${data.usedPct}%` }} />
      </div>

      <div className="app-analytics__goal">
        <div>
          <strong>{data.goal}</strong>
          <small>Savings goal</small>
        </div>
        <span>{data.goalPct}%</span>
      </div>

      <nav className="app-analytics__nav">
        <span>Home</span>
        <span className="active">Analytics</span>
        <span>Bills</span>
        <span>Settings</span>
      </nav>
    </div>
  );
}
