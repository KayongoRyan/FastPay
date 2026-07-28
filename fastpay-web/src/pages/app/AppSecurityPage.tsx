import { KeyRound, Laptop, ShieldAlert, ShieldCheck, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { freezeAccountRequest, unfreezeAccountRequest } from "../../lib/auth-api";
import { clearPin } from "../../lib/pin";
import {
  fetchSecurityAlerts,
  fetchSecuritySessions,
  revokeOtherSessions,
  revokeSecuritySession,
  type SecurityAlert,
  type SecuritySession,
} from "../../lib/security-api";

function sessionIcon(platform?: string) {
  if (platform?.toLowerCase().includes("android") || platform?.toLowerCase().includes("ios")) {
    return Smartphone;
  }
  return Laptop;
}

export function AppSecurityPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sessions, setSessions] = useState<SecuritySession[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loadingSecurity, setLoadingSecurity] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingSecurity(true);
      try {
        const [sessionRes, alertRes] = await Promise.all([
          fetchSecuritySessions(),
          fetchSecurityAlerts(),
        ]);
        if (!cancelled) {
          setSessions(sessionRes.sessions);
          setAlerts(alertRes.alerts);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load security data.");
        }
      } finally {
        if (!cancelled) setLoadingSecurity(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

  async function handleRevokeSession(sessionId: string) {
    try {
      await revokeSecuritySession(sessionId);
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
      setMsg("Session revoked.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not revoke session.");
    }
  }

  async function handleRevokeOthers() {
    try {
      await revokeOtherSessions();
      setSessions((prev) => prev.filter((s) => s.current));
      setMsg("Other sessions revoked.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not revoke sessions.");
    }
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
              <button type="button" className="btn-ghost-navy" onClick={handleRevokeOthers}>
                Sign out others
              </button>
            </header>
            {loadingSecurity ? (
              <p className="wapp-form-card__hint">Loading sessions…</p>
            ) : sessions.length === 0 ? (
              <p className="wapp-form-card__hint">No active sessions found.</p>
            ) : (
              <ul className="wapp-sessions">
                {sessions.map((s) => {
                  const Icon = sessionIcon(s.platform);
                  return (
                    <li key={s.sessionId}>
                      <span className="wapp-sessions__icon">
                        <Icon size={17} />
                      </span>
                      <div>
                        <strong>
                          {s.deviceLabel}
                          {s.current && <em> · current</em>}
                        </strong>
                        <small>
                          {s.platform ?? "unknown"}
                          {s.ipAddress ? ` · ${s.ipAddress}` : ""}
                          {s.lastActiveAt
                            ? ` · ${new Date(s.lastActiveAt).toLocaleString()}`
                            : ""}
                        </small>
                      </div>
                      {!s.current && (
                        <button
                          type="button"
                          className="btn-ghost-navy"
                          onClick={() => handleRevokeSession(s.sessionId)}
                        >
                          Revoke
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="wapp-card">
            <header className="wapp-card__head">
              <h2>Recent alerts</h2>
            </header>
            {loadingSecurity ? (
              <p className="wapp-form-card__hint">Loading alerts…</p>
            ) : alerts.length === 0 ? (
              <p className="wapp-form-card__hint">No security alerts yet.</p>
            ) : (
              <ul className="wapp-alerts">
                {alerts.map((a) => (
                  <li key={a.id} className="wapp-alerts__row wapp-alerts__row--info">
                    <strong>{a.title}</strong>
                    <small>{a.detail ?? a.body ?? a.type}</small>
                  </li>
                ))}
              </ul>
            )}
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
