import { KeyRound, Laptop, ShieldAlert, ShieldCheck, Smartphone } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { freezeAccountRequest, unfreezeAccountRequest } from "../../lib/auth-api";
import { clearPin } from "../../lib/pin";

const sessions = [
  { id: "s1", device: "This browser", detail: "Windows · Kigali, RW", icon: Laptop, current: true },
  { id: "s2", device: "FastPay mobile", detail: "Android · last active 2h ago", icon: Smartphone, current: false },
];

const alerts = [
  { id: "a1", title: "New sign-in on web", detail: "Windows · Kigali · today", tone: "info" },
  { id: "a2", title: "Transfer above RWF 500K screened", detail: "Passed fraud checks · Jul 12", tone: "ok" },
];

export function AppSecurityPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFreeze() {
    setMsg(null);
    setError(null);
    setBusy(true);
    try {
      const res = await freezeAccountRequest();
      setMsg(
        res.frozenUntil
          ? `Account frozen until ${new Date(res.frozenUntil).toLocaleString()}.`
          : "Account frozen.",
      );
      await refreshUser().catch(() => undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not freeze account.");
    } finally {
      setBusy(false);
    }
  }

  async function handleUnfreeze() {
    setMsg(null);
    setError(null);
    setBusy(true);
    try {
      await unfreezeAccountRequest();
      setMsg("Account unfrozen.");
      await refreshUser().catch(() => undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not unfreeze account.");
    } finally {
      setBusy(false);
    }
  }

  function handleResetPin() {
    if (!user) return;
    clearPin(user.id);
    navigate("/pin-setup");
  }

  return (
    <div className="wapp-page">
      <div className="wapp-grid-2">
        <div className="wapp-stack">
          <section className="wapp-card">
            <header className="wapp-card__head">
              <h2>
                <ShieldCheck size={18} /> Active sessions
              </h2>
            </header>
            <ul className="wapp-sessions">
              {sessions.map((s) => (
                <li key={s.id}>
                  <span className="wapp-sessions__icon">
                    <s.icon size={17} />
                  </span>
                  <div>
                    <strong>
                      {s.device}
                      {s.current && <em> · current</em>}
                    </strong>
                    <small>{s.detail}</small>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="wapp-card">
            <header className="wapp-card__head">
              <h2>Recent alerts</h2>
            </header>
            <ul className="wapp-alerts">
              {alerts.map((a) => (
                <li key={a.id} className={`wapp-alerts__row wapp-alerts__row--${a.tone}`}>
                  <strong>{a.title}</strong>
                  <small>{a.detail}</small>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="wapp-stack">
          <section className="wapp-card">
            <header className="wapp-card__head">
              <h2>
                <KeyRound size={18} /> Transaction PIN
              </h2>
            </header>
            <p className="wapp-form-card__hint">
              Your PIN approves transfers, top-ups, and bill payments on this device.
            </p>
            <button type="button" className="btn-ghost-navy" onClick={handleResetPin}>
              Reset PIN
            </button>
          </section>

          <section className="wapp-card wapp-card--danger">
            <header className="wapp-card__head">
              <h2>
                <ShieldAlert size={18} /> Freeze account
              </h2>
            </header>
            <p className="wapp-form-card__hint">
              Instantly block transfers if something looks wrong. Unfreeze anytime.
            </p>
            {msg && <p className="settings-note">{msg}</p>}
            {error && <p className="auth-form__error">{error}</p>}
            <div className="settings-actions">
              <button type="button" className="btn-danger" disabled={busy} onClick={handleFreeze}>
                Freeze
              </button>
              <button type="button" className="btn-ghost-navy" disabled={busy} onClick={handleUnfreeze}>
                Unfreeze
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
