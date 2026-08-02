import { useEffect, useState } from "react";
import {
  fetchBusinessOrg,
  updateBusinessOrg,
  type BusinessOrg,
} from "../../lib/business-api";

export function BusinessSettingsPage() {
  const [org, setOrg] = useState<BusinessOrg | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchBusinessOrg()
      .then((o) => {
        if (!o) return;
        setOrg(o);
        setCompanyName(o.companyName ?? "");
        setIndustry(o.industry ?? "");
        setCompanyEmail(o.companyEmail ?? "");
        setCompanyPhone(o.companyPhone ?? "");
        setAddress(o.address ?? "");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setBusy(true);
    try {
      const updated = await updateBusinessOrg({
        companyName: companyName.trim(),
        industry: industry.trim() || undefined,
        companyEmail: companyEmail.trim() || undefined,
        companyPhone: companyPhone.trim() || undefined,
        address: address.trim() || undefined,
      });
      setOrg(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="merchant-page">
      <header className="merchant-page__head">
        <div>
          <p className="merchant-page__eyebrow">Company</p>
          <h1>Settings</h1>
          <p className="merchant-page__sub">
            Business code <strong>{org?.businessCode ?? "—"}</strong>
          </p>
        </div>
      </header>

      <section className="wapp-card wapp-form-card">
        <header className="wapp-card__head">
          <h2>Profile</h2>
        </header>
        <form className="settings-form" onSubmit={handleSave}>
          {error && <p className="auth-form__error">{error}</p>}
          {saved && <p className="settings-note">Saved.</p>}
          <label>
            <span>Company name</span>
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
          </label>
          <label>
            <span>Industry</span>
            <input value={industry} onChange={(e) => setIndustry(e.target.value)} />
          </label>
          <label>
            <span>Email</span>
            <input type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
          </label>
          <label>
            <span>Phone</span>
            <input value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} />
          </label>
          <label>
            <span>Address</span>
            <input value={address} onChange={(e) => setAddress(e.target.value)} />
          </label>
          <button type="submit" className="auth-form__submit" disabled={busy}>
            {busy ? "Saving…" : "Save changes"}
          </button>
        </form>
      </section>
    </div>
  );
}
