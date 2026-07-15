import { Eye, EyeOff, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RequireAuth } from "../components/RequireAuth";
import { useAuth } from "../context/AuthContext";
import {
  changePasswordRequest,
  freezeAccountRequest,
  loadSettings,
  logoutRequest,
  saveSettings,
  unfreezeAccountRequest,
  type UserSettings,
} from "../lib/auth-api";

function SettingsContent() {
  const { logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  const [freezeMsg, setFreezeMsg] = useState<string | null>(null);
  const [freezeError, setFreezeError] = useState<string | null>(null);
  const [freezeLoading, setFreezeLoading] = useState(false);

  function patchSettings(partial: Partial<UserSettings>) {
    const next = { ...settings, ...partial };
    setSettings(next);
    saveSettings(next);
    setSavedNote("Preferences saved on this device.");
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwMsg(null);

    if (newPassword.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }

    setPwLoading(true);
    try {
      await changePasswordRequest(currentPassword, newPassword);
      setPwMsg("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Could not change password.");
    } finally {
      setPwLoading(false);
    }
  }

  async function handleFreeze() {
    setFreezeError(null);
    setFreezeMsg(null);
    setFreezeLoading(true);
    try {
      const res = await freezeAccountRequest();
      setFreezeMsg(
        res.frozenUntil
          ? `Account frozen until ${new Date(res.frozenUntil).toLocaleString()}.`
          : "Account frozen.",
      );
      await refreshUser().catch(() => undefined);
    } catch (err) {
      setFreezeError(err instanceof Error ? err.message : "Could not freeze account.");
    } finally {
      setFreezeLoading(false);
    }
  }

  async function handleUnfreeze() {
    setFreezeError(null);
    setFreezeMsg(null);
    setFreezeLoading(true);
    try {
      await unfreezeAccountRequest();
      setFreezeMsg("Account unfrozen.");
      await refreshUser().catch(() => undefined);
    } catch (err) {
      setFreezeError(err instanceof Error ? err.message : "Could not unfreeze account.");
    } finally {
      setFreezeLoading(false);
    }
  }

  async function handleLogout() {
    await logoutRequest();
    logout();
    navigate("/login");
  }

  return (
    <>
      <section className="account-hero">
        <div className="container account-hero__inner">
          <p className="account-hero__brand">FastPay</p>
          <h1 className="account-hero__title">Settings</h1>
          <p className="account-hero__lede">
            Password, alerts, and account controls — kept simple on purpose.
          </p>
        </div>
      </section>

      <section className="account-main">
        <div className="container settings-grid">
          <article className="account-card">
            <h3>Preferences</h3>
            {savedNote && <p className="settings-note">{savedNote}</p>}

            <label className="settings-toggle">
              <span>
                <strong>Email alerts</strong>
                <small>Sign-ins, transfers, and security events</small>
              </span>
              <input
                type="checkbox"
                checked={settings.emailAlerts}
                onChange={(e) => patchSettings({ emailAlerts: e.target.checked })}
              />
            </label>

            <label className="settings-toggle">
              <span>
                <strong>Push alerts</strong>
                <small>Mirror notifications to your phone</small>
              </span>
              <input
                type="checkbox"
                checked={settings.pushAlerts}
                onChange={(e) => patchSettings({ pushAlerts: e.target.checked })}
              />
            </label>

            <label className="settings-toggle">
              <span>
                <strong>Marketing email</strong>
                <small>Product tips and occasional offers</small>
              </span>
              <input
                type="checkbox"
                checked={settings.marketingEmail}
                onChange={(e) => patchSettings({ marketingEmail: e.target.checked })}
              />
            </label>

            <label className="settings-toggle">
              <span>
                <strong>Hide balances</strong>
                <small>Blur amounts on shared screens</small>
              </span>
              <input
                type="checkbox"
                checked={settings.hideBalance}
                onChange={(e) => patchSettings({ hideBalance: e.target.checked })}
              />
            </label>

            <div className="settings-selects">
              <label>
                <span>Currency</span>
                <select
                  value={settings.currency}
                  onChange={(e) =>
                    patchSettings({ currency: e.target.value as UserSettings["currency"] })
                  }
                >
                  <option value="RWF">RWF</option>
                  <option value="KES">KES</option>
                  <option value="USD">USD</option>
                </select>
              </label>
              <label>
                <span>Language</span>
                <select
                  value={settings.language}
                  onChange={(e) =>
                    patchSettings({ language: e.target.value as UserSettings["language"] })
                  }
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="rw">Kinyarwanda</option>
                </select>
              </label>
            </div>
          </article>

          <article className="account-card">
            <h3>Change password</h3>
            <form className="settings-form" onSubmit={handlePassword}>
              {pwError && <p className="auth-form__error">{pwError}</p>}
              {pwMsg && <p className="settings-note">{pwMsg}</p>}

              <label>
                <span>Current password</span>
                <div className="auth-form__password">
                  <input
                    type={showPw ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="auth-form__toggle"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label="Toggle password"
                  >
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <label>
                <span>New password</span>
                <input
                  type={showPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </label>

              <label>
                <span>Confirm new password</span>
                <input
                  type={showPw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </label>

              <button type="submit" className="auth-form__submit" disabled={pwLoading}>
                {pwLoading ? "Updating…" : "Update password"}
              </button>
            </form>
          </article>

          <article className="account-card account-card--danger">
            <h3>
              <ShieldAlert size={18} />
              Account freeze
            </h3>
            <p className="account-card__muted">
              Instantly block transfers if you suspect unauthorized access. You can unfreeze
              anytime from here.
            </p>
            {freezeError && <p className="auth-form__error">{freezeError}</p>}
            {freezeMsg && <p className="settings-note">{freezeMsg}</p>}
            <div className="settings-actions">
              <button
                type="button"
                className="btn-danger"
                disabled={freezeLoading}
                onClick={handleFreeze}
              >
                Freeze account
              </button>
              <button
                type="button"
                className="btn-ghost-navy"
                disabled={freezeLoading}
                onClick={handleUnfreeze}
              >
                Unfreeze
              </button>
            </div>
          </article>

          <article className="account-card">
            <h3>Session</h3>
            <p className="account-card__muted">
              Sign out of this browser. Your mobile sessions stay active until revoked in the app.
            </p>
            <button type="button" className="auth-form__submit" onClick={handleLogout}>
              Log out
            </button>
          </article>
        </div>
      </section>
    </>
  );
}

export function SettingsPage() {
  return (
    <RequireAuth>
      <SettingsContent />
    </RequireAuth>
  );
}
