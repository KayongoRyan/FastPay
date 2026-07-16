import {
  CheckCircle2,
  Lock,
  PiggyBank,
  Plus,
  Target,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PinModal } from "../../components/PinModal";
import {
  createSavingsAccount,
  loadSavingsAccounts,
  saveSavingsAccounts,
  savingsTypeMeta,
  totalSavingsBalance,
  type SavingsAccount,
  type SavingsAccountType,
} from "../../lib/savings-accounts";
import { formatRwf, walletAccount } from "../../lib/wallet-data";

const lockOptions = [15, 20, 25, 30] as const;

export function AppSavingsPage() {
  const [accounts, setAccounts] = useState<SavingsAccount[]>(loadSavingsAccounts);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<SavingsAccountType>("flexible");
  const [target, setTarget] = useState("");
  const [lockYears, setLockYears] = useState<(typeof lockOptions)[number]>(15);
  const [deposit, setDeposit] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pinOpen, setPinOpen] = useState(false);
  const [createdMsg, setCreatedMsg] = useState<string | null>(null);
  const [depositId, setDepositId] = useState<string | null>(null);
  const [depositAmt, setDepositAmt] = useState("");
  const [depositPin, setDepositPin] = useState(false);

  useEffect(() => {
    saveSavingsAccounts(accounts);
  }, [accounts]);

  const total = totalSavingsBalance(accounts) || walletAccount.savings;

  function validateCreate(): boolean {
    setError(null);
    if (!name.trim()) {
      setError("Name your savings account.");
      return false;
    }
    const initial = Number(deposit.replace(/[^\d]/g, "")) || 0;
    if (initial > 0 && initial < 1000) {
      setError("Minimum opening deposit is RWF 1,000.");
      return false;
    }
    if (initial > walletAccount.balance) {
      setError("Opening deposit exceeds your main wallet balance.");
      return false;
    }
    if (type === "goal") {
      const t = Number(target.replace(/[^\d]/g, ""));
      if (!t || t < 1000) {
        setError("Goal target must be at least RWF 1,000.");
        return false;
      }
    }
    return true;
  }

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateCreate()) return;
    const initial = Number(deposit.replace(/[^\d]/g, "")) || 0;
    if (initial > 0) {
      setPinOpen(true);
      return;
    }
    finalizeCreate(0);
  }

  function finalizeCreate(initialDeposit: number) {
    const t = Number(target.replace(/[^\d]/g, "")) || undefined;
    const account = createSavingsAccount({
      name,
      type,
      target: type === "goal" ? t : undefined,
      lockYears: type === "locked" ? lockYears : undefined,
      initialDeposit,
    });
    setAccounts((prev) => [account, ...prev]);
    setCreatedMsg(`${account.name} opened · ${account.accountNumber}`);
    setName("");
    setTarget("");
    setDeposit("");
    setType("flexible");
    setLockYears(15);
    setShowForm(false);
    setPinOpen(false);
  }

  function confirmDeposit() {
    const amt = Number(depositAmt.replace(/[^\d]/g, ""));
    if (!depositId || !amt || amt < 1000) return;
    setAccounts((prev) =>
      prev.map((a) => (a.id === depositId ? { ...a, balance: a.balance + amt } : a)),
    );
    setDepositId(null);
    setDepositAmt("");
    setDepositPin(false);
  }

  return (
    <div className="wapp-page">
      <section className="wapp-card">
        <header className="wapp-card__head">
          <h2>
            <PiggyBank size={18} /> Open Savings
          </h2>
        </header>
        <p className="wapp-form-card__hint">
          Open a savings pot, set goals, and track progress — same flow as the FastPay app.
        </p>

        <div className="wapp-savings-stats">
          <div>
            <span>Min deposit</span>
            <strong>1,000 RWF</strong>
          </div>
          <div>
            <span>Accounts</span>
            <strong>{accounts.length || "—"}</strong>
          </div>
          <div>
            <span>Total saved</span>
            <strong>{formatRwf(total)}</strong>
          </div>
        </div>

        {createdMsg && (
          <p className="settings-note">
            <CheckCircle2 size={16} /> {createdMsg}
          </p>
        )}

        <button
          type="button"
          className="wapp-savings-toggle"
          onClick={() => {
            setShowForm((v) => !v);
            setError(null);
            setCreatedMsg(null);
          }}
        >
          <Plus size={16} />
          {showForm ? "Hide form" : "Create a savings account"}
        </button>

        {showForm && (
          <form className="settings-form wapp-savings-form" onSubmit={handleCreateSubmit}>
            {error && (
              <p className="auth-form__error" role="alert">
                {error}
              </p>
            )}

            <label>
              <span>Account name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Emergency fund"
              />
            </label>

            <fieldset className="wapp-savings-types">
              <legend>Savings type</legend>
              {(Object.keys(savingsTypeMeta) as SavingsAccountType[]).map((key) => {
                const meta = savingsTypeMeta[key];
                const Icon = key === "locked" ? Lock : key === "goal" ? Target : Wallet;
                return (
                  <label key={key} className={`wapp-savings-type${type === key ? " is-active" : ""}`}>
                    <input
                      type="radio"
                      name="savings-type"
                      checked={type === key}
                      onChange={() => setType(key)}
                    />
                    <Icon size={16} />
                    <span>
                      <strong>{meta.label}</strong>
                      <small>{meta.hint}</small>
                    </span>
                  </label>
                );
              })}
            </fieldset>

            {type === "goal" && (
              <label>
                <span>Target amount (RWF)</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={target}
                  onChange={(e) => setTarget(e.target.value.replace(/[^\d]/g, ""))}
                  placeholder="500000"
                />
              </label>
            )}

            {type === "locked" && (
              <label>
                <span>Lock period</span>
                <select
                  value={lockYears}
                  onChange={(e) => setLockYears(Number(e.target.value) as (typeof lockOptions)[number])}
                >
                  {lockOptions.map((y) => (
                    <option key={y} value={y}>
                      {y} years
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label>
              <span>Opening deposit (RWF) — optional</span>
              <input
                type="text"
                inputMode="numeric"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="1000"
              />
            </label>
            <p className="wapp-form-card__hint">
              Main wallet: <strong>{formatRwf(walletAccount.balance)}</strong>
            </p>

            <button type="submit" className="auth-form__submit">
              Open savings account
            </button>
          </form>
        )}
      </section>

      <section className="wapp-card">
        <header className="wapp-card__head">
          <h2>Your savings accounts</h2>
          <Link to="/app/goals">Saved goals</Link>
        </header>

        {accounts.length === 0 ? (
          <p className="wapp-form-card__hint">
            No savings accounts yet. Create one above — flexible, goal-based, or family locked.
          </p>
        ) : (
          <ul className="wapp-savings-list">
            {accounts.map((a) => {
              const pct =
                a.target && a.target > 0
                  ? Math.min(100, Math.round((a.balance / a.target) * 100))
                  : null;
              return (
                <li key={a.id} className="wapp-savings-item">
                  <div className="wapp-savings-item__head">
                    <span className="wapp-feature-card__icon">
                      <PiggyBank size={18} />
                    </span>
                    <div>
                      <strong>{a.name}</strong>
                      <small>
                        {savingsTypeMeta[a.type].label}
                        {a.lockYears ? ` · ${a.lockYears} yr lock` : ""}
                        {" · "}
                        {a.accountNumber}
                      </small>
                    </div>
                    <em>{formatRwf(a.balance)}</em>
                  </div>
                  {pct != null && (
                    <>
                      <div className="wapp-goal-bar" aria-hidden>
                        <span style={{ width: `${pct}%` }} />
                      </div>
                      <small className="wapp-muted">
                        {pct}% of {formatRwf(a.target!)}
                      </small>
                    </>
                  )}
                  {depositId === a.id ? (
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
                          if (Number(depositAmt) >= 1000) setDepositPin(true);
                        }}
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        className="wapp-sheet-actions__btn"
                        onClick={() => {
                          setDepositId(null);
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
                      onClick={() => setDepositId(a.id)}
                    >
                      Add money
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {pinOpen && (
        <PinModal
          title="Confirm opening deposit"
          subtitle={
            deposit
              ? `${formatRwf(Number(deposit))} into ${name.trim() || "savings"}`
              : undefined
          }
          onClose={() => setPinOpen(false)}
          onSuccess={() => finalizeCreate(Number(deposit.replace(/[^\d]/g, "")) || 0)}
        />
      )}

      {depositPin && (
        <PinModal
          title="Confirm deposit"
          subtitle={depositAmt ? formatRwf(Number(depositAmt)) : undefined}
          onClose={() => setDepositPin(false)}
          onSuccess={confirmDeposit}
        />
      )}
    </div>
  );
}
