import { PiggyBank, Plus, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { PinModal } from "../../components/PinModal";
import { formatRwf, walletAccount } from "../../lib/wallet-data";

type Goal = {
  id: string;
  name: string;
  target: number;
  saved: number;
  deadline: string;
};

const STORAGE_KEY = "fastpay-saved-goals";

const defaults: Goal[] = [
  { id: "g1", name: "Emergency fund", target: 1000000, saved: 420000, deadline: "Dec 2026" },
  { id: "g2", name: "School fees", target: 450000, saved: 180000, deadline: "Sep 2026" },
  { id: "g3", name: "Laptop", target: 850000, saved: 95000, deadline: "Mar 2027" },
];

function loadGoals(): Goal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return JSON.parse(raw) as Goal[];
  } catch {
    return defaults;
  }
}

export function AppGoalsPage() {
  const [goals, setGoals] = useState(loadGoals);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmt, setDepositAmt] = useState("");
  const [pinOpen, setPinOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  }, [goals]);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const t = Number(target.replace(/[^\d]/g, ""));
    if (!name.trim()) {
      setError("Give the goal a name.");
      return;
    }
    if (!t || t < 1000) {
      setError("Target must be at least RWF 1,000.");
      return;
    }
    setGoals((prev) => [
      ...prev,
      {
        id: `g${Date.now()}`,
        name: name.trim(),
        target: t,
        saved: 0,
        deadline: deadline.trim() || "Open",
      },
    ]);
    setName("");
    setTarget("");
    setDeadline("");
  }

  function confirmDeposit() {
    const amt = Number(depositAmt.replace(/[^\d]/g, ""));
    if (!depositGoalId || !amt) return;
    setGoals((prev) =>
      prev.map((g) =>
        g.id === depositGoalId ? { ...g, saved: Math.min(g.target, g.saved + amt) } : g,
      ),
    );
    setDepositGoalId(null);
    setDepositAmt("");
    setPinOpen(false);
  }

  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);

  return (
    <div className="wapp-page">
      <section className="wapp-card">
        <header className="wapp-card__head">
          <h2>
            <Target size={18} /> Saved Goals
          </h2>
        </header>
        <p className="wapp-form-card__hint">
          Lock pockets toward what matters. Wallet balance:{" "}
          <strong>{formatRwf(walletAccount.balance)}</strong>
        </p>
        <p className="wapp-card__big">{formatRwf(totalSaved)}</p>
        <small className="wapp-muted">Across {goals.length} goals</small>
      </section>

      <div className="wapp-goal-grid">
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
          return (
            <section key={g.id} className="wapp-card wapp-goal-card">
              <header className="wapp-card__head">
                <h2>
                  <PiggyBank size={18} /> {g.name}
                </h2>
                <em>{pct}%</em>
              </header>
              <strong>
                {formatRwf(g.saved)} <span>/ {formatRwf(g.target)}</span>
              </strong>
              <div className="wapp-goal-bar" aria-hidden>
                <span style={{ width: `${pct}%` }} />
              </div>
              <small className="wapp-muted">Target by {g.deadline}</small>
              {depositGoalId === g.id ? (
                <div className="wapp-goal-deposit">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={depositAmt}
                    onChange={(e) => setDepositAmt(e.target.value.replace(/[^\d]/g, ""))}
                    placeholder="Amount (RWF)"
                  />
                  <button
                    type="button"
                    className="auth-form__submit"
                    onClick={() => {
                      if (!Number(depositAmt)) return;
                      setPinOpen(true);
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    className="wapp-sheet-actions__btn"
                    onClick={() => {
                      setDepositGoalId(null);
                      setDepositAmt("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="wapp-sheet-actions__btn"
                  onClick={() => setDepositGoalId(g.id)}
                >
                  Add money
                </button>
              )}
            </section>
          );
        })}
      </div>

      <section className="wapp-card wapp-form-card">
        <header className="wapp-card__head">
          <h2>
            <Plus size={18} /> New goal
          </h2>
        </header>
        <form className="settings-form" onSubmit={handleCreate}>
          {error && (
            <p className="auth-form__error" role="alert">
              {error}
            </p>
          )}
          <label>
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Trip to Rubavu" />
          </label>
          <label>
            <span>Target (RWF)</span>
            <input
              type="text"
              inputMode="numeric"
              value={target}
              onChange={(e) => setTarget(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="500000"
            />
          </label>
          <label>
            <span>Deadline</span>
            <input
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="Dec 2026"
            />
          </label>
          <button type="submit" className="auth-form__submit">
            Create goal
          </button>
        </form>
      </section>

      {pinOpen && (
        <PinModal
          title="Confirm goal deposit"
          subtitle={depositAmt ? formatRwf(Number(depositAmt)) : undefined}
          onClose={() => setPinOpen(false)}
          onSuccess={confirmDeposit}
        />
      )}
    </div>
  );
}
