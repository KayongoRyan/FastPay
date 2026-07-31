import { Check, Plus, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  createFamily,
  getFamilyDashboard,
  inviteFamilyMember,
  listFamilies,
  listFamilyApprovals,
  listFamilyGoals,
  listPendingInvites,
  resolveFamilyApproval,
  roleLabel,
  type ApprovalRequest,
  type FamilyDashboard,
  type PendingInvite,
  type SavingsGoal,
} from "../../lib/family-api";
import { formatRwf } from "../../lib/wallet-data";

const planPerks = [
  "Shared wallet with per-member spend limits",
  "Approve teen transfers over RWF 20,000",
  "One bill inbox for utilities & school fees",
  "Family savings goal visible to everyone",
];

export function AppFamilyPlanPage() {
  const [dashboard, setDashboard] = useState<FamilyDashboard | null>(null);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [familyName, setFamilyName] = useState("");
  const [invite, setInvite] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const loadFamily = useCallback(async (familyId: string) => {
    const [dash, goalRows, approvalRows] = await Promise.all([
      getFamilyDashboard(familyId),
      listFamilyGoals(familyId),
      listFamilyApprovals(familyId, "pending"),
    ]);
    setDashboard(dash);
    setGoals(goalRows);
    setApprovals(approvalRows);
  }, []);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [families, invites] = await Promise.all([
        listFamilies(),
        listPendingInvites(),
      ]);
      setPendingInvites(invites);
      if (families.length) {
        await loadFamily(families[0].id);
      } else {
        setDashboard(null);
        setGoals([]);
        setApprovals([]);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load family plan");
    } finally {
      setLoading(false);
    }
  }, [loadFamily]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  async function handleCreateFamily(e: React.FormEvent) {
    e.preventDefault();
    const name = familyName.trim();
    if (!name) return;
    setBusy(true);
    setErr(null);
    try {
      const dash = await createFamily(name);
      setDashboard(dash);
      setFamilyName("");
      setMsg("Family plan created.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not create family");
    } finally {
      setBusy(false);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!dashboard) return;
    const identifier = invite.trim();
    if (!identifier) return;
    setBusy(true);
    setErr(null);
    try {
      const result = await inviteFamilyMember(dashboard.id, identifier);
      setInvite("");
      setMsg(`${result.inviteeName} invited — they'll see the family wallet once they accept.`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Invite failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleResolve(requestId: string, status: "approved" | "rejected") {
    if (!dashboard) return;
    setBusy(true);
    setErr(null);
    try {
      await resolveFamilyApproval(dashboard.id, requestId, status);
      await loadFamily(dashboard.id);
      setMsg(status === "approved" ? "Transfer approved." : "Request declined.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="wapp-page">
        <p className="wapp-form-card__hint">Loading family plan…</p>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="wapp-page">
        <section className="wapp-card wapp-form-card">
          <header className="wapp-card__head">
            <h2>
              <Users size={18} /> Start a Family Plan
            </h2>
          </header>
          <p className="wapp-form-card__hint">
            Create a household wallet with shared limits and parent approvals.
          </p>
          {pendingInvites.length > 0 && (
            <p className="settings-note">
              You have {pendingInvites.length} pending invite(s). Accept them from the mobile app or
              ask the inviter to resend after you join.
            </p>
          )}
          {err && <p className="settings-note settings-note--error">{err}</p>}
          <form className="settings-form" onSubmit={handleCreateFamily}>
            <label>
              <span>Family name</span>
              <input
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="e.g. Kayonzi Household"
              />
            </label>
            <button type="submit" className="auth-form__submit" disabled={busy}>
              Create family plan
            </button>
          </form>
        </section>
      </div>
    );
  }

  const pool = dashboard.poolLimit;
  const used = dashboard.poolUsed;

  return (
    <div className="wapp-page">
      <section className="wapp-card">
        <header className="wapp-card__head">
          <h2>
            <Users size={18} /> {dashboard.name}
          </h2>
        </header>
        <p className="wapp-form-card__hint">
          One pool for the household. Set limits, approve big spends, keep everyone covered.
        </p>

        {err && <p className="settings-note settings-note--error">{err}</p>}
        {msg && <p className="settings-note">{msg}</p>}

        <div className="wapp-family-hero">
          <div>
            <span>Family pool used</span>
            <strong>
              {formatRwf(used)} <em>/ {formatRwf(pool)}</em>
            </strong>
          </div>
          <div className="wapp-goal-bar" aria-hidden>
            <span style={{ width: `${pool ? Math.min(100, (used / pool) * 100) : 0}%` }} />
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
            {dashboard.members.map((m) => (
              <li key={m.id}>
                <div>
                  <strong>{m.name}</strong>
                  <small>
                    {roleLabel(m.role)} · limit {formatRwf(m.spendingLimitMonthly)}
                  </small>
                </div>
                <span>
                  {formatRwf(m.spentMonth)}
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
          <form className="settings-form" onSubmit={handleInvite}>
            <label>
              <span>Email or phone</span>
              <input
                value={invite}
                onChange={(e) => setInvite(e.target.value)}
                placeholder="e.g. +250788000111 or email@example.com"
                disabled={busy || dashboard.myRole !== "parent"}
              />
            </label>
            {dashboard.myRole !== "parent" && (
              <p className="wapp-form-card__hint">Only the family owner can send invites.</p>
            )}
            <button
              type="submit"
              className="auth-form__submit"
              disabled={busy || dashboard.myRole !== "parent"}
            >
              Send invite
            </button>
          </form>
        </section>
      </div>

      {dashboard.myRole === "parent" && approvals.length > 0 && (
        <section className="wapp-card">
          <header className="wapp-card__head">
            <h2>Pending approvals ({approvals.length})</h2>
          </header>
          <ul className="wapp-member-list">
            {approvals.map((a) => (
              <li key={a.id}>
                <div>
                  <strong>{formatRwf(a.transactionData.amountRwf ?? 0)}</strong>
                  <small>
                    {a.requesterName ?? "Member"} → {a.transactionData.destination}
                    {a.transactionData.description ? ` · ${a.transactionData.description}` : ""}
                  </small>
                </div>
                <span className="wapp-inline-actions">
                  <button
                    type="button"
                    className="auth-form__submit auth-form__submit--sm"
                    disabled={busy}
                    onClick={() => void handleResolve(a.id, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="wapp-btn-ghost"
                    disabled={busy}
                    onClick={() => void handleResolve(a.id, "rejected")}
                  >
                    Decline
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {goals.length > 0 && (
        <section className="wapp-card">
          <header className="wapp-card__head">
            <h2>Family savings goals</h2>
          </header>
          <ul className="wapp-member-list">
            {goals.map((g) => (
              <li key={g.id}>
                <div>
                  <strong>{g.name}</strong>
                  <small>
                    {formatRwf(g.currentAmount)} / {formatRwf(g.targetAmount)} · {g.progressPct}%
                  </small>
                </div>
                <div className="wapp-goal-bar" aria-hidden>
                  <span style={{ width: `${g.progressPct}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
