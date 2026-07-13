import { useState } from "react";
import { budgetData, type BudgetPeriod } from "../data/budget";

type BudgetDemoProps = {
  large?: boolean;
};

export function BudgetDemo({ large }: BudgetDemoProps) {
  const [period, setPeriod] = useState<BudgetPeriod>("monthly");
  const data = budgetData[period];
  const maxBar = Math.max(...data.bars);

  return (
    <div className={`budget-demo${large ? " budget-demo--large" : ""}`}>
      <div className="analytics__phone">
        <div className="analytics__phone-screen">
          <div className="analytics__budget-tabs" role="tablist">
            {(["weekly", "monthly", "yearly"] as const).map((p) => (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={period === p}
                className={`analytics__budget-tab${period === p ? " active" : ""}`}
                onClick={() => setPeriod(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <div className="analytics__chart-title">Budget / Spending</div>
          <div className="analytics__chart-sub">
            {data.label} · {data.total} spent
          </div>
          <div className="analytics__bars">
            {data.bars.map((h, i) => (
              <div
                key={i}
                className={`analytics__bar${h === maxBar ? " active" : ""}`}
                style={{ height: `${(h / maxBar) * 100}%` }}
              />
            ))}
          </div>
          <div className="budget-demo__stats">
            <div>
              <span>Budget</span>
              <strong>{data.budget}</strong>
            </div>
            <div>
              <span>Remaining</span>
              <strong>{data.remaining}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
