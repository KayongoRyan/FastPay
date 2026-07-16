import { Check, Plus, Users } from "lucide-react";
import { useState } from "react";
import { formatRwf } from "../../lib/wallet-data";

type Member = {
  id: string;
  name: string;
  role: "Owner" | "Adult" | "Teen";
  spent: number;
  limit: number;
};

const initialMembers: Member[] = [
  { id: "m1", name: "You", role: "Owner", spent: 186400, limit: 500000 },
  { id: "m2", name: "Aline K.", role: "Adult", spent: 92400, limit: 250000 },
  { id: "m3", name: "Eric M.", role: "Teen", spent: 18500, limit: 50000 },
];

const planPerks = [
  "Shared wallet with per-member spend limits",
  "Approve teen transfers over RWF 20,000",
  "One bill inbox for utilities & school fees",
  "Family savings goal visible to everyone",
];

export function AppFamilyPlanPage() {
  const [members, setMembers] = useState(initialMembers);
  const [invite, setInvite] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const pool = 750000;
  const used = members.reduce((s, m) => s + m.spent, 0);

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    const name = invite.trim();
    if (!name) return;
    setMembers((prev) => [
      ...prev,
      {
        id: `m${Date.now()}`,
        name,
        role: "Adult",
        spent: 0,
        limit: 100000,
      },
    ]);
    setInvite("");
    setMsg(`${name} invited — they'll see the family wallet once they accept.`);
  }

  return (
    <div className="wapp-page">
      <section className="wapp-card">
        <header className="wapp-card__head">
          <h2>
            <Users size={18} /> Family Plan
          </h2>
        </header>
        <p className="wapp-form-card__hint">
          One pool for the household. Set limits, approve big spends, keep everyone covered.
        </p>

        <div className="wapp-family-hero">
          <div>
            <span>Family pool used</span>
            <strong>
              {formatRwf(used)} <em>/ {formatRwf(pool)}</em>
            </strong>
          </div>
          <div className="wapp-goal-bar" aria-hidden>
            <span style={{ width: `${Math.min(100, (used / pool) * 100)}%` }} />
          </div>
        </div>

        <ul className="wapp-perk-list">
          {planPerks.map((p) => (
            <li key={p}>
              <Check size={15} strokeWidth={2.4} />
              {p}
            </li>
          ))}
        </ul>
      </section>

      <div className="wapp-grid-2">
        <section className="wapp-card">
          <header className="wapp-card__head">
            <h2>Members</h2>
          </header>
          <ul className="wapp-member-list">
            {members.map((m) => (
              <li key={m.id}>
                <div>
                  <strong>{m.name}</strong>
                  <small>
                    {m.role} · limit {formatRwf(m.limit)}
                  </small>
                </div>
                <span>
                  {formatRwf(m.spent)}
                  <em>spent</em>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="wapp-card wapp-form-card">
          <header className="wapp-card__head">
            <h2>
              <Plus size={18} /> Invite member
            </h2>
          </header>
          {msg && <p className="settings-note">{msg}</p>}
          <form className="settings-form" onSubmit={handleInvite}>
            <label>
              <span>Name or phone</span>
              <input
                value={invite}
                onChange={(e) => setInvite(e.target.value)}
                placeholder="e.g. +250 788 000 111"
              />
            </label>
            <button type="submit" className="auth-form__submit">
              Send invite
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
