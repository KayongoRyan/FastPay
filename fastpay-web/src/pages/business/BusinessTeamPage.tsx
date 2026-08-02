import { useEffect, useState } from "react";
import {
  addBusinessMember,
  fetchBusinessMembers,
  type BusinessMember,
} from "../../lib/business-api";

export function BusinessTeamPage() {
  const [members, setMembers] = useState<BusinessMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<BusinessMember["role"]>("viewer");

  async function load() {
    setMembers(await fetchBusinessMembers());
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : "Failed to load team"));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim()) {
      setError("Name is required.");
      return;
    }
    setBusy(true);
    try {
      await addBusinessMember({
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        role,
      });
      setFullName("");
      setEmail("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add member");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="merchant-page">
      <header className="merchant-page__head">
        <div>
          <p className="merchant-page__eyebrow">HQ access</p>
          <h1>Team</h1>
          <p className="merchant-page__sub">
            Invite admins, finance, and viewers to the company portal (roster for now — login invites later).
          </p>
        </div>
      </header>

      {error && <p className="auth-form__error">{error}</p>}

      <div className="merchant-grid-2">
        <section className="wapp-card wapp-form-card">
          <header className="wapp-card__head">
            <h2>Add member</h2>
          </header>
          <form className="settings-form" onSubmit={handleAdd}>
            <label>
              <span>Full name</span>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </label>
            <label>
              <span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>
              <span>Role</span>
              <select value={role} onChange={(e) => setRole(e.target.value as BusinessMember["role"])}>
                <option value="admin">Admin</option>
                <option value="finance">Finance</option>
                <option value="viewer">Viewer</option>
              </select>
            </label>
            <button type="submit" className="auth-form__submit" disabled={busy}>
              {busy ? "Saving…" : "Add to roster"}
            </button>
          </form>
        </section>

        <section className="wapp-card">
          <header className="wapp-card__head">
            <h2>Roster</h2>
          </header>
          {!members.length ? (
            <p className="wapp-form-card__hint">No members yet.</p>
          ) : (
            <ul className="wapp-tx-list">
              {members.map((m) => (
                <li key={m.id}>
                  <div>
                    <strong>{m.fullName}</strong>
                    <small>
                      {m.role} · {m.status}
                      {m.email ? ` · ${m.email}` : ""}
                    </small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
