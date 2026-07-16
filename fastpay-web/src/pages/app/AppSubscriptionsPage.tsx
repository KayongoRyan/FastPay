import {
  Cloud,
  Download,
  Music2,
  Plus,
  RotateCcw,
  Shield,
  Trash2,
  Tv,
  Wifi,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatRwf } from "../../lib/wallet-data";

/* ---------- Subscriptions ---------- */

type Subscription = {
  id: string;
  name: string;
  amount: number;
  cycle: "monthly" | "yearly";
  card: string;
  nextBilling: string;
  tone: "green" | "red" | "blue" | "gold" | "sky";
  active: boolean;
};

const defaultSubscriptions: Subscription[] = [
  { id: "spotify", name: "Spotify Premium", amount: 9990, cycle: "monthly", card: "Everyday •••• 9012", nextBilling: "Aug 25", tone: "green", active: true },
  { id: "netflix", name: "Netflix", amount: 15600, cycle: "monthly", card: "Everyday •••• 9012", nextBilling: "Aug 03", tone: "red", active: true },
  { id: "newcom", name: "Newcom Internet", amount: 67230, cycle: "monthly", card: "Everyday •••• 9012", nextBilling: "Aug 04", tone: "blue", active: true },
  { id: "insurance", name: "Home Insurance", amount: 19250, cycle: "monthly", card: "Savings •••• 3340", nextBilling: "Aug 01", tone: "gold", active: true },
  { id: "canal", name: "Canal+ TV", amount: 15000, cycle: "monthly", card: "Everyday •••• 9012", nextBilling: "Aug 02", tone: "red", active: true },
  { id: "icloud", name: "iCloud+ Storage", amount: 4500, cycle: "monthly", card: "Savings •••• 3340", nextBilling: "Aug 12", tone: "sky", active: true },
];

const subIcons: Record<string, typeof Music2> = {
  spotify: Music2,
  netflix: Tv,
  newcom: Wifi,
  insurance: Shield,
  canal: Tv,
  icloud: Cloud,
};

function loadSubscriptions(): Subscription[] {
  try {
    const raw = localStorage.getItem("fastpay_subscriptions");
    if (!raw) return defaultSubscriptions;
    return JSON.parse(raw) as Subscription[];
  } catch {
    return defaultSubscriptions;
  }
}

/* ---------- Budget sheet ---------- */

type BudgetRow = {
  id: string;
  category: string;
  planned: number;
  actual: number;
};

const defaultBudgetRows: BudgetRow[] = [
  { id: "r1", category: "Rent", planned: 350000, actual: 350000 },
  { id: "r2", category: "Food & dining", planned: 220000, actual: 186400 },
  { id: "r3", category: "Transport", planned: 90000, actual: 74500 },
  { id: "r4", category: "Utilities", planned: 60000, actual: 52300 },
  { id: "r5", category: "Subscriptions", planned: 140000, actual: 131570 },
  { id: "r6", category: "Savings", planned: 250000, actual: 250000 },
];

function loadBudgetRows(): BudgetRow[] {
  try {
    const raw = localStorage.getItem("fastpay_budget_rows");
    if (!raw) return defaultBudgetRows;
    return JSON.parse(raw) as BudgetRow[];
  } catch {
    return defaultBudgetRows;
  }
}

