import { useEffect, useState } from "react";
import {
  createBranch,
  fetchBranches,
  formatRwf,
  linkBranch,
  type BusinessBranch,
} from "../../lib/business-api";
import { BUSINESS_TYPE_OPTIONS, type BusinessType, businessTypeLabel } from "../../lib/business-types";

export function BusinessBranchesPage() {
  const [branches, setBranches] = useState<BusinessBranch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [branchName, setBranchName] = useState("");
  const [category, setCategory] = useState<BusinessType | "">("");
  const [merchantCode, setMerchantCode] = useState("");

  async function load() {
    setBranches(await fetchBranches());
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : "Failed to load branches"));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!branchName.trim()) {
      setError("Branch name is required.");
      return;
    }
    if (!category) {
      setError("Pick a branch business type.");
      return;
    }
    setBusy(true);
    try {
      await createBranch({
        branchName: branchName.trim(),
        category,
      });
      setBranchName("");
      setCategory("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create branch");
    } finally {
      setBusy(false);
    }
  }

  async function handleLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!merchantCode.trim()) {
      setError("Enter a merchant code (e.g. MRC482).");
      return;
    }
    setBusy(true);
    try {
      await linkBranch(merchantCode.trim().toUpperCase());
      setMerchantCode("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not link merchant");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="merchant-page">
      <header className="merchant-page__head">
        <div>
          <p className="merchant-page__eyebrow">Network</p>
          <h1>Branches</h1>
          <p className="merchant-page__sub">
            Create new merchant shops under this company, or link shops you already own.
          </p>
        </div>
      </header>

      {error && <p className="auth-form__error">{error}</p>}

      <div className="merchant-grid-2">
        <section className="wapp-card wapp-form-card">
          <header className="wapp-card__head">
            <h2>Create branch</h2>
          </header>
          <form className="settings-form" onSubmit={handleCreate}>
            <label>
              <span>Branch / shop name</span>
              <input value={branchName} onChange={(e) => setBranchName(e.target.value)} required placeholder="Kigali City Market" />
            </label>
            <label>
              <span>Business type</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BusinessType)}
                required
              >
                <option value="" disabled>
                  Select type…
                </option>
                {BUSINESS_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="auth-form__submit" disabled={busy}>
              {busy ? "Creating…" : "Create merchant branch"}
            </button>
            <p className="wapp-form-card__hint">
              Creates a merchant org linked to this business. Use the merchant portal for till / inventory.
            </p>
          </form>
        </section>

        <section className="wapp-card wapp-form-card">
          <header className="wapp-card__head">
            <h2>Link existing merchant</h2>
          </header>
          <form className="settings-form" onSubmit={handleLink}>
            <label>
              <span>Merchant code</span>
              <input
                value={merchantCode}
                onChange={(e) => setMerchantCode(e.target.value.toUpperCase())}
                placeholder="MRC482"
                required
              />
            </label>
            <button type="submit" className="auth-form__submit" disabled={busy}>
              {busy ? "Linking…" : "Link to company"}
            </button>
            <p className="wapp-form-card__hint">You must be the owner of that merchant account.</p>
          </form>
        </section>
      </div>

      <section className="wapp-card">
        <header className="wapp-card__head">
          <h2>All branches</h2>
        </header>
        {!branches.length ? (
          <p className="wapp-form-card__hint">No linked shops yet.</p>
        ) : (
          <ul className="wapp-tx-list">
            {branches.map((b) => (
              <li key={b.orgId}>
                <div>
                  <strong>{b.businessName}</strong>
                  <small>
                    {b.merchantCode}
                    {b.category ? ` · ${businessTypeLabel(b.category)}` : ""} · {b.status}
                  </small>
                </div>
                <span>{formatRwf(b.totalReceivedRwf)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
