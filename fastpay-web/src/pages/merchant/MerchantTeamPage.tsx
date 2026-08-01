import { useEffect, useMemo, useState } from "react";
import {
  createEmployee,
  createPayrollEntry,
  fetchEmployees,
  fetchHrSummary,
  fetchPayroll,
  formatRwf,
  markPayrollPaid,
  type MerchantEmployee,
  type MerchantPayrollEntry,
} from "../../lib/merchant-api";

function monthBounds() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export function MerchantTeamPage() {
  const bounds = useMemo(() => monthBounds(), []);
  const [employees, setEmployees] = useState<MerchantEmployee[]>([]);
  const [payroll, setPayroll] = useState<MerchantPayrollEntry[]>([]);
  const [summary, setSummary] = useState({
    activeEmployees: 0,
    monthlySalaryCommitRwf: 0,
    pendingPayrollEntries: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MerchantEmployee["role"]>("staff");
  const [salary, setSalary] = useState("");
  const [payCycle, setPayCycle] = useState<MerchantEmployee["payCycle"]>("monthly");

  const [payEmployeeId, setPayEmployeeId] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [periodStart, setPeriodStart] = useState(bounds.start);
  const [periodEnd, setPeriodEnd] = useState(bounds.end);
  const [markPaid, setMarkPaid] = useState(true);

  async function load() {
    const [staff, pays, stats] = await Promise.all([
      fetchEmployees(),
      fetchPayroll(),
      fetchHrSummary(),
    ]);
    setEmployees(staff);
    setPayroll(pays);
    setSummary(stats);
    if (!payEmployeeId && staff[0]) {
      setPayEmployeeId(staff[0].id);
      setPayAmount(String(staff[0].salaryRwf || ""));
    }
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : "Failed to load team"));
  }, []);

  async function handleAddEmployee(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim()) {
      setError("Employee name is required.");
      return;
    }
    setBusy(true);
    try {
      await createEmployee({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        role,
        salaryRwf: Number(salary) || 0,
        payCycle,
      });
      setFullName("");
      setPhone("");
      setEmail("");
      setSalary("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add employee");
    } finally {
      setBusy(false);
    }
  }

  async function handlePayroll(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!payEmployeeId) {
      setError("Select an employee.");
      return;
    }
    setBusy(true);
    try {
      await createPayrollEntry({
        employeeId: payEmployeeId,
        amountRwf: payAmount ? Number(payAmount) : undefined,
        periodStart,
        periodEnd,
        markPaid,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not record payroll");
    } finally {
      setBusy(false);
    }
  }

  async function handleMarkPaid(id: string) {
    setError(null);
    try {
      await markPayrollPaid(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mark paid");
    }
  }

  return (
    <div className="merchant-page">
      <header className="merchant-page__head">
        <div>
          <p className="merchant-page__eyebrow">People</p>
          <h1>Team & payroll</h1>
          <p className="merchant-page__sub">
            Roster staff, set salaries, and track who has been paid for each period.
          </p>
        </div>
      </header>

      {error && <p className="auth-form__error">{error}</p>}

      <div className="merchant-stats">
        <article className="merchant-stat">
          <span>Active staff</span>
          <strong>{summary.activeEmployees}</strong>
          <small>On roster</small>
        </article>
        <article className="merchant-stat">
          <span>Monthly commit</span>
          <strong>{formatRwf(summary.monthlySalaryCommitRwf)}</strong>
          <small>Active salaries</small>
        </article>
        <article className="merchant-stat">
          <span>Pending pays</span>
          <strong>{summary.pendingPayrollEntries}</strong>
          <small>Awaiting payment</small>
        </article>
      </div>

      <div className="merchant-grid-2">
        <section className="wapp-card wapp-form-card">
          <header className="wapp-card__head">
            <h2>Add employee</h2>
          </header>
          <form className="settings-form" onSubmit={handleAddEmployee}>
            <label>
              <span>Full name</span>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </label>
            <div className="merchant-form-row">
              <label>
                <span>Phone</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+2507…" />
              </label>
              <label>
                <span>Email</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
            </div>
            <div className="merchant-form-row">
              <label>
                <span>Role</span>
                <select value={role} onChange={(e) => setRole(e.target.value as MerchantEmployee["role"])}>
                  <option value="manager">Manager</option>
                  <option value="cashier">Cashier</option>
                  <option value="stock_keeper">Stock keeper</option>
                  <option value="staff">Staff</option>
                </select>
              </label>
              <label>
                <span>Pay cycle</span>
                <select
                  value={payCycle}
                  onChange={(e) => setPayCycle(e.target.value as MerchantEmployee["payCycle"])}
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </label>
            </div>
            <label>
              <span>Salary (RWF)</span>
              <input value={salary} onChange={(e) => setSalary(e.target.value.replace(/[^\d]/g, ""))} />
            </label>
            <button type="submit" className="auth-form__submit" disabled={busy}>
              {busy ? "Saving…" : "Add to roster"}
            </button>
          </form>
        </section>

        <section className="wapp-card wapp-form-card">
          <header className="wapp-card__head">
            <h2>Record salary payment</h2>
          </header>
          <form className="settings-form" onSubmit={handlePayroll}>
            <label>
              <span>Employee</span>
              <select
                value={payEmployeeId}
                onChange={(e) => {
                  const id = e.target.value;
                  setPayEmployeeId(id);
                  const emp = employees.find((x) => x.id === id);
                  if (emp) setPayAmount(String(emp.salaryRwf || ""));
                }}
              >
                {employees.length === 0 && <option value="">No employees yet</option>}
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} · {formatRwf(emp.salaryRwf)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Amount (RWF)</span>
              <input value={payAmount} onChange={(e) => setPayAmount(e.target.value.replace(/[^\d]/g, ""))} />
            </label>
            <div className="merchant-form-row">
              <label>
                <span>Period start</span>
                <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} required />
              </label>
              <label>
                <span>Period end</span>
                <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} required />
              </label>
            </div>
            <label className="merchant-check">
              <input type="checkbox" checked={markPaid} onChange={(e) => setMarkPaid(e.target.checked)} />
              <span>Mark as paid now</span>
            </label>
            <button type="submit" className="auth-form__submit" disabled={busy || employees.length === 0}>
              {busy ? "Saving…" : "Save payroll entry"}
            </button>
          </form>
        </section>
      </div>

      <section className="wapp-card">
        <header className="wapp-card__head">
          <h2>Roster</h2>
        </header>
        {!employees.length ? (
          <p className="wapp-form-card__hint">No employees yet.</p>
        ) : (
          <ul className="wapp-tx-list">
            {employees.map((emp) => (
              <li key={emp.id}>
                <div>
                  <strong>{emp.fullName}</strong>
                  <small>
                    {emp.role.replace("_", " ")} · {emp.payCycle} · {emp.status.replace("_", " ")}
                  </small>
                </div>
                <span>{formatRwf(emp.salaryRwf)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="wapp-card">
        <header className="wapp-card__head">
          <h2>Payroll history</h2>
        </header>
        {!payroll.length ? (
          <p className="wapp-form-card__hint">No payroll entries yet.</p>
        ) : (
          <ul className="wapp-tx-list">
            {payroll.map((entry) => (
              <li key={entry.id}>
                <div>
                  <strong>{entry.employeeName}</strong>
                  <small>
                    {entry.periodStart.slice(0, 10)} → {entry.periodEnd.slice(0, 10)} · {entry.status}
                  </small>
                </div>
                <span className="merchant-pill-row">
                  {formatRwf(entry.amountRwf)}
                  {entry.status === "pending" && (
                    <button type="button" className="merchant-inline-btn" onClick={() => void handleMarkPaid(entry.id)}>
                      Mark paid
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