export function AppSubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>(loadSubscriptions);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [rows, setRows] = useState<BudgetRow[]>(loadBudgetRows);

  useEffect(() => {
    localStorage.setItem("fastpay_subscriptions", JSON.stringify(subs));
  }, [subs]);

  useEffect(() => {
    localStorage.setItem("fastpay_budget_rows", JSON.stringify(rows));
  }, [rows]);

  const activeSubs = subs.filter((s) => s.active);
  const monthlyTotal = activeSubs.reduce(
    (sum, s) => sum + (s.cycle === "monthly" ? s.amount : Math.round(s.amount / 12)),
    0,
  );

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({ planned: acc.planned + r.planned, actual: acc.actual + r.actual }),
        { planned: 0, actual: 0 },
      ),
    [rows],
  );

  function setSubActive(id: string, active: boolean) {
    setSubs((prev) => prev.map((s) => (s.id === id ? { ...s, active } : s)));
    setCancelling(null);
  }

  function patchRow(id: string, patch: Partial<BudgetRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { id: `r${Date.now()}`, category: "New category", planned: 0, actual: 0 },
    ]);
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  function exportCsv() {
    const lines = [
      "Category,Planned (RWF),Actual (RWF),Difference (RWF)",
      ...rows.map((r) => `"${r.category}",${r.planned},${r.actual},${r.planned - r.actual}`),
      `Total,${totals.planned},${totals.actual},${totals.planned - totals.actual}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fastpay-budget.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="wapp-page">
      {/* Subscriptions */}
      <section className="wapp-card">
        <header className="wapp-card__head">
          <h2>Card subscriptions</h2>
          <span className="wapp-subs-total">
            {activeSubs.length} active · {formatRwf(monthlyTotal)}/mo
          </span>
        </header>

        <ul className="wapp-subs">
          {subs.map((sub) => {
            const Icon = subIcons[sub.id] ?? Music2;
            return (
              <li key={sub.id} className={`wapp-subs__row${sub.active ? "" : " is-cancelled"}`}>
                <span className={`wapp-subs__icon wapp-subs__icon--${sub.tone}`}>
                  <Icon size={17} />
                </span>

                <div className="wapp-subs__info">
                  <strong>{sub.name}</strong>
                  <small>
                    {sub.card} · next {sub.nextBilling}
                  </small>
                </div>

                <div className="wapp-subs__amount">
                  <strong>{formatRwf(sub.amount)}</strong>
                  <small>/{sub.cycle === "monthly" ? "mo" : "yr"}</small>
                </div>

                {sub.active ? (
                  cancelling === sub.id ? (
                    <div className="wapp-subs__confirm">
                      <button
                        type="button"
                        className="btn-danger wapp-subs__btn"
                        onClick={() => setSubActive(sub.id, false)}
                      >
                        Confirm cancel
                      </button>
                      <button
                        type="button"
                        className="wapp-subs__keep"
                        aria-label="Keep subscription"
                        onClick={() => setCancelling(null)}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn-ghost-navy wapp-subs__btn"
                      onClick={() => setCancelling(sub.id)}
                    >
                      Cancel
                    </button>
                  )
                ) : (
                  <div className="wapp-subs__confirm">
                    <em className="wapp-subs__badge">Cancelled</em>
                    <button
                      type="button"
                      className="wapp-subs__keep"
                      aria-label="Resume subscription"
                      title="Resume"
                      onClick={() => setSubActive(sub.id, true)}
                    >
                      <RotateCcw size={15} />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Budget sheet */}
      <section className="wapp-card">
        <header className="wapp-card__head">
          <h2>Budget sheet</h2>
          <div className="wapp-sheet-actions">
            <button type="button" className="wapp-sheet-actions__btn" onClick={addRow}>
              <Plus size={15} />
              Add row
            </button>
            <button type="button" className="wapp-sheet-actions__btn" onClick={exportCsv}>
              <Download size={15} />
              Export CSV
            </button>
          </div>
        </header>

        <p className="wapp-form-card__hint">
          Edit any cell like a spreadsheet — planned vs actual, difference and usage compute
          automatically. Changes save on this device.
        </p>

        <div className="wapp-sheet-wrap">
          <table className="wapp-sheet">
            <thead>
              <tr>
                <th className="wapp-sheet__rownum" aria-label="Row" />
                <th>Category</th>
                <th>Planned (RWF)</th>
                <th>Actual (RWF)</th>
                <th>Difference</th>
                <th>Used</th>
                <th className="wapp-sheet__del" aria-label="Delete" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const diff = row.planned - row.actual;
                const used = row.planned > 0 ? Math.round((row.actual / row.planned) * 100) : 0;
                return (
                  <tr key={row.id}>
                    <td className="wapp-sheet__rownum">{i + 1}</td>
                    <td>
                      <input
                        type="text"
                        value={row.category}
                        onChange={(e) => patchRow(row.id, { category: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={row.planned ? row.planned.toLocaleString("en-US") : ""}
                        placeholder="0"
                        onChange={(e) =>
                          patchRow(row.id, {
                            planned: Number(e.target.value.replace(/[^\d]/g, "")) || 0,
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={row.actual ? row.actual.toLocaleString("en-US") : ""}
                        placeholder="0"
                        onChange={(e) =>
                          patchRow(row.id, {
                            actual: Number(e.target.value.replace(/[^\d]/g, "")) || 0,
                          })
                        }
                      />
                    </td>
                    <td className={`wapp-sheet__num ${diff >= 0 ? "is-pos" : "is-neg"}`}>
                      {diff >= 0 ? "" : "−"}
                      {Math.abs(diff).toLocaleString("en-US")}
                    </td>
                    <td className="wapp-sheet__used">
                      <span
                        className={`wapp-sheet__used-bar${used > 100 ? " is-over" : ""}`}
                        style={{ width: `${Math.min(used, 100)}%` }}
                      />
                      <em>{used}%</em>
                    </td>
                    <td className="wapp-sheet__del">
                      <button
                        type="button"
                        aria-label={`Delete ${row.category}`}
                        onClick={() => removeRow(row.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td className="wapp-sheet__rownum">Σ</td>
                <td>Total</td>
                <td>{totals.planned.toLocaleString("en-US")}</td>
                <td>{totals.actual.toLocaleString("en-US")}</td>
                <td
                  className={`wapp-sheet__num ${
                    totals.planned - totals.actual >= 0 ? "is-pos" : "is-neg"
                  }`}
                >
                  {(totals.planned - totals.actual >= 0 ? "" : "−") +
                    Math.abs(totals.planned - totals.actual).toLocaleString("en-US")}
                </td>
                <td>
                  {totals.planned > 0
                    ? `${Math.round((totals.actual / totals.planned) * 100)}%`
                    : "0%"}
                </td>
                <td className="wapp-sheet__del" />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}
