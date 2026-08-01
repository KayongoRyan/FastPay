import { useEffect, useState } from "react";
import {
  bumpGoalProgress,
  createGoal,
  fetchGoals,
  formatRwf,
  updateGoal,
  type MerchantGoal,
} from "../../lib/merchant-api";

export function MerchantGoalsPage() {
  const [goals, setGoals] = useState<MerchantGoal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [horizon, setHorizon] = useState<MerchantGoal["horizon"]>("short");
  const [kind, setKind] = useState<MerchantGoal["kind"]>("revenue");
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState("0");
  const [deadline, setDeadline] = useState("");

  async function load() {
    setGoals(await fetchGoals());
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : "Failed to load goals"));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const targetValue = Number(target);
    if (!title.trim()) {
      setError("Give the goal a title.");
      return;
    }
    if (!targetValue || targetValue <= 0) {
      setError("Target must be greater than 0.");
      return;
    }
    setBusy(true);
    try {
      await createGoal({
        title: title.trim(),
        description: description.trim() || undefined,
        horizon,
        kind,
        targetValue,
        currentValue: Number(current) || 0,
        deadline: deadline || undefined,
      });
      setTitle("");
      setDescription("");
      setTarget("");
      setCurrent("0");
      setDeadline("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create goal");
    } finally {
      setBusy(false);
    }
  }

  async function handleBump(id: string, amount: number) {
    setError(null);
    try {
      await bumpGoalProgress(id, amount);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update progress");
    }
  }

  async function handleCancel(id: string) {
    setError(null);
    try {
      await updateGoal(id, { status: "cancelled" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not cancel goal");
    }
  }

  const shortGoals = goals.filter((g) => g.horizon === "short");
  const longGoals = goals.filter((g) => g.horizon === "long");
  const active = goals.filter((g) => g.status === "active").length;
  const completed = goals.filter((g) => g.status === "completed").length;

  function renderGoal(goal: MerchantGoal) {
    const isMoney = goal.kind === "revenue";
    return (
      <li key={goal.id} className="merchant-goal">
        <div className="merchant-goal__head">
          <div>
            <strong>{goal.title}</strong>
            <small>
              {goal.kind.replace("_", " ")} · {goal.status}
              {goal.deadline ? ` · due ${goal.deadline.slice(0, 10)}` : ""}
            </small>
          </div>
          <span>
            {isMoney
              ? `${formatRwf(goal.currentValue)} / ${formatRwf(goal.targetValue)}`
              : `${goal.currentValue} / ${goal.targetValue}`}
          </span>
        </div>
        {goal.description && <p className="merchant-goal__desc">{goal.description}</p>}
        <div className="merchant-progress" aria-hidden>
          <div className="merchant-progress__bar" style={{ width: `${goal.progressPct}%` }} />
        </div>
        {goal.status === "active" && (
          <div className="merchant-goal__actions">
            <button type="button" className="merchant-inline-btn" onClick={() => void handleBump(goal.id, 1)}>
              +1
            </button>
            <button
              type="button"
              className="merchant-inline-btn"
              onClick={() => void handleBump(goal.id, isMoney ? 10000 : 10)}
            >
              {isMoney ? "+10k" : "+10"}
            </button>
            <button type="button" className="merchant-inline-btn is-muted" onClick={() => void handleCancel(goal.id)}>
              Cancel
            </button>
          </div>
        )}
      </li>
    );
  }

  return (
    <div className="merchant-page">
      <header className="merchant-page__head">
        <div>
          <p className="merchant-page__eyebrow">Mission</p>
          <h1>Goals & progress</h1>
          <p className="merchant-page__sub">
            Short sprints and long-term targets — revenue, sales count, stock levels, or custom KPIs.
          </p>
        </div>
      </header>

      {error && <p className="auth-form__error">{error}</p>}

      <div className="merchant-stats">
        <article className="merchant-stat">
          <span>Active</span>
          <strong>{active}</strong>
          <small>In progress</small>
        </article>
        <article className="merchant-stat">
          <span>Completed</span>
          <strong>{completed}</strong>
          <small>Hit target</small>
        </article>
        <article className="merchant-stat">
          <span>Short-term</span>
          <strong>{shortGoals.length}</strong>
          <small>Sprint goals</small>
        </article>
      </div>

      <div className="merchant-grid-2">
        <section className="wapp-card wapp-form-card">
          <header className="wapp-card__head">
            <h2>New goal</h2>
          </header>
          <form className="settings-form" onSubmit={handleCreate}>
            <label>
              <span>Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Hit RWF 5M monthly revenue"
              />
            </label>
            <label>
              <span>Description</span>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does winning look like?"
              />
            </label>
            <div className="merchant-form-row">
              <label>
                <span>Horizon</span>
                <select
                  value={horizon}
                  onChange={(e) => setHorizon(e.target.value as MerchantGoal["horizon"])}
                >
                  <option value="short">Short-term</option>
                  <option value="long">Long-term</option>
                </select>
              </label>
              <label>
                <span>Type</span>
                <select value={kind} onChange={(e) => setKind(e.target.value as MerchantGoal["kind"])}>
                  <option value="revenue">Revenue (RWF)</option>
                  <option value="sales_count">Sales count</option>
                  <option value="stock_level">Stock level</option>
                  <option value="custom">Custom</option>
                </select>
              </label>
            </div>
            <div className="merchant-form-row">
              <label>
                <span>Target</span>
                <input value={target} onChange={(e) => setTarget(e.target.value.replace(/[^\d.]/g, ""))} required />
              </label>
              <label>
                <span>Current</span>
                <input value={current} onChange={(e) => setCurrent(e.target.value.replace(/[^\d.]/g, ""))} />
              </label>
            </div>
            <label>
              <span>Deadline</span>
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </label>
            <button type="submit" className="auth-form__submit" disabled={busy}>
              {busy ? "Saving…" : "Create goal"}
            </button>
          </form>
        </section>

        <section className="wapp-card">
          <header className="wapp-card__head">
            <h2>Short-term</h2>
          </header>
          {!shortGoals.length ? (
            <p className="wapp-form-card__hint">No short-term goals yet.</p>
          ) : (
            <ul className="merchant-goal-list">{shortGoals.map(renderGoal)}</ul>
          )}
        </section>
      </div>

      <section className="wapp-card">
        <header className="wapp-card__head">
          <h2>Long-term</h2>
        </header>
        {!longGoals.length ? (
          <p className="wapp-form-card__hint">No long-term missions yet.</p>
        ) : (
          <ul className="merchant-goal-list">{longGoals.map(renderGoal)}</ul>
        )}
      </section>
    </div>
  );
}
